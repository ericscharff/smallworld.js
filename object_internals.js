// This is not part of the Smallworld interpreter, but rather a way to
// understand what is in a Smalltalk image. It shows the complex
// interrelationship of objects, and how they form together to create the
// image file (and, also, make a self contained running Smalltalk system.)

// This isn't used to build an image, just a way to describe the object
// using code, which is more concrete than the prose in the NOTES doc.

// This object represents nil
const nilObject = { data: [] };
// It's an instance of the class Undefined
const UndefinedClass = { data: [] };
nilObject.objClass = UndefinedClass;

// Here is a class object for strings
const StringClass = { data: [] };

const stringUndefined = {
  objClass: StringClass,
  data: [],
  values: "Undefined",
};
const stringString = { objClass: StringClass, data: [], values: "String" };

// Name is the first instance variable of class, so set the name
// field of the two classes we've defined:
UndefinedClass.data.push(stringUndefined);
StringClass.data.push(stringString);

// The second field of class is parentClass. The superclass of Undefined
// is Object
const ObjectClass = { data: [] };
const stringObject = { objClass: StringClass, data: [], values: "Object" };
ObjectClass.data.push(stringObject);

// The superclass of String is Array
// The superclass of Array is Indexed
// The superclass of Indexed is Collection
// The superclass of Collection is Magnitude
// The superclass of Magnitude is Object
// The definitions are similar to above, so they're abbreviated here:
const ArrayClass = {
  data: [
    /* the name Array */
  ],
};
const IndexedClass = {
  data: [
    /* the name Indexed */
  ],
};
const CollectionClass = {
  data: [
    /* the name Collection */
  ],
};
const MagnitudeClass = {
  data: [
    /* the name Magnitude */
  ],
};

// The second data field of Class is parentClass, chain all the classes
// we've defined so far to create the class hierarchy
UndefinedClass.data.push(ObjectClass);
StringClass.data.push(ArrayClass);
ArrayClass.data.push(IndexedClass);
IndexedClass.data.push(CollectionClass);
CollectionClass.data.push(MagnitudeClass);
MagnitudeClass.data.push(ObjectClass);

// an interesting special case is that the superclass of Object is nil:
ObjectClass.data.push(nilObject);

// For all the objects representing classes, we've not defined their class
// but have temporarily left it out. The class "String" is an instance of
// "Class". The class "Class" is an instance of itself. Note that this is
// different than Smalltalk-80, but works reasonably well.
const ClassClass = { data: [] };
const stringClass = { objClass: StringClass, data: [], values: "Class" };
ClassClass.data.push(stringClass);

// Now, go back and fill out the objClass for all the classes we've defined,
// so that every object has a class.
UndefinedClass.objClass = ClassClass;
StringClass.objClass = ClassClass;
ObjectClass.objClass = ClassClass;
ArrayClass.objClass = ClassClass;
IndexedClass.objClass = ClassClass;
CollectionClass.objClass = ClassClass;
MagnitudeClass.objClass = ClassClass;
ClassClass.objClass = ClassClass;

// The next field of every object is it's methods. Methods is an array of
// method objects. We can feed in the empty arrays:
const UndefinedClassMethods = { objClass: ArrayClass, data: [] };
UndefinedClass.data.push(UndefinedClassMethods);

const StringClassMethods = { objClass: ArrayClass, data: [] };
StringClass.data.push(StringClassMethods);

const ObjectClassMethods = { objClass: ArrayClass, data: [] };
ObjectClass.data.push(ObjectClassMethods);

const ArrayClassMethods = { objClass: ArrayClass, data: [] };
ArrayClass.data.push(ArrayClassMethods);

const IndexedClassMethods = { objClass: ArrayClass, data: [] };
IndexedClass.data.push(IndexedClassMethods);

const CollectionClassMethods = { objClass: ArrayClass, data: [] };
CollectionClass.data.push(CollectionClassMethods);

const MagnitudeClassMethods = { objClass: ArrayClass, data: [] };
MagnitudeClass.data.push(MagnitudeClassMethods);

const ClassClassMethods = { objClass: ArrayClass, data: [] };
ClassClass.data.push(ClassClassMethods);

// This approach could continue. Method is a class with fields like name (a
// string), byteCodes (an Array), literals (an Array), and stackSize (a number).
// A compiler could take a method definition and create Method objects, which
// could then be inserted into the appropriate class objects.
