This directory contains various images for use with the SmallWorld interpreter.
(In Smalltalk, an "image" is a snapshot of the objects that make up a running
system.) The interpreter loads the objects in an image, and executing code means
running methods on the objects enclosed.

The images here are:

- **base.image** - This is the original image that came with Budd's SmallWorld
  interpreter. It makes references to primitives that rely on an AWT GUI
  (emulated by smallworld.js).
- **base-packed.image** - This is an optimized version of base.image. The
  objects and code are the same, but duplicated objects are removed.
- **nogui.image** - This is derived from base.image but all of the GUI calls
  have been removed. This is a very good starting point for creating new images.
  It is "headless" and is the most minimal image.
- **html_gui.image** - This is derived from nogui.image and replaces the Java UI
  primitives with a smaller set that allow Smalltalk code to perform HTML DOM
  manipulation. It covers the same UI as base but with less code.
