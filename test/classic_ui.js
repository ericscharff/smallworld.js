import fs from "fs/promises";
import path from "path";
import { expect } from "chai";
import sinon from "sinon";
import { ImageReader } from "../src/image_reader.js";
import { ImageWriter } from "../src/image_writer.js";
import { Interpreter } from "../src/interpreter.js";
import { SmallByteArray, SmallJsObject, SmallObject } from "../src/objects.js";
import { UIHandler } from "../src/ui_handler.js";

const ALL_SMALLTALK_CLASSES = [
  "Application",
  "Array",
  "Block",
  "Boolean",
  "ByteArray",
  "Char",
  "Class",
  "Collection",
  "Color",
  "Context",
  "False",
  "File",
  "Float",
  "Fraction",
  "Image",
  "Indexed",
  "Integer",
  "Interval",
  "LargeNegative",
  "LargePositive",
  "List",
  "Magnitude",
  "Menu",
  "Method",
  "Number",
  "Object",
  "Ordered",
  "Pane",
  "Point",
  "Semaphore",
  "SmallInt",
  "String",
  "True",
  "Undefined",
  "Window",
];

describe("Classic GUI", () => {
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
    await fs.readFile("data/image.data").then((buf) => {
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
    });
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

  function runPrintIt(task) {
    return runDoIt(task + " printString").toString();
  }

  describe("User interface", () => {
    it("Opens the class browser", () => {
      let windowTitle = "";
      let listData = [];
      let buttons = [];
      let buttonListeners = [];
      let listSelectionListener = null;
      let savedWidth = 0;
      let savedHeight = 0;
      let savedTextArea = "";
      const uiFactory = {
        makeBorderedPanel: function () {
          return {
            addToCenter: () => 0,
            addToEast: () => 0,
            addToNorth: () => 0,
            addToSouth: () => 0,
            addToWest: () => 0,
          };
        },
        makeButton: function (b) {
          buttons.push(b);
          return { addButtonListener: (l) => buttonListeners.push(l) };
        },
        makeGridPanel: function () {
          return { addChild: () => 0 };
        },
        makeLabel: function () {
          return {};
        },
        makeListWidget: function (data) {
          listData = data;
          return {
            addSelectionListener: (l) => {
              listSelectionListener = l;
            },
            getSelectedIndex: () => 3,
            setData: (data) => {
              listData = data;
            },
          };
        },
        makeTextArea: function () {
          return {
            getText: () => savedTextArea,
            setText: (s) => {
              savedTextArea = s;
            },
          };
        },
        makeTextField: function () {
          return {};
        },
        makeWindow: function () {
          return {
            addChildWidget: () => 0,
            setSize: (w, h) => {
              savedWidth = w;
              savedHeight = h;
            },
            setTitle: (t) => {
              windowTitle = t;
            },
            setVisible: (v) => expect(v).to.equal(true),
          };
        },
      };

      interpreter.uiHandler = new UIHandler(uiFactory);

      const browserButtons = [
        "evaluate expression",
        "examine class",
        "delete class",
        "clear",
        "close",
      ];
      runDoIt("Class browser");
      expect(windowTitle).to.equal("Smalltalk Browser");
      expect(listData).to.eql(ALL_SMALLTALK_CLASSES);
      expect(buttons).to.eql([
        "evaluate expression",
        "examine class",
        "delete class",
        "clear",
        "close",
      ]);
      expect(savedWidth).to.equal(500);
      expect(savedHeight).to.equal(200);

      listSelectionListener(3); // Class browser's list just returns nil

      buttons = [];
      const examineClassButton = buttonListeners[1];
      buttonListeners = [];
      examineClassButton(); // This opens a new window
      expect(windowTitle).to.equal("Class Editor: Block");
      // The new list in the class editor has Block's methods
      expect(listData).to.eql([
        "fork",
        "value",
        "value:",
        "value:value:",
        "whileFalse:",
        "whileTrue:",
      ]);
      expect(buttons).to.eql([
        "clear text area",
        "compile",
        "delete method",
        "instance variables",
        "edit class variables",
        "examine superclass",
        "examine metaclass",
        "object edit",
        "close",
      ]);

      listSelectionListener(1); // Click on the "fork" option in the editor
      expect(savedTextArea).to.equal(`fork
   " must be a no arg block "
   <19 self>`);
      const compileMethodButton = buttonListeners[1];
      // The method to compile
      savedTextArea = 'fork\n  " from UI "\n<19 self>';
      compileMethodButton(); // click compile method
      // The newly compiled fork method should be in the image now
      expect(runPrintIt("(Block methods at: 1) text")).to.equal(savedTextArea);
    });
  });
});
