"Redfine Object>>#error: to use the HTML GUI instead of logging to the"
"browser console"
METHOD Object
error: str
  Element notify: (str + Char newline asString + Context current backtrace).
  Object halt.
!
