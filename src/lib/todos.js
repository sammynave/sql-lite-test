import { post } from "./worker-utils.js";
import { update } from "idx-db";
import { idbStore, dbReady, todos } from "../stores.js";
import { get as getStore } from "svelte/store";

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

async function defaultHandler(event) {
  if (event.data.error) {
    throw new Error(event.data.error);
  }
  return await save();
}

const HANDLERS = {
  init: async (event) => {
    return event.data.ready;
  },
  save: async (event) => {
    await update(getStore(idbStore), "sqlDb", {
      id: 1,
      value: event.data.buffer,
    });
    todos.set(await get());
  },
  get: async (event) => {
    return event.data && event.data.results.length
      ? asObjects(event.data.results[0])
      : [];
  },
  toggle: defaultHandler,
  updateText: defaultHandler,
  updateOrder: defaultHandler,
  destroy: defaultHandler,
  insert: defaultHandler,
};

export function handle(event) {
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
    sql: `SELECT * from todos ORDER BY order_id desc;`,
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

export async function updateOrder({ from, to, id }) {
  const event = await post({
    id: "updateOrder",
    action: "exec",
    sql: `
      ${
        from > to
          ? `UPDATE todos 
        SET order_id = order_id + 1
        WHERE order_id >= $to AND order_id <= $from;`
          : `UPDATE todos 
        SET order_id = order_id - 1
        WHERE order_id >= $from AND order_id <= $to;`
      }
      UPDATE todos
        SET order_id = $to
        WHERE id = $id
        `,
    params: {
      $id: id,
      $to: to,
      $from: from,
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
				INSERT INTO todos (title, done, order_id)
				VALUES( $title,	$done, (SELECT IFNULL(MAX(order_id), -1) + 1 FROM todos));
			`,
    params: { $title: title, $done: done },
  });

  return await handle(event);
}
