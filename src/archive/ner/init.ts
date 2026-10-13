import {
  pipeline,
  type TokenClassificationPipeline,
} from "@huggingface/transformers";

let nerPipeline:
  | TokenClassificationPipeline
  | undefined;

let initializationPromise:
  | Promise<TokenClassificationPipeline>
  | undefined;

let ready = false;

export function isReady(): boolean {
  return ready && nerPipeline !== undefined;
}

export async function initializeNerSampler(): Promise<void> {
  if (ready && nerPipeline) {
    return;
  }

  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise =
    pipeline(
      "token-classification",
      "Xenova/bert-base-NER",
    );

  try {
    const pipelineInstance =
      await initializationPromise;

    /*
     * Only publish the pipeline after the
     * entire pipeline initialization has
     * completed successfully.
     *
     * This means model files have been
     * downloaded/loaded and the pipeline
     * object is ready for inference.
     */
    nerPipeline =
      pipelineInstance;

    ready = true;
  } catch (error) {
    /*
     * Never report ready when initialization
     * failed.
     */
    nerPipeline = undefined;
    ready = false;

    throw error;
  } finally {
    initializationPromise =
      undefined;
  }
}

export function getNerPipeline():
  TokenClassificationPipeline {
  if (!nerPipeline || !ready) {
    throw new Error(
      "NER pipeline is not ready.",
    );
  }

  return nerPipeline;
}