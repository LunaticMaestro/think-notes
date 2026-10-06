import type {
  AvailableSampler,
  SamplerFunction,
} from "@/nlp/tags/samplers/types";

import type {
  SamplerId
} from "@/types/nlp"

import {
  isReady as isWinkReady,
  sampleDatetime,
  sampleURL,
  sampleMoney,
  sampleHastag,
} from "./winknlp";

const TIMEOUT_MS = 5_000;
const READY_POLL_MS = 50;

const SAMPLERS: Array<{
  id: SamplerId;
  run: SamplerFunction;
  isReady: () => boolean;
}> = [
  {
    id: "wink-datetime",
    run: sampleDatetime,
    isReady: isWinkReady,
  },
  {
    id: "wink-url",
    run: sampleURL,
    isReady: isWinkReady,
  },
  {
    id: "wink-money",
    run: sampleMoney,
    isReady: isWinkReady,
  },
  {
    id: "wink-hashtag",
    run: sampleHastag,
    isReady: isWinkReady,
  },
];

function delay(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function runSampler(
  sampler: {
    id: SamplerId;
    run: SamplerFunction;
    isReady: () => boolean;
  },
  text: string,
  signal: AbortSignal,
): Promise<AvailableSampler> {
  const keywords = await sampler.run(
    text,
    signal,
  );

  return {
    id: sampler.id,
    keywords,
  };
}

export async function runAvailableSamplers(
  text: string,
  k: number,
): Promise<AvailableSampler[]> {
  if (k <= 0) {
    return [];
  }

  const controllers = new Map<
    SamplerId,
    AbortController
  >();

  const startedSamplers =
    new Set<SamplerId>();

  const completedSamplers =
    new Set<SamplerId>();

  const availableSamplers =
    new Map<
      SamplerId,
      AvailableSampler
    >();

  let resolveFinished:
    | (() => void)
    | undefined;

  const finished =
    new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });

  const tryStartReadySamplers =
    () => {
      for (const sampler of SAMPLERS) {
        if (
          startedSamplers.has(
            sampler.id,
          )
        ) {
          continue;
        }

        let ready = false;

        try {
          ready = sampler.isReady();
        } catch {
          ready = false;
        }

        if (!ready) {
          continue;
        }

        startedSamplers.add(
          sampler.id,
        );

        const controller =
          new AbortController();

        controllers.set(
          sampler.id,
          controller,
        );

        void runSampler(
          sampler,
          text,
          controller.signal,
        )
          .then((result) => {
            completedSamplers.add(
              sampler.id,
            );

            /*
             * An empty sampler is not an
             * available candidate.
             *
             * It therefore does not count
             * toward K.
             */
            if (
              result.keywords.length === 0
            ) {
              return;
            }

            availableSamplers.set(
              sampler.id,
              result,
            );

            /*
             * Only usable samplers count
             * toward K.
             */
            if (
              availableSamplers.size >= k
            ) {
              resolveFinished?.();
            }
          })
          .catch((error) => {
            completedSamplers.add(
              sampler.id,
            );

            /*
             * AbortError is expected when
             * the request has already
             * reached K.
             */
            if (
              error instanceof DOMException &&
              error.name === "AbortError"
            ) {
              return;
            }

            console.error(
              `Sampler "${sampler.id}" failed:`,
              error,
            );
          });
      }
    };

  const startedAt = Date.now();

  /*
   * Start everything that is already
   * initialized.
   */
  tryStartReadySamplers();

  /*
   * Continue polling readiness so a
   * sampler whose model finishes loading
   * during this request can participate.
   */
  while (
    availableSamplers.size < k
  ) {
    /*
     * Start any samplers that became
     * ready since the previous check.
     */
    tryStartReadySamplers();

    /*
     * If every sampler has been started
     * and every started sampler has
     * completed, there is nothing left
     * that can produce another result.
     */
    const allSamplersStarted =
      startedSamplers.size ===
      SAMPLERS.length;

    const allStartedSamplersCompleted =
      completedSamplers.size ===
      startedSamplers.size;

    if (
      allSamplersStarted &&
      allStartedSamplersCompleted
    ) {
      break;
    }

    const elapsed =
      Date.now() - startedAt;

    if (
      elapsed >= TIMEOUT_MS
    ) {
      break;
    }

    const remaining =
      TIMEOUT_MS - elapsed;

    await Promise.race([
      finished,
      delay(
        Math.min(
          READY_POLL_MS,
          remaining,
        ),
      ),
    ]);
  }

  /*
   * Once enough usable samplers have
   * produced results, cancel samplers
   * that are still running.
   */
  if (
    availableSamplers.size >= k
  ) {
    for (
      const controller of
        controllers.values()
    ) {
      if (
        !controller.signal.aborted
      ) {
        controller.abort();
      }
    }
  }

  /*
   * Preserve registry order rather
   * than completion order.
   */
  return SAMPLERS
    .map((sampler) =>
      availableSamplers.get(
        sampler.id,
      ),
    )
    .filter(
      (
        sampler,
      ): sampler is AvailableSampler =>
        sampler !== undefined,
    );
}

