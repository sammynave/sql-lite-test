import * as sapper from "@sapper/app";
import { setupApp } from "./lib/setup.js";

setupApp();
sapper.start({
  target: document.querySelector("#sapper"),
});
