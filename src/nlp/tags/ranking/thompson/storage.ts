import type { BanditParams } from "@cognitive-engine/core";
import type { BanditStorage } from "@cognitive-engine/bandit";

import {
  openDatabase,
  THOMPSON_STORE,
} from "@/storage/indexedDb";

export class IndexedDbThompsonStorage
  implements BanditStorage
{
  async getParams(
    actionId: string,
  ): Promise<BanditParams | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        THOMPSON_STORE,
        "readonly",
      );

      const store =
        transaction.objectStore(
          THOMPSON_STORE,
        );

      const request = store.get(actionId);

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveParams(
    params: BanditParams,
  ): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        THOMPSON_STORE,
        "readwrite",
      );

      const store =
        transaction.objectStore(
          THOMPSON_STORE,
        );

      const request = store.put(params);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async listActionIds(): Promise<string[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        THOMPSON_STORE,
        "readonly",
      );

      const store =
        transaction.objectStore(
          THOMPSON_STORE,
        );

      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(
          request.result.map(String),
        );
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}