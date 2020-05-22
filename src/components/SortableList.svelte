<script>
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { createEventDispatcher } from "svelte";

  const DURATION = 250;

  // DRAG AND DROP
  let isOver = false;
  let dragged = false;

  function flipi(a, b, c) {
    if (a === dragged.el) {
      b = { from: b.to, to: b.to };
    }

    return flip(a, b, c);
  }

  function getDraggedParent(node) {
    return node.dataset && node.dataset.index
      ? node.dataset
      : getDraggedParent(node.parentNode);
  }

  function start(ev) {
    ev.dataTransfer.setData("source", ev.target.dataset.index);
    ev.dataTransfer.setData("source-id", ev.target.dataset.id);
    const el = ev.target;
    dragged = {
      index: el.dataset.index,
      id: el.dataset.id,
      el
    };
  }

  function over(ev) {
    ev.preventDefault();
    const draggedOver = getDraggedParent(ev.target);

    const bounding = ev.target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;

    if (isOver.id !== draggedOver.id) {
      const placement = ev.clientY - offset > 0 ? "below" : "above";
      isOver = { ...draggedOver, placement };
    }
  }

  function leave(ev) {
    let draggedOver = getDraggedParent(ev.target);
    if (isOver.id === draggedOver.id) {
      isOver = false;
    }
  }

  function drop(ev) {
    ev.preventDefault();
    const draggedOver = getDraggedParent(ev.target);
    const bounding = ev.target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;
    const placement = ev.clientY - offset > 0 ? "below" : "above";
    const id = parseInt(ev.dataTransfer.getData("source-id"), 10);
    const from = parseInt(ev.dataTransfer.getData("source"), 10);
    const current = parseInt(draggedOver.index, 10);

    let to = current;

    if (to > from) {
      /*
       * if we're dragging an item up (to a higher index when the list is sorted descending)
       * then we want to insert the dragged item below the `to` target when the current
       * placement is below
       */
      to = placement === "below" ? current - 1 : current;
    }

    if (to < from) {
      /*
       * if we're dragging an item down (to a lower index when the list is sorted descending)
       * then we want to insert the dragged item below the `to` target when the current
       * placement is below
       */
      to = placement === "below" ? current : current + 1;
    }

    dispatch("sort", { from, to, id });
  }

  function end(ev) {
    isOver = false;
    setTimeout(() => {
      dragged = false;
    }, 10);
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
      draggable="true"
      on:dragstart={start}
      on:dragover={over}
      on:dragleave={leave}
      on:drop={drop}
      on:dragend={end}
      animate:flipi={{ duration: DURATION }}
      class:dragging={parseInt(dragged.id, 10) === parseInt(item.id, 10)}
      class:above={isOver && parseInt(item.id, 10) === parseInt(isOver.id, 10) && isOver.placement === 'above'}
      class:below={isOver && parseInt(item.id, 10) === parseInt(isOver.id, 10) && isOver.placement === 'below'}>
      <slot {item} index={item.order_id} />
    </li>
  {/each}
</ul>
