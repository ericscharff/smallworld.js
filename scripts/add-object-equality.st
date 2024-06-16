"Object was missing a few methods that break cross-type comparisons"
"They should return false, not throw errors"

METHOD Object
equalToSmallInt: other
  ^ false
!

METHOD Object
compareToLP: other
  ^ 1
!

METHOD Object
value
  ^ self
!

METHOD Object
negatable
  ^ false
!

METHOD Number
negatable
  ^ true
!

METHOD LargeNegative
= arg
	^ (arg negatable) and: [self negated = arg negated]
!
