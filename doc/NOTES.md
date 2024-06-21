# SmallWorld internals

This document is a collection of notes on the inner workings of the system
gleaned by porting the Java SmallWorld implementation to JavaScript.

## Core objects

In Smalltalk, everything you can access is an object, and every object has a
class. This is represented by the `SmallObject` representation of a Smalltalk
object. It contains `objClass`, the class of the object. This is a reference to
another `SmallObject`, the one representing a class. It also contains `data`,
the object's instance variables. This is represented as a JavaScript array, each
item of which is a `SmallObject` or subclass. For named instance variables, the
compiler assigns an index to each instance variable, and they're referenced that
way. Smalltalk also has an `Array` class which is an arbitrary sized collection
of objects. `Array` (conveniently) doesn't have named instance variables, so the
underlying JavaScript array, which can be any size, can represent the variable
contents of the array.

This object would probably be sufficient for implementation, but there are two
subclasses for convenience. `SmallByteArray` has a `values` property, which is
stored as a `Uint8Array`. This class is used for efficient storage of strings
and of bytecode, so a native compact representation is desirable. `SmallInt`
represents an integer value. Primitive types like integers are also objects in
Smalltalk. Internally, the system keeps a cache of commonly used small integers
(0 through 9). `SmallInt` has a `value` property (a JavaScript number) for
convenience (since the interpreter needs to use and manipulate integers often).
Although JavaScript lacks an integer number type, the number class should be
sufficient for the usage within the system, since it is always less than 32 bits
of precision. However, care should be taken to ensure that `value` is always an
integer.

There is an additional, optional subclass of `SmallObject` called
`SmallJsObject`. This object represents something whose primary representation
exists outside of the Smalltalk object system. For example, GUI objects like a
Text entry widget are represented in HTML as a `<textarea>` element. When doing
floating point arithmetic, The number is opaque to Smalltalk, and relies on
JavaScript to do the floating point operations. Thus any time can be placed in
the `nativeObject` property of a `SmallJsObject`, and the appropriate primitives
manipulate it. This is optional because the compiler and interpreter can work
without requiring an arbitrary native object type.

A description of how the core objects could be constructed using JavaScript is
presented in [object_internals.js](object_internals.js).

## The Object File Format

The Smalltalk system is a complicated, circular graph of interrelated objects.
Serialization thus poses a problem because of all the circular dependencies.
Originally, SmallWorld used Java object serialization to accomplish this, but
the Java serialization format does not guarantee indefinite portability.

