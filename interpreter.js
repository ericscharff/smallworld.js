import { ImageWriter } from "./image_writer.js";
import {
  SmallByteArray,
  SmallInt,
  SmallJsObject,
  SmallObject,
} from "./objects.js";

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
    // arguments       - arguments to the method
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
        // initialize to nil
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
    //console.log("method lookup " + name);
    if (name.length === 0) throw new Error("bad");
    let cls = null;
    for (cls = receiver; cls !== this.nilObject; cls = cls.data[1]) {
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
      // const debug = false;
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
      let runEndOfOuterLoop = false;

      // innerLoop:
      while (innerLoopRunning) {
        let high = code[bytePointer++];
        let low = high & 0x0f;
        high = (high >>= 4) & 0x0f;
        if (high === 0) {
          high = low;
          // convert to positive int
          low = code[bytePointer++] & 0x0ff;
        }
        switch (high) {
          case 1: // PushInstance
            if (args === null) {
              args = contextData[1];
            }
            if (instanceVariables === null) {
              instanceVariables = args.data[0].data;
            }
            stack[stackTop++] = instanceVariables[low];
            break;
          case 2: // PushArgument
            if (args === null) {
              args = contextData[1];
            }
            stack[stackTop++] = args.data[low];
            break;
          case 3: // PushTemporary
            if (temporaries === null) {
              temporaries = contextData[2].data;
            }
            stack[stackTop++] = temporaries[low];
            break;
          case 4: // PushLiteral
            if (literals === null) {
              literals = method.data[2].data;
            }
            stack[stackTop++] = literals[low];
            break;
          case 5: // PushConstant
            switch (low) {
              case 0:
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
              case 6:
              case 7:
              case 8:
              case 9:
                // All the SmallIntegers from [0..9] will return cached objects
                stack[stackTop++] = this.newInteger(low);
                break;
              case 10:
                stack[stackTop++] = this.nilObject;
                break;
              case 11:
                stack[stackTop++] = this.trueObject;
                break;
              case 12:
                stack[stackTop++] = this.falseObject;
                break;
              default:
                throw new Error("Unknown constant " + low);
            }
            break;
          case 6: // AssignInstance
            if (args === null) {
              args = contextData[1];
            }
            if (instanceVariables === null) {
              instanceVariables = args.data[0].data;
            }
            // leave result on stack
            instanceVariables[low] = stack[stackTop - 1];
            break;
          case 7: // AssignTemporary
            if (temporaries === null) {
              temporaries = contextData[2].data;
            }
            temporaries[low] = stack[stackTop - 1];
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
            if (literals === null) {
              literals = method.data[2].data;
            }
            returnedValue = literals[low]; // message selector
            // System.out.println("Sending " + returnedValue);
            // System.out.println("Arguments " + arguments);
            // System.out.println("Arguments receiver " + arguments.data[0]);
            // System.out.println("Arguments class " + arguments.data[0].objClass);
            high =
              (args.data[0].objClass.hashCode() + returnedValue.hashCode()) %
              197;
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
          case 10: // SendUnary
            if (low === 0) {
              // isNil
              const arg = stack[--stackTop];
              stack[stackTop++] =
                arg === this.nilObject ? this.trueObject : this.falseObject;
            } else if (low === 1) {
              // notNil
              const arg = stack[--stackTop];
              stack[stackTop++] =
                arg !== this.nilObject ? this.trueObject : this.falseObject;
            } else {
              throw new Error("Illegal SendUnary " + low);
            }
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
                  if (li !== i + j) {
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
          case 12: // PushBlock
            // low is argument location
            // next byte is goto value
            high = code[bytePointer++] & 0x0ff;
            returnedValue = new SmallObject(this.BlockClass, 10);
            tempa = returnedValue.data;
            tempa[0] = contextData[0]; // share method
            tempa[1] = contextData[1]; // share arguments
            tempa[2] = contextData[2]; // share temporaries
            tempa[3] = contextData[3]; // stack (later replaced)
            tempa[4] = this.newInteger(bytePointer); // current byte pointer
            tempa[5] = this.newInteger(0); // stacktop
            tempa[6] = contextData[6]; // previous context
            tempa[7] = this.newInteger(low); // argument location
            tempa[8] = context; // creating context
            tempa[9] = this.newInteger(bytePointer); // current byte pointer
            stack[stackTop++] = returnedValue;
            bytePointer = high;
            break;
          case 13: // DoPrimitive, low is arg count, next byte is number
            high = code[bytePointer++] & 0x0ff;
            switch (high) {
              case 1: // object identity
                returnedValue = stack[--stackTop];
                if (returnedValue === stack[--stackTop]) {
                  returnedValue = this.trueObject;
                } else {
                  returnedValue = this.falseObject;
                }
                break;
              case 2: // object class
                returnedValue = stack[--stackTop].objClass;
                break;
              case 4: // object size
                returnedValue = stack[--stackTop];
                if (returnedValue.isSmallByteArray()) {
                  low = returnedValue.values.length;
                } else {
                  low = returnedValue.data.length;
                }
                returnedValue = this.newInteger(low);
                break;
              case 5: // object at put
                low = stack[--stackTop].value;
                returnedValue = stack[--stackTop];
                returnedValue.data[low - 1] = stack[--stackTop];
                break;
              case 6: // new context execute
                returnedValue = this.execute(stack[--stackTop]);
                break;
              case 7: // new object allocation
                low = stack[--stackTop].value;
                returnedValue = new SmallObject(stack[--stackTop], low);
                while (low > 0) returnedValue.data[--low] = this.nilObject;
                break;
              case 8:
                // block invocation
                returnedValue = stack[--stackTop]; // the block
                high = returnedValue.data[7].value; // arg location
                low -= 2;
                if (low >= 0) {
                  temporaries = returnedValue.data[2].data;
                  while (low >= 0) {
                    temporaries[high + low--] = stack[--stackTop];
                  }
                }
                contextData[5] = this.newInteger(stackTop);
                contextData[4] = this.newInteger(bytePointer);
                const newContext = new SmallObject(this.ContextClass, 10);
                for (let i = 0; i < 10; i++)
                  newContext.data[i] = returnedValue.data[i];
                newContext.data[6] = contextData[6];
                newContext.data[5] = this.newInteger(0); // stack top
                newContext.data[4] = returnedValue.data[9]; // starting addr
                low = newContext.data[3].data.length; // stack size
                newContext.data[3] = new SmallObject(this.ArrayClass, low); // new stack
                context = newContext;
                contextData = context.data;
                innerLoopRunning = false;
                break;
              case 11: // small integer quotient
                low = stack[--stackTop].value;
                high = stack[--stackTop].value;
                high /= low;
                returnedValue = this.newInteger(high);
                break;
              case 12: // small integer remainder
                low = stack[--stackTop].value;
                high = stack[--stackTop].value;
                high %= low;
                returnedValue = this.newInteger(high);
                break;
              case 14: // small int equality
                low = stack[--stackTop].value;
                high = stack[--stackTop].value;
                returnedValue =
                  low === high ? this.trueObject : this.falseObject;
                break;
              case 15:
                // small integer multiplication
                low = stack[--stackTop].value;
                high = stack[--stackTop].value;
                const lmult = high * low; // full precision
                high = (high * low) | 0; // int32 precision
                if (lmult === high) {
                  returnedValue = this.newInteger(high);
                } else {
                  returnedValue = this.nilObject;
                }
                break;
              case 16:
                // small integer subtraction
                low = stack[--stackTop].value;
                high = stack[--stackTop].value;
                const lsub = high - low; // full precision
                high = (high - low) | 0; // int32 precision
                if (lsub === high) {
                  returnedValue = this.newInteger(high);
                } else {
                  returnedValue = this.nilObject;
                }
                break;
              case 20: // byte array allocation
                low = stack[--stackTop].value;
                returnedValue = new SmallByteArray(stack[--stackTop], low);
                break;
              case 21: // string at
                low = stack[--stackTop].value;
                returnedValue = stack[--stackTop];
                const baa = returnedValue;
                low = baa.values[low - 1] & 0x0ff;
                returnedValue = this.newInteger(low);
                break;
              case 22: // string at put
                low = stack[--stackTop].value;
                const ba = stack[--stackTop];
                high = stack[--stackTop].value;
                ba.values[low - 1] = high;
                returnedValue = ba;
                break;
              case 24:
                // string append
                const appendA = stack[--stackTop];
                const appendB = stack[--stackTop];
                low = appendA.values.length + appendB.values.length;
                const n = new SmallByteArray(appendA.objClass, low);
                high = 0;
                for (let i = 0; i < appendA.values.length; i++)
                  n.values[high++] = appendA.values[i];
                for (let i = 0; i < appendB.values.length; i++)
                  n.values[high++] = appendB.values[i];
                returnedValue = n;
                break;
              case 26:
                // string compare
                const a = stack[--stackTop];
                const b = stack[--stackTop];
                low = a.values.length;
                high = b.values.length;
                let s = low < high ? low : high;
                let r = 0;
                for (let i = 0; i < s; i++)
                  if (a.values[i] < b.values[i]) {
                    r = 1;
                    break;
                  } else if (b.values[i] < a.values[i]) {
                    r = -1;
                    break;
                  }
                if (r === 0) {
                  if (low < high) {
                    r = 1;
                  } else if (low > high) {
                    r = -1;
                  }
                }
                returnedValue = this.newInteger(r);
                break;
              case 29: // save image
                returnedValue = stack[--stackTop];
                const imageFileName = returnedValue.toString();
                if (this.imageSaveCallback) {
                  const writer = new ImageWriter();
                  writer.writeObject(this.nilObject);
                  writer.writeObject(this.trueObject);
                  writer.writeObject(this.falseObject);
                  writer.writeSmallInts(this.smallInts);
                  writer.writeObject(this.ArrayClass);
                  writer.writeObject(this.BlockClass);
                  writer.writeObject(this.ContextClass);
                  writer.writeObject(this.IntegerClass);
                  this.imageSaveCallback(imageFileName, writer.finish());
                }
                break;
              case 30: // array at
                low = stack[--stackTop].value;
                returnedValue = stack[--stackTop];
                returnedValue = returnedValue.data[low - 1];
                break;
              case 31:
                // array with: (add new item)
                const oldArr = stack[--stackTop];
                low = oldArr.data.length;
                returnedValue = new SmallObject(oldArr.objClass, low + 1);
                for (let i = 0; i < low; i++)
                  returnedValue.data[i] = oldArr.data[i];
                returnedValue.data[low] = stack[--stackTop];
                break;
              case 34: // halt the interpreter
                return this.nilObject;
              case 35: // return current context
                returnedValue = context;
                break;
              case 36: // fast array creation
                returnedValue = new SmallObject(this.ArrayClass, low);
                for (let i = low - 1; i >= 0; i--)
                  returnedValue.data[i] = stack[--stackTop];
                break;
              case 50: // convert SmallInt into float
                low = stack[--stackTop].value;
                returnedValue = new SmallJsObject(stack[--stackTop], low);
                break;
              case 51: // float addition
                const aa = stack[--stackTop].nativeObject;
                const ab = stack[--stackTop].nativeObject;
                returnedValue = new SmallJsObject(stack[--stackTop], aa + ab);
                break;
              case 52: // float subtraction
                const sa = stack[--stackTop].nativeObject;
                const sb = stack[--stackTop].nativeObject;
                returnedValue = new SmallJsObject(stack[--stackTop], sa - sb);
                break;
              case 53: // float multiplication
                const ma = stack[--stackTop].nativeObject;
                const mb = stack[--stackTop].nativeObject;
                returnedValue = new SmallJsObject(stack[--stackTop], ma * mb);
                break;
              case 54: // float multiplication
                const da = stack[--stackTop].nativeObject;
                const db = stack[--stackTop].nativeObject;
                returnedValue = new SmallJsObject(stack[--stackTop], da / db);
                break;
              case 55: // float less than
                const lta = stack[--stackTop].nativeObject;
                const ltb = stack[--stackTop].nativeObject;
                returnedValue = lta < ltb ? this.trueObject : this.falseObject;
                break;
              case 56: // float equality
                const ea = stack[--stackTop].nativeObject;
                const eb = stack[--stackTop].nativeObject;
                returnedValue = ea === eb ? this.trueObject : this.falseObject;
                break;
              case 57: // float as int
                const fv = stack[--stackTop].nativeObject;
                returnedValue = this.newInteger(fv);
                break;
              case 58: // random float
                returnedValue = new SmallJsObject(
                  stack[--stackTop],
                  Math.random(),
                );
                break;
              case 59: // float as string
                const dStr = "" + stack[--stackTop].nativeObject;
                returnedValue = new SmallByteArray(stack[--stackTop], dStr);
                break;
              default:
                if (this.uiHandler && high >= 60 && high <= 84) {
                  [returnedValue, stack, stackTop] = this.uiHandler.handle(
                    this,
                    high,
                    stack,
                    stackTop,
                  );
                } else {
                  throw new Error("Unknown Primitive " + high);
                }
            }
            stack[stackTop++] = returnedValue;
            break;
          case 14: // PushClassVariable
            if (args === null) {
              args = contextData[1];
            }
            if (instanceVariables === null) {
              instanceVariables = args.data[0].data;
            }
            stack[stackTop++] = args.data[0].objClass.data[low + 5];
            break;
          case 15: // DoSpecial
            switch (low) {
              case 1: // self return
                if (args === null) {
                  args = contextData[1];
                }
                returnedValue = args.data[0];
                context = contextData[6]; // previous context
                innerLoopRunning = false;
                runEndOfOuterLoop = true;
                break;
              case 2: // stack return
                returnedValue = stack[--stackTop];
                context = contextData[6]; // previous context
                innerLoopRunning = false;
                runEndOfOuterLoop = true;
                break;
              case 3: // block return
                returnedValue = stack[--stackTop];
                context = contextData[8]; // creating context in block
                context = context.data[6]; // previous context
                innerLoopRunning = false;
                runEndOfOuterLoop = true;
                break;
              case 5: // pop top
                stackTop--;
                break;
              case 6: // branch
                low = code[bytePointer++] & 0x0ff;
                bytePointer = low;
                break;
              case 7: // branch if true
                low = code[bytePointer++] & 0x0ff;
                returnedValue = stack[--stackTop];
                if (returnedValue === this.trueObject) {
                  bytePointer = low;
                }
                break;
              case 8: // branch if false
                low = code[bytePointer++] & 0x0ff;
                returnedValue = stack[--stackTop];
                if (returnedValue === this.falseObject) {
                  bytePointer = low;
                }
                break;
              case 11: // send to super
                low = code[bytePointer++] & 0x0ff;
                // message selector
                // save old context
                args = stack[--stackTop];
                contextData[5] = this.newInteger(stackTop);
                contextData[4] = this.newInteger(bytePointer);
                // now build new context
                if (literals === null) {
                  literals = method.data[2].data;
                }
                // this was copied from the Java code, but it
                // appears to be unreachable
                // if (method === null) {
                //   method = context.data[0];
                // }
                method = method.data[5]; // class in method
                method = method.data[1]; // parent in class
                method = this.methodLookup(
                  method,
                  literals[low],
                  context,
                  args,
                );
                context = this.buildContext(context, args, method);
                contextData = context.data;
                // load information from context
                innerLoopRunning = false;
                break;
              default: // throw exception
                throw new Error("Unrecognized DoSpecial " + low);
            }
            break;
          default:
            throw new Error("Unknown opcode " + high);
        }
      } // end of inner loop

      if (runEndOfOuterLoop) {
        if (context === null || context === this.nilObject) {
          // if (debug) {
          //  console.log("lookups " + lookup + " cached " + cached);
          // }
          return returnedValue;
        }
        contextData = context.data;
        stack = contextData[3].data;
        stackTop = contextData[5].value;
        stack[stackTop++] = returnedValue;
        contextData[5] = this.newInteger(stackTop);
      }
    } // end of outer loop
  }

  runAction(action) {
    // Make a context for the action (block) provided
    const block = new SmallObject(this.ContextClass, 10);
    for (let i = 0; i < 10; i++) {
      block.data[i] = action.data[i];
    }

    // now run it
    const stackSize = block.data[3].data.length;
    block.data[3] = new SmallObject(this.ArrayClass, stackSize); // new stack
    block.data[4] = block.data[9]; // bytePointer from Block
    block.data[5] = this.newInteger(0); // new stack top
    block.data[6] = this.nilObject; // callback, so no previousContext
    this.execute(block);
  }

  runActionWithIndex(action, index) {
    // Make a context for the action (block) provided
    const block = new SmallObject(this.ContextClass, 10);
    for (let i = 0; i < 10; i++) {
      block.data[i] = action.data[i];
    }
    const argLoc = block.data[7].value; // Block's argumentLocaition
    block.data[2].data[argLoc] = this.newInteger(index);

    // now run it
    const stackSize = block.data[3].data.length;
    block.data[3] = new SmallObject(this.ArrayClass, stackSize); // new stack
    block.data[4] = block.data[9]; // bytePointer from Block
    block.data[5] = this.newInteger(0); // new stack top
    block.data[6] = this.nilObject; // callback, so no previousContext
    this.execute(block);
  }
}
