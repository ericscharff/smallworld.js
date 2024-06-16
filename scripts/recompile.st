"recompile the compiler and all of the methods in the image"

"re-add Parser and Encoder to the list of classes. This is mostly to"
"make them easier to work with later."
Class addNewClass: Class parser class
"I don't know an eaiser way to grab the parser's class variable which"
"represents the encoder."
Class addNewClass: (Object in: Parser at: 6)

"there is a method in the compiler that prevents compiling of meta classes"
"temporarily redefine this method"
METHOD Parser
addArgName: name
  (argNames includes: name) ifTrue: [
    self error: 'doubly defined argument name'].
  argNames add: name
!

"This enhancement to the encoder will avoid the same literal being added"
"to the literals array multiple times."
METHOD Encoder
genLiteral: aValue
  | i |
  i <- literals indexOf: aValue ifAbsent: [
    literals <- literals add: aValue. literals size].
  ^ i - 1
!

"recompile the compiler"
6 to: 18 do: [:i | (Object in: (Class parser class) at: i) methods do: [:m | (Object in: (Class parser class) at: i) compileMethod: m text]]
Class parser class class methods do: [:m | Class parser class class compileMethod: m text]
Class parser class methods do: [:m | Class parser class compileMethod: m text]

"recompile metaclasses. The above fix to addArgName is necessary to get this to work"
Class classes do: [:c | c class methods do: [:m | c class compileMethod: m text]]

"recompile everything else"
Class classes do: [:c | c methods do: [:m | c compileMethod: m text]]

"restore the old behavior of addArgName"
METHOD Parser
addArgName: name
	((instNames includes: name)
		or: [ argNames includes: name ])
		ifTrue: [ self error: 'doubly defined argument name '].
	argNames add: name

!

"remove the compiler once again from the list of classes. It is still reachable"
"by Class."
Class removeClass: 'Encoder'
Class removeClass: 'Parser'
