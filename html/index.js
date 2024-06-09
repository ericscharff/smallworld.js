import { DomUiFactory } from "./dom_ui_factory.js";
import { UiHandler } from "../src/ui_handler.js";
import { ImageReader } from "../src/image_reader.js";
import { Interpreter } from "../src/interpreter.js";
import { SmallByteArray, SmallObject } from "../src/objects.js";

fetch("../data/image.data").then((resp) => {
  resp.arrayBuffer().then((buf) => {
    const reader = new ImageReader(buf);
    const nilObject = reader.readObject();
    const trueObject = reader.readObject();
    const falseObject = reader.readObject();
    const smallInts = reader.readSmallInts();
    const ArrayClass = reader.readObject();
    const BlockClass = reader.readObject();
    const ContextClass = reader.readObject();
    const IntegerClass = reader.readObject();
    const stcode = document.getElementById("stcode");
    const resultArea = document.getElementById("resultArea");
    resultArea.innerText = "image initalized";

    const interpreter = new Interpreter(
      nilObject,
      trueObject,
      falseObject,
      smallInts,
      ArrayClass,
      BlockClass,
      ContextClass,
      IntegerClass,
    );
    interpreter.uiHandler = new UiHandler(new DomUiFactory());

    document.getElementById("doItButton").addEventListener("click", () => {
      // Simulate doIt

      // This relies on the defintions of class
      // variables: 'name parentClass methods size variables '
      // and method
      // variables: 'name byteCodes literals stackSize temporarySize class text '
      const task = stcode.value;
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
        resultArea.innerText = "Result: " + interpreter.execute(ctx);
      }
    });
  });
});
