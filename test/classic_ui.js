import fs from "fs";
import { expect } from "chai";
import { SmallWorld } from "../src/smallworld.js";
import { UiHandler } from "../src/ui_handler.js";

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
  let smallWorld = null;

  beforeEach(async () => {
    const buf = fs.readFileSync("data/base.image");
    smallWorld = new SmallWorld(buf);
  });

  function doIt(task, bytecodePatcher) {
    return smallWorld.doIt(task, bytecodePatcher);
  }

  function printIt(task) {
    return smallWorld.printIt(task);
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

      smallWorld.interpreter.uiHandler = new UiHandler(uiFactory);

      const browserButtons = [
        "evaluate expression",
        "examine class",
        "delete class",
        "clear",
        "close",
      ];
      doIt("Class browser");
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
      expect(printIt("(Block methods at: 1) text")).to.equal(savedTextArea);
    });
  });
});
