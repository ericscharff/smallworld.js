Class addNewClass: ( Object subclass: 'Element' variables: 'a elname data ' classVariables: '')

METHOD Element
element: e
  elname <- e.
!

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
  ('item ' + data + ' with text ' + t) log.
!

METHOD Element
printString
  ^ 'Element: ' + elname + ' data ' + data
!

METHOD Element
on: evt do: h
  a <- h.
!

METHOD Element
append: c
  ^ self
!

METHOD Element
addClass: s
  ('Added ' + s + ' to ' + data) log
!

METHOD Element
removeClass: s
  ('Removed ' + s + ' from ' + data) log
!

METHOD Element
click
  a value
!

METHOD Element
clickv
  a value: data
!

META Element
create: tagName
  ^ self new element: tagName
!

META Element
button: label action: a
  | e |
  e <- self new element: 'button'.
  e text: label.
  e on: 'click' do: a.
  ^ e
!

META Element
list: items action: a
  | ul elts c |
  ul <- self create: 'ul'.
  ul data: 0 .
  elts <- Array new: items size.
  1 to: items size do: [:i |
    c <- self create: 'li'.
    c data: i.
    c text: (items at: i).
    c on: 'click' do: [:v |
      "unselect selected if set"
      (ul data > 0) ifTrue: [(elts at: ul data) removeClass: 'selected'].
      (elts at: v) addClass: 'selected'.
      ul data: v.
      "call the list's on selection action"
      a value: v].
    ul append: c.
    elts at: i put: c
  ].
  ^ #(ul [(elts at: 3) clickv. (elts at: 1) clickv. (elts at: 2) clickv. ul data log])
!

META Element
test
  | e |
  e <- self button: 'Hello' action: ['Hello clicked' log].
  e click.
  e click.
!

META Element
counter: s
  | e i |
  i <- 0.
  e <- self button: 'Counter' action: [i <- i + 1. ('Counter ' + s + ' ' + i) log].
  ^ e
!

META Element
test2
  | c1 c2 |
  c1 <- self counter: 'c1'.
  c2 <- self counter: 'c2'.
  c1 click. c2 click.
  1 to: 25 do: [:i | c1 click].
  c2 click.
!

((Element list: #(100 200 300 400 ) action: [:v | ('List selected ' + v) log]) at: 2) value

