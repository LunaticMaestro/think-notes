import type {
  AvailableSampler,
  SamplerFunction,
} from "./types";

import {
  sampleDatetime,
  sampleURL,
  sampleMoney,
  sampleHastag,
} from "./winknlp";

import type {
  SamplerId,
} from "@/types/nlp";

/**
 * Number of sampler arms we want available before
 * allowing the remaining samplers to be cancelled.
 *
 * This is intentionally hardcoded here for now.
 */
const K = 5;

/**
 * How long we are willing to wait for the next
 * sampler before cancelling the remaining samplers
 * once K samplers have already completed.
 */
const TIMEOUT_MS = 2000;

/**
 * Available sampler arms.
 *
 * Each entry is a separate Thompson arm.
 */
const SAMPLERS: Array<{
  id: SamplerId;
  run: SamplerFunction;
}> = [
  {
    id: "wink-datetime",
    run: sampleDatetime,
  },
  {
    id: "wink-url",
    run: sampleURL,
  },
  {
    id: "wink-money",
    run: sampleMoney,
  },
  {
    id: "wink-hashtag",
    run: sampleHastag
  }

  // TODO:
  // {
  //   id: "unigram",
  //   run: unigramSampler,
  // },
  //
  // {
  //   id: "bigram",
  //   run: bigramSampler,
  // },
  //
  // {
  //   id: "trigram",
  //   run: trigramSampler,
  // },
  //
  // {
  //   id: "tfidf",
  //   run: tfidfSampler,
  // },
];

export async function runAvailableSamplers(
  text: string,
): Promise<AvailableSampler[]> {
  if (SAMPLERS.length === 0) {
    return [];
  }

  /*
   * Infinity means:
   *
   * "Wait for every sampler."
   */
  if (K === Infinity) {
    const results = await Promise.allSettled(
      SAMPLERS.map((sampler) =>
        runSampler(sampler, text),
      ),
    );

    return results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<AvailableSampler> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
  }

  /*
   * If K is greater than or equal to the number
   * of available samplers, there is no reason to
   * cancel anything.
   */
  if (K >= SAMPLERS.length) {
    const results = await Promise.allSettled(
      SAMPLERS.map((sampler) =>
        runSampler(sampler, text),
      ),
    );

    return results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<AvailableSampler> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
  }

  const controllers = new Map<
    SamplerId,
    AbortController
  >();

  const completed: AvailableSampler[] = [];

  let resolveFinished:
    | (() => void)
    | undefined;

  const finished = new Promise<void>(
    (resolve) => {
      resolveFinished = resolve;
    },
  );

  /*
   * Start every sampler immediately.
   */
  for (const sampler of SAMPLERS) {
    const controller = new AbortController();

    controllers.set(
      sampler.id,
      controller,
    );

    runSampler(
      sampler,
      text,
      controller.signal,
    )
      .then((result) => {
        completed.push(result);

        /*
         * As soon as K samplers have completed,
         * we have enough arms.
         */
        if (completed.length >= K) {
          resolveFinished?.();
        }
      })
      .catch(() => {
        /*
         * Failed samplers simply don't become
         * available Thompson arms.
         */
      });
  }

  /*
   * Wait until either:
   *
   * 1. K samplers complete
   * 2. timeout expires
   *
   * If K samplers finish, we cancel all remaining
   * samplers immediately.
   */
  await Promise.race([
    finished,
    delay(TIMEOUT_MS),
  ]);

  /*
   * We already have enough sampler arms.
   * Cancel anything still running.
   */
  if (completed.length >= K) {
    for (const controller of controllers.values()) {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }
  }

  /*
   * If timeout happened before K samplers completed,
   * we return whatever successfully completed.
   */
  return completed;
}

async function runSampler(
  sampler: {
    id: SamplerId;
    run: SamplerFunction;
  },
  text: string,
  signal?: AbortSignal,
): Promise<AvailableSampler> {
  const keywords = await sampler.run(
    text,
    signal ?? new AbortController().signal,
  );

  return {
    id: sampler.id,
    keywords,
  };
}

function delay(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}