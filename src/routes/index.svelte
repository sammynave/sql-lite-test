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
  .container {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    place-items: center;
    place-content: center;
  }
</style>

<svelte:options immutable />

<form
  on:submit|preventDefault={async () => {
    if (title === '') {
      return;
    }
    await insert({ title: title, done: false });
    title = '';
  }}>
  <input type="text" bind:value={title} />
  <button type="submit" disabled={title === ''}>insert</button>
</form>

<div class="container">
  {#each $todos as todo (todo.id)}
    <Todo {todo} {toggle} {destroy} {updateText} />
  {/each}
</div>
