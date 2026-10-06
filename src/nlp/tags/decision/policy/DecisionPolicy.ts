import type { SamplerId } from "@/types/nlp";

import type { BetaParameters, DecisionPolicyParams, Scorer } from "./types";
import { DECISION_POLICY_STORE, openDatabase } from "@/storage/indexDb";

export class DecisionPolicy {
  /**
   * Initialize the policy from persisted state.
   *
   * Loads existing parameters from IndexedDB and performs
   * any required migration/reset handling.
   */
  private betas: Partial<Record<SamplerId, BetaParameters>> = {};

  private scorers: Partial<Record<string, Scorer>> = {};

  async init(scorers: Record<string, Scorer> = {}): Promise<void> {
    const params = await this.loadParams();

    this.betas = params.betas;

    // this.scorers = params.scorers;

    for (const scorer of Object.values(scorers)) {
      if (scorer) {
        this.scorers[scorer.scorerId] = scorer;
      }
    }

    await this.saveParams({
      version: params.version,
      betas: this.getBetaDistribution(),
      scorers: this.scorers,
    });
  }

  /**
   * Load the complete persisted policy parameters.
   */
  async loadParams(): Promise<DecisionPolicyParams> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DECISION_POLICY_STORE, "readonly");

      const store = transaction.objectStore(DECISION_POLICY_STORE);

      const request = store.get("decision-policy");

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
          return;
        }

        resolve({
          version: 1,
          betas: {},
          scorers: {},
        });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Persist the complete policy parameters.
   */
  async saveParams(params: DecisionPolicyParams): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DECISION_POLICY_STORE, "readwrite");

      const store = transaction.objectStore(DECISION_POLICY_STORE);

      store.put(params, "decision-policy");

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };

      transaction.onabort = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * Return the Beta parameters for all known samplers.
   */
  getBetaDistribution(): Partial<Record<SamplerId, BetaParameters>> {
    return {
      ...this.betas,
    };
  }

  /**
   * Update the Beta distribution for one sampler based
   * on an observed reward.
   *
   * reward:
   *   1 = positive outcome
   *   0 = negative outcome
   */
  async updateBeta(samplerId: SamplerId, dislike: 0 | 1 = 0): Promise<void> {
    if (!this.betas[samplerId]) {
      this.betas[samplerId] = {
        samplerId,
        alpha: 1,
        beta: 1,
      };
    }

    const beta = this.betas[samplerId];

    if (!beta) {
      throw new Error(`Missing Beta distribution for sampler "${samplerId}".`);
    }

    if (dislike === 1) {
      beta.beta += 7;
    } else {
      beta.alpha += 1;
    }

    await this.saveParams({
      version: 1,
      betas: this.getBetaDistribution(),
      scorers: this.scorers,
    });
  }

  /**
   * Return all configured scorers.
   */
  getScorers(): Record<string, Scorer> {
    return Object.fromEntries(
      Object.entries(this.scorers).filter(
        (entry): entry is [string, Scorer] => entry[1] !== undefined,
      ),
    );
  }

  /**
   * Add or replace a scorer configuration.
   *
   * If the scorer already exists, its complete configuration
   * is replaced.
   *
   * If it does not exist, it is added.
   */
  async updateScorer(scorer: Scorer): Promise<void> {
    this.scorers[scorer.scorerId] = scorer;

    await this.saveParams({
      version: 1,
      betas: this.getBetaDistribution(),
      scorers: this.scorers,
    });
  }

  /**
   * Select one sampler from the currently available candidates.
   *
   * Only candidates supplied here participate in the
   * allocation calculation.
   */
  async selectCandidate(availableCandidates: SamplerId[]): Promise<SamplerId> {
    // 1. Validate / normalize candidates
    if (availableCandidates.length === 0) {
      throw new Error(
        "Cannot select a candidate from an empty candidate list.",
      );
    }

    const candidates = [...new Set(availableCandidates)];

    // 2. Create fresh Beta distributions for
    //    previously unknown samplers.
    for (const samplerId of candidates) {
      if (!this.betas[samplerId]) {
        this.betas[samplerId] = {
          samplerId,
          alpha: 1,
          beta: 1,
        };
      }
    }

    // 3. Get scorer configurations.
    const scorers = Object.values(this.scorers).filter(
      (scorer): scorer is Scorer => scorer !== undefined,
    );

    // 4. Calculate score for each candidate.
    const scoredCandidates = candidates.map((samplerId) => {
      const beta = this.betas[samplerId];

      if (!beta) {
        throw new Error(
          `Missing Beta distribution for sampler "${samplerId}".`,
        );
      }

      const estimatedQuality = beta.alpha / (beta.alpha + beta.beta);

      const scorerWeight = scorers.reduce((weight, scorer) => {
        const samplerWeight = scorer.weights[samplerId] ?? scorer.defaultWeight;

        return weight * samplerWeight;
      }, 1);

      const score = estimatedQuality * scorerWeight;

      return {
        samplerId,
        estimatedQuality,
        scorerWeight,
        score,
      };
    });

    // 5. Calculate normalized allocations.
    const totalScore = scoredCandidates.reduce(
      (sum, candidate) => sum + candidate.score,
      0,
    );

    if (totalScore <= 0) {
      throw new Error(
        "Cannot allocate candidates because total score is zero.",
      );
    }

    const allocations = scoredCandidates.map((candidate) => ({
      ...candidate,
      allocation: candidate.score / totalScore,
    }));

    // 6. Sample one candidate according
    //    to the allocation distribution.
    const random = Math.random();

    let cumulative = 0;

    for (const candidate of allocations) {
      cumulative += candidate.allocation;

      if (random < cumulative) {
        return candidate.samplerId;
      }
    }

    // Floating-point safety fallback.
    return allocations[allocations.length - 1].samplerId;
  }
}
