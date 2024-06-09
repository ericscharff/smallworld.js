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
}

// Write objects to a binary stream
export class ImageWriter {
  constructor() {
    // allObjects hold everything that needs to be written. These are
    // the SmallObjects themselves.
    this.allObjects = [];

    // hashToIndex is a map whose keys are object hash codes and whose
    // values are indices into the allObjects array. This relies on the
    // fact that every SmallObject has a unique hashCode
    this.hashToIndex = new Map();

    // Roots store the calls to writeObject so they can be recalled in
    // a specific order. The elements are SmallObjects.
    this.roots = [];

    this.objectIndex = 0;

    // Precompute size for the array. Initial size is
    // 4 bytes (SWST) + 4 bytes (version #) + 4 bytes (object count)
    this.arraySize = 12;
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
      if (o.isSmallByteArray()) {
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
    if (obj.isSmallJsObject()) {
      throw new Error("SmallJsObject can not be serialized");
    }
    if (!this.hashToIndex.has(obj.hashCode())) {
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
