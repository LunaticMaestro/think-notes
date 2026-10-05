import type { KeywordType } from "@/types/nlp";

export interface SamplerKeyword {
  keyword: string;
  type: KeywordType;
}

export type SamplerId =
  | "unigram"
  | "bigram"
  | "trigram"
  | "tfidf"
  | "wink-datetime"
  | "wink-person"
  | "wink-location";