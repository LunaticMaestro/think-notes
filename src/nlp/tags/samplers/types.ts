import type {
  KeywordType,
  SamplerId,
} from "@/types/nlp";

export interface SamplerKeyword {
  keyword: string;
  type: KeywordType;
}

export interface AvailableSampler {
  id: SamplerId;
  keywords: SamplerKeyword[];
}

export type SamplerFunction = (
  text: string,
) => Promise<SamplerKeyword[]> | SamplerKeyword[];