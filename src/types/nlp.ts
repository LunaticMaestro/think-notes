export type KeywordType =
  | "datetime"
  | "person"
  | "location"
  | "money"
  | "url"
  | "hashtag"
  | "organization"
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
  | "hf-qa-b-person"
  | "hf-qa-a-action"
  | "hf-ner-PER"
  | "hf-ner-LOC"
  | "hf-ner-ORG"

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
