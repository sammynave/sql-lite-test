<script>
  export let todo;
  export let toggle;
  export let destroy;
  export let updateText;

  let editable = false;
</script>

<style>
  div {
    width: 100%;
    display: flex;
    place-content: center;
    place-items: center;
  }
  label {
    display: inline-flex;
    padding: 0.5em;
  }
  .handle {
    cursor: grab;
    flex-grow: initial;
  }
  .handle:active {
    cursor: grabbing;
  }
  input {
    transform: scale(1.5);
  }
  span {
    flex-grow: 1;
    padding: 0.5em 0.5em;
    margin: 0 0.5em;
  }
  button {
    display: inline-flex;
    place-content: center;
    place-items: center;
    background-color: transparent;
    font-size: 3rem;
    transform: rotate(45deg);
    border: none;
  }

  .done {
    text-decoration: line-through;
  }
</style>

<div>
  <span class="handle">grab</span>
  <label on:click={() => toggle(todo)}>
    <input type="checkbox" bind:checked={todo.done} />
  </label>
  <span
    class:done={todo.done}
    on:focusout={e => updateText(todo, e.currentTarget.innerText)}
    on:keydown={e => {
      if (e.keyCode === 13) {
        e.preventDefault();
        e.currentTarget.blur();
      }
    }}
    contenteditable="true">
    {todo.title}
  </span>
  <button on:click={() => destroy(todo)}>+</button>
</div>
