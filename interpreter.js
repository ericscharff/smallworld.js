import { SmallObject } from "./objects.js";

export class Interpreter {
  constructor(
    nilObject,
    trueObject,
    falseObject,
    smallInts,
    ArrayClass,
    BlockClass,
    ContextClass,
    IntegerClass,
  ) {
    this.nilObject = nilObject;
    this.trueObject = trueObject;
    this.falseObject = falseObject;
    this.smallInts = smallInts;
    this.ArrayClass = ArrayClass;
    this.BlockClass = BlockClass;
    this.ContextClass = ContextClass;
    this.IntegerClass = IntegerClass;
  }

  buildContext(oldContext, args, method) {
    const context = new SmallObject(this.ContextClass, 7);
    // The context object as defined in Smallworld has the following instance variables:
    // method          - method being executed
    // arguments       - arguments to the methood
    // temporaries     - temporary variables in the method
    // stack           - working stack for invoking that method
    // bytePointer     - pointer into the method's bytecode
    // stackTop        - top of the working stack
    // previousContext - parent context
    context.data[0] = method;
    context.data[1] = args;
    // allocate temporaries
    let max = method.data[4].value; // method.data[4] is a SmallInt
    if (max > 0) {
      context.data[2] = new SmallObject(this.ArrayClass, max);
      while (max > 0)
        // iniailize to nil
        context.data[2].data[--max] = this.nilObject;
    }
    // allocate stack
    max = method.data[3].value;
    context.data[3] = new SmallObject(this.ArrayClass, max);
    context.data[4] = this.smallInts[0]; // byte pointer
    context.data[5] = this.smallInts[0]; // stacktop
    context.data[6] = oldContext;
    return context;
  }
}
