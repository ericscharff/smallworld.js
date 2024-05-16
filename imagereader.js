import { SmallObject, SmallByteArray, SmallInt } from "./objects.js";

// Convenience for reading Ui
class DataStream {
  constructor(arr) {
    this.content = new Uint8Array(arr);
    this.pos = 0;
  }

  // Read a 4 byte big endian integer;
  readInt() {
    let val = this.content[this.pos++];
    val = (val << 8) + this.content[this.pos++];
    val = (val << 8) + this.content[this.pos++];
    val = (val << 8) + this.content[this.pos++];
    return val | 0; // This does two's complement conversion
  }

  readByte() {
    return this.content[this.pos++];
  }
}

// Read a binary image file into memory
export class ImageReader {
  constructor(arr) {
    this.stream = new DataStream(arr);
    this.objectPool = null;
  }

  readObjects() {
    if (this.stream.readInt() != 0x53575354) {
      throw new Error("Bad magic number");
    }
    if (this.stream.readInt() != 0) {
      throw new Error("Bad version number");
    }
    const objectCount = this.stream.readInt();
    this.objectPool = new Array(objectCount);
    // Read headers to construct placeholder objects
    for (let i = 0; i < objectCount; i++) {
      const objType = this.stream.readByte();
      switch (objType) {
        case 0:
          this.objectPool[i] = new SmallObject();
          break;
        case 1:
          this.objectPool[i] = new SmallInt(null, 0);
          break;
        case 2:
          this.objectPool[i] = new SmallByteArray(null, 0);
          break;
        default:
          throw new Error("Unknown object type " + objType);
      }
    }
    // Then fill in the objects
    for (let i = 0; i < objectCount; i++) {
      const obj = this.objectPool[i];
      obj.objClass = this.objectPool[this.stream.readInt()];
      const dataLength = Math.max(0, this.stream.readInt());
      obj.data = new Array(dataLength);
      for (let j = 0; j < dataLength; j++) {
        obj.data[j] = this.objectPool[this.stream.readInt()];
      }
      // Type specific data
      if (obj.isSmallInt()) {
        obj.value = this.stream.readInt();
      }
      if (obj.isSmallByteArray()) {
        const byteLength = this.stream.readInt();
        obj.values = new Uint8Array(byteLength);
        for (let j = 0; j < byteLength; j++) {
          obj.values[j] = this.stream.readByte();
        }
      }
    }
    this.smallIntCount = this.stream.readInt();
    // Stream now points at the first root
  }

  readObject() {
    if (this.objectPool === null) {
      this.readObjects();
    }
    // this.stream should now point to the index of a root object
    return this.objectPool[this.stream.readInt()];
  }

  readSmallInts() {
    const ints = new Array(this.smallIntCount);
    console.log("small ints: " + this.smallIntCount);
    for (let i = 0; i < this.smallIntCount; i++) {
      ints[i] = this.readObject();
    }
    return ints;
  }
}
