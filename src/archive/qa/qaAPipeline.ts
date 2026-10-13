import {
  pipeline,
  type QuestionAnsweringPipeline,
} from "@huggingface/transformers";

export async function loadQaAPipeline(): Promise<
  QuestionAnsweringPipeline
> {
  return pipeline(
    "question-answering",
    "onnx-community/bert-base-uncased-squad2-ONNX",
    {
        device: "webgpu",
        dtype: "uint8"
    }
  );
}