import { initSqlDb } from "./setup/sql.js";
import { initIndexedDb } from "./setup/indexed-db.js";

export async function setupStores() {
  await initIndexedDb();
  await initSqlDb();
}
