"Script to remove the GUI classes from Smallworld"

"nil test is the last reference to ListPane"
Undefined removeMethod: 'test'

"3 inspect is the last reference to TextPanel"
SmallInt removeMethod: 'inspect'

" Color and Image depend on each other, but this should delete both"
Class removeClass: 'Color'
Class removeClass: 'Image'
"note - this leaves Pane>>#setImage: but this will be removed shortly"

"Save the resulting image"
File saveImage: 'image-nogui.data'
