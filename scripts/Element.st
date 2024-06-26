"Add an HTML-native GUI"
"This new Element class represents an HTML element. It has methods"
"for doing DOM manipulation (adding and removing nodes), handling"
"events from the browser, and adding/removing CSS classes."
"There are class methods for generating a very simple UI with things"
"like windows, lists, and text areas. This is suitable for making a"
"UI similar to Budd's original which used Java AWT."

Class addNewClass: ( Object subclass: 'Element' variables: 'data ' classVariables: '')

METHOD Element
data: d
  data <- d.
!

METHOD Element
data
  ^ data
!

METHOD Element
text: t
  <62 self t>
!

METHOD Element
value
  ^ <63 String self>
!

METHOD Element
value: t
  <64 self t>
!

METHOD Element
on: evt do: b
  <65 self evt b>
!

METHOD Element
append: e
  <66 self e>
!

METHOD Element
remove
  <67 self>
!

METHOD Element
addClass: s
  <68 self s>
!

METHOD Element
removeClass: s
  <69 self s>
!

META Element
id: id
  ^ <60 self id>
!

META Element
create: tagName
  ^ <61 self tagName>
!

META Element
create: tagName class: className
  | e |
  e <- self create: tagName.
  e addClass: className.
  ^ e
!

META Element
button: label action: a
  | e |
  e <- self create: 'button'.
  e text: label.
  e on: 'click' do: [:v | a value].
  ^ e
!

META Element
label: s
  | e |
  e <- self create: 'span'.
  e text: s.
  ^ e
!

META Element
list: items action: a
  | ul elts c |
  ul <- self create: 'ul' class: 'listBox'.
  ul data: 0 .
  elts <- Array new: items size.
  1 to: items size do: [:i |
    c <- self create: 'li'.
    c data: i.
    c text: (items at: i).
    c on: 'click' do: [:v |
      "unselect selected if set"
      (ul data > 0) ifTrue: [(elts at: ul data) removeClass: 'selected'].
      (elts at: v data) addClass: 'selected'.
      ul data: v data.
      "call the list's on selection action"
      a value: v].
    ul append: c.
    elts at: i put: c
  ].
  ^ ul
!

META Element
notify: msg
  | w bp ta b |
  w <- self window: 'Notification'.
  bp <- Element create: 'div' class: 'borderPane'.
  ta <- self textArea. ta value: msg.
  ta addClass: 'center'. bp append: ta.
  b <- self button: 'close' action: [w remove].
  b addClass: 'south'. bp append: b.
  w append: bp.
!

META Element
textArea
  | e |
  ^ self create: 'textarea'.
!

META Element
textField
  | e |
  ^ self create: 'input'.
!

META Element
window: title
  | e t |
  e <- self create: 'div' class: 'stWindow'.
  t <- self create: 'span' class: 'windowTitle'.
  t text: title.
  e append: t.
  (self id: 'workspace') append: e.
  ^ e
!

META Class
browser
  | w t p out b bd bp |
  t <- Element textField. out <- Element textArea.
  p <- Element list: classes asStringArray action: [:i | nil].
  b <- #(
    (Element button: 'evaluate expression' action: [out value: t value doIt printString])
    (Element button: 'examine class' action: [(classes at: (p data)) edit])
    (Element button: 'delete class' action: [nil])
    (Element button: 'close' action: [w remove])).
  bd <- Element create: 'div'.
  b do: [:e | bd append: e].
  w <- Element window: 'Smalltalk Browser'.
  bp <- Element create: 'div' class: 'borderPane'.
  t addClass: 'north'. bp append: t.
  p addClass: 'east'. bp append: p.
  bd addClass: 'west'. bp append: bd.
  out addClass: 'center'. bp append: out.
  w append: bp.
!
