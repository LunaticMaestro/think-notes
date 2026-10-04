import type { KeywordCandidate } from "@/types/nlp";
import type { HardPoolConfig } from "./types";

export function buildHardPool(
  candidates: KeywordCandidate[],
  config: HardPoolConfig,
): KeywordCandidate[] {
  const selected = new Map<string, KeywordCandidate>();

  const totalWeight = config.quotas.reduce(
    (total, quota) => total + quota.weight,
    0,
  );

  if (totalWeight <= 0 || config.size <= 0) {
    return [];
  }

  for (const quota of config.quotas) {
    const samplerLimit = Math.floor(
      (quota.weight / totalWeight) * config.size,
    );

    if (samplerLimit <= 0) {
      continue;
    }

    const samplerCandidates = candidates.filter((candidate) =>
      candidate.sources.some(
        (source) => source.sampler === quota.sampler,
      ),
    );

    let selectedFromSampler = 0;

    for (const candidate of samplerCandidates) {
      if (selected.size >= config.size) {
        break;
      }

      if (selectedFromSampler >= samplerLimit) {
        break;
      }

      // Candidate may already have been selected by another sampler.
      if (selected.has(candidate.keyword)) {
        continue;
      }

      selected.set(candidate.keyword, candidate);
      selectedFromSampler++;
    }
  }

  return Array.from(selected.values());
}