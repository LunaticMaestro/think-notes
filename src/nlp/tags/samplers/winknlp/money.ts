import { getNlp } from "./init";
import type {
  SamplerKeyword,
} from "./types";

export function sampleMoney(
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
        entity.type === "MONEY",
    )
    .map((entity) => ({
      keyword: entity.value,
      type: "money",
    }));
}