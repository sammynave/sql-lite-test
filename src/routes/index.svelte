<script>
  import { sqlWorker, idbStore, dbReady } from "../stores/sql.js";
  import { update, all } from "idx-db";

  let insertResults = "";
  let getResults = [];

  let loaded = false;
  $: if (!loaded && $sqlWorker) {
    get();
  }

  function insert() {
    $sqlWorker.onmessage = function(event) {
      insertResults = event.data;
    };
    $sqlWorker.postMessage({
      id: "insert-row",
      action: "exec",
      sql: `
				INSERT INTO todos (title, done)
				VALUES( $title,	$done);
			`,
      params: { $title: "hi", $done: false }
    });
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

  function get() {
    $sqlWorker.onmessage = function(event) {
      if (event.data.id === "select-todos") {
        if (event.data.results.length) {
          getResults = asObjects(event.data.results[0]);
          loaded = true;
        }
      }
    };
    $sqlWorker.postMessage({
      id: "select-todos",
      action: "exec",
      sql: `SELECT * from todos;`
    });
  }

  function save() {
    $sqlWorker.onmessage = function(event) {
      update($idbStore, "sqlDb", { id: 1, value: event.data.buffer });
    };
    $sqlWorker.postMessage({
      action: "export"
    });
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
  <div>{JSON.stringify(insertResults)}</div>
</div>

<div>
  <button on:click={get}>get</button>
  {#each getResults as r}
    <div>{r.id},{r.title},{r.done}</div>
  {/each}
</div>

<div>
  <button on:click={save}>save</button>
</div>
