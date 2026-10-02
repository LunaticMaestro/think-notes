import { Preprocess } from "./extractor/lexical/preprocess";
import { Unigram } from "./extractor/lexical/unigram";
import type { LexicalDocument } from "@/types/nlp";

const preprocess = new Preprocess();
const unigram = new Unigram();

function TagFinder(text: string): LexicalDocument {
  const processedDocument = preprocess.process(text);

  const unigramResult = unigram.process(processedDocument);

  return {
    document: processedDocument,
    keywords: {
      ...unigramResult.keywords,
    },
  };
}

self.onmessage = (event) => {
  try {
    if (event.data.type !== "find") {
      return;
    }

    const { text, requestId } = event.data;

    const document = TagFinder(text);

    self.postMessage({
      type: "complete",
      requestId,
      keywords: Object.keys(document.keywords),
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId: event.data.requestId,
      error:
        error instanceof Error
          ? error.message
          : "Unknown NLP error",
    });
  }
};