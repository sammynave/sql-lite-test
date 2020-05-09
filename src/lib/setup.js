import { sqlWorker, dbReady } from "../stores/sql.js";
import { initSqlDb } from "./setup/sql.js";
import { initIndexedDb } from "./setup/indexed-db.js";

function createWorker() {
  const worker = new Worker("/worker.sql-wasm.js");
  sqlWorker.set(worker);
}

export async function setupApp() {
  createWorker();
  await initIndexedDb();
  /*
   * TODO: investigate performance.
   * pretty slow startup time ~200ms
   */
  await initSqlDb();
  dbReady.set(true);
}
