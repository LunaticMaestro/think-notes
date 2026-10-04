
interface CorpusStats {
  documentCount: number;
  documentFrequency: Record<string, number>;
}


import {
  openDatabase,
  CORPUS_STORE,
} from "@/storage/indexedDb";

export async function getCorpusStats(): Promise<CorpusStats> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      CORPUS_STORE,
      "readonly",
    );

    const store =
      transaction.objectStore(CORPUS_STORE);

    const request = store.get("stats");

    request.onsuccess = () => {
      resolve(
        request.result ?? {
          documentCount: 0,
          documentFrequency: {},
        },
      );
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function updateCorpusStats(
  tokens: string[],
): Promise<void> {
  const db = await openDatabase();

  const uniqueTerms = new Set(tokens);

  const corpus = await getCorpusStats();

  corpus.documentCount += 1;

  for (const term of uniqueTerms) {
    corpus.documentFrequency[term] =
      (corpus.documentFrequency[term] ?? 0) + 1;
  }

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(CORPUS_STORE, "readwrite");
    const store = transaction.objectStore(CORPUS_STORE);

    const request = store.put(corpus, "stats");

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  db.close();
}