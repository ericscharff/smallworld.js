import { ImageReader } from "./image_reader.js";
import { Interpreter } from "./interpreter.js";
import { SmallByteArray, SmallObject } from "./objects.js";

export class SmallWorld {
  constructor(buf) {
    const reader = new ImageReader(buf);
    const nilObject = reader.readObject();
    const trueObject = reader.readObject();
    const falseObject = reader.readObject();
    const smallInts = reader.readSmallInts();
    const ArrayClass = reader.readObject();
    const BlockClass = reader.readObject();
    const ContextClass = reader.readObject();
    const IntegerClass = reader.readObject();

    this.interpreter = new Interpreter(
      nilObject,
      trueObject,
      falseObject,
      smallInts,
      ArrayClass,
      BlockClass,
      ContextClass,
      IntegerClass,
    );
  }

  doIt(task, bytecodePatcher) {
    // Simulate doIt

    // This relies on the definitions of class
    // variables: 'name parentClass methods size variables '
    // and method
    // variables: 'name byteCodes literals stackSize temporarySize class text '
    const TrueClass = this.interpreter.trueObject.objClass;
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
    // Make the Smalltalk string object on which doIt will be called
    const taskByteArray = new SmallByteArray(StringClass, 0);
    taskByteArray.values = new TextEncoder().encode(task);
    const args = new SmallObject(this.interpreter.ArrayClass, 1);
    args.data[0] = taskByteArray; // This is basically "self" for doIt
    const ctx = this.interpreter.buildContext(
      this.interpreter.nilObject,
      args,
      doItMethod,
    );
    return this.interpreter.execute(ctx);
  }

  printIt(task) {
    return this.doIt(task + " printString").toString();
  }
}
