<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		max-width: 40em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
    display: flex;
    flex-direction: column;
    place-items: center;
    place-content: center;
  }
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>