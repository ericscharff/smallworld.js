#!/usr/bin/env node

import fs from "fs";
import { parseArgs } from "node:util";
import readline from "readline";
import { SmallWorld } from "../src/smallworld.js";

const { values } = parseArgs({
  options: {
    image_name: { type: "string", short: "i", default: "../data/nogui.image" },
  },
});
const imageName = values.image_name;
console.log("Welcome to SmallWorld!");
console.log(`Reading image from ${imageName}`);
const buf = fs.readFileSync(imageName);
const smallWorld = new SmallWorld(buf, (name, buf) =>
  fs.writeFileSync(name, buf),
);

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
          .doIt(`${className} class compileMethod: '${methodBody}'`)
          .toString(),
      );
    } else {
      console.log(
        smallWorld
          .doIt(`${className} compileMethod: '${methodBody}'`)
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
    console.log("" + smallWorld.doIt(s));
    rl.prompt();
  }
});
