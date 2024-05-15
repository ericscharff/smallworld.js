import { SmallByteArray, SmallInt, SmallObject } from "./objects.js";

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

  methodLookup(receiver, messageSelector, context, args) {
    const name = messageSelector.toString();
    console.log("method lookup " + name);
    if (name.length === 0) throw new Error("bad");
    let cls = null;
    for (cls = receiver; cls != this.nilObject; cls = cls.data[1]) {
      const dict = cls.data[2]; // dictionary in class
      for (let i = 0; i < dict.data.length; i++) {
        const aMethod = dict.data[i];
        if (name.toString() === aMethod.data[0].toString()) {
          return aMethod;
        }
      }
    }
    // try once to handle method in Smalltalk before giving up
    if (name.toString() === "error:") {
      throw new Error("Unrecognized message selector: " + messageSelector);
    }
    const newArgs = new Array(2);
    newArgs[0] = args.data[0]; // same receiver
    newArgs[1] = new SmallByteArray(
      messageSelector.objClass,
      "Unrecognized message selector: " + name,
    );
    args.data = newArgs;
    return this.methodLookup(
      receiver,
      new SmallByteArray(messageSelector.objClass, "error:"),
      context,
      args,
    );
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

  execute(context) {
    const selectorCache = new Array(197);
    const classCache = new Array(197);
    const methodCache = new Array(197);
    let lookup = 0;
    let cached = 0;

    let contextData = context.data;
    // outerLoop:
    while (true) {
      const debug = false;
      let method = contextData[0]; // method in context
      const code = method.data[1].values; // code pointer
      let bytePointer = contextData[4].value;
      let stack = contextData[3].data;
      let stackTop = contextData[5].value;
      let returnedValue = null;
      let tempa;

      // everything else can be null for now
      let temporaries = null;
      let instanceVariables = null;
      let args = null;
      let literals = null;
      let innerLoopRunning = true;

      // innerLoop:
      while (innerLoopRunning) {
        let high = code[bytePointer++];
        let low = high & 0x0f;
        high = (high >>= 4) & 0x0f;
        if (high == 0) {
          high = low;
          // convert to positive int
          low = code[bytePointer++] & 0x0ff;
        }
        switch (high) {
          case 2: // PushArgument
            if (args === null) {
              args = contextData[1];
            }
            stack[stackTop++] = args.data[low];
            break;
          case 4: // PushLiteral
            if (literals === null) {
              literals = method.data[2].data;
            }
            stack[stackTop++] = literals[low];
            break;
          case 8: // MarkArguments
            const newArguments = new SmallObject(this.ArrayClass, low);
            tempa = newArguments.data; // direct access to array
            while (low > 0) tempa[--low] = stack[--stackTop];
            stack[stackTop++] = newArguments;
            break;
          case 9: // SendMessage
            // save old context
            args = stack[--stackTop];
            contextData[5] = this.newInteger(stackTop);
            contextData[4] = this.newInteger(bytePointer);
            // now build new context
            if (literals == null) {
              literals = method.data[2].data;
            }
            returnedValue = literals[low]; // message selector
            // System.out.println("Sending " + returnedValue);
            // System.out.println("Arguments " + arguments);
            // System.out.println("Arguments receiver " + arguments.data[0]);
            // System.out.println("Arguments class " + arguments.data[0].objClass);
            high =
              Math.abs(
                args.data[0].objClass.hashCode() + returnedValue.hashCode(),
              ) % 197;
            if (
              selectorCache[high] !== null &&
              selectorCache[high] === returnedValue &&
              classCache[high] === args.data[0].objClass
            ) {
              method = methodCache[high];
              cached++;
            } else {
              method = this.methodLookup(
                args.data[0].objClass,
                literals[low],
                context,
                args,
              );
              lookup++;
              selectorCache[high] = returnedValue;
              classCache[high] = args.data[0].objClass;
              methodCache[high] = method;
            }
            context = this.buildContext(context, args, method);
            contextData = context.data;
            // load information from context
            innerLoopRunning = false;
            break;
          case 11: // SendBinary
            if (
              stack[stackTop - 1].isSmallInt() &&
              stack[stackTop - 2].isSmallInt()
            ) {
              // Optimized integer special cases
              const j = stack[--stackTop].value;
              const i = stack[--stackTop].value;
              let done = true;
              switch (low) {
                case 0: // <
                  returnedValue = i < j ? this.trueObject : this.falseObject;
                  break;
                case 1: // <=
                  returnedValue = i <= j ? this.trueObject : this.falseObject;
                  break;
                case 2: // +
                  const li = (i + j) | 0; // Correct for 32 bit overflow
                  if (li != i + j) {
                    done = false; // overflow
                  }
                  returnedValue = this.newInteger(i + j);
                  break;
              }
              if (done) {
                stack[stackTop++] = returnedValue;
                break;
              } else {
                stackTop += 2; // overflow, send message
              }
            }
            // non optimized binary message
            args = new SmallObject(this.ArrayClass, 2);
            args.data[1] = stack[--stackTop];
            args.data[0] = stack[--stackTop];
            contextData[5] = this.newInteger(stackTop);
            contextData[4] = this.newInteger(bytePointer);
            let msg = null;
            switch (low) {
              case 0:
                msg = new SmallByteArray(null, "<");
                break;
              case 1:
                msg = new SmallByteArray(null, "<=");
                break;
              case 2:
                msg = new SmallByteArray(null, "+");
                break;
            }
            method = this.methodLookup(
              args.data[0].objClass,
              msg,
              context,
              args,
            );
            context = this.buildContext(context, args, method);
            contextData = context.data;
            innerLoopRunning = false;
            break;
          default:
            throw new Error("Unknown opcode " + high);
        }
      }
    }
  }
}
