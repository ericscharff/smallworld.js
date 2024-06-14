"Adds `Class browser` and `Class edit` to edit the class hierarchy."
"These are inspired by Budd's original GUI, but uses the native HTML"
"widgets instead."
"NOTE: class Element must exist first in order fot this to work."

METHOD Class
edit | w t l ba bd bp |
  w <- Element window: 'Class Editor: ' + name.
  t <- Element textArea.
  l <- Element list: methods asStringArray
    action: [:i | t value: (methods at: i data) text].
  ba <- #((Element button: 'clear text area' action: [ t value: '' ])
    (Element button: 'compile' action:
      [ (self compileMethod: t value) ifTrue: [ Element notify: 'compilation successful'. w remove. self edit. ] ])
    (Element button: 'delete method' action:
      [ methods <- methods removeAt: l data. w remove. self edit. ])
    (Element button: 'instance variables' action:
      [ t value: variables asString])
    (Element button: 'examine superclass' action:
      [ self superclass notNil ifTrue: [ self superclass edit]
        ifFalse: [ 'no superclass' log]])
    (Element button: 'examine metaclass' action: [ self class edit ])
    (Element button: 'close' action: [ w remove]) ).
  bd <- Element create: 'div'.
  ba do: [:e | bd append: e].
  bp <- Element create: 'div' class: 'borderPane'.
  bd addClass: 'west'. bp append: bd.
  l addClass: 'east'. bp append: l.
  t addClass: 'center'. bp append: t.
  w append: bp.
!
