import {
  runAvailableSamplers,
} from "./samplers/runAvailableSamplers";

import type { AvailableSampler } from "./samplers/types";
import type { DecisionPolicy } from "./decision/policy/DecisionPolicy";
import { v4 as uuidv4 } from "uuid";
import type { Keyword } from "@/types/nlp";

const K = 3;

export async function tagFinder(
  text: string,
  decisionPolicy: DecisionPolicy,
): Promise<Keyword[]> {
  const samplers =
    await runAvailableSamplers(text, 5);

  console.log("SAmplers: ", samplers)
  const candidates =
    samplers.filter(
      (sampler) =>
        sampler.keywords.length > 0,
    );
    
  console.log("Candy", candidates)

  const selection = await selectKeywords(
    candidates, 
    decisionPolicy,
    K
  )
  console.log("Sel: ", selection)

  return selection
}

async function selectKeywords(
  samplers: AvailableSampler[],
  decisionPolicy: DecisionPolicy,
  k: number,
): Promise<Keyword[]> {
  const selected: Keyword[] = [];

  /**
   * Temporary keyword pools.
   *
   * These are mutated during this selection only.
   * The original sampler results are not modified.
   */
  const pool = samplers.map(
    (sampler) => ({
      samplerId: sampler.id,
      keywords: [...sampler.keywords],
    }),
  );

  while (
    selected.length < k &&
    pool.length > 0
  ) {
    const availableSamplerIds =
      pool.map(
        (sampler) =>
          sampler.samplerId,
      );

    const samplerId =
      await decisionPolicy.selectCandidate(
        availableSamplerIds,
      );

    const sampler =
      pool.find(
        (candidate) =>
          candidate.samplerId ===
          samplerId,
      );

    if (!sampler) {
      throw new Error(
        `Decision Policy selected unavailable sampler: ${samplerId}`,
      );
    }

    /**
     * Pick one keyword from the selected
     * sampler without replacement.
     */
    const keywordIndex =
      Math.floor(
        Math.random() *
          sampler.keywords.length,
      );

    const [keyword] =
      sampler.keywords.splice(
        keywordIndex,
        1,
      );

    if (!keyword) {
      throw new Error(
        `Selected sampler "${samplerId}" has no keywords.`,
      );
    }

    selected.push({
      id: uuidv4(),
      name: keyword.keyword,
      type: keyword.type,
      sampler: samplerId,
    });

    /**
     * The sampler stays in the pool while it
     * still has keywords.
     *
     * Once exhausted, remove it.
     */
    if (
      sampler.keywords.length === 0
    ) {
      const index = pool.indexOf(
        sampler,
      );

      pool.splice(index, 1);
    }
  }

  return selected;
}