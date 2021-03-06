import { post } from "../worker-utils.js";
import { all } from "idx-db";
import { get } from "svelte/store";
import { sqlWorker, dbReady, idbStore } from "../../stores.js";
import { handle } from "../todos.js";

async function getExistingDb() {
  const [buffer] = await all(get(idbStore), "sqlDb");
  if (buffer && buffer.value) {
    return buffer.value;
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

export async function initSqlDb() {
  const buffer = await getExistingDb();
  const worker = new Worker("/worker-sql.js");
  sqlWorker.set(worker);
  const event = await post({
    id: "init",
    action: "open",
    buffer,
  });
  const ready = await handle(event);
  if (!ready) {
    console.error("can not open sqlite db");
    throw new Error(event);
  }
  dbReady.set(ready);
}
