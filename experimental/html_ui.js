import { SmallByteArray, SmallJsObject } from "../src/objects.js";

// Maps Canvas DOM elements to their CanvasRenderingContext2d for drawing
const canvasToContext = new WeakMap();

// Converts a Smalltalk SmallInt or Float to a JavaScript number
function stToNumber(stObj) {
  if (stObj.isSmallInt()) {
    return stObj.value;
  } else {
    return stObj.nativeObject;
  }
}

// Convert a Smalltalk String to a JavaScript String
function stToString(stObj) {
  return stObj.toString();
}

function handleCanvas(ctx, stack, stackTop) {
  const opcode = stToNumber(stack[--stackTop]);
  switch (opcode) {
    case 0: {
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.moveTo(x, y);
      break;
    }
    case 1: {
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.lineTo(x, y);
      break;
    }
    case 3:
      ctx.stroke();
      break;
    case 6:
      ctx.beginPath();
      break;
    case 19: {
      const x1 = stToNumber(stack[--stackTop]);
      const y1 = stToNumber(stack[--stackTop]);
      const x2 = stToNumber(stack[--stackTop]);
      const y2 = stToNumber(stack[--stackTop]);
      const r = stToNumber(stack[--stackTop]);
      ctx.arcTo(x1, y1, x2, y2, r);
      break;
    }
    default:
      throw new Error("Bad canvas opcode " + opcode);
  }
  return stackTop;
}

export class UiHandler {
  handle(interpreter, high, stack, stackTop) {
    let returnedValue = null;
    switch (high) {
      case 60: // get element by id
        const eltIdName = stack[--stackTop].toString();
        const elt = document.getElementById(eltIdName);
        if (elt) {
          returnedValue = new SmallJsObject(stack[--stackTop], elt);
        } else {
          returnedValue = interpreter.nilObject;
        }
        break;
      case 61: // create element with tagName
        const tagName = stack[--stackTop].toString();
        const newElt = document.createElement(tagName);
        if (tagName === "canvas") {
          const ctx = newElt.getContext("2d");
          canvasToContext.set(newElt, ctx);
        }
        returnedValue = new SmallJsObject(stack[--stackTop], newElt);
        break;
      case 62: // set element innerText
        const textToSet = stack[--stackTop].toString();
        const eltForText = stack[--stackTop];
        eltForText.nativeObject.innerText = textToSet;
        returnedValue = eltForText;
        break;
      case 63: // form element's value
        const eltForVal = stack[--stackTop];
        const eltVal = eltForVal.nativeObject.value;
        // String class is passed in to create the return type
        const stringClass = stack[--stackTop];
        returnedValue = new SmallByteArray(stringClass, eltVal);
        break;
      case 64: // set form element's value
        const valToSet = stack[--stackTop].toString();
        const eltForValSet = stack[--stackTop];
        eltForValSet.nativeObject.value = valToSet;
        returnedValue = eltForValSet;
        break;
      case 65: // add event listner with block
        const eventAction = stack[--stackTop];
        const eventName = stack[--stackTop].toString();
        const eventTarget = stack[--stackTop];
        eventTarget.nativeObject.addEventListener(eventName, () => {
          interpreter.runActionWithValue(eventAction, eventTarget);
        });
        returnedValue = eventTarget;
        break;
      case 66: // appendChild to element
        const childElement = stack[--stackTop].nativeObject;
        const parentStElement = stack[--stackTop];
        parentStElement.nativeObject.appendChild(childElement);
        returnedValue = parentStElement;
        break;
      case 67: // remove element from DOM
        stack[--stackTop].nativeObject.remove();
        returnedValue = interpreter.nilObject;
        break;
      case 68: // add class name to classList
        const clToAdd = stack[--stackTop].toString();
        const clAddEl = stack[--stackTop];
        clAddEl.nativeObject.classList.add(clToAdd);
        returnedValue = clAddEl;
        break;
      case 69: // remove class name to classList
        const clToDel = stack[--stackTop].toString();
        const clDelEl = stack[--stackTop];
        clDelEl.nativeObject.classList.remove(clToDel);
        returnedValue = clDelEl;
        break;
      case 70: // Canvas handler
        returnedValue = stack[--stackTop];
        const cnvsEl = returnedValue.nativeObject;
        stackTop = handleCanvas(canvasToContext.get(cnvsEl), stack, stackTop);
        break;
      default:
        throw new Error("Bad UI " + high);
    }
    return [returnedValue, stackTop];
  }
}
