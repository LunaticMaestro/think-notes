import type { LexicalDocument } from "@/types/nlp";

export class Bigram {
  process(document: string[]): LexicalDocument {
    const keywords: Record<string, number> = {};

    for (let i = 0; i < document.length - 1; i++) {
      const keyword = `${document[i]} ${document[i + 1]}`;

      keywords[keyword] = (keywords[keyword] ?? 0) + 1;
    }

    return {
      document,
      keywords,
    };
  }
}