import { removeStopwords } from "stopword";

export class PreprocessNGram {
  process(document: string): string[] {
    const words = document
      .replace(/[^\p{L}\p{N}\s]/gu, "") // Remove symbols/punctuation
      .split(/\s+/)
      .filter(Boolean);

    return removeStopwords(words);
  }
}