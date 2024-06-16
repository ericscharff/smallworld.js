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
negated
  ^ nil
!

METHOD Object
value
  ^ nil
!
