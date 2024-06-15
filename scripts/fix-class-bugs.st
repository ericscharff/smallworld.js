"Fix typos in a few class methods"

META Class
addNewClass: aClass
  classes <- ((classes add: aClass) 
     asOrdered: [:a :b | a name < b name]) asArray.
  ^ aClass
!

METHOD Class
hierarchy: n | result |
	result <- ''.
	1 to: n do: [:i | result <- result + '   '].
	result <- result + name.
	self subclasses do: [:c |
		result <- result + Char newline asString + (c hierarchy: n+1) ].
	^ result
!
