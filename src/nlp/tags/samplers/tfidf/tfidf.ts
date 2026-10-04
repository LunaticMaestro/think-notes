import type {
  KeywordCandidate,
  ProcessedDocument,
} from "@/types/nlp";

import { getCorpusStats } from "./corpusStore";

export async function tfidfSampler(
  document: ProcessedDocument,
): Promise<KeywordCandidate[]> {
  const tokens = document.tokens;

  if (tokens.length === 0) {
    return [];
  }

  const corpus = await getCorpusStats();

  const termFrequency = new Map<string, number>();

  for (const token of tokens) {
    if (!token) continue;

    termFrequency.set(
      token,
      (termFrequency.get(token) ?? 0) + 1,
    );
  }

  const totalTerms = tokens.length;

  // First calculate the raw TF-IDF scores.
  const scored = Array.from(termFrequency.entries()).map(
    ([keyword, frequency]) => {
      const tf = frequency / totalTerms;

      const documentFrequency =
        corpus.documentFrequency[keyword] ?? 0;

      const idf =
        Math.log(
          (corpus.documentCount + 1) /
            (documentFrequency + 1),
        ) + 1;

      const score = tf * idf;

      return {
        keyword,
        score,
      };
    },
  );

  if (scored.length === 0) {
    return [];
  }

  // Normalize relative to the strongest TF-IDF candidate.
  const maxScore = Math.max(
    ...scored.map((candidate) => candidate.score),
  );

  if (maxScore <= 0) {
    return scored.map(
      ({ keyword }): KeywordCandidate => ({
        keyword,
        sources: [
          {
            sampler: "tfidf",
            score: 0,
          },
        ],
      }),
    );
  }

  return scored
    .map(
      ({ keyword, score }): KeywordCandidate => ({
        keyword,
        sources: [
          {
            sampler: "tfidf",
            score: score / maxScore,
          },
        ],
      }),
    )
    .sort(
      (a, b) =>
        b.sources[0].score -
        a.sources[0].score,
    );
}
