import type { SamplerId } from "@/types/nlp";

/**
 * Beta distribution parameters for a sampler.
 *
 * The samplerId is intentionally a string rather than a
 * closed union because new samplers may be introduced by
 * future versions of the application.
 */
export interface BetaParameters {
  samplerId: SamplerId;

  /**
   * Number of positive outcomes.
   */
  alpha: number;

  /**
   * Number of negative outcomes.
   */
  beta: number;
}

/**
 * A scorer assigns a multiplier to a sampler.
 *
 * If a sampler is not explicitly present in `weights`,
 * `defaultWeight` is used.
 */
export interface Scorer {
  scorerId: string;

  defaultWeight: number;

  weights: Partial<Record<
    SamplerId,
    number
  >>;
}

/**
 * Complete persisted DecisionPolicy state.
 *
 * This is deliberately extensible:
 * - new samplers can be added to `betas`
 * - new scorers can be added to `scorers`
 * - existing entries remain untouched during migration
 */
export interface DecisionPolicyParams {
  version: number;

  betas: Partial<
    Record<SamplerId, BetaParameters>
  >;

  scorers: Partial<
    Record<string, Scorer>
  >;
}