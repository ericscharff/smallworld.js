"Redefine error: to not refer to the GUI"
METHOD Object
error: str
  (str + Char newline asString + Context current backtrace) log.
  Object halt.
!
