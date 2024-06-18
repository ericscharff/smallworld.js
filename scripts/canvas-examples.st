"Examples of using the canvas API"
"Requires that the Canvas object already exist."

META Canvas
test
  | w c b |
  w <- self window: 'Canvas Test'.
  c <- self create: 'canvas'.
  b <- self button: 'close' action: [w remove].
  w append: c.
  w append: b.
  c roundedRect: 12 y: 12 w: 184 h: 168 r: 15.
  c lineWidth: 5.
  c strokeStyle: 'red'.
  c moveTo: 50 y: 50.
  c lineTo: 90 y: 90.
  c stroke.
!

META Canvas
pacman
  | w c b |
  w <- self window: 'Canvas Test'.
  c <- self create: 'canvas'.
  b <- self button: 'close' action: [w remove].
  w append: c.
  w append: b.

  c roundedRect: 12 y: 12 w: 184 h: 168 r: 15.
  c roundedRect: 19 y: 19 w: 170 h: 154 r: 9.
  c roundedRect: 53 y: 53 w: 49 h: 33 r: 10.
  c roundedRect: 53 y: 119 w: 49 h: 16 r: 6.
  c roundedRect: 135 y: 53 w: 49 h: 33 r: 10.
  c roundedRect: 135 y: 119 w: 25 h: 49 r: 10.

  c beginPath.
  c arc: 37 y: 37 radius: 13 startAngle: (Float pi) / 7 endAngle: (Float pi) / -7.
  c lineTo: 31 y: 37.
  c fill.

  0 to: 7 do: [:i |
    c fillRect: 51 + (i * 16) y: 35 w: 4 h: 4].

  0 to: 5 do: [:i |
    c fillRect: 115 y: 51 + (i * 16) w: 4 h: 4].

  0 to: 7 do: [:i |
    c fillRect: 51 + (i * 16) y: 99 w: 4 h: 4].

  c beginPath.
  c moveTo: 83 y: 116.
  c lineTo: 83 y: 102.
  c bezierCurveTo: 83 cp1y: 94 cp2x: 89 cp2y: 88 x: 97 y: 88.
  c bezierCurveTo: 105 cp1y: 88 cp2x: 111 cp2y: 94 x: 111 y: 102.
  c lineTo: 111 y: 116.
  c lineTo: 106 y: 111.
  c lineTo: 102 y: 116.
  c lineTo: 97 y: 111.
  c lineTo: 92 y: 116.
  c lineTo: 88 y: 111.
  c lineTo: 83 y: 116.
  c fill.

  c fillStyle: 'white'.
  c beginPath.
  c moveTo: 91 y: 96.
  c bezierCurveTo: 88 cp1y: 96 cp2x: 87 cp2y: 99 x: 87 y: 101.
  c bezierCurveTo: 87 cp1y: 103 cp2x: 88 cp2y: 106 x: 91 y: 106.
  c bezierCurveTo: 94 cp1y: 106 cp2x: 95 cp2y: 103 x: 95 y: 101.
  c bezierCurveTo: 95 cp1y: 99 cp2x: 94 cp2y: 96 x: 91 y: 96.
  c moveTo: 103 y: 96.
  c bezierCurveTo: 100 cp1y: 96 cp2x: 99 cp2y: 99 x: 99 y: 101.
  c bezierCurveTo: 99 cp1y: 103 cp2x: 100 cp2y: 106 x: 103 y: 106.
  c bezierCurveTo: 106 cp1y: 106 cp2x: 107 cp2y: 103 x: 107 y: 101.
  c bezierCurveTo: 107 cp1y: 99 cp2x: 106 cp2y: 96 x: 103 y: 96.
  c fill.

  c fillStyle: 'black'.
  c beginPath.
  c arc: 101 y: 102 radius: 2 startAngle: 0 endAngle: (Float pi) * 2.
  c fill.

  c beginPath.
  c arc: 89 y: 102 radius: 2 startAngle: 0 endAngle: (Float pi) * 2.
  c fill.
!
