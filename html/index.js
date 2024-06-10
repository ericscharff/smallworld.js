import { DomUiFactory } from "./dom_ui_factory.js";
import { SmallWorld } from "../src/smallworld.js";
import { UiHandler } from "../src/ui_handler.js";

fetch("../data/image.data").then((resp) => {
  resp.arrayBuffer().then((buf) => {
    const smallWorld = new SmallWorld(buf);
    const stcode = document.getElementById("stcode");
    const resultArea = document.getElementById("resultArea");
    resultArea.innerText = "image initalized";

    smallWorld.interpreter.uiHandler = new UiHandler(new DomUiFactory());

    document.getElementById("doItButton").addEventListener("click", () => {
      resultArea.innerText = "Result: " + smallWorld.runDoIt(stcode.value);
    });
  });
});
