import { getNerPipeline } from "./init";

export function isReady(): boolean {
  try {
    getNerPipeline();
    return true;
  } catch {
    return false;
  }
}