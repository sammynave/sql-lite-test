import { sqlWorker, idbStore, dbReady } from "../stores/sql.js";
import { openDb, all } from "idx-db";
import { get } from "svelte/store";
import { wrap } from "./worker.js";

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

async function initIndexedDb() {
  const db = await openDb({
    name: "app",
    structure: indexedDbStructure,
    newVersionCallback: () => {
      window.location.reload();
    },
  });
  idbStore.set(db);
}

async function maybeGetBuffer() {
  const [buffer] = await all(get(idbStore), "sqlDb");
  return buffer;
}

function createWorker() {
  const worker = new Worker("/worker.sql-wasm.js");
  sqlWorker.set(worker);
}

async function openDatabase() {
  try {
    const openMessage = {
      id: "open-db",
      action: "open",
    };
    const buffer = await maybeGetBuffer();
    if (buffer) {
      openMessage.buffer = buffer.value;
    }
    const event = await wrap(openMessage);
  } catch (e) {
    throw e;
  }
}

async function createTable() {
  try {
    const createTableMessage = {
      id: "create-table",
      action: "exec",
      sql: `CREATE TABLE IF NOT EXISTS todos (
	      id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOL NOT NULL
      );`,
    };
    const event = await wrap(createTableMessage);
  } catch (e) {
    throw e;
  }
}

export async function setupApp() {
  createWorker();
  await initIndexedDb();
  await openDatabase();
  await createTable();
  dbReady.set(true);
}
