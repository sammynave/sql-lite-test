<script>
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { createEventDispatcher } from "svelte";

  const DURATION = 250;

  // DRAG AND DROP
  let grabbedEl = null;
  let shiftX = null;
  let shiftY = null;

  function flipi(a, b, c) {
    if (a === dragged.el) {
      b = { from: b.to, to: b.to };
    }

    return flip(a, b, c);
  }

  function position(e) {
    const x = e.pageX - shiftX;
    const y = e.pageY - shiftY;
    grabbedEl.style.top = `${y}px`;
    grabbedEl.style.left = `${x}px`;
  }

  function grab(e) {
    if (e.button === 0) {
      grabbedEl = e.target.parentNode.parentNode;
      const styles = getComputedStyle(grabbedEl);
      const { left, top } = grabbedEl.getBoundingClientRect();
      shiftX = e.clientX - left;
      shiftY = e.clientY - top;

      const { width, margin, padding, transition, border, listStyle } = getComputedStyle(grabbedEl);

      document.body.append(grabbedEl)
      grabbedEl.style.position = 'absolute';
      grabbedEl.style.zIndex = '1';
      grabbedEl.style.width = width;
      grabbedEl.style.padding = padding;
      grabbedEl.style.margin = margin;
      grabbedEl.style.transition = transition;
      grabbedEl.style.border = border;
      grabbedEl.style.listStyle = listStyle;

      position(e);
    }
  }

  function move(e) {
    if (grabbedEl) {
      position(e);
    }
  }

  function drop(e) {
    console.log('drop1')
    if (e.button === 0) {
      console.log('drop',e)
      grabbedEl.style.position = ''
      grabbedEl.style.top= ''
      grabbedEl.style.left = ''
      grabbedEl.style.zIndex = ''
      // dispatch("sort", { from, to, id });
    }
    grabbedEl = null;
  }

  // DISPATCH REORDER
  const dispatch = createEventDispatcher();

  // PROPS
  export let list;
</script>

<style>
  ul {
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 0;
    padding: 0;
    transition: visibility 1ms linear;
    border-top: 2px solid transparent;
    border-bottom: 2px solid transparent;
  }

  .dragging {
    opacity: 0.2;
    visibility: hidden;
    max-height: 0;
  }

  .above {
    border-top: 2px solid rgba(48, 12, 200, 0.2);
  }

  .below {
    border-bottom: 2px solid rgba(48, 12, 200, 0.2);
  }
</style>

<ul>
  {#each list as item (item.id)}
    <li
      data-index={item.order_id}
      data-id={item.id}

      on:mousedown={grab}
      on:mousemove={move}
      on:mouseup={drop}

      animate:flipi={{ duration: DURATION }}>
      <slot {item} index={item.order_id} />
    </li>
  {/each}
</ul>
