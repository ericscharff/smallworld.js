#!/bin/bash

# Use the base.image to remove methods referring to Budd's Java GUI. The result
# is nogui.image, which is a minimal image that doesn't require a GUI. It is
# used by the REPL and is the starting point for adding new features, such as
# alternative GUIs (e.g. the HTML GUI).

cat \
  add-class-saveimage.st \
  add-object-log.st \
  add-object-equality.st \
  add-trig.st \
  fix-list-bug.st \
  fix-class-bugs.st \
  redefine-object-error.st \
  remove-gui.st \
  recompile.st \
  save-nogui.st | ./repl.js --image_name ../data/base.image
