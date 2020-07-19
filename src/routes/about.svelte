<script>
  import { temperatureMachine } from "../machines/temperature.js";
  import { lightStore } from "../machines/stop-light.js";

  const { send, stateStore } = temperatureMachine();

</script>

<style>
  span {
    display: block;
    border-radius: 50%;
    border: 2px solid black;
    width: 5em;
    height: 5em;
  }
</style>

<svelte:head>
  <title>About</title>
</svelte:head>

<h1>About this site</h1>

<p>This is a simple state machine using svelte stores.</p>

<label>
  <input
    type="number"
    placeholder="e.g. 0"
    on:input={e => send({ event: 'CELSIUS', value: e.target.value })}
    value={$stateStore.C} />
  ℃
</label>
=
<label>
  <input
    type="number"
    placeholder="e.g. 32"
    on:input={e => send({ event: 'FAHRENHEIT', value: e.target.value })}
    value={$stateStore.F} />
  ℉
</label>
<div>
  <span style={$lightStore === 'red' && `background-color: red`} />
  <span style={$lightStore === 'yellow' && `background-color: yellow`} />
  <span style={$lightStore === 'green' && `background-color: green`} />
</div>