For this reason, I replaced the Java serialization in the SmallWorld
implementation with a custom one, written in pure Java, that could be used to
accomplish the same task. This proved to be valuable because porting it to
JavaScript was relatively straightforward. The `ImageReader` class treats the
input file as a stream of bytes (with integers stored in 32 bit big endian form,
to match Java's `DataInputStream`. The format is simple, where the file stores a
magic number, a version number (0), a count of all of the objects, and then the
`count` bytes, one for each object in the file. This determines the object's
type (0 = SmallObject, 1 = SmallInt, 2 = SmallByteArray). After this metadata,
each object is visited a second time, first reading an integer. The integer
corresponds to the entry in the object pool (which is why the objects were
preallocated and counted in the first place.) This helps keep the reference
semantics (objects in Smalltalk only store references to other objects) without
elaborate circular dependencies. Thus, when we read an integer N at the
beginning of the object, it is assumed that `objectPool[n]` is the SmallObject
representing the object's class. This scheme is used whenever an object is
referenced. After the class, it reads `dataLength`, the number of objects in the
SmallObject `data` array. This means that `dataLangth` integers will follow,
each one (like before) a reference to an object in the file's object pool.
Finally, there is some custom handling for reading the custom types SmallInt
(which needs its integer value) and SmallByteArray (which has an integer length,
and then the bytes that make up the array).

## Key objects

The interpreter relies heavily on the Smalltalk definition of several key
objects, including `Class`, `Method`, and `Context`. This is because much of
what the interpreter needs to do is send messages to objects. An object's class
has that object's methods, the method object has the bytecodes needed to run
that method, and the `Context` object represents a single frame in the call
stack. The ability for Smalltalk to inspect and manipulate these objects is what
gives it it's distinct dynamic nature. However, the interpreter (for
simplicity's sake) makes assumptions about the definitions of these objects,
because it needs to reference pieces of them in order to function.

From the Smalltalk source code, `Class` has the following definition:

```
EVAL Class addNewClass: (
  Object subclass: 'Class'
         variables: 'name parentClass methods size variables '
         classVariables: 'classes Parser ')
```

Of particular importance is `methods` which is an array of methods. Since an
array is just an arbitrary sized JavaScript array, if you are looking at an
object o in JavaScript, then `o.objClass.data[2]` are all the methods in that
class.

From the Smalltalk source code, `Method` has the following definition:

```
EVAL Class addNewClass: (
  Object subclass: 'Method'
         variables: 'name byteCodes literals stackSize temporarySize class text '
         classVariables: '')
```

Here, `name` is a String (a Symbol really, but SmallWorld doesn't distinguish
between Symbols and Strings), and `byteCodes` is a SmallByteArray used in
virtual machine execution. For example, the JavaScript code needs to iterate
through the methods to find the method called `doIt`, so it then has a handle on
the method object.

When a Method is called, the interpreter creates a new `Context` object that
represents the invocation of that method. This is analogous to a stack frame in
other languages. From the Smalltalk source code, `Context` has the following
definition:

```
EVAL Class addNewClass: (
  Object subclass: 'Context'
         variables: 'method arguments temporaries stack bytePointer
                     stackTop previousContext '
         classVariables: '')
```

The `buildContext` method in the `Interpreter` JavaScript class builds these
objects. The interpreter's job is to build and then run methods in a context.

## The Interpreter

The main job of `Interpreter` is to run bytecode. The Smalltalk virtual machine
is a stack machine, with intermediate values stored on a stack in the context.
The bytecodes themselves are one or two bytes, where the opcode (`high`) is four
bits, and the operand (low) is 4 or 8 bits. For example, the sequence `41` hex
has high = 4 and low = 1. The sequence `03 21` hex sets high = 3 and low = 0x21.

This yields 15 possible opcodes:

- 0 - Unused (invalid)
- 1 - PushInstance (push an instance variable of the receiver on the stack,
  indexed by low)
- 2 - PushArgument (push one of the method's arguments on the stack, indexed by
  low)
- 3 - PushTemporary (push one of the method's local, aka temporary variables on
  the stack, indexed by low)
- 4 - PushLiteral (push one of the method's constants, or literals, on the
  stack, indexed by low)
- 5 - PushConstant (push special constant objects like the SmallInts 0-9, `nil`,
  `true`, or `false`
- 6 - AssignInstance (set one of the receiver's instance variables to the top of
  the stack)
- 7 - AssignTemporary (set one of the method's temporary variables to the top of
  the stack)
- 8 - MarkArguments (put arguments into an array)
- 9 - SendMessage (Send a message to an object)
- 10 - SendUnary (Send a unary message to an object)
- 11 - SendBinary (Send a binary message to the top two objects on the stack,
  optimized for things like integer arithmetic)
- 12 - PushBlock (push a reference to a block)
- 13 - DoPrimitive (do something special. low is the arg count, the following
  byte is the number of the primitive)
- 14 - PushClassVariable (push one of the variables owned by the receiver's
  class)
- 15 - DoSpecial (these are auxiliary instructions that didn't fit above, such
  as returning from a context)

Block is a special object which is a subset of bytecode within a compiled
method. Blocks are special because they are executable - sending the `value`
message to a block evaluates it. From the Smalltalk source code, `Block` has the
following definition.

```
EVAL Class addNewClass: (
  Context subclass: 'Block'
          variables: 'argumentLocation creatingContext oldBytePointer '
          classVariables: '')
```

Note that block thus has the 7 instance variables of context, plus 3 new ones.

Putting it all together, here is a sample method added to `String`:

```
asUpper | r |
  r <- String new: self size.
  1 to: self size do: [:i |
    r at: i put: (self at: i) upperCase].
  ^r
```

which demonstrates features like blocks. Here is a hand annotated disassembly of
the bytecode associated with that block:

bytecode

`#(64 32 129 145 130 146 112 245 81 32 129 147 193 25 48 49 32 49 130 148 129 149 131 150 242 131 151 245 48 242 245 241 )`

literals

`#(String size new: size at: upperCase at:put: to:do: )`

Disassembly:

```
PC  Bytecode   Opcode             Comment
 0: 64 (40)    PushLiteral 0      (String)
 1: 32 (20)    PushArgument 0     (self)
 2: 129 (81)   MarkArguments 1    (the 1 arg TOS self is marked)
 3: 145 (91)   SendMessage 1      (size, which will leave "self size" on the stack)
 4: 130 (82)   MarkArguments 2    (String which was on the stack, and "self size")
 5: 146 (92)   SendMessage 2      (new: which evaluates "String new: self size")
 6: 112 (70)   AssignTemporary 0  (assign to "r", leaves value on stack)
 7: 245 (f5)   DoSpeical 5        (pop TOS, what was assigned to r)
 8; 81 (51),   PushConstant 1     (push smallint 1 on stack)
 9: 32 (20)    PushArgument 0     (self)
10: 129 (81)   MarkArguments 1    (self)
11: 147 (93)   SendMessage 3      (#size, calling self size)
12: 193 (c1)   PushBlock 1        (the arg is at temp pos 1)
13: 25 (19)                       (goto value for block) so execution jumps to 25
               Contents of block
14: 48 (30)    PushTemporary 0    (r from method)
15: 49 (31)    PushTemporary 1    (i, the block arg)
16: 32 (20)    PushArgument 0     (self, the string)
17: 49 (31)    PushTemporary 1    (i)
18: 130 (82)   MarkArguments 2    (for self and i)
19: 148 (94)   SendMessage 4      (at:)
20: 129 (81)   MarkArguments 1    (char from at: above)
21: 149 (95)   SendMessage 5      (send upperCase)
22: 131 (83)   MarkArgumen 3      (r, i, char)
23: 150 (96)   SendMessage 6      (send at:put:)
24: 242 (f2)   Special 2          (stack return, block done)
               After the block
25: 131 (83)   MarkArguments 3    (args for to:do:, 1, self size, and block)
26: 151 (97)   SendMessage 7      (to:do:)
27: 245 (f5)   DoSpecial 5        (pop TOS, which is whatever to:do: returned)
28: 48 (30)    PushTemporary 0    (r)
29: 242 (f2)   DoSpecial 2        (stack return, which returns r)
30: 245 (f5)   DpSpecial 5        (unrechable? pops TOS)
31: 241 (f1)   DoSpecial 1        (unreachable? self return)
```

This covers many, but not all of the features of the bytecode. The interpreter
source itself is the canonical source of truth.

## Threads

SmallWorld relied on Java threads for Semaphores and `sleep` (using
`Thread.sleep()`. Single-threaded JavaScript doesn't have equivalents, and
callbacks would be preferred. Semaphore is removed from the ported image, but it
is possible to simulate `sleep` using callbacks, sort of ad-hoc continuations.
This works by saving the context (the current running state), calling JavaScript
`setTimeout` and in the callback, calling `execute` again with the context. This
allows something like this

```
  "do a"
  5000 sleep. "5 seconds"
  "do b"
  5000 sleep. "5 seconds"
  "do c"
```

To work, as in, a method or block will run, and b will run 5 seconds after a
(and c 5 seconds after b).

Invoking the sleep primitive causes the `execute` method on the interpreter to
return immediately. Normally, execute doesn't return until all bytecodes in a
method run. From the perspective of the Smalltalk virtual machine, though,
bytecode resumes exactly where it was, giving the illusion of a blocking call.

This illusion breaks down in only a few edge cases, basically when execute is
called recursively. If something actually depended on the result of the
interpreter loop, it would get `nil` instead of the `final` value. The only
place this happens in the VM is in the implementation of `doIt` (used in the
REPL), which causes `perform:` to be called.

So, from the REPL, doing something like
`[1 log. 1000 sleep. 2 log. 1000 sleep. 3 log] value` will do what you expect,
but the value returned to the REPL is `nil`, not the final value of the block.
This is one of the only rare cases where the result is a bit counter-intuitive.

## Closures

Coming from other lexically scoped languages, SmallWorld's block closure
semantics were a bit surprising to me. While most modern Smalltalks have block
closure semantics, SmallWorld does not (nor did Smalltalk-80, Squeak, and
Digitalk, its contemporaries). This became obvious when trying to write code
like this:

```
closureTest: labels
  "make one block per label"
  ^ labels collect: [:e | ['label ' + e]]
```

This creates a collection of N blocks, one for each element. You would thus
expect `((1 closureTest: #(100 200 300)) at: 1) value` to return `label 100` but
instead it returns `label 300`. The reason for this is because the inner block
refers to the same invocation - labels is iterated through each time, so the `e`
in the inner block gets the value of the most recent evaluation of the outer
block.

As a JavaScript, Java, or Scheme programmer, this lack of scoping is surprising.
In JavaScript, idioms like this are often used with lambdas to capture the outer
scope.

A workaround is that, while each block doesn't get its own set of temporaries,
each message send does. So if a block refers to the temporaries of a method
implementation, you get a result more like what you would expect.

So, the example above can be fixed with two methods:

```
makeBlock: label
  ^ ['label ' + label]
fixedClosureTest: labels
  ^ labels collect: [:e | self makeBlock: e]
```

This turns out to be powerful once you realize that every method call creates a
context of scoped variables. It can be used to make closure-like objects without
having to create custom objects with instance variables.

## The Original GUI

SmallWorld's GUI provides a Smalltalk programming environment. You can add and
remove classes, edit existing class methods, add methods, evaluate expressions,
inspect live object, and so on.

The GUI has a significant number of primitives for manipulating the GUI objects,
because the host system (originally Java) provided all of the graphical
primitives. The way the Smalltalk code interacts with these primitives is
interesting. A good example of this is the `Pane (class)>>#textArea`:

```
META Pane
textArea  " create a multi-line text area"
   ^ <73 self>
```

So, when primitive 73 is called, it is passed an argument, the Pane class (note
that because this is a META (class) method, `self` here is `Pane`). It is then
expected for the primitive to return a new object, whose class is Pane, which
represents the newly created object. It creates a new Smalltalk Object, whose
class is Pane, and which (internally) has a reference to the platform specific
object, not directly exposed to the Smalltalk code.

When invoking methods, those object's are referenced. In `Pane>>#setText:`

```
METHOD Pane
setText: s " set text in text pane "
   ^ <82 self s>
```

Primitive 82 is passed two arguments, `s` (the string to display) and `self`,
which in the case is the _instance_ of a Pane created above. The primitive thus
assumes that self has a native object peer (a multi line text display) and
invokes code to change the text in that text display. In practice, the object
peer can be anything, but in the Java and JavaScript implementations, it is a
native (JavaScript) object that represents the TextArea.

SmallWorld's paradigms belie it's roots as a Java AWT application. It uses
concepts such as AWT's `BorderLayout` and `GridLayout`, as well as the event
listener mechanisms.

Event handling in Smalltalk is handled with blocks. A block is evaluated when a
button is pushed, for example. To accomplish this, a reference to the block is
stored in the native object's event handler. When the native code runs it's
event handler, it invokes code in `ui_handler.js`, which in turn calls
`interpreter.runAction(action)`, which effectively creates a new context from
the block and executes it.

## The HTML GUI

One of the reasons for rewriting SmallWorld in JavaScript was so that it could
run natively in a Web browser. As such, assuming external primitives (like AWT
or Swing) doesn't make a lot of sense. Furthermore, the existing system had a
large set of primitives for dealing with very specific types of Java objects
(Lists, TextFields, TextAreas, BorderPanel, etc.) In a Web based UI, these
abstractions don't make sense.

What does make sense in HTML is being able to create and manipulate HTML
elements within Smalltalk. This drastically reduces the number of necessary
primitives, and gives the Smalltalk code a lot of flexibility and power. The
HTML GUI system exposes DOM manipulation directly to Smalltalk, and the UI can
be built from this.

To accomplish this, I defined a new class called Element that represents an HTML
Element (like `div` or `button`). When you create an Element, you can grab a
reference from the DOM (using `getElementById()`) or create a new element (using
`document.createElement()`). Similar to the Java GUI, this returns an instance
of the Element class that has a native peer that represents the DOM element. You
can add or remove CSS classes, add child nodes to parent nodes, and remove nodes
from the DOM. This, alongside appropriate CSS, gives a lot of power with minimal
work. For convenience, the Element object also has a single `data` instance
variable which can be anything the programmer wants. This is useful for defining
a complex widget without defining new classes, and putting the widget state in
that data holder.

The Smalltalk code can listen to DOM events (e.g., `click`) by providing a DOM
event type and a block. That block is passed the element itself in its callback
so that it can be used (and, at some point, some proxy for the HTML event may be
necessary, to handle things like key presses or mouse coordinates).

This simple API was sufficient to simulate most of what the original Java API
did with a few factory methods (for creating text fields, lists, and so on). I
was then able to define a Class browser and editor which had a very similar API
to the original, making it small and easy to use.

Some JavaScript objects, especially HTML Canvas, have a very rich API surface
area for drawing commands. To avoid defining dozens of interpreter primitives, I
instead chose to define a single Canvas primitive, which provides an opcode read
by the interpreter. A curious aspect of this approach is that a single primitive
takes a variable number of arguments, and depending on how many operands a
particular drawing operation takes, it will pop that many arguments out of the
invoking method. In the native code, a `WeakMap` provides a map from HTML
(canvas) elements to the drawing context for those elements, to avoid repeated
calls to `elt.getContext("2d")`. A WeakMap is especially advantageous because
when the DOM node is unreferenced, the reference to the context will
automatically go away.
