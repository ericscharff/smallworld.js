// The base class of SmallWorld Smalltalk objects
export class SmallObject {
  constructor(objClass, instanceVarCount) {
    this.objClass = objClass; // The smalltalk class object
    if (instanceVarCount) {
      this.data = new Array(instanceVarCount);
    } else {
      this.data = []; // The object;s instance variables
    }
  }

  isSmallByteArray() {
    return false;
  }

  isSmallInt() {
    return false;
  }
}

// An object with an array of bytes, often used for strings
export class SmallByteArray extends SmallObject {
  constructor(byteArrayClass, size) {
    super();
    this.objClass = byteArrayClass;
    this.values = new Uint8Array(size);
  }

  isSmallByteArray() {
    return true;
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
}
