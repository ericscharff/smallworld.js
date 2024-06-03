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

"Save the resulting image"
File saveImage: 'image-nogui.data'
