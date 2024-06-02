"Script to remove the GUI classes from Smallworld"

"nil test is the last reference to ListPane"
Undefined removeMethod: 'test'

"3 inspect is the last reference to TextPanel"
SmallInt removeMethod: 'inspect'

"Save the resulting image"
File saveImage: 'image-nogui.data'
