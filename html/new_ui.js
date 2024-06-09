import { SmallByteArray, SmallJsObject } from "../src/objects.js";

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
      default:
        throw new Error("Bad UI " + high);
    }
    return [returnedValue, stack, stackTop];
  }
}
