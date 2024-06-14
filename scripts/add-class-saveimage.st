"File doesn't make much sense in a VM, but we still need a way to save the"
"image, so move a new verison of saveImage: to class, instead"
METHOD Class
saveImage: n
  <29 (n printString)>.
  ^ 'Image saved in file ' + n
!

