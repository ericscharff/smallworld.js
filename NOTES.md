# Smallworld internals

This document is a collection of notes on the inner workings of the system
gleaned by porting the Java SmallWorld implementation to Javascript.

## Core objects

In Smalltalk, everything you can access is an object, and every object has a
class. This is represented by the `SmallObject` representation of a Smalltalk
object. It contains `objClass`, the class of the object. This is a reference to
another `SmallObject`, the one reprenting a class. It also contains `data`, the
object's instance variables. This is represented as a Javascript array, each
item of which is a `SmallObject` or subclass. For named instance variables, the
compiler assigns an index to each instance variable, and they're referenced that
way. Smalltalk also has an `Array` class which is an arbitrary sized collection
of objects. `Array` (conveniently) doesn't have named instance variables, so the
underlying Javascript array, which can be any size, can represent the variable
contents of the array.

This object would probably be sufficient for implementation, but there are two
subclasses for convenience. `SmallByteArray` has a `values` property, which is
stored as a `Uint8Array`. This class is used for efficient storage of strings
and of bytecode, so a native compact representation is desirable. `SmallInt`
represents an integer value. Primitive types like integers are also objects in
SmallTalk. Internally, the system keeps a cache of commonly used small integers
(0 through 9). `SmallInt` has a `value` property (a Javascript number) for
convenience (since the interpreter needs to use and manipulate integers often).
Although Javascript lacks an integer number type, the number class should be
sufficient for the usage within the system, since it is always less than 32
bits of precision. Howver, care should be taken to ensure that `value` is always
an integer.
