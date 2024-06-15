#!/bin/bash

# Use the base.image to create nogui.image which is headless (removing
# methods referring to Budd's Java GUI). nogui.image is a good starting point
# for adding features (such as the HTML based GUI).

cat \
  add-class-saveimage.st \
  add-object-log.st \
  add-trig.st \
  fix-list-bug.st \
  fix-class-bugs.st \
  redefine-object-error.st \
  remove-gui.st \
  recompile.st \
  save-nogui.st | ./repl.js --image_name ../data/base.image
