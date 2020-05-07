import { writable } from "svelte/store";

export const sqlWorker = writable(null);
export const idbStore = writable(null);
export const dbReady = writable(false);
