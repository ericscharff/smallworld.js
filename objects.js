// The base class of SmallWorld Smalltalk objects
export class SmallObject {
  constructor(objClass, instanceVarCount) {
    this.objClass = objClass; // The smalltalk class object
    if (instanceVarCount) {
      this.data = new Array(instanceVarCount);
    } else {
      this.data = []; // The object's instance variables
    }
  }

  isSmallByteArray() {
    return false;
  }

  isSmallInt() {
    return false;
  }

  toString() {
    return "A SmallObject";
  }
}

// An object with an array of bytes, often used for strings
export class SmallByteArray extends SmallObject {
  constructor(byteArrayClass, sizeOrString) {
    super();
    this.objClass = byteArrayClass;
    if (typeof sizeOrString === "number") {
      this.values = new Uint8Array(sizeOrString);
    } else {
      // size is actually a string
      this.values = new TextEncoder().encode(sizeOrString);
    }
  }

  isSmallByteArray() {
    return true;
  }

  toString() {
    // Hopefully this is a well formatted string
    return new TextDecoder().decode(this.values);
  }

  dump() {
    return this.values.reduce((s, elt) => s + elt.toString(16) + " ", "");
  }
}

// An integer. The value is coerced to an int upon construction
export class SmallInt extends SmallObject {
  constructor(integerClass, v) {
    super();
    this.objClass = integerClass;
    this.value = v | 0;
  }

  isSmallInt() {
    return true;
  }

  toString() {
    return `SmallInteger ${this.value}`;
  }
}
