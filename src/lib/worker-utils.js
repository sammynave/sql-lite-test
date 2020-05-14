import { sqlWorker } from "../stores/sql.js";
import { get } from "svelte/store";

export async function post(message) {
  const worker = get(sqlWorker);
  return new Promise((res, rej) => {
    worker.onmessage = res;
    worker.onerror = rej;
    worker.postMessage(message);
  });
}
