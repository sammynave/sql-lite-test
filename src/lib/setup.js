import { initSqlDb } from "./setup/sql.js";
import { initIndexedDb } from "./setup/indexed-db.js";

export async function setupApp() {
  await initIndexedDb();
  await initSqlDb();
}
