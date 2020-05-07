import * as sapper from "@sapper/app";
import { sqlWorker, idbStore, dbReady } from "./stores/sql.js";
import { openDb, all } from "idx-db";

const structure = [
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

sapper
  .start({
    target: document.querySelector("#sapper"),
  })
  .then(async () => {
    const db = await openDb({
      name: "app",
      structure,
      newVersionCallback: () => {
        window.location.reload();
      },
    });
    const [buffer] = await all(db, "sqlDb");
    const worker = new Worker("/worker.sql-wasm.js");
    worker.onmessage = function (event) {
      console.log("Database opened", event.data);
    };

    worker.onerror = function (event) {
      console.log("Worker error: ", event);
    };

    const openMessage = {
      id: "open-db",
      action: "open",
    };

    if (buffer) {
      openMessage.buffer = buffer.value;
    }
    worker.postMessage(openMessage);

    worker.postMessage({
      id: "create-table",
      action: "exec",
      sql: `CREATE TABLE IF NOT EXISTS todos (
	      id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOL NOT NULL
      );`,
    });

    sqlWorker.set(worker);
    idbStore.set(db);
  });
