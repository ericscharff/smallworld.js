import { ImageReader } from "./imagereader.js";
import { Interpreter } from "./interpreter.js";

fetch("image.data").then((resp) => {
  resp.arrayBuffer().then((buf) => {
    const reader = new ImageReader(buf);
    const nilObject = reader.readObject();
    const trueObject = reader.readObject();
    const falseObject = reader.readObject();
    const smallInts = reader.readSmallInts();
    const ArrayClass = reader.readObject();
    const BlockClass = reader.readObject();
    const ContextClass = reader.readObject();
    const IntegerClass = reader.readObject();
    console.log("image initialized");

    const interpreter = new Interpreter(
      nilObject,
      trueObject,
      falseObject,
      smallInts,
      ArrayClass,
      BlockClass,
      ContextClass,
      IntegerClass,
    );
    console.log(interpreter);
  });
});
console.log("Hello, world");
