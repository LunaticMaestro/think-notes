import { tagFinder } from "./pipeline";
import { initializeSamplers } from "./samplers/initializeSamplers";
import { DecisionPolicy } from "./decision/policy/DecisionPolicy";
import type { Scorer } from "./decision/policy/types";


const DECISION_POLICY_SCORERS: Record<
  string,
  Scorer
> = {
  "business-weight": {
    scorerId: "business-weight",
    defaultWeight: 1,
    weights: {
      "wink-money": 2,
      "wink-url": 2,
    },
  },

  // exploration: {
  //   scorerId: "exploration",
  //   defaultWeight: 1,
  //   weights: {
  //     "wink-datetime": 2,
  //   },
  // },
};

const decisionPolicy = new DecisionPolicy();

let initialized = false;
let initializationPromise:
  | Promise<void>
  | undefined;

async function initialize(): Promise<void> {
  if (initialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise =
  (async () => {
    await decisionPolicy.init(
      DECISION_POLICY_SCORERS,
    );

    initializeSamplers();

    initialized = true;
  })();

  try {
    await initializationPromise;
  } catch (error) {
    initialized = false;
    throw error;
  } finally {
    initializationPromise = undefined;
  }
}

self.onmessage = async (event) => {
  try {
    const { type } = event.data;

    if (type === "init") {
      await initialize();

      self.postMessage({
        type: "ready",
      });

      return;
    }

    if (!initialized) {
      throw new Error(
        "NLP worker has not been initialized.",
      );
    }

    if (type === "find") {
      const {
        text,
        requestId,
      } = event.data;

      const result = await tagFinder(
        text,
        decisionPolicy,
      );

      self.postMessage({
        type: "complete",
        requestId,
        keywords: result,
      });

      return;
    }

    if (type === "update-reward") {
      const {
        samplerId,
        dislike,
      } = event.data;

      await decisionPolicy.updateBeta(
        samplerId,
        dislike,
      );

      return;
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId: event.data.requestId,
      error:
        error instanceof Error
          ? error.message
          : "Unknown NLP error",
    });
  }
};