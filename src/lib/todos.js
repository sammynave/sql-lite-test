import { post } from "./worker-utils.js";
import { update } from "idx-db";
import { idbStore, dbReady } from "../stores/sql.js";
import { get as getStore, writable } from "svelte/store";

const $idbStore = getStore(idbStore);
export const todos = writable([]);

dbReady.subscribe(async (x) => {
  if (x) {
    todos.set(await get());
  }
});

function asObjects(results) {
  const { columns, values } = results;
  return values.reduce((acc, value) => {
    const row = columns.reduce((acc, c, i) => {
      acc[c] = value[i];
      return acc;
    }, {});

    return acc.concat([row]);
  }, []);
}

const HANDLERS = {
  save: async (event) => {
    await update($idbStore, "sqlDb", { id: 1, value: event.data.buffer });
    todos.set(await get());
  },
  get: async (event) => {
    return event.data && event.data.results.length
      ? asObjects(event.data.results[0])
      : [];
  },
  toggle: async (event) => {
    if (event.data.error) {
      throw new Error(event.data.error);
    }
    return await save();
  },
  updateText: async (event) => {
    if (event.data.error) {
      throw new Error(event.data.error);
    }

    return await save();
  },
  destroy: async (event) => {
    if (event.data.error) {
      throw new Error(event.data.error);
    }

    return await save();
  },
  insert: async (event) => {
    return await save();
  },
};

function handle(event) {
  return HANDLERS[event.data.id](event);
}

async function save() {
  const event = await post({ id: "save", action: "export" });
  await handle(event);
}

export async function get() {
  const event = await post({
    id: "get",
    action: "exec",
    sql: `SELECT * from todos;`,
  });
  return await handle(event);
}

export async function toggle(todo) {
  const event = await post({
    id: "toggle",
    action: "exec",
    sql: `
          UPDATE todos
          SET done = $done
          WHERE id = $id 
        `,
    params: {
      $id: todo.id,
      $done: todo.done === 1 ? 0 : 1,
    },
  });
  return await handle(event);
}

export async function updateText(todo, text) {
  const event = await post({
    id: "updateText",
    action: "exec",
    sql: `
          UPDATE todos
          SET title = $text
          WHERE id = $id 
        `,
    params: {
      $id: todo.id,
      $text: text,
    },
  });
  return await handle(event);
}

export async function destroy(todo) {
  const event = await post({
    id: "destroy",
    action: "exec",
    sql: `
          DELETE FROM todos
          WHERE id = $id
        `,
    params: { $id: todo.id },
  });
  return await handle(event);
}

export async function insert({ title, done }) {
  await post({
    id: "insert",
    action: "exec",
    sql: `
				INSERT INTO todos (title, done)
				VALUES( $title,	$done);
			`,
    params: { $title: title, $done: done },
  });

  return await handle(event);
}
