import * as sapper from "@sapper/app";
import { setupStores } from "./lib/setup.js";

setupStores();
sapper.start({
  target: document.querySelector("#sapper"),
});
