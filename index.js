import { ImageReader } from "./imagereader.js";
import { Interpreter } from "./interpreter.js";
import { SmallByteArray, SmallObject } from "./objects.js";

fetch("image.data").then((resp) => {
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
      console.log("Byte poiter class: " + ctx.data[4].objClass.data[0]);
      console.log("Byte poiter value: " + ctx.data[4]);
      console.log("Stack top class: " + ctx.data[5].objClass.data[0]);
      console.log("Stack top value: " + ctx.data[5]);
      console.log("Old context: " + ctx.data[6]);
      console.log("Smallint 0: " + interpreter.newInteger(0));
      console.log("SmallInt 30: " + interpreter.newInteger(30));
      console.log(interpreter.newInteger(4) === interpreter.newInteger(4));
      console.log(interpreter.newInteger(4) === interpreter.newInteger(3));
    }

    //       try {
    //         return interpreter.execute(ctx, null, null);
    //       } catch (Exception ex) {
    //         ex.printStackTrace();
    //       } finally {
    //         out("Task complete");
    //       }
    //     }
    //     return null;
    //   }
    // */
  });
});
console.log("Hello, world");
