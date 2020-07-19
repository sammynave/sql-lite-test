import { derived, writable } from "svelte/store";

const catchAll = (v) => eventStore.set({ event: "INVALID", value: v });
const actions = {
  INVALID: (v) => console.log("INVALID STATE!", v),
  IDLE: (v) => {
    return { C: null, F: null };
  },
  CELSIUS: (v) => {
    return {
      C: v,
      F: v === "" ? "" : parseInt(v, 10) * (9 / 5) + 32,
    };
  },
  FAHRENHEIT: (v) => {
    return {
      F: v,
      C: v === "" ? "" : (parseInt(v, 10) - 32) * (5 / 9),
    };
  },
};

function machine(e) {
  const action = actions[e];
  return typeof action === "undefined" ? catchAll : action;
}

const eventStore = writable({ event: "IDLE", value: null });
const stateStore = derived(eventStore, ({ event, value }) => {
  return machine(event)(value);
});

export function temperatureMachine() {
  return {
    send: (args) => eventStore.set(args),
    stateStore,
  };
}
