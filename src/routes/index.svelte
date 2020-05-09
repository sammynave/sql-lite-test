<script>
  import { sqlWorker, idbStore, dbReady } from "../stores/sql.js";
  import { update, all } from "idx-db";
  import { wrap } from "../lib/worker.js";

  let todos = [];
  let loaded = false;
  let doneTodos;
  let notDoneTodos;

  $: if (!loaded && $dbReady) {
    get();
  }
  $: doneTodos = todos.filter(x => x.done);
  $: notDoneTodos = todos.filter(x => !x.done);

  async function insert() {
    await wrap({
      id: "insert-row",
      action: "exec",
      sql: `
				INSERT INTO todos (title, done)
				VALUES( $title,	$done);
			`,
      params: { $title: "hi", $done: false }
    });
    await get();
    await save();
  }

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

  async function get() {
    try {
      const event = await wrap({
        id: "select-todos",
        action: "exec",
        sql: `SELECT * from todos;`
      });
      loaded = true;
      if (event.data.results.length) {
        todos = asObjects(event.data.results[0]);
      }
    } catch (e) {
      throw e;
    }
  }

  async function toggle(todo) {
    try {
      const event = await wrap({
        id: "update-todos",
        action: "exec",
        sql: `
          UPDATE todos
          SET done = $done
          WHERE id = $id 
        `,
        params: {
          $id: todo.id,
          $done: todo.done === 1 ? 0 : 1
        }
      });
      if (event.data && event.data.results && event.data.results.length) {
        todos = asObjects(event.data.results[0]);
      }
      if (event.data.error) {
        throw new Error(event.data.error);
      }
    } catch (e) {
      throw e;
    }
    await get();
    await save();
  }

  async function destroy(todo) {
    try {
      const event = await wrap({
        id: "delete-todos",
        action: "exec",
        sql: `
          DELETE FROM todos
          WHERE id = $id
        `,
        params: { $id: todo.id }
      });
      if (event.data && event.data.results && event.data.results.length) {
        todos = asObjects(event.data.results[0]);
      }
      if (event.data.error) {
        throw new Error(event.data.error);
      }
    } catch (e) {
      throw e;
    }
    await get();
    await save();
  }

  async function save() {
    const event = await wrap({ action: "export" });
    await update($idbStore, "sqlDb", { id: 1, value: event.data.buffer });
  }
</script>

<style>

</style>

<svelte:head>
  <title>Sapper project template</title>
</svelte:head>

<h1>hi</h1>
<div>
  <button on:click={insert}>insert</button>
  <div>seems that sqlite returns nothing from inserts</div>
</div>

<div>
  not done
  {#each notDoneTodos as r (r.id)}
    <div>
      <span on:click={() => toggle(r)}>🤷‍♂️</span>
      {r.id},{r.title},{r.done}
      <span on:click={() => destroy(r)}>X</span>
    </div>
  {/each}
</div>
<div>
  done
  {#each doneTodos as r (r.id)}
    <div>
      <span on:click={() => toggle(r)}>👍</span>
      {r.id},{r.title},{r.done}
      <span on:click={() => destroy(r)}>X</span>
    </div>
  {/each}
</div>
