import { getNlp } from "./init";
import type {
  SamplerKeyword,
} from "./types";

export function sampleHastag(
  text: string,
): SamplerKeyword[] {
  const nlp = getNlp();
  const doc = nlp.readDoc(text);

  return doc
    .entities()
    .out(nlp.its.detail)
    .filter(
      (entity): entity is {
        type: string;
        value: string;
      } =>
        typeof entity !== "string" &&
        entity.type === "HASHTAG",
    )
    .map((entity) => ({
      keyword: entity.value,
      type: "hashtag",
    }));
}