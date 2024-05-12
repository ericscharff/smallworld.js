import { SmallInt, SmallObject } from "./objects.js";

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

    // method's instance variables are
    // name          - method name
    // byteCodes     - method bytecodes (implementation)
    // literals      - array of literals used in bytecodes
    // stackSize     - the needed stack depth (SmallInt)
    // temporarySize - number of temporaries (SmallInt)
    // class         - method's enclosing class
    // text          - String (method source code) '
    let max = method.data[4].value; // method.data[4] is a SmallInt (temporarySize)
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

  // create a new small integer
  newInteger(val) {
    val = val | 0; // Ensure the value really is an integer
    if (val >= 0 && val < 10) {
      return this.smallInts[val];
    } else {
      return new SmallInt(this.IntegerClass, val);
    }
  }
}
