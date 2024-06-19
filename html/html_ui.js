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
      // moveTo
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.moveTo(x, y);
      break;
    }
    case 1: {
      // lineTo
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.lineTo(x, y);
      break;
    }
    case 2: // fill
      ctx.fill();
      break;
    case 3: // stroke
      ctx.stroke();
      break;
    case 4: // fillStyle
      ctx.fillStyle = stToString(stack[--stackTop]);
      break;
    case 5: // strokeStyle
      ctx.strokeStyle = stToString(stack[--stackTop]);
      break;
    case 6: // beginPath
      ctx.beginPath();
      break;
    case 7: {
      // fillRect
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      const w = stToNumber(stack[--stackTop]);
      const h = stToNumber(stack[--stackTop]);
      ctx.fillRect(x, y, w, h);
      break;
    }
    case 8: {
      // strokeRect
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      const w = stToNumber(stack[--stackTop]);
      const h = stToNumber(stack[--stackTop]);
      ctx.strokeRect(x, y, w, h);
      break;
    }
    case 9: {
      // fillText
      const str = stToString(stack[--stackTop]);
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.fillText(str, x, y);
      break;
    }
    case 10: {
      // strokeText
      const str = stToString(stack[--stackTop]);
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.strokeText(str, x, y);
      break;
    }
    case 11: // font
      ctx.font = stToString(stack[--stackTop]);
      break;
    case 12: // lineWidth
      ctx.lineWidth = stToNumber(stack[--stackTop]);
      break;
    case 13: {
      // clearRect
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      const w = stToNumber(stack[--stackTop]);
      const h = stToNumber(stack[--stackTop]);
      ctx.clearRect(x, y, w, h);
      break;
    }
    case 14: // closePath
      ctx.closePath();
      break;
    case 15: {
      // arc
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      const r = stToNumber(stack[--stackTop]);
      const startAngle = stToNumber(stack[--stackTop]);
      const endAngle = stToNumber(stack[--stackTop]);
      ctx.arc(x, y, r, startAngle, endAngle);
      break;
    }
    case 16: {
      // ellipse
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      const rx = stToNumber(stack[--stackTop]);
      const ry = stToNumber(stack[--stackTop]);
      ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
      break;
    }
    case 17: {
      // quadraticCurveTo
      const cpx = stToNumber(stack[--stackTop]);
      const cpy = stToNumber(stack[--stackTop]);
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.quadraticCurveTo(cpx, cpy, x, y);
      break;
    }
    case 18: {
      // bezierCurveTo
      const cp1x = stToNumber(stack[--stackTop]);
      const cp1y = stToNumber(stack[--stackTop]);
      const cp2x = stToNumber(stack[--stackTop]);
      const cp2y = stToNumber(stack[--stackTop]);
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      break;
    }
    case 19: {
      // arcTo
      const x1 = stToNumber(stack[--stackTop]);
      const y1 = stToNumber(stack[--stackTop]);
      const x2 = stToNumber(stack[--stackTop]);
      const y2 = stToNumber(stack[--stackTop]);
      const r = stToNumber(stack[--stackTop]);
      ctx.arcTo(x1, y1, x2, y2, r);
      break;
    }
    case 20: {
      // rect
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      const w = stToNumber(stack[--stackTop]);
      const h = stToNumber(stack[--stackTop]);
      ctx.rect(x, y, w, h);
      break;
    }
    case 21: // save
      ctx.save();
      break;
    case 22: // restore
      ctx.restore();
      break;
    case 23: {
      // translate
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.translate(x, y);
      break;
    }
    case 24: {
      // rotate
      const a = stToNumber(stack[--stackTop]);
      ctx.rotate(a);
      break;
    }
    case 25: {
      // scale
      const x = stToNumber(stack[--stackTop]);
      const y = stToNumber(stack[--stackTop]);
      ctx.scale(x, y);
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
          newElt.width = 300;
          newElt.height = 200;
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
