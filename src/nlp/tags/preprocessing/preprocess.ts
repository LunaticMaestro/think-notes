import type { ProcessedDocument } from "@/types/nlp";
import type { PreprocessConfig } from "./types";
import { removeStopwords } from "stopword";

const DEFAULT_CONFIG: Required<PreprocessConfig> = {
  lowercase: true,
  removePunctuation: true,
  normalizeWhitespace: true,
};

export function preprocess(
  originalText: string,
  config: PreprocessConfig = {},
): ProcessedDocument {
  const options = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let text = originalText;

  // 1. Lowercase
  if (options.lowercase) {
    text = text.toLowerCase();
  }

  // 2. Remove punctuation/symbols
  //
  // Keep letters, numbers, and whitespace.
  // Unicode letters/numbers are preserved.
  if (options.removePunctuation) {
    text = text.replace(/[^\p{L}\p{N}\s]/gu, " ");
  }

  // 3. Normalize whitespace
  if (options.normalizeWhitespace) {
    text = text.replace(/\s+/g, " ").trim();
  }

  // 4. Tokenize
  const allTokens = text.length > 0 ? text.split(" ") : [];

  // 5. Remove Stopwords
  const tokens: string[] = removeStopwords(allTokens)

  return {
    originalText,
    text,
    tokens,
  };
}