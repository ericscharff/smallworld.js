"Script to remove the GUI classes from Smallworld"

"nil test is the last reference to ListPane"
Undefined removeMethod: 'test'

"3 inspect is the last reference to TextPanel"
SmallInt removeMethod: 'inspect'

"Color and Image depend on each other, but this should delete both"
Class removeClass: 'Color'
Class removeClass: 'Image'
"note - this leaves Pane>>#setImage: but this will be removed shortly"

"question: was an interactive blocking method to ask yes/no/cancel"
"so it depends on Semaphore"
Window class removeMethod: 'question:'

"getString: was a blocking method to ask for a string (blocks on semaphore)"
Window class removeMethod: 'getString:'

"subclass is an interative method for creating a class, so it blocks on a"
"semaphore. However, there are other ways to create subclasses non-interatively"
Class removeMethod: 'subclass'

"Single-threaded JavaScript doesn't have or need Semaphore"
Class removeClass: 'Semaphore'

"Application is a GUI framework tied to the old GUI"
Class removeClass: 'Application'

"File doesn't make much sense in a VM, but we still need a way to save the"
"image, so move a new verison of saveImage: to class, instead"
METHOD Class
saveImage: n
  <29 (n printString)>.
  ^ 'Image saved in file ' + n
!

"Now, class fileOut and fileTo: can be removed"
Class removeMethod: 'fileOut'
Class removeMethod: 'fileTo:'

"and thus File itself can be removed"
Class removeClass: 'File'

"Save the resulting image"
Class saveImage: 'image-nogui.data'
