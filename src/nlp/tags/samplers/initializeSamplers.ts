import { init as initWinkNLP } from "./winknlp";

export async function initializeSamplers(): Promise<void> {
  await Promise.all([
    initWinkNLP(),
  ]);
}