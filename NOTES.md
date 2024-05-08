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

## The Object File Format

The Smalltalk system is a complicated, circular graph of interrelated objects.
Serialization thus poses a problem because of all the circular dependencies.
Originally, SmallWorld used Java object serialization to accomplish this, but
the Java serialization format does not guarantee indefinite portability.

For this reason, I replaced the Java serialization in the SmallWorld
implementation with a custom one, written in pure Java, that could be used to
accomplish the same task. This proved to be valuable because porting it to
Javascript was relatively straightforward. The `ImageReader` class treats the
input file as a stream of bytes (with integers stored in 32 bit big endian form,
to match Java's `DataInputStream`. The format is simple, where the file stores a
magic number, a version number (0), a count of all of the objects, and then the
`count` bytes, one for each object in the file. This determines the object's
type (0 = SmallObject, 1 = SmallInt, 2 = SmallByteArray). After this metadata,
each object is visited a second time, first reading an integer. The integer
corresponds to the entry in the object pool (which is why the objects were
preallocated and counted in the first place.) This helps keep the reference
semanitcs (objects in smalltalk only store references to other objects) without
elaborate circular dependencies. Thus, when we read an integer N at the
beginning of the object, it is assumed that `objectPool[n]` is the SmallObject
representing the object's class. This scheme is used whenever an object is
refreenced. After the class, it reads `dataLength`, the number of objects in the
SmallObject `data` array. This means that `dataLangth` integers will follow,
each one (like before) a reference to an object in the file's object pool.
Finally, there is some custom handling for reading the custom types SmallInt
(which needs its integer value) and SmallByteArray (which has an integer length,
and then the bytes that make up the array).
