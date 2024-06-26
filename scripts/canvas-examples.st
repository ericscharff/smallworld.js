"Examples of using the canvas API"
"Requires that the Canvas object already exist."

META Canvas
setup: testName
  "Set up a canvas in a window"
  | w c b |
  w <- self window: testName.
  c <- self create: 'canvas'.
  b <- self button: 'close' action: [w remove].
  w append: c.
  w append: b.
  ^ c
!

META Canvas
pacman
  | c |
  c <- self setup: 'Pacman'.
  c roundedRect: 12 y: 12 w: 184 h: 168 r: 15.
  c roundedRect: 19 y: 19 w: 170 h: 154 r: 9.
  c roundedRect: 53 y: 53 w: 49 h: 33 r: 10.
  c roundedRect: 53 y: 119 w: 49 h: 16 r: 6.
  c roundedRect: 135 y: 53 w: 49 h: 33 r: 10.
  c roundedRect: 135 y: 119 w: 25 h: 49 r: 10.

  c beginPath.
  c arc: 37 y: 37 r: 13 startAngle: (Float pi) / 7 endAngle: (Float pi) / -7.
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
  c lineTo: 106.333 y: 111.333.
  c lineTo: 101.666 y: 116.
  c lineTo: 97 y: 111.333.
  c lineTo: 92.333 y: 116.
  c lineTo: 87.666 y: 111.333.
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
  c arc: 101 y: 102 r: 2 startAngle: 0 endAngle: (Float pi) * 2.
  c fill.

  c beginPath.
  c arc: 89 y: 102 r: 2 startAngle: 0 endAngle: (Float pi) * 2.
  c fill.
!

META Canvas
speechBubble
  | c |
  c <- self setup: 'Speech Bubble'.
  c strokeStyle: 'red'.
  c lineWidth: 3.
  c beginPath.
  c moveTo: 75 y: 25.
  c quadraticCurveTo: 25 cpy: 25 x: 25 y: 62.5.
  c quadraticCurveTo: 25 cpy: 100 x: 50 y: 100.
  c quadraticCurveTo: 50 cpy: 120 x: 30 y: 125.
  c quadraticCurveTo: 60 cpy: 120 x: 65 y: 100.
  c quadraticCurveTo: 125 cpy: 100 x: 125 y: 62.5.
  c quadraticCurveTo: 125 cpy: 25 x: 75 y: 25.
  c stroke.
!
