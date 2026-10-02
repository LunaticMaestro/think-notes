import type { LexicalDocument } from "@/types/nlp";

export class Unigram {
  process(document: string[]): LexicalDocument {
    const keywords: Record<string, number> = {};

    for (const term of document) {
      const keyword = term.toLowerCase();

      keywords[keyword] = (keywords[keyword] ?? 0) + 1;
    }

    return {
      document,
      keywords,
    };
  }
}