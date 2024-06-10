import { SmallWorld } from "../src/smallworld.js";
import { UiHandler } from "./new_ui.js";

fetch("../data/image-newgui.data").then((resp) => {
  resp.arrayBuffer().then((buf) => {
    const smallWorld = new SmallWorld(buf);
    const stcode = document.getElementById("stcode");
    const resultArea = document.getElementById("resultArea");
    resultArea.innerText = "image initalized";

    smallWorld.interpreter.uiHandler = new UiHandler();

    document.getElementById("doItButton").addEventListener("click", () => {
      resultArea.innerText = "Result: " + smallWorld.runDoIt(stcode.value);
    });
  });
});
