import type {
  KeywordCandidate,
  KeywordRecommendation,
  ProcessedDocument,
} from "@/types/nlp";

import { v4 as uuidv4 } from 'uuid';
import { preprocess } from "./preprocessing";
import { runSamplers } from "./samplers";
import type {HardPoolConfig} from "./hard-pool"
import { buildFinalPool, buildHardPool } from "./hard-pool";
import { rankCandidates } from "./ranking/thompson";
/**
 * Main NLP pipeline.
 *
 * Input:
 *   text: string
 *
 * Output:
 *   KeywordRecommendation
 *
 * Pipeline:
 *
 *   text
 *     ↓
 *   preprocess
 *     ↓
 *   run samplers
 *     ↓
 *   hard pool #1 (100 candidates)
 *     ↓
 *   Thompson Sampling / learned ranking
 *     ↓
 *   hard pool #2 (10 candidates)
 *     ↓
 *   recommendation
 */
export async function TagFinder(text: string): Promise<KeywordRecommendation> {// KeywordRecommendation {
  // ─────────────────────────────────────────────────────────────
  // 1. PREPROCESSING
// Input: text: string
// Output: ProcessedDocument
//
// Responsible for:
// - preserving the original text
// - normalizing the text
// - tokenizing the text
//
// Does NOT:
// - generate keywords
// - remove sampler-specific words
// - apply ranking/learning

  const document: ProcessedDocument = preprocess(text);

  // ─────────────────────────────────────────────────────────────
  // 2. SAMPLER EXECUTION
  //
  // Contract:
  //   Input:
  //     ProcessedDocument
  //
  //   Output:
  //     KeywordCandidate[]
  //
  //   Responsibility:
  //     Run all five samplers:
  //       - unigram
  //       - bigram
  //       - trigram
  //       - tfidf
  //       - keybert
  //
  //     Preserve sampler provenance/evidence for each keyword.
  // ─────────────────────────────────────────────────────────────

  const candidates: KeywordCandidate[] = await runSamplers(document);

  // ─────────────────────────────────────────────────────────────
  // 3. HARD POOL #1
  //
  // Contract:
  //   Input:
  //     KeywordCandidate[]
  //
  //   Output:
  //     KeywordCandidate[] containing at most 100 candidates
  //
  //   Responsibility:
  //     Apply the manually configured sampler quotas to construct
  //     the initial candidate pool.
  //
  //     Example:
  //       TF-IDF  → 6x
  //       Unigram → 1x
  //       Bigram  → 1x
  //       Trigram → 1x
  //       KeyBERT → 1x
  //
  //     The exact quota configuration is defined separately.
  // ─────────────────────────────────────────────────────────────

  const hardPoolConfig: HardPoolConfig = {
    size: 10,
    quotas: [
      { sampler: "tfidf", weight: 5 },
      { sampler: "unigram", weight: 3 },
    ],
  };

  const hardPool: KeywordCandidate[] = buildHardPool(
    candidates,
    hardPoolConfig,
  );

  // ─────────────────────────────────────────────────────────────
  // 4. THOMPSON SAMPLING / LEARNED RANKING
  //
  // Contract:
  //   Input:
  //     KeywordCandidate[] (the hard pool)
  //
  //   Output:
  //     RankedKeyword[]
  //
  //   Responsibility:
  //     Use the learned Thompson Sampling policy to assign a
  //     learned score to each candidate and combine it with the
  //     candidate's sampler evidence.
  //
  //     The bandit represents:
  //       P(user will NOT remove this keyword)
  //
  //     This stage does NOT modify the samplers.
  // ─────────────────────────────────────────────────────────────

  // let rankedCandidates: RankedKeyword[];
  const rankedCandidates = await rankCandidates(
    hardPool,
  );

  // ─────────────────────────────────────────────────────────────
  // 5. HARD POOL #2
  //
  // Contract:
  //   Input:
  //     RankedKeyword[]
  //
  //   Output:
  //     KeywordCandidate[] containing at most 10 candidates
  //
  //   Responsibility:
  //     Sort/use the learned ranking and select the final keywords
  //     that will be presented to the user.
  // ─────────────────────────────────────────────────────────────

    const selected = buildFinalPool( rankedCandidates, 3, ); 

  // ─────────────────────────────────────────────────────────────
  // 6. RECOMMENDATION
  //
  // Contract:
  //   Input:
  //     ProcessedDocument
  //     Hard Pool #1
  //     Selected keywords
  //
  //   Output:
  //     KeywordRecommendation
  //
  //   Responsibility:
  //     Package the recommendation together with the candidates
  //     that were considered, so that later user feedback can be
  //     associated with this recommendation.
  // ─────────────────────────────────────────────────────────────



  return {
    id: uuidv4(),
    document,
    candidates: hardPool,
    selected,
  };
}