"Fix a syntax error in the source for List>>#remove:"
METHOD List
remove: element
	self remove: element ifAbsent: [ nil ]
!
