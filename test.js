import fs from "fs/promises";
import path from "path";
import { expect } from "chai";
import { ImageReader } from "./image_reader.js";
import { ImageWriter } from "./image_writer.js";
import { Interpreter } from "./interpreter.js";
import { SmallByteArray, SmallObject } from "./objects.js";
import { UIHandler } from "./ui_handler.js";

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

describe("SmallWorld", () => {
  describe("Image reading", () => {
    it("fails on bad magic number", async () => {
      await fs.readFile("image.data").then((buf) => {
        buf[0] = 70;
        const reader = new ImageReader(buf);
        expect(() => reader.readObject()).to.throw("Bad magic number");
      });
    });

    it("fails on bad version", async () => {
      await fs.readFile("image.data").then((buf) => {
        buf[7] = 3; // LSB in version number, makes this v3
        const reader = new ImageReader(buf);
        expect(() => reader.readObject()).to.throw("Bad version number");
      });
    });

    it("fails on bad object type", async () => {
      await fs.readFile("image.data").then((buf) => {
        buf[100] = 10; // One of the entries in the object pool
        const reader = new ImageReader(buf);
        expect(() => reader.readObject()).to.throw("Unknown object type 10");
      });
    });

    it("succeeds on valid image", async () => {
      await fs.readFile("image.data").then((buf) => {
        const reader = new ImageReader(buf);
        const nilObject = reader.readObject();
        const trueObject = reader.readObject();
        const falseObject = reader.readObject();
        const smallInts = reader.readSmallInts();
        const ArrayClass = reader.readObject();
        const BlockClass = reader.readObject();
        const ContextClass = reader.readObject();
        const IntegerClass = reader.readObject();
        expect(smallInts[0].objClass).to.equal(IntegerClass);
        expect(smallInts[1].value).to.equal(1);
        expect(smallInts[2].toString()).to.equal("SmallInteger 2");
        expect(nilObject.toString()).to.contain("SmallObject");
        expect(nilObject.objClass.data[0].toString()).to.equal("Undefined");
      });
    });
  });

  describe("Image writing", () => {
    it("writes a complete image", async () => {
      await fs.readFile("image.data").then((buf) => {
        const reader = new ImageReader(buf);
        const nilObject = reader.readObject();
        const trueObject = reader.readObject();
        const falseObject = reader.readObject();
        const smallInts = reader.readSmallInts();
        const ArrayClass = reader.readObject();
        const BlockClass = reader.readObject();
        const ContextClass = reader.readObject();
        const IntegerClass = reader.readObject();

        const writer = new ImageWriter();
        writer.writeObject(nilObject);
        writer.writeObject(trueObject);
        writer.writeObject(falseObject);
        writer.writeSmallInts(smallInts);
        writer.writeObject(ArrayClass);
        writer.writeObject(BlockClass);
        writer.writeObject(ContextClass);
        writer.writeObject(IntegerClass);
        const arr = writer.finish();
        expect(arr).to.eql(buf);
      });
    });
  });

  describe("Interpreter", () => {
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
      await fs.readFile("testdata/image.noGui").then((buf) => {
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

      // This relies on the defintions of class
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

    it("adds", () => {
      expect(runDoIt("3 + 2")).to.equal(interpreter.newInteger(5));
    });

    it("subtracts", () => {
      expect(runPrintIt("(100 - 75)")).to.equal("25");
    });

    it("multiplies", () => {
      expect(runPrintIt("(9 * 12)")).to.equal("108");
    });

    it("divides", () => {
      expect(runDoIt("75 quo: 5").value).to.equal(
        interpreter.newInteger(15).value,
      );
      expect(runDoIt("76 quo: 5").value).to.equal(
        interpreter.newInteger(15).value,
      );
    });

    it("remainder", () => {
      expect(runDoIt("75 rem: 5")).to.equal(interpreter.newInteger(0));
      expect(runDoIt("76 rem: 5")).to.equal(interpreter.newInteger(1));
    });

    it("fractions", () => {
      expect(runPrintIt("((1 / 3) + (3 / 4))")).to.equal("(13/12)");
    });

    it("adds large integers", () => {
      expect(runPrintIt("(2000000000 + 2000000000)")).to.equal("4000000000");
    });

    it("subtracts large integers", () => {
      expect(runPrintIt("(2000000000 negated - 2000000000)")).to.equal(
        "-4000000000",
      );
    });

    it("multiplies large integers", () => {
      expect(runPrintIt("(2000000000 * 2000000000)")).to.equal(
        "04000000000000000000",
      );
    });

    it("concatenates strings", () => {
      expect(runPrintIt("'abc' + 'def'")).to.equal("abcdef");
    });

    it("compares strings", () => {
      expect(runPrintIt("('abc' < 'def')")).to.equal("true");
      expect(runPrintIt("('abc' <= 'def')")).to.equal("true");
      expect(runPrintIt("('abc' = 'def')")).to.equal("false");
      expect(runPrintIt("('abc' = 'abcd')")).to.equal("false");
      expect(runPrintIt("('abc' >= 'def')")).to.equal("false");
      expect(runPrintIt("('abc' > 'def')")).to.equal("false");
    });

    it("handles unrecognized messages", () => {
      const r = runPrintIt("3 moo");
      expect(r).to.contain("Unrecognized message selector: moo");
    });

    describe("User interface", () => {
      let windowTitle = "";
      let listData = [];
      let buttons = [];
      let uiFactory = {
        makeBorderedPanel: function () {
          return {
            addToCenter: () => 0,
            addToEast: () => 0,
            addToNorth: () => 0,
            addToWest: () => 0,
          };
        },
        makeButton: function (b) {
          buttons.push(b);
          return { addButtonListener: () => 0 };
        },
        makeGridPanel: function () {
          return { addChild: () => 0 };
        },
        makeListWidget: function (data) {
          listData = data;
          return { addSelectionListener: () => 0 };
        },
        makeTextArea: function () {
          return {};
        },
        makeTextField: function () {
          return {};
        },
        makeWindow: function () {
          return {
            addChildWidget: () => 0,
            setSize: (w, h) => {
              expect(w).to.equal(500);
              expect(h).to.equal(200);
            },
            setTitle: (t) => {
              windowTitle = t;
            },
            setVisible: (v) => expect(v).to.equal(true),
          };
        },
      };

      beforeEach(() => {
        interpreter.uiHandler = new UIHandler(uiFactory);
      });

      it("Opens the class browser", () => {
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
        expect(buttons).to.eql(browserButtons);
      });
    });

    it("compiles and runs new methods", () => {
      const r = runDoIt(`
[String compileMethod: '
asUpper | r |
  r <- String new: self size.
  1 to: self size do: [:i |
    r at: i put: (self at: i) upperCase].
  ^r
'.
'hello, world! test.' asUpper] value`);
      expect(r.toString()).to.equal("HELLO, WORLD! TEST.");
      expect(runPrintIt("(String methods at: 4) name")).to.equal("asUpper");
      expect(runPrintIt("(String methods at: 4) byteCodes")).to.equal(
        "#(64 32 129 145 130 146 112 245 81 32 129 147 193 25 48 49 32 " +
          "49 130 148 129 149 131 150 242 131 151 245 48 242 245 241 )",
      );
    });

    it("throws on invalid opcode", () => {
      expect(() =>
        runDoIt("0", (code) => {
          code[0] = 0x00;
          code[1] = 0x00;
        }),
      ).to.throw("Unknown opcode 0");
    });

    it("throws on invalid constant", () => {
      expect(() =>
        runDoIt("0", (code) => {
          code[0] = 0x5d;
        }),
      ).to.throw("Unknown constant 13");
    });

    it("throws on invalid unary", () => {
      expect(() =>
        runDoIt("0", (code) => {
          code[0] = 0xa2;
        }),
      ).to.throw("Illegal SendUnary 2");
    });

    it("throws on invalid primitive", () => {
      expect(() =>
        runDoIt("0", (code) => {
          code[0] = 0xd0;
          code[1] = 0xff;
        }),
      ).to.throw("Unknown Primitive 255");
    });

    it("throws on invalid special", () => {
      expect(() =>
        runDoIt("0", (code) => {
          code[0] = 0xf0;
        }),
      ).to.throw("Unrecognized DoSpecial 0");
    });

    it("throws on bad method lookup", () => {
      expect(() => interpreter.methodLookup(nilObject, "")).to.throw("bad");
    });

    it("throws on double error: method lookup", () => {
      expect(() => interpreter.methodLookup(nilObject, "error:")).to.throw(
        "Unrecognized message selector: error:",
      );
    });
  });
});
