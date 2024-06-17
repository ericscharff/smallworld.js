Class addNewClass: ( Object subclass: 'Element' variables: 'data ' classVariables: '')
Class addNewClass: ( Element subclass: 'Canvas' variables: '' classVariables: '')

METHOD Canvas
moveTo: x y: y
  <70 y x 0 self>
!

METHOD Canvas
lineTo: x y: y
  <70 y x 1 self>
!

METHOD Canvas
fill
  <70 2 self>
!

METHOD Canvas
stroke
  <70 3 self>
!

METHOD Canvas
fillStyle: s
  <70 s 4 self>
!

METHOD Canvas
strokeStyle: s
  <70 s 5 self>
!

METHOD Canvas
beginPath
  <70 6 self>
!

METHOD Canvas
fillRect: x y: y w: w h: h
  <70 h w y x 7 self>
!

METHOD Canvas
strokeRect: x y: y w: w h: h
  <70 h w y x 8 self>
!

METHOD Canvas
fillText: s x: x y: y
  <70 y x s 9 self>
!

METHOD Canvas
strokeText: s x: x y: y
  <70 y x s 10 self>
!

METHOD Canvas
font: s
  <70 s 11 self>
!

METHOD Canvas
lineWidth: n
  <70 n 12 self>
!

METHOD Canvas
clearRect: x y: y w: w h: h
  <70 h w y x 13 self>
!

METHOD Canvas
closePath
  <70 14 self>
!

METHOD Canvas
arc: x y: y radius: r startAngle: startAngle endAngle: endAngle
  <70 endAngle startAngle r y x 15 self>
!

METHOD Canvas
ellipse: x y: y radiusX: rx radiusY: ry
  <70 ry rx y x 16 self>
!

METHOD Canvas
quadraticCurveTo: cpx cpy: cpy x: x y: y
  <70 y x cpy cpx 17 self>
!

METHOD Canvas
bezierCurveTo: cp1x cp1y: cp1y cp2x: cp2x cp2y: cp2y x: x y: y
  <70 y x cp2y cp2x cp1y cp1x 18 self>
!

METHOD Canvas
arcTo: x1 y1: y1 x2: x2 y2: y2 r: r
  <70 r y2 x2 y1 x1 19 self>
!

METHOD Canvas
rect: x y: y w: w h: h
  <70 h w y x 20 self>
!

METHOD Canvas
save
  <70 21 self>
!

METHOD Canvas
restore
  <70 22 self>
!

METHOD Canvas
translate: x y: y
  <70 y x 23 self>
!

METHOD Canvas
rotate: a
  <70 a 24 self>
!

METHOD Canvas
scale: x y: y
  <70 y x 25 self>
!

METHOD Canvas
roundedRect: x y: y w: w h: h r: r
  self beginPath.
  self moveTo: x y: y + r.
  self arcTo: x y1: y + h x2: x + r y2: y + h r: r.
  self arcTo: x + w y1: y + h x2: x + w y2: y + h - r r: r.
  self arcTo: x + w y1: y x2: x + w - r y2: y r: r.
  self arcTo: x y1: y x2: x y2: y + r r: r.
  self stroke.
!

META Canvas
test
  | w c b |
  w <- self window: 'Canvas Test'.
  c <- self create: 'canvas'.
  b <- self button: 'close' action: [w remove].
  w append: c.
  w append: b.
  c roundedRect: 12 y: 12 w: 184 h: 168 r: 15.
  c moveTo: 50 y: 50.
  c lineTo: 60 y: 60.
  c stroke.
!

Class saveImage: 'im'
