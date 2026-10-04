import type { KeywordCandidate, RankedKeyword } from "@/types/nlp";

export function buildFinalPool(
  rankedCandidates: RankedKeyword[],
  size = 10,
): KeywordCandidate[] {
  if (size <= 0 || rankedCandidates.length === 0) {
    return [];
  }

  return rankedCandidates
    .slice(0, size)
    .map((ranked) => ranked.candidate);
}