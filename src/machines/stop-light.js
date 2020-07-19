import { get, writable, derived } from "svelte/store";

const states = {
  green: {
    TIMER: { next: "yellow", wait: 2000 },
  },
  yellow: {
    TIMER: { next: "red", wait: 1000 },
  },
  red: {
    TIMER: { next: "green", wait: 2000 },
  },
};

function machine(event) {
  const current = get(color)
  return states[current][event];
}

const color = writable("green");
export const lightStore = derived(color, ($color, set) => {
  set($color);
  const { next, wait } = machine('TIMER');
  const interval = setInterval(() => color.set(next), wait);
  return () => {
    clearInterval(interval);
  };
});
