import { DomUiFactory } from "./ui_factory.js";
import { SmallWorld } from "../src/smallworld.js";
import { UiHandler } from "../src/ui_handler.js";

fetch("../data/base.image").then((resp) => {
  resp.arrayBuffer().then((buf) => {
    const smallWorld = new SmallWorld(
      buf,
      null,
      new UiHandler(new DomUiFactory()),
    );
    const stcode = document.getElementById("stcode");
    const resultArea = document.getElementById("resultArea");
    resultArea.innerText = "image initalized";

    document.getElementById("doItButton").addEventListener("click", () => {
      resultArea.innerText = "Result: " + smallWorld.doIt(stcode.value);
    });
  });
});
