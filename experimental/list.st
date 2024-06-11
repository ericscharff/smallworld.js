"Recompile all the methods in the image"
Class classes do: [:c | c methods do: [:m | c compileMethod: m text]]

"Create a listing of all the methods in an image"
"Class classes do: [:c | c methods do: [:m | (c printString + ' ' + m printString) log. m byteCodes printString log. m literals printString log]]"
Class saveImage: 'nogui-experimental'
