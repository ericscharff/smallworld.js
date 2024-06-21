import { expect } from "../node_modules/chai/chai.js";
import { SmallWorld } from "../src/smallworld.js";
import { UiHandler } from "./html_ui.js";

describe("GUI Test", () => {
  let smallWorld = null;

  beforeEach(async () => {
    const ws = document.createElement("div");
    ws.id = "workspace";
    document.body.appendChild(ws);
    const resp = await fetch("../data/html_gui.image");
    const buf = await resp.arrayBuffer();
    smallWorld = new SmallWorld(buf);
    smallWorld.interpreter.uiHandler = new UiHandler();
  });

  afterEach(() => {
    document.getElementById("workspace").remove();
  });

  it("exercises the GUI", () => {
    smallWorld.doIt("Class browser");
    function findByText(target, start, eltKind) {
      const xpath = `//${eltKind}[text()='${target}']`;
      return document.evaluate(
        xpath,
        start,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
    }
    const browser = findByText(
      "Smalltalk Browser",
      document,
      "span",
    ).parentElement;
    const block = findByText("Block", browser, "li");
    const examine = findByText("examine class", browser, "button");
    const evalButton = findByText("evaluate expression", browser, "button");
    const browserInput = browser.getElementsByTagName("input")[0];
    const browserTa = browser.getElementsByTagName("textarea")[0];
    block.click();
    examine.click();
    const editor = findByText(
      "Class Editor: Block",
      document,
      "span",
    ).parentElement;
    const ta = editor.getElementsByTagName("textarea")[0];
    const value = findByText("value", editor, "li");
    const compile = findByText("compile", editor, "button");
    value.click();
    ta.value = "newMethod ^'my new method'";
    compile.click();
    browserInput.value = "[nil] newMethod";
    evalButton.click();
    expect(browserTa.value).to.equal("my new method");
  });
});
