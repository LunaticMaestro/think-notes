const DB_NAME = "tag-finder";
const DB_VERSION = 2;

export const CORPUS_STORE = "corpus";
export const THOMPSON_STORE = "thompson";

let dbPromise: Promise<IDBDatabase> | undefined;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION,
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          CORPUS_STORE,
        )
      ) {
        db.createObjectStore(CORPUS_STORE);
      }

      if (
        !db.objectStoreNames.contains(
          THOMPSON_STORE,
        )
      ) {
        db.createObjectStore(
          THOMPSON_STORE,
          {
            keyPath: "actionId",
          },
        );
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        dbPromise = undefined;
      };

      resolve(db);
    };

    request.onerror = () => {
      dbPromise = undefined;
      reject(request.error);
    };
  });

  return dbPromise;
}