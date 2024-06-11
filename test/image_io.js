import fs from "fs";
import { expect } from "chai";
import { ImageReader } from "../src/image_reader.js";
import { ImageWriter } from "../src/image_writer.js";
import { SmallJsObject } from "../src/objects.js";

describe("Image I/O", () => {
  describe("Image reading", () => {
    it("fails on bad magic number", () => {
      const buf = fs.readFileSync("data/base.image");
      buf[0] = 70;
      const reader = new ImageReader(buf);
      expect(() => reader.readObject()).to.throw("Bad magic number");
    });

    it("fails on bad version", () => {
      const buf = fs.readFileSync("data/base.image");
      buf[7] = 3; // LSB in version number, makes this v3
      const reader = new ImageReader(buf);
      expect(() => reader.readObject()).to.throw("Bad version number");
    });

    it("fails on bad object type", () => {
      const buf = fs.readFileSync("data/base.image");
      buf[100] = 10; // One of the entries in the object pool
      const reader = new ImageReader(buf);
      expect(() => reader.readObject()).to.throw("Unknown object type 10");
    });

    it("succeeds on valid image", () => {
      const buf = fs.readFileSync("data/base.image");
      const reader = new ImageReader(buf);
      const nilObject = reader.readObject();
      const trueObject = reader.readObject();
      const falseObject = reader.readObject();
      const smallInts = reader.readSmallInts();
      const ArrayClass = reader.readObject();
      const BlockClass = reader.readObject();
      const ContextClass = reader.readObject();
      const IntegerClass = reader.readObject();
      expect(smallInts[0].objClass).to.equal(IntegerClass);
      expect(smallInts[1].value).to.equal(1);
      expect(smallInts[2].toString()).to.equal("SmallInteger 2");
      expect(nilObject.toString()).to.contain("SmallObject");
      expect(nilObject.objClass.data[0].toString()).to.equal("Undefined");
    });
  });

  describe("Image writing", () => {
    it("writes a complete image", () => {
      const buf = fs.readFileSync("data/base.image");
      const reader = new ImageReader(buf);
      const nilObject = reader.readObject();
      const trueObject = reader.readObject();
      const falseObject = reader.readObject();
      const smallInts = reader.readSmallInts();
      const ArrayClass = reader.readObject();
      const BlockClass = reader.readObject();
      const ContextClass = reader.readObject();
      const IntegerClass = reader.readObject();

      const writer = new ImageWriter();
      writer.writeObject(nilObject);
      writer.writeObject(trueObject);
      writer.writeObject(falseObject);
      writer.writeSmallInts(smallInts);
      writer.writeObject(ArrayClass);
      writer.writeObject(BlockClass);
      writer.writeObject(ContextClass);
      writer.writeObject(IntegerClass);
      const arr = writer.finish();
      expect(arr).to.eql(buf);
    });

    it("fails to write native objects", () => {
      const writer = new ImageWriter();
      const nilObject = new SmallJsObject(null, 0);
      nilObject.objClass = nilObject;
      expect(() =>
        writer.writeObject(new SmallJsObject(nilObject, "str")),
      ).to.throw("SmallJsObject can not be serialized");
    });
  });
});
