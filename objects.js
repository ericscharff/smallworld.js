// The base class of SmallWorld Smalltalk objects
export class SmallObject {
  constructor() {
    this.objClass = null; // The smalltalk class object
    this.data = []; // The object;s instance variables
  }
}

// An object with an array of bytes, often used for strings
export class SmallByteArray extends SmallObject {
  constructor(size) {
    super();
    this.values = new Uint8Array(size);
  }
}

// An integer. The value is coerced to an int upon construction
export class SmallInt extends SmallObject {
  constructor(integerClass, v) {
    super();
    this.objClass = integerClass;
    this.value = v | 0;
  }
}
