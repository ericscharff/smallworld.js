# smallworld.js

smallworld.js is a translation of Timothy Budd's SmallWorld into JavaScript.
SmallWorld is a Java implementation of a very basic Smalltalk virtual machine.
Thus, smallworld.js is a Smalltalk virtual machine written in JavaScript.

This was a hand translation of Java to JavaScript, and accepts the same bytecode
format as the one I used in my
[SmallWorld](https://github.com/ericscharff/SmallWorld) fork. Similar to the
Java version, every Smalltalk object corresponds to a JavaScript object. Thus,
the JavaScript runtime does all the memory management and garbage collection.
This isn't a particularly fast or elegant Smalltalk VM, but it is very simple,
and relies on the fact that modern systems are very fast, and JavaScript
runtimes are quite good, so actually using the system has reasonable
performance.

## Status

The current implementation is extremely minimalist. There is no GUI, and many
primitives are not yet implemented. However, what is here is capable of running
a fairly large amount of Smalltalk code correctly, including basic arbitrary
precision arithmetic, string manipulation, and adding new methods to existing
classes. See the tests in [test.js](test.js) for more details.

I plan to maintain multiple branches of this code with different purposes. The
main branch will continue to be core features and primitives for a "headless"
experience - no GUI and minimal interaction with the outside world. It is thus
intended for embedding in some other system.

## Running

After cloning, use `npm install` to install the dependencies (only needed for
running unit tests). Running `npm test` will run the test suite in test.js.

A version suitable for running in a browser exists in index.html and index.js
but is not yet suitable for actual use.

## Why?

I have always been fascinated by Smalltalk, especially the programming paradigm
of using a virtual image (snapshot of all of the objects in a system). This kind
of Smalltalk provides a level of system introspection and manipulation that is
rare in other programming systems. Budd's Little Smalltalk and SmallWorld are
especially interesting Smalltalk variants, because a very few Smalltalk classes
and a relatively small virtual machine can accomplish a great deal. The base
image is made from 41 classes. The whole environment (full source code,
bytecode, programming tools, and so on) is made from 4924 objects, taking up
less than 170K of disk space.

I've written many interpreters and compilers over the years, and I even took Tim
Budd's original SmallWorld and cleaned up the code a bit. However, I never
really understood his Java code, or deeply how a Smalltalk virtual machine works
and how the illusion of "everything is an object" can be maintained.

Porting from Java to JavaScript has therefore been a personal journey of
discovery to understand the inner workings of the virtual machine. My rough
notes along the way are in [NOTES.md](NOTES.md).
