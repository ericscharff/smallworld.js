import fs from "fs";
import { expect } from "chai";
import sinon from "sinon";
import { SmallWorld } from "../src/smallworld.js";

describe("Interpreter", () => {
  let smallWorld = null;
  let interpreter = null;
  let nilObject = null;

  beforeEach(async () => {
    const buf = fs.readFileSync("data/image-nogui.data");
    smallWorld = new SmallWorld(buf);
    interpreter = smallWorld.interpreter;
    nilObject = interpreter.nilObject;
  });

  function runDoIt(task, bytecodePatcher) {
    return smallWorld.runDoIt(task, bytecodePatcher);
  }

  function runPrintIt(task) {
    return smallWorld.runPrintIt(task);
  }

  it("adds", () => {
    expect(runDoIt("3 + 2")).to.equal(interpreter.newInteger(5));
  });

  it("subtracts", () => {
    expect(runPrintIt("(100 - 75)")).to.equal("25");
  });

  it("multiplies", () => {
    expect(runPrintIt("(9 * 12)")).to.equal("108");
  });

  it("divides", () => {
    expect(runDoIt("75 quo: 5").value).to.equal(
      interpreter.newInteger(15).value,
    );
    expect(runDoIt("76 quo: 5").value).to.equal(
      interpreter.newInteger(15).value,
    );
  });

  it("remainder", () => {
    expect(runDoIt("75 rem: 5")).to.equal(interpreter.newInteger(0));
    expect(runDoIt("76 rem: 5")).to.equal(interpreter.newInteger(1));
  });

  it("fractions", () => {
    expect(runPrintIt("((1 / 3) + (3 / 4))")).to.equal("(13/12)");
  });

  it("adds large integers", () => {
    expect(runPrintIt("(2000000000 + 2000000000)")).to.equal("4000000000");
  });

  it("subtracts large integers", () => {
    expect(runPrintIt("(2000000000 negated - 2000000000)")).to.equal(
      "-4000000000",
    );
  });

  it("multiplies large integers", () => {
    expect(runPrintIt("(2000000000 * 2000000000)")).to.equal(
      "04000000000000000000",
    );
  });

  it("adds floating point numbers", () => {
    expect(runPrintIt("(1.2 + 1.2)")).to.equal("2.4");
  });

  it("subtracts floating point numbers", () => {
    expect(runPrintIt("(2.0 - 1.5)")).to.equal("0.5");
  });

  it("multiplies floating point numbers", () => {
    expect(runPrintIt("(1.4 * 1.2)")).to.equal("1.68");
  });

  it("compares floating point numbers", () => {
    expect(runPrintIt("(1.4 < 1.2)")).to.equal("false");
    expect(runPrintIt("(1.4 <= 1.2)")).to.equal("false");
    expect(runPrintIt("(1.4 = 1.2)")).to.equal("false");
    expect(runPrintIt("(1.4 = 1.4)")).to.equal("true");
    expect(runPrintIt("(1.4 > 1.2)")).to.equal("true");
    expect(runPrintIt("(1.4 >= 1.2)")).to.equal("true");
  });

  it("converts floats to integer", () => {
    expect(runDoIt("1.9 asInteger")).to.equal(interpreter.newInteger(1));
  });

  it("generates random floats", () => {
    sinon.stub(Math, "random").returns(0.25);
    expect(runPrintIt("Float random")).to.equal("0.25");
    // integer uses float's random too
    expect(runDoIt("10 random")).to.equal(interpreter.newInteger(2));
  });
  it("concatenates strings", () => {
    expect(runPrintIt("'abc' + 'def'")).to.equal("abcdef");
  });

  it("compares strings", () => {
    expect(runPrintIt("('abc' < 'def')")).to.equal("true");
    expect(runPrintIt("('abc' <= 'def')")).to.equal("true");
    expect(runPrintIt("('abc' = 'def')")).to.equal("false");
    expect(runPrintIt("('abc' = 'abcd')")).to.equal("false");
    expect(runPrintIt("('abc' >= 'def')")).to.equal("false");
    expect(runPrintIt("('abc' > 'def')")).to.equal("false");
  });

  it("handles unrecognized messages", () => {
    runDoIt(
      "Object compileMethod: 'error: str " +
        "^(str + Char newline asString + Context current backtrace)'",
    );
    const r = runPrintIt("3 moo");
    expect(r).to.contain("Unrecognized message selector: moo");
  });

  it("halts on error", () => {
    const stub = sinon.stub(console, "log");
    expect(runDoIt("[3 moo. 4] value")).to.equal(nilObject);
    sinon.assert.calledOnceWithMatch(
      stub,
      "LOG:",
      "Unrecognized message selector: moo",
    );
  });

  it("returns nil when halting", () => {
    expect(runDoIt("Object halt")).to.equal(interpreter.nilObject);
  });

  it("compiles and runs new methods", () => {
    const r = runDoIt(`
[String compileMethod: '
asUpper | r |
  r <- String new: self size.
  1 to: self size do: [:i |
    r at: i put: (self at: i) upperCase].
  ^r
'.
'hello, world! test.' asUpper] value`);
    expect(r.toString()).to.equal("HELLO, WORLD! TEST.");
    expect(runPrintIt("(String methods at: 4) name")).to.equal("asUpper");
    expect(runPrintIt("(String methods at: 4) byteCodes")).to.equal(
      "#(64 32 129 145 130 146 112 245 81 32 129 147 193 25 48 49 32 " +
        "49 130 148 129 149 131 150 242 131 151 245 48 242 245 241 )",
    );
  });

  it("responds to saveImage:", () => {
    interpreter.imageSaveCallback = (name, buf) => {
      expect(name).to.equal("imageToSave");
      expect(buf).to.be.an.instanceOf(Uint8Array);
    };
    runDoIt("Class saveImage: 'imageToSave'");
  });

  describe("Timer", () => {
    let clock = null;
    before(() => {
      clock = sinon.useFakeTimers();
    });
    after(() => clock.restore());

    it("sleeps correctly", () => {
      let saveCalled = false;
      interpreter.imageSaveCallback = () => {
        saveCalled = true;
      };
      runDoIt("[5000 sleep. Class saveImage: 'done'] value");
      expect(saveCalled).to.be.false;
      clock.tick(4999);
      expect(saveCalled).to.be.false;
      clock.tick(2);
      expect(saveCalled).to.be.true;
    });
  });

  it("throws on invalid opcode", () => {
    expect(() =>
      runDoIt("0", (code) => {
        code[0] = 0x00;
        code[1] = 0x00;
      }),
    ).to.throw("Unknown opcode 0");
  });

  it("throws on invalid constant", () => {
    expect(() =>
      runDoIt("0", (code) => {
        code[0] = 0x5d;
      }),
    ).to.throw("Unknown constant 13");
  });

  it("throws on invalid unary", () => {
    expect(() =>
      runDoIt("0", (code) => {
        code[0] = 0xa2;
      }),
    ).to.throw("Illegal SendUnary 2");
  });

  it("throws on invalid primitive", () => {
    expect(() =>
      runDoIt("0", (code) => {
        code[0] = 0xd0;
        code[1] = 0xff;
      }),
    ).to.throw("Unknown Primitive 255");
  });

  it("throws on invalid special", () => {
    expect(() =>
      runDoIt("0", (code) => {
        code[0] = 0xf0;
      }),
    ).to.throw("Unrecognized DoSpecial 0");
  });

  it("throws on bad method lookup", () => {
    expect(() => interpreter.methodLookup(nilObject, "")).to.throw("bad");
  });

  it("throws on double error: method lookup", () => {
    expect(() => interpreter.methodLookup(nilObject, "error:")).to.throw(
      "Unrecognized message selector: error:",
    );
  });
});
