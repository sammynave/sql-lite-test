import { openDb } from "idx-db";
import { idbStore } from "../../stores.js";

const indexedDbStructure = [
  {
    version: 1,
    migration(event) {
      const db = event.target.result;
      db.createObjectStore("sqlDb", {
        keyPath: "id",
      });
    },
  },
];

export async function initIndexedDb() {
  const db = await openDb({
    name: "app",
    structure: indexedDbStructure,
    newVersionCallback: () => {
      window.location.reload();
    },
  });
  idbStore.set(db);
}
