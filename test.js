import fs from "fs/promises";
import path from "path";
import { expect } from "chai";
import { ImageReader } from "./imagereader.js";
import { Interpreter } from "./interpreter.js";
import { SmallByteArray, SmallObject } from "./objects.js";

describe("SmallWorld", () => {
  describe("Image reading", () => {
    it("fails on bad magic number", async () => {
      await fs.readFile("testdata/image.badMagicNumber").then((buf) => {
        const reader = new ImageReader(buf);
        expect(() => reader.readObject()).to.throw();
      });
    });

    it("fails on bad version", async () => {
      await fs.readFile("testdata/image.badVersionNumber").then((buf) => {
        const reader = new ImageReader(buf);
        expect(() => reader.readObject()).to.throw();
      });
    });

    it("fails on object type", async () => {
      await fs.readFile("testdata/image.badObjectType").then((buf) => {
        const reader = new ImageReader(buf);
        expect(() => reader.readObject()).to.throw();
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
        expect(nilObject.toString()).to.equal("SmallObject (1021)");
        expect(nilObject.objClass.data[0].toString()).to.equal("Undefined");
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
      await fs.readFile("image.data").then((buf) => {
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

    let runDoIt = (task) => {
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
    };

    it("runs", () => {
      expect(runDoIt("3 + 2")).to.equal(interpreter.newInteger(5));
    });

    it("runs 2", () => {
      expect(runDoIt("(100 - 75) printString").toString()).to.equal("25");
    });
  });
});
