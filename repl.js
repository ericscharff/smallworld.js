#!/usr/bin/env node

import fs from "fs";
import readline from "readline";
import { ImageReader } from "./image_reader.js";
import { Interpreter } from "./interpreter.js";
import { SmallByteArray, SmallObject } from "./objects.js";
import { UIHandler } from "./ui_handler.js";

class ConsoleUIFactory {
  makeBorderedPanel() {
    return {
      addToCenter: (e) => 0,
      addToEast: (e) => 0,
      addToNorth: (e) => 0,
      addToSouth: (e) => 0,
      addToWest: (e) => 0,
    };
  }

  makeButton(buttonLabel) {
    console.log("BUTTON:", buttonLabel);
    return {
      addButtonListener: (l) => 0,
    };
  }

  makeGridPanel() {
    return { addChild: (c) => 0 };
  }

  makeLabel(labelText) {
    console.log("LABEL:", labelText);
    return {};
  }

  makeListWidget(listItems) {
    console.log("LIST:", listItems);
    return {
      addSelectionListener: (l) => 0,
      getSelectedIndex: () => 1,
      setData: (newListItems) => 0,
    };
  }

  makeTextArea() {
    return {
      getText: () => 0,
      setText: (s) => console.log("TEXTAREA:", s),
    };
  }

  makeTextField() {
    return {
      getText: () => 0,
      setText: (s) => console.log("TEXTFIELD:", s),
    };
  }

  makeWindow() {
    return {
      addChildWidget: (c) => 0,
      setSize: (w, h) => 0,
      setTitle: (t) => console.log("WINDOW:", t),
      setVisible: (v) => 0,
    };
  }
}

const buf = fs.readFileSync("image.data");
const reader = new ImageReader(buf);
const nilObject = reader.readObject();
const trueObject = reader.readObject();
const falseObject = reader.readObject();
const smallInts = reader.readSmallInts();
const ArrayClass = reader.readObject();
const BlockClass = reader.readObject();
const ContextClass = reader.readObject();
const IntegerClass = reader.readObject();

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
interpreter.uiHandler = new UIHandler(new ConsoleUIFactory());
interpreter.imageSaveCallback = (name, buf) => fs.writeFileSync(name, buf);

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "SmallWorld> ",
});

let multiLine = "";

rl.prompt();
rl.on("line", (s) => {
  if (multiLine) {
    multiLine += s;
    if (s.includes("!")) {
      s = multiLine.replaceAll("!", "");
      multiLine = "";
    } else {
      s = "";
    }
  }
  if (s.includes("!")) {
    multiLine = s;
  } else {
    s = s.trim();
    const blankOrComment = s === "" || s.startsWith("#") || s.startsWith('"');
    if (!blankOrComment) {
      if (["bye", "exit", "shutdown", "quit"].includes(s)) {
        rl.close();
      } else {
        console.log("" + runDoIt(s));
        rl.prompt();
      }
    }
  }
});
