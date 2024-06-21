#!/bin/bash

# Usage ./make_html_image.sh [--from_base]

# Create html_gui.image, which replaces Budd's Java GUI with a native HTML
# based GUI. It introduces the Element class to represent an HTML DOM
# element.
#
# If --from_base is specified, then the image is created from the original
# base.image. Otherwise (the default) the image is created from nogui.image
# which is faster.

if [ "$1" = "--from_base" ]; then
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
    save-html-image.st | ./repl.js --image_name ../data/base.image
else
  cat \
    Element.st \
    Canvas.st \
    canvas-examples.st \
    html-editor.st \
    html-error-handler.st \
    save-html-image.st | ./repl.js --image_name ../data/nogui.image
fi
