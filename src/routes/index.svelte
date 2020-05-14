<script>
  import {
    get,
    insert,
    destroy,
    toggle,
    todos,
    updateText
  } from "../lib/todos.js";
  import Todo from "../components/Todo.svelte";

  let title = "";
</script>

<style>
  form {
    display: inline-flex;
  }

  input {
    flex-grow: 1;
    padding: 0.5em 1em;
    margin: 0 0.5em;
  }
</style>

<svelte:options immutable />
<svelte:head>
  <title>Todos</title>
</svelte:head>

<form
  on:submit|preventDefault={async () => {
    if (title === '') {
      return;
    }
    await insert({ title: title, done: false });
    title = '';
  }}>
  <label>new todo: <input type="text" bind:value={title} /></label>
  <button type="submit" disabled={title === ''}>insert</button>
</form>

{#each $todos as todo (todo.id)}
  <Todo {todo} {toggle} {destroy} {updateText} />
{/each}
