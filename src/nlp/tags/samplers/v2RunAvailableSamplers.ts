import type {
  AvailableSampler,
  SamplerFunction,
} from "@/nlp/tags/samplers/types";

import type { SamplerId } from "@/types/nlp";

import {
  isReady as isWinkReady,
  sampleDatetime,
  sampleURL,
  sampleMoney,
  sampleHastag,
} from "./winknlp";

import { nerObj, locationSampler, personSampler } from "./huggingface/v2ner";

type Sampler = {
  id: SamplerId;
  run: SamplerFunction;
  isReady: () => boolean;
};

const SAMPLERS: Sampler[] = [
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
  {
    id: "hf-ner-LOC",
    run: (text) => locationSampler.predict(text),
    isReady: nerObj.isReady,
  },
  {
    id: "hf-ner-PER",
    run: (text) => personSampler.predict(text),
    isReady: nerObj.isReady,
  },
];

/**
 * Step 1: Identify samplers that are ready.
 */
function getAvailableSamplers(): Sampler[] {
  return SAMPLERS.filter((sampler) => sampler.isReady());
}

export function countAvailableSamplers(): { available: number; total: number } {
  const nAvailableSamplers = SAMPLERS
    .filter((sampler) => sampler.isReady())
    .length
  
  return { 
    available: nAvailableSamplers,
    total: SAMPLERS.length
  }
}

/**
 * Step 2: Run all available samplers concurrently.
 */
async function runSamplers(
  samplers: Sampler[],
  text: string,
): Promise<AvailableSampler[]> {
  return Promise.all(
    samplers.map(async (sampler) => ({
      id: sampler.id,
      keywords: await sampler.run(text),
    })),
  );
}

/**
 * Step 3: Return the results.
 */
export async function runAvailableSamplers(
  text: string,
  k: number,
): Promise<AvailableSampler[]> {
  // Future configuration:
  // const timeoutMs = TIMEOUT_MS;
  // const limit = k;

  void k; // Temporarily unused.

  const availableSamplers = getAvailableSamplers();

  const results = await runSamplers(availableSamplers, text);

  return results;
}
