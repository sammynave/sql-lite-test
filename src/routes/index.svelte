<script>
  import {
    insert,
    destroy,
    toggle,
    updateText,
    updateOrder
  } from "../lib/todos.js";
  import { dbReady, todos } from "../stores.js";
  import Todo from "../components/Todo.svelte";
  import SortableList from "../components/SortableList.svelte";

  let title = "";
  let inserting = false;
  $: disabled = title === "" || inserting;
</script>

<style>
  form {
    display: inline-flex;
  }

  input {
    flex-grow: 1;
    padding: 0.25em 0.5em;
    margin: 0 0.5em;
  }
</style>

<svelte:options immutable />
<svelte:head>
  <title>Todos</title>
</svelte:head>

<form
  on:submit|preventDefault={async () => {
    if (disabled) {
      return;
    }
    inserting = true;
    await insert({ title, done: false });
    title = '';
    inserting = false;
  }}>
  <label>
    new todo:
    <input type="text" bind:value={title} />
  </label>
  <button type="submit" {disabled}>insert</button>
</form>

{#if $dbReady}
  <SortableList
    list={$todos}
    let:item
    on:sort={({ detail: { from, to, id } }) => updateOrder({ from, to, id })}>
    <Todo todo={item} {toggle} {destroy} {updateText} />
  </SortableList>
{:else}
  <h2>hang tight</h2>
{/if}
