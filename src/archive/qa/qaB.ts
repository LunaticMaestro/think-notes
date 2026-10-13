import type { SamplerFunction } from "@/nlp/tags/samplers/types";

import { getQaPipeline } from "./init";
import type { KeywordType } from "@/types/nlp";

export function createQaBSampler(
  question: string,
  type: KeywordType = "generic",
  threshold: number = 0,
): SamplerFunction {
  return async (
    text: string,
    signal: AbortSignal,
  ) => {
    if (signal.aborted) {
      throw new DOMException(
        "Aborted",
        "AbortError",
      );
    }

    const qa = getQaPipeline("qa-B");

    const result = await qa(
      question,
      text,
    );

    if (signal.aborted) {
      throw new DOMException(
        "Aborted",
        "AbortError",
      );
    }

    console.log("HF-B", question, result)

    const answer = Array.isArray(result)
      ? result[0]
      : result;

    if (
      !answer ||
      answer.answer.trim().length === 0 ||
      answer.score < threshold
    ) {
      return [];
    }

    return [
      {
        keyword: answer.answer,
        type,
      },
    ];
  };
}