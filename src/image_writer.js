import { SmallObject, SmallByteArray, SmallInt } from "./objects.js";

// Convenience for writing big endian numbers to a Uint8Array
class DataStream {
  constructor(arr) {
    this.content = arr;
    this.pos = 0;
  }

  // Write a 4 byte big endian integer;
  writeInt(val) {
    this.content[this.pos++] = (val >> 24) & 0xff;
    this.content[this.pos++] = (val >> 16) & 0xff;
    this.content[this.pos++] = (val >> 8) & 0xff;
    this.content[this.pos++] = val & 0xff;
  }

  writeByte(val) {
    this.content[this.pos++] = val;
  }

  writeJsNumber(val) {
    const str = val.toString();
    this.writeByte(str.length);
    for (let i = 0; i < str.length; i++) {
      this.writeByte(str.charCodeAt(i));
    }
  }
}

// Write objects to a binary stream
export class ImageWriter {
  constructor(arrayClass) {
    this.arrayClass = arrayClass;
    this.stringClass = arrayClass?.data[0].objClass;

    // allObjects hold everything that needs to be written. These are
    // the SmallObjects themselves.
    this.allObjects = [];

    // hashToIndex is a map whose keys are object hash codes and whose
    // values are indices into the allObjects array. This relies on the
    // fact that every SmallObject has a unique hashCode
    this.hashToIndex = new Map();

    // valueToIndex is a map whose keys are JS values (either strings or
    // integers representing String and SmallInt respectively), and whose
    // values are indices into the allObjects array. This is used so that
    // there is only one copy of each string or integer in the image.
    this.valueToIndex = new Map();

    // indexOfEmptyArray is the index of a special object, an array whose
    // size is 0 (the empty array). This ensures there is only one of them
    // in the written image.
    this.indexOfEmptyArray = -1;

    // Roots store the calls to writeObject so they can be recalled in
    // a specific order. The elements are SmallObjects.
    this.roots = [];

    this.objectIndex = 0;

    // Precompute size for the array. Initial size is
    // 4 bytes (SWST) + 4 bytes (version #) + 4 bytes (object count)
    this.arraySize = 12;
  }

  dumpToText() {
    const idx = (o) => this.hashToIndex.get(o.hashCode());
    this.allObjects.forEach((o) => {
      let textual = "";
      textual += `Object ${idx(o)} class: ${o.objClass.data[0].toString()} `;
      textual += `dataLength: ${o.data.length} [`;
      textual += o.data.map((d) => idx(d)).join(", ");
      textual += "]";
      if (o.isSmallInt()) {
        textual += ` value: ${o.value}`;
      }
      if (o.objClass === this.stringClass) {
        textual += ` value: ${JSON.stringify(o.toString())}`;
      }
      console.log(textual);
    });
  }

  finish() {
    const arr = new Uint8Array(this.arraySize);
    const stream = new DataStream(arr);
    stream.writeInt(0x53575354); // 'SWST'
    stream.writeInt(0); // version 0
    stream.writeInt(this.objectIndex); // object count
    // First, write the object types
    // 0 = SmallObject, 1 = SmallInt, 2 = SmallByteArray
    for (const o of this.allObjects) {
      if (o.isSmallJsObject() && o.isNumber()) {
        stream.writeByte(3);
      } else if (o.isSmallByteArray()) {
        stream.writeByte(2);
      } else if (o.isSmallInt()) {
        stream.writeByte(1);
      } else {
        stream.writeByte(0);
      }
    }
    // Then, write entries
    for (const o of this.allObjects) {
      // Reference to class
      stream.writeInt(this.hashToIndex.get(o.objClass.hashCode()));
      // Instance variable count and instance variable refs
      stream.writeInt(o.data.length);
      for (const child of o.data) {
        stream.writeInt(this.hashToIndex.get(child.hashCode()));
      }
      // Type specific data
      if (o.isSmallInt()) {
        stream.writeInt(o.value);
      }
      if (o.isSmallByteArray()) {
        stream.writeInt(o.values.length);
        for (const v of o.values) {
          stream.writeByte(v);
        }
      }
      if (o.isSmallJsObject() && o.isNumber()) {
        stream.writeJsNumber(o.nativeObject);
      }
    }
    // Write the (special case) count of small integers
    stream.writeInt(this.smallIntCount);
    // Finally, write out index of the roots, so they can be streamed back in
    for (const r of this.roots) {
      stream.writeInt(this.hashToIndex.get(r.hashCode()));
    }
    return arr;
  }

  recordObjectData(obj) {
    if (obj.isSmallJsObject() && !obj.isNumber()) {
      throw new Error("SmallJsObject can not be serialized");
    }
    if (!this.hashToIndex.has(obj.hashCode())) {
      if (obj.objClass === this.arrayClass && obj.data.length === 0) {
        if (this.indexOfEmptyArray >= 0) {
          // re-use the existing empty array, and don't serialize this one
          this.hashToIndex.set(obj.hashCode(), this.indexOfEmptyArray);
          return;
        } else {
          // this version will be the singleton
          this.indexOfEmptyArray = this.objectIndex;
        }
      }
      if (obj.isSmallInt()) {
        if (this.valueToIndex.has(obj.value)) {
          // re-use the existing SmallInt
          this.hashToIndex.set(
            obj.hashCode(),
            this.valueToIndex.get(obj.value),
          );
          return;
        } else {
          this.valueToIndex.set(obj.value, this.objectIndex);
        }
      }
      if (obj.objClass === this.stringClass) {
        if (this.valueToIndex.has(obj.toString())) {
          // re-use the existing String
          this.hashToIndex.set(
            obj.hashCode(),
            this.valueToIndex.get(obj.toString()),
          );
          return;
        } else {
          this.valueToIndex.set(obj.toString(), this.objectIndex);
        }
      }
      this.hashToIndex.set(obj.hashCode(), this.objectIndex);
      // All objects are 1 byte (pool type) + 4 bytes (class index) +
      // 4 bytes (instance variable count)
      this.arraySize += 9;
      this.allObjects.push(obj);
      this.objectIndex++;
      this.recordObjectData(obj.objClass);
      this.arraySize += 4 * obj.data.length;
      for (const child of obj.data) {
        this.recordObjectData(child);
      }
      if (obj.isSmallInt()) {
        this.arraySize += 4;
      }
      if (obj.isSmallByteArray()) {
        this.arraySize += 4 + obj.values.length;
      }
    }
  }

  writeObject(obj) {
    this.recordObjectData(obj);
    this.roots.push(obj);
    this.arraySize += 4;
  }

  writeSmallInts(ints) {
    this.arraySize += 4;
    this.smallIntCount = ints.length;
    for (const i of ints) {
      this.writeObject(i);
    }
  }
}
