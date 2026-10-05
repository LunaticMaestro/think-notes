export type KeywordType =
  | "datetime"
  | "person"
  | "location"
  | "money"
  | "url"
  | "hashtag"
  | "generic";

export type SamplerId =
  | "unigram"
  | "bigram"
  | "trigram"
  | "tfidf"
  | "wink-datetime"
  | "wink-money"
  | "wink-url"
  | "wink-hashtag"
  ;

export interface Keyword {
  id: string;
  name: string;
  type: KeywordType;
  sampler: SamplerId;
}


export type Reward = {
  samplerId: SamplerId, 
  dislike: 0 | 1
}