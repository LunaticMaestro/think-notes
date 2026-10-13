import { getQaPipeline } from "./init";

export function isQaReady(
  samplerId: string,
): boolean {
  try {
    getQaPipeline(samplerId);
    return true;
  } catch {
    return false;
  }
}