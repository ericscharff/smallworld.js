#!/bin/bash

# Use the base.image to create newgui.image which replaces Budd's Java GUI
# with a native HTML based GUI. It introduces the Element class to represent
# an HTML DOM element.

cat \
  Element.st \
  Canvas.st \
  canvas-examples.st \
  html-editor.st \
  html-error-handler.st \
  save-newgui.st | ./repl.js --image_name ../data/nogui.image
