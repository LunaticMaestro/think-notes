export type KeywordType =
  | "datetime"
  | "person"
  | "location"
  | "money"
  | "url"
  | "hashtag"
  | "generic";


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