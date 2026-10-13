import {
  pipeline,
  type QuestionAnsweringPipeline,
} from "@huggingface/transformers";

export async function loadQaBPipeline(): Promise<
  QuestionAnsweringPipeline
> {
  return pipeline(
    "question-answering",
    "Xenova/distilbert-base-uncased-distilled-squad",
    {
        device: "webgpu",
        dtype: "uint8"
    }
  );
}