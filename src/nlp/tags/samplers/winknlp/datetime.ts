import { getNlp } from "./init";

import type {
  SamplerKeyword,
} from "./types";

export function sampleDatetime(
  text: string,
): SamplerKeyword[] {
  const nlp = getNlp();
  const doc = nlp.readDoc(text);

  return doc
    .entities()
    .out(nlp.its.detail)
    .filter(
      (entity) =>
        entity.type === "DATE" ||
        entity.type === "TIME",
    )
    .map((entity) => ({
      keyword: entity.value,
      type: "datetime",
    }));
}