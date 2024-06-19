#!/bin/bash

# Use the base.image to create newgui.image which replaces Budd's Java GUI
# with a native HTML based GUI. It introduces the Element class to represent
# an HTML DOM element.

cat \
  add-class-saveimage.st \
  add-object-log.st \
  add-object-equality.st \
  add-trig.st \
  fix-list-bug.st \
  fix-class-bugs.st \
  redefine-object-error.st \
  remove-gui.st \
  Element.st \
  Canvas.st \
  canvas-examples.st \
  html-editor.st \
  html-error-handler.st \
  recompile.st \
  save-newgui.st | ./repl.js --image_name ../data/nogui.image
