import { SmallWorld } from "../src/smallworld.js";
import { UiHandler } from "./html_ui.js";

fetch("../data/html_gui.image").then((resp) => {
  resp.arrayBuffer().then((buf) => {
    const smallWorld = new SmallWorld(buf, null, new UiHandler());
    const stcode = document.getElementById("stcode");
    const resultArea = document.getElementById("resultArea");
    resultArea.innerText = "image initalized";

    document.getElementById("doItButton").addEventListener("click", () => {
      resultArea.innerText = "Result: " + smallWorld.doIt(stcode.value);
    });
  });
});
