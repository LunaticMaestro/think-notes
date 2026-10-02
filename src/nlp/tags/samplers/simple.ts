import type { LexicalDocument } from "../../types/lexical";

export class SimpleSampler {
  sample(document: LexicalDocument, k: number): string[] {
    const groups = {
      unigram: [] as [string, number][],
      bigram: [] as [string, number][],
      trigram: [] as [string, number][],
    };

    for (const entry of Object.entries(document.keywords)) {
      const wordCount = entry[0].split(" ").length;

      if (wordCount === 1) {
        groups.unigram.push(entry);
      } else if (wordCount === 2) {
        groups.bigram.push(entry);
      } else if (wordCount === 3) {
        groups.trigram.push(entry);
      }
    }

    const strategies = [
      groups.unigram,
      groups.bigram,
      groups.trigram,
    ];

    const perStrategy = Math.floor(k / strategies.length);

    const sampled: string[] = [];

    for (const group of strategies) {
      group.sort(([, a], [, b]) => b - a);

      sampled.push(
        ...group
          .slice(0, perStrategy)
          .map(([keyword]) => keyword)
      );
    }

    return sampled;
  }
}