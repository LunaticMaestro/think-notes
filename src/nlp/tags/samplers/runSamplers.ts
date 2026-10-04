import type {
  KeywordCandidate,
  ProcessedDocument,
} from "@/types/nlp";

import { unigramSampler } from "./unigram";
import { tfidfSampler } from "./tfidf";

export async function runSamplers(
  document: ProcessedDocument,
): Promise<KeywordCandidate[]> {
  const unigramCandidates = unigramSampler(document);
  const tfidfCandidates = await tfidfSampler(document);

  const candidateMap = new Map<string, KeywordCandidate>();

  const samplerResults = [
    ...unigramCandidates,
    ...tfidfCandidates,
  ];

  for (const candidate of samplerResults) {
    const existing = candidateMap.get(candidate.keyword);

    if (existing) {
      existing.sources.push(...candidate.sources);
    } else {
      candidateMap.set(candidate.keyword, {
        keyword: candidate.keyword,
        sources: [...candidate.sources],
      });
    }
  }

  return Array.from(candidateMap.values());
}