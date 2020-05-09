import { post } from "../worker.js";
import { idbStore } from "../../stores/sql.js";
import { all } from "idx-db";
import { get } from "svelte/store";

async function getExistingDb() {
  const [buffer] = await all(get(idbStore), "sqlDb");
  return buffer;
}

async function getDbIfExists() {
  const backup = await getExistingDb();
  if (
    backup &&
    backup.value &&
    backup.value.constructor.name === "Uint8Array"
  ) {
    return backup.value;
  }
}

/*
 * TODO: instead of opening a database and
 * creating tables here, we should ship a
 * default-db.sqlite (that already has all
 * tables created) and we should return a list
 * of migrations (<timestamp>_<name>.sql)
 *
 * if we are able to pull a local sqlite db
 * out if indexedDB we will run the migrations (if needed),
 * if we can't find a local db in indexedDB we'll
 * use the default-db.sql as our starting point
 *
 * then, we'll use the syncing mechanism to catch
 * up to the latest changes.
 *
 * at some point, if a local db is very out of date,
 * we'll maybe want to use the db sent from remote,
 * then sync up the messages it may have had waiting
 * to sync. still need to do some thinking around this
 *
 * NOTE: the default-db.sqlite and migrations should be static
 * files that are loaded by and into a webworker so as not to
 * block the main thread
 */

async function openDatabase() {
  try {
    const buffer = await getDbIfExists();
    const openMessage = {
      id: "open-db",
      action: "open",
      buffer,
    };
    await post(openMessage);
    console.log(`${buffer ? "existing" : "new"} database opened`);
  } catch (e) {
    throw e;
  }
}

async function createTodosTable() {
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
    await post(createTableMessage);
    console.log("table created: todos");
  } catch (e) {
    throw e;
  }
}

export async function initSqlDb() {
  await openDatabase();
  await createTodosTable();
}
