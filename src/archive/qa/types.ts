export interface QaAnswer {
  answer: string;
  score: number;
  start: number;
  end: number;
}

export interface QaPipeline {
  (
    question: string,
    context: string,
  ): Promise<QaAnswer | QaAnswer[]>;
}