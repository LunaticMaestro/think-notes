import { init as initWinkNLP } from "./winknlp";
// import { initializeQaSamplers } from "./huggingface/qa";
// import { initializeNerSampler } from "./huggingface/ner/init";
import { initializeNerSampler as v2NerSampler } from "./huggingface/v2ner";

export function initializeSamplers(): void {
  void initWinkNLP().catch((error) => {
    console.error(
      "Failed to initialize WinkNLP:",
      error,
    );
  });

  // void initializeQaSamplers().catch((error) => {
  //   console.error(
  //     "Failed to initialize QA samplers:",
  //     error,
  //   );
  // });

  // void initializeNerSampler().catch((error) => {
  //   console.error(
  //     "Failed to initialize NER sampler:",
  //     error,
  //   );
  // });

  void v2NerSampler().catch((error) => {
    console.error(
      "Failed to initialize v2NER:",
      error,
    );
  });
}