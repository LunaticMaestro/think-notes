export type SamplerId =
  | "unigram"
  | "bigram"
  | "trigram"
  | "tfidf"
  | "keybert";

export interface ProcessedDocument {
  originalText: string;
  text: string;
  tokens: string[];
}

export interface SamplerEvidence {
  sampler: SamplerId;
  score: number;
}

export interface KeywordCandidate {
  keyword: string;

  /**
   * Original evidence supplied by one or more samplers.
   * A keyword can be produced by multiple samplers.
   */
  sources: SamplerEvidence[];
}

export interface KeywordSampler {
  readonly id: SamplerId;

  sample(document: ProcessedDocument): KeywordCandidate[];
}

export interface SamplerQuota {
  sampler: SamplerId;
  count: number;
}

export interface HardPoolConfig {
  size: number;
  quotas: SamplerQuota[];
}

export interface RankedKeyword {
  candidate: KeywordCandidate;

  /**
   * Score derived from the original sampler evidence.
   */
  baseScore: number;

  // Score produced by Thompson Sampling.
  thompsonScore: number;

  /**
   * Score used for final ranking.
   */
  finalScore: number;

}

export interface KeywordFeedback {
  type: "removed" | "kept";
  keyword: string;
}

export interface KeywordRecommendation {
  id: string;
  document: ProcessedDocument;

  /**
   * Candidates surviving Hard Pool #1.
   */
  candidates: KeywordCandidate[];

  /**
   * Keywords actually shown to the user.
   */
  selected: KeywordCandidate[];
}

export interface KeywordFeedbackEvent {
  recommendationId: string;
  feedback: KeywordFeedback[];
}