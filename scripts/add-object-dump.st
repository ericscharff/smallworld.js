"add a debugging message that is a lot like inspect"
"it creates a string with all an object's instance variables"
METHOD Object
dump
  | s i |
  s <- ''.
  i <- 1.
  self class instanceVariables do: [:v |
    s <- s + v + ': ' + (Object in: self at: i) printString + ' '.
    i <- i + 1].
  ^s
!
