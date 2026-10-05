import { getNlp } from "./init";

export function isReady(): boolean {
  try {
    getNlp();
    return true;
  } catch {
    return false;
  }
}