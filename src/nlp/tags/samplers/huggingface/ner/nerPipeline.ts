import {
  pipeline,
  type TokenClassificationPipeline,
} from "@huggingface/transformers";

export async function loadNerPipeline(): Promise<
  TokenClassificationPipeline
> {
  return pipeline(
    "token-classification",
    "Xenova/bert-base-NER",
    {
      device: "webgpu",
      dtype: "uint8",
    },
  );
}
