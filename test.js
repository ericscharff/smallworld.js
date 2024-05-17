import assert from "assert";
import fs from "fs/promises";
import path from "path";
import { ImageReader } from "./imagereader.js";
import { Interpreter } from "./interpreter.js";
import { SmallByteArray, SmallObject } from "./objects.js";

describe("SmallWorld", () => {
  it("fails on bad magic number", async () => {
    await fs.readFile("testdata/image.badMagicNumber").then((buf) => {
      const reader = new ImageReader(buf);
      assert.throws(() => reader.readObject());
    });
  });

  it("fails on bad version", async () => {
    await fs.readFile("testdata/image.badVersionNumber").then((buf) => {
      const reader = new ImageReader(buf);
      assert.throws(() => reader.readObject());
    });
  });

  it("fails on object type", async () => {
    await fs.readFile("testdata/image.badObjectType").then((buf) => {
      const reader = new ImageReader(buf);
      assert.throws(() => reader.readObject());
    });
  });

  it("runs", async () => {
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
      console.log("image initialized");

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

      // Simulate doIt

      // This relies on the defintions of class
      // variables: 'name parentClass methods size variables '
      // and method
      // variables: 'name byteCodes literals stackSize temporarySize class text '
      const task = "3 + 2";
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
        console.log("Context class: " + ctx.objClass.data[0]);
        console.log("Method class: " + ctx.data[0].objClass.data[0]);
        console.log("Args class: " + ctx.data[1].objClass.data[0]);
        console.log("Byte pointer class: " + ctx.data[4].objClass.data[0]);
        console.log("Byte pointer value: " + ctx.data[4]);
        console.log("Stack top class: " + ctx.data[5].objClass.data[0]);
        console.log("Stack top value: " + ctx.data[5]);
        console.log("Old context: " + ctx.data[6]);
        console.log("Smallint 0: " + interpreter.newInteger(0));
        console.log("SmallInt 30: " + interpreter.newInteger(30));
        const r = interpreter.execute(ctx);
        assert(r === interpreter.newInteger(5));
      }
    });
    console.log("Started");
  });
});
