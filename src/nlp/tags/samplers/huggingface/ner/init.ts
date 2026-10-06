import type {
  TokenClassificationPipeline,
} from "@huggingface/transformers";

import { loadNerPipeline } from "./nerPipeline";

let nerPipeline:
  | TokenClassificationPipeline
  | undefined;

export async function initializeNerSampler(): Promise<void> {
  if (nerPipeline) {
    return;
  }

  nerPipeline =
    await loadNerPipeline();
}

export function getNerPipeline(): TokenClassificationPipeline {
  if (!nerPipeline) {
    throw new Error(
      "NER pipeline is not initialized.",
    );
  }

  return nerPipeline;
}