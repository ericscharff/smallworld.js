#!/usr/bin/env node

import fs from "fs";
import readline from "readline";
import { SmallWorld } from "../src/smallworld.js";

const buf = fs.readFileSync("../data/image-nogui.data");
const smallWorld = new SmallWorld(buf);
smallWorld.interpreter.imageSaveCallback = (name, buf) =>
  fs.writeFileSync(name, buf);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "SmallWorld> ",
});

let methodBody = "";
let className = "";
let metaMethod = false;

rl.prompt();
rl.on("line", (s) => {
  if (s.startsWith("!")) {
    methodBody = methodBody.replaceAll("'", "''");
    methodBody = methodBody.trim();
    if (metaMethod) {
      console.log(
        smallWorld
          .runDoIt(`${className} class compileMethod: '${methodBody}'`)
          .toString(),
      );
    } else {
      console.log(
        smallWorld
          .runDoIt(`${className} compileMethod: '${methodBody}'`)
          .toString(),
      );
    }
    methodBody = "";
  } else if (s.startsWith("METHOD")) {
    className = s.split(/\s+/)[1];
    methodBody = " ";
    metaMethod = false;
  } else if (s.startsWith("META")) {
    className = s.split(/\s+/)[1];
    methodBody = " ";
    metaMethod = true;
  } else if (methodBody) {
    methodBody += "\n" + s;
  } else if (["bye", "exit", "shutdown", "quit"].includes(s)) {
    rl.close();
  } else if (!(s === "" || s.startsWith("#") || s.startsWith('"'))) {
    // Run oneliner
    console.log("" + smallWorld.runDoIt(s));
    rl.prompt();
  }
});
