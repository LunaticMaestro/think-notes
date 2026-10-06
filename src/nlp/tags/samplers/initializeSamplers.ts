import { init as initWinkNLP } from "./winknlp";
import { initializeQaSamplers } from "./huggingface/qa";
import { initializeNerSampler } from "./huggingface/ner/init";

export function initializeSamplers(): void {
  void initWinkNLP().catch((error) => {
    console.error(
      "Failed to initialize WinkNLP:",
      error,
    );
  });

  void initializeQaSamplers().catch((error) => {
    console.error(
      "Failed to initialize QA samplers:",
      error,
    );
  });

  void initializeNerSampler().catch((error) => {
    console.error(
      "Failed to initialize NER sampler:",
      error,
    );
  });
}