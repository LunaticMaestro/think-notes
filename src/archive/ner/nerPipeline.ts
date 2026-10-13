import {
  pipeline,
  type TokenClassificationPipeline,
} from "@huggingface/transformers";

export async function loadNerPipeline(): Promise<
  TokenClassificationPipeline
> {
  return pipeline(
    "token-classification",
    "onnx-community/distilbert-NER-ONNX",
    {
      device: "webgpu",
      dtype: "fp16",
    },
  );
}
