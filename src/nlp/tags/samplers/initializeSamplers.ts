import { init as initWinkNLP } from "./winknlp";

export function initializeSamplers(): void {
  void initWinkNLP().catch((error) => {
    console.error(
      "Failed to initialize WinkNLP:",
      error,
    );
  });
}