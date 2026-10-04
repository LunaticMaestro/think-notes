import type {
  KeywordCandidate,
  ProcessedDocument,
} from "@/types/nlp";

export function unigramSampler(
  document: ProcessedDocument,
): KeywordCandidate[] {
  const frequencies = new Map<string, number>();

  for (const token of document.tokens) {
    if (!token) continue;

    frequencies.set(
      token,
      (frequencies.get(token) ?? 0) + 1,
    );
  }

  if (frequencies.size === 0) {
    return [];
  }

  const maxFrequency = Math.max(
    ...frequencies.values(),
  );

  return Array.from(frequencies.entries())
    .sort(([, a], [, b]) => b - a)
    .map(
      ([keyword, frequency]): KeywordCandidate => ({
        keyword,
        sources: [
          {
            sampler: "unigram",
            score: frequency / maxFrequency,
          },
        ],
      }),
    );
}
