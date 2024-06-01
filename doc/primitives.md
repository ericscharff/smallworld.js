# Primitives

This lists every primitive that is referenced by classes in the system. This
was derived by looking at the (extracted) source code of the system, and a bit
of perl regular expression magic to get the primitive number, the class, and the
method that the primitive is referenced.

This list is useful in case the primitives are redefined, or removed (e.g.,
removing the GUI primitives to create a no-GUI headless image).

| primitive | class                         | method                                      |
| --------- | ----------------------------- | ------------------------------------------- |
| 1         | smalltalk/base/Object.st      | == arg                                      |
| 2         | smalltalk/base/Object.st      | class                                       |
| 4         | smalltalk/base/Array.st       | size                                        |
| 4         | smalltalk/base/String.st      | size                                        |
| 5         | smalltalk/base/Array.st       | at: index put: value                        |
| 5         | smalltalk/base/Object.st      | in: o at: i put: v                          |
| 6         | smalltalk/base/Context.st     | perform: aMethod withArguments: a           |
| 7         | smalltalk/base/Array.st       | new: size                                   |
| 7         | smalltalk/base/Class.st       | new                                         |
| 8         | smalltalk/base/Block.st       | value                                       |
| 8         | smalltalk/base/Block.st       | value: a                                    |
| 8         | smalltalk/base/Block.st       | value: a value: b                           |
| 11        | smalltalk/base/SmallInt.st    | quoWithSmallInt: arg                        |
| 12        | smalltalk/base/SmallInt.st    | remWithSmallInt: arg                        |
| 13        | smalltalk/base/SmallInt.st    | lessThanSmallInt: arg                       |
| 14        | smalltalk/base/SmallInt.st    | equalToSmallInt: arg                        |
| 15        | smalltalk/base/SmallInt.st    | multBySmallInt: arg                         |
| 16        | smalltalk/base/SmallInt.st    | subtractFromSmallInt: arg                   |
| 18        | smalltalk/base/Array.st       | asTextArray                                 |
| 18        | smalltalk/base/Array.st       | with: newItem                               |
| 18        | smalltalk/hidden/Undefined.st | test                                        |
| 19        | smalltalk/base/Block.st       | fork                                        |
| 20        | smalltalk/base/ByteArray.st   | new: s                                      |
| 20        | smalltalk/base/String.st      | new: size                                   |
| 21        | smalltalk/base/ByteArray.st   | at: index ifAbsent: exceptionBlock          |
| 21        | smalltalk/base/String.st      | at: index ifAbsent: exceptionBlock          |
| 22        | smalltalk/base/ByteArray.st   | at: index put: aValue                       |
| 22        | smalltalk/base/String.st      | at: index put: aValue                       |
| 23        | smalltalk/base/String.st      | copy                                        |
| 24        | smalltalk/base/String.st      | + arg                                       |
| 26        | smalltalk/base/String.st      | < arg                                       |
| 26        | smalltalk/base/String.st      | = arg                                       |
| 29        | smalltalk/base/File.st        | saveImage: n                                |
| 30        | smalltalk/base/Array.st       | at: index ifAbsent: exceptionBlock          |
| 30        | smalltalk/base/Object.st      | in: o at: i                                 |
| 31        | smalltalk/base/Array.st       | add: newItem                                |
| 31        | smalltalk/base/Array.st       | with: newItem                               |
| 32        | smalltalk/base/Object.st      | in: v add: nv                               |
| 33        | smalltalk/base/SmallInt.st    | sleep                                       |
| 34        | smalltalk/base/Object.st      | halt                                        |
| 35        | smalltalk/base/Context.st     | current                                     |
| 41        | smalltalk/base/File.st        | openWrite: name                             |
| 42        | smalltalk/base/File.st        | openRead: name                              |
| 43        | smalltalk/base/File.st        | write: aString                              |
| 44        | smalltalk/base/File.st        | readLine                                    |
| 50        | smalltalk/base/SmallInt.st    | asFloat                                     |
| 51        | smalltalk/base/Float.st       | addToFloat: arg                             |
| 52        | smalltalk/base/Float.st       | subtractFromFloat: arg                      |
| 53        | smalltalk/base/Float.st       | multByFloat: arg                            |
| 54        | smalltalk/base/Float.st       | divideByFloat: arg                          |
| 55        | smalltalk/base/Float.st       | lessThanFloat: arg                          |
| 56        | smalltalk/base/Float.st       | equalToFloat: arg                           |
| 57        | smalltalk/base/Float.st       | asInteger                                   |
| 58        | smalltalk/base/Float.st       | random                                      |
| 59        | smalltalk/base/Float.st       | printString                                 |
| 60        | smalltalk/base/Window.st      | new                                         |
| 61        | smalltalk/base/Window.st      | close                                       |
| 61        | smalltalk/base/Window.st      | show                                        |
| 62        | smalltalk/base/Window.st      | setPane: c                                  |
| 63        | smalltalk/base/Window.st      | width: w height: h                          |
| 64        | smalltalk/base/Window.st      | addMenu: m                                  |
| 65        | smalltalk/base/Window.st      | title: t                                    |
| 66        | smalltalk/base/Window.st      | repaint                                     |
| 70        | smalltalk/base/Pane.st        | title: t                                    |
| 70        | smalltalk/hidden/TextPanel.st | new: t                                      |
| 71        | smalltalk/base/Pane.st        | title: t action: b                          |
| 72        | smalltalk/base/Pane.st        | textLine                                    |
| 73        | smalltalk/base/Pane.st        | textArea                                    |
| 74        | smalltalk/base/Pane.st        | rows: r columns: c data: d                  |
| 75        | smalltalk/base/Pane.st        | list: d action: b                           |
| 75        | smalltalk/hidden/ListPane.st  | META ListPane                               |
| 76        | smalltalk/base/Pane.st        | north: n south: s east: e west: w center: c |
| 76        | smalltalk/hidden/ListPane.st  | indexSelected                               |
| 77        | smalltalk/base/Pane.st        | setImage: img                               |
| 77        | smalltalk/hidden/ListPane.st  | setData: a                                  |
| 80        | smalltalk/base/Pane.st        | getText                                     |
| 80        | smalltalk/hidden/TextPanel.st | getText                                     |
| 81        | smalltalk/base/Pane.st        | getSelectedText                             |
| 81        | smalltalk/hidden/TextPanel.st | getSelectedText                             |
| 82        | smalltalk/base/Pane.st        | setText: s                                  |
| 82        | smalltalk/hidden/TextPanel.st | setText: t                                  |
| 83        | smalltalk/base/Pane.st        | getIndex                                    |
| 84        | smalltalk/base/Pane.st        | setList: d                                  |
| 85        | smalltalk/base/Pane.st        | hSliderFrom: low to: high do: b             |
| 85        | smalltalk/base/Pane.st        | vSliderFrom: low to: high do: b             |
| 86        | smalltalk/base/Pane.st        | onMouseDown: b                              |
| 87        | smalltalk/base/Pane.st        | onMouseUp: b                                |
| 88        | smalltalk/base/Pane.st        | onMouseMove: b                              |
| 90        | smalltalk/base/Menu.st        | new: t                                      |
| 91        | smalltalk/base/Menu.st        | on: title do: action                        |
| 100       | smalltalk/base/Semaphore.st   | new                                         |
| 101       | smalltalk/base/Semaphore.st   | wait                                        |
| 102       | smalltalk/base/Semaphore.st   | set: v                                      |
| 110       | smalltalk/base/Image.st       | width: w height: h                          |
| 111       | smalltalk/base/Image.st       | fromFile: n                                 |
| 113       | smalltalk/base/Image.st       | at: loc drawImage: img                      |
| 114       | smalltalk/base/Image.st       | at: loc text: t                             |
| 115       | smalltalk/base/Image.st       | at: loc drawLine: to                        |
| 115       | smalltalk/base/Image.st       | at: loc drawOval: s                         |
| 115       | smalltalk/base/Image.st       | at: loc drawRect: s                         |
| 115       | smalltalk/base/Image.st       | at: loc fillOval: s                         |
| 115       | smalltalk/base/Image.st       | at: loc fillRect: s                         |
