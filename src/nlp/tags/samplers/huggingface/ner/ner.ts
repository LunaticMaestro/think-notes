import type { KeywordType } from "@/types/nlp";
import type { SamplerFunction } from "@/nlp/tags/samplers/types";

import { getNerPipeline } from "./init";

type NerEntity = {
  entity: string;
  score: number;
  index: number;
  word: string;
};

function isNerEntity(
  value: unknown,
): value is NerEntity {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return false;
  }

  const entity =
    value as Record<string, unknown>;

  return (
    typeof entity.entity === "string" &&
    typeof entity.score === "number" &&
    typeof entity.index === "number" &&
    typeof entity.word === "string"
  );
}

function getTag(
  entity: string,
): string | null {
  const separator =
    entity.indexOf("-");

  if (separator === -1) {
    return null;
  }

  return entity.slice(
    separator + 1,
  );
}

function reconstructWord(
  tokens: NerEntity[],
): string {
  return tokens
    .map((token) =>
      token.word.startsWith("##")
        ? token.word.slice(2)
        : token.word,
    )
    .join("");
}

export function createNerSampler(
  nerTag: string,
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

    const ner = getNerPipeline();

    const rawResult = await ner(text);

    if (signal.aborted) {
      throw new DOMException(
        "Aborted",
        "AbortError",
      );
    }

    // console.log(rawResult)
    const entities = rawResult
  .filter(isNerEntity)
  .filter(
    (entity: NerEntity) =>
      entity.score >= threshold &&
      getTag(entity.entity) === nerTag,
  )
  .sort(
    (a: NerEntity, b: NerEntity) =>
      a.index - b.index,
  );

    const results: {
      keyword: string;
      type: KeywordType;
    }[] = [];

    let current: NerEntity[] = [];

    for (const entity of entities) {
      const isContinuation =
        entity.word.startsWith("##");

      const previous =
        current[current.length - 1];

      const isSameSpan =
        previous !== undefined &&
        entity.index ===
          previous.index + 1 &&
        isContinuation;

      if (!isSameSpan) {
        if (current.length > 0) {
          const keyword =
            reconstructWord(current);

          if (keyword) {
            results.push({
              keyword,
              type,
            });
          }
        }

        current = [entity];
        continue;
      }

      current.push(entity);
    }

    if (current.length > 0) {
      const keyword =
        reconstructWord(current);

      if (keyword) {
        results.push({
          keyword,
          type,
        });
      }
    }

    return results;
  };
}