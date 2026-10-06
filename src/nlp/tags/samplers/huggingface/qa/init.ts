import type {
  QuestionAnsweringPipeline,
} from "@huggingface/transformers";

import { loadQaAPipeline } from "./qaAPipeline";
import { loadQaBPipeline } from "./qaBPipeline";

const pipelines: Record<
  string,
  QuestionAnsweringPipeline
> = {};

export async function initializeQaSamplers(): Promise<void> {

  console.log("NLP: HF_QA: Initializing")

  const [
    // qaA, 
    qaB
  ] = await Promise.all([
    // loadQaAPipeline(),
    loadQaBPipeline(),
  ]);

  console.log("NLP: HF_QA: Read")


  // pipelines["qa-A"] = qaA;
  pipelines["qa-B"] = qaB;
}

export function getQaPipeline(
  samplerId: string,
): QuestionAnsweringPipeline {
  const qaPipeline = pipelines[samplerId];

  if (!qaPipeline) {
    throw new Error(
      `QA pipeline "${samplerId}" is not initialized.`,
    );
  }

  return qaPipeline;
}