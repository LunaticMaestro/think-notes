import { removeStopwords } from "stopword";

export class Preprocess {
  process(document: string): string[] {
    const words = document
      .replace(/[^\p{L}\p{N}\s]/gu, "") // Remove symbols/punctuation
      .split(/\s+/)
      .filter(Boolean);

    return removeStopwords(words);
  }
}