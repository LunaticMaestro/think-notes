import type { SamplerId } from "@/types/nlp";

export interface SamplerQuota {
  sampler: SamplerId;
  weight: number;
}

export interface HardPoolConfig {
  size: number;
  quotas: SamplerQuota[];
}