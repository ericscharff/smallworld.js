import { expect } from "../node_modules/chai/chai.js";
import { UiHandler } from "./new_ui.js";
import { ImageReader } from "../src/image_reader.js";
import { Interpreter } from "../src/interpreter.js";
import { SmallByteArray, SmallObject } from "../src/objects.js";

describe("GUI Test", () => {
  let nilObject = null;
  let trueObject = null;
  let falseObject = null;
  let smallInts = null;
  let ArrayClass = null;
  let BlockClass = null;
  let ContextClass = null;
  let IntegerClass = null;

  let interpreter = null;

  beforeEach(async () => {
    const ws = document.createElement("div");
    ws.id = "workspace";
    document.body.appendChild(ws);
    const resp = await fetch("../data/image-newgui.data");
    const buf = await resp.arrayBuffer();
    const reader = new ImageReader(buf);
    nilObject = reader.readObject();
    trueObject = reader.readObject();
    falseObject = reader.readObject();
    smallInts = reader.readSmallInts();
    ArrayClass = reader.readObject();
    BlockClass = reader.readObject();
    ContextClass = reader.readObject();
    IntegerClass = reader.readObject();

    interpreter = new Interpreter(
      nilObject,
      trueObject,
      falseObject,
      smallInts,
      ArrayClass,
      BlockClass,
      ContextClass,
      IntegerClass,
    );
    interpreter.uiHandler = new UiHandler();
  });

  function runDoIt(task, bytecodePatcher) {
    // Simulate doIt

    // This relies on the definitions of class
    // variables: 'name parentClass methods size variables '
    // and method
    // variables: 'name byteCodes literals stackSize temporarySize class text '
    const TrueClass = trueObject.objClass;
    // the class name (instance var 0) is known to be an instance of String
    const name = TrueClass.data[0]; // class name (a string)
    const StringClass = name.objClass;
    // String class should have a method called "doIt"
    const methods = StringClass.data[2]; // class methods (an array)
    // Look for the method
    let doItMethod = null;
    for (let i = 0; i < methods.data.length; i++) {
      const aMethod = methods.data[i];
      // The method's first instance variable is a SmallByteArray name
      if (aMethod.data[0].toString() === "doIt") {
        doItMethod = aMethod;
        if (bytecodePatcher) {
          bytecodePatcher(aMethod.data[1].values);
        }
      }
    }
    if (doItMethod === null) {
      throw new Error("No doIt method found");
    } else {
      // Make the Smalltalk string object on which doIt will be called
      const taskByteArray = new SmallByteArray(StringClass, 0);
      taskByteArray.values = new TextEncoder().encode(task);
      const args = new SmallObject(ArrayClass, 1);
      args.data[0] = taskByteArray; // This is basically "self" for doIt
      const ctx = interpreter.buildContext(nilObject, args, doItMethod);
      return interpreter.execute(ctx);
    }
  }

  afterEach(() => {
    document.getElementById("workspace").remove();
  });

  it("exercises the GUI", () => {
    runDoIt("Class browser");
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
