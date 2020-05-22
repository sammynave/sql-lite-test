/*
 * NOTE: when making changes to this file,
 * you'll need to restart the dev server.
 *
 * TODO: get this into the dev buildpipline
 * and fingerprint the output
 */

importScripts("/sql-wasm.js");

const createTableSQL = `
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOL NOT NULL,
  order_id INTEGER NOT NULL
);`;

const ACTIONS = {
  open({ id, buffer }) {
    const seedDb = buffer && new Uint8Array(buffer);
    db = new SQL.Database(seedDb);
    db.exec(createTableSQL);
    return postMessage({
      id,
      ready: true,
    });
  },

  // what about using db.prepare? need to decide on an api for that
  // https://sql-js.github.io/sql.js/documentation/class/Database.html#prepare-dynamic
  exec({ sql, params, id }) {
    return postMessage({
      id,
      results: db.exec(sql, params),
    });
  },

  export({ id }) {
    const buffer = db.export();
    const result = { id, buffer };
    try {
      return postMessage(result, [result]);
    } catch (error) {
      return postMessage(result);
    }
  },
};

function onModuleReady(sql) {
  SQL = sql;
  ACTIONS[this.data.action](this.data);
}

function onError(err) {
  return postMessage({
    id: this.data.id,
    error: err.message,
  });
}

let db = null;
let SQL = null;

const sqlModuleReady = initSqlJs({
  locateFile: (file) => `/${file}`,
});

/* NOTE: it takes about 200ms to fetch and load
 * sql-wasm.wasm file. don't think there's a way
 * speed this up. maybe if we cache it via another
 * service worker. we could maybe get it for free
 * if can get all of our worker related files in the
 * /client directory of our build. will probably
 * need to investigate some rollup plugins
 */
self.onmessage = function onmessage(event) {
  return sqlModuleReady
    .then(onModuleReady.bind(event))
    .catch(onError.bind(event));
};
