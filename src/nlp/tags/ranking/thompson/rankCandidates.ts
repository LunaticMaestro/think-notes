import {
  ThompsonBandit,
} from "@cognitive-engine/bandit";

import type {
  KeywordCandidate,
  RankedKeyword,
} from "@/types/nlp";

import { IndexedDbThompsonStorage } from "./storage";

const storage = new IndexedDbThompsonStorage();

const bandit = new ThompsonBandit(storage, {
  explorationRate: 0,
});

export async function rankCandidates(
  candidates: KeywordCandidate[],
): Promise<RankedKeyword[]> {
  if (candidates.length === 0) {
    return [];
  }

  const ranked: RankedKeyword[] = [];

  for (const candidate of candidates) {
    const context = getContext(candidate);

    const choice = await bandit.select(
      context,
      [candidate.keyword],
    );

    const baseScore = getBaseScore(candidate);

    ranked.push({
      candidate,
      baseScore,
      thompsonScore: choice.expectedReward,
      finalScore: choice.expectedReward,
    });
  }

  ranked.sort(
    (a, b) =>
      b.finalScore - a.finalScore,
  );

  return ranked;
}

/**
 * Convert sampler evidence into the contextual
 * feature vector used by Thompson Sampling.
 *
 * Order is important and must remain consistent:
 *
 * [unigram, bigram, trigram, tfidf, keybert]
 */
function getContext(
  candidate: KeywordCandidate,
): number[] {
  const scores = {
    unigram: 0,
    bigram: 0,
    trigram: 0,
    tfidf: 0,
    keybert: 0,
  };

  for (const source of candidate.sources) {
    scores[source.sampler] = source.score;
  }

  return [
    scores.unigram,
    scores.bigram,
    scores.trigram,
    scores.tfidf,
    scores.keybert,
  ];
}

/**
 * Base sampler score.
 *
 * This is kept separately from the Thompson score
 * so we can inspect the original sampler evidence.
 */
function getBaseScore(
  candidate: KeywordCandidate,
): number {
  if (candidate.sources.length === 0) {
    return 0;
  }

  return Math.max(
    ...candidate.sources.map(
      (source) => source.score,
    ),
  );
}
