(function() {
  var Module = {};

// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 23744;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });















var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;








































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































/* memory initializer */ allocate([58,157,82,162,70,223,145,63,163,150,207,87,75,16,51,63,157,143,255,178,165,85,212,62,0,0,0,0,0,0,0,0,24,45,68,84,251,33,249,63,24,45,68,84,251,33,9,64,135,91,97,5,103,172,221,63,80,105,235,49,199,40,254,191,135,91,97,5,103,172,221,63,224,240,156,118,47,27,228,191,135,91,97,5,103,172,221,63,224,240,156,118,47,27,228,63,135,91,97,5,103,172,221,63,80,105,235,49,199,40,254,63,135,91,97,5,103,172,221,63,224,240,156,118,47,27,4,192,135,91,97,5,103,172,221,191,224,240,156,118,47,27,244,191,135,91,97,5,103,172,221,191,0,0,0,0,0,0,0,0,135,91,97,5,103,172,221,191,224,240,156,118,47,27,244,63,135,91,97,5,103,172,221,191,224,240,156,118,47,27,4,64,135,91,97,5,103,172,221,191,0,0,0,0,0,0,0,0,24,45,68,84,251,33,249,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,1,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,17,185,191,71,52,122,228,63,128,99,124,13,130,100,193,191,188,181,172,248,15,52,176,63,13,58,223,87,254,223,153,191,86,124,232,39,65,36,136,63,101,154,159,209,12,152,118,191,29,54,54,224,152,10,102,63,124,211,244,217,1,215,85,191,220,17,78,11,94,244,69,63,128,159,113,225,64,72,54,191,119,127,108,53,211,0,249,63,53,208,50,138,226,151,224,63,175,86,22,26,194,16,161,191,255,130,147,35,83,244,186,191,130,177,25,59,60,223,162,191,235,253,70,59,110,248,125,63,7,240,22,72,80,252,136,63,193,255,86,178,99,35,112,63,148,246,6,95,152,76,85,191,16,64,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,88,55,0,0,0,0,0,0,176,52,0,0,56,76,0,0,32,69,0,0,56,65,0,0,112,61,0,0,152,58,0,0,152,56,0,0,56,55,0,0,88,53,0,0,0,52,0,0,232,85,0,0,24,84,0,0,128,82,0,0,104,81,0,0,64,79,0,0,160,78,0,0,232,77,0,0,80,77,0,0,176,76,0,0,184,75,0,0,8,75,0,0,128,74,0,0,200,73,0,0,8,73,0,0,208,71,0,0,0,71,0,0,96,70,0,0,248,69,0,0,128,69,0,0,224,68,0,0,168,68,0,0,32,68,0,0,192,67,0,0,56,67,0,0,176,66,0,0,80,66,0,0,0,66,0,0,176,65,0,0,104,65,0,0,24,65,0,0,216,64,0,0,120,64,0,0,48,64,0,0,200,63,0,0,0,63,0,0,152,62,0,0,48,62,0,0,216,61,0,0,136,61,0,0,72,61,0,0,0,61,0,0,200,60,0,0,96,60,0,0,32,60,0,0,8,60,0,0,184,59,0,0,112,59,0,0,8,59,0,0,224,58,0,0,160,58,0,0,104,58,0,0,24,58,0,0,224,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,27,0,0,0,0,0,0,40,27,0,0,0,0,0,0,80,27,0,0,0,0,0,0,112,27,0,0,0,0,0,0,144,27,0,0,0,0,0,0,176,27,0,0,0,0,0,0,200,27,0,0,0,0,0,0,224,27,0,0,0,0,0,0,248,27,0,0,0,0,0,0,32,28,0,0,0,0,0,0,56,28,0,0,0,0,0,0,96,28,0,0,0,0,0,0,144,28,0,0,0,0,0,0,184,28,0,0,0,0,0,0,224,28,0,0,0,0,0,0,8,29,0,0,0,0,0,0,40,29,0,0,0,0,0,0,104,29,0,0,0,0,0,0,152,29,0,0,0,0,0,0,192,29,0,0,0,0,0,0,248,29,0,0,0,0,0,0,40,30,0,0,0,0,0,0,104,30,0,0,0,0,0,0,144,30,0,0,0,0,0,0,184,30,0,0,0,0,0,0,232,30,0,0,0,0,0,0,32,31,0,0,0,0,0,0,88,31,0,0,0,0,0,0,128,31,0,0,0,0,0,0,176,31,0,0,0,0,0,0,224,31,0,0,0,0,0,0,24,32,0,0,0,0,0,0,64,32,0,0,0,0,0,0,88,32,0,0,0,0,0,0,128,32,0,0,0,0,0,0,160,32,0,0,0,0,0,0,192,32,0,0,0,0,0,0,216,32,0,0,0,0,0,0,248,32,0,0,0,0,0,0,16,33,0,0,0,0,0,0,48,33,0,0,0,0,0,0,88,33,0,0,0,0,0,0,112,33,0,0,0,0,0,0,136,33,0,0,0,0,0,0,160,33,0,0,0,0,0,0,200,33,0,0,0,0,0,0,0,34,0,0,0,0,0,0,24,34,0,0,0,0,0,0,64,34,0,0,0,0,0,0,168,34,0,0,0,0,0,0,216,34,0,0,0,0,0,0,48,35,0,0,0,0,0,0,232,35,0,0,0,0,0,0,16,36,0,0,0,0,0,0,56,36,0,0,0,0,0,0,96,36,0,0,0,0,0,0,128,36,0,0,0,0,0,0,152,36,0,0,0,0,0,0,184,36,0,0,0,0,0,0,232,36,0,0,0,0,0,0,24,37,0,0,0,0,0,0,72,37,0,0,0,0,0,0,96,37,0,0,0,0,0,0,128,37,0,0,0,0,0,0,168,37,0,0,0,0,0,0,200,37,0,0,0,0,0,0,0,38,0,0,0,0,0,0,48,38,0,0,0,0,0,0,96,38,0,0,0,0,0,0,152,38,0,0,0,0,0,0,208,38,0,0,0,0,0,0,8,39,0,0,0,0,0,0,32,39,0,0,0,0,0,0,56,39,0,0,0,0,0,0,88,39,0,0,0,0,0,0,128,39,0,0,0,0,0,0,184,39,0,0,0,0,0,0,248,39,0,0,0,0,0,0,64,40,0,0,0,0,0,0,96,40,0,0,0,0,0,0,128,40,0,0,0,0,0,0,160,40,0,0,0,0,0,0,192,40,0,0,0,0,0,0,224,40,0,0,0,0,0,0,16,41,0,0,0,0,0,0,64,41,0,0,0,0,0,0,88,41,0,0,0,0,0,0,120,41,0,0,0,0,0,0,152,41,0,0,0,0,0,0,192,41,0,0,0,0,0,0,32,42,0,0,0,0,0,0,80,42,0,0,0,0,0,0,104,42,0,0,0,0,0,0,152,42,0,0,0,0,0,0,208,42,0,0,0,0,0,0,56,43,0,0,0,0,0,0,104,43,0,0,0,0,0,0,152,43,0,0,0,0,0,0,184,43,0,0,0,0,0,0,208,43,0,0,0,0,0,0,0,44,0,0,0,0,0,0,48,44,0,0,0,0,0,0,96,44,0,0,0,0,0,0,112,44,0,0,0,0,0,0,152,44,0,0,0,0,0,0,184,44,0,0,0,0,0,0,208,44,0,0,0,0,0,0,232,44,0,0,0,0,0,0,16,45,0,0,0,0,0,0,80,45,0,0,0,0,0,0,136,45,0,0,0,0,0,0,208,45,0,0,0,0,0,0,232,45,0,0,0,0,0,0,0,46,0,0,0,0,0,0,24,46,0,0,0,0,0,0,48,46,0,0,0,0,0,0,72,46,0,0,0,0,0,0,96,46,0,0,0,0,0,0,144,46,0,0,0,0,0,0,192,46,0,0,0,0,0,0,216,46,0,0,0,0,0,0,48,47,0,0,0,0,0,0,96,47,0,0,0,0,0,0,128,47,0,0,0,0,0,0,152,47,0,0,0,0,0,0,200,47,0,0,0,0,0,0,240,47,0,0,0,0,0,0,32,48,0,0,0,0,0,0,72,48,0,0,0,0,0,0,112,48,0,0,0,0,0,0,152,48,0,0,0,0,0,0,200,48,0,0,0,0,0,0,224,48,0,0,0,0,0,0,8,49,0,0,0,0,0,0,56,49,0,0,0,0,0,0,64,66,0,0,248,65,0,0,168,65,0,0,88,65,0,0,8,65,0,0,200,64,0,0,112,64,0,0,32,64,0,0,192,63,0,0,240,62,0,0,128,62,0,0,32,62,0,0,208,61,0,0,120,61,0,0,56,61,0,0,240,60,0,0,192,60,0,0,80,60,0,0,16,60,0,0,208,59,0,0,128,59,0,0,24,59,0,0,240,58,0,0,176,58,0,0,112,58,0,0,56,58,0,0,0,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,47,221,36,6,129,149,237,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,192,62,58,117,229,147,63,0,0,0,0,0,0,0,0,136,56,0,0,38,0,0,0,192,8,0,0,216,77,0,0,110,0,0,0,184,8,0,0,72,70,0,0,236,0,0,0,176,8,0,0,240,65,0,0,124,0,0,0,168,8,0,0,24,62,0,0,104,0,0,0,160,8,0,0,16,59,0,0,174,0,0,0,152,8,0,0,216,56,0,0,64,0,0,0,144,8,0,0,136,55,0,0,10,0,0,0,136,8,0,0,184,53,0,0,66,0,0,0,128,8,0,0,48,52,0,0,12,0,0,0,120,8,0,0,16,86,0,0,78,0,0,0,112,8,0,0,128,84,0,0,190,0,0,0,104,8,0,0,216,82,0,0,128,0,0,0,96,8,0,0,184,81,0,0,90,0,0,0,88,8,0,0,136,79,0,0,142,0,0,0,80,8,0,0,168,78,0,0,50,0,0,0,72,8,0,0,240,77,0,0,178,0,0,0,64,8,0,0,112,77,0,0,56,0,0,0,56,8,0,0,192,76,0,0,206,0,0,0,48,8,0,0,192,75,0,0,210,0,0,0,40,8,0,0,32,75,0,0,208,0,0,0,32,8,0,0,152,74,0,0,202,0,0,0,24,8,0,0,232,73,0,0,200,0,0,0,16,8,0,0,56,73,0,0,204,0,0,0,8,8,0,0,232,71,0,0,52,0,0,0,0,8,0,0,8,71,0,0,6,1,0,0,248,7,0,0,120,70,0,0,224,0,0,0,232,7,0,0,0,70,0,0,4,1,0,0,240,7,0,0,144,69,0,0,122,0,0,0,224,7,0,0,0,69,0,0,44,0,0,0,216,7,0,0,176,68,0,0,132,0,0,0,208,7,0,0,48,68,0,0,84,0,0,0,200,7,0,0,232,67,0,0,134,0,0,0,192,7,0,0,80,67,0,0,218,0,0,0,184,7,0,0,208,66,0,0,130,0,0,0,176,7,0,0,104,66,0,0,156,0,0,0,168,7,0,0,8,66,0,0,242,0,0,0,160,7,0,0,192,65,0,0,222,0,0,0,152,7,0,0,136,65,0,0,2,1,0,0,144,7,0,0,32,65,0,0,82,0,0,0,136,7,0,0,240,64,0,0,192,0,0,0,120,7,0,0,152,64,0,0,168,0,0,0,112,7,0,0,72,64,0,0,166,0,0,0,104,7,0,0,240,63,0,0,188,0,0,0,152,5,0,0,56,63,0,0,238,0,0,0,96,7,0,0,160,62,0,0,42,0,0,0,88,7,0,0,72,62,0,0,176,0,0,0,80,7,0,0,248,61,0,0,48,0,0,0,72,7,0,0,144,61,0,0,46,0,0,0,64,7,0,0,96,61,0,0,240,0,0,0,56,7,0,0,24,61,0,0,144,0,0,0,48,7,0,0,208,60,0,0,234,0,0,0,40,7,0,0,136,60,0,0,180,0,0,0,32,7,0,0,64,60,0,0,58,0,0,0,24,7,0,0,232,59,0,0,250,0,0,0,16,7,0,0,144,59,0,0,152,0,0,0,208,6,0,0,40,59,0,0,80,0,0,0,8,7,0,0,248,58,0,0,70,0,0,0,0,7,0,0,192,58,0,0,100,0,0,0,216,6,0,0,128,58,0,0,116,0,0,0,248,6,0,0,72,58,0,0,244,0,0,0,240,6,0,0,0,58,0,0,106,0,0,0,232,6,0,0,200,57,0,0,252,0,0,0,224,6,0,0,160,57,0,0,108,0,0,0,200,6,0,0,128,57,0,0,172,0,0,0,192,6,0,0,24,57,0,0,148,0,0,0,176,6,0,0,240,56,0,0,140,0,0,0,184,6,0,0,208,56,0,0,18,0,0,0,168,6,0,0,168,56,0,0,16,0,0,0,160,6,0,0,144,56,0,0,20,0,0,0,152,6,0,0,104,56,0,0,112,0,0,0,144,6,0,0,80,56,0,0,14,1,0,0,136,6,0,0,48,56,0,0,12,1,0,0,128,6,0,0,8,56,0,0,230,0,0,0,120,6,0,0,240,55,0,0,4,0,0,0,112,6,0,0,200,55,0,0,8,0,0,0,104,6,0,0,160,55,0,0,6,0,0,0,96,6,0,0,120,55,0,0,246,0,0,0,88,6,0,0,80,55,0,0,162,0,0,0,80,6,0,0,48,55,0,0,36,0,0,0,72,6,0,0,0,55,0,0,160,0,0,0,64,6,0,0,232,54,0,0,182,0,0,0,56,6,0,0,192,54,0,0,114,0,0,0,48,6,0,0,152,54,0,0,88,0,0,0,40,6,0,0,112,54,0,0,94,0,0,0,32,6,0,0,16,54,0,0,120,0,0,0,24,6,0,0,216,53,0,0,68,0,0,0,16,6,0,0,136,53,0,0,72,0,0,0,8,6,0,0,120,53,0,0,154,0,0,0,0,6,0,0,80,53,0,0,2,0,0,0,248,5,0,0,40,53,0,0,10,1,0,0,240,5,0,0,24,53,0,0,146,0,0,0,232,5,0,0,240,52,0,0,92,0,0,0,224,5,0,0,200,52,0,0,194,0,0,0,216,5,0,0,168,52,0,0,0,1,0,0,208,5,0,0,104,52,0,0,8,1,0,0,200,5,0,0,64,52,0,0,150,0,0,0,192,5,0,0,40,52,0,0,170,0,0,0,184,5,0,0,24,52,0,0,118,0,0,0,176,5,0,0,248,51,0,0,138,0,0,0,168,5,0,0,72,87,0,0,196,0,0,0,160,5,0,0,40,87,0,0,86,0,0,0,144,5,0,0,0,87,0,0,254,0,0,0,136,5,0,0,216,86,0,0,186,0,0,0,128,5,0,0,200,86,0,0,220,0,0,0,120,5,0,0,104,86,0,0,136,0,0,0,112,5,0,0,40,86,0,0,226,0,0,0,104,5,0,0,8,86,0,0,232,0,0,0,96,5,0,0,248,85,0,0,228,0,0,0,128,7,0,0,208,85,0,0,60,0,0,0,88,5,0,0,160,85,0,0,126,0,0,0,80,5,0,0,128,85,0,0,158,0,0,0,72,5,0,0,88,85,0,0,40,0,0,0,64,5,0,0,48,85,0,0,14,0,0,0,56,5,0,0,16,85,0,0,54,0,0,0,48,5,0,0,208,84,0,0,96,0,0,0,40,5,0,0,144,84,0,0,184,0,0,0,32,5,0,0,96,84,0,0,98,0,0,0,24,5,0,0,56,84,0,0,62,0,0,0,16,5,0,0,16,84,0,0,198,0,0,0,8,5,0,0,224,83,0,0,214,0,0,0,0,5,0,0,200,83,0,0,216,0,0,0,248,4,0,0,160,83,0,0,212,0,0,0,240,4,0,0,144,83,0,0,248,0,0,0,232,4,0,0,120,83,0,0,22,0,0,0,224,4,0,0,32,83,0,0,26,0,0,0,216,4,0,0,232,82,0,0,24,0,0,0,208,4,0,0,200,82,0,0,30,0,0,0,200,4,0,0,160,82,0,0,28,0,0,0,192,4,0,0,120,82,0,0,34,0,0,0,184,4,0,0,96,82,0,0,32,0,0,0,176,4,0,0,80,82,0,0,164,0,0,0,168,4,0,0,56,82,0,0,76,0,0,0,160,4,0,0,40,82,0,0,74,0,0,0,152,4,0,0,16,82,0,0,102,0,0,0,144,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,241,155,194,74,5,21,231,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,226,99,102,85,58,14,130,191,234,176,194,45,31,73,121,191,200,81,0,0,0,0,0,0,0,0,0,0,0,0,0,0,91,218,155,226,105,192,230,63,64,137,207,157,96,127,239,63,0,0,0,0,0,0,0,0,170,78,98,107,17,172,149,63,236,173,55,32,248,206,110,63,10,134,206,198,165,133,186,191,86,114,95,24,250,113,173,191,171,150,116,148,131,217,160,191,179,103,42,31,221,99,160,191,157,97,15,146,170,146,169,63,9,137,180,141,63,81,191,63,252,54,196,120,205,171,154,63,47,25,199,72,246,8,183,63,148,234,76,235,128,53,72,63,79,99,49,160,205,96,194,191,189,175,37,63,61,17,127,63,254,114,119,231,154,19,193,191,86,210,47,182,181,42,150,191,190,104,143,23,210,225,179,63,53,171,136,228,117,14,151,191,149,215,165,161,161,218,181,63,5,236,180,127,175,114,239,63,0,0,0,0,0,0,0,0,224,198,28,186,143,146,149,63,55,96,161,32,194,9,118,63,32,66,92,57,123,103,186,191,23,48,220,20,234,68,173,191,173,10,30,240,10,142,160,191,8,133,82,197,158,135,160,191,135,90,137,47,201,183,169,63,25,175,212,14,218,6,191,63,178,218,252,191,234,200,153,63,178,80,198,83,234,237,182,63,16,203,102,14,73,45,84,191,139,227,27,101,88,32,194,191,117,228,237,173,237,146,125,63,187,244,138,2,216,219,192,191,192,76,202,147,90,222,147,191,26,102,13,131,158,114,179,63,95,16,236,83,233,130,149,191,138,138,221,227,241,89,181,63,49,148,19,237,42,164,239,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,147,229,36,148,190,16,170,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,170,238,145,205,85,179,63,0,0,0,0,0,0,0,0,144,60,0,0,24,79,0,0,112,71,0,0,128,66,0,0,208,62,0,0,168,59,0,0,112,71,0,0,32,57,0,0,208,55,0,0,24,79,0,0,40,54,0,0,112,52,0,0,112,86,0,0,216,84,0,0,112,71,0,0,40,83,0,0,224,81,0,0,48,80,0,0,240,78,0,0,48,78,0,0,176,77,0,0,0,77,0,0,16,76,0,0,96,75,0,0,192,74,0,0,56,74,0,0,16,76,0,0,136,73,0,0,8,72,0,0,96,71,0,0,192,70,0,0,48,70,0,0,224,69,0,0,16,69,0,0,192,68,0,0,72,68,0,0,8,68,0,0,104,67,0,0,16,76,0,0,240,66,0,0,120,66,0,0,104,67,0,0,24,66,0,0,208,65,0,0,152,65,0,0,40,65,0,0,248,64,0,0,168,64,0,0,96,64,0,0,0,64,0,0,248,64,0,0,72,63,0,0,168,62,0,0,96,62,0,0,0,62,0,0,192,61,0,0,104,61,0,0,32,61,0,0,216,60,0,0,168,60,0,0,72,60,0,0,248,59,0,0,152,59,0,0,48,59,0,0,0,59,0,0,208,58,0,0,136,58,0,0,80,58,0,0,8,58,0,0,240,57,0,0,168,57,0,0,144,57,0,0,80,57,0,0,8,57,0,0,224,56,0,0,192,56,0,0,160,56,0,0,112,56,0,0,224,56,0,0,88,56,0,0,72,56,0,0,16,56,0,0,224,56,0,0,248,55,0,0,224,55,0,0,184,55,0,0,224,56,0,0,144,55,0,0,112,55,0,0,64,55,0,0,224,56,0,0,8,55,0,0,240,54,0,0,216,54,0,0,168,54,0,0,120,54,0,0,24,54,0,0,0,54,0,0,168,54,0,0,192,53,0,0,128,53,0,0,104,53,0,0,168,54,0,0,48,53,0,0,32,53,0,0,8,53,0,0,168,54,0,0,208,52,0,0,184,52,0,0,144,52,0,0,96,52,0,0,56,52,0,0,32,52,0,0,8,52,0,0,96,52,0,0,80,87,0,0,64,87,0,0,24,87,0,0,168,54,0,0,232,86,0,0,208,86,0,0,128,86,0,0,88,86,0,0,24,86,0,0,0,86,0,0,216,85,0,0,112,71,0,0,176,85,0,0,136,85,0,0,112,85,0,0,72,85,0,0,32,85,0,0,248,84,0,0,192,84,0,0,104,84,0,0,72,84,0,0,48,84,0,0,240,83,0,0,208,83,0,0,176,83,0,0,152,83,0,0,128,83,0,0,72,83,0,0,16,83,0,0,224,82,0,0,176,82,0,0,144,82,0,0,104,82,0,0,88,82,0,0,64,82,0,0,168,54,0,0,48,82,0,0,32,82,0,0,248,81,0,0,16,76,0,0,216,81,0,0,168,81,0,0,152,81,0,0,120,81,0,0,88,81,0,0,80,81,0,0,24,79,0,0,48,81,0,0,32,81,0,0,24,81,0,0,104,80,0,0,176,79,0,0,96,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,61,0,0,80,79,0,0,240,61,0,0,232,90,0,0,184,66,0,0,24,63,0,0,224,59,0,0,88,57,0,0,232,55,0,0,80,79,0,0,224,59,0,0,80,54,0,0,160,52,0,0,144,86,0,0,8,85,0,0,88,83,0,0,8,82,0,0,120,80,0,0,8,79,0,0,80,78,0,0,192,77,0,0,24,77,0,0,48,76,0,0,152,75,0,0,248,74,0,0,96,74,0,0,8,79,0,0,184,73,0,0,0,73,0,0,144,71,0,0,216,70,0,0,80,70,0,0,240,69,0,0,72,69,0,0,208,68,0,0,136,68,0,0,16,68,0,0,128,67,0,0,48,67,0,0,160,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,73,100,58,32,112,106,95,116,114,97,110,115,102,111,114,109,46,99,32,50,48,48,48,32,50,48,49,49,45,48,53,45,49,48,32,49,55,58,48,54,58,51,51,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,0,0,0,36,73,100,58,32,80,74,95,97,105,114,121,46,99,32,49,56,53,54,32,50,48,49,48,45,48,54,45,49,49,32,48,51,58,50,54,58,48,52,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,36,73,100,58,32,112,106,95,111,112,101,110,95,108,105,98,46,99,32,50,49,51,48,32,50,48,49,49,45,49,50,45,49,53,32,48,49,58,50,48,58,50,51,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,0,0,0,0,36,73,100,58,32,112,106,95,116,114,97,110,115,102,111,114,109,46,99,32,49,53,48,52,32,50,48,48,57,45,48,49,45,48,54,32,48,50,58,49,49,58,53,55,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,0,0,0,36,73,100,36,0,0,0,0,36,73,100,58,32,112,106,95,116,114,97,110,115,102,111,114,109,46,99,32,49,53,48,52,32,50,48,48,57,45,48,49,45,48,54,32,48,50,58,49,49,58,53,55,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,0,0,0,36,73,100,58,32,112,106,95,105,110,105,116,46,99,32,50,49,54,51,32,50,48,49,50,45,48,50,45,50,49,32,48,49,58,53,51,58,49,57,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,36,73,100,58,32,112,106,95,103,101,111,99,101,110,116,46,99,32,49,53,48,52,32,50,48,48,57,45,48,49,45,48,54,32,48,50,58,49,49,58,53,55,90,32,119,97,114,109,101,114,100,97,109,32,36,0,36,73,100,36,0,0,0,0,36,73,100,58,32,80,74,95,110,122,109,103,46,99,32,49,53,48,52,32,50,48,48,57,45,48,49,45,48,54,32,48,50,58,49,49,58,53,55,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,36,73,100,58,32,80,74,95,107,114,111,118,97,107,46,99,32,49,56,53,54,32,50,48,49,48,45,48,54,45,49,49,32,48,51,58,50,54,58,48,52,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,36,73,100,58,32,80,74,95,97,105,116,111,102,102,46,99,32,49,56,53,54,32,50,48,49,48,45,48,54,45,49,49,32,48,51,58,50,54,58,48,52,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,36,73,100,58,32,80,74,95,97,101,113,100,46,99,32,49,56,53,54,32,50,48,49,48,45,48,54,45,49,49,32,48,51,58,50,54,58,48,52,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,36,73,100,58,32,80,74,95,97,101,97,46,99,32,49,56,53,54,32,50,48,49,48,45,48,54,45,49,49,32,48,51,58,50,54,58,48,52,90,32,119,97,114,109,101,114,100,97,109,32,36,0,0,0,0,0,132,139,203,167,125,233,239,63,0,0,0,0,0,0,0,0,176,10,47,28,99,130,117,63,4,226,117,253,130,221,112,191,83,248,34,144,1,143,126,63,131,192,202,161,69,182,115,63,217,107,139,124,168,126,143,191,241,63,67,73,146,49,201,191,56,85,173,59,204,77,176,63,190,32,216,167,210,5,194,191,196,56,201,160,36,110,215,63,129,127,165,78,155,204,210,191,183,49,44,53,49,211,239,63,0,0,0,0,0,0,0,0,193,33,175,98,76,85,117,63,55,60,24,12,9,115,102,191,252,152,197,122,89,201,125,63,201,153,220,222,36,188,115,63,11,61,7,59,106,241,142,191,220,248,110,78,128,188,200,191,22,24,178,186,213,115,176,63,161,83,235,88,0,174,193,191,75,122,115,19,16,238,214,63,28,255,79,15,27,118,210,191,228,53,68,84,251,33,9,192,24,45,68,84,251,33,233,63,210,33,51,127,124,217,2,192,176,62,68,84,251,33,249,63,24,45,68,84,251,33,249,191,71,80,68,84,251,33,233,63,24,45,68,84,251,33,233,191,176,62,68,84,251,33,249,63,0,0,0,0,0,0,0,0,71,80,68,84,251,33,233,63,24,45,68,84,251,33,233,63,176,62,68,84,251,33,249,63,24,45,68,84,251,33,249,63,71,80,68,84,251,33,233,63,210,33,51,127,124,217,2,64,176,62,68,84,251,33,249,63,228,53,68,84,251,33,9,64,24,45,68,84,251,33,233,63,228,53,68,84,251,33,9,64,24,45,68,84,251,33,233,191,210,33,51,127,124,217,2,64,176,62,68,84,251,33,249,191,24,45,68,84,251,33,249,63,71,80,68,84,251,33,233,191,24,45,68,84,251,33,233,63,176,62,68,84,251,33,249,191,0,0,0,0,0,0,0,0,71,80,68,84,251,33,233,191,24,45,68,84,251,33,233,191,176,62,68,84,251,33,249,191,24,45,68,84,251,33,249,191,71,80,68,84,251,33,233,191,210,33,51,127,124,217,2,192,176,62,68,84,251,33,249,191,228,53,68,84,251,33,9,192,24,45,68,84,251,33,233,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,240,156,118,47,27,4,192,171,1,21,123,216,99,237,63,224,240,156,118,47,27,244,191,171,1,21,123,216,99,237,63,0,0,0,0,0,0,0,0,171,1,21,123,216,99,237,63,224,240,156,118,47,27,244,63,171,1,21,123,216,99,237,63,224,240,156,118,47,27,4,64,171,1,21,123,216,99,237,63,224,240,156,118,47,27,4,192,9,226,237,170,170,39,200,63,224,240,156,118,47,27,244,191,9,226,237,170,170,39,200,63,0,0,0,0,0,0,0,0,9,226,237,170,170,39,200,63,224,240,156,118,47,27,244,63,9,226,237,170,170,39,200,63,224,240,156,118,47,27,4,64,9,226,237,170,170,39,200,63,80,105,235,49,199,40,254,191,9,226,237,170,170,39,200,191,224,240,156,118,47,27,228,191,9,226,237,170,170,39,200,191,224,240,156,118,47,27,228,63,9,226,237,170,170,39,200,191,80,105,235,49,199,40,254,63,9,226,237,170,170,39,200,191,24,45,68,84,251,33,9,64,9,226,237,170,170,39,200,191,80,105,235,49,199,40,254,191,171,1,21,123,216,99,237,191,224,240,156,118,47,27,228,191,171,1,21,123,216,99,237,191,224,240,156,118,47,27,228,63,171,1,21,123,216,99,237,191,80,105,235,49,199,40,254,63,171,1,21,123,216,99,237,191,24,45,68,84,251,33,9,64,171,1,21,123,216,99,237,191,87,105,110,107,101,108,32,84,114,105,112,101,108,10,9,77,105,115,99,32,83,112,104,10,9,108,97,116,95,49,0,0,87,105,110,107,101,108,32,73,73,10,9,80,67,121,108,46,44,32,83,112,104,46,44,32,110,111,32,105,110,118,46,10,9,108,97,116,95,49,61,0,87,105,110,107,101,108,32,73,10,9,80,67,121,108,46,44,32,83,112,104,46,10,9,108,97,116,95,116,115,61,0,0,87,101,114,101,110,115,107,105,111,108,100,32,73,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,87,97,103,110,101,114,32,86,73,73,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,87,97,103,110,101,114,32,86,73,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,87,97,103,110,101,114,32,86,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,87,97,103,110,101,114,32,73,86,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,87,97,103,110,101,114,32,73,73,73,10,9,80,67,121,108,46,44,32,83,112,104,46,10,9,108,97,116,95,116,115,61,0,0,0,0,0,0,0,0,87,97,103,110,101,114,32,73,73,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,87,97,103,110,101,114,32,73,32,40,75,97,118,114,97,105,115,107,121,32,86,73,41,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,0,86,105,116,107,111,118,115,107,121,32,73,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,0,0,0,118,97,110,32,100,101,114,32,71,114,105,110,116,101,110,32,73,86,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,118,97,110,32,100,101,114,32,71,114,105,110,116,101,110,32,73,73,73,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,118,97,110,32,100,101,114,32,71,114,105,110,116,101,110,32,73,73,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,118,97,110,32,100,101,114,32,71,114,105,110,116,101,110,32,40,73,41,10,9,77,105,115,99,32,83,112,104,0,0,0,85,110,105,118,101,114,115,97,108,32,84,114,97,110,115,118,101,114,115,101,32,77,101,114,99,97,116,111,114,32,40,85,84,77,41,10,9,67,121,108,44,32,83,112,104,10,9,122,111,110,101,61,32,115,111,117,116,104,0,0,0,0,0,0,85,114,109,97,101,118,32,70,108,97,116,45,80,111,108,97,114,32,83,105,110,117,115,111,105,100,97,108,10,9,80,67,121,108,44,32,83,112,104,46,10,9,110,61,0,0,0,0,85,114,109,97,101,118,32,86,10,9,80,67,121,108,46,44,32,83,112,104,46,10,9,110,61,32,113,61,32,97,108,112,104,105,61,0,0,0,0,0,85,110,105,118,101,114,115,97,108,32,80,111,108,97,114,32,83,116,101,114,101,111,103,114,97,112,104,105,99,10,9,65,122,105,44,32,83,112,104,38,69,108,108,10,9,115,111,117,116,104,0,0,0,0,0,0,84,105,108,116,101,100,32,112,101,114,115,112,101,99,116,105,118,101,10,9,65,122,105,44,32,83,112,104,10,9,116,105,108,116,61,32,97,122,105,61,32,104,61,0,0,0,0,0,84,119,111,32,80,111,105,110,116,32,69,113,117,105,100,105,115,116,97,110,116,10,9,77,105,115,99,32,83,112,104,10,9,108,97,116,95,49,61,32,108,111,110,95,49,61,32,108,97,116,95,50,61,32,108,111,110,95,50,61,0,0,0,0,84,114,97,110,115,118,101,114,115,101,32,77,101,114,99,97,116,111,114,10,9,67,121,108,44,32,83,112,104,38,69,108,108,0,0,0,0,0,0,0,84,105,115,115,111,116,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,84,114,97,110,115,118,101,114,115,101,32,67,121,108,105,110,100,114,105,99,97,108,32,69,113,117,97,108,32,65,114,101,97,10,9,67,121,108,44,32,83,112,104,0,0,0,0,0,84,114,97,110,115,118,101,114,115,101,32,67,101,110,116,114,97,108,32,67,121,108,105,110,100,114,105,99,97,108,10,9,67,121,108,44,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,0,0,0,79,98,108,105,113,117,101,32,83,116,101,114,101,111,103,114,97,112,104,105,99,32,65,108,116,101,114,110,97,116,105,118,101,10,9,65,122,105,109,117,116,104,97,108,44,32,83,112,104,38,69,108,108,0,0,0,83,116,101,114,101,111,103,114,97,112,104,105,99,10,9,65,122,105,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,116,115,61,0,0,0,0,83,119,105,115,115,46,32,79,98,108,46,32,77,101,114,99,97,116,111,114,10,9,67,121,108,44,32,69,108,108,10,9,70,111,114,32,67,72,49,57,48,51,0,0,0,0,0,0,83,105,110,117,115,111,105,100,97,108,32,40,83,97,110,115,111,110,45,70,108,97,109,115,116,101,101,100,41,10,9,80,67,121,108,44,32,83,112,104,38,69,108,108,0,0,0,0,82,101,99,116,97,110,103,117,108,97,114,32,80,111,108,121,99,111,110,105,99,10,9,67,111,110,105,99,44,32,83,112,104,46,44,32,110,111,32,105,110,118,46,10,9,108,97,116,95,116,115,61,0,0,0,0,82,111,117,115,115,105,108,104,101,32,83,116,101,114,101,111,103,114,97,112,104,105,99,10,9,65,122,105,46,44,32,69,108,108,112,115,46,0,0,0,82,111,98,105,110,115,111,110,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,114,72,69,65,76,80,105,120,10,9,83,112,104,46,44,32,69,108,108,112,115,46,10,9,110,112,111,108,101,61,32,115,112,111,108,101,61,0,0,0,81,117,97,114,116,105,99,32,65,117,116,104,97,108,105,99,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,80,117,116,110,105,110,115,32,80,54,39,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,0,80,117,116,110,105,110,115,32,80,54,10,9,80,67,121,108,46,44,32,83,112,104,46,0,80,117,116,110,105,110,115,32,80,53,39,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,0,80,117,116,110,105,110,115,32,80,53,10,9,80,67,121,108,46,44,32,83,112,104,46,0,80,117,116,110,105,110,115,32,80,52,39,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,0,80,117,116,110,105,110,115,32,80,51,39,10,9,80,67,121,108,46,44,32,110,111,32,105,110,118,46,44,32,83,112,104,46,0,0,0,0,0,0,0,80,117,116,110,105,110,115,32,80,51,10,9,80,67,121,108,46,44,32,83,112,104,46,0,80,117,116,110,105,110,115,32,80,50,10,9,80,67,121,108,46,44,32,83,112,104,46,0,80,117,116,110,105,110,115,32,80,49,10,9,80,67,121,108,44,32,83,112,104,46,0,0,80,111,108,121,99,111,110,105,99,32,40,65,109,101,114,105,99,97,110,41,10,9,67,111,110,105,99,44,32,83,112,104,38,69,108,108,0,0,0,0,80,101,114,115,112,101,99,116,105,118,101,32,67,111,110,105,99,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,0,0,0,0,0,79,114,116,104,111,103,114,97,112,104,105,99,10,9,65,122,105,44,32,83,112,104,46,0,79,114,116,101,108,105,117,115,32,79,118,97,108,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,0,0,0,0,79,98,108,105,113,117,101,32,77,101,114,99,97,116,111,114,10,9,67,121,108,44,32,83,112,104,38,69,108,108,32,110,111,95,114,111,116,10,9,97,108,112,104,97,61,32,91,103,97,109,109,97,61,93,32,91,110,111,95,111,102,102,93,32,108,111,110,99,61,32,111,114,10,9,32,108,111,110,95,49,61,32,108,97,116,95,49,61,32,108,111,110,95,50,61,32,108,97,116,95,50,61,0,0,79,98,108,97,116,101,100,32,69,113,117,97,108,32,65,114,101,97,10,9,77,105,115,99,32,83,112,104,10,9,110,61,32,109,61,32,116,104,101,116,97,61,0,0,0,0,0,0,79,98,108,105,113,117,101,32,67,121,108,105,110,100,114,105,99,97,108,32,69,113,117,97,108,32,65,114,101,97,10,9,67,121,108,44,32,83,112,104,108,111,110,99,61,32,97,108,112,104,97,61,32,111,114,10,9,108,97,116,95,49,61,32,108,97,116,95,50,61,32,108,111,110,95,49,61,32,108,111,110,95,50,61,0,0,0,0,71,101,110,101,114,97,108,32,79,98,108,105,113,117,101,32,84,114,97,110,115,102,111,114,109,97,116,105,111,110,10,9,77,105,115,99,32,83,112,104,10,9,111,95,112,114,111,106,61,32,112,108,117,115,32,112,97,114,97,109,101,116,101,114,115,32,102,111,114,32,112,114,111,106,101,99,116,105,111,110,10,9,111,95,108,97,116,95,112,61,32,111,95,108,111,110,95,112,61,32,40,110,101,119,32,112,111,108,101,41,32,111,114,10,9,111,95,97,108,112,104,97,61,32,111,95,108,111,110,95,99,61,32,111,95,108,97,116,95,99,61,32,111,114,10,9,111,95,108,111,110,95,49,61,32,111,95,108,97,116,95,49,61,32,111,95,108,111,110,95,50,61,32,111,95,108,97,116,95,50,61,0,0,0,78,101,119,32,90,101,97,108,97,110,100,32,77,97,112,32,71,114,105,100,10,9,102,105,120,101,100,32,69,97,114,116,104,0,0,0,0,0,0,0,78,101,97,114,45,115,105,100,101,100,32,112,101,114,115,112,101,99,116,105,118,101,10,9,65,122,105,44,32,83,112,104,10,9,104,61,0,0,0,0,78,105,99,111,108,111,115,105,32,71,108,111,98,117,108,97,114,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,78,101,108,108,45,72,97,109,109,101,114,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,0,78,101,108,108,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,78,97,116,117,114,97,108,32,69,97,114,116,104,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,77,117,114,100,111,99,104,32,73,73,73,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,0,0,0,77,117,114,100,111,99,104,32,73,73,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,0,0,0,0,77,117,114,100,111,99,104,32,73,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,0,0,0,0,0,77,111,108,108,119,101,105,100,101,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,77,105,108,108,101,114,32,67,121,108,105,110,100,114,105,99,97,108,10,9,67,121,108,44,32,83,112,104,0,0,0,0,77,105,108,108,101,114,32,79,98,108,97,116,101,100,32,83,116,101,114,101,111,103,114,97,112,104,105,99,10,9,65,122,105,40,109,111,100,41,0,0,77,101,114,99,97,116,111,114,10,9,67,121,108,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,116,115,61,0,77,99,66,114,121,100,101,45,84,104,111,109,97,115,32,70,108,97,116,45,80,111,108,97,114,32,83,105,110,117,115,111,105,100,97,108,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,0,0,0,0,77,99,66,114,121,100,101,45,84,104,111,109,97,115,32,70,108,97,116,45,80,111,108,97,114,32,81,117,97,114,116,105,99,10,9,67,121,108,46,44,32,83,112,104,46,0,0,0,77,99,66,114,105,100,101,45,84,104,111,109,97,115,32,70,108,97,116,45,80,111,108,97,114,32,80,97,114,97,98,111,108,105,99,10,9,67,121,108,46,44,32,83,112,104,46,0,77,99,66,114,121,100,101,45,84,104,111,109,97,115,32,70,108,97,116,45,80,111,108,97,114,32,83,105,110,101,32,40,78,111,46,32,49,41,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,77,99,66,114,121,100,101,45,84,104,111,109,97,115,32,70,108,97,116,45,80,111,108,101,32,83,105,110,101,32,40,78,111,46,32,50,41,10,9,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,83,112,97,99,101,32,111,98,108,105,113,117,101,32,102,111,114,32,76,65,78,68,83,65,84,10,9,67,121,108,44,32,83,112,104,38,69,108,108,10,9,108,115,97,116,61,32,112,97,116,104,61,0,0,0,0,76,111,120,105,109,117,116,104,97,108,10,9,80,67,121,108,32,83,112,104,0,0,0,0,76,97,116,47,108,111,110,103,32,40,71,101,111,100,101,116,105,99,41,10,9,0,0,0,76,97,116,47,108,111,110,103,32,40,71,101,111,100,101,116,105,99,32,97,108,105,97,115,41,10,9,0,0,0,0,0,76,101,101,32,79,98,108,97,116,101,100,32,83,116,101,114,101,111,103,114,97,112,104,105,99,10,9,65,122,105,40,109,111,100,41,0,0,0,0,0,76,97,109,98,101,114,116,32,69,113,117,97,108,32,65,114,101,97,32,67,111,110,105,99,10,9,67,111,110,105,99,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,49,61,32,115,111,117,116,104,0,0,76,97,109,98,101,114,116,32,67,111,110,102,111,114,109,97,108,32,67,111,110,105,99,32,65,108,116,101,114,110,97,116,105,118,101,10,9,67,111,110,105,99,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,48,61,0,0,0,0,0,76,97,109,98,101,114,116,32,67,111,110,102,111,114,109,97], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([108,32,67,111,110,105,99,10,9,67,111,110,105,99,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,32,111,114,32,108,97,116,95,48,0,0,0,0,0,76,97,116,47,108,111,110,103,32,40,71,101,111,100,101,116,105,99,32,97,108,105,97,115,41,10,9,0,0,0,0,0,76,97,116,47,108,111,110,103,32,40,71,101,111,100,101,116,105,99,32,97,108,105,97,115,41,10,9,0,0,0,0,0,76,97,115,107,111,119,115,107,105,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,76,97,114,114,105,118,101,101,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,0,76,97,103,114,97,110,103,101,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,10,9,87,61,0,76,97,109,98,101,114,116,32,65,122,105,109,117,116,104,97,108,32,69,113,117,97,108,32,65,114,101,97,10,9,65,122,105,44,32,83,112,104,38,69,108,108,0,0,0,0,0,0,76,97,98,111,114,100,101,10,9,67,121,108,44,32,83,112,104,10,9,83,112,101,99,105,97,108,32,102,111,114,32,77,97,100,97,103,97,115,99,97,114,0,0,0,0,0,0,0,75,114,111,118,97,107,10,9,80,67,121,108,46,44,32,69,108,108,112,115,46,0,0,0,75,97,118,114,97,105,115,107,121,32,86,73,73,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,0,0,0,75,97,118,114,97,105,115,107,121,32,86,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,0,0,0,73,99,111,115,97,104,101,100,114,97,108,32,83,110,121,100,101,114,32,69,113,117,97,108,32,65,114,101,97,10,9,83,112,104,0,0,0,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,77,97,112,32,111,102,32,116,104,101,32,87,111,114,108,100,32,80,111,108,121,99,111,110,105,99,10,9,77,111,100,46,32,80,111,108,121,99,111,110,105,99,44,32,69,108,108,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,32,91,108,111,110,95,49,61,93,0,0,0,0,0,0,0,73,110,116,101,114,114,117,112,116,101,100,32,71,111,111,100,101,32,72,111,109,111,108,111,115,105,110,101,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,0,0,0,0,72,69,65,76,80,105,120,10,9,83,112,104,46,44,32,69,108,108,112,115,46,0,0,0,72,97,116,97,110,111,32,65,115,121,109,109,101,116,114,105,99,97,108,32,69,113,117,97,108,32,65,114,101,97,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,0,0,72,97,109,109,101,114,32,38,32,69,99,107,101,114,116,45,71,114,101,105,102,101,110,100,111,114,102,102,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,10,9,87,61,32,77,61,0,0,71,97,117,115,115,45,83,99,104,114,101,105,98,101,114,32,84,114,97,110,115,118,101,114,115,101,32,77,101,114,99,97,116,111,114,32,40,97,107,97,32,71,97,117,115,115,45,76,97,98,111,114,100,101,32,82,101,117,110,105,111,110,41,10,9,67,121,108,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,48,61,32,108,111,110,95,48,61,32,107,95,48,61,0,0,0,0,0,0,0,77,111,100,46,32,83,116,101,114,101,114,111,103,114,97,112,104,105,99,115,32,111,102,32,53,48,32,85,46,83,46,10,9,65,122,105,40,109,111,100,41,0,0,0,0,0,0,0,77,111,100,46,32,83,116,101,114,101,114,111,103,114,97,112,104,105,99,115,32,111,102,32,52,56,32,85,46,83,46,10,9,65,122,105,40,109,111,100,41,0,0,0,0,0,0,0,71,111,111,100,101,32,72,111,109,111,108,111,115,105,110,101,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,71,110,111,109,111,110,105,99,10,9,65,122,105,44,32,83,112,104,46,0,0,0,0,0,71,101,110,101,114,97,108,32,83,105,110,117,115,111,105,100,97,108,32,83,101,114,105,101,115,10,9,80,67,121,108,44,32,83,112,104,46,10,9,109,61,32,110,61,0,0,0,0,71,105,110,115,98,117,114,103,32,86,73,73,73,32,40,84,115,78,73,73,71,65,105,75,41,10,9,80,67,121,108,44,32,83,112,104,46,44,32,110,111,32,105,110,118,46,0,0,71,101,111,115,116,97,116,105,111,110,97,114,121,32,83,97,116,101,108,108,105,116,101,32,86,105,101,119,10,9,65,122,105,44,32,83,112,104,38,69,108,108,10,9,104,61,0,0,71,101,111,99,101,110,116,114,105,99,10,9,0,0,0,0,71,97,108,108,32,40,71,97,108,108,32,83,116,101,114,101,111,103,114,97,112,104,105,99,41,10,9,67,121,108,44,32,83,112,104,0,0,0,0,0,70,111,117,99,97,117,116,32,83,105,110,117,115,111,105,100,97,108,10,9,80,67,121,108,46,44,32,83,112,104,46,0,70,111,117,99,97,117,116,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,70,97,104,101,121,10,9,80,99,121,108,44,32,83,112,104,46,0,0,0,0,0,0,0,69,117,108,101,114,10,9,67,111,110,105,99,44,32,83,112,104,10,9,108,97,116,95,49,61,32,97,110,100,32,108,97,116,95,50,61,0,0,0,0,69,120,116,101,110,100,101,100,32,84,114,97,110,115,118,101,114,115,101,32,77,101,114,99,97,116,111,114,10,9,67,121,108,44,32,83,112,104,10,9,108,97,116,95,116,115,61,40,48,41,10,108,97,116,95,48,61,40,48,41,0,0,0,0,69,113,117,105,100,105,115,116,97,110,116,32,67,111,110,105,99,10,9,67,111,110,105,99,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,49,61,32,108,97,116,95,50,61,0,0,0,0,0,0,0,0,69,113,117,105,100,105,115,116,97,110,116,32,67,121,108,105,110,100,114,105,99,97,108,32,40,80,108,97,116,101,32,67,97,114,101,101,41,10,9,67,121,108,44,32,83,112,104,10,9,108,97,116,95,116,115,61,91,44,32,108,97,116,95,48,61,48,93,0,0,0,0,0,69,99,107,101,114,116,32,86,73,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,69,99,107,101,114,116,32,86,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,0,69,99,107,101,114,116,32,73,86,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,69,99,107,101,114,116,32,73,73,73,10,9,80,67,121,108,44,32,83,112,104,46,0,0,69,99,107,101,114,116,32,73,73,10,9,80,67,121,108,46,32,83,112,104,46,0,0,0,69,99,107,101,114,116,32,73,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,68,101,110,111,121,101,114,32,83,101,109,105,45,69,108,108,105,112,116,105,99,97,108,10,9,80,67,121,108,46,44,32,110,111,32,105,110,118,46,44,32,83,112,104,46,0,0,0,67,114,97,115,116,101,114,32,80,97,114,97,98,111,108,105,99,32,40,80,117,116,110,105,110,115,32,80,52,41,10,9,80,67,121,108,46,44,32,83,112,104,46,0,0,0,0,0,67,111,108,108,105,103,110,111,110,10,9,80,67,121,108,44,32,83,112,104,46,0,0,0,67,104,97,109,98,101,114,108,105,110,32,84,114,105,109,101,116,114,105,99,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,10,9,108,97,116,95,49,61,32,108,111,110,95,49,61,32,108,97,116,95,50,61,32,108,111,110,95,50,61,32,108,97,116,95,51,61,32,108,111,110,95,51,61,0,0,0,0,0,0,69,113,117,97,108,32,65,114,101,97,32,67,121,108,105,110,100,114,105,99,97,108,10,9,67,121,108,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,116,115,61,0,0,0,67,101,110,116,114,97,108,32,67,121,108,105,110,100,114,105,99,97,108,10,9,67,121,108,44,32,83,112,104,0,0,0,67,97,115,115,105,110,105,10,9,67,121,108,44,32,83,112,104,38,69,108,108,0,0,0,66,111,110,110,101,32,40,87,101,114,110,101,114,32,108,97,116,95,49,61,57,48,41,10,9,67,111,110,105,99,32,83,112,104,38,69,108,108,10,9,108,97,116,95,49,61,0,0,66,111,103,103,115,32,69,117,109,111,114,112,104,105,99,10,9,80,67,121,108,46,44,32,110,111,32,105,110,118,46,44,32,83,112,104,46,0,0,0,66,105,112,111,108,97,114,32,99,111,110,105,99,32,111,102,32,119,101,115,116,101,114,110,32,104,101,109,105,115,112,104,101,114,101,10,9,67,111,110,105,99,32,83,112,104,46,0,66,97,99,111,110,32,71,108,111,98,117,108,97,114,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,0,0,0,65,117,103,117,115,116,32,69,112,105,99,121,99,108,111,105,100,97,108,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,65,112,105,97,110,32,71,108,111,98,117,108,97,114,32,73,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,0,0,0,0,0,77,111,100,46,32,83,116,101,114,101,114,111,103,114,97,112,104,105,99,115,32,111,102,32,65,108,97,115,107,97,10,9,65,122,105,40,109,111,100,41,0,0,0,0,0,0,0,0,65,105,116,111,102,102,10,9,77,105,115,99,32,83,112,104,0,0,0,0,0,0,0,0,65,105,114,121,10,9,77,105,115,99,32,83,112,104,44,32,110,111,32,105,110,118,46,10,9,110,111,95,99,117,116,32,108,97,116,95,98,61,0,0,65,122,105,109,117,116,104,97,108,32,69,113,117,105,100,105,115,116,97,110,116,10,9,65,122,105,44,32,83,112,104,38,69,108,108,10,9,108,97,116,95,48,32,103,117,97,109,0,65,108,98,101,114,115,32,69,113,117,97,108,32,65,114,101,97,10,9,67,111,110,105,99,32,83,112,104,38,69,108,108,10,9,108,97,116,95,49,61,32,108,97,116,95,50,61,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,8,212,81,196,216,204,55,64,165,58,244,72,201,19,79,64,0,0,0,0,0,0,78,64,0,0,0,0,0,0,14,64,186,73,12,2,43,135,240,63,96,229,208,34,219,249,238,63,92,143,194,245,40,92,20,64,31,133,235,81,184,30,243,63,0,0,0,0,0,0,240,63,147,147,162,248,165,19,52,64,96,86,73,224,102,216,75,64,0,0,0,0,0,0,75,64,51,51,51,51,51,51,5,64,123,20,174,71,225,122,240,63,219,249,126,106,188,116,239,63,184,30,133,235,81,184,12,64,168,198,75,55,137,65,242,63,59,223,79,141,151,110,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,237,101,153,77,176,66,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,62,64,133,235,81,184,30,69,49,64,207,247,83,227,165,155,242,63,133,235,81,184,30,133,235,63,72,225,122,20,174,71,42,64,242,210,77,98,16,88,249,63,0,0,0,0,0,0,240,63,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,52,33,135,179,100,47,232,63,0,0,0,0,0,0,0,0,163,102,74,22,240,229,207,63,10,26,180,9,144,158,107,63,63,186,95,165,133,66,89,191,37,122,215,168,160,5,165,63,161,15,249,219,92,4,186,191,202,4,54,198,210,176,145,63,132,170,102,16,254,9,209,191,187,247,137,102,18,51,215,191,235,99,244,146,181,252,229,191,148,131,126,75,165,164,242,191,112,117,116,112,54,112,0,0,99,109,0,0,0,0,0,0,97,61,54,51,55,56,51,56,56,46,48,0,0,0,0,0,112,117,116,112,54,0,0,0,105,110,116,108,0,0,0,0,112,117,116,112,53,112,0,0,98,111,103,103,115,0,0,0,72,111,117,103,104,0,0,0,112,117,116,112,53,0,0,0,115,103,101,111,105,100,103,114,105,100,115,0,0,0,0,0,87,32,71,82,73,68,0,0,114,102,61,50,57,55,46,0,112,117,116,112,52,112,0,0,71,82,83,32,49,57,56,48,40,73,85,71,71,44,32,49,57,56,48,41,0,0,0,0,100,114,102,0,0,0,0,0,97,61,54,51,55,56,50,55,48,46,48,0,0,0,0,0,78,65,68,50,55,0,0,0,112,117,116,112,51,112,0,0,107,109,0,0,0,0,0,0,104,111,117,103,104,0,0,0,101,110,117,0,0,0,0,0,112,117,116,112,51,0,0,0,72,101,108,109,101,114,116,32,49,57,48,54,0,0,0,0,114,108,97,116,95,49,0,0,100,110,0,0,0,0,0,0,112,117,116,112,50,0,0,0,114,111,95,108,97,116,95,49,0,0,0,0,0,0,0,0,97,61,54,51,55,56,50,48,48,46,0,0,0,0,0,0,112,117,116,112,49,0,0,0,104,101,108,109,101,114,116,0,112,111,108,121,0,0,0,0,70,105,115,99,104,101,114,32,49,57,54,56,0,0,0,0,116,97,112,101,114,116,117,114,101,0,0,0,0,0,0,0,112,99,111,110,105,99,0,0,68,101,99,105,109,101,116,101,114,0,0,0,0,0,0,0,97,61,54,51,55,56,49,53,48,46,0,0,0,0,0,0,111,114,116,104,111,0,0,0,102,115,99,104,114,54,56,0,111,114,116,101,108,0,0,0,105,110,118,97,108,105,100,32,114,101,113,117,101,115,116,32,116,111,32,112,106,95,112,97,114,97,109,44,32,102,97,116,97,108,10,0,0,0,0,0,98,105,112,99,0,0,0,0,77,111,100,105,102,105,101,100,32,70,105,115,99,104,101,114,32,49,57,54,48,0,0,0,111,109,101,114,99,0,0,0,116,103,101,111,105,100,103,114,105,100,115,0,0,0,0,0,72,69,65,68,69,82,0,0,72,79,77,69,0,0,0,0,97,61,54,51,55,56,49,53,53,46,0,0,0,0,0,0,111,101,97,0,0,0,0,0,102,115,99,104,114,54,48,109,0,0,0,0,0,0,0,0,114,102,61,50,57,56,46,50,53,55,50,50,50,49,48,49,0,0,0,0,0,0,0,0,116,114,102,0,0,0,0,0,114,108,97,116,95,49,0,0,78,111,114,116,104,95,65,109,101,114,105,99,97,110,95,68,97,116,117,109,95,49,57,56,51,0,0,0,0,0,0,0,111,99,101,97,0,0,0,0,70,105,115,99,104,101,114,32,40,77,101,114,99,117,114,121,32,68,97,116,117,109,41,32,49,57,54,48,0,0,0,0,111,98,95,116,114,97,110,0,37,115,10,0,0,0,0,0,114,102,61,50,57,56,46,51,0,0,0,0,0,0,0,0,114,108,111,110,95,49,0,0,110,122,109,103,0,0,0,0,114,111,95,108,111,110,95,49,0,0,0,0,0,0,0,0,97,61,54,51,55,56,49,54,54,46,0,0,0,0,0,0,110,115,112,101,114,0,0,0,102,115,99,104,114,54,48,0,114,108,97,116,95,116,115,0,110,105,99,111,108,0,0,0,69,118,101,114,101,115,116,32,40,83,97,98,97,104,32,38,32,83,97,114,97,119,97,107,41,0,0,0,0,0,0,0,114,108,97,116,95,48,0,0,110,101,108,108,95,104,0,0,49,47,49,48,0,0,0,0,97,61,54,51,55,55,50,57,56,46,53,53,54,0,0,0,110,101,108,108,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,112,114,111,106,0,0,0,101,118,114,115,116,83,83,0,110,97,116,101,97,114,116,104,0,0,0,0,0,0,0,0,98,97,99,111,110,0,0,0,69,118,101,114,101,115,116,32,49,57,54,57,0,0,0,0,109,117,114,100,51,0,0,0,98,111,118,101,114,0,0,0,109,105,115,115,105,110,103,0,97,61,54,51,55,55,50,57,53,46,54,54,52,0,0,0,109,117,114,100,50,0,0,0,71,82,83,56,48,0,0,0,100,101,0,0,0,0,0,0,101,118,114,115,116,54,57,0,78,65,68,56,51,0,0,0,109,117,114,100,49,0,0,0,69,118,101,114,101,115,116,32,49,57,53,54,0,0,0,0,109,111,108,108,0,0,0,0,97,61,54,51,55,55,51,48,49,46,50,52,51,0,0,0,116,110,111,95,117,111,102,102,0,0,0,0,0,0,0,0,109,105,108,108,0,0,0,0,114,111,95,108,97,116,95,112,0,0,0,0,0,0,0,0,101,118,114,115,116,53,54,0,109,105,108,95,111,115,0,0,69,118,101,114,101,115,116,32,49,57,52,56,0,0,0,0,109,101,114,99,0,0,0,0,97,61,54,51,55,55,51,48,52,46,48,54,51,0,0,0,116,108,97,116,95,48,0,0,97,101,97,0,0,0,0,0,109,98,116,102,112,115,0,0,100,109,0,0,0,0,0,0,101,118,114,115,116,52,56,0,109,98,116,102,112,113,0,0,115,117,99,99,101,101,100,101,100,0,0,0,0,0,0,0,69,118,101,114,101,115,116,32,49,56,51,48,0,0,0,0,109,98,116,102,112,112,0,0,97,117,103,117,115,116,0,0,114,102,61,51,48,48,46,56,48,49,55,0,0,0,0,0,109,98,116,95,102,112,115,0,98,103,101,111,99,0,0,0,103,116,120,0,0,0,0,0,97,61,54,51,55,55,50,55,54,46,51,52,53,0,0,0,109,98,116,95,115,0,0,0,83,111,118,105,101,116,32,71,101,111,100,101,116,105,99,32,83,121,115,116,101,109,32,56,53,0,0,0,0,0,0,0,116,101,0,0,0,0,0,0,67,0,0,0,0,0,0,0,101,118,114,115,116,51,48,0,71,114,101,101,107,95,71,101,111,100,101,116,105,99,95,82,101,102,101,114,101,110,99,101,95,83,121,115,116,101,109,95,49,57,56,55,0,0,0,0,108,115,97,116,0,0,0,0,70,65,76,83,69,0,0,0,69,110,103,101,108,105,115,32,49,57,56,53,0,0,0,0,108,111,120,105,109,0,0,0,114,102,61,50,57,56,46,50,53,54,54,0,0,0,0,0,116,110,111,95,111,102,102,0,114,108,111,110,95,50,0,0,108,101,101,95,111,115,0,0,114,111,95,108,111,110,95,112,0,0,0,0,0,0,0,0,73,110,100,105,97,110,32,67,104,97,105,110,0,0,0,0,97,61,54,51,55,56,49,51,54,46,48,53,0,0,0,0,108,101,97,99,0,0,0,0,101,110,103,101,108,105,115,0,99,116,97,98,108,101,0,0,50,48,46,49,49,54,54,57,53,48,54,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,49,48,100,52,51,39,50,50,46,53,34,69,0,0,0,0,108,99,99,97,0,0,0,0,68,101,108,97,109,98,114,101,32,49,56,49,48,32,40,66,101,108,103,105,117,109,41,0,105,110,100,45,99,104,0,0,111,115,108,111,0,0,0,0,114,108,111,110,95,48,0,0,108,99,99,0,0,0,0,0,114,102,61,51,49,49,46,53,0,0,0,0,0,0,0,0,77,101,116,101,114,0,0,0,73,110,100,105,97,110,32,70,111,111,116,0,0,0,0,0,50,51,100,52,50,39,53,56,46,56,49,53,34,69,0,0,108,111,110,103,108,97,116,0,102,97,105,108,101,100,0,0,97,61,54,51,55,54,52,50,56,46,0,0,0,0,0,0,48,46,51,48,52,55,57,56,52,49,0,0,0,0,0,0,97,116,104,101,110,115,0,0,108,97,116,108,111,110,103,0,100,101,108,109,98,114,0,0,105,110,100,45,102,116,0,0,97,112,105,97,110,0,0,0,49,56,100,51,39,50,57,46,56,34,69,0,0,0,0,0,108,97,116,108,111,110,0,0,67,111,109,109,46,32,100,101,115,32,80,111,105,100,115,32,101,116,32,77,101,115,117,114,101,115,32,49,55,57,57,0,101,110,117,0,0,0,0,0,78,84,118,50,32,45,32,108,111,97,100,105,110,103,32,103,114,105,100,32,37,115,0,0,73,110,100,105,97,110,32,89,97,114,100,0,0,0,0,0,115,116,111,99,107,104,111,108,109,0,0,0,0,0,0,0,108,111,110,108,97,116,0,0,114,102,61,51,51,52,46,50,57,0,0,0,0,0,0,0,97,61,54,51,55,56,49,51,54,46,48,0,0,0,0,0,48,46,57,49,52,51,57,53,50,51,0,0,0,0,0,0,100,101,115,0,0,0,0,0,52,100,50,50,39,52,46,55,49,34,69,0,0,0,0,0,71,82,83,56,48,0,0,0,108,97,115,107,0,0,0,0,37,115,0,0,0,0,0,0,97,61,54,51,55,53,55,51,56,46,55,0,0,0,0,0,105,110,100,45,121,100,0,0,98,114,117,115,115,101,108,115,0,0,0,0,0,0,0,0,85,46,83,46,32,83,117,114,118,101,121,111,114,39,115,32,83,116,97,116,117,116,101,32,77,105,108,101,0,0,0,0,108,97,114,114,0,0,0,0,67,80,77,0,0,0,0,0,49,55,100,52,48,39,87,0,114,108,97,116,95,37,100,0,49,54,48,57,46,51,52,55,50,49,56,54,57,52,52,51,55,0,0,0,0,0,0,0,114,108,111,110,99,0,0,0,114,108,111,110,95,49,0,0,108,97,103,114,110,103,0,0,77,69,82,73,84,0,0,0,116,111,95,108,97,116,95,112,0,0,0,0,0,0,0,0,67,108,97,114,107,101,32,49,56,56,48,32,109,111,100,46,0,0,0,0,0,0,0,0,102,101,114,114,111,0,0,0,117,115,45,109,105,0,0,0,108,97,101,97,0,0,0,0,114,102,61,50,57,51,46,52,54,54,51,0,0,0,0,0,116,108,111,110,95,48,0,0,49,48,54,100,52,56,39,50,55,46,55,57,34,69,0,0,85,46,83,46,32,83,117,114,118,101,121,111,114,39,115,32,67,104,97,105,110,0,0,0,108,97,98,114,100,0,0,0,97,61,54,51,55,56,50,52,57,46,49,52,53,0,0,0,116,82,0,0,0,0,0,0,106,97,107,97,114,116,97,0,114,108,97,116,95,50,0,0,50,48,46,49,49,54,56,52,48,50,51,51,54,56,48,52,55,0,0,0,0,0,0,0,107,114,111,118,97,107,0,0,99,108,114,107,56,48,0,0,49,46,0,0,0,0,0,0,55,100,50,54,39,50,50,46,53,34,69,0,0,0,0,0,117,115,45,99,104,0,0,0,107,97,118,55,0,0,0,0,112,106,95,111,112,101,110,95,108,105,98,40,37,115,41,58,32,99,97,108,108,32,102,111,112,101,110,40,37,115,41,32,45,32,37,115,10,0,0,0,67,108,97,114,107,101,32,49,56,54,54,0,0,0,0,0,98,101,114,110,0,0,0,0,85,46,83,46,32,83,117,114,118,101,121,111,114,39,115,32,89,97,114,100,0,0,0,0,87,71,83,56,52,0,0,0,107,97,118,53,0,0,0,0,98,61,54,51,53,54,53,56,51,46,56,0,0,0,0,0,115,100,97,116,117,109,0,0,97,108,115,107,0,0,0,0,49,50,100,50,55,39,56,46,52,34,69,0,0,0,0,0,48,46,57,49,52,52,48,49,56,50,56,56,48,51,54,53,56,0,0,0,0,0,0,0,105,115,101,97,0,0,0,0,80,82,79,74,95,68,69,66,85,71,0,0,0,0,0,0,97,61,54,51,55,56,50,48,54,46,52,0,0,0,0,0,98,110,111,95,100,101,102,115,0,0,0,0,0,0,0,0,114,111,109,101,0,0,0,0,110,116,118,50,0,0,0,0,116,108,97,116,95,116,115,0,117,115,45,121,100,0,0,0,105,109,119,95,112,0,0,0,99,108,114,107,54,54,0,0,112,106,95,97,112,112,108,121,95,103,114,105,100,115,104,105,102,116,40,41,58,32,117,115,101,100,32,37,115,0,0,0,83,71,83,56,53,0,0,0,116,101,115,0,0,0,0,0,115,110,97,100,103,114,105,100,115,0,0,0,0,0,0,0,51,100,52,49,39,49,54,46,53,56,34,87,0,0,0,0,85,46,83,46,32,83,117,114,118,101,121,111,114,39,115,32,70,111,111,116,0,0,0,0,116,111,119,103,115,56,52,61,45,49,57,57,46,56,55,44,55,52,46,55,57,44,50,52,54,46,54,50,0,0,0,0,105,103,104,0,0,0,0,0,44,37,115,0,0,0,0,0,66,101,115,115,101,108,32,49,56,52,49,32,40,78,97,109,105,98,105,97,41,0,0,0,44,37,115,0,0,0,0,0,99,116,97,98,108,101,50,32,45,32,119,114,111,110,103,32,104,101,97,100,101,114,33,0,99,116,97,98,108,101,32,108,111,97,100,105,110,103,32,102,97,105,108,101,100,32,111,110,32,102,114,101,97,100,40,41,32,45,32,98,105,110,97,114,121,32,105,110,99,111,109,112,97,116,105,98,108,101,63,10,0,0,0,0,0,0,0,0,109,97,100,114,105,100,0,0,48,46,51,48,52,56,48,48,54,48,57,54,48,49,50,49,57,0,0,0,0,0,0,0,80,82,79,74,95,68,69,66,85,71,0,0,0,0,0,0,114,104,101,97,108,112,105,120,0,0,0,0,0,0,0,0,97,61,54,51,55,55,52,56,51,46,56,54,53,0,0,0,78,110,69,101,83,115,87,119,0,0,0,0,0,0,0,0,55,52,100,48,52,39,53,49,46,51,34,87,0,0,0,0,117,115,45,102,116,0,0,0,114,103,97,109,109,97,0,0,114,108,97,116,95,50,0,0,104,101,97,108,112,105,120,0,114,111,95,97,108,112,104,97,0,0,0,0,0,0,0,0,98,101,115,115,95,110,97,109,0,0,0,0,0,0,0,0,98,111,103,111,116,97,0,0,85,46,83,46,32,83,117,114,118,101,121,111,114,39,115,32,73,110,99,104,0,0,0,0,114,108,97,116,95,49,0,0,104,97,116,97,110,111,0,0,116,99,122,101,99,104,0,0,66,101,115,115,101,108,32,49,56,52,49,0,0,0,0,0,114,97,122,105,0,0,0,0,114,108,97,116,95,116,115,0,50,100,50,48,39,49,52,46,48,50,53,34,69,0,0,0,49,46,47,51,57,46,51,55,0,0,0,0,0,0,0,0,114,108,97,116,95,116,115,0,104,97,109,109,101,114,0,0,114,102,61,50,57,57,46,49,53,50,56,49,50,56,0,0,112,97,114,105,115,0,0,0,114,108,97,116,95,49,0,0,117,115,45,105,110,0,0,0,103,115,53,48,0,0,0,0,97,61,54,51,55,55,51,57,55,46,49,53,53,0,0,0,109,0,0,0,0,0,0,0,115,110,97,100,103,114,105,100,115,0,0,0,0,0,0,0,116,110,0,0,0,0,0,0,57,100,48,55,39,53,52,46,56,54,50,34,87,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,76,105,110,107,0,0,0,0,0,0,100,110,0,0,0,0,0,0,103,115,52,56,0,0,0,0,37,115,37,99,37,115,0,0,98,101,115,115,101,108,0,0,114,108,97,116,95,49,0,0,108,105,115,98,111,110,0,0,48,46,50,48,49,49,54,56,0,0,0,0,0,0,0,0,103,111,111,100,101,0,0,0,116,102,0,0,0,0,0,0,71,82,83,32,54,55,40,73,85,71,71,32,49,57,54,55,41,0,0,0,0,0,0,0,98,115,111,117,116,104,0,0,97,105,116,111,102,102,0,0,48,100,69,0,0,0,0,0,108,105,110,107,0,0,0,0,103,110,111,109,0,0,0,0,116,114,102,0,0,0,0,0,114,102,61,50,57,56,46,50,52,55,49,54,55,52,50,55,48,0,0,0,0,0,0,0,115,112,114,111,106,0,0,0,110,116,118,49,0,0,0,0,103,114,101,101,110,119,105,99,104,0,0,0,0,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,67,104,97,105,110,0,0,0,0,0,103,110,95,115,105,110,117,0,116,98,0,0,0,0,0,0,71,82,83,54,55,0,0,0,77,69,82,73,84,32,49,57,56,51,0,0,0,0,0,0,116,108,97,116,95,116,115,0,100,97,0,0,0,0,0,0,65,105,114,121,32,49,56,51,48,0,0,0,0,0,0,0,50,48,46,49,49,54,56,0,71,71,82,83,56,55,0,0,115,116,111,119,103,115,56,52,0,0,0,0,0,0,0,0,103,105,110,115,56,0,0,0,116,97,0,0,0,0,0,0,32,32,32,116,114,105,101,100,58,32,37,115,0,0,0,0,65,117,115,116,114,97,108,105,97,110,32,78,97,116,108,32,38,32,83,46,32,65,109,101,114,46,32,49,57,54,57,0,32,32,32,116,114,105,101,100,58,32,37,115,0,0,0,0,67,84,65,66,76,69,32,86,50,0,0,0,0,0,0,0,97,105,114,121,0,0,0,0,99,104,0,0,0,0,0,0,116,108,97,116,95,49,0,0,114,108,111,110,95,50,0,0,103,101,111,115,0,0,0,0,116,101,108,108,112,115,0,0,114,108,97,116,95,116,115,0,97,61,54,51,55,56,49,54,48,46,48,0,0,0,0,0,114,108,97,116,95,50,0,0,116,111,119,103,115,56,52,61,52,52,54,46,52,52,56,44,45,49,50,53,46,49,53,55,44,53,52,50,46,48,54,48,44,48,46,49,53,48,50,44,48,46,50,52,55,48,44,48,46,56,52,50,49,44,45,50,48,46,52,56,57,52,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,70,97,116,104,111,109,0,0,0,0,116,103,97,109,109,97,0,0,114,108,97,116,95,49,0,0,103,101,111,99,101,110,116,0,116,100,97,116,117,109,0,0,114,111,95,108,97,116,95,99,0,0,0,0,0,0,0,0,97,117,115,116,95,83,65,0,79,83,71,66,51,54,0,0,114,108,97,116,95,49,0,0,49,46,56,50,56,56,0,0,116,108,97,116,95,48,0,0,103,97,108,108,0,0,0,0,101,108,108,112,115,61,0,0,116,107,0,0,0,0,0,0,65,110,100,114,97,101,32,49,56,55,54,32,40,68,101,110,46,44,32,73,99,108,110,100,46,41,0,0,0,0,0,0,116,97,122,105,0,0,0,0,116,108,97,116,95,50,0,0,100,77,0,0,0,0,0,0,100,109,0,0,0,0,0,0,78,101,119,32,90,101,97,108,97,110,100,32,71,101,111,100,101,116,105,99,32,68,97,116,117,109,32,49,57,52,57,0,102,97,116,104,0,0,0,0,102,111,117,99,95,115,0,0,37,51,48,48,115,0,0,0,114,102,61,51,48,48,46,48,0,0,0,0,0,0,0,0,105,110,116,108,0,0,0,0,114,108,97,116,95,48,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,83,116,97,116,117,116,101,32,77,105,108,101,0,0,0,0,0,0,102,111,117,99,0,0,0,0,103,101,110,101,114,97,108,0,97,61,54,51,55,55,49,48,52,46,52,51,0,0,0,0,75,105,108,111,109,101,116,101,114,0,0,0,0,0,0,0,115,103,101,111,105,100,103,114,105,100,115,0,0,0,0,0,116,110,111,95,114,111,116,0,116,111,119,103,115,56,52,61,53,57,46,52,55,44,45,53,46,48,52,44,49,56,55,46,52,52,44,48,46,52,55,44,45,48,46,49,44,49,46,48,50,52,44,45,52,46,53,57,57,51,0,0,0,0,0,0,49,54,48,57,46,51,52,52,0,0,0,0,0,0,0,0,102,97,104,101,121,0,0,0,114,116,0,0,0,0,0,0,78,84,118,49,32,37,100,120,37,100,58,32,76,76,61,40,37,46,57,103,44,37,46,57,103,41,32,85,82,61,40,37,46,57,103,44,37,46,57,103,41,0,0,0,0,0,0,0,80,82,79,74,95,76,73,66,0,0,0,0,0,0,0,0,97,110,100,114,97,101,0,0,100,110,0,0,0,0,0,0,110,122,103,100,52,57,0,0,109,105,0,0,0,0,0,0,101,116,109,101,114,99,0,0,112,114,111,106,95,100,101,102,46,100,97,116,0,0,0,0,78,84,118,49,32,71,114,105,100,32,83,104,105,102,116,32,70,105,108,101,0,0,0,0,77,111,100,105,102,105,101,100,32,65,105,114,121,0,0,0,116,97,108,112,104,97,0,0,97,105,114,121,0,0,0,0,73,114,101,108,97,110,100,32,49,57,54,53,0,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,89,97,114,100,0,0,0,0,0,0,101,117,108,101,114,0,0,0,115,112,109,0,0,0,0,0,78,84,118,49,32,103,114,105,100,32,115,104,105,102,116,32,102,105,108,101,32,104,97,115,32,119,114,111,110,103,32,114,101,99,111,114,100,32,99,111,117,110,116,44,32,99,111,114,114,117,112,116,63,0,0,0,98,61,54,51,53,54,48,51,52,46,52,52,54,0,0,0,115,105,110,105,116,0,0,0,109,111,100,95,97,105,114,121,0,0,0,0,0,0,0,0,115,111,95,112,114,111,106,0,99,116,97,98,108,101,50,0,98,110,115,0,0,0,0,0,48,46,57,49,52,52,0,0,101,113,100,99,0,0,0,0,115,118,116,111,95,109,101,116,101,114,0,0,0,0,0,0,112,106,95,103,114,105,100,105,110,102,111,95,105,110,105,116,95,110,116,118,50,40,41,58,32,102,97,105,108,101,100,32,116,111,32,102,105,110,100,32,112,97,114,101,110,116,32,37,56,46,56,115,32,102,111,114,32,37,115,46,10,0,0,0,97,61,54,51,55,55,51,52,48,46,49,56,57,0,0,0,114,102,61,50,57,56,46,50,53,55,0,0,0,0,0,0,115,101,108,108,112,115,0,0,100,116,105,108,116,0,0,0,116,111,119,103,115,56,52,61,52,56,50,46,53,51,48,44,45,49,51,48,46,53,57,54,44,53,54,52,46,53,53,55,44,45,49,46,48,52,50,44,45,48,46,50,49,52,44,45,48,46,54,51,49,44,56,46,49,53,0,0,0,0,0,0,121,100,0,0,0,0,0,0,115,110,97,100,103,114,105,100,115,0,0,0,0,0,0,0,101,113,99,0,0,0,0,0,115,118,117,110,105,116,115,0,78,79,78,69,0,0,0,0,46,46,46,0,0,0,0,0,109,111,100,95,97,105,114,121,0,0,0,0,0,0,0,0,112,106,95,97,112,112,108,121,95,103,114,105,100,115,104,105,102,116,40,41,58,32,102,97,105,108,101,100,32,116,111,32,102,105,110,100,32,97,32,103,114,105,100,32,115,104,105,102,116,32,116,97,98,108,101,32,102,111,114,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,108,111,99,97,116,105,111,110,32,40,37,46,55,102,100,87,44,37,46,55,102,100,78,41,0,0,0,0,0,0,99,116,97,98,108,101,50,32,108,111,97,100,105,110,103,32,102,97,105,108,101,100,32,111,110,32,102,114,101,97,100,40,41,32,45,32,98,105,110,97,114,121,32,105,110,99,111,109,112,97,116,105,98,108,101,63,10,0,0,0,0,0,0,0,73,110,118,101,114,115,101,32,103,114,105,100,32,115,104,105,102,116,32,105,116,101,114,97,116,111,114,32,102,97,105,108,101,100,32,116,111,32,99,111,110,118,101,114,103,101,46,10,0,0,0,0,0,0,0,0,105,114,101,54,53,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,70,111,111,116,0,0,0,0,0,0,114,97,108,112,104,97,0,0,114,108,97,116,95,50,0,0,105,122,111,110,101,0,0,0,101,99,107,54,0,0,0,0,115,116,111,95,109,101,116,101,114,0,0,0,0,0,0,0,71,83,95,67,79,85,78,84,40,37,100,41,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,101,120,112,101,99,116,101,100,32,99,101,108,108,115,32,40,37,100,120,37,100,61,37,100,41,10,0,0,78,97,118,97,108,32,87,101,97,112,111,110,115,32,76,97,98,46,44,32,49,57,54,53,0,0,0,0,0,0,0,0,98,115,111,117,116,104,0,0,114,108,97,116,95,49,0,0,72,101,114,109,97,110,110,115,107,111,103,101,108,0,0,0,48,46,51,48,52,56,0,0,114,97,108,112,104,97,0,0,114,116,104,101,116,97,0,0,114,108,111,110,99,0,0,0,101,99,107,53,0,0,0,0,115,117,110,105,116,115,0,0,114,111,95,108,111,110,95,99,0,0,0,0,0,0,0,0,78,84,118,50,32,37,115,32,37,100,120,37,100,58,32,76,76,61,40,37,46,57,103,44,37,46,57,103,41,32,85,82,61,40,37,46,57,103,44,37,46,57,103,41,10,0,0,0,97,61,54,51,55,56,49,52,53,46,48,46,0,0,0,0,114,82,95,108,97,116,95,103,0,0,0,0,0,0,0,0,100,104,0,0,0,0,0,0,116,111,119,103,115,56,52,61,54,53,51,46,48,44,45,50,49,50,46,48,44,52,52,57,46,48,0,0,0,0,0,0,102,116,0,0,0,0,0,0,114,108,97,116,95,50,0,0,116,108,97,116,95,116,115,0,101,99,107,52,0,0,0,0,100,107,0,0,0,0,0,0,116,108,111,110,95,48,0,0,83,85,66,95,78,65,77,69,0,0,0,0,0,0,0,0,78,87,76,57,68,0,0,0,114,82,95,108,97,116,95,97,0,0,0,0,0,0,0,0,112,111,108,101,0,0,0,0,116,108,97,116,95,49,0,0,116,77,0,0,0,0,0,0,100,110,0,0,0,0,0,0,104,101,114,109,97,110,110,115,107,111,103,101,108,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,73,110,99,104,0,0,0,0,0,0,101,99,107,51,0,0,0,0,116,107,0,0,0,0,0,0,71,84,88,32,37,100,120,37,100,58,32,76,76,61,40,37,46,57,103,44,37,46,57,103,41,32,85,82,61,40,37,46,57,103,44,37,46,57,103,41,0,0,0,0,0,0,0,0,65,112,112,108,46,32,80,104,121,115,105,99,115,46,32,49,57,54,53,0,0,0,0,0,116,82,95,108,97,116,95,103,0,0,0,0,0,0,0,0,105,108,115,97,116,0,0,0,114,108,97,116,95,49,0,0,67,97,114,116,104,97,103,101,32,49,57,51,52,32,84,117,110,105,115,105,97,0,0,0,98,115,111,117,116,104,0,0,48,46,48,50,53,52,0,0,101,99,107,50,0,0,0,0,116,108,97,116,95,48,0,0,100,107,95,48,0,0,0,0,84,104,105,115,32,71,84,88,32,115,112,97,110,115,32,116,104,101,32,100,97,116,101,108,105,110,101,33,32,32,84,104,105,115,32,119,105,108,108,32,99,97,117,115,101,32,112,114,111,98,108,101,109,115,46,0,114,102,61,50,57,56,46,50,53,0,0,0,0,0,0,0,116,82,95,108,97,116,95,97,0,0,0,0,0,0,0,0,99,108,97,114,107,56,48,0,49,48,48,48,46,0,0,0,112,106,95,116,114,97,110,115,102,111,114,109,40,41,58,32,115,111,117,114,99,101,32,112,114,111,106,101,99,116,105,111,110,32,110,111,116,32,105,110,118,101,114,116,97,98,108,101,0,0,0,0,0,0,0,0,105,109,112,111,115,115,105,98,108,101,32,116,114,97,110,115,102,111,114,109,58,32,37,102,32,37,102,32,105,115,32,110,111,116,32,111,110,32,97,110,121,32,116,114,105,97,110,103,108,101,10,0,0,0,0,0,105,110,0,0,0,0,0,0,114,108,97,116,95,49,0,0,101,99,107,49,0,0,0,0,116,107,95,48,0,0,0,0,71,84,88,32,86,101,114,116,105,99,97,108,32,71,114,105,100,32,83,104,105,102,116,32,70,105,108,101,0,0,0,0,46,46,0,0,0,0,0,0,114,108,97,116,95,50,0,0,97,61,54,51,55,56,49,51,55,46,48,46,0,0,0,0,98,82,95,104,0,0,0,0,116,111,119,103,115,56,52,61,45,50,54,51,46,48,44,54,46,48,44,52,51,49,46,48,0,0,0,0,0,0,0,0,100,87,0,0,0,0,0,0,116,114,101,115,99,97,108,101,0,0,0,0,0,0,0,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,78,97,117,116,105,99,97,108,32,77,105,108,101,0,0,0,0,0,100,101,110,111,121,0,0,0,100,121,95,48,0,0,0,0,103,116,120,32,102,105,108,101,32,104,101,97,100,101,114,32,104,97,115,32,105,110,118,97,108,105,100,32,101,120,116,101,110,116,115,44,32,99,111,114,114,117,112,116,63,0,0,0,65,80,76,52,46,57,0,0,98,82,95,103,0,0,0,0,99,97,114,116,104,97,103,101,0,0,0,0,0,0,0,0,98,110,111,95,114,111,116,0,97,101,113,100,0,0,0,0,104,101,120,0,0,0,0,0,49,56,53,50,46,48,0,0,99,114,97,115,116,0,0,0,100,120,95,48,0,0,0,0,67,116,97,98,108,101,32,37,115,32,37,100,120,37,100,58,32,76,76,61,40,37,46,57,103,44,37,46,57,103,41,32,85,82,61,40,37,46,57,103,44,37,46,57,103,41,10,0,65,105,114,121,32,49,56,51,48,0,0,0,0,0,0,0,98,82,95,97,0,0,0,0,116,105,110,105,116,0,0,0,80,111,116,115,100,97,109,32,82,97,117,101,110,98,101,114,103,32,49,57,53,48,32,68,72,68,78,0,0,0,0,0,112,106,95,103,114,105,100,108,105,115,116,46,99,0,0,0,114,108,97,116,95,116,115,0,100,100,0,0,0,0,0,0,114,98,0,0,0,0,0,0,116,108,97,116,95,49,0,0,107,109,105,0,0,0,0,0,99,111,108,108,103,0,0,0,114,108,97,116,95,48,0,0,67,116,97,98,108,101,50,32,37,115,32,37,100,120,37,100,58,32,76,76,61,40,37,46,57,103,44,37,46,57,103,41,32,85,82,61,40,37,46,57,103,44,37,46,57,103,41,10,0,0,0,0,0,0,0,0,98,61,54,51,53,54,50,53,54,46,57,49,48,0,0,0,98,82,95,86,0,0,0,0,98,101,115,115,101,108,0,0,114,108,111,110,95,37,100,0,97,61,54,51,55,56,49,51,55,46,48,0,0,0,0,0,100,82,0,0,0,0,0,0,115,111,114,105,101,110,116,0,100,105,0,0,0,0,0,0,77,105,108,108,105,109,101,116,101,114,0,0,0,0,0,0,116,111,119,103,115,56,52,61,48,44,48,44,48,0,0,0,78,111,114,109,97,108,32,83,112,104,101,114,101,32,40,114,61,54,51,55,48,57,57,55,41,0,0,0,0,0,0,0,101,108,108,112,115,61,0,0,99,104,97,109,98,0,0,0,114,108,97,116,95,116,115,0,114,108,111,110,95,48,0,0,67,84,65,66,76,69,32,86,50,0,0,0,0,0,0,0,98,61,54,51,55,48,57,57,55,46,48,0,0,0,0,0,112,106,95,97,112,112,108,121,95,118,103,114,105,100,115,104,105,102,116,40,41,58,32,102,97,105,108,101,100,32,116,111,32,102,105,110,100,32,97,32,103,114,105,100,32,115,104,105,102,116,32,116,97,98,108,101,32,102,111,114,10,32,32,32,32,32,32,32,32,32,32,32], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);
/* memory initializer */ allocate([32,32,32,32,32,32,32,32,32,32,32,32,108,111,99,97,116,105,111,110,32,40,37,46,55,102,100,87,44,37,46,55,102,100,78,41,0,0,0,0,97,61,54,51,55,55,53,54,51,46,51,57,54,0,0,0,98,82,95,65,0,0,0,0,112,106,95,97,112,112,108,121,95,103,114,105,100,115,104,105,102,116,40,41,58,32,117,115,101,100,32,37,115,0,0,0,97,61,54,51,55,48,57,57,55,46,48,0,0,0,0,0,116,111,119,103,115,56,52,61,53,57,56,46,49,44,55,51,46,55,44,52,49,56,46,50,44,48,46,50,48,50,44,48,46,48,52,53,44,45,50,46,52,53,53,44,54,46,55,0,80,82,79,74,95,68,69,66,85,71,0,0,0,0,0,0,73,110,118,101,114,115,101,32,103,114,105,100,32,115,104,105,102,116,32,105,116,101,114,97,116,105,111,110,32,102,97,105,108,101,100,44,32,112,114,101,115,117,109,97,98,108,121,32,97,116,32,103,114,105,100,32,101,100,103,101,46,10,85,115,105,110,103,32,102,105,114,115,116,32,97,112,112,114,111,120,105,109,97,116,105,111,110,46,10,0,0,0,0,0,0,0,115,112,104,101,114,101,0,0,87,71,83,32,56,52,0,0,116,108,111,110,95,49,0,0,114,102,61,50,57,56,46,50,53,55,50,50,51,53,54,51,0,0,0,0,0,0,0,0,112,108,97,110,101,0,0,0,87,71,83,56,52,0,0,0,87,71,83,32,55,50,0,0,98,103,117,97,109,0,0,0,49,47,49,48,48,48,0,0,100,110,0,0,0,0,0,0,114,102,61,50,57,56,46,50,54,0,0,0,0,0,0,0,100,113,0,0,0,0,0,0,114,108,111,110,95,49,0,0,97,61,54,51,55,56,49,51,53,46,48,0,0,0,0,0,87,71,83,55,50,0,0,0,116,122,111,110,101,0,0,0,99,101,97,0,0,0,0,0,105,110,112,111,108,101,0,0,101,119,110,115,117,100,0,0,71,84,88,0,0,0,0,0,87,71,83,32,54,54,0,0,97,105,114,121,0,0,0,0,114,108,97,116,95,116,115,0,100,98,0,0,0,0,0,0,97,61,54,51,55,56,49,52,53,46,48,0,0,0,0,0,112,111,116,115,100,97,109,0,119,105,110,116,114,105,0,0,116,108,97,116,95,50,0,0,87,71,83,54,54,0,0,0,119,105,110,107,50,0,0,0,87,71,83,32,54,48,0,0,119,105,110,107,49,0,0,0,97,61,54,51,55,56,49,54,53,46,48,0,0,0,0,0,119,101,114,101,110,0,0,0,87,71,83,54,48,0,0,0,119,97,103,55,0,0,0,0,87,97,108,98,101,99,107,0,115,109,111,100,101,0,0,0,119,97,103,54,0,0,0,0,109,109,0,0,0,0,0,0,116,97,108,112,104,97,0,0,98,61,54,51,53,53,56,51,52,46,56,52,54,55,0,0,119,97,103,53,0,0,0,0,100,109,0,0,0,0,0,0,97,61,54,51,55,54,56,57,54,46,48,0,0,0,0,0,116,87,0,0,0,0,0,0,119,97,103,52,0,0,0,0,114,97,108,112,104,97,0,0,99,99,0,0,0,0,0,0,119,97,108,98,101,99,107,0,119,97,103,51,0,0,0,0,115,97,120,105,115,0,0,0,116,111,95,97,108,112,104,97,0,0,0,0,0,0,0,0,71,83,95,84,89,80,69,0,83,111,117,116,104,101,97,115,116,32,65,115,105,97,0,0,119,97,103,50,0,0,0,0,73,65,85,32,49,57,55,54,0,0,0,0,0,0,0,0,116,98,0,0,0,0,0,0,100,97,122,105,0,0,0,0,98,61,54,51,53,54,55,55,51,46,51,50,48,53,0,0,78,111,114,116,104,95,65,109,101,114,105,99,97,110,95,68,97,116,117,109,95,49,57,50,55,0,0,0,0,0,0,0,119,97,103,49,0,0,0,0,97,61,54,51,55,56,49,53,53,46,48,0,0,0,0,0,118,105,116,107,49,0,0,0,83,69,97,115,105,97,0,0,118,97,110,100,103,52,0,0,114,108,97,116,95,116,115,0,80,108,101,115,115,105,115,32,49,56,49,55,32,40,70,114,97,110,99,101,41,0,0,0,118,97,110,100,103,51,0,0,98,61,54,51,53,53,56,54,51,46,0,0,0,0,0,0,118,97,110,100,103,50,0,0,105,112,97,116,104,0,0,0,97,61,54,51,55,54,53,50,51,46,0,0,0,0,0,0,105,114,101,115,111,108,117,116,105,111,110,0,0,0,0,0,118,97,110,100,103,0,0,0,67,101,110,116,105,109,101,116,101,114,0,0,0,0,0,0,116,108,97,116,95,50,0,0,112,108,101,115,115,105,115,0,117,116,109,0,0,0,0,0,114,108,97,116,95,49,0,0,78,101,119,32,73,110,116,101,114,110,97,116,105,111,110,97,108,32,49,57,54,55,0,0,117,114,109,102,112,115,0,0,98,61,54,51,53,54,55,55,50,46,50,0,0,0,0,0,114,97,122,105,0,0,0,0,99,97,115,115,0,0,0,0,114,108,97,116,95,49,0,0,117,114,109,53,0,0,0,0,114,108,111,110,95,119,114,97,112,0,0,0,0,0,0,0,116,108,97,116,95,48,0,0,78,85,77,95,79,82,69,67,0,0,0,0,0,0,0,0,97,61,54,51,55,56,49,53,55,46,53,0,0,0,0,0,117,112,115,0,0,0,0,0,97,61,54,51,55,56,49,52,48,46,48,0,0,0,0,0,100,102,0,0,0,0,0,0,105,115,101,97,0,0,0,0,110,101,119,95,105,110,116,108,0,0,0,0,0,0,0,0,99,108,114,107,54,54,0,0,116,112,101,114,115,0,0,0,114,108,111,110,95,49,0,0,77,97,117,112,101,114,116,105,117,115,32,49,55,51,56,0,116,112,101,113,100,0,0,0,105,115,112,111,108,101,0,0,114,108,97,116,95,50,0,0,114,102,61,49,57,49,46,0,100,87,0,0,0,0,0,0,116,109,101,114,99,0,0,0,114,111,95,108,97,116,95,50,0,0,0,0,0,0,0,0,97,61,54,51,57,55,51,48,48,46,0,0,0,0,0,0,116,105,115,115,111,116,0,0,109,112,114,116,115,0,0,0,116,109,0,0,0,0,0,0,114,108,97,116,95,98,0,0,116,99,101,97,0,0,0,0,115,115,119,101,101,112,0,0,76,101,114,99,104,32,49,57,55,57,0,0,0,0,0,0,116,114,101,115,111,108,117,116,105,111,110,0,0,0,0,0,116,99,99,0,0,0,0,0,97,61,54,51,55,56,49,51,57,46,0,0,0,0,0,0,49,47,49,48,48,0,0,0,116,110,0,0,0,0,0,0,103,115,116,109,101,114,99,0,108,101,114,99,104,0,0,0,115,116,101,114,101,97,0,0,98,111,110,110,101,0,0,0,75,97,117,108,97,32,49,57,54,49,0,0,0,0,0,0,115,116,101,114,101,0,0,0,116,108,111,110,95,119,114,97,112,0,0,0,0,0,0,0,84,79,32,32,32,32,32,32,78,65,68,56,51,32,32,32,0,0,0,0,0,0,0,0,114,102,61,50,57,56,46,50,52,0,0,0,0,0,0,0,115,111,109,101,114,99,0,0,73,65,85,55,54,0,0,0,116,102,0,0,0,0,0,0,97,61,54,51,55,56,49,54,51,46,0,0,0,0,0,0,110,97,100,103,114,105,100,115,61,64,99,111,110,117,115,44,64,97,108,97,115,107,97,44,64,110,116,118,50,95,48,46,103,115,98,44,64,110,116,118,49,95,99,97,110,46,100,97,116,0,0,0,0,0,0,0,115,105,110,117,0,0,0,0,107,97,117,108,97,0,0,0,114,112,111,108,121,0,0,0,114,108,111,110,95,50,0,0,75,114,97,115,115,111,118,115,107,121,44,32,49,57,52,50,0,0,0,0,0,0,0,0,114,111,117,115,115,0,0,0,114,111,95,108,111,110,95,50,0,0,0,0,0,0,0,0,97,61,54,51,55,56,50,52,53,46,48,0,0,0,0,0,114,111,98,105,110,0,0,0,105,97,112,101,114,116,117,114,101,0,0,0,0,0,0,0,107,114,97,115,115,0,0,0,113,117,97,95,97,117,116,0,73,110,116,101,114,110,97,116,105,111,110,97,108,32,49,57,48,57,32,40,72,97,121,102,111,114,100,41,0,0,0,0,100,104,0,0,0,0,0,0,98,110,111,95,99,117,116,0,114,108,97,116,95,50,0,0,114,108,97,116,95,49,0,0,112,106,95,103,114,105,100,108,105,115,116,95,109,101,114,103,101,95,103,114,105,100,102,105,108,101,0,0,0,0,0,0,0,0,0,0,95,41,75,60,204,204,204,47,82,184,158,48,182,243,125,61,202,41,75,60,240,255,151,50,27,133,203,177,182,243,253,61,136,40,75,60,105,102,152,179,156,235,193,50,201,118,62,62,186,44,75,60,203,76,143,52,37,92,181,179,182,243,125,62,53,29,75,60,208,44,134,181,121,107,169,52,82,184,158,62,171,86,75,60,223,140,122,54,86,24,158,181,201,118,190,62,194,128,74,60,95,202,105,183,82,128,147,54,63,53,222,62,239,158,77,60,58,30,90,56,148,219,39,183,127,217,253,62,253,216,73,60,207,172,205,184,166,192,26,55,27,158,14,63,213,28,69,60,113,248,40,56,157,129,177,182,9,27,30,63,107,54,69,60,3,219,35,184,147,153,69,53,82,73,45,63,166,183,63,60,95,22,235,183,225,81,101,181,191,14,60,63,141,19,58,60,111,74,43,184,179,48,11,181,26,81,74,63,112,191,50,60,0,234,75,184,197,218,143,181,158,239,87,63,242,118,41,60,1,172,135,184,214,76,184,49,248,194,100,63,73,223,30,60,201,128,135,184,107,109,15,183,133,124,112,63,245,199,9,60,249,54,74,185,154,69,141,182,177,225,121,63,222,5,202,59,223,55,134,185,110,69,141,182,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,89,148,199,172,180,13,150,184,52,186,80,54,64,164,127,63,75,213,252,185,230,217,208,183,192,162,178,181,137,210,126,63,140,217,89,186,34,41,60,184,232,106,132,181,164,112,125,63,73,108,177,186,57,59,122,184,204,202,118,54,118,113,123,63,54,120,219,186,59,233,150,182,69,16,192,182,135,22,121,63,9,209,12,187,199,125,189,184,77,38,162,50,143,194,117,63,154,240,71,187,174,229,188,184,143,72,221,53,202,84,113,63,215,221,122,187,166,8,137,184,40,124,47,182,250,237,107,63,118,69,153,187,114,74,219,184,124,120,161,54,93,109,101,63,144,181,175,187,105,211,7,184,146,89,182,182,178,46,94,63,40,173,199,187,153,221,238,184,172,38,95,54,143,194,85,63,191,211,228,187,127,67,134,184,252,223,122,53,13,113,76,63,67,130,247,187,44,187,81,184,69,33,123,53,179,123,66,63,45,204,2,188,54,224,22,184,18,190,24,182,43,246,55,63,225,124,11,188,24,9,147,184,169,204,16,183,214,86,44,63,155,148,33,188,51,68,81,185,246,10,161,55,132,13,31,63,66,176,42,188,153,96,185,56,219,99,209,54,179,123,18,63,154,137,20,188,252,214,62,57,7,100,209,54,66,62,8,63,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+20480);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  var _fabs=Math_abs;

  var _sin=Math_sin;

  var _cos=Math_cos;

  var _log=Math_log;

  var _sqrt=Math_sqrt;

  
   
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _hypot(a, b) {
       return Math.sqrt(a*a + b*b);
    }

  var _asin=Math_asin;

  var _atan2=Math_atan2;

  var _atan=Math_atan;

  var _tan=Math_tan;

  var _acos=Math_acos;

  var _llvm_pow_f64=Math_pow;

  
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision === -1) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _cosh(x) {
      var p = Math.pow(Math.E, x);
      return (p + (1 / p)) / 2;
    }

  function _sinh(x) {
      var p = Math.pow(Math.E, x);
      return (p - (1 / p)) / 2;
    }

  var _exp=Math_exp;

  var _floor=Math_floor;

  var _fabsl=Math_abs;

  
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
  
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
  
        if (!total) {
          // early out
          return callback(null);
        }
  
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
  
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
  
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
  
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat, node;
  
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
  
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
  
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
  
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
  
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          FS.FSNode.prototype = {};
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
  
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function _fmod(x, y) {
      return x % y;
    }

  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }

  function _isgraph(chr) {
      return 0x20 < chr && chr < 0x7F;
    }

  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }

  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }

  var _llvm_va_start=undefined;

  function ___errno_location() {
      return ___errno_state;
    }

  function _llvm_va_end() {}

  
  
  
  
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
  
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr;
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
  
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
  
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
  
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }

  
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }

  
  
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }



   
  Module["_strcpy"] = _strcpy;

  
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }

   
  Module["_strcat"] = _strcat;

  
  
  function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
  
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
  
      // Apply sign.
      ret *= multiplier;
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
  
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
  
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
  
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }

  function _strncat(pdest, psrc, num) {
      var len = _strlen(pdest);
      var i = 0;
      while(1) {
        HEAP8[((pdest+len+i)|0)]=HEAP8[((psrc+i)|0)];
        if (HEAP8[(((pdest)+(len+i))|0)] == 0) break;
        i ++;
        if (i == num) {
          HEAP8[(((pdest)+(len+i))|0)]=0;
          break;
        }
      }
      return pdest;
    }

  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }

   
  Module["_strncpy"] = _strncpy;

  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  function _setlocale(category, locale) {
      if (!_setlocale.ret) _setlocale.ret = allocate([0], 'i8', ALLOC_NORMAL);
      return _setlocale.ret;
    }

  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStream(stream);
      if (streamObj) streamObj.error = false;
    }

  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }
  
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
  
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStream(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }function _fscanf(stream, format, varargs) {
      // int fscanf(FILE *restrict stream, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        return -1;
      }
      var buffer = [];
      function get() {
        var c = _fgetc(stream);
        buffer.push(c);
        return c;
      };
      function unget() {
        _ungetc(buffer.pop(), stream);
      };
      return __scanString(format, get, unget, varargs);
    }


  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }

  function _vsprintf(s, format, va_arg) {
      return _sprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  function _pthread_mutex_lock() {}

  function _pthread_mutex_unlock() {}

  
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }

  function _abort() {
      Module['abort']();
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  
  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }var _copysignl=_copysign;

  var _fmodl=_fmod;

  function _llvm_lifetime_start() {}

  var _llvm_memset_p0i8_i64=_memset;

  function _llvm_lifetime_end() {}






  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
___buildEnvironment(ENV);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stderr|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ba=env.abort;var ca=env.assert;var da=env.asmPrintInt;var ea=env.asmPrintFloat;var fa=env.min;var ga=env.invoke_ii;var ha=env.invoke_vi;var ia=env.invoke_iiii;var ja=env.invoke_viii;var ka=env.invoke_v;var la=env.invoke_iii;var ma=env._strncmp;var na=env._llvm_va_end;var oa=env._abort;var pa=env._snprintf;var qa=env._lseek;var ra=env.__scanString;var sa=env._fclose;var ta=env._cosh;var ua=env.__getFloat;var va=env._hypot;var wa=env._fprintf;var xa=env._send;var ya=env.___assert_fail;var za=env._close;var Aa=env._isdigit;var Ba=env._pread;var Ca=env._tan;var Da=env.___buildEnvironment;var Ea=env.__reallyNegative;var Fa=env._fflush;var Ga=env._strchr;var Ha=env._asin;var Ia=env._strncat;var Ja=env._fopen;var Ka=env._log;var La=env._fabs;var Ma=env._floor;var Na=env.___setErrNo;var Oa=env._fseek;var Pa=env._sqrt;var Qa=env._write;var Ra=env._fgetc;var Sa=env._ftell;var Ta=env._exit;var Ua=env._sprintf;var Va=env._llvm_lifetime_end;var Wa=env._rewind;var Xa=env._strrchr;var Ya=env._strdup;var Za=env._sin;var _a=env._sysconf;var $a=env._strtol;var ab=env._fread;var bb=env._fmod;var cb=env._atan;var db=env._read;var eb=env.__exit;var fb=env._time;var gb=env.__formatString;var hb=env._getenv;var ib=env._setlocale;var jb=env.__parseInt;var kb=env._isgraph;var lb=env._sinh;var mb=env._pthread_mutex_unlock;var nb=env._fabsl;var ob=env._recv;var pb=env._pthread_mutex_lock;var qb=env._cos;var rb=env._pwrite;var sb=env._atoi;var tb=env._llvm_pow_f64;var ub=env._fsync;var vb=env._fscanf;var wb=env.___errno_location;var xb=env._isspace;var yb=env._atan2;var zb=env._open;var Ab=env._copysign;var Bb=env._sbrk;var Cb=env._exp;var Db=env._fwrite;var Eb=env._ungetc;var Fb=env._acos;var Gb=env._vsprintf;var Hb=env._strcmp;var Ib=env._llvm_lifetime_start;var Jb=0.0;
// EMSCRIPTEN_START_FUNCS
function Qb(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Rb(){return i|0}function Sb(a){a=a|0;i=a}function Tb(a,b){a=a|0;b=b|0;if((r|0)==0){r=a;s=b}}function Ub(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Vb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Wb(a){a=a|0;E=a}function Xb(a){a=a|0;F=a}function Yb(a){a=a|0;G=a}function Zb(a){a=a|0;H=a}function _b(a){a=a|0;I=a}function $b(a){a=a|0;J=a}function ac(a){a=a|0;K=a}function bc(a){a=a|0;L=a}function cc(a){a=a|0;M=a}function dc(a){a=a|0;N=a}function ec(){}function fc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)!=0){ym(d,c[f>>2]|0,c[f+24>>2]|0,22408);h[f+352>>3]=+h[d>>3];ym(e,c[f>>2]|0,c[f+24>>2]|0,22400);h[f+360>>3]=+h[e>>3];g=hc(f)|0;j=g;i=b;return j|0}e=om(376)|0;f=e;if((e|0)!=0){ln(f|0,0,376)|0;c[f+16>>2]=96;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=12600;c[f+368>>2]=0}g=f;j=g;i=b;return j|0}function gc(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+368>>2]|0)!=0){pm(c[d+368>>2]|0)}pm(d);i=b;return}function hc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0;b=i;d=a;if(+P(+(+h[d+352>>3]+ +h[d+360>>3]))<1.0e-10){Cl(c[d>>2]|0,-21);gc(d);e=0;f=e;i=b;return f|0}g=+T(+h[d+352>>3]);j=g;h[d+304>>3]=g;g=+S(+h[d+352>>3]);a=+P(+(+h[d+352>>3]- +h[d+360>>3]))>=1.0e-10|0;k=+h[d+64>>3]>0.0;c[d+372>>2]=k&1;if(k){k=qm(+h[d+64>>3])|0;c[d+368>>2]=k;if((k|0)==0){gc(d);e=0;f=e;i=b;return f|0}l=+tm(j,g,+h[d+64>>3]);m=+Am(j,+h[d+80>>3],+h[d+96>>3]);if((a|0)!=0){j=+T(+h[d+360>>3]);g=+S(+h[d+360>>3]);n=+tm(j,g,+h[d+64>>3]);h[d+304>>3]=(l*l-n*n)/(+Am(j,+h[d+80>>3],+h[d+96>>3])-m)}n=+h[d+96>>3]*.5*+_((1.0- +h[d+80>>3])/(+h[d+80>>3]+1.0));h[d+296>>3]=1.0-n/+h[d+80>>3];h[d+312>>3]=l*l+ +h[d+304>>3]*m;h[d+320>>3]=1.0/+h[d+304>>3];m=+h[d+320>>3];l=+h[d+312>>3];n=+h[d+304>>3];o=+T(+h[d+120>>3]);h[d+336>>3]=m*+Q(l-n*+Am(o,+h[d+80>>3],+h[d+96>>3]))}else{if((a|0)!=0){h[d+304>>3]=(+h[d+304>>3]+ +T(+h[d+360>>3]))*.5}h[d+328>>3]=+h[d+304>>3]+ +h[d+304>>3];h[d+312>>3]=g*g+ +h[d+328>>3]*j;h[d+320>>3]=1.0/+h[d+304>>3];h[d+336>>3]=+h[d+320>>3]*+Q(+h[d+312>>3]- +h[d+328>>3]*+T(+h[d+120>>3]))}c[d+8>>2]=272;c[d+4>>2]=216;e=d;f=e;i=b;return f|0}function ic(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)!=0){ym(d,c[f>>2]|0,c[f+24>>2]|0,22408);h[f+360>>3]=+h[d>>3];ym(e,c[f>>2]|0,c[f+24>>2]|0,19376);h[f+352>>3]=(c[e>>2]|0)!=0?-1.5707963267948966:1.5707963267948966;g=hc(f)|0;j=g;i=b;return j|0}e=om(376)|0;f=e;if((e|0)!=0){ln(f|0,0,376)|0;c[f+16>>2]=96;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=10112;c[f+368>>2]=0}g=f;j=g;i=b;return j|0}function jc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=+h[g+336>>3]- +h[b+8>>3];h[b+8>>3]=k;l=+va(+j,+k);h[g+344>>3]=l;if(l!=0.0){if(+h[g+304>>3]<0.0){h[g+344>>3]=-0.0- +h[g+344>>3];h[b>>3]=-0.0- +h[b>>3];h[b+8>>3]=-0.0- +h[b+8>>3]}h[f+8>>3]=+h[g+344>>3]/+h[g+320>>3];if((c[g+372>>2]|0)!=0){h[f+8>>3]=(+h[g+312>>3]- +h[f+8>>3]*+h[f+8>>3])/+h[g+304>>3];do{if(+P(+(+h[g+296>>3]- +P(+(+h[f+8>>3]))))>1.0e-7){l=+lc(+h[f+8>>3],+h[g+80>>3],+h[g+96>>3]);h[f+8>>3]=l;if(l!=q){break}Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}}while(0)}else{l=(+h[g+312>>3]- +h[f+8>>3]*+h[f+8>>3])/+h[g+328>>3];h[f+8>>3]=l;if(+P(+l)<=1.0){h[f+8>>3]=+W(+h[f+8>>3])}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}}l=+Y(+(+h[b>>3]),+(+h[b+8>>3]));h[f>>3]=l/+h[g+304>>3]}else{h[f>>3]=0.0;h[f+8>>3]=+h[g+304>>3]>0.0?1.5707963267948966:-1.5707963267948966}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function kc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+312>>3];if((c[g+372>>2]|0)!=0){k=+h[g+304>>3];l=+T(+h[b+8>>3]);m=k*+Am(l,+h[g+80>>3],+h[g+96>>3])}else{m=+h[g+328>>3]*+T(+h[b+8>>3])}l=j-m;h[g+344>>3]=l;if(l<0.0){Cl(c[g>>2]|0,-20);d=a;n=f;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];c[d+8>>2]=c[n+8>>2];c[d+12>>2]=c[n+12>>2];i=e;return}else{h[g+344>>3]=+h[g+320>>3]*+Q(+h[g+344>>3]);l=+h[g+344>>3];n=b|0;m=+h[n>>3]*+h[g+304>>3];h[n>>3]=m;h[f>>3]=l*+T(m);h[f+8>>3]=+h[g+336>>3]- +h[g+344>>3]*+S(+h[b>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}}function lc(a,b,c){a=+a;b=+b;c=+c;var d=0,e=0.0,f=0.0,g=0.0,h=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0;d=i;e=a;a=b;b=c;c=+W(.5*e);if(a<1.0e-7){f=c;g=f;i=d;return+g}h=15;do{j=+T(c);k=a*j;l=1.0-k*k;m=.5*l*l/+S(c)*(e/b-j/l+.5/a*+_((1.0-k)/(1.0+k)));c=c+m;if(+P(+m)>1.0e-10){n=h-1|0;h=n;o=(n|0)!=0}else{o=0}}while(o);if((h|0)!=0){p=c}else{p=q}f=p;g=f;i=d;return+g}function mc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(368)|0;f=a;if((a|0)!=0){ln(f|0,0,368)|0;c[f+16>>2]=160;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=12552;c[f+312>>2]=0}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,17624);h[f+120>>3]=+h[d>>3];if(+P(+(+P(+(+h[f+120>>3]))-1.5707963267948966))<1.0e-10){c[f+360>>2]=+h[f+120>>3]<0.0?1:0;h[f+296>>3]=+h[f+120>>3]<0.0?-1.0:1.0;h[f+304>>3]=0.0}else{if(+P(+(+h[f+120>>3]))<1.0e-10){c[f+360>>2]=2;h[f+296>>3]=0.0;h[f+304>>3]=1.0}else{c[f+360>>2]=3;h[f+296>>3]=+T(+h[f+120>>3]);h[f+304>>3]=+S(+h[f+120>>3])}}if(+h[f+64>>3]!=0.0){d=qm(+h[f+64>>3])|0;c[f+312>>2]=d;if((d|0)==0){nc(f);g=0;j=g;i=b;return j|0}ym(e,c[f>>2]|0,c[f+24>>2]|0,20832);if((c[e>>2]|0)!=0){h[f+320>>3]=+rm(+h[f+120>>3],+h[f+296>>3],+h[f+304>>3],c[f+312>>2]|0);c[f+8>>2]=104;c[f+4>>2]=38}else{e=c[f+360>>2]|0;if((e|0)==0){h[f+336>>3]=+rm(1.5707963267948966,1.0,0.0,c[f+312>>2]|0)}else if((e|0)==1){h[f+336>>3]=+rm(-1.5707963267948966,-1.0,0.0,c[f+312>>2]|0)}else if((e|0)==2|(e|0)==3){c[f+8>>2]=346;c[f+4>>2]=66;h[f+328>>3]=1.0/+Q(1.0- +h[f+64>>3]*+h[f+296>>3]*+h[f+296>>3]);k=+h[f+296>>3];l=+h[f+80>>3]/+Q(+h[f+96>>3]);h[f+344>>3]=l;h[f+352>>3]=k*l;e=f+344|0;h[e>>3]=+h[e>>3]*+h[f+304>>3]}c[f+8>>2]=346;c[f+4>>2]=66}}else{c[f+8>>2]=200;c[f+4>>2]=358}g=f;j=g;i=b;return j|0}function nc(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+312>>2]|0)!=0){pm(c[d+312>>2]|0)}pm(d);i=b;return}function oc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+va(+(+h[b>>3]),+(+h[b+8>>3]));k=j;do{if(j>3.141592653589793){if(k-1.0e-10<=3.141592653589793){k=3.141592653589793;break}Cl(c[g>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}else{if(k>=1.0e-10){break}h[f+8>>3]=+h[g+120>>3];h[f>>3]=0.0;l=a;d=f;c[l>>2]=c[d>>2];c[l+4>>2]=c[d+4>>2];c[l+8>>2]=c[d+8>>2];c[l+12>>2]=c[d+12>>2];i=e;return}}while(0);do{if((c[g+360>>2]|0)==3){m=10}else{if((c[g+360>>2]|0)==2){m=10;break}if((c[g+360>>2]|0)==0){h[f+8>>3]=1.5707963267948966-k;h[f>>3]=+Y(+(+h[b>>3]),+(-0.0- +h[b+8>>3]))}else{h[f+8>>3]=k-1.5707963267948966;h[f>>3]=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}}}while(0);if((m|0)==10){j=+T(k);n=+S(k);if((c[g+360>>2]|0)==2){h[f+8>>3]=+dl(c[g>>2]|0,+h[b+8>>3]*j/k);m=b|0;h[m>>3]=+h[m>>3]*j;h[b+8>>3]=n*k}else{h[f+8>>3]=+dl(c[g>>2]|0,n*+h[g+296>>3]+ +h[b+8>>3]*j*+h[g+304>>3]/k);h[b+8>>3]=(n- +h[g+296>>3]*+T(+h[f+8>>3]))*k;m=b|0;h[m>>3]=+h[m>>3]*j*+h[g+304>>3]}if(+h[b+8>>3]==0.0){o=0.0}else{o=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}h[f>>3]=o}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function pc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+S(+h[b>>3]);d=c[g+360>>2]|0;if((d|0)==1){m=15}else if((d|0)==3){h[f+8>>3]=+h[g+296>>3]*j+ +h[g+304>>3]*k*l;m=4}else if((d|0)==2){h[f+8>>3]=k*l;m=4}else if((d|0)==0){h[b+8>>3]=-0.0- +h[b+8>>3];l=-0.0-l;m=15}do{if((m|0)==4){do{if(+P(+(+P(+(+h[f+8>>3]))-1.0))<1.0e-14){if(+h[f+8>>3]<0.0){Cl(c[g>>2]|0,-20);d=a;n=f;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];c[d+8>>2]=c[n+8>>2];c[d+12>>2]=c[n+12>>2];i=e;return}else{h[f+8>>3]=0.0;h[f>>3]=0.0;break}}else{h[f+8>>3]=+V(+h[f+8>>3]);o=+T(+h[f+8>>3]);n=f+8|0;h[n>>3]=+h[n>>3]/o;h[f>>3]=+h[f+8>>3]*k*+T(+h[b>>3]);if((c[g+360>>2]|0)==2){p=j}else{p=+h[g+304>>3]*j- +h[g+296>>3]*k*l}n=f+8|0;h[n>>3]=+h[n>>3]*p}}while(0)}else if((m|0)==15){if(+P(+(+h[b+8>>3]-1.5707963267948966))>=1.0e-10){o=1.5707963267948966+ +h[b+8>>3];h[f+8>>3]=o;h[f>>3]=o*+T(+h[b>>3]);n=f+8|0;h[n>>3]=+h[n>>3]*l;break}Cl(c[g>>2]|0,-20);n=a;d=f;c[n>>2]=c[d>>2];c[n+4>>2]=c[d+4>>2];c[n+8>>2]=c[d+8>>2];c[n+12>>2]=c[d+12>>2];i=e;return}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function qc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3]*.5*+h[b>>3];h[f+8>>3]=+h[g+120>>3];d=0;while(1){if((d|0)>=3){break}k=+h[g+80>>3]*+T(+h[f+8>>3]);l=+Q(1.0-k*k);k=l;m=+h[g+320>>3]+ +h[b+8>>3]-j*+U(+h[f+8>>3])*l;h[f+8>>3]=+sm(c[g>>2]|0,m,+h[g+64>>3],c[g+312>>2]|0);d=d+1|0}h[f>>3]=+h[b>>3]*k/+S(+h[f+8>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function rc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+T(+h[b+8>>3]);l=1.0/+Q(1.0- +h[g+64>>3]*k*k);h[f>>3]=+h[b>>3]*j*l;m=+rm(+h[b+8>>3],k,j,c[g+312>>2]|0);h[f+8>>3]=m- +h[g+320>>3]+ +h[b>>3]*.5*+h[b>>3]*j*k*l;b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function sc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+va(+(+h[b>>3]),+(+h[b+8>>3]));k=j;if(j<1.0e-10){h[f+8>>3]=+h[g+120>>3];h[f>>3]=0.0;d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}do{if((c[g+360>>2]|0)==3){m=5}else{if((c[g+360>>2]|0)==2){m=5;break}if((c[g+360>>2]|0)==0){n=+h[g+336>>3]-k}else{n=+h[g+336>>3]+k}h[f+8>>3]=+sm(c[g>>2]|0,n,+h[g+64>>3],c[g+312>>2]|0);if((c[g+360>>2]|0)==0){o=-0.0- +h[b+8>>3]}else{o=+h[b+8>>3]}h[f>>3]=+Y(+(+h[b>>3]),+o)}}while(0);if((m|0)==5){o=+Y(+(+h[b>>3]),+(+h[b+8>>3]));n=+S(o);j=+h[g+304>>3]*n;n=+h[g+64>>3]*j/+h[g+96>>3];p=(-0.0-n)*j;n=n*(1.0-p)*3.0*+h[g+296>>3];q=k/+h[g+328>>3];k=q*(1.0-q*q*(p*(1.0+p)/6.0+n*(3.0*p+1.0)*q/24.0));q=1.0-k*k*(p/2.0+n*k/6.0);n=+dl(c[g>>2]|0,+h[g+296>>3]*+S(k)+j*+T(k));h[f>>3]=+dl(c[g>>2]|0,+T(o)*+T(k)/+S(n));k=+P(+n);j=k;if(k<1.0e-10){h[f+8>>3]=0.0}else{if(+P(+(j-1.5707963267948966))<0.0){h[f+8>>3]=1.5707963267948966}else{j=(1.0- +h[g+64>>3]*q*+h[g+296>>3]/+T(n))*+U(n);h[f+8>>3]=+X(j/+h[g+96>>3])}}}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function tc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b>>3]);k=+S(+h[b+8>>3]);l=+T(+h[b+8>>3]);d=c[g+360>>2]|0;if((d|0)==2|(d|0)==3){do{if(+P(+(+h[b>>3]))<1.0e-10){if(+P(+(+h[b+8>>3]- +h[g+120>>3]))>=1.0e-10){break}h[f+8>>3]=0.0;h[f>>3]=0.0;m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}}while(0);o=+Y(+(+h[g+96>>3]*l+ +h[g+64>>3]*+h[g+328>>3]*+h[g+296>>3]*+Q(1.0- +h[g+64>>3]*l*l)),+k);p=+S(o);q=+T(o);o=+T(+h[b>>3])*p;r=+Y(+o,+(+h[g+304>>3]*q- +h[g+296>>3]*j*p));o=+S(r);s=+T(r);if(+P(+s)<1.0e-14){t=(+h[g+304>>3]*q- +h[g+296>>3]*j*p)/o}else{t=+T(+h[b>>3])*p/s}p=+dl(c[g>>2]|0,t);t=+h[g+344>>3]*o;q=t*t;r=+h[g+328>>3]*p*(p*p*((-0.0-q)*(1.0-q)/6.0+p*(+h[g+352>>3]*t*(1.0-2.0*q*q)/8.0+p*((q*(4.0-7.0*q)- +h[g+352>>3]*3.0*+h[g+352>>3]*(1.0-7.0*q))/120.0-p*+h[g+352>>3]*t/48.0)))+1.0);h[f>>3]=r*s;h[f+8>>3]=r*o;m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}else if((d|0)==0){j=-0.0-j}else if((d|0)!=1){m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}o=+h[g+336>>3];r=+P(+(o- +rm(+h[b+8>>3],l,k,c[g+312>>2]|0)));h[f>>3]=r*+T(+h[b>>3]);h[f+8>>3]=r*j;m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}function uc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(336)|0;f=a;if((a|0)!=0){ln(f|0,0,336)|0;c[f+16>>2]=68;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=12512}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,22392);c[f+332>>2]=c[d>>2];ym(e,c[f>>2]|0,c[f+24>>2]|0,21912);k=(1.5707963267948966- +h[e>>3])*.5;if(+P(+k)<1.0e-10){h[f+320>>3]=-.5}else{h[f+320>>3]=1.0/+U(k);l=+h[f+320>>3]*+_(+S(k));e=f+320|0;h[e>>3]=+h[e>>3]*l}if(+P(+(+P(+(+h[f+120>>3]))-1.5707963267948966))<1.0e-10){if(+h[f+120>>3]<0.0){h[f+296>>3]=-1.5707963267948966;c[f+328>>2]=1}else{h[f+296>>3]=1.5707963267948966;c[f+328>>2]=0}}else{if(+P(+(+h[f+120>>3]))<1.0e-10){c[f+328>>2]=2}else{c[f+328>>2]=3;h[f+304>>3]=+T(+h[f+120>>3]);h[f+312>>3]=+S(+h[f+120>>3])}}c[f+4>>2]=110;h[f+64>>3]=0.0;g=f;j=g;i=b;return j|0}function vc(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b>>3]);k=+S(+h[b>>3]);d=c[g+328>>2]|0;if((d|0)==2|(d|0)==3){l=+T(+h[b+8>>3]);m=+S(+h[b+8>>3]);n=m*k;if((c[g+328>>2]|0)==3){n=+h[g+304>>3]*l+ +h[g+312>>3]*n}do{if((c[g+332>>2]|0)==0){if(n>=-1.0e-10){break}Cl(c[g>>2]|0,-20);o=a;p=f;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];i=e;return}}while(0);q=1.0-n;if(+P(+q)>1.0e-10){r=(1.0+n)*.5;n=(-0.0- +_(r))/q;s=n- +h[g+320>>3]/r}else{s=.5- +h[g+320>>3]}h[f>>3]=s*m*j;if((c[g+328>>2]|0)==3){h[f+8>>3]=s*(+h[g+312>>3]*l- +h[g+304>>3]*m*k)}else{h[f+8>>3]=s*l}}else if((d|0)==1|(d|0)==0){h[b+8>>3]=+P(+(+h[g+296>>3]- +h[b+8>>3]));do{if((c[g+332>>2]|0)==0){if(+h[b+8>>3]-1.0e-10<=1.5707963267948966){break}Cl(c[g>>2]|0,-20);d=a;p=f;c[d>>2]=c[p>>2];c[d+4>>2]=c[p+4>>2];c[d+8>>2]=c[p+8>>2];c[d+12>>2]=c[p+12>>2];i=e;return}}while(0);p=b+8|0;l=+h[p>>3]*.5;h[p>>3]=l;if(l>1.0e-10){r=+U(+h[b+8>>3]);l=+_(+S(+h[b+8>>3]))/r;s=(l+r*+h[g+320>>3])*-2.0;h[f>>3]=s*j;h[f+8>>3]=s*k;if((c[g+328>>2]|0)==0){h[f+8>>3]=-0.0- +h[f+8>>3]}}else{h[f+8>>3]=0.0;h[f>>3]=0.0}}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function xc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+304>>2]=0;e=zc(d)|0;f=e;i=b;return f|0}a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=66;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12488}e=d;f=e;i=b;return f|0}function yc(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function zc(a){a=a|0;var b=0;b=a;c[b+8>>2]=0;c[b+4>>2]=210;h[b+64>>3]=0.0;i=i;return b|0}function Ac(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(312)|0;f=a;if((a|0)!=0){ln(f|0,0,312)|0;c[f+16>>2]=66;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=6920}g=f;j=g;i=b;return j|0}c[f+304>>2]=1;ym(d,c[f>>2]|0,c[f+24>>2]|0,20120);do{if((c[d>>2]|0)!=0){ym(e,c[f>>2]|0,c[f+24>>2]|0,21640);k=+S(+h[e>>3]);h[f+296>>3]=k;if(k!=0.0){break}Cl(c[f>>2]|0,-22);yc(f);g=0;j=g;i=b;return j|0}else{h[f+296>>3]=.6366197723675814}}while(0);g=zc(f)|0;j=g;i=b;return j|0}function Bc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+h[b>>3]*.5;l=+V(j*+S(k));j=l;if(l!=0.0){l=2.0*j*+S(+h[b+8>>3])*+T(k);k=1.0/+T(j);h[f+8>>3]=k;h[f>>3]=l*k;k=j*+T(+h[b+8>>3]);d=f+8|0;h[d>>3]=+h[d>>3]*k}else{h[f+8>>3]=0.0;h[f>>3]=0.0}if((c[g+304>>2]|0)==0){m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}h[f>>3]=(+h[f>>3]+ +h[b>>3]*+h[g+296>>3])*.5;h[f+8>>3]=(+h[f+8>>3]+ +h[b+8>>3])*.5;m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}function Cc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+8>>2]=0;c[d+4>>2]=206;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=108;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12360}e=d;f=e;i=b;return f|0}function Dc(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ec(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0,k=0.0,l=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+U(+h[b+8>>3]*.5);g=+Q(1.0-f*f);j=b|0;k=+h[j>>3]*.5;h[j>>3]=k;l=g*+S(k)+1.0;k=+T(+h[b>>3])*g/l;g=f/l;l=k*k;f=g*g;h[e>>3]=1.333333333333333*k*(3.0+l-3.0*f);h[e+8>>3]=1.333333333333333*g*(3.0*l+3.0-f);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Fc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+296>>2]=1;c[d+300>>2]=0;h[d+64>>3]=0.0;c[d+4>>2]=204;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=104;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12320}e=d;f=e;i=b;return f|0}function Gc(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Hc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0,n=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if((c[g+296>>2]|0)!=0){j=1.5707963267948966*+T(+h[b+8>>3])}else{j=+h[b+8>>3]}h[f+8>>3]=j;j=+P(+(+h[b>>3]));k=j;if(j<1.0e-10){h[f>>3]=0.0;l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}do{if((c[g+300>>2]|0)!=0){if(k<1.5707963267948966){n=8;break}h[f>>3]=+Q(2.4674011002723395- +h[b+8>>3]*+h[b+8>>3]+1.0e-10)+k-1.5707963267948966}else{n=8}}while(0);if((n|0)==8){j=(2.4674011002723395/k+k)*.5;h[f>>3]=k-j+ +Q(j*j- +h[f+8>>3]*+h[f+8>>3])}if(+h[b>>3]<0.0){h[f>>3]=-0.0- +h[f>>3]}l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}function Ic(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+300>>2]=0;c[d+296>>2]=0;h[d+64>>3]=0.0;c[d+4>>2]=204;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=104;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12400}e=d;f=e;i=b;return f|0}function Jc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+296>>2]=0;c[d+300>>2]=1;h[d+64>>3]=0.0;c[d+4>>2]=204;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=104;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8728}e=d;f=e;i=b;return f|0}function Kc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)!=0){ym(d,c[e>>2]|0,c[e+24>>2]|0,18168);c[e+296>>2]=c[d>>2];c[e+8>>2]=378;c[e+4>>2]=212;h[e+64>>3]=0.0;f=e;g=f;i=b;return g|0}d=om(304)|0;e=d;if((d|0)!=0){ln(e|0,0,304)|0;c[e+16>>2]=106;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=12272}f=e;g=f;i=b;return g|0}function Lc(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Mc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if((c[g+296>>2]|0)!=0){j=+h[b>>3];h[b>>3]=(-0.0- +h[b>>3])*.6969152303867837+ +h[b+8>>3]*.7171535133114361;h[b+8>>3]=(-0.0- +h[b+8>>3])*.6969152303867837-j*.7171535133114361}d=+h[b>>3]<0.0;k=d&1;if(d){h[b+8>>3]=1.2070912152156872- +h[b+8>>3];l=-.3420201433256687;m=.9396926207859084;n=.8165004367468637}else{d=b+8|0;h[d>>3]=+h[d>>3]+1.2070912152156872;l=.7071067811865476;m=.7071067811865476;n=1.8226184385618593}j=+va(+(+h[b>>3]),+(+h[b+8>>3]));o=j;p=j;q=j;j=+Y(+(+h[b>>3]),+(+h[b+8>>3]));r=j;s=+P(+j);b=10;while(1){if((b|0)==0){break}t=+X(+R(+(o/1.8972474256746104),1.585895806935677))*2.0;j=+V((+R(+(+U(.5*t)),+.6305584488127469)+ +R(+(+U((1.8151424220741028-t)*.5)),+.6305584488127469))/1.27246578267089);if(s<j){if((k|0)!=0){u=r}else{u=-0.0-r}o=p*+S(j+u)}if(+P(+(q-o))<1.0e-10){d=14;break}q=o;b=b-1|0}if((b|0)==0){Cl(c[g>>2]|0,-20);g=a;b=f;c[g>>2]=c[b>>2];c[g+4>>2]=c[b+4>>2];c[g+8>>2]=c[b+8>>2];c[g+12>>2]=c[b+12>>2];i=e;return}r=n-r/.6305584488127469;h[f+8>>3]=+W(l*+S(t)+m*+T(t)*+S(r));h[f>>3]=+Y(+(+T(r)),+(m/+U(t)-l*+S(r)));if((k|0)!=0){k=f|0;h[k>>3]=+h[k>>3]-1.9198621771937625}else{h[f>>3]=-.3489497672625068- +h[f>>3]}k=a;a=f;c[k>>2]=c[a>>2];c[k+4>>2]=c[a+4>>2];c[k+8>>2]=c[a+8>>2];c[k+12>>2]=c[a+12>>2];i=e;return}function Nc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+T(+h[b+8>>3]);l=-.3489497672625068- +h[b>>3];m=l;n=+S(l);m=+T(m);if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<1.0e-10){o=+h[b+8>>3]<0.0?3.141592653589793:0.0;p=q}else{p=k/j;o=+Y(+m,+((p-n)*.7071067811865476))}d=o>1.8226184385618593;r=d&1;if(d){l=+h[b>>3]+1.9198621771937625;m=l;n=+S(l);m=+T(m);s=-.3420201433256687*k+.9396926207859084*j*n;do{if(+P(+s)>1.0){if(+P(+s)>1.000000001){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}else{s=s<0.0?-1.0:1.0;break}}else{s=+V(s)}}while(0);if(p!=q){o=+Y(+m,+(.9396926207859084*p+.3420201433256687*n))}t=.8165004367468637;h[f+8>>3]=1.2070912152156872}else{s=(k+j*n)*.7071067811865476;do{if(+P(+s)>1.0){if(+P(+s)>1.000000001){Cl(c[g>>2]|0,-20);d=a;b=f;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];i=e;return}else{s=s<0.0?-1.0:1.0;break}}else{s=+V(s)}}while(0);t=1.8226184385618593;h[f+8>>3]=-1.2070912152156872}if(s<0.0){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}n=+R(+(+U(.5*s)),+.6305584488127469);j=n;k=1.8972474256746104*n;n=(1.8151424220741028-s)*.5;s=n;if(n<0.0){Cl(c[g>>2]|0,-20);d=a;b=f;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];i=e;return}s=(j+ +R(+s,+.6305584488127469))/1.27246578267089;do{if(+P(+s)>1.0){if(+P(+s)>1.000000001){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}else{s=s<0.0?-1.0:1.0;break}}else{s=+V(s)}}while(0);n=(t-o)*.6305584488127469;j=n;if(+P(+n)<s){if((r|0)!=0){u=j}else{u=-0.0-j}k=k/+S(s+u)}h[f>>3]=k*+T(j);if((r|0)!=0){v=-0.0-k}else{v=k}k=v*+S(j);r=f+8|0;h[r>>3]=+h[r>>3]+k;if((c[g+296>>2]|0)!=0){j=+h[f>>3];h[f>>3]=(-0.0- +h[f>>3])*.6969152303867837- +h[f+8>>3]*.7171535133114361;h[f+8>>3]=(-0.0- +h[f+8>>3])*.6969152303867837+j*.7171535133114361}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Oc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+4>>2]=336;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=174;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12232}e=d;f=e;i=b;return f|0}function Pc(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Qc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0,k=0.0,l=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+h[b+8>>3];if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<1.0e-7){h[e>>3]=0.0}else{g=+T(f)*3.141592653589793;j=20;while(1){if((j|0)==0){break}k=(f+ +T(f)-g)/(+S(f)+1.0);f=f-k;if(+P(+k)<1.0e-7){l=6;break}j=j-1|0}f=f*.5;h[e>>3]=2.00276*+h[b>>3]/(1.0/+S(+h[b+8>>3])+1.11072/+S(f))}h[e+8>>3]=(+h[b+8>>3]+1.4142135623730951*+T(f))*.49931;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Rc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(336)|0;e=a;if((a|0)!=0){ln(e|0,0,336)|0;c[e+16>>2]=172;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=12184;c[e+328>>2]=0}f=e;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,17432);h[e+296>>3]=+h[d>>3];if(+P(+(+h[e+296>>3]))<1.0e-10){Cl(c[e>>2]|0,-23);Sc(e);f=0;g=f;i=b;return g|0}if(+h[e+64>>3]!=0.0){c[e+328>>2]=qm(+h[e+64>>3])|0;j=+h[e+296>>3];k=+T(+h[e+296>>3]);h[e+312>>3]=k;l=+S(+h[e+296>>3]);h[e+320>>3]=+rm(j,k,l,c[e+328>>2]|0);k=+Q(1.0- +h[e+64>>3]*+h[e+312>>3]*+h[e+312>>3]);h[e+312>>3]=l/(k*+h[e+312>>3]);c[e+8>>2]=186;c[e+4>>2]=10}else{if(+P(+(+h[e+296>>3]))+1.0e-10>=1.5707963267948966){h[e+304>>3]=0.0}else{h[e+304>>3]=1.0/+U(+h[e+296>>3])}c[e+8>>2]=214;c[e+4>>2]=342}f=e;g=f;i=b;return g|0}function Sc(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+328>>2]|0)!=0){pm(c[d+328>>2]|0)}pm(d);i=b;return}function Tc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=+h[g+312>>3]- +h[b+8>>3];h[b+8>>3]=k;l=+va(+j,+k);h[f+8>>3]=+sm(c[g>>2]|0,+h[g+312>>3]+ +h[g+320>>3]-l,+h[g+64>>3],c[g+328>>2]|0);k=+P(+(+h[f+8>>3]));j=k;do{if(k<1.5707963267948966){j=+T(+h[f+8>>3]);m=l*+Y(+(+h[b>>3]),+(+h[b+8>>3]));n=m*+Q(1.0- +h[g+64>>3]*j*j);h[f>>3]=n/+S(+h[f+8>>3])}else{if(+P(+(j-1.5707963267948966))<=1.0e-10){h[f>>3]=0.0;break}else{Cl(c[g>>2]|0,-20);d=a;o=f;c[d>>2]=c[o>>2];c[d+4>>2]=c[o+4>>2];c[d+8>>2]=c[o+8>>2];c[d+12>>2]=c[o+12>>2];i=e;return}}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Uc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+312>>3]+ +h[g+320>>3];k=+T(+h[b+8>>3]);l=k;m=+S(+h[b+8>>3]);n=j- +rm(+h[b+8>>3],k,m,c[g+328>>2]|0);l=m*+h[b>>3]/(n*+Q(1.0- +h[g+64>>3]*l*l));h[f>>3]=n*+T(l);h[f+8>>3]=+h[g+312>>3]-n*+S(l);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Vc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=+h[g+304>>3]- +h[b+8>>3];h[b+8>>3]=k;l=+va(+j,+k);h[f+8>>3]=+h[g+304>>3]+ +h[g+296>>3]-l;if(+P(+(+h[f+8>>3]))>1.5707963267948966){Cl(c[g>>2]|0,-20);g=a;d=f;c[g>>2]=c[d>>2];c[g+4>>2]=c[d+4>>2];c[g+8>>2]=c[d+8>>2];c[g+12>>2]=c[d+12>>2];i=e;return}if(+P(+(+P(+(+h[f+8>>3]))-1.5707963267948966))<=1.0e-10){h[f>>3]=0.0}else{k=l*+Y(+(+h[b>>3]),+(+h[b+8>>3]));h[f>>3]=k/+S(+h[f+8>>3])}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+304>>3]+ +h[g+296>>3]- +h[b+8>>3];if(+P(+j)>1.0e-10){k=+h[b>>3]*+S(+h[b+8>>3])/j;h[f>>3]=j*+T(k);h[f+8>>3]=+h[g+304>>3]-j*+S(k)}else{h[f+8>>3]=0.0;h[f>>3]=0.0}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Xc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0;b=i;d=a;if((d|0)==0){a=om(384)|0;d=a;if((a|0)!=0){ln(d|0,0,384)|0;c[d+16>>2]=178;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12160;c[d+376>>2]=0}e=d;f=e;i=b;return f|0}do{if(+h[d+64>>3]!=0.0){a=qm(+h[d+64>>3])|0;c[d+376>>2]=a;if((a|0)!=0){g=+T(+h[d+120>>3]);j=+S(+h[d+120>>3]);h[d+296>>3]=+rm(+h[d+120>>3],g,j,c[d+376>>2]|0);c[d+8>>2]=184;c[d+4>>2]=194;break}Yc(d);e=0;f=e;i=b;return f|0}else{c[d+8>>2]=176;c[d+4>>2]=362}}while(0);e=d;f=e;i=b;return f|0}function Yc(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+376>>2]|0)!=0){pm(c[d+376>>2]|0)}pm(d);i=b;return}function Zc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+sm(c[g>>2]|0,+h[g+296>>3]+ +h[b+8>>3],+h[g+64>>3],c[g+376>>2]|0);h[g+368>>3]=+U(j);h[g+312>>3]=+h[g+368>>3]*+h[g+368>>3];h[g+304>>3]=+T(j);h[g+336>>3]=1.0/(1.0- +h[g+64>>3]*+h[g+304>>3]*+h[g+304>>3]);h[g+304>>3]=+Q(+h[g+336>>3]);d=g+336|0;h[d>>3]=+h[d>>3]*(1.0- +h[g+64>>3])*+h[g+304>>3];h[g+344>>3]=+h[b>>3]/+h[g+304>>3];h[g+352>>3]=+h[g+344>>3]*+h[g+344>>3];h[f+8>>3]=j- +h[g+304>>3]*+h[g+368>>3]/+h[g+336>>3]*+h[g+352>>3]*(.5-(+h[g+312>>3]*3.0+1.0)*+h[g+352>>3]*.041666666666666664);h[f>>3]=+h[g+344>>3]*(+h[g+312>>3]*+h[g+352>>3]*((+h[g+312>>3]*3.0+1.0)*+h[g+352>>3]*.06666666666666667+-.3333333333333333)+1.0)/+S(j);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function _c(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b+8>>3];k=+T(+h[b+8>>3]);h[g+304>>3]=k;l=+S(+h[b+8>>3]);h[g+328>>3]=l;h[f+8>>3]=+rm(j,k,l,c[g+376>>2]|0);h[g+304>>3]=1.0/+Q(1.0- +h[g+64>>3]*+h[g+304>>3]*+h[g+304>>3]);h[g+368>>3]=+U(+h[b+8>>3]);h[g+312>>3]=+h[g+368>>3]*+h[g+368>>3];h[g+320>>3]=+h[b>>3]*+h[g+328>>3];b=g+328|0;h[b>>3]=+h[b>>3]*(+h[g+64>>3]*+h[g+328>>3]/(1.0- +h[g+64>>3]));h[g+360>>3]=+h[g+320>>3]*+h[g+320>>3];h[f>>3]=+h[g+304>>3]*+h[g+320>>3]*(1.0- +h[g+360>>3]*+h[g+312>>3]*(.16666666666666666-(8.0- +h[g+312>>3]+ +h[g+328>>3]*8.0)*+h[g+360>>3]*.008333333333333333));b=f+8|0;h[b>>3]=+h[b>>3]-(+h[g+296>>3]- +h[g+304>>3]*+h[g+368>>3]*+h[g+360>>3]*((5.0- +h[g+312>>3]+ +h[g+328>>3]*6.0)*+h[g+360>>3]*.041666666666666664+.5));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function $c(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b+8>>3]+ +h[g+120>>3];h[g+344>>3]=j;k=+T(j);h[f+8>>3]=+W(k*+S(+h[b>>3]));k=+U(+h[b>>3]);h[f>>3]=+Y(+k,+(+S(+h[g+344>>3])));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ad(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;g=+S(+h[b+8>>3]);h[f>>3]=+W(g*+T(+h[b>>3]));g=+U(+h[b+8>>3]);j=+Y(+g,+(+S(+h[b>>3])));h[f+8>>3]=j- +h[d+120>>3];d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=e;return}function bd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=178;c[d+4>>2]=360;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=58;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12128}e=d;f=e;i=b;return f|0}function cd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e+8>>3]=+X(+h[b+8>>3]);h[e>>3]=+h[b>>3];b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function ed(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<=1.0e-10){Cl(c[d>>2]|0,-20);d=a;g=f;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];c[d+8>>2]=c[g+8>>2];c[d+12>>2]=c[g+12>>2];i=e;return}else{h[f>>3]=+h[b>>3];h[f+8>>3]=+U(+h[b+8>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}}function fd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(312)|0;f=a;if((a|0)!=0){ln(f|0,0,312)|0;c[f+16>>2]=8;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=12080;c[f+304>>2]=0}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,16016);do{if((c[d>>2]|0)!=0){ym(e,c[f>>2]|0,c[f+24>>2]|0,20368);k=+h[e>>3];l=k;m=+S(k);h[f+144>>3]=m;if(m>=0.0){break}Cl(c[f>>2]|0,-24);gd(f);g=0;j=g;i=b;return j|0}}while(0);do{if(+h[f+64>>3]!=0.0){l=+T(l);m=+Q(1.0- +h[f+64>>3]*l*l);e=f+144|0;h[e>>3]=+h[e>>3]/m;h[f+80>>3]=+Q(+h[f+64>>3]);e=xl(+h[f+64>>3])|0;c[f+304>>2]=e;if((e|0)!=0){h[f+296>>3]=+Am(1.0,+h[f+80>>3],+h[f+96>>3]);c[f+8>>2]=158;c[f+4>>2]=320;break}gd(f);g=0;j=g;i=b;return j|0}else{c[f+8>>2]=72;c[f+4>>2]=56}}while(0);g=f;j=g;i=b;return j|0}function gd(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+304>>2]|0)!=0){pm(c[d+304>>2]|0)}pm(d);i=b;return}function hd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+W(+h[b+8>>3]*2.0*+h[g+144>>3]/+h[g+296>>3]);h[f+8>>3]=+yl(j,c[g+304>>2]|0);h[f>>3]=+h[b>>3]/+h[g+144>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function id(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=+h[g+144>>3]*+h[b>>3];j=+T(+h[b+8>>3]);k=+Am(j,+h[g+80>>3],+h[g+96>>3])*.5;h[f+8>>3]=k/+h[g+144>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function jd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b+8|0;j=+h[d>>3]*+h[g+144>>3];h[d>>3]=j;k=+P(+j);if(k-1.0e-10>1.0){Cl(c[g>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}if(k>=1.0){h[f+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}else{h[f+8>>3]=+W(+h[b+8>>3])}h[f>>3]=+h[b>>3]/+h[g+144>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function kd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=+h[g+144>>3]*+h[b>>3];j=+T(+h[b+8>>3]);h[f+8>>3]=j/+h[g+144>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ld(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0;b=i;i=i+48|0;d=b|0;e=b+16|0;f=b+24|0;g=b+32|0;j=a;if((j|0)==0){a=om(552)|0;j=a;if((a|0)!=0){ln(j|0,0,552)|0;c[j+16>>2]=38;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+20>>2]=11992}k=j;l=k;i=b;return l|0}a=0;while(1){if((a|0)>=3){break}Ua(d|0,15448,(m=i,i=i+8|0,c[m>>2]=a+1,m)|0)|0;i=m;ym(e,c[j>>2]|0,c[j+24>>2]|0,d|0);h[j+296+(a*72|0)>>3]=+h[e>>3];Ua(d|0,20240,(m=i,i=i+8|0,c[m>>2]=a+1,m)|0)|0;i=m;ym(f,c[j>>2]|0,c[j+24>>2]|0,d|0);h[j+296+(a*72|0)+8>>3]=+h[f>>3];h[j+296+(a*72|0)+8>>3]=+hl(+h[j+296+(a*72|0)+8>>3]- +h[j+112>>3]);h[j+296+(a*72|0)+16>>3]=+S(+h[j+296+(a*72|0)>>3]);h[j+296+(a*72|0)+24>>3]=+T(+h[j+296+(a*72|0)>>3]);a=a+1|0}a=0;while(1){if((a|0)>=3){break}if((a|0)==2){n=0}else{n=a+1|0}f=n;nd(g,c[j>>2]|0,+h[j+296+(f*72|0)>>3]- +h[j+296+(a*72|0)>>3],+h[j+296+(a*72|0)+16>>3],+h[j+296+(a*72|0)+24>>3],+h[j+296+(f*72|0)+16>>3],+h[j+296+(f*72|0)+24>>3],+h[j+296+(f*72|0)+8>>3]- +h[j+296+(a*72|0)+8>>3]);f=j+296+(a*72|0)+32|0;d=g;c[f>>2]=c[d>>2];c[f+4>>2]=c[d+4>>2];c[f+8>>2]=c[d+8>>2];c[f+12>>2]=c[d+12>>2];if(+h[j+296+(a*72|0)+32>>3]==0.0){o=15;break}a=a+1|0}if((o|0)==15){Cl(c[j>>2]|0,-25);md(j);k=0;l=k;i=b;return l|0}h[j+528>>3]=+od(c[j>>2]|0,+h[j+328>>3],+h[j+472>>3],+h[j+400>>3]);h[j+536>>3]=+od(c[j>>2]|0,+h[j+328>>3],+h[j+400>>3],+h[j+472>>3]);h[j+544>>3]=3.141592653589793- +h[j+528>>3];p=+h[j+472>>3]*+T(+h[j+528>>3]);h[j+424>>3]=p;h[j+352>>3]=p;h[j+520>>3]=2.0*p;h[j+496>>3]=0.0;p=+h[j+328>>3]*.5;h[j+416>>3]=p;h[j+344>>3]=-0.0-p;p=+h[j+344>>3]+ +h[j+472>>3]*+S(+h[j+528>>3]);h[j+488>>3]=p;h[j+512>>3]=p;h[j+64>>3]=0.0;c[j+4>>2]=54;k=j;l=k;i=b;return l|0}function md(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function nd(a,b,d,e,f,g,j,k){a=a|0;b=b|0;d=+d;e=+e;f=+f;g=+g;j=+j;k=+k;var l=0,m=0,n=0,o=0.0,p=0,q=0.0,r=0.0,s=0,t=0;l=i;i=i+16|0;m=l|0;n=b;o=d;d=e;e=f;f=g;g=j;j=k;k=+S(j);do{if(+P(+o)>1.0){p=3}else{if(+P(+j)>1.0){p=3;break}q=+T(.5*o);r=+T(.5*j);h[m>>3]=+dl(n,+Q(q*q+d*f*r*r))*2.0}}while(0);if((p|0)==3){h[m>>3]=+el(n,e*g+d*f*k)}if(+P(+(+h[m>>3]))>1.0e-9){h[m+8>>3]=+Y(+(f*+T(j)),+(d*g-e*f*k));s=a;t=m;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[s+12>>2]=c[t+12>>2];i=l;return}else{h[m+8>>3]=0.0;h[m>>3]=0.0;s=a;t=m;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[s+12>>2]=c[t+12>>2];i=l;return}}function od(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;var e=0,f=0.0;e=i;f=b;b=c;c=d;d=+el(a,(f*f+b*b-c*c)*.5/(f*b));i=e;return+d}function pd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+80|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+64|0;k=d;ln(f|0,0,16)|0;l=+T(+h[b+8>>3]);m=+S(+h[b+8>>3]);d=0;while(1){if((d|0)>=3){break}nd(j,c[k>>2]|0,+h[b+8>>3]- +h[k+296+(d*72|0)>>3],+h[k+296+(d*72|0)+16>>3],+h[k+296+(d*72|0)+24>>3],m,l,+h[b>>3]- +h[k+296+(d*72|0)+8>>3]);n=g+(d<<4)|0;o=j;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];if(+h[g+(d<<4)>>3]==0.0){o=4;break}h[g+(d<<4)+8>>3]=+hl(+h[g+(d<<4)+8>>3]- +h[k+296+(d*72|0)+40>>3]);d=d+1|0}if((d|0)<3){j=f;b=k+296+(d*72|0)+48|0;c[j>>2]=c[b>>2];c[j+4>>2]=c[b+4>>2];c[j+8>>2]=c[b+8>>2];c[j+12>>2]=c[b+12>>2];p=a;q=f;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];c[p+12>>2]=c[q+12>>2];i=e;return}b=f;j=k+512|0;c[b>>2]=c[j>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];d=0;while(1){if((d|0)>=3){break}if((d|0)==2){r=0}else{r=d+1|0}l=+od(c[k>>2]|0,+h[k+296+(d*72|0)+32>>3],+h[g+(d<<4)>>3],+h[g+(r<<4)>>3]);if(+h[g+(d<<4)+8>>3]<0.0){l=-0.0-l}if((d|0)!=0){if((d|0)==1){l=+h[k+536>>3]-l;m=+h[g+(d<<4)>>3]*+S(l);j=f|0;h[j>>3]=+h[j>>3]-m;m=+h[g+(d<<4)>>3]*+T(l);j=f+8|0;h[j>>3]=+h[j>>3]-m}else{l=+h[k+544>>3]-l;m=+h[g+(d<<4)>>3]*+S(l);j=f|0;h[j>>3]=+h[j>>3]+m;m=+h[g+(d<<4)>>3]*+T(l);j=f+8|0;h[j>>3]=+h[j>>3]+m}}else{m=+h[g+(d<<4)>>3]*+S(l);j=f|0;h[j>>3]=+h[j>>3]+m;m=+h[g+(d<<4)>>3]*+T(l);j=f+8|0;h[j>>3]=+h[j>>3]-m}d=d+1|0}d=f|0;h[d>>3]=+h[d>>3]*.3333333333333333;d=f+8|0;h[d>>3]=+h[d>>3]*.3333333333333333;p=a;q=f;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];c[p+12>>2]=c[q+12>>2];i=e;return}function qd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=68;c[d+4>>2]=60;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=40;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11968}e=d;f=e;i=b;return f|0}function rd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function sd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/1.772453850905516-1.0;j=1.0- +h[f+8>>3]*+h[f+8>>3];h[f+8>>3]=j;do{if(+P(+j)<1.0){h[f+8>>3]=+W(+h[f+8>>3])}else{if(+P(+(+h[f+8>>3]))>1.0000001){Cl(c[g>>2]|0,-20);d=a;k=f;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;break}}}while(0);j=1.0- +T(+h[f+8>>3]);h[f>>3]=j;if(j<=0.0){h[f>>3]=0.0}else{h[f>>3]=+h[b>>3]/(1.1283791670955126*+Q(+h[f>>3]))}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function td(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=1.0- +T(+h[b+8>>3]);h[e+8>>3]=f;if(f<=0.0){h[e+8>>3]=0.0}else{h[e+8>>3]=+Q(+h[e+8>>3])}h[e>>3]=1.1283791670955126*+h[b>>3]*+h[e+8>>3];h[e+8>>3]=1.772453850905516*(1.0- +h[e+8>>3]);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function ud(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=4;c[d+4>>2]=152;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=78;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11920}e=d;f=e;i=b;return f|0}function vd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function wd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e+8>>3]=+W(+h[b+8>>3]*.32573500793527993)*3.0;h[e>>3]=+h[b>>3]*1.0233267079464885/(+S((+h[e+8>>3]+ +h[e+8>>3])*.3333333333333333)*2.0-1.0);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function xd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=b+8|0;h[f>>3]=+h[f>>3]*.3333333333333333;h[e>>3]=+h[b>>3]*.9772050238058398*(+S(+h[b+8>>3]+ +h[b+8>>3])*2.0-1.0);h[e+8>>3]=3.0699801238394655*+T(+h[b+8>>3]);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function yd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+4>>2]=156;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=80;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11872}e=d;f=e;i=b;return f|0}function zd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ad(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e+8>>3]=+h[b+8>>3];h[e>>3]=+h[b>>3];h[b>>3]=+P(+(+h[b>>3]));f=+S((+h[b>>3]*(+h[b>>3]*+h[b>>3]*.0016666666666666666+-.08333333333333333)+.95)*+h[b+8>>3]*(+h[b+8>>3]*.03*+h[b+8>>3]*+h[b+8>>3]*+h[b+8>>3]+.9));b=e|0;h[b>>3]=+h[b>>3]*f;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Bd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=6;c[d+4>>2]=154;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=82;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11848}e=d;f=e;i=b;return f|0}function Cd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e+8>>3]=+h[b+8>>3]/.9213177319235613;h[e>>3]=+h[b>>3]/((1.0- +P(+(+h[e+8>>3]))*.3183098861837907)*.9213177319235613);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Ed(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3]*.9213177319235613*(1.0- +P(+(+h[b+8>>3]))*.3183098861837907);h[e+8>>3]=+h[b+8>>3]*.9213177319235613;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Fd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=8;c[d+4>>2]=286;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=76;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11824}e=d;f=e;i=b;return f|0}function Gd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Hd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=2.0- +P(+(+h[b+8>>3]))/1.4472025091165353;h[f+8>>3]=k;h[f>>3]=j/(.46065886596178063*k);h[f+8>>3]=(4.0- +h[f+8>>3]*+h[f+8>>3])*.3333333333333333;do{if(+P(+(+h[f+8>>3]))>=1.0){if(+P(+(+h[f+8>>3]))>1.0000001){Cl(c[g>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;break}}else{h[f+8>>3]=+W(+h[f+8>>3])}}while(0);if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Id(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+h[b>>3]*.46065886596178063;g=+Q(4.0- +T(+P(+(+h[b+8>>3])))*3.0);h[e+8>>3]=g;h[e>>3]=f*g;h[e+8>>3]=1.4472025091165353*(2.0- +h[e+8>>3]);if(+h[b+8>>3]<0.0){h[e+8>>3]=-0.0- +h[e+8>>3]}b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Jd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.4222382003157712;h[d+304>>3]=.8444764006315424;h[d+312>>3]=1.0;h[d+320>>3]=.4052847345693511;e=Ld(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=148;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11800}e=d;f=e;i=b;return f|0}function Kd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ld(a){a=a|0;var b=0;b=a;h[b+64>>3]=0.0;c[b+8>>2]=46;c[b+4>>2]=282;i=i;return b|0}function Md(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.2632401569273185;h[d+296>>3]=.8660254037844;h[d+304>>3]=1.0;h[d+312>>3]=0.0;h[d+320>>3]=.3039635509270133;e=Ld(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=148;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10584}e=d;f=e;i=b;return f|0}function Nd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+304>>3]=.94745;h[d+296>>3]=.94745;h[d+312>>3]=0.0;h[d+320>>3]=.3039635509270133;e=Ld(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=148;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7088}e=d;f=e;i=b;return f|0}function Od(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=1.8949;h[d+304>>3]=.94745;h[d+312>>3]=-.5;h[d+320>>3]=.3039635509270133;e=Ld(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=148;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8584}e=d;f=e;i=b;return f|0}function Pd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/+h[g+304>>3];j=+h[b>>3];k=+h[g+296>>3];l=+h[g+312>>3];h[f>>3]=j/(k*(l+ +fl(1.0- +h[g+320>>3]*+h[f+8>>3]*+h[f+8>>3])));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Qd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[g+304>>3]*+h[b+8>>3];j=+h[g+296>>3]*+h[b>>3];k=+h[g+312>>3];h[f>>3]=j*(k+ +fl(1.0- +h[g+320>>3]*+h[b+8>>3]*+h[b+8>>3]));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Rd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=296;c[d+4>>2]=284;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=150;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11776}e=d;f=e;i=b;return f|0}function Sd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Td(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+dl(c[g>>2]|0,+h[b+8>>3]/1.3265004281770023);j=+S(+h[f+8>>3]);h[f>>3]=+h[b>>3]/((1.0+j)*.4222382003157712);h[f+8>>3]=+dl(c[g>>2]|0,(+h[f+8>>3]+ +T(+h[f+8>>3])*(j+2.0))/3.5707963267948966);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Ud(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=3.5707963267948966*+T(+h[b+8>>3]);g=+h[b+8>>3]*+h[b+8>>3];j=b+8|0;h[j>>3]=+h[j>>3]*(g*(g*.00826809+.0218849)+.895168);j=6;while(1){if((j|0)==0){break}k=+S(+h[b+8>>3]);l=+T(+h[b+8>>3]);m=(+h[b+8>>3]+l*(k+2.0)-f)/(k*(k+2.0)+1.0-l*l);g=m;n=b+8|0;h[n>>3]=+h[n>>3]-m;if(+P(+g)<1.0e-7){n=4;break}j=j-1|0}if((j|0)!=0){h[e>>3]=+h[b>>3]*.4222382003157712*(+S(+h[b+8>>3])+1.0);h[e+8>>3]=1.3265004281770023*+T(+h[b+8>>3]);o=a;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];i=d;return}else{h[e>>3]=+h[b>>3]*.4222382003157712;h[e+8>>3]=+h[b+8>>3]<0.0?-1.3265004281770023:1.3265004281770023;o=a;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];i=d;return}}function Vd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=302;c[d+4>>2]=274;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=146;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11752}e=d;f=e;i=b;return f|0}function Wd(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Xd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=2.267508027238226*+h[b>>3];g=1.133754013619113*+h[b+8>>3];h[e+8>>3]=g;h[e>>3]=f/(+S(g)+1.0);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Yd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=(+S(+h[b+8>>3])+1.0)*.4410127717245515;h[e>>3]=f*+h[b>>3];h[e+8>>3]=+h[b+8>>3]*.882025543449103;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Zd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(304)|0;e=a;if((a|0)!=0){ln(e|0,0,304)|0;c[e+16>>2]=72;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=11656}f=e;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,14072);j=+S(+h[d>>3]);h[e+296>>3]=j;if(j<=0.0){Cl(c[e>>2]|0,-24);_d(e);f=0;g=f;i=b;return g|0}c[e+8>>2]=20;c[e+4>>2]=276;h[e+64>>3]=0.0;f=e;g=f;i=b;return g|0}function _d(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function $d(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=+h[b>>3]/+h[g+296>>3];h[f+8>>3]=+h[b+8>>3]+ +h[g+120>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ae(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=+h[g+296>>3]*+h[b>>3];h[f+8>>3]=+h[b+8>>3]- +h[g+120>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function be(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(352)|0;f=a;if((a|0)!=0){ln(f|0,0,352)|0;c[f+16>>2]=74;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=11600;c[f+344>>2]=0}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,13896);h[f+296>>3]=+h[d>>3];ym(e,c[f>>2]|0,c[f+24>>2]|0,19704);h[f+304>>3]=+h[e>>3];if(+P(+(+h[f+296>>3]+ +h[f+304>>3]))<1.0e-10){Cl(c[f>>2]|0,-21);ce(f);g=0;j=g;i=b;return j|0}e=qm(+h[f+64>>3])|0;c[f+344>>2]=e;if((e|0)==0){ce(f);g=0;j=g;i=b;return j|0}k=+T(+h[f+296>>3]);l=k;h[f+312>>3]=k;k=+S(+h[f+296>>3]);e=+P(+(+h[f+296>>3]- +h[f+304>>3]))>=1.0e-10|0;d=+h[f+64>>3]>0.0;c[f+348>>2]=d&1;if(d){m=+tm(l,k,+h[f+64>>3]);n=+rm(+h[f+296>>3],l,k,c[f+344>>2]|0);if((e|0)!=0){l=+T(+h[f+304>>3]);k=+S(+h[f+304>>3]);o=m- +tm(l,k,+h[f+64>>3]);h[f+312>>3]=o/(+rm(+h[f+304>>3],l,k,c[f+344>>2]|0)-n)}h[f+336>>3]=n+m/+h[f+312>>3];m=+h[f+336>>3];n=+T(+h[f+120>>3]);l=+S(+h[f+120>>3]);h[f+328>>3]=m- +rm(+h[f+120>>3],n,l,c[f+344>>2]|0)}else{if((e|0)!=0){l=k- +S(+h[f+304>>3]);h[f+312>>3]=l/(+h[f+304>>3]- +h[f+296>>3])}l=+S(+h[f+296>>3]);h[f+336>>3]=+h[f+296>>3]+l/+h[f+312>>3];h[f+328>>3]=+h[f+336>>3]- +h[f+120>>3]}c[f+8>>2]=246;c[f+4>>2]=30;c[f+12>>2]=268;g=f;j=g;i=b;return j|0}function ce(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+344>>2]|0)!=0){pm(c[d+344>>2]|0)}pm(d);i=b;return}function de(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=+h[g+328>>3]- +h[b+8>>3];h[b+8>>3]=k;l=+va(+j,+k);h[g+320>>3]=l;if(l==0.0){h[f>>3]=0.0;h[f+8>>3]=+h[g+312>>3]>0.0?1.5707963267948966:-1.5707963267948966;m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}if(+h[g+312>>3]<0.0){h[g+320>>3]=-0.0- +h[g+320>>3];h[b>>3]=-0.0- +h[b>>3];h[b+8>>3]=-0.0- +h[b+8>>3]}h[f+8>>3]=+h[g+336>>3]- +h[g+320>>3];if((c[g+348>>2]|0)!=0){h[f+8>>3]=+sm(c[g>>2]|0,+h[f+8>>3],+h[g+64>>3],c[g+344>>2]|0)}l=+Y(+(+h[b>>3]),+(+h[b+8>>3]));h[f>>3]=l/+h[g+312>>3];m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}function ee(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+336>>3];if((c[g+348>>2]|0)!=0){k=+T(+h[b+8>>3]);l=+S(+h[b+8>>3]);m=+rm(+h[b+8>>3],k,l,c[g+344>>2]|0)}else{m=+h[b+8>>3]}h[g+320>>3]=j-m;m=+h[g+320>>3];d=b|0;j=+h[d>>3]*+h[g+312>>3];h[d>>3]=j;h[f>>3]=m*+T(j);h[f+8>>3]=+h[g+328>>3]- +h[g+320>>3]*+S(+h[b>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function fe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;f=a;a=i;i=i+16|0;c[a>>2]=c[f>>2];c[a+4>>2]=c[f+4>>2];c[a+8>>2]=c[f+8>>2];c[a+12>>2]=c[f+12>>2];f=b;b=d;g=+T(+h[a+8>>3]);j=+S(+h[a+8>>3]);d=b+96|0;c[d>>2]=c[d>>2]|4;h[b+32>>3]=1.0;k=+h[f+312>>3];l=+h[f+336>>3];if((c[f+348>>2]|0)!=0){m=+rm(+h[a+8>>3],g,j,c[f+344>>2]|0)}else{m=+h[a+8>>3]}h[b+40>>3]=k*(l-m)/+tm(g,j,+h[f+64>>3]);i=e;return}function ge(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=316;c[d+4>>2]=412;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=142;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11472}e=d;f=e;i=b;return f|0}function he(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function ie(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=b+8|0;g=+h[f>>3]/1.819152;h[f>>3]=g;h[e+8>>3]=+X(g)*2.0;g=1.0- +h[b+8>>3]*+h[b+8>>3];h[b+8>>3]=g;if(+P(+g)<1.0e-6){j=0.0}else{j=+h[b>>3]/(+Q(+h[b+8>>3])*.819152)}h[e>>3]=j;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function je(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+U(+h[b+8>>3]*.5);h[e>>3]=f;h[e+8>>3]=1.819152*f;f=+h[b>>3]*.819152;h[e>>3]=f*+fl(1.0- +h[e>>3]*+h[e>>3]);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function ke(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(312)|0;e=a;if((a|0)!=0){ln(e|0,0,312)|0;c[e+16>>2]=70;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=11416}f=e;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,13544);h[e+296>>3]=+h[d>>3];do{if(+h[e+296>>3]>=0.0){if(+h[e+296>>3]>1.0){break}h[e+304>>3]=1.0- +h[e+296>>3];h[e+64>>3]=0.0;c[e+8>>2]=314;c[e+4>>2]=414;f=e;g=f;i=b;return g|0}}while(0);Cl(c[e>>2]|0,-99);le(e);f=0;g=f;i=b;return g|0}function le(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function me(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+h[g+296>>3]!=0.0){h[f+8>>3]=+h[b+8>>3];d=10;while(1){if((d|0)==0){break}j=+h[g+296>>3]*+h[f+8>>3]+ +h[g+304>>3]*+T(+h[f+8>>3]);k=(j- +h[b+8>>3])/(+h[g+296>>3]+ +h[g+304>>3]*+S(+h[f+8>>3]));l=k;m=f+8|0;h[m>>3]=+h[m>>3]-k;if(+P(+l)<1.0e-7){m=5;break}d=d-1|0}if((d|0)==0){h[f+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}}else{h[f+8>>3]=+dl(c[g>>2]|0,+h[b+8>>3])}l=+S(+h[f+8>>3]);h[f>>3]=+h[b>>3]*(+h[g+296>>3]+ +h[g+304>>3]*l)/l;g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ne(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);h[f>>3]=+h[b>>3]*j/(+h[g+296>>3]+ +h[g+304>>3]*j);h[f+8>>3]=+h[g+296>>3]*+h[b+8>>3]+ +h[g+304>>3]*+T(+h[b+8>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function oe(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=310;c[d+4>>2]=416;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=140;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11376}e=d;f=e;i=b;return f|0}function pe(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function qe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=1.4142135623730951*+h[b>>3];h[e+8>>3]=+X(+h[b+8>>3]*.585786437626905)*2.0;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function re(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3]*.7071067811865476;h[e+8>>3]=1.7071067811865475*+U(+h[b+8>>3]*.5);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function se(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0.0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=b;if((g|0)==0){b=om(360)|0;g=b;if((b|0)!=0){ln(g|0,0,360)|0;c[g+16>>2]=144;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+20>>2]=11312}j=g;k=j;i=d;return k|0}ym(e,c[g>>2]|0,c[g+24>>2]|0,22384);l=+h[e>>3];h[g+296>>3]=l;if(l<=0.0){Cl(c[g>>2]|0,-30);te(g);j=0;k=j;i=d;return k|0}if(+h[g+120>>3]!=0.0){Cl(c[g>>2]|0,-46);te(g);j=0;k=j;i=d;return k|0}ym(f,c[g>>2]|0,c[g+24>>2]|0,21928);c[g+352>>2]=c[f>>2];a:do{if((c[g+352>>2]|0)==0){c[g+356>>2]=0}else{do{if((a[(c[g+352>>2]|0)+1|0]|0)==0){if((a[c[g+352>>2]|0]|0)!=120){if((a[c[g+352>>2]|0]|0)!=121){break}}if((a[c[g+352>>2]|0]|0)==121){c[g+356>>2]=1}else{c[g+356>>2]=0}break a}}while(0);Cl(c[g>>2]|0,-49);te(g);j=0;k=j;i=d;return k|0}}while(0);h[g+336>>3]=+h[g+296>>3]/+h[g+48>>3];h[g+328>>3]=+h[g+336>>3]+1.0;h[g+344>>3]=+h[g+328>>3]*+h[g+328>>3]-1.0;if(+h[g+64>>3]!=0.0){h[g+304>>3]=+Q(+h[g+96>>3]);h[g+312>>3]=+h[g+96>>3];h[g+320>>3]=+h[g+104>>3];c[g+8>>2]=128;c[g+4>>2]=294}else{h[g+320>>3]=1.0;h[g+312>>3]=1.0;h[g+304>>3]=1.0;c[g+8>>2]=106;c[g+4>>2]=308}j=g;k=j;i=d;return k|0}function te(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){$m(c)}i=b;return}function ue(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=-1.0;if((c[g+356>>2]|0)!=0){k=+U(+h[b+8>>3]/+h[g+336>>3]);l=+U(+h[b>>3]/+h[g+336>>3]);m=l*+va(+1.0,+k)}else{m=+U(+h[b>>3]/+h[g+336>>3]);l=+U(+h[b+8>>3]/+h[g+336>>3]);k=l*+va(+1.0,+m)}l=k/+h[g+304>>3];l=m*m+l*l+j*j;n=+h[g+328>>3]*2.0*j;o=n*n-4.0*l*+h[g+344>>3];if(o<0.0){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}else{p=(-0.0-n- +Q(o))/(2.0*l);j=+h[g+328>>3]+p*j;m=m*p;k=k*p;h[f>>3]=+Y(+m,+j);h[f+8>>3]=+X(k*+S(+h[f>>3])/j);h[f+8>>3]=+X(+h[g+320>>3]*+U(+h[f+8>>3]));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}}function ve(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[b+8>>3]=+X(+h[g+312>>3]*+U(+h[b+8>>3]));j=+h[g+304>>3];k=+h[g+304>>3]*+S(+h[b+8>>3]);l=j/+va(+k,+(+T(+h[b+8>>3])));k=l*+S(+h[b>>3]);j=k*+S(+h[b+8>>3]);k=l*+T(+h[b>>3]);m=k*+S(+h[b+8>>3]);k=l*+T(+h[b+8>>3]);if((+h[g+328>>3]-j)*j-m*m-k*k*+h[g+320>>3]<0.0){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}l=+h[g+328>>3]-j;if((c[g+356>>2]|0)!=0){j=+h[g+336>>3];h[f>>3]=j*+X(m/+va(+k,+l));h[f+8>>3]=+h[g+336>>3]*+X(k/l)}else{h[f>>3]=+h[g+336>>3]*+X(m/l);j=+h[g+336>>3];h[f+8>>3]=j*+X(k/+va(+m,+l))}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function we(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=-1.0;if((c[g+356>>2]|0)!=0){k=+U(+h[b+8>>3]/(+h[g+328>>3]-1.0));l=+U(+h[b>>3]/(+h[g+328>>3]-1.0))*+Q(k*k+1.0)}else{l=+U(+h[b>>3]/(+h[g+328>>3]-1.0));k=+U(+h[b+8>>3]/(+h[g+328>>3]-1.0))*+Q(l*l+1.0)}m=l*l+k*k+j*j;n=+h[g+328>>3]*2.0*j;o=n*n-4.0*m*+h[g+344>>3];if(o<0.0){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}else{p=(-0.0-n- +Q(o))/(2.0*m);j=+h[g+328>>3]+p*j;l=l*p;k=k*p;h[f>>3]=+Y(+l,+j);h[f+8>>3]=+X(k*+S(+h[f>>3])/j);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}}function xe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+S(+h[b>>3])*j;l=+T(+h[b>>3])*j;m=+T(+h[b+8>>3]);if((+h[g+328>>3]-k)*k-l*l-m*m<0.0){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}j=+h[g+328>>3]-k;if((c[g+356>>2]|0)!=0){k=+h[g+336>>3];h[f>>3]=k*+X(l/+va(+m,+j));h[f+8>>3]=+h[g+336>>3]*+X(m/j)}else{h[f>>3]=+h[g+336>>3]*+X(l/j);k=+h[g+336>>3];h[f+8>>3]=k*+X(m/+va(+l,+j))}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ye(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=0;c[d+4>>2]=304;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=138;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11264}e=d;f=e;i=b;return f|0}function ze(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ae(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+h[b+8>>3]*+h[b+8>>3];h[e+8>>3]=+h[b+8>>3]*(f*.08333333333333333+1.0);h[e>>3]=+h[b>>3]*(1.0-.162388*f);f=+h[b>>3]*+h[b>>3];b=e|0;h[b>>3]=+h[b>>3]*(.87-952426.0e-9*f*f);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Be(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)==0){a=om(336)|0;d=a;if((a|0)!=0){ln(d|0,0,336)|0;c[d+16>>2]=152;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8112;c[d+296>>2]=0}e=d;f=e;i=b;return f|0}a=qm(+h[d+64>>3])|0;c[d+296>>2]=a;if((a|0)==0){Ce(d);e=0;f=e;i=b;return f|0}if(+h[d+64>>3]!=0.0){c[d+8>>2]=252;c[d+4>>2]=168}else{h[d+312>>3]=1.0;h[d+304>>3]=0.0;Fe(d)}e=d;f=e;i=b;return f|0}function Ce(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+296>>2]|0)!=0){pm(c[d+296>>2]|0)}pm(d);i=b;return}function De(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+sm(c[g>>2]|0,+h[b+8>>3],+h[g+64>>3],c[g+296>>2]|0);h[f+8>>3]=j;k=+P(+j);j=k;do{if(k<1.5707963267948966){j=+T(+h[f+8>>3]);l=+h[b>>3]*+Q(1.0- +h[g+64>>3]*j*j);h[f>>3]=l/+S(+h[f+8>>3])}else{if(j-1.0e-10<1.5707963267948966){h[f>>3]=0.0;break}else{Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Ee(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=j;l=+S(+h[b+8>>3]);h[f+8>>3]=+rm(+h[b+8>>3],j,l,c[g+296>>2]|0);h[f>>3]=+h[b>>3]*l/+Q(1.0- +h[g+64>>3]*k*k);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Fe(a){a=a|0;var b=0,d=0.0;b=a;h[b+64>>3]=0.0;d=+Q((+h[b+304>>3]+1.0)/+h[b+312>>3]);h[b+328>>3]=d;h[b+320>>3]=d/(+h[b+304>>3]+1.0);c[b+8>>2]=202;c[b+4>>2]=182;i=i;return}function Ge(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+304>>3]=1.0;h[d+312>>3]=2.5707963267948966;Fe(d);e=d;f=e;i=b;return f|0}a=om(336)|0;d=a;if((a|0)!=0){ln(d|0,0,336)|0;c[d+16>>2]=152;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11728;c[d+296>>2]=0}e=d;f=e;i=b;return f|0}function He(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+304>>3]=.5;h[d+312>>3]=1.7853981633974483;Fe(d);e=d;f=e;i=b;return f|0}a=om(336)|0;d=a;if((a|0)!=0){ln(d|0,0,336)|0;c[d+16>>2]=152;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9672;c[d+296>>2]=0}e=d;f=e;i=b;return f|0}function Ie(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=a;if((j|0)==0){a=om(336)|0;j=a;if((a|0)!=0){ln(j|0,0,336)|0;c[j+16>>2]=152;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+20>>2]=11216;c[j+296>>2]=0}k=j;l=k;i=b;return l|0}ym(d,c[j>>2]|0,c[j+24>>2]|0,22e3);do{if((c[d>>2]|0)!=0){ym(e,c[j>>2]|0,c[j+24>>2]|0,21904);if((c[e>>2]|0)==0){break}ym(f,c[j>>2]|0,c[j+24>>2]|0,19184);h[j+312>>3]=+h[f>>3];ym(g,c[j>>2]|0,c[j+24>>2]|0,17536);h[j+304>>3]=+h[g>>3];Fe(j);k=j;l=k;i=b;return l|0}}while(0);Cl(c[j>>2]|0,-99);Ce(j);k=0;l=k;i=b;return l|0}function Je(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+328>>3];if(+h[g+304>>3]!=0.0){j=+h[g+304>>3]*+h[b+8>>3]+ +T(+h[b+8>>3]);k=+dl(c[g>>2]|0,j/+h[g+312>>3])}else{if(+h[g+312>>3]!=1.0){j=+T(+h[b+8>>3]);l=+dl(c[g>>2]|0,j/+h[g+312>>3])}else{l=+h[b+8>>3]}k=l}h[f+8>>3]=k;h[f>>3]=+h[b>>3]/(+h[g+320>>3]*(+h[g+304>>3]+ +S(+h[b+8>>3])));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Ke(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;do{if(+h[g+304>>3]!=0.0){j=+h[g+312>>3]*+T(+h[b+8>>3]);d=8;while(1){if((d|0)==0){break}k=+h[g+304>>3]*+h[b+8>>3]+ +T(+h[b+8>>3])-j;l=k/(+h[g+304>>3]+ +S(+h[b+8>>3]));m=b+8|0;h[m>>3]=+h[m>>3]-l;if(+P(+l)<1.0e-7){m=9;break}d=d-1|0}if((d|0)!=0){break}Cl(c[g>>2]|0,-20);m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}else{if(+h[g+312>>3]!=1.0){o=+dl(c[g>>2]|0,+h[g+312>>3]*+T(+h[b+8>>3]))}else{o=+h[b+8>>3]}h[b+8>>3]=o}}while(0);h[f>>3]=+h[g+320>>3]*+h[b>>3]*(+h[g+304>>3]+ +S(+h[b+8>>3]));h[f+8>>3]=+h[g+328>>3]*+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Le(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)==0){a=om(320)|0;d=a;if((a|0)!=0){ln(d|0,0,320)|0;c[d+16>>2]=154;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11192}e=d;f=e;i=b;return f|0}if(+P(+(+P(+(+h[d+120>>3]))-1.5707963267948966))<1.0e-10){c[d+312>>2]=+h[d+120>>3]<0.0?1:0}else{if(+P(+(+h[d+120>>3]))<1.0e-10){c[d+312>>2]=2}else{c[d+312>>2]=3;h[d+296>>3]=+T(+h[d+120>>3]);h[d+304>>3]=+S(+h[d+120>>3])}}c[d+8>>2]=338;c[d+4>>2]=80;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}function Me(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ne(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+va(+(+h[b>>3]),+(+h[b+8>>3]));k=+X(j);h[f+8>>3]=k;l=+T(k);k=+Q(1.0-l*l);if(+P(+j)<=1.0e-10){h[f+8>>3]=+h[g+120>>3];h[f>>3]=0.0;m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}d=c[g+312>>2]|0;if((d|0)==2){h[f+8>>3]=+h[b+8>>3]*l/j;if(+P(+(+h[f+8>>3]))>=1.0){h[f+8>>3]=+h[f+8>>3]>0.0?1.5707963267948966:-1.5707963267948966}else{h[f+8>>3]=+W(+h[f+8>>3])}h[b+8>>3]=k*j;o=b|0;h[o>>3]=+h[o>>3]*l}else if((d|0)==0){h[f+8>>3]=1.5707963267948966- +h[f+8>>3];h[b+8>>3]=-0.0- +h[b+8>>3]}else if((d|0)==1){o=f+8|0;h[o>>3]=+h[o>>3]-1.5707963267948966}else if((d|0)==3){h[f+8>>3]=k*+h[g+296>>3]+ +h[b+8>>3]*l*+h[g+304>>3]/j;if(+P(+(+h[f+8>>3]))>=1.0){h[f+8>>3]=+h[f+8>>3]>0.0?1.5707963267948966:-1.5707963267948966}else{h[f+8>>3]=+W(+h[f+8>>3])}h[b+8>>3]=(k- +h[g+296>>3]*+T(+h[f+8>>3]))*j;d=b|0;h[d>>3]=+h[d>>3]*l*+h[g+304>>3]}h[f>>3]=+Y(+(+h[b>>3]),+(+h[b+8>>3]));m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}function Oe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0.0,o=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+S(+h[b>>3]);d=c[g+312>>2]|0;if((d|0)==2){h[f+8>>3]=k*l}else if((d|0)==3){h[f+8>>3]=+h[g+296>>3]*j+ +h[g+304>>3]*k*l}else if((d|0)==0){h[f+8>>3]=j}else if((d|0)==1){h[f+8>>3]=-0.0-j}if(+h[f+8>>3]<=1.0e-10){Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}n=1.0/+h[f+8>>3];h[f+8>>3]=n;h[f>>3]=n*k*+T(+h[b>>3]);b=c[g+312>>2]|0;if((b|0)==2){m=f+8|0;h[m>>3]=+h[m>>3]*j}else if((b|0)==3){m=f+8|0;h[m>>3]=+h[m>>3]*(+h[g+304>>3]*j- +h[g+296>>3]*k*l)}else if((b|0)==0){l=-0.0-l;o=12}else if((b|0)==1){o=12}if((o|0)==12){o=f+8|0;h[o>>3]=+h[o>>3]*k*l}o=a;a=f;c[o>>2]=c[a>>2];c[o+4>>2]=c[a+4>>2];c[o+8>>2]=c[a+8>>2];c[o+12>>2]=c[a+12>>2];i=e;return}function Pe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0;b=i;d=a;if((d|0)==0){a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=164;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11160;c[d+296>>2]=0;c[d+300>>2]=0}e=d;f=e;i=b;return f|0}h[d+64>>3]=0.0;a=Be(0)|0;c[d+296>>2]=a;do{if((a|0)!=0){g=Eh(0)|0;c[d+300>>2]=g;if((g|0)==0){break}h[(c[d+296>>2]|0)+64>>3]=0.0;c[c[d+296>>2]>>2]=c[d>>2];c[c[d+300>>2]>>2]=c[d>>2];g=Be(c[d+296>>2]|0)|0;c[d+296>>2]=g;do{if((g|0)!=0){j=Eh(c[d+300>>2]|0)|0;c[d+300>>2]=j;if((j|0)==0){break}c[d+4>>2]=76;c[d+8>>2]=344;e=d;f=e;i=b;return f|0}}while(0);Qe(d);e=0;f=e;i=b;return f|0}}while(0);Qe(d);e=0;f=e;i=b;return f|0}function Qe(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+296>>2]|0)!=0){Lb[c[(c[d+296>>2]|0)+16>>2]&255](c[d+296>>2]|0)}if((c[d+300>>2]|0)!=0){Lb[c[(c[d+300>>2]|0)+16>>2]&255](c[d+300>>2]|0)}pm(d);i=b;return}function Re(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+48|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=d;ln(f|0,0,16)|0;if(+P(+(+h[b+8>>3]))<=.7109307819790236){Nb[c[(c[k+296>>2]|0)+4>>2]&511](g,b,c[k+296>>2]|0);d=f;l=g;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}else{Nb[c[(c[k+300>>2]|0)+4>>2]&511](j,b,c[k+300>>2]|0);k=f;l=j;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];l=f+8|0;h[l>>3]=+h[l>>3]-(+h[b+8>>3]>=0.0?.0528:-.0528);m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}}function Se(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+48|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=d;ln(f|0,0,16)|0;if(+P(+(+h[b+8>>3]))<=.7109307819790236){Nb[c[(c[k+296>>2]|0)+8>>2]&511](g,b,c[k+296>>2]|0);d=f;l=g;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}else{l=b+8|0;h[l>>3]=+h[l>>3]+(+h[b+8>>3]>=0.0?.0528:-.0528);Nb[c[(c[k+300>>2]|0)+8>>2]&511](j,b,c[k+300>>2]|0);k=f;b=j;c[k>>2]=c[b>>2];c[k+4>>2]=c[b+4>>2];c[k+8>>2]=c[b+8>>2];c[k+12>>2]=c[b+12>>2];m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}}function Te(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,g=0.0,j=0,k=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=+h[d+112>>3];e=+h[d+64>>3]*+R(+(+S(+h[d+120>>3])),+4.0);h[d+320>>3]=+Q(e/(1.0- +h[d+64>>3])+1.0);e=+T(+h[d+120>>3]);h[d+304>>3]=+W(e/+h[d+320>>3]);e=+_(+Jm(+h[d+304>>3]*-1.0,0.0,0.0));f=+h[d+320>>3];g=+T(+h[d+120>>3])*-1.0;h[d+312>>3]=e-f*+_(+Jm(+h[d+120>>3]*-1.0,g,+h[d+80>>3]));g=+h[d+144>>3]*+h[d+48>>3]*+Q(1.0- +h[d+64>>3]);f=+h[d+64>>3]*+T(+h[d+120>>3]);h[d+328>>3]=g/(1.0-f*+T(+h[d+120>>3]));h[d+336>>3]=0.0;h[d+344>>3]=+h[d+328>>3]*-1.0*+h[d+304>>3];c[d+8>>2]=340;c[d+4>>2]=82;j=d;k=j;i=b;return k|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=36;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10960}j=d;k=j;i=b;return k|0}function Ue(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ve(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+lb(+((+h[b>>3]*+h[g+48>>3]- +h[g+336>>3])/+h[g+328>>3]));k=+X(j/+S((+h[b+8>>3]*+h[g+48>>3]- +h[g+344>>3])/+h[g+328>>3]));j=+T((+h[b+8>>3]*+h[g+48>>3]- +h[g+344>>3])/+h[g+328>>3]);l=+_(+Jm(+W(j/+ta(+((+h[b>>3]*+h[g+48>>3]- +h[g+336>>3])/+h[g+328>>3])))*-1.0,0.0,0.0));h[f>>3]=k/+h[g+320>>3];k=+Z((l- +h[g+312>>3])/+h[g+320>>3]);h[f+8>>3]=+zm(c[g>>2]|0,k,+h[g+80>>3])*-1.0;g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function We(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+320>>3]*+h[b>>3];k=+h[g+312>>3];l=+h[g+320>>3];m=+T(+h[b+8>>3])*-1.0;n=k+l*+_(+Jm(+h[b+8>>3]*-1.0,m,+h[g+80>>3]));m=+T(j);l=+_(+Jm(+W(m/+ta(+n))*-1.0,0.0,0.0));h[f>>3]=(+h[g+336>>3]+ +h[g+328>>3]*l)*+h[g+88>>3];l=+h[g+344>>3];m=+h[g+328>>3];k=l+m*+X(+lb(+n)/+S(j));h[f+8>>3]=k*+h[g+88>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Xe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0.0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=a;if((j|0)==0){a=om(320)|0;j=a;if((a|0)!=0){ln(j|0,0,320)|0;c[j+16>>2]=4;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+20>>2]=10904}k=j;l=k;i=b;return l|0}ym(d,c[j>>2]|0,c[j+24>>2]|0,21184);do{if((c[d>>2]|0)!=0){ym(e,c[j>>2]|0,c[j+24>>2]|0,21840);m=+P(+(+h[e>>3]));h[j+296>>3]=m;if(m>0.0){break}Cl(c[j>>2]|0,-27);Ye(j);k=0;l=k;i=b;return l|0}else{h[j+296>>3]=.5}}while(0);ym(f,c[j>>2]|0,c[j+24>>2]|0,19176);do{if((c[f>>2]|0)!=0){ym(g,c[j>>2]|0,c[j+24>>2]|0,17528);m=+P(+(+h[g>>3]));h[j+304>>3]=m;if(m>0.0){break}Cl(c[j>>2]|0,-27);Ye(j);k=0;l=k;i=b;return l|0}else{h[j+304>>3]=1.0}}while(0);h[j+312>>3]=1.0/+h[j+304>>3];g=j+304|0;h[g>>3]=+h[g>>3]/+h[j+296>>3];h[j+64>>3]=0.0;c[j+4>>2]=386;k=j;l=k;i=b;return l|0}function Ye(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ze(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);d=b|0;k=+h[d>>3]*+h[g+296>>3];h[d>>3]=k;l=+Q(2.0/(j*+S(k)+1.0));h[f>>3]=+h[g+304>>3]*l*j*+T(+h[b>>3]);h[f+8>>3]=+h[g+312>>3]*l*+T(+h[b+8>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function _e(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=40;c[d+4>>2]=390;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=6;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10856}e=d;f=e;i=b;return f|0}function $e(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function af(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b+8>>3]*(+h[b+8>>3]<0.0?.5179951515653813:.5686373742600607);do{if(+P(+j)>1.0){if(+P(+j)>1.000001){Cl(c[g>>2]|0,-20);d=a;k=f;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return}else{j=j>0.0?1.5707963267948966:-1.5707963267948966;break}}else{j=+W(j)}}while(0);h[f>>3]=1.1764705882352942*+h[b>>3]/+S(j);j=j+j;l=j+ +T(j);h[f+8>>3]=l*(+h[b+8>>3]<0.0?.4102345310814193:.3736990601468637);do{if(+P(+(+h[f+8>>3]))>1.0){if(+P(+(+h[f+8>>3]))>1.000001){Cl(c[g>>2]|0,-20);b=a;k=f;c[b>>2]=c[k>>2];c[b+4>>2]=c[k+4>>2];c[b+8>>2]=c[k+8>>2];c[b+12>>2]=c[k+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]>0.0?1.5707963267948966:-1.5707963267948966;break}}else{h[f+8>>3]=+W(+h[f+8>>3])}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function bf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0,k=0.0,l=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+T(+h[b+8>>3]);g=f*(+h[b+8>>3]<0.0?2.43763:2.67595);j=20;while(1){if((j|0)==0){break}f=+h[b+8>>3]+ +T(+h[b+8>>3])-g;k=f/(+S(+h[b+8>>3])+1.0);l=b+8|0;h[l>>3]=+h[l>>3]-k;if(+P(+k)<1.0e-7){l=4;break}j=j-1|0}g=+h[b>>3]*.85;j=b+8|0;k=+h[j>>3]*.5;h[j>>3]=k;h[e>>3]=g*+S(k);k=+T(+h[b+8>>3]);h[e+8>>3]=k*(+h[b+8>>3]<0.0?1.93052:1.75859);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function cf(a){a=+a;var b=0.0,c=0;b=a;if(b>0.0){c=1}else{c=b<0.0?-1:0}i=i;return+(+(c|0))}function df(a,b,c){a=+a;b=+b;c=c|0;var d=0,e=0.0,f=0.0,g=0.0;d=i;e=a;a=b;if((c|0)==1){f=e*1.0/a;g=f;i=d;return+g}else{f=e*a;g=f;i=d;return+g}return 0.0}function ef(a){a=+a;var b=0,c=0.0,d=0.0;b=i;c=a;do{if(c>=-3.141592653589793){if(c>=3.141592653589793){break}d=c;i=b;return+d}}while(0);c=c-6.283185307179586*+O(c/6.283185307179586);if(c>=3.141592653589793){c=c-6.283185307179586}d=c;i=b;return+d}function ff(a){a=+a;var b=0,c=0.0,d=0.0,e=0;b=i;c=a;do{if(c>=-1.5707963267948966){if(c>1.5707963267948966){break}d=c;i=b;return+d}}while(0);c=c-6.283185307179586*+O(c/6.283185307179586);do{if(c>1.5707963267948966){if(c>4.71238898038469){e=6;break}c=3.141592653589793-c}else{e=6}}while(0);if((e|0)==6){c=c-6.283185307179586}d=c;i=b;return+d}function gf(a,b,d,e,f){a=+a;b=+b;d=d|0;e=e|0;f=f|0;var g=0,j=0,l=0,m=0.0,n=0,o=0,p=0;g=i;i=i+480|0;j=g|0;l=g+288|0;m=a;a=b;n=e;e=f;if((d|0)==0){mn(j|0,6296,288)|0;o=hf(18,j|0,m,a)|0;p=o;i=g;return p|0}else{j=l|0;d=j|0;h[k>>3]=-3.141592653590793,c[d>>2]=c[k>>2],c[d+4>>2]=c[k+4>>2];f=d+8|0;h[k>>3]=.7853981633984483,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];f=j+16|0;j=f|0;b=+(n|0)*3.141592653589793/2.0+ -3.141592653589793-1.0e-12;h[k>>3]=b,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];d=j+8|0;h[k>>3]=.7853981633984483,c[d>>2]=c[k>>2],c[d+4>>2]=c[k+4>>2];d=f+16|0;f=d|0;b=+(n|0)*3.141592653589793/2.0+ -3.141592653589793-1.0e-12;h[k>>3]=b,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];j=f+8|0;h[k>>3]=2.356194490193345,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];j=d+16|0;d=j|0;b=(+(n|0)+1.0)*3.141592653589793/2.0+ -3.141592653589793+1.0e-12;h[k>>3]=b,c[d>>2]=c[k>>2],c[d+4>>2]=c[k+4>>2];f=d+8|0;h[k>>3]=2.356194490193345,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];f=j+16|0;j=f|0;b=(+(n|0)+1.0)*3.141592653589793/2.0+ -3.141592653589793+1.0e-12;h[k>>3]=b,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];n=j+8|0;h[k>>3]=.7853981633984483,c[n>>2]=c[k>>2],c[n+4>>2]=c[k+4>>2];n=f+16|0;f=n|0;h[k>>3]=3.141592653590793,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];j=f+8|0;h[k>>3]=.7853981633984483,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];j=n+16|0;n=j|0;h[k>>3]=3.141592653590793,c[n>>2]=c[k>>2],c[n+4>>2]=c[k+4>>2];f=n+8|0;h[k>>3]=-.7853981633984483,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];f=j+16|0;j=f|0;b=(+(e|0)+1.0)*3.141592653589793/2.0+ -3.141592653589793+1.0e-12;h[k>>3]=b,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];n=j+8|0;h[k>>3]=-.7853981633984483,c[n>>2]=c[k>>2],c[n+4>>2]=c[k+4>>2];n=f+16|0;f=n|0;b=(+(e|0)+1.0)*3.141592653589793/2.0+ -3.141592653589793+1.0e-12;h[k>>3]=b,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];j=f+8|0;h[k>>3]=-2.356194490193345,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];j=n+16|0;n=j|0;b=+(e|0)*3.141592653589793/2.0+ -3.141592653589793-1.0e-12;h[k>>3]=b,c[n>>2]=c[k>>2],c[n+4>>2]=c[k+4>>2];f=n+8|0;h[k>>3]=-2.356194490193345,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];f=j+16|0;j=f|0;b=+(e|0)*3.141592653589793/2.0+ -3.141592653589793-1.0e-12;h[k>>3]=b,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];e=j+8|0;h[k>>3]=-.7853981633984483,c[e>>2]=c[k>>2],c[e+4>>2]=c[k+4>>2];e=f+16|0;h[k>>3]=-3.141592653590793,c[e>>2]=c[k>>2],c[e+4>>2]=c[k+4>>2];f=e+8|0;h[k>>3]=-.7853981633984483,c[f>>2]=c[k>>2],c[f+4>>2]=c[k+4>>2];o=hf(12,l|0,m,a)|0;p=o;i=g;return p|0}return 0}function hf(a,b,d,e){a=a|0;b=b|0;d=+d;e=+e;var f=0,g=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0;f=i;i=i+32|0;g=f|0;j=f+16|0;k=a;a=b;l=d;d=e;b=0;m=0;while(1){if((m|0)>=(k|0)){break}if(l==+h[a+(m<<4)>>3]){if(d==+h[a+(m<<4)+8>>3]){n=5;break}}m=m+1|0}if((n|0)==5){o=1;p=o;i=f;return p|0}h[g>>3]=+h[a>>3];h[g+8>>3]=+h[a+8>>3];m=1;while(1){if((m|0)>=(k|0)){break}h[j>>3]=+h[a+(((m|0)%(k|0)|0)<<4)>>3];h[j+8>>3]=+h[a+(((m|0)%(k|0)|0)<<4)+8>>3];if(+h[g+8>>3]<+h[j+8>>3]){q=+h[g+8>>3]}else{q=+h[j+8>>3]}if(d>q){if(+h[g+8>>3]>+h[j+8>>3]){r=+h[g+8>>3]}else{r=+h[j+8>>3]}if(d<=r){if(+h[g>>3]>+h[j>>3]){s=+h[g>>3]}else{s=+h[j>>3]}if(l<=s){if(+h[g+8>>3]!=+h[j+8>>3]){if(+h[g>>3]==+h[j>>3]){n=25}else{if(l<=(d- +h[g+8>>3])*(+h[j>>3]- +h[g>>3])/(+h[j+8>>3]- +h[g+8>>3])+ +h[g>>3]){n=25}}if((n|0)==25){n=0;b=b+1|0}}}}}t=g;u=j;c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];c[t+12>>2]=c[u+12>>2];m=m+1|0}if(((b|0)%2|0|0)==0){o=0;p=o;i=f;return p|0}else{o=1;p=o;i=f;return p|0}return 0}function jf(a,b,c){a=+a;b=+b;c=c|0;var d=0,e=0.0,f=0.0,g=0.0;d=i;e=a;a=b;if((c|0)!=0){f=e+(+R(+a,+2.0)/3.0+ +R(+a,+4.0)*31.0/180.0+ +R(+a,+6.0)*517.0/5040.0)*+T(2.0*e)+(+R(+a,+4.0)*23.0/360.0+ +R(+a,+6.0)*251.0/3780.0)*+T(4.0*e)+ +R(+a,+6.0)*761.0/45360.0*+T(6.0*e);g=f;i=d;return+g}b=((1.0- +R(+a,+2.0))*+T(e)/(1.0- +R(+(a*+T(e)),+2.0))-(1.0- +R(+a,+2.0))/(2.0*a)*+_((1.0-a*+T(e))/(a*+T(e)+1.0)))/(1.0-(1.0- +R(+a,+2.0))/(2.0*a)*+_((1.0-a)/(1.0+a)));if(+P(+b)>1.0){b=+cf(b)}f=+W(b);g=f;i=d;return+g}function kf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;j=+ef(+h[b>>3]);k=+ff(+h[b+8>>3]);if(+P(+k)<=+dl(c[g>>2]|0,.6666666666666666)){h[f>>3]=j;h[f+8>>3]=1.1780972450961724*+T(k)}else{l=+Q((1.0- +P(+(+T(k))))*3.0);m=+O(2.0*j/3.141592653589793+2.0);if(m>=4.0){m=3.0}n=1.5707963267948966*m+ -2.356194490192345;h[f>>3]=n+(j-n)*l;h[f+8>>3]=+cf(k)*3.141592653589793/4.0*(2.0-l)}h[f>>3]=+df(+h[f>>3],+h[g+48>>3],0);h[f+8>>3]=+df(+h[f+8>>3],+h[g+48>>3],0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function lf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;j=+df(+h[b>>3],+h[g+48>>3],1);k=+df(+h[b+8>>3],+h[g+48>>3],1);if(+P(+k)<=.7853981633974483){h[f>>3]=j;h[f+8>>3]=+W(8.0*k/9.42477796076938);l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}if(+P(+k)<1.5707963267948966){n=+O(2.0*j/3.141592653589793+2.0);if(n>=4.0){n=3.0}o=1.5707963267948966*n+ -2.356194490192345;n=2.0- +P(+k)*4.0/3.141592653589793;h[f>>3]=o+(j-o)/n;h[f+8>>3]=+cf(k)*+W(1.0- +R(+n,+2.0)/3.0)}else{h[f>>3]=-3.141592653589793- +h[g+112>>3];h[f+8>>3]=+cf(k)*3.141592653589793/2.0}l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}function mf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)==0){a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=2;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10832}e=d;f=e;i=b;return f|0}if(+h[d+64>>3]!=0.0){c[d+8>>2]=12;c[d+4>>2]=374}else{c[d+8>>2]=326;c[d+4>>2]=290}e=d;f=e;i=b;return f|0}function nf(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function of(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;h[j+48>>3]=+h[j+88>>3];k=+df(+h[b>>3],+h[j+48>>3],1);if((gf(k,+df(+h[b+8>>3],+h[j+48>>3],1),0,0,0)|0)==0){h[f>>3]=q;h[f+8>>3]=q;Cl(c[j>>2]|0,-15);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}else{lf(g,b,j);b=f;l=g;c[b>>2]=c[l>>2];c[b+4>>2]=c[l+4>>2];c[b+8>>2]=c[l+8>>2];c[b+12>>2]=c[l+12>>2];h[f+8>>3]=+jf(+h[f+8>>3],+h[j+80>>3],1);j=a;a=f;c[j>>2]=c[a>>2];c[j+4>>2]=c[a+4>>2];c[j+8>>2]=c[a+8>>2];c[j+12>>2]=c[a+12>>2];i=e;return}}function pf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=d;ln(e|0,0,16)|0;h[b+8>>3]=+jf(+h[b+8>>3],+h[f+80>>3],0);h[f+48>>3]=+h[f+88>>3];kf(a,b,f);i=e;return}function qf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=+h[b+8>>3];j=+df(j,+h[g+48>>3],1);k=+df(k,+h[g+48>>3],1);if((gf(j,k,0,0,0)|0)==0){h[f>>3]=q;h[f+8>>3]=q;Cl(c[g>>2]|0,-15);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}else{lf(a,b,g);i=e;return}}function rf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];ln(e|0,0,16)|0;kf(a,b,d);i=e;return}function sf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(304)|0;f=a;if((a|0)!=0){ln(f|0,0,304)|0;c[f+16>>2]=2;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=8280}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,20928);c[f+296>>2]=c[d>>2];ym(e,c[f>>2]|0,c[f+24>>2]|0,21816);c[f+300>>2]=c[e>>2];do{if((c[f+296>>2]|0)>=0){if((c[f+296>>2]|0)>3){break}do{if((c[f+300>>2]|0)>=0){if((c[f+300>>2]|0)>3){break}if(+h[f+64>>3]!=0.0){c[f+8>>2]=410;c[f+4>>2]=108}else{c[f+8>>2]=222;c[f+4>>2]=114}g=f;j=g;i=b;return j|0}}while(0);Cl(c[f>>2]|0,-47);nf(f);g=0;j=g;i=b;return j|0}}while(0);Cl(c[f>>2]|0,-47);nf(f);g=0;j=g;i=b;return j|0}function tf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0;e=i;i=i+48|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=d;ln(f|0,0,16)|0;l=+df(+h[b>>3],+h[k+48>>3],1);m=+df(+h[b+8>>3],+h[k+48>>3],1);if((gf(l,m,1,c[k+296>>2]|0,c[k+300>>2]|0)|0)==0){h[f>>3]=q;h[f+8>>3]=q;Cl(c[k>>2]|0,-15);d=a;n=f;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];c[d+8>>2]=c[n+8>>2];c[d+12>>2]=c[n+12>>2];i=e;return}else{xf(g,+h[b>>3],+h[b+8>>3],+h[k+48>>3],c[k+296>>2]|0,c[k+300>>2]|0,1);n=b;d=g;c[n>>2]=c[d>>2];c[n+4>>2]=c[d+4>>2];c[n+8>>2]=c[d+8>>2];c[n+12>>2]=c[d+12>>2];lf(j,b,k);b=f;d=j;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];h[f+8>>3]=+jf(+h[f+8>>3],+h[k+80>>3],1);k=a;a=f;c[k>>2]=c[a>>2];c[k+4>>2]=c[a+4>>2];c[k+8>>2]=c[a+8>>2];c[k+12>>2]=c[a+12>>2];i=e;return}}function uf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;h[b+8>>3]=+jf(+h[b+8>>3],+h[j+80>>3],0);kf(g,b,j);b=f;d=g;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];xf(a,+h[f>>3],+h[f+8>>3],+h[j+48>>3],c[j+296>>2]|0,c[j+300>>2]|0,0);i=e;return}function vf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;k=+df(+h[b>>3],+h[j+48>>3],1);l=+df(+h[b+8>>3],+h[j+48>>3],1);if((gf(k,l,1,c[j+296>>2]|0,c[j+300>>2]|0)|0)==0){h[f>>3]=q;h[f+8>>3]=q;Cl(c[j>>2]|0,-15);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}else{xf(g,+h[b>>3],+h[b+8>>3],+h[j+48>>3],c[j+296>>2]|0,c[j+300>>2]|0,1);m=b;d=g;c[m>>2]=c[d>>2];c[m+4>>2]=c[d+4>>2];c[m+8>>2]=c[d+8>>2];c[m+12>>2]=c[d+12>>2];lf(a,b,j);i=e;return}}function wf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;kf(g,b,j);b=f;d=g;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];xf(a,+h[f>>3],+h[f+8>>3],+h[j+48>>3],c[j+296>>2]|0,c[j+300>>2]|0,0);i=e;return}function xf(a,b,d,e,f,g,j){a=a|0;b=+b;d=+d;e=+e;f=f|0;g=g|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0;l=i;i=i+208|0;m=l|0;n=l+16|0;o=l+32|0;p=l+48|0;q=l+64|0;r=l+80|0;s=l+96|0;t=l+112|0;u=l+128|0;v=l+160|0;w=l+176|0;x=l+192|0;y=b;b=d;d=e;z=f;f=g;g=j;yf(u,y,b,d,z,f,g);if((c[u+24>>2]|0)==2){h[m>>3]=+h[u+8>>3];h[m+8>>3]=+h[u+16>>3];j=a;A=m;c[j>>2]=c[A>>2];c[j+4>>2]=c[A+4>>2];c[j+8>>2]=c[A+8>>2];c[j+12>>2]=c[A+12>>2];i=l;return}h[n>>3]=y;h[n+8>>3]=b;if((g|0)==0){g=0;A=v|0;e=+h[u+8>>3];h[k>>3]=e,c[A>>2]=c[k>>2],c[A+4>>2]=c[k+4>>2];j=A+8|0;e=+h[u+16>>3];h[k>>3]=e,c[j>>2]=c[k>>2],c[j+4>>2]=c[k+4>>2];if((c[u+24>>2]|0)==0){g=z;B=672+(c[u>>2]<<5)|0;h[o>>3]=d*-3.0*3.141592653589793/4.0;h[o+8>>3]=1.5707963267948966}else{g=f;B=672+((c[u>>2]|0)+3<<5)|0;h[o>>3]=d*-3.0*3.141592653589793/4.0;h[o+8>>3]=-1.5707963267948966}h[q>>3]=d*+(g|0)*3.141592653589793/2.0;h[q+8>>3]=0.0;zf(n|0,v|0,r|0);Af(B,r|0,s|0);Bf(o|0,q|0,t|0);Bf(s|0,t|0,p|0);h[m>>3]=+h[p>>3];h[m+8>>3]=+h[p+8>>3];q=a;B=m;c[q>>2]=c[B>>2];c[q+4>>2]=c[B+4>>2];c[q+8>>2]=c[B+8>>2];c[q+12>>2]=c[B+12>>2];i=l;return}else{B=w|0;e=d*+(~~+O((+h[u+8>>3]+d*3.0*3.141592653589793/4.0)/(d*3.141592653589793/2.0))|0)*3.141592653589793/2.0;h[k>>3]=e,c[B>>2]=c[k>>2],c[B+4>>2]=c[k+4>>2];q=B+8|0;h[k>>3]=0.0,c[q>>2]=c[k>>2],c[q+4>>2]=c[k+4>>2];q=x|0;e=y;h[k>>3]=e,c[q>>2]=c[k>>2],c[q+4>>2]=c[k+4>>2];B=q+8|0;e=b;h[k>>3]=e,c[B>>2]=c[k>>2],c[B+4>>2]=c[k+4>>2];zf(x|0,w|0,n|0);if((c[u+24>>2]|0)==0){C=(c[u>>2]|0)+3|0;h[o>>3]=d*-3.0*3.141592653589793/4.0;h[o+8>>3]=1.5707963267948966}else{C=c[u>>2]|0;h[o>>3]=d*-3.0*3.141592653589793/4.0;h[o+8>>3]=-1.5707963267948966}h[w>>3]=d*+(c[u>>2]|0)*3.141592653589793/2.0;h[w+8>>3]=0.0;zf(n|0,o|0,r|0);Af(672+(C<<5)|0,r|0,s|0);Bf(s|0,o|0,t|0);Bf(t|0,w|0,p|0);h[m>>3]=+h[p>>3];h[m+8>>3]=+h[p+8>>3];p=a;a=m;c[p>>2]=c[a>>2];c[p+4>>2]=c[a+4>>2];c[p+8>>2]=c[a+8>>2];c[p+12>>2]=c[a+12>>2];i=l;return}}function yf(a,b,d,e,f,g,j){a=a|0;b=+b;d=+d;e=+e;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0.0,n=0,o=0.0,p=0;k=i;i=i+32|0;l=k|0;m=b;b=d;d=e;n=f;f=g;h[l+8>>3]=m;h[l+16>>3]=b;if((j|0)==0){do{if(b>d*3.141592653589793/4.0){c[l+24>>2]=0;o=d*3.141592653589793/2.0}else{if(b<-1.0*d*3.141592653589793/4.0){c[l+24>>2]=1;o=-1.0*d*3.141592653589793/2.0;break}else{c[l+24>>2]=2;c[l>>2]=0;j=a;g=l;c[j>>2]=c[g>>2];c[j+4>>2]=c[g+4>>2];c[j+8>>2]=c[g+8>>2];c[j+12>>2]=c[g+12>>2];c[j+16>>2]=c[g+16>>2];c[j+20>>2]=c[g+20>>2];c[j+24>>2]=c[g+24>>2];c[j+28>>2]=c[g+28>>2];i=k;return}}}while(0);if(m<-1.0*d*3.141592653589793/2.0){c[l>>2]=0;h[l+8>>3]=-1.0*d*3.0*3.141592653589793/4.0;h[l+16>>3]=o}else{do{if(m>=-1.0*d*3.141592653589793/2.0){if(m>=0.0){p=13;break}c[l>>2]=1;h[l+8>>3]=-1.0*d*3.141592653589793/4.0;h[l+16>>3]=o}else{p=13}}while(0);if((p|0)==13){do{if(m>=0.0){if(m>=d*3.141592653589793/2.0){p=16;break}c[l>>2]=2;h[l+8>>3]=d*3.141592653589793/4.0;h[l+16>>3]=o}else{p=16}}while(0);if((p|0)==16){c[l>>2]=3;h[l+8>>3]=d*3.0*3.141592653589793/4.0;h[l+16>>3]=o}}}g=a;j=l;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];c[g+8>>2]=c[j+8>>2];c[g+12>>2]=c[j+12>>2];c[g+16>>2]=c[j+16>>2];c[g+20>>2]=c[j+20>>2];c[g+24>>2]=c[j+24>>2];c[g+28>>2]=c[j+28>>2];i=k;return}do{if(b>d*3.141592653589793/4.0){c[l+24>>2]=0;h[l+8>>3]=-1.0*d*3.0*3.141592653589793/4.0+ +(n|0)*d*3.141592653589793/2.0;h[l+16>>3]=d*3.141592653589793/2.0;m=m- +(n|0)*d*3.141592653589793/2.0}else{if(b<-1.0*d*3.141592653589793/4.0){c[l+24>>2]=1;h[l+8>>3]=-1.0*d*3.0*3.141592653589793/4.0+ +(f|0)*d*3.141592653589793/2.0;h[l+16>>3]=-1.0*d*3.141592653589793/2.0;m=m- +(f|0)*d*3.141592653589793/2.0;break}else{c[l+24>>2]=2;c[l>>2]=0;j=a;g=l;c[j>>2]=c[g>>2];c[j+4>>2]=c[g+4>>2];c[j+8>>2]=c[g+8>>2];c[j+12>>2]=c[g+12>>2];c[j+16>>2]=c[g+16>>2];c[j+20>>2]=c[g+20>>2];c[j+24>>2]=c[g+24>>2];c[j+28>>2]=c[g+28>>2];i=k;return}}}while(0);o=d*1.0e-15;if((c[l+24>>2]|0)==0){do{if(b>=-1.0*m-d*3.141592653589793/4.0-o){if(b>=m+d*5.0*3.141592653589793/4.0-o){p=30;break}c[l>>2]=1}else{p=30}}while(0);if((p|0)==30){do{if(b>-1.0*m-1.0*d*3.141592653589793/4.0+o){if(b<m+d*5.0*3.141592653589793/4.0-o){p=33;break}c[l>>2]=2}else{p=33}}while(0);if((p|0)==33){do{if(b<=-1.0*m-1.0*d*3.141592653589793/4.0+o){if(b<=m+d*5.0*3.141592653589793/4.0+o){p=36;break}c[l>>2]=3}else{p=36}}while(0);if((p|0)==36){c[l>>2]=0}}}}else{if((c[l+24>>2]|0)==1){do{if(b<=m+d*3.141592653589793/4.0+o){if(b<=-1.0*m-d*5.0*3.141592653589793/4.0+o){p=44;break}c[l>>2]=1}else{p=44}}while(0);if((p|0)==44){do{if(b<m+d*3.141592653589793/4.0-o){if(b>-1.0*m-d*5.0*3.141592653589793/4.0+o){p=47;break}c[l>>2]=2}else{p=47}}while(0);if((p|0)==47){do{if(b>=m+d*3.141592653589793/4.0-o){if(b>=-1.0*m-d*5.0*3.141592653589793/4.0-o){p=50;break}c[l>>2]=3}else{p=50}}while(0);if((p|0)==50){c[l>>2]=0}}}}}p=a;a=l;c[p>>2]=c[a>>2];c[p+4>>2]=c[a+4>>2];c[p+8>>2]=c[a+8>>2];c[p+12>>2]=c[a+12>>2];c[p+16>>2]=c[a+16>>2];c[p+20>>2]=c[a+20>>2];c[p+24>>2]=c[a+24>>2];c[p+28>>2]=c[a+28>>2];i=k;return}function zf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;e=a;a=b;b=c;c=0;while(1){if((c|0)>=2){break}h[b+(c<<3)>>3]=+h[e+(c<<3)>>3]- +h[a+(c<<3)>>3];c=c+1|0}i=d;return}function Af(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,j=0;d=i;e=a;a=b;b=c;c=2;f=0;while(1){if((f|0)>=(c|0)){break}h[b+(f<<3)>>3]=0.0;g=0;while(1){if((g|0)>=(c|0)){break}j=b+(f<<3)|0;h[j>>3]=+h[j>>3]+ +h[e+(f<<4)+(g<<3)>>3]*+h[a+(f<<3)>>3];g=g+1|0}f=f+1|0}i=d;return}function Bf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;e=a;a=b;b=c;c=0;while(1){if((c|0)>=2){break}h[b+(c<<3)>>3]=+h[e+(c<<3)>>3]+ +h[a+(c<<3)>>3];c=c+1|0}i=d;return}function Cf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+80|0;d=b|0;e=b+16|0;f=b+32|0;g=b+48|0;j=b+64|0;k=a;if((k|0)==0){a=om(352)|0;k=a;if((a|0)!=0){ln(k|0,0,352)|0;c[k+16>>2]=112;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+20>>2]=10784}l=k;m=l;i=b;return m|0}a=d;c[a>>2]=c[1026];c[a+4>>2]=c[1027];c[a+8>>2]=c[1028];c[a+12>>2]=c[1029];a=Be(0)|0;c[k+304>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Be(c[k+304>>2]|0)|0;c[k+304>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+304>>2]|0)+128>>3]=-1.7453292519943295;h[(c[k+304>>2]|0)+136>>3]=0.0;h[(c[k+304>>2]|0)+112>>3]=-1.7453292519943295;a=Be(0)|0;c[k+308>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Be(c[k+308>>2]|0)|0;c[k+308>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+308>>2]|0)+128>>3]=.5235987755982988;h[(c[k+308>>2]|0)+136>>3]=0.0;h[(c[k+308>>2]|0)+112>>3]=.5235987755982988;a=Be(0)|0;c[k+312>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Be(c[k+312>>2]|0)|0;c[k+312>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+312>>2]|0)+128>>3]=-2.792526803190927;h[(c[k+312>>2]|0)+136>>3]=0.0;h[(c[k+312>>2]|0)+112>>3]=-2.792526803190927;a=Be(0)|0;c[k+316>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Be(c[k+316>>2]|0)|0;c[k+316>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+316>>2]|0)+128>>3]=-1.0471975511965976;h[(c[k+316>>2]|0)+136>>3]=0.0;h[(c[k+316>>2]|0)+112>>3]=-1.0471975511965976;a=Be(0)|0;c[k+320>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Be(c[k+320>>2]|0)|0;c[k+320>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+320>>2]|0)+128>>3]=.3490658503988659;h[(c[k+320>>2]|0)+136>>3]=0.0;h[(c[k+320>>2]|0)+112>>3]=.3490658503988659;a=Be(0)|0;c[k+324>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Be(c[k+324>>2]|0)|0;c[k+324>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+324>>2]|0)+128>>3]=2.443460952792061;h[(c[k+324>>2]|0)+136>>3]=0.0;h[(c[k+324>>2]|0)+112>>3]=2.443460952792061;a=Eh(0)|0;c[k+296>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}a=Eh(c[k+296>>2]|0)|0;c[k+296>>2]=a;if((a|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+296>>2]|0)+128>>3]=-1.7453292519943295;h[(c[k+296>>2]|0)+136>>3]=0.0;h[(c[k+296>>2]|0)+112>>3]=-1.7453292519943295;Nb[c[(c[k+296>>2]|0)+4>>2]&511](g,d,c[k+296>>2]|0);a=e;n=g;c[a>>2]=c[n>>2];c[a+4>>2]=c[n+4>>2];c[a+8>>2]=c[n+8>>2];c[a+12>>2]=c[n+12>>2];Nb[c[(c[k+304>>2]|0)+4>>2]&511](j,d,c[k+304>>2]|0);d=f;n=j;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];c[d+8>>2]=c[n+8>>2];c[d+12>>2]=c[n+12>>2];h[k+344>>3]=+h[f+8>>3]- +h[e+8>>3];h[(c[k+296>>2]|0)+136>>3]=+h[k+344>>3];e=Eh(0)|0;c[k+300>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}e=Eh(c[k+300>>2]|0)|0;c[k+300>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+300>>2]|0)+128>>3]=.5235987755982988;h[(c[k+300>>2]|0)+136>>3]=+h[k+344>>3];h[(c[k+300>>2]|0)+112>>3]=.5235987755982988;e=Eh(0)|0;c[k+328>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}e=Eh(c[k+328>>2]|0)|0;c[k+328>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+328>>2]|0)+128>>3]=-2.792526803190927;h[(c[k+328>>2]|0)+136>>3]=-0.0- +h[k+344>>3];h[(c[k+328>>2]|0)+112>>3]=-2.792526803190927;e=Eh(0)|0;c[k+332>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}e=Eh(c[k+332>>2]|0)|0;c[k+332>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+332>>2]|0)+128>>3]=-1.0471975511965976;h[(c[k+332>>2]|0)+136>>3]=-0.0- +h[k+344>>3];h[(c[k+332>>2]|0)+112>>3]=-1.0471975511965976;e=Eh(0)|0;c[k+336>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}e=Eh(c[k+336>>2]|0)|0;c[k+336>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+336>>2]|0)+128>>3]=.3490658503988659;h[(c[k+336>>2]|0)+136>>3]=-0.0- +h[k+344>>3];h[(c[k+336>>2]|0)+112>>3]=.3490658503988659;e=Eh(0)|0;c[k+340>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}e=Eh(c[k+340>>2]|0)|0;c[k+340>>2]=e;if((e|0)==0){Df(k);l=0;m=l;i=b;return m|0}h[(c[k+340>>2]|0)+128>>3]=2.443460952792061;h[(c[k+340>>2]|0)+136>>3]=-0.0- +h[k+344>>3];h[(c[k+340>>2]|0)+112>>3]=2.443460952792061;c[k+8>>2]=146;c[k+4>>2]=334;h[k+64>>3]=0.0;l=k;m=l;i=b;return m|0}function Df(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}a=0;while(1){if((a|0)>=12){break}if((c[d+296+(a<<2)>>2]|0)!=0){Lb[c[(c[d+296+(a<<2)>>2]|0)+16>>2]&255](c[d+296+(a<<2)>>2]|0)}a=a+1|0}pm(d);i=b;return}function Ef(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;k=+h[j+344>>3]+ +Q(2.0);d=0;do{if(+h[b+8>>3]>k+1.0e-10){l=3}else{if(+h[b+8>>3]<-0.0-k+1.0e-10){l=3;break}if(+h[b+8>>3]>=.7109879899933945){d=+h[b>>3]<=-.6981317007977318?1:2}else{if(+h[b+8>>3]>=0.0){d=+h[b>>3]<=-.6981317007977318?3:4}else{if(+h[b+8>>3]>=-.7109879899933945){if(+h[b>>3]<=-1.7453292519943295){d=5}else{if(+h[b>>3]<=-.3490658503988659){d=6}else{if(+h[b>>3]<=1.3962634015954636){d=7}else{d=8}}}}else{if(+h[b>>3]<=-1.7453292519943295){d=9}else{if(+h[b>>3]<=-.3490658503988659){d=10}else{if(+h[b>>3]<=1.3962634015954636){d=11}else{d=12}}}}}}}}while(0);if((l|0)==3){d=0}if((d|0)!=0){m=0;n=b|0;h[n>>3]=+h[n>>3]- +h[(c[j+296+(d-1<<2)>>2]|0)+128>>3];n=b+8|0;h[n>>3]=+h[n>>3]- +h[(c[j+296+(d-1<<2)>>2]|0)+136>>3];Nb[c[(c[j+296+(d-1<<2)>>2]|0)+8>>2]&511](g,b,c[j+296+(d-1<<2)>>2]|0);b=f;n=g;c[b>>2]=c[n>>2];c[b+4>>2]=c[n+4>>2];c[b+8>>2]=c[n+8>>2];c[b+12>>2]=c[n+12>>2];n=f|0;h[n>>3]=+h[n>>3]+ +h[(c[j+296+(d-1<<2)>>2]|0)+112>>3];switch(d|0){case 2:{if(+h[f>>3]>=-.6981317008977318){if(+h[f>>3]<=3.141592653689793){o=1}else{l=45}}else{l=45}a:do{if((l|0)==45){do{if(+h[f>>3]>=-3.141592653689793){if(+h[f>>3]>-2.792526803090927){break}if(+h[f+8>>3]<.8726646258971648){break}if(+h[f+8>>3]<=1.5707963268948966){o=1;break a}}}while(0);do{if(+h[f>>3]>=-.8726646260971648){if(+h[f>>3]>-.6981317006977318){p=0;break}if(+h[f+8>>3]>=1.0471975510965976){r=+h[f+8>>3]<=1.5707963268948966}else{r=0}p=r}else{p=0}}while(0);o=p}}while(0);m=o&1;break};case 3:{if(+h[f>>3]>=-3.141592653689793){s=+h[f>>3]<=-.6981317006977318}else{s=0}m=s&1;break};case 4:{if(+h[f>>3]>=-.6981317008977318){t=+h[f>>3]<=3.141592653689793}else{t=0}m=t&1;break};case 5:{if(+h[f>>3]>=-3.141592653689793){u=+h[f>>3]<=-1.7453292518943295}else{u=0}m=u&1;break};case 10:{if(+h[f>>3]>=-1.7453292520943295){v=+h[f>>3]<=-.3490658502988659}else{v=0}m=v&1;break};case 11:{if(+h[f>>3]>=-.3490658504988659){w=+h[f>>3]<=1.3962634016954636}else{w=0}m=w&1;break};case 9:{if(+h[f>>3]>=-3.141592653689793){x=+h[f>>3]<=-1.7453292518943295}else{x=0}m=x&1;break};case 6:{if(+h[f>>3]>=-1.7453292520943295){y=+h[f>>3]<=-.3490658502988659}else{y=0}m=y&1;break};case 7:{if(+h[f>>3]>=-.3490658504988659){z=+h[f>>3]<=1.3962634016954636}else{z=0}m=z&1;break};case 8:{if(+h[f>>3]>=1.3962634014954636){A=+h[f>>3]<=3.141592653689793}else{A=0}m=A&1;break};case 12:{if(+h[f>>3]>=1.3962634014954636){B=+h[f>>3]<=3.141592653689793}else{B=0}m=B&1;break};case 1:{if(+h[f>>3]>=-3.141592653689793){if(+h[f>>3]<=-.6981317006977318){C=1}else{l=36}}else{l=36}if((l|0)==36){do{if(+h[f>>3]>=-.6981317008977318){if(+h[f>>3]>-.17453292509943294){D=0;break}if(+h[f+8>>3]>=1.0471975510965976){E=+h[f+8>>3]<=1.5707963268948966}else{E=0}D=E}else{D=0}}while(0);C=D}m=C&1;break};default:{}}if((m|0)!=0){F=d}else{F=0}d=F}if((d|0)==0){h[f>>3]=q}if((d|0)!=0){G=a;H=f;c[G>>2]=c[H>>2];c[G+4>>2]=c[H+4>>2];c[G+8>>2]=c[H+8>>2];c[G+12>>2]=c[H+12>>2];i=e;return}h[f+8>>3]=q;G=a;H=f;c[G>>2]=c[H>>2];c[G+4>>2]=c[H+4>>2];c[G+8>>2]=c[H+8>>2];c[G+12>>2]=c[H+12>>2];i=e;return}function Ff(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;if(+h[b+8>>3]>=.7109879899933945){k=+h[b>>3]<=-.6981317007977318?1:2}else{if(+h[b+8>>3]>=0.0){k=+h[b>>3]<=-.6981317007977318?3:4}else{if(+h[b+8>>3]>=-.7109879899933945){if(+h[b>>3]<=-1.7453292519943295){k=5}else{if(+h[b>>3]<=-.3490658503988659){k=6}else{if(+h[b>>3]<=1.3962634015954636){k=7}else{k=8}}}}else{if(+h[b>>3]<=-1.7453292519943295){k=9}else{if(+h[b>>3]<=-.3490658503988659){k=10}else{if(+h[b>>3]<=1.3962634015954636){k=11}else{k=12}}}}}}d=b|0;h[d>>3]=+h[d>>3]- +h[(c[j+296+(k-1<<2)>>2]|0)+112>>3];Nb[c[(c[j+296+(k-1<<2)>>2]|0)+4>>2]&511](g,b,c[j+296+(k-1<<2)>>2]|0);b=f;d=g;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];d=f|0;h[d>>3]=+h[d>>3]+ +h[(c[j+296+(k-1<<2)>>2]|0)+128>>3];d=f+8|0;h[d>>3]=+h[d>>3]+ +h[(c[j+296+(k-1<<2)>>2]|0)+136>>3];k=a;a=f;c[k>>2]=c[a>>2];c[k+4>>2]=c[a+4>>2];c[k+8>>2]=c[a+8>>2];c[k+12>>2]=c[a+12>>2];i=e;return}function Gf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;b=i;i=i+64|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=b+32|0;k=b+40|0;l=b+48|0;m=b+56|0;n=a;if((n|0)==0){a=om(400)|0;n=a;if((a|0)!=0){ln(n|0,0,400)|0;c[n+16>>2]=114;c[n+4>>2]=0;c[n+8>>2]=0;c[n+12>>2]=0;c[n+20>>2]=10688;c[n+392>>2]=0}o=n;p=o;i=b;return p|0}a=qm(+h[n+64>>3])|0;c[n+392>>2]=a;if((a|0)==0){Hf(n);o=0;p=o;i=b;return p|0}a=If(n,d,e)|0;if((a|0)!=0){Cl(c[n>>2]|0,a);Hf(n);o=0;p=o;i=b;return p|0}if(+h[n+376>>3]<+h[n+368>>3]){h[d>>3]=+h[n+368>>3];h[n+368>>3]=+h[n+376>>3];h[n+376>>3]=+h[d>>3]}ym(l,c[n>>2]|0,c[n+24>>2]|0,20776);if((c[l>>2]|0)!=0){ym(m,c[n>>2]|0,c[n+24>>2]|0,21784);h[n+384>>3]=+h[m>>3]}else{h[e>>3]=+P(+(+h[e>>3]*57.29577951308232));if(+h[e>>3]<=60.0){h[e>>3]=2.0}else{if(+h[e>>3]<=76.0){h[e>>3]=4.0}else{h[e>>3]=8.0}}h[n+384>>3]=+h[e>>3]*.017453292519943295}c[n+396>>2]=0;if(+h[n+368>>3]!=0.0){Jf(n,+h[n+368>>3],f,k,n+344|0,n+328|0)}else{c[n+396>>2]=1;h[k>>3]=0.0;h[f>>3]=+h[n+384>>3]}if(+h[n+376>>3]!=0.0){Jf(n,+h[n+376>>3],g,j,n+352|0,n+336|0)}else{c[n+396>>2]=-1;h[j>>3]=0.0;h[g>>3]=+h[n+384>>3]}q=+S(+h[n+368>>3]);r=+rm(+h[n+368>>3],+h[n+344>>3],q,c[n+392>>2]|0);q=+S(+h[n+376>>3]);s=+rm(+h[n+376>>3],+h[n+352>>3],q,c[n+392>>2]|0);q=s-r;t=+h[g>>3]- +h[f>>3];u=+Q(q*q-t*t);t=u+ +h[k>>3];h[n+360>>3]=t- +h[j>>3];q=1.0/q;h[n+296>>3]=(s*+h[k>>3]-r*t)*q;h[n+312>>3]=(t- +h[k>>3])*q;h[n+304>>3]=(s*+h[f>>3]-r*+h[g>>3])*q;h[n+320>>3]=(+h[g>>3]- +h[f>>3])*q;c[n+4>>2]=356;c[n+8>>2]=62;o=n;p=o;i=b;return p|0}function Hf(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+392>>2]|0)!=0){pm(c[d+392>>2]|0)}pm(d);i=b;return}function If(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;j=e+16|0;k=e+24|0;l=a;a=b;b=d;d=0;ym(f,c[l>>2]|0,c[l+24>>2]|0,19168);do{if((c[f>>2]|0)!=0){ym(g,c[l>>2]|0,c[l+24>>2]|0,17520);if((c[g>>2]|0)==0){break}ym(j,c[l>>2]|0,c[l+24>>2]|0,16656);h[l+368>>3]=+h[j>>3];ym(k,c[l>>2]|0,c[l+24>>2]|0,15680);h[l+376>>3]=+h[k>>3];h[a>>3]=(+h[l+376>>3]- +h[l+368>>3])*.5;h[b>>3]=(+h[l+376>>3]+ +h[l+368>>3])*.5;if(+P(+(+h[a>>3]))<1.0e-10){m=1}else{m=+P(+(+h[b>>3]))<1.0e-10}d=m?-42:0;n=d;i=e;return n|0}}while(0);d=-41;n=d;i=e;return n|0}function Jf(a,b,c,d,e,f){a=a|0;b=+b;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,j=0.0;g=a;j=b;a=e;e=f;h[a>>3]=+T(j);b=+U(j);h[e>>3]=1.0/(b*+Q(1.0- +h[g+64>>3]*+h[a>>3]*+h[a>>3]));b=+h[g+384>>3]*+h[a>>3];h[d>>3]=+h[e>>3]*(1.0- +S(b));h[c>>3]=+h[e>>3]*+T(b);i=i;return}function Kf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+40|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+24|0;ln(f|0,0,16)|0;Mf(g,b,d,e+16|0);d=f;b=g;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Lf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+56|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=e+40|0;l=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[l+376>>3];h[f>>3]=+h[b>>3]/+S(+h[f+8>>3]);do{Mf(k,f,l,j);d=g;m=k;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];h[f+8>>3]=(+h[f+8>>3]- +h[l+368>>3])*(+h[b+8>>3]- +h[j>>3])/(+h[g+8>>3]- +h[j>>3])+ +h[l+368>>3];h[f>>3]=+h[f>>3]*+h[b>>3]/+h[g>>3];if(+P(+(+h[g>>3]- +h[b>>3]))>1.0e-10){n=1}else{n=+P(+(+h[g+8>>3]- +h[b+8>>3]))>1.0e-10}}while(n);n=a;a=f;c[n>>2]=c[a>>2];c[n+4>>2]=c[a+4>>2];c[n+8>>2]=c[a+8>>2];c[n+12>>2]=c[a+12>>2];i=e;return}function Mf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;f=i;i=i+16|0;g=b;b=i;i=i+16|0;c[b>>2]=c[g>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];c[b+12>>2]=c[g+12>>2];g=f|0;j=d;d=e;if(+h[b+8>>3]==0.0){h[g>>3]=+h[b>>3];h[g+8>>3]=0.0;k=a;l=g;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];i=f;return}m=+T(+h[b+8>>3]);n=+S(+h[b+8>>3]);o=+rm(+h[b+8>>3],m,n,c[j+392>>2]|0);n=+h[j+304>>3]+ +h[j+320>>3]*o;p=+U(+h[b+8>>3]);q=1.0/(p*+Q(1.0- +h[j+64>>3]*m*m));m=+Q(q*q-n*n);if(+h[b+8>>3]<0.0){m=-0.0-m}m=m+(+h[j+296>>3]+ +h[j+312>>3]*o-q);if((c[j+396>>2]|0)<0){r=+h[b>>3];s=+h[j+360>>3]}else{t=+h[b>>3]*+h[j+352>>3];r=+h[j+336>>3]*+T(t);s=+h[j+360>>3]+ +h[j+336>>3]*(1.0- +S(t))}if((c[j+396>>2]|0)>0){u=+h[b>>3];h[d>>3]=0.0}else{t=+h[b>>3]*+h[j+344>>3];u=+h[j+328>>3]*+T(t);h[d>>3]=+h[j+328>>3]*(1.0- +S(t))}t=(r-u)/(s- +h[d>>3]);s=u+t*(m+q- +h[d>>3]);h[g>>3]=t*+Q(q*q*(t*t+1.0)-s*s);if(+h[b+8>>3]>0.0){h[g>>3]=-0.0- +h[g>>3]}h[g>>3]=(s+ +h[g>>3])/(t*t+1.0);h[g+8>>3]=+Q(q*q- +h[g>>3]*+h[g>>3]);if(+h[b+8>>3]>0.0){h[g+8>>3]=-0.0- +h[g+8>>3]}b=g+8|0;h[b>>3]=+h[b>>3]+(m+q);k=a;l=g;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];i=f;return}function Nf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;i=i+136|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=b+32|0;k=b+40|0;l=b+48|0;m=b+56|0;n=b+64|0;o=b+72|0;p=b+80|0;q=b+88|0;r=b+96|0;s=b+104|0;t=b+112|0;u=b+120|0;v=b+128|0;w=a;if((w|0)==0){a=om(368)|0;w=a;if((a|0)!=0){ln(w|0,0,368)|0;c[w+16>>2]=42;c[w+4>>2]=0;c[w+8>>2]=0;c[w+12>>2]=0;c[w+20>>2]=10648}x=w;y=x;i=b;return y|0}c[w+4>>2]=172;Qf(w+296|0)|0;c[w+352>>2]=4;ym(d,c[w>>2]|0,c[w+24>>2]|0,20272);a=c[d>>2]|0;if((a|0)!=0){do{if((Hb(a|0,21744)|0)!=0){if((Hb(a|0,19160)|0)!=0){Cl(c[w>>2]|0,-34);Of(w);x=0;y=x;i=b;return y|0}else{Sf(w+296|0)|0;break}}else{Rf(w+296|0)|0}}while(0)}ym(e,c[w>>2]|0,c[w+24>>2]|0,17512);if((c[e>>2]|0)!=0){ym(f,c[w>>2]|0,c[w+24>>2]|0,16568);h[w+320>>3]=+h[f>>3]}ym(g,c[w>>2]|0,c[w+24>>2]|0,15592);if((c[g>>2]|0)!=0){ym(j,c[w>>2]|0,c[w+24>>2]|0,14968);h[w+312>>3]=+h[j>>3]}ym(k,c[w>>2]|0,c[w+24>>2]|0,14464);if((c[k>>2]|0)!=0){ym(l,c[w>>2]|0,c[w+24>>2]|0,14120);h[w+304>>3]=+h[l>>3]}ym(m,c[w>>2]|0,c[w+24>>2]|0,13632);if((c[m>>2]|0)!=0){ym(n,c[w>>2]|0,c[w+24>>2]|0,22320);c[w+336>>2]=c[n>>2]}ym(o,c[w>>2]|0,c[w+24>>2]|0,21952);if((c[o>>2]|0)!=0){ym(p,c[w>>2]|0,c[w+24>>2]|0,21504);c[w+340>>2]=c[p>>2]}ym(q,c[w>>2]|0,c[w+24>>2]|0,21104);a=c[q>>2]|0;if((a|0)!=0){if((Hb(a|0,20808)|0)!=0){if((Hb(a|0,20280)|0)!=0){do{if((Hb(a|0,20104)|0)!=0){if((Hb(a|0,19936)|0)!=0){Cl(c[w>>2]|0,-34);Of(w);x=0;y=x;i=b;return y|0}else{c[w+352>>2]=8;break}}else{c[w+352>>2]=5}}while(0)}else{c[w+352>>2]=1}}else{c[w+352>>2]=4}}ym(r,c[w>>2]|0,c[w+24>>2]|0,19776);if((c[r>>2]|0)!=0){h[w+344>>3]=.8301572857837595}ym(s,c[w>>2]|0,c[w+24>>2]|0,21952);if((c[s>>2]|0)!=0){ym(t,c[w>>2]|0,c[w+24>>2]|0,21504);c[w+340>>2]=c[t>>2]}else{c[w+340>>2]=4}ym(u,c[w>>2]|0,c[w+24>>2]|0,13632);if((c[u>>2]|0)!=0){ym(v,c[w>>2]|0,c[w+24>>2]|0,22320);c[w+336>>2]=c[v>>2]}else{c[w+336>>2]=3}x=w;y=x;i=b;return y|0}function Of(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Pf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0;e=i;i=i+64|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=e+48|0;ln(f|0,0,16)|0;h[j>>3]=+h[b>>3];h[j+8>>3]=+h[b+8>>3];Tf(k,d+296|0,j);j=g;d=k;c[j>>2]=c[d>>2];c[j+4>>2]=c[d+4>>2];c[j+8>>2]=c[d+8>>2];c[j+12>>2]=c[d+12>>2];h[f>>3]=+h[g>>3];h[f+8>>3]=+h[g+8>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Qf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d>>2]=20;h[d+8>>3]=1.0172219679233507;h[d+16>>3]=.19634954084936207;h[d+24>>3]=0.0;c[d+40>>2]=4;c[d+44>>2]=6;h[d+48>>3]=1.0;c[d+36>>2]=6;e=1;f=e;i=b;return f|0}else{e=0;f=e;i=b;return f|0}return 0}function Rf(a){a=a|0;var b=0,c=0,d=0,e=0;b=i;c=a;if((c|0)!=0){h[c+8>>3]=1.0172219679233507;h[c+16>>3]=.19634954084936207;h[c+24>>3]=0.0;d=1;e=d;i=b;return e|0}else{d=0;e=d;i=b;return e|0}return 0}function Sf(a){a=a|0;var b=0,c=0,d=0,e=0;b=i;c=a;if((c|0)!=0){h[c+8>>3]=1.5707963267948966;h[c+16>>3]=0.0;h[c+24>>3]=0.0;d=1;e=d;i=b;return e|0}else{d=0;e=d;i=b;return e|0}return 0}function Tf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0;e=i;i=i+32|0;f=e|0;g=e+16|0;j=b;b=Uf(j,d,f)|0;if((c[j+56>>2]|0)==4){Vf(b,f,+h[j+48>>3])|0;d=a;k=f;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return}h[f>>3]=+h[f>>3]/+h[j+48>>3]*.8301572857837595;h[f+8>>3]=+h[f+8>>3]/+h[j+48>>3]*.8301572857837595;k=f|0;h[k>>3]=+h[k>>3]+.5;k=f+8|0;h[k>>3]=+h[k>>3]+.28867513459481287;switch(c[j+56>>2]|0){case 8:{Zf(j,b,f,g)|0;k=a;d=g;c[k>>2]=c[d>>2];c[k+4>>2]=c[d+4>>2];c[k+8>>2]=c[d+8>>2];c[k+12>>2]=c[d+12>>2];i=e;return};case 6:{break};case 5:{c[j+64>>2]=Wf(b,f)|0;break};case 1:{c[j+64>>2]=Xf(j,b,f,g)|0;d=a;k=g;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return};case 7:{c[j+64>>2]=Wf(b,f)|0;break};case 2:{Xf(j,b,f,g)|0;Yf(j,c[j+64>>2]|0,g)|0;j=a;b=g;c[j>>2]=c[b>>2];c[j+4>>2]=c[b+4>>2];c[j+8>>2]=c[b+8>>2];c[j+12>>2]=c[b+12>>2];i=e;return};default:{}}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Uf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0;e=i;i=i+48|0;f=e|0;g=e+16|0;j=e+32|0;k=a;a=d;h[g+8>>3]=+h[k+8>>3];h[g>>3]=+h[k+16>>3];fg(j,g,b,+h[k+24>>3]);b=f;g=j;c[b>>2]=c[g>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];c[b+12>>2]=c[g+12>>2];g=gg(f,a)|0;f=a|0;h[f>>3]=+h[f>>3]*+h[k+48>>3];f=a+8|0;h[f>>3]=+h[f>>3]*+h[k+48>>3];c[k+60>>2]=g;i=e;return g|0}function Vf(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,j=0,k=0.0,l=0;e=i;i=i+32|0;f=e|0;g=e+16|0;j=a;a=b;k=d;if((((j-1|0)/5|0|0)%2|0|0)==1){ag(a,180.0)}eg(g,j);b=f;l=g;c[b>>2]=c[l>>2];c[b+4>>2]=c[l+4>>2];c[b+8>>2]=c[l+8>>2];c[b+12>>2]=c[l+12>>2];l=f|0;h[l>>3]=+h[l>>3]*k;l=f+8|0;h[l>>3]=+h[l>>3]*k;l=a|0;h[l>>3]=+h[l>>3]+ +h[f>>3];l=a+8|0;h[l>>3]=+h[l>>3]+ +h[f+8>>3];i=e;return j|0}function Wf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=i;d=a;a=b;b=(((d-1|0)/5|0|0)%2|0|0)==1|0;e=((d-1|0)%5|0)+(((d-1|0)/10|0)*5|0)+1|0;ag(a,(b|0)!=0?240.0:60.0);if((b|0)==0){f=e;i=c;return f|0}b=a|0;h[b>>3]=+h[b>>3]+.5;b=a+8|0;h[b>>3]=+h[b>>3]+.8660254037844386;f=e;i=c;return f|0}function Xf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f|0;h=g;j=d;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];j=Wf(b,g)|0;j=_f(a,j,g,e)|0;i=f;return j|0}function Yf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0;e=i;f=a;a=b;b=d;if((a|0)==0){c[f+68>>2]=1;g=c[f+68>>2]|0;j=g;i=e;return j|0}d=~~(+R(+(+(c[f+40>>2]|0)),+(+(c[f+44>>2]|0)))+.5);if((a|0)==11){c[f+68>>2]=(d*10|0)+2;g=c[f+68>>2]|0;j=g;i=e;return j|0}do{if((c[f+40>>2]|0)==3){if(((c[f+44>>2]|0)%2|0|0)!=1){k=8;break}l=~~+R(+(+(c[f+40>>2]|0)),+(+((c[f+44>>2]|0)-1|0)/2.0));m=aa(~~+h[b>>3],l)|0;m=m+((~~+h[b+8>>3]|0)/(l|0)|0)|0;m=m+(aa(a-1|0,d)|0)|0;m=m+2|0}else{k=8}}while(0);if((k|0)==8){n=+(aa(a-1|0,d)|0);o=+(~~(+R(+(+(c[f+40>>2]|0)),+(+(c[f+44>>2]|0)/2.0))+.5)|0);m=~~(n+o*+h[b>>3]+ +h[b+8>>3]+2.0)}c[f+68>>2]=m;g=m;j=g;i=e;return j|0}function Zf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e|0;g=d;d=Xf(a,b,c,f)|0;h[g>>3]=+((~~+h[f>>3]<<4)+d|0);h[g+8>>3]=+h[f+8>>3];i=e;return 1}function _f(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+32|0;g=f|0;j=f+16|0;k=a;a=b;b=d;d=e;do{if((c[k+40>>2]|0)==3){if(((c[k+44>>2]|0)%2|0|0)==0){break}l=$f(k,a,b,d)|0;m=l;i=f;return m|0}}while(0);if((c[k+40>>2]|0)>0){n=~~(+R(+(+(c[k+40>>2]|0)),+(+(c[k+44>>2]|0)/2.0))+.5)}else{n=c[k+44>>2]|0}e=g;o=b;c[e>>2]=c[o>>2];c[e+4>>2]=c[o+4>>2];c[e+8>>2]=c[o+8>>2];c[e+12>>2]=c[o+12>>2];ag(g,-30.0);bg(0,1.0/+(n|0),+h[g>>3],+h[g+8>>3],j+4|0,j+8|0)|0;c[j>>2]=0;cg(j)|0;if((a|0)<=5){do{if((c[j+4>>2]|0)==0){if((c[j+12>>2]|0)!=(-n|0)){p=11;break}a=0;c[j+12>>2]=0;c[j+8>>2]=0;c[j+4>>2]=0}else{p=11}}while(0);if((p|0)==11){if((c[j+12>>2]|0)==(-n|0)){a=a+1|0;if((a|0)==6){a=1}c[j+8>>2]=n-(c[j+4>>2]|0);c[j+12>>2]=(c[j+4>>2]|0)-n;c[j+4>>2]=0}else{if((c[j+4>>2]|0)==(n|0)){a=a+5|0;c[j+8>>2]=-(c[j+12>>2]|0);c[j+4>>2]=0}}}}else{if((a|0)>=6){do{if((c[j+12>>2]|0)==0){if((c[j+4>>2]|0)!=(n|0)){p=24;break}a=11;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0}else{p=24}}while(0);if((p|0)==24){if((c[j+4>>2]|0)==(n|0)){a=a+1|0;if((a|0)==11){a=6}c[j+4>>2]=(c[j+8>>2]|0)+n;c[j+8>>2]=0;c[j+12>>2]=-(c[j+4>>2]|0)}else{if((c[j+8>>2]|0)==(-n|0)){a=a-4|0;c[j+8>>2]=0;c[j+12>>2]=-(c[j+4>>2]|0)}}}}}h[d>>3]=+(c[j+4>>2]|0);h[d+8>>3]=+(-(c[j+12>>2]|0)|0);c[k+64>>2]=a;l=a;m=l;i=f;return m|0}function $f(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+32|0;g=f|0;j=f+16|0;k=a;a=b;b=e;l=(+R(+2.0,+(+(c[k+44>>2]|0)))+1.0)/2.0;m=+S(.5235987755982988)/l;e=~~(l*2.0+.5);n=g;o=d;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];bg(0,m,+h[g>>3],+h[g+8>>3],j+4|0,j+8|0)|0;c[j>>2]=0;cg(j)|0;g=(c[j+4>>2]|0)-(c[j+12>>2]|0)|0;o=(c[j+4>>2]|0)+(c[j+8>>2]|0)+(c[j+8>>2]|0)|0;if((a|0)<=5){do{if((g|0)==0){if((o|0)!=(e|0)){p=5;break}a=0;g=0;o=0}else{p=5}}while(0);if((p|0)==5){if((o|0)==(e|0)){a=a+1|0;if((a|0)==6){a=1}o=e-g|0;g=0}else{if((g|0)==(e|0)){a=a+5|0;g=0}}}q=g;r=+(q|0);s=b;t=s|0;h[t>>3]=r;u=o;v=+(u|0);w=b;x=w+8|0;h[x>>3]=v;y=a;z=k;A=z+64|0;c[A>>2]=y;B=a;i=f;return B|0}if((a|0)>=6){do{if((o|0)==0){if((g|0)!=(e|0)){p=18;break}a=11;g=0;o=0}else{p=18}}while(0);if((p|0)==18){if((g|0)==(e|0)){a=a+1|0;if((a|0)==11){a=6}g=e-o|0;o=0}else{if((o|0)==(e|0)){a=(a-4|0)%5|0;o=0}}}}q=g;r=+(q|0);s=b;t=s|0;h[t>>3]=r;u=o;v=+(u|0);w=b;x=w+8|0;h[x>>3]=v;y=a;z=k;A=z+64|0;c[A>>2]=y;B=a;i=f;return B|0}function ag(a,b){a=a|0;b=+b;var c=0,d=0,e=0.0,f=0.0,g=0.0;c=i;d=a;e=(-0.0-b)*3.141592653589793/180.0;while(1){if(e<6.283185307179586){break}e=e-6.283185307179586}while(1){if(e>-6.283185307179586){break}e=e+6.283185307179586}b=+h[d>>3]*+S(e);f=b+ +h[d+8>>3]*+T(e);b=(-0.0- +h[d>>3])*+T(e);g=b+ +h[d+8>>3]*+S(e);h[d>>3]=f;h[d+8>>3]=g;i=c;return}function bg(a,b,d,e,f,g){a=a|0;b=+b;d=+d;e=+e;f=f|0;g=g|0;var h=0,j=0.0,k=0,l=0.0,m=0,n=0.0,o=0,p=0,q=0.0,r=0;a=i;i=i+16|0;h=a|0;j=b;b=d;d=e;k=f;f=g;b=b/+S(.5235987755982988);d=d-b/2.0;b=b/j;d=d/j;j=-0.0-b-d;e=+O(b+.5);g=~~e;l=+O(d+.5);m=~~l;n=+O(j+.5);o=~~n;p=g+m+o|0;if((p|0)!=0){q=+P(+(e-b));b=+P(+(l-d));d=+P(+(n-j));do{if(q>=b){if(q<d){r=5;break}g=g-p|0}else{r=5}}while(0);if((r|0)==5){do{if(b>=q){if(b<d){r=8;break}m=m-p|0}else{r=8}}while(0);if((r|0)==8){o=o-p|0}}}c[h+4>>2]=g;c[h+8>>2]=m;c[h+12>>2]=o;c[h>>2]=1;dg(h)|0;c[k>>2]=c[h+4>>2];c[f>>2]=c[h+8>>2];i=a;return(g*100|0)+m|0}function cg(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((c[d>>2]|0)!=0){e=1;f=e;i=b;return f|0}if((c[d+4>>2]|0)>=0){c[d+8>>2]=(-(c[d+8>>2]|0)|0)-(((c[d+4>>2]|0)+1|0)/2|0)}else{c[d+8>>2]=(-(c[d+8>>2]|0)|0)-((c[d+4>>2]|0)/2|0)}c[d+12>>2]=(-(c[d+4>>2]|0)|0)-(c[d+8>>2]|0);c[d>>2]=1;e=1;f=e;i=b;return f|0}function dg(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((c[d>>2]|0)==0){e=1;f=e;i=b;return f|0}if((c[d+4>>2]|0)>=0){c[d+8>>2]=(-(c[d+8>>2]|0)|0)-(((c[d+4>>2]|0)+1|0)/2|0)}else{c[d+8>>2]=(-(c[d+8>>2]|0)|0)-((c[d+4>>2]|0)/2|0)}c[d>>2]=0;e=1;f=e;i=b;return f|0}function eg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0.0;d=i;i=i+16|0;e=d|0;f=b;g=.9103832815309029;f=(f-1|0)%20|0;h[e>>3]=+(((f|0)%5|0)-2|0)*.6615845383*2.0;if((f|0)>9){b=e|0;h[b>>3]=+h[b>>3]+.6615845383}b=(f|0)/5|0;if((b|0)==3){h[e+8>>3]=-.954915028}else if((b|0)==0){h[e+8>>3]=.954915028}else if((b|0)==2){h[e+8>>3]=-.1909830056}else if((b|0)==1){h[e+8>>3]=.1909830056}else{Ta(1)}b=e|0;h[b>>3]=+h[b>>3]*g;b=e+8|0;h[b>>3]=+h[b>>3]*g;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}



function fg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0,g=0,j=0,k=0;f=i;i=i+32|0;g=f|0;j=f+16|0;k=b;b=k|0;h[b>>3]=+h[b>>3]+3.141592653589793;jg(j,k,d);d=g;b=j;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=k|0;h[b>>3]=+h[b>>3]-3.141592653589793;b=g|0;h[b>>3]=+h[b>>3]-(3.141592653589793-e+ +h[k>>3]);k=g|0;h[k>>3]=+h[k>>3]+3.141592653589793;h[g>>3]=+bb(+(+h[g>>3]),6.283185307179586);while(1){if(+h[g>>3]<=3.141592653589793){break}k=g|0;h[k>>3]=+h[k>>3]-6.283185307179586}while(1){if(+h[g>>3]>=-3.141592653589793){break}k=g|0;h[k>>3]=+h[k>>3]+6.283185307179586}k=a;a=g;c[k>>2]=c[a>>2];c[k+4>>2]=c[a+4>>2];c[k+8>>2]=c[a+8>>2];c[k+12>>2]=c[a+12>>2];i=f;return}function gg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0.0;d=i;i=i+88|0;e=d|0;f=d+72|0;g=a;a=b;mn(e|0,13120,72)|0;j=+h[e+16>>3]*.017453292519943295;k=+h[e>>3]*.017453292519943295;l=+h[e+8>>3]*.017453292519943295;e=1;while(1){if((e|0)>20){m=17;break}b=f;n=6584+(e<<4)|0;c[b>>2]=c[n>>2];c[b+4>>2]=c[n+4>>2];c[b+8>>2]=c[n+8>>2];c[b+12>>2]=c[n+12>>2];p=+T(+h[f+8>>3]);q=p*+T(+h[g+8>>3]);p=+S(+h[f+8>>3]);r=p*+S(+h[g+8>>3]);s=+V(q+r*+S(+h[g>>3]- +h[f>>3]));if(s<=k+5.0e-6){t=+hg(+h[g>>3],+h[g+8>>3],+h[f>>3],+h[f+8>>3]);r=+S(+h[g+8>>3]);q=r*+T(+h[g>>3]- +h[f>>3]);r=+S(+h[f+8>>3]);p=r*+T(+h[g+8>>3]);r=+T(+h[f+8>>3]);u=r*+S(+h[g+8>>3]);t=+Y(+q,+(p-u*+S(+h[g>>3]- +h[f>>3])));t=t- +ig(e);if(t<0.0){t=t+6.283185307179586}v=0;while(1){if(t>=0.0){break}t=t+2.0943951023931957;v=v-1|0}while(1){if(t<=2.0943951023931957){break}t=t-2.0943951023931957;v=v+1|0}w=1.0/+U(j);x=+U(k);y=+Y(+x,+(+S(t)+ +T(t)*w));if(s<=y+5.0e-6){m=15;break}}e=e+1|0}if((m|0)==15){j=.9103832815309029;u=t+l+ +V(+T(t)*+T(l)*+S(k)- +S(t)*+S(l))-3.141592653589793;l=+Y(+(2.0*u),+(j*j*x*x-2.0*u*w));u=2.0*j*(j*x/(+S(l)+ +T(l)*w)/(2.0*j*+T(y/2.0)))*+T(s/2.0);l=l+2.0943951023931957*+(v|0);s=u*+S(l);h[a>>3]=u*+T(l);h[a+8>>3]=s;i=d;return e|0}else if((m|0)==17){s=+h[g+8>>3]*57.29577951308232;wa(c[o>>2]|0,19576,(m=i,i=i+16|0,h[m>>3]=+h[g>>3]*57.29577951308232,h[m+8>>3]=s,m)|0)|0;i=m;Ta(1);return 0}return 0}function hg(a,b,c,d){a=+a;b=+b;c=+c;d=+d;var e=0.0;e=a;a=b;b=c;c=d;d=+Y(+(+S(c)*+T(b-e)),+(+S(a)*+T(c)- +T(a)*+S(c)*+S(b-e)));i=i;return+d}function ig(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;b=i;i=i+32|0;d=b|0;e=b+16|0;f=a;a=d;g=32+(c[224+(f<<2)>>2]<<4)|0;c[a>>2]=c[g>>2];c[a+4>>2]=c[g+4>>2];c[a+8>>2]=c[g+8>>2];c[a+12>>2]=c[g+12>>2];g=e;a=6584+(f<<4)|0;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];j=+S(+h[d+8>>3]);k=j*+T(+h[d>>3]- +h[e>>3]);j=+S(+h[e+8>>3]);l=j*+T(+h[d+8>>3]);j=+T(+h[e+8>>3]);m=j*+S(+h[d+8>>3]);j=+Y(+k,+(l-m*+S(+h[d>>3]- +h[e>>3])));i=b;return+j}function jg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0;e=i;i=i+16|0;f=e|0;g=b;b=d;j=+h[b+8>>3];k=+h[b>>3];l=+h[g+8>>3];m=+h[g>>3];n=m;o=+S(j);p=+T(l);q=p*+T(j)- +S(l)*o*+S(k-n);r=+Y(+(o*+T(k-n)),+(p*o*+S(k-n)+ +S(l)*+T(j)))+m;r=+bb(+r,6.283185307179586);while(1){if(r<=3.141592653589793){break}r=r-6.283185307179586}while(1){if(r>=-3.141592653589793){break}r=r+6.283185307179586}h[f+8>>3]=+W(q);h[f>>3]=r;g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function kg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=a;if((j|0)==0){a=om(304)|0;j=a;if((a|0)!=0){ln(j|0,0,304)|0;c[j+16>>2]=18;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+20>>2]=10560}k=j;l=k;i=b;return l|0}ym(d,c[j>>2]|0,c[j+24>>2]|0,20096);h[j+296>>3]=+h[d>>3];h[j+48>>3]=6377397.155;h[j+64>>3]=.006674372230614;h[j+80>>3]=+Q(.006674372230614);ym(e,c[j>>2]|0,c[j+24>>2]|0,21672);if((c[e>>2]|0)==0){h[j+120>>3]=.863937979737193}ym(f,c[j>>2]|0,c[j+24>>2]|0,19112);if((c[f>>2]|0)==0){h[j+112>>3]=.4334234309119251}ym(g,c[j>>2]|0,c[j+24>>2]|0,17472);if((c[g>>2]|0)==0){h[j+144>>3]=.9999}c[j+8>>2]=224;c[j+4>>2]=52;k=j;l=k;i=b;return l|0}function lg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function mg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;e=i;i=i+24|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;k=.785398163397448;l=+h[j+120>>3];m=.006674372230614;n=+Q(m);o=+Q(m*+R(+(+S(l)),+4.0)/(1.0-m)+1.0);p=+U(+W(+T(l)/o)/2.0+k)/+R(+(+U(l/2.0+k)),+o)*+R(+((n*+T(l)+1.0)/(1.0-n*+T(l))),+(o*n/2.0));q=1.37008346281555;r=+T(q);s=+h[j+144>>3]*(1.0*+Q(1.0-m)/(1.0-m*+R(+(+T(l)),+2.0)))/+U(q);l=2.0*k-1.04216856380474;m=+h[b>>3];h[b>>3]=+h[b+8>>3];h[b+8>>3]=m;ym(g,c[j>>2]|0,c[j+24>>2]|0,16544);if((c[g>>2]|0)==0){g=b|0;h[g>>3]=+h[g>>3]*-1.0;g=b+8|0;h[g>>3]=+h[g>>3]*-1.0}m=+Q(+h[b>>3]*+h[b>>3]+ +h[b+8>>3]*+h[b+8>>3]);t=+Y(+(+h[b+8>>3]),+(+h[b>>3]))/+T(q);u=(+X(+R(+(s/m),+(1.0/r))*+U(q/2.0+k))-k)*2.0;q=+W(+S(l)*+T(u)- +T(l)*+S(u)*+S(t));l=+W(+S(u)*+T(t)/+S(q));h[f>>3]=+h[j+112>>3]-l/o;l=q;b=0;do{h[f+8>>3]=(+X(+R(+p,+(-1.0/o))*+R(+(+U(q/2.0+k)),+(1.0/o))*+R(+((n*+T(l)+1.0)/(1.0-n*+T(l))),+(n/2.0)))-k)*2.0;if(+P(+(l- +h[f+8>>3]))<1.0e-15){b=1}l=+h[f+8>>3];}while((b|0)==0);b=f|0;h[b>>3]=+h[b>>3]- +h[j+112>>3];j=a;a=f;c[j>>2]=c[a>>2];c[j+4>>2]=c[a+4>>2];c[j+8>>2]=c[a+8>>2];c[j+12>>2]=c[a+12>>2];i=e;return}function ng(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0;e=i;i=i+24|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;k=.785398163397448;l=+h[j+120>>3];m=1.0;n=.006674372230614;o=+Q(n);p=+Q(n*+R(+(+S(l)),+4.0)/(1.0-n)+1.0);q=+U(+W(+T(l)/p)/2.0+k)/+R(+(+U(l/2.0+k)),+p)*+R(+((o*+T(l)+1.0)/(1.0-o*+T(l))),+(p*o/2.0));r=1.37008346281555;s=+T(r);t=+h[j+144>>3]*(m*+Q(1.0-n)/(1.0-n*+R(+(+T(l)),+2.0)))/+U(r);l=2.0*k-1.04216856380474;n=o*+T(+h[b+8>>3])+1.0;u=+R(+(n/(1.0-o*+T(+h[b+8>>3]))),+(p*o/2.0));o=(+X(q*+R(+(+U(+h[b+8>>3]/2.0+k)),+p)/u)-k)*2.0;u=(-0.0- +h[b>>3])*p;p=+W(+S(l)*+T(o)+ +T(l)*+S(o)*+S(u));l=s*+W(+S(o)*+T(u)/+S(p));u=t*+R(+(+U(r/2.0+k)),+s)/+R(+(+U(p/2.0+k)),+s);h[f+8>>3]=u*+S(l)/m;h[f>>3]=u*+T(l)/m;ym(g,c[j>>2]|0,c[j+24>>2]|0,16544);if((c[g>>2]|0)!=0){v=a;w=f;c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];c[v+12>>2]=c[w+12>>2];i=e;return}g=f+8|0;h[g>>3]=+h[g>>3]*-1.0;g=f|0;h[g>>3]=+h[g>>3]*-1.0;v=a;w=f;c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];c[v+12>>2]=c[w+12>>2];i=e;return}function og(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)!=0){ym(d,c[f>>2]|0,c[f+24>>2]|0,19920);c[f+368>>2]=(c[d>>2]|0)==0;ym(e,c[f>>2]|0,c[f+24>>2]|0,21624);g=+h[e>>3];j=+T(+h[f+120>>3]);k=1.0- +h[f+64>>3]*j*j;l=1.0/+Q(k);m=+h[f+96>>3]*l/k;h[f+304>>3]=+h[f+144>>3]*+Q(l*m);n=+Q(m/l);h[f+312>>3]=+X(n*+U(+h[f+120>>3]));h[f+320>>3]=j/+T(+h[f+312>>3]);k=+h[f+80>>3]*j;j=+h[f+80>>3]*.5*+h[f+320>>3]*+_((1.0+k)/(1.0-k));n=j+(-0.0- +h[f+320>>3])*+_(+U(+h[f+120>>3]*.5+.7853981633974483));h[f+328>>3]=n+ +_(+U(+h[f+312>>3]*.5+.7853981633974483));k=g+g;g=1.0- +S(k);n=1.0/(+h[f+304>>3]*12.0*+h[f+304>>3]);h[f+344>>3]=n;h[f+336>>3]=g*n;n=+T(k);e=f+344|0;h[e>>3]=+h[e>>3]*n;h[f+352>>3]=(+h[f+336>>3]*+h[f+336>>3]- +h[f+344>>3]*+h[f+344>>3])*3.0;h[f+360>>3]=+h[f+336>>3]*6.0*+h[f+344>>3];c[f+8>>2]=368;c[f+4>>2]=50;o=f;p=o;i=b;return p|0}e=om(376)|0;f=e;if((e|0)!=0){ln(f|0,0,376)|0;c[f+16>>2]=64;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=10512}o=f;p=o;i=b;return p|0}function pg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function qg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3]*+h[b>>3];k=+h[b+8>>3]*+h[b+8>>3];l=+h[b>>3]*3.0*k- +h[b>>3]*j;m=+h[b+8>>3]*k-3.0*j*+h[b+8>>3];n=+h[b>>3]*(5.0*k*k+j*(-10.0*k+j));o=+h[b+8>>3]*(5.0*j*j+k*(-10.0*j+k));d=b|0;h[d>>3]=+h[d>>3]+((-0.0- +h[g+336>>3])*l- +h[g+344>>3]*m+ +h[g+352>>3]*n+ +h[g+360>>3]*o);d=b+8|0;h[d>>3]=+h[d>>3]+(+h[g+344>>3]*l- +h[g+336>>3]*m- +h[g+360>>3]*n+ +h[g+352>>3]*o);o=+h[g+312>>3]+ +h[b+8>>3]/+h[g+304>>3];n=o+ +h[g+120>>3]- +h[g+312>>3];d=20;while(1){if((d|0)==0){break}l=+h[g+320>>3]*+_(+U(.5*n+.7853981633974483));k=+h[g+80>>3]*+T(n);m=+h[g+80>>3]*.5*+h[g+320>>3]*+_((1.0+k)/(1.0-k));p=o-(+X(+Z(l-m+ +h[g+328>>3]))-.7853981633974483)*2.0;n=n+p;if(+P(+p)<1.0e-10){q=4;break}d=d-1|0}p=+h[g+80>>3]*+T(n);p=1.0-p*p;m=+h[g+96>>3]/(p*+Q(p));p=+U(o);l=p*p;k=+h[g+304>>3]*+h[g+304>>3];r=m*+h[g+144>>3]*+h[g+304>>3];m=p/(2.0*r);s=p*(3.0*l+5.0)/(24.0*r*k);p=+S(o);r=p*+h[g+304>>3]*+h[g+320>>3];p=1.0/r;r=r*k;j=+h[b>>3]*+h[b>>3];h[f+8>>3]=n+j*(-0.0-m+s*j);h[f>>3]=+h[b>>3]*(p+j*(-0.0-(2.0*l+1.0)/(6.0*r)+j*((l*(24.0*l+28.0)+5.0)/(120.0*r*k))));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function rg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+320>>3]*+_(+U(+h[b+8>>3]*.5+.7853981633974483));k=+h[g+80>>3]*+T(+h[b+8>>3]);l=+h[g+80>>3]*.5*+h[g+320>>3]*+_((1.0+k)/(1.0-k));m=(+X(+Z(j-l+ +h[g+328>>3]))-.7853981633974483)*2.0;n=m- +h[g+312>>3];o=+S(m);p=o*o;q=+T(m);m=q*q;r=+h[g+320>>3]*o;o=+h[g+320>>3]*.5*r*q;q=o*+h[g+320>>3]*+h[g+320>>3]*(5.0*p-m)/12.0;s=r*+h[g+320>>3]*+h[g+320>>3];t=s*(p-m)/6.0;s=s*(+h[g+320>>3]*+h[g+320>>3]*(5.0*p*p+m*(m-18.0*p))/120.0);k=+h[b>>3]*+h[b>>3];h[f>>3]=+h[g+304>>3]*+h[b>>3]*(r+k*(t+k*s));h[f+8>>3]=+h[g+304>>3]*(n+k*(o+k*q));q=+h[f>>3]*+h[f>>3];k=+h[f+8>>3]*+h[f+8>>3];j=+h[f>>3]*3.0*k- +h[f>>3]*q;l=+h[f+8>>3]*k-3.0*q*+h[f+8>>3];b=f|0;h[b>>3]=+h[b>>3]+(+h[g+336>>3]*j+ +h[g+344>>3]*l);b=f+8|0;h[b>>3]=+h[b>>3]+(+h[g+336>>3]*l- +h[g+344>>3]*j);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function sg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0,k=0.0;b=i;d=a;if((d|0)==0){a=om(368)|0;d=a;if((a|0)!=0){ln(d|0,0,368)|0;c[d+16>>2]=180;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10464;c[d+360>>2]=0}e=d;f=e;i=b;return f|0}g=+P(+(+h[d+120>>3]));if(+P(+(g-1.5707963267948966))<1.0e-10){c[d+364>>2]=+h[d+120>>3]<0.0?1:0}else{if(+P(+g)<1.0e-10){c[d+364>>2]=2}else{c[d+364>>2]=3}}if(+h[d+64>>3]!=0.0){h[d+80>>3]=+Q(+h[d+64>>3]);h[d+336>>3]=+Am(1.0,+h[d+80>>3],+h[d+96>>3]);h[d+328>>3]=.5/(1.0- +h[d+64>>3]);c[d+360>>2]=xl(+h[d+64>>3])|0;a=c[d+364>>2]|0;if((a|0)==0|(a|0)==1){h[d+344>>3]=1.0}else if((a|0)==2){g=+Q(+h[d+336>>3]*.5);h[d+352>>3]=g;h[d+344>>3]=1.0/g;h[d+312>>3]=1.0;h[d+320>>3]=+h[d+336>>3]*.5}else if((a|0)==3){h[d+352>>3]=+Q(+h[d+336>>3]*.5);g=+T(+h[d+120>>3]);j=+Am(g,+h[d+80>>3],+h[d+96>>3]);h[d+296>>3]=j/+h[d+336>>3];h[d+304>>3]=+Q(1.0- +h[d+296>>3]*+h[d+296>>3]);j=+S(+h[d+120>>3]);k=+Q(1.0- +h[d+64>>3]*g*g);h[d+344>>3]=j/(k*+h[d+352>>3]*+h[d+304>>3]);k=+h[d+352>>3];h[d+312>>3]=k;h[d+320>>3]=k/+h[d+344>>3];a=d+312|0;h[a>>3]=+h[a>>3]*+h[d+344>>3]}c[d+8>>2]=366;c[d+4>>2]=48}else{if((c[d+364>>2]|0)==3){h[d+296>>3]=+T(+h[d+120>>3]);h[d+304>>3]=+S(+h[d+120>>3])}c[d+8>>2]=94;c[d+4>>2]=22}e=d;f=e;i=b;return f|0}function tg(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+360>>2]|0)!=0){pm(c[d+360>>2]|0)}pm(d);i=b;return}function ug(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=0.0;d=c[g+364>>2]|0;if((d|0)==2|(d|0)==3){k=b|0;l=+h[k>>3]/+h[g+344>>3];h[k>>3]=l;k=b+8|0;m=+h[k>>3]*+h[g+344>>3];h[k>>3]=m;n=+va(+l,+m);m=n;if(n<1.0e-10){h[f>>3]=0.0;h[f+8>>3]=+h[g+120>>3];k=a;o=f;c[k>>2]=c[o>>2];c[k+4>>2]=c[o+4>>2];c[k+8>>2]=c[o+8>>2];c[k+12>>2]=c[o+12>>2];i=e;return}n=+W(.5*m/+h[g+352>>3])*2.0;l=n;p=+S(n);n=+T(l);l=n;o=b|0;h[o>>3]=+h[o>>3]*n;if((c[g+364>>2]|0)==3){n=p*+h[g+296>>3]+ +h[b+8>>3]*l*+h[g+304>>3]/m;j=n;q=+h[g+336>>3]*n;h[b+8>>3]=m*+h[g+304>>3]*p- +h[b+8>>3]*+h[g+296>>3]*l}else{n=+h[b+8>>3]*l/m;j=n;q=+h[g+336>>3]*n;h[b+8>>3]=m*p}}else if((d|0)==0){h[b+8>>3]=-0.0- +h[b+8>>3];r=9}else if((d|0)==1){r=9}if((r|0)==9){p=+h[b>>3]*+h[b>>3]+ +h[b+8>>3]*+h[b+8>>3];q=p;if(p==0.0){h[f>>3]=0.0;h[f+8>>3]=+h[g+120>>3];r=a;d=f;c[r>>2]=c[d>>2];c[r+4>>2]=c[d+4>>2];c[r+8>>2]=c[d+8>>2];c[r+12>>2]=c[d+12>>2];i=e;return}j=1.0-q/+h[g+336>>3];if((c[g+364>>2]|0)==1){j=-0.0-j}}h[f>>3]=+Y(+(+h[b>>3]),+(+h[b+8>>3]));q=+W(j);h[f+8>>3]=+yl(q,c[g+360>>2]|0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function vg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=0.0;k=0.0;l=0.0;m=+S(+h[b>>3]);n=+T(+h[b>>3]);o=+T(+h[b+8>>3]);p=+Am(o,+h[g+80>>3],+h[g+96>>3]);if((c[g+364>>2]|0)==3){q=3}else{if((c[g+364>>2]|0)==2){q=3}}if((q|0)==3){j=p/+h[g+336>>3];k=+Q(1.0-j*j)}d=c[g+364>>2]|0;if((d|0)==2){l=k*m+1.0}else if((d|0)==0){l=1.5707963267948966+ +h[b+8>>3];p=+h[g+336>>3]-p}else if((d|0)==1){l=+h[b+8>>3]-1.5707963267948966;p=+h[g+336>>3]+p}else if((d|0)==3){l=+h[g+296>>3]*j+1.0+ +h[g+304>>3]*k*m}if(+P(+l)<1.0e-10){Cl(c[g>>2]|0,-20);d=a;b=f;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];i=e;return}b=c[g+364>>2]|0;if((b|0)==0|(b|0)==1){if(p>=0.0){o=+Q(p);l=o;h[f>>3]=o*n;if((c[g+364>>2]|0)==1){r=l}else{r=-0.0-l}h[f+8>>3]=m*r}else{h[f+8>>3]=0.0;h[f>>3]=0.0}}else if((b|0)==3){r=+Q(2.0/l);l=r;h[f+8>>3]=+h[g+320>>3]*r*(+h[g+304>>3]*j- +h[g+296>>3]*k*m);q=14}else if((b|0)==2){r=+Q(2.0/(k*m+1.0));l=r;h[f+8>>3]=r*j*+h[g+320>>3];q=14}if((q|0)==14){h[f>>3]=+h[g+312>>3]*l*k*n}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function wg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=0.0;k=0.0;l=+va(+(+h[b>>3]),+(+h[b+8>>3]));m=l*.5;h[f+8>>3]=m;if(m>1.0){Cl(c[g>>2]|0,-20);d=a;n=f;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];c[d+8>>2]=c[n+8>>2];c[d+12>>2]=c[n+12>>2];i=e;return}h[f+8>>3]=+W(+h[f+8>>3])*2.0;if((c[g+364>>2]|0)==3){o=5}else{if((c[g+364>>2]|0)==2){o=5}}if((o|0)==5){k=+T(+h[f+8>>3]);j=+S(+h[f+8>>3])}n=c[g+364>>2]|0;if((n|0)==3){if(+P(+l)<=1.0e-10){p=+h[g+120>>3]}else{p=+W(j*+h[g+296>>3]+ +h[b+8>>3]*k*+h[g+304>>3]/l)}h[f+8>>3]=p;d=b|0;h[d>>3]=+h[d>>3]*k*+h[g+304>>3];p=+T(+h[f+8>>3]);h[b+8>>3]=(j-p*+h[g+296>>3])*l}else if((n|0)==0){h[b+8>>3]=-0.0- +h[b+8>>3];h[f+8>>3]=1.5707963267948966- +h[f+8>>3]}else if((n|0)==1){d=f+8|0;h[d>>3]=+h[d>>3]-1.5707963267948966}else if((n|0)==2){if(+P(+l)<=1.0e-10){q=0.0}else{q=+W(+h[b+8>>3]*k/l)}h[f+8>>3]=q;n=b|0;h[n>>3]=+h[n>>3]*k;h[b+8>>3]=j*l}do{if(+h[b+8>>3]==0.0){if((c[g+364>>2]|0)!=2){if((c[g+364>>2]|0)!=3){o=21;break}}r=0.0}else{o=21}}while(0);if((o|0)==21){r=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}h[f>>3]=r;b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function xg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+S(+h[b>>3]);d=c[g+364>>2]|0;if((d|0)==2){h[f+8>>3]=k*l+1.0;m=4}else if((d|0)==3){h[f+8>>3]=+h[g+296>>3]*j+1.0+ +h[g+304>>3]*k*l;m=4}else if((d|0)==0){l=-0.0-l;m=11}else if((d|0)==1){m=11}if((m|0)==4){if(+h[f+8>>3]<=1.0e-10){Cl(c[g>>2]|0,-20);d=a;n=f;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];c[d+8>>2]=c[n+8>>2];c[d+12>>2]=c[n+12>>2];i=e;return}o=+Q(2.0/+h[f+8>>3]);h[f+8>>3]=o;h[f>>3]=o*k*+T(+h[b>>3]);if((c[g+364>>2]|0)==2){p=j}else{p=+h[g+304>>3]*j- +h[g+296>>3]*k*l}n=f+8|0;h[n>>3]=+h[n>>3]*p}else if((m|0)==11){if(+P(+(+h[b+8>>3]+ +h[g+120>>3]))<1.0e-10){Cl(c[g>>2]|0,-20);m=a;n=f;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=e;return}h[f+8>>3]=.7853981633974483- +h[b+8>>3]*.5;if((c[g+364>>2]|0)==1){q=+S(+h[f+8>>3])}else{q=+T(+h[f+8>>3])}h[f+8>>3]=2.0*q;h[f>>3]=+h[f+8>>3]*+T(+h[b>>3]);b=f+8|0;h[b>>3]=+h[b>>3]*l}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function yg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(320)|0;f=a;if((a|0)!=0){ln(f|0,0,320)|0;c[f+16>>2]=156;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=10432}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,19768);k=+h[d>>3];h[f+304>>3]=k;if(k<=0.0){Cl(c[f>>2]|0,-27);zg(f);g=0;j=g;i=b;return j|0}k=1.0/+h[f+304>>3];h[f+304>>3]=k;h[f+296>>3]=.5*k;ym(e,c[f>>2]|0,c[f+24>>2]|0,21568);k=+h[e>>3];l=+T(k);k=l;if(+P(+(+P(+l)-1.0))<1.0e-10){Cl(c[f>>2]|0,-22);zg(f);g=0;j=g;i=b;return j|0}h[f+312>>3]=+R(+((1.0-k)/(1.0+k)),+(+h[f+296>>3]));h[f+64>>3]=0.0;c[f+4>>2]=24;g=f;j=g;i=b;return j|0}function zg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ag(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;do{if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<1.0e-10){h[f>>3]=0.0;h[f+8>>3]=+h[b+8>>3]<0.0?-2.0:2.0}else{h[b+8>>3]=+T(+h[b+8>>3]);j=+h[g+312>>3]*+R(+((+h[b+8>>3]+1.0)/(1.0- +h[b+8>>3])),+(+h[g+296>>3]));d=b|0;k=+h[d>>3]*+h[g+304>>3];h[d>>3]=k;l=(j+1.0/j)*.5+ +S(k);k=l;if(l>=1.0e-10){h[f>>3]=+T(+h[b>>3])*2.0/k;h[f+8>>3]=(j-1.0/j)/k;break}Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Bg(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+4>>2]=26;c[d+8>>2]=0;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=184;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10400}e=d;f=e;i=b;return f|0}function Cg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Dg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3]*.5*(+Q(+S(+h[b+8>>3]))+1.0);f=+S(+h[b+8>>3]*.5);h[e+8>>3]=+h[b+8>>3]/(f*+S(+h[b>>3]*.16666666666666666));b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Eg(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+4>>2]=28;c[d+8>>2]=0;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=176;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10368}e=d;f=e;i=b;return f|0}function Fg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Gg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+h[b>>3]*+h[b>>3];g=+h[b+8>>3]*+h[b+8>>3];h[e>>3]=+h[b>>3]*(g*(f*-.0143059+-.119161+g*-.0547009)+.975534);h[e+8>>3]=+h[b+8>>3]*(1.00384+f*(g*-.02855+.0802894+f*199025.0e-9)+g*(g*-.0491032+.0998909));b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Hg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=a;if((j|0)==0){a=om(344)|0;j=a;if((a|0)!=0){ln(j|0,0,344)|0;c[j+16>>2]=120;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+20>>2]=10232}k=j;l=k;i=b;return l|0}ym(d,c[j>>2]|0,c[j+24>>2]|0,19640);h[j+296>>3]=+h[d>>3];ym(e,c[j>>2]|0,c[j+24>>2]|0,21544);if((c[e>>2]|0)!=0){ym(f,c[j>>2]|0,c[j+24>>2]|0,19080);h[j+304>>3]=+h[f>>3]}else{h[j+304>>3]=+h[j+296>>3];ym(g,c[j>>2]|0,c[j+24>>2]|0,17448);if((c[g>>2]|0)==0){h[j+120>>3]=+h[j+296>>3]}}if(+P(+(+h[j+296>>3]+ +h[j+304>>3]))<1.0e-10){Cl(c[j>>2]|0,-21);Ig(j);k=0;l=k;i=b;return l|0}m=+T(+h[j+296>>3]);n=m;h[j+312>>3]=m;m=+S(+h[j+296>>3]);g=+P(+(+h[j+296>>3]- +h[j+304>>3]))>=1.0e-10|0;f=+h[j+64>>3]!=0.0;c[j+336>>2]=f&1;if(f){h[j+80>>3]=+Q(+h[j+64>>3]);o=+tm(n,m,+h[j+64>>3]);p=+Jm(+h[j+296>>3],n,+h[j+80>>3]);if((g|0)!=0){q=+T(+h[j+304>>3]);n=q;r=+S(+h[j+304>>3]);h[j+312>>3]=+_(o/+tm(q,r,+h[j+64>>3]));r=+_(p/+Jm(+h[j+304>>3],n,+h[j+80>>3]));f=j+312|0;h[f>>3]=+h[f>>3]/r}r=o*+R(+p,+(-0.0- +h[j+312>>3]));p=r/+h[j+312>>3];h[j+320>>3]=p;h[j+328>>3]=p;if(+P(+(+P(+(+h[j+120>>3]))-1.5707963267948966))<1.0e-10){s=0.0}else{p=+T(+h[j+120>>3]);r=+Jm(+h[j+120>>3],p,+h[j+80>>3]);s=+R(+r,+(+h[j+312>>3]))}f=j+320|0;h[f>>3]=+h[f>>3]*s}else{if((g|0)!=0){s=+_(m/+S(+h[j+304>>3]));r=+U(+h[j+304>>3]*.5+.7853981633974483);h[j+312>>3]=s/+_(r/+U(+h[j+296>>3]*.5+.7853981633974483))}r=+U(+h[j+296>>3]*.5+.7853981633974483);s=m*+R(+r,+(+h[j+312>>3]));h[j+328>>3]=s/+h[j+312>>3];if(+P(+(+P(+(+h[j+120>>3]))-1.5707963267948966))<1.0e-10){t=0.0}else{s=+U(+h[j+120>>3]*.5+.7853981633974483);t=+h[j+328>>3]*+R(+s,+(-0.0- +h[j+312>>3]))}h[j+320>>3]=t}c[j+8>>2]=350;c[j+4>>2]=280;c[j+12>>2]=376;k=j;l=k;i=b;return l|0}function Ig(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Jg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b|0;h[d>>3]=+h[d>>3]/+h[g+144>>3];d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+144>>3];j=+h[b>>3];k=+h[g+320>>3]- +h[b+8>>3];h[b+8>>3]=k;l=+va(+j,+k);k=l;if(l!=0.0){if(+h[g+312>>3]<0.0){k=-0.0-k;h[b>>3]=-0.0- +h[b>>3];h[b+8>>3]=-0.0- +h[b+8>>3]}do{if((c[g+336>>2]|0)!=0){l=+R(+(k/+h[g+328>>3]),+(1.0/+h[g+312>>3]));j=+zm(c[g>>2]|0,l,+h[g+80>>3]);h[f+8>>3]=j;if(j!=q){break}Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}else{h[f+8>>3]=+X(+R(+(+h[g+328>>3]/k),+(1.0/+h[g+312>>3])))*2.0-1.5707963267948966}}while(0);k=+Y(+(+h[b>>3]),+(+h[b+8>>3]));h[f>>3]=k/+h[g+312>>3]}else{h[f>>3]=0.0;h[f+8>>3]=+h[g+312>>3]>0.0?1.5707963267948966:-1.5707963267948966}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Kg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;do{if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<1.0e-10){if(+h[b+8>>3]*+h[g+312>>3]>0.0){j=0.0;break}Cl(c[g>>2]|0,-20);d=a;k=f;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return}else{l=+h[g+328>>3];if((c[g+336>>2]|0)!=0){m=+T(+h[b+8>>3]);n=+Jm(+h[b+8>>3],m,+h[g+80>>3]);o=+R(+n,+(+h[g+312>>3]))}else{n=+U(+h[b+8>>3]*.5+.7853981633974483);o=+R(+n,+(-0.0- +h[g+312>>3]))}j=l*o}}while(0);o=+h[g+144>>3];k=b|0;l=+h[k>>3]*+h[g+312>>3];h[k>>3]=l;h[f>>3]=o*j*+T(l);h[f+8>>3]=+h[g+144>>3]*(+h[g+320>>3]-j*+S(+h[b>>3]));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Lg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;f=a;a=i;i=i+16|0;c[a>>2]=c[f>>2];c[a+4>>2]=c[f+4>>2];c[a+8>>2]=c[f+8>>2];c[a+12>>2]=c[f+12>>2];f=b;b=d;do{if(+P(+(+P(+(+h[a+8>>3]))-1.5707963267948966))<1.0e-10){if(+h[a+8>>3]*+h[f+312>>3]>0.0){g=0.0;break}i=e;return}else{j=+h[f+328>>3];if((c[f+336>>2]|0)!=0){k=+T(+h[a+8>>3]);l=+Jm(+h[a+8>>3],k,+h[f+80>>3]);m=+R(+l,+(+h[f+312>>3]))}else{l=+U(+h[a+8>>3]*.5+.7853981633974483);m=+R(+l,+(-0.0- +h[f+312>>3]))}g=j*m}}while(0);d=b+96|0;c[d>>2]=c[d>>2]|12;m=+h[f+144>>3]*+h[f+312>>3]*g;g=+T(+h[a+8>>3]);j=+S(+h[a+8>>3]);l=m/+tm(g,j,+h[f+64>>3]);h[b+32>>3]=l;h[b+40>>3]=l;h[b+64>>3]=(-0.0- +h[f+312>>3])*+h[a>>3];i=e;return}function Mg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(336)|0;e=a;if((a|0)!=0){ln(e|0,0,336)|0;c[e+16>>2]=118;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=10168}f=e;g=f;i=b;return g|0}a=qm(+h[e+64>>3])|0;c[e+296>>2]=a;if((a|0)==0){Ng(e);f=0;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,19400);if((c[d>>2]|0)==0){Cl(c[e>>2]|0,50);Ng(e);f=0;g=f;i=b;return g|0}if(+h[e+120>>3]==0.0){Cl(c[e>>2]|0,51);Ng(e);f=0;g=f;i=b;return g|0}h[e+312>>3]=+T(+h[e+120>>3]);j=+S(+h[e+120>>3]);h[e+320>>3]=+rm(+h[e+120>>3],+h[e+312>>3],j,c[e+296>>2]|0);j=1.0/(1.0- +h[e+64>>3]*+h[e+312>>3]*+h[e+312>>3]);k=+Q(j);j=j*+h[e+96>>3]*k;l=+U(+h[e+120>>3]);h[e+304>>3]=k/l;h[e+328>>3]=1.0/(6.0*j*k);c[e+8>>2]=354;c[e+4>>2]=44;f=e;g=f;i=b;return g|0}function Ng(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+296>>2]|0)!=0){pm(c[d+296>>2]|0)}pm(d);i=b;return}function Og(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b|0;h[d>>3]=+h[d>>3]/+h[g+144>>3];d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+144>>3];j=+Y(+(+h[b>>3]),+(+h[g+304>>3]- +h[b+8>>3]));k=+h[b+8>>3]- +h[b>>3]*+U(.5*j);h[f>>3]=j/+h[g+312>>3];j=k;b=10;while(1){if((b|0)==0){break}l=+Qg(j,+h[g+328>>3])-k;m=l/+Rg(j,+h[g+328>>3]);j=j-m;if(+P(+m)<1.0e-12){d=4;break}b=b-1|0}if((b|0)!=0){h[f+8>>3]=+sm(c[g>>2]|0,j+ +h[g+320>>3],+h[g+64>>3],c[g+296>>2]|0);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}else{Cl(c[g>>2]|0,-20);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}}function Pg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+rm(+h[b+8>>3],j,k,c[g+296>>2]|0);k=+Qg(l- +h[g+320>>3],+h[g+328>>3]);l=+h[g+304>>3]-k;k=+h[g+144>>3];d=b|0;j=+h[d>>3]*+h[g+312>>3];h[d>>3]=j;h[f>>3]=k*l*+T(j);h[f+8>>3]=+h[g+144>>3]*(+h[g+304>>3]-l*+S(+h[b>>3]));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Qg(a,b){a=+a;b=+b;var c=0.0;c=a;i=i;return+(c*(c*c*b+1.0))}function Rg(a,b){a=+a;b=+b;var c=0.0;c=a;i=i;return+(3.0*c*c*b+1.0)}function Sg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(320)|0;e=a;if((a|0)!=0){ln(e|0,0,320)|0;c[e+16>>2]=122;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=9992}f=e;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,19344);h[e+296>>3]=+h[d>>3];j=+S(+h[e+296>>3]);h[e+304>>3]=j;if(j<1.0e-8){Cl(c[e>>2]|0,-22);Tg(e);f=0;g=f;i=b;return g|0}h[e+312>>3]=+U(+h[e+296>>3]*.5+.7853981633974483);c[e+8>>2]=404;c[e+4>>2]=160;h[e+64>>3]=0.0;f=e;g=f;i=b;return g|0}function Tg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ug(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]+ +h[g+296>>3];if(+P(+(+h[b+8>>3]))<1.0e-8){h[f>>3]=+h[b>>3]/+h[g+304>>3];j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}l=+h[f+8>>3]*.5+.7853981633974483;h[f>>3]=l;do{if(+P(+l)<1.0e-8){m=5}else{if(+P(+(+P(+(+h[f>>3]))-1.5707963267948966))<1.0e-8){m=5;break}n=+U(+h[f>>3]);o=+h[b>>3]*+_(n/+h[g+312>>3]);h[f>>3]=o/+h[b+8>>3]}}while(0);if((m|0)==5){h[f>>3]=0.0}j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}function Vg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]- +h[g+296>>3];if(+P(+(+h[f+8>>3]))<1.0e-8){h[f>>3]=+h[b>>3]*+h[g+304>>3];j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}h[f>>3]=+h[b+8>>3]*.5+.7853981633974483;do{if(+P(+(+h[f>>3]))<1.0e-8){l=5}else{if(+P(+(+P(+(+h[f>>3]))-1.5707963267948966))<1.0e-8){l=5;break}m=+U(+h[f>>3]);h[f>>3]=+h[b>>3]*+h[f+8>>3]/+_(m/+h[g+312>>3])}}while(0);if((l|0)==5){h[f>>3]=0.0}j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}function Wg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0,m=0.0,n=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(416)|0;f=a;if((a|0)!=0){ln(f|0,0,416)|0;c[f+16>>2]=26;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=9936}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,19336);a=c[d>>2]|0;do{if((a|0)>0){if((a|0)>5){break}ym(e,c[f>>2]|0,c[f+24>>2]|0,21480);d=c[e>>2]|0;do{if((d|0)>0){if((d|0)>(((a|0)<=3?251:233)|0)){break}if((a|0)<=3){h[f+112>>3]=2.2492058070450924- +(d|0)*.025032610785576042;h[f+368>>3]=103.2669323;k=1.729481662386221}else{h[f+112>>3]=2.2567107228286685- +(d|0)*.026966460545835135;h[f+368>>3]=98.8841202;k=1.7139133254584316}l=f+368|0;h[l>>3]=+h[l>>3]/1440.0;h[f+376>>3]=+T(k);h[f+384>>3]=+S(k);if(+P(+(+h[f+384>>3]))<1.0e-9){h[f+384>>3]=1.0e-9}m=+h[f+64>>3]*+h[f+384>>3]*+h[f+384>>3];n=+h[f+64>>3]*+h[f+376>>3]*+h[f+376>>3];h[f+360>>3]=(1.0-m)*+h[f+104>>3];h[f+360>>3]=+h[f+360>>3]*+h[f+360>>3]-1.0;h[f+336>>3]=n*+h[f+104>>3];h[f+344>>3]=n*(2.0- +h[f+64>>3])*+h[f+104>>3]*+h[f+104>>3];h[f+352>>3]=m*+h[f+104>>3];h[f+392>>3]=+h[f+96>>3]*+h[f+96>>3]*+h[f+96>>3];h[f+400>>3]=1.6341348883592068;h[f+408>>3]=+h[f+400>>3]+6.283185307179586;h[f+328>>3]=0.0;h[f+320>>3]=0.0;h[f+312>>3]=0.0;h[f+304>>3]=0.0;h[f+296>>3]=0.0;Yg(0.0,1.0,f);m=9.0;while(1){if(m>81.0001){break}Yg(m,4.0,f);m=m+18.0}m=18.0;while(1){if(m>72.0001){break}Yg(m,2.0,f);m=m+18.0}Yg(90.0,1.0,f);l=f+296|0;h[l>>3]=+h[l>>3]/30.0;l=f+304|0;h[l>>3]=+h[l>>3]/60.0;l=f+312|0;h[l>>3]=+h[l>>3]/30.0;l=f+320|0;h[l>>3]=+h[l>>3]/15.0;l=f+328|0;h[l>>3]=+h[l>>3]/45.0;c[f+8>>2]=226;c[f+4>>2]=198;g=f;j=g;i=b;return j|0}}while(0);Cl(c[f>>2]|0,-29);Xg(f);g=0;j=g;i=b;return j|0}}while(0);Cl(c[f>>2]|0,-28);Xg(f);g=0;j=g;i=b;return j|0}function Xg(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Yg(a,b,c){a=+a;b=+b;c=c|0;var d=0.0,e=0,f=0.0,g=0.0,j=0.0,k=0.0;d=a;a=b;e=c;d=d*.017453292519943295;b=+T(d);f=b*b;b=+h[e+368>>3]*+h[e+376>>3]*+S(d);g=b*+Q((+h[e+344>>3]*f+1.0)/((+h[e+360>>3]*f+1.0)*(+h[e+336>>3]*f+1.0)));b=+h[e+336>>3]*f+1.0;j=+Q((+h[e+336>>3]*f+1.0)/(+h[e+360>>3]*f+1.0));k=j*((+h[e+360>>3]*f+1.0)/(b*b)- +h[e+368>>3]*+h[e+384>>3]);b=+Q(+h[e+392>>3]*+h[e+392>>3]+g*g);f=a*(k*+h[e+392>>3]-g*g)/b;j=f;c=e+312|0;h[c>>3]=+h[c>>3]+f;f=j*+S(d+d);c=e+296|0;h[c>>3]=+h[c>>3]+f;f=j*+S(d*4.0);c=e+304|0;h[c>>3]=+h[c>>3]+f;j=a*g*(k+ +h[e+392>>3])/b;b=j*+S(d);c=e+320|0;h[c>>3]=+h[c>>3]+b;b=j*+S(d*3.0);c=e+328|0;h[c>>3]=+h[c>>3]+b;i=i;return}function Zg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0,s=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3]/+h[g+312>>3];d=50;do{k=j;l=+T(j);m=l*l;l=+h[g+368>>3]*+h[g+376>>3]*+S(j);n=l*+Q((+h[g+344>>3]*m+1.0)/((+h[g+360>>3]*m+1.0)*(+h[g+336>>3]*m+1.0)));m=+h[b>>3]+ +h[b+8>>3]*n/+h[g+392>>3]- +h[g+296>>3]*+T(2.0*j);l=m- +h[g+304>>3]*+T(j*4.0);m=+h[g+320>>3]*+T(j);j=l-n/+h[g+392>>3]*(m+ +h[g+328>>3]*+T(j*3.0));j=j/+h[g+312>>3];if(+P(+(j-k))>=1.0e-7){o=d-1|0;d=o;p=(o|0)!=0}else{p=0}}while(p);k=+T(j);m=+Q(n*n/+h[g+392>>3]/+h[g+392>>3]+1.0);n=(+X(+Z(m*(+h[b+8>>3]- +h[g+320>>3]*k- +h[g+328>>3]*+T(j*3.0))))-.7853981633974483)*2.0;if(+P(+(+S(j)))<1.0e-7){j=j-1.0e-7}m=+T(n);n=m*m;l=(1.0-n*+h[g+104>>3])*+U(j);q=l*+h[g+384>>3]-m*+h[g+376>>3]*+Q((+h[g+336>>3]*k*k+1.0)*(1.0-n)-n*+h[g+352>>3])/+S(j);l=+X(q/(1.0-n*(+h[g+352>>3]+1.0)));k=l>=0.0?1.0:-1.0;b=+S(j)>=0.0;l=l-1.5707963267948966*(1.0-(b?1.0:-1.0))*k;h[f>>3]=l- +h[g+368>>3]*j;if(+P(+(+h[g+376>>3]))<1.0e-7){h[f+8>>3]=+dl(c[g>>2]|0,m/+Q(+h[g+96>>3]*+h[g+96>>3]+ +h[g+64>>3]*n));r=a;s=f;c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];c[r+12>>2]=c[s+12>>2];i=e;return}else{n=+U(j)*+S(l);j=n- +h[g+384>>3]*+T(l);h[f+8>>3]=+X(j/(+h[g+96>>3]*+h[g+376>>3]));r=a;s=f;c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];c[r+12>>2]=c[s+12>>2];i=e;return}}function _g(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,r=0.0,s=0.0,t=0,u=0,v=0,w=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+h[b+8>>3]>1.5707963267948966){h[b+8>>3]=1.5707963267948966}else{if(+h[b+8>>3]<-1.5707963267948966){h[b+8>>3]=-1.5707963267948966}}j=+h[b+8>>3]>=0.0?1.5707963267948966:4.71238898038469;k=+U(+h[b+8>>3]);d=0;while(1){l=j;m=+h[b>>3]+ +h[g+368>>3]*j;n=+S(m);if(+P(+n)<1.0e-7){m=m-1.0e-7}m=+T(j);o=j-m*(n<0.0?-1.5707963267948966:1.5707963267948966);p=50;while(1){if((p|0)==0){break}r=+h[b>>3]+ +h[g+368>>3]*l;n=+S(r);if(+P(+n)<1.0e-7){r=r-1.0e-7}m=+T(r);s=+X((+h[g+96>>3]*k*+h[g+376>>3]+m*+h[g+384>>3])/n)+o;if(+P(+(+P(+l)- +P(+s)))<1.0e-7){t=14;break}l=s;p=p-1|0}if((t|0)==14){t=0}if((p|0)==0){break}u=d+1|0;d=u;if((u|0)>=3){break}if(s>+h[g+400>>3]){if(s<+h[g+408>>3]){break}}if(s<=+h[g+400>>3]){j=7.853981633974483}else{if(s>=+h[g+408>>3]){j=1.5707963267948966}}}if((p|0)!=0){j=+T(+h[b+8>>3]);k=+h[g+96>>3]*+h[g+384>>3]*j- +h[g+376>>3]*+S(+h[b+8>>3])*+T(r);r=+_(+U(+dl(c[g>>2]|0,k/+Q(1.0- +h[g+64>>3]*j*j))*.5+.7853981633974483));j=+T(s);k=j*j;l=+h[g+368>>3]*+h[g+376>>3]*+S(s);o=l*+Q((+h[g+344>>3]*k+1.0)/((+h[g+360>>3]*k+1.0)*(+h[g+336>>3]*k+1.0)));k=+Q(+h[g+392>>3]*+h[g+392>>3]+o*o);l=+h[g+312>>3]*s+ +h[g+296>>3]*+T(2.0*s);h[f>>3]=l+ +h[g+304>>3]*+T(s*4.0)-r*o/k;o=+h[g+320>>3]*j+ +h[g+328>>3]*+T(s*3.0);h[f+8>>3]=o+r*+h[g+392>>3]/k;v=a;w=f;c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];c[v+12>>2]=c[w+12>>2];i=e;return}else{h[f+8>>3]=q;h[f>>3]=q;v=a;w=f;c[v>>2]=c[w>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];c[v+12>>2]=c[w+12>>2];i=e;return}}function $g(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=100;c[d+4>>2]=328;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=188;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9880}e=d;f=e;i=b;return f|0}function ah(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function bh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+dl(c[g>>2]|0,+h[b+8>>3]/1.44492);k=j;h[f+8>>3]=1.36509*j;h[f>>3]=+h[b>>3]/((+S(+h[f+8>>3])*3.0/+S(k)+1.0)*.22248);j=+T(k)*.45503;h[f+8>>3]=+dl(c[g>>2]|0,(j+ +T(+h[f+8>>3]))/1.41546);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ch(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=1.41546*+T(+h[b+8>>3]);g=10;while(1){if((g|0)==0){break}j=+h[b+8>>3]/1.36509;k=+T(j)*.45503;l=k+ +T(+h[b+8>>3])-f;k=+S(j)*.3333333333333333;m=l/(k+ +S(+h[b+8>>3]));n=b+8|0;h[n>>3]=+h[n>>3]-m;if(+P(+m)<1.0e-7){n=4;break}g=g-1|0}j=+h[b+8>>3]/1.36509;h[e>>3]=+h[b>>3]*.22248*(+S(+h[b+8>>3])*3.0/+S(j)+1.0);h[e+8>>3]=1.44492*+T(j);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function dh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=90;c[d+4>>2]=324;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=190;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9776}e=d;f=e;i=b;return f|0}function eh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function fh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/3.401680257083045;do{if(+P(+(+h[f+8>>3]))>=1.0){if(+P(+(+h[f+8>>3]))>1.0000001){Cl(c[g>>2]|0,-20);d=a;j=f;c[d>>2]=c[j>>2];c[d+4>>2]=c[j+4>>2];c[d+8>>2]=c[j+8>>2];c[d+12>>2]=c[j+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;break}}else{h[f+8>>3]=+W(+h[f+8>>3])}}while(0);k=+h[b>>3];b=f+8|0;l=+h[b>>3]*3.0;h[b>>3]=l;h[f>>3]=k/((+S(.6666666666666666*l)*2.0-1.0)*.9258200997725514);l=+T(+h[f+8>>3])/.9525793444156804;h[f+8>>3]=l;do{if(+P(+l)>=1.0){if(+P(+(+h[f+8>>3]))>1.0000001){Cl(c[g>>2]|0,-20);b=a;j=f;c[b>>2]=c[j>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;break}}else{h[f+8>>3]=+W(+h[f+8>>3])}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function gh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[b+8>>3]=+W(+T(+h[b+8>>3])*.9525793444156804);h[e>>3]=+h[b>>3]*.9258200997725514*(+S(+h[b+8>>3]*.6666666666666666)*2.0-1.0);h[e+8>>3]=3.401680257083045*+T(+h[b+8>>3]*.3333333333333333);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function hh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=92;c[d+4>>2]=322;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=186;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9728}e=d;f=e;i=b;return f|0}function ih(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function jh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]*.533402096794177;if(+P(+(+h[f+8>>3]))>1.0){if(+P(+(+h[f+8>>3]))>1.000001){Cl(c[g>>2]|0,-20);d=a;j=f;c[d>>2]=c[j>>2];c[d+4>>2]=c[j+4>>2];c[d+8>>2]=c[j+8>>2];c[d+12>>2]=c[j+12>>2];i=e;return}if(+h[f+8>>3]<0.0){k=-1.0;h[f+8>>3]=-3.141592653589793}else{k=1.0;h[f+8>>3]=3.141592653589793}}else{l=+h[f+8>>3];k=l;h[f+8>>3]=+W(l)*2.0}l=+S(+h[f+8>>3])*2.0;h[f>>3]=3.2004125807650623*+h[b>>3]/(l/+S(+h[f+8>>3]*.5)+1.0);h[f+8>>3]=(k+ +T(+h[f+8>>3]))*.585786437626905;do{if(+P(+(+h[f+8>>3]))>1.0){if(+P(+(+h[f+8>>3]))>1.000001){Cl(c[g>>2]|0,-20);b=a;j=f;c[b>>2]=c[j>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];i=e;return}else{h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;break}}else{h[f+8>>3]=+W(+h[f+8>>3])}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function kh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0,j=0.0,k=0.0,l=0.0,m=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=1.7071067811865475*+T(+h[b+8>>3]);g=20;while(1){if((g|0)==0){break}j=+T(+h[b+8>>3]*.5);k=j+ +T(+h[b+8>>3])-f;j=+S(+h[b+8>>3]*.5)*.5;l=k/(j+ +S(+h[b+8>>3]));m=b+8|0;h[m>>3]=+h[m>>3]-l;if(+P(+l)<1.0e-7){m=4;break}g=g-1|0}f=+S(+h[b+8>>3])*2.0;h[e>>3]=+h[b>>3]*.3124597141037825*(f/+S(+h[b+8>>3]*.5)+1.0);h[e+8>>3]=1.874758284622695*+T(+h[b+8>>3]*.5);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function lh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(296)|0;f=a;if((a|0)!=0){ln(f|0,0,296)|0;c[f+16>>2]=102;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=9640}g=f;j=g;i=b;return j|0}k=0.0;ym(d,c[f>>2]|0,c[f+24>>2]|0,19088);a=c[d>>2]|0;d=a;do{if((a|0)!=0){ym(e,c[f>>2]|0,c[f+24>>2]|0,21416);k=+P(+(+h[e>>3]));if(k<1.5707963267948966){break}Cl(c[f>>2]|0,-24);mh(f);g=0;j=g;i=b;return j|0}}while(0);if(+h[f+64>>3]!=0.0){if((d|0)!=0){l=+T(k);m=+S(k);h[f+144>>3]=+tm(l,m,+h[f+64>>3])}c[f+8>>2]=16;c[f+4>>2]=36}else{if((d|0)!=0){h[f+144>>3]=+S(k)}c[f+8>>2]=132;c[f+4>>2]=364}g=f;j=g;i=b;return j|0}function mh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function nh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+Z((-0.0- +h[b+8>>3])/+h[g+144>>3]);k=+zm(c[g>>2]|0,j,+h[g+80>>3]);h[f+8>>3]=k;if(k==q){Cl(c[g>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}else{h[f>>3]=+h[b>>3]/+h[g+144>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}}function oh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<=1.0e-10){Cl(c[g>>2]|0,-20);d=a;j=f;c[d>>2]=c[j>>2];c[d+4>>2]=c[j+4>>2];c[d+8>>2]=c[j+8>>2];c[d+12>>2]=c[j+12>>2];i=e;return}else{h[f>>3]=+h[g+144>>3]*+h[b>>3];k=-0.0- +h[g+144>>3];l=+T(+h[b+8>>3]);h[f+8>>3]=k*+_(+Jm(+h[b+8>>3],l,+h[g+80>>3]));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}}function ph(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=1.5707963267948966- +X(+Z((-0.0- +h[b+8>>3])/+h[g+144>>3]))*2.0;h[f>>3]=+h[b>>3]/+h[g+144>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function qh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<=1.0e-10){Cl(c[g>>2]|0,-20);d=a;j=f;c[d>>2]=c[j>>2];c[d+4>>2]=c[j+4>>2];c[d+8>>2]=c[j+8>>2];c[d+12>>2]=c[j+12>>2];i=e;return}else{h[f>>3]=+h[g+144>>3]*+h[b>>3];h[f+8>>3]=+h[g+144>>3]*+_(+U(+h[b+8>>3]*.5+.7853981633974483));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}}function rh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=116;c[d+4>>2]=370;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=32;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9568}e=d;f=e;i=b;return f|0}function sh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function th(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3];h[e+8>>3]=2.5*(+X(+Z(+h[b+8>>3]*.8))-.7853981633974483);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function uh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3];h[e+8>>3]=+_(+U(+h[b+8>>3]*.4+.7853981633974483))*1.25;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function vh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+320>>2]=2;h[d+112>>3]=.3490658503988659;h[d+120>>3]=.3141592653589793;c[d+296>>2]=2368;h[d+64>>3]=0.0;e=xh(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=110;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9600}e=d;f=e;i=b;return f|0}function wh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function xh(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0;b=a;if(+h[b+64>>3]!=0.0){d=+h[b+80>>3]*+T(+h[b+120>>3]);e=+U((1.5707963267948966+ +h[b+120>>3])*.5);f=+X(e*+R(+((1.0-d)/(1.0+d)),+(+h[b+80>>3]*.5)))*2.0-1.5707963267948966}else{f=+h[b+120>>3]}h[b+312>>3]=+T(f);h[b+304>>3]=+S(f);c[b+8>>2]=306;c[b+4>>2]=144;i=i;return b|0}function yh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+320>>2]=2;h[d+112>>3]=-2.8797932657906435;h[d+120>>3]=-.17453292519943295;c[d+296>>2]=4048;h[d+64>>3]=0.0;e=xh(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=110;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10072}e=d;f=e;i=b;return f|0}function zh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+320>>2]=4;h[d+112>>3]=-1.6755160819145565;h[d+120>>3]=-.6806784082777885;c[d+296>>2]=4440;h[d+64>>3]=0.0;h[d+48>>3]=6370997.0;e=xh(d)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=110;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11112}e=d;f=e;i=b;return f|0}function Ah(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)==0){a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=110;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=12440}e=d;f=e;i=b;return f|0}c[d+320>>2]=5;h[d+112>>3]=-2.652900463031381;h[d+120>>3]=1.117010721276371;if(+h[d+64>>3]!=0.0){c[d+296>>2]=6200;h[d+48>>3]=6378206.4;h[d+64>>3]=.00676866;h[d+80>>3]=+Q(.00676866)}else{c[d+296>>2]=6104;h[d+48>>3]=6370997.0}e=xh(d)|0;f=e;i=b;return f|0}function Bh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)==0){a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=110;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11064}e=d;f=e;i=b;return f|0}c[d+320>>2]=9;h[d+112>>3]=-2.0943951023931953;h[d+120>>3]=.7853981633974483;if(+h[d+64>>3]!=0.0){c[d+296>>2]=4280;h[d+48>>3]=6378206.4;h[d+64>>3]=.00676866;h[d+80>>3]=+Q(.00676866)}else{c[d+296>>2]=4120;h[d+48>>3]=6370997.0}e=xh(d)|0;f=e;i=b;return f|0}function Ch(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;e=i;i=i+96|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=e+48|0;l=e+64|0;m=e+80|0;n=d;ln(f|0,0,16)|0;h[g>>3]=+h[b>>3];h[g+8>>3]=+h[b+8>>3];d=20;while(1){if((d|0)==0){break}Lm(m,g,c[n+296>>2]|0,c[n+320>>2]|0,k);o=j;p=m;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];p=j|0;h[p>>3]=+h[p>>3]- +h[b>>3];p=j+8|0;h[p>>3]=+h[p>>3]- +h[b+8>>3];r=+h[k>>3]*+h[k>>3]+ +h[k+8>>3]*+h[k+8>>3];h[l>>3]=(-0.0-(+h[j>>3]*+h[k>>3]+ +h[j+8>>3]*+h[k+8>>3]))/r;h[l+8>>3]=(-0.0-(+h[j+8>>3]*+h[k>>3]- +h[j>>3]*+h[k+8>>3]))/r;p=g|0;h[p>>3]=+h[p>>3]+ +h[l>>3];p=g+8|0;h[p>>3]=+h[p>>3]+ +h[l+8>>3];r=+P(+(+h[l>>3]));if(r+ +P(+(+h[l+8>>3]))<=1.0e-10){s=4;break}d=d-1|0}if((d|0)!=0){t=+va(+(+h[g>>3]),+(+h[g+8>>3]));r=+X(.5*t)*2.0;u=+T(r);v=+S(r);h[f>>3]=+h[n+112>>3];if(+P(+t)<=1.0e-10){h[f+8>>3]=+h[n+120>>3];l=a;k=f;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2];c[l+12>>2]=c[k+12>>2];i=e;return}r=+dl(c[n>>2]|0,v*+h[n+312>>3]+ +h[g+8>>3]*u*+h[n+304>>3]/t);w=r;d=20;while(1){if((d|0)==0){break}x=+h[n+80>>3]*+T(w);y=+U((1.5707963267948966+r)*.5);z=+X(y*+R(+((1.0+x)/(1.0-x)),+(+h[n+80>>3]*.5)))*2.0-1.5707963267948966-w;w=w+z;if(+P(+z)<=1.0e-10){s=13;break}d=d-1|0}}if((d|0)!=0){h[f+8>>3]=w;h[f>>3]=+Y(+(+h[g>>3]*u),+(t*+h[n+304>>3]*v- +h[g+8>>3]*+h[n+312>>3]*u))}else{h[f+8>>3]=q;h[f>>3]=q}n=a;a=f;c[n>>2]=c[a>>2];c[n+4>>2]=c[a+4>>2];c[n+8>>2]=c[a+8>>2];c[n+12>>2]=c[a+12>>2];i=e;return}function Dh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;e=i;i=i+48|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=d;ln(f|0,0,16)|0;l=+T(+h[b>>3]);m=+S(+h[b>>3]);n=+h[k+80>>3]*+T(+h[b+8>>3]);o=+U((1.5707963267948966+ +h[b+8>>3])*.5);p=+X(o*+R(+((1.0-n)/(1.0+n)),+(+h[k+80>>3]*.5)))*2.0-1.5707963267948966;n=+T(p);o=+S(p);p=2.0/(+h[k+312>>3]*n+1.0+ +h[k+304>>3]*o*m);h[g>>3]=p*o*l;h[g+8>>3]=p*(+h[k+304>>3]*n- +h[k+312>>3]*o*m);Km(j,g,c[k+296>>2]|0,c[k+320>>2]|0);k=g;b=j;c[k>>2]=c[b>>2];c[k+4>>2]=c[b+4>>2];c[k+8>>2]=c[b+8>>2];c[k+12>>2]=c[b+12>>2];h[f>>3]=+h[g>>3];h[f+8>>3]=+h[g+8>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Eh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=Gh(d,1.5707963267948966)|0;f=e;i=b;return f|0}a=om(320)|0;d=a;if((a|0)!=0){ln(d|0,0,320)|0;c[d+16>>2]=86;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9544}e=d;f=e;i=b;return f|0}function Fh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Gh(a,b){a=a|0;b=+b;var d=0,e=0.0,f=0.0;d=a;e=b;b=e+e;h[d+64>>3]=0.0;f=+T(e);e=+Q(6.283185307179586*f/(b+ +T(b)));h[d+296>>3]=2.0*e/3.141592653589793;h[d+304>>3]=e/f;h[d+312>>3]=b+ +T(b);c[d+8>>2]=318;c[d+4>>2]=64;i=i;return d|0}function Hh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=Gh(d,1.0471975511965976)|0;f=e;i=b;return f|0}a=om(320)|0;d=a;if((a|0)!=0){ln(d|0,0,320)|0;c[d+16>>2]=86;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7136}e=d;f=e;i=b;return f|0}function Ih(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;h[d+296>>3]=.90977;h[d+304>>3]=1.65014;h[d+312>>3]=3.00896;c[d+8>>2]=318;c[d+4>>2]=64;e=d;f=e;i=b;return f|0}a=om(320)|0;d=a;if((a|0)!=0){ln(d|0,0,320)|0;c[d+16>>2]=86;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7112}e=d;f=e;i=b;return f|0}function Jh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+dl(c[g>>2]|0,+h[b+8>>3]/+h[g+304>>3]);h[f>>3]=+h[b>>3]/(+h[g+296>>3]*+S(+h[f+8>>3]));b=f+8|0;h[b>>3]=+h[b>>3]+ +h[f+8>>3];j=+h[f+8>>3]+ +T(+h[f+8>>3]);h[f+8>>3]=+dl(c[g>>2]|0,j/+h[g+312>>3]);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Kh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+312>>3]*+T(+h[b+8>>3]);d=10;while(1){if((d|0)==0){break}k=+h[b+8>>3]+ +T(+h[b+8>>3])-j;l=k/(+S(+h[b+8>>3])+1.0);m=b+8|0;h[m>>3]=+h[m>>3]-l;if(+P(+l)<1.0e-7){m=4;break}d=d-1|0}if((d|0)!=0){d=b+8|0;h[d>>3]=+h[d>>3]*.5}else{h[b+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}h[f>>3]=+h[g+296>>3]*+h[b>>3]*+S(+h[b+8>>3]);h[f+8>>3]=+h[g+304>>3]*+T(+h[b+8>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Lh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=236;c[d+4>>2]=248;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=92;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9368}e=d;f=e;i=b;return f|0}function Mh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Nh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0.0,k=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;if(+h[b+8>>3]>1.4224000562099293){h[b+8>>3]=1.4224000562099293}else{if(+h[b+8>>3]<-1.4224000562099293){h[b+8>>3]=-1.4224000562099293}}f=+h[b+8>>3];do{g=f*f;j=g*g;k=(f*(1.007226+g*(j*(.028874*g+-.044475+-.005916*j)+.015085))- +h[b+8>>3])/(1.007226+g*(j*(.259866*g+-.311325+-.06507600000000001*j)+.045255));f=f-k;}while(+P(+k)>=1.0e-11);h[e+8>>3]=f;g=f*f;h[e>>3]=+h[b>>3]/(g*(g*(g*g*g*(g*-.001529+.003971)+-.013791)+-.131979)+.8707);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Oh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+h[b+8>>3]*+h[b+8>>3];g=f*f;h[e>>3]=+h[b>>3]*(f*(f*(g*f*(f*-.001529+.003971)+-.013791)+-.131979)+.8707);h[e+8>>3]=+h[b+8>>3]*(1.007226+f*(g*(.028874*f+-.044475+-.005916*g)+.015085));b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Ph(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=234;c[d+4>>2]=242;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=94;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9344}e=d;f=e;i=b;return f|0}function Qh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Rh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f>>3]=+h[b>>3]*2.0/(+S(+h[b+8>>3])+1.0);h[f+8>>3]=+dl(c[d>>2]|0,(+h[b+8>>3]+ +T(+h[b+8>>3]))*.5);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Sh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0,k=0.0,l=0.0,m=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+T(+h[b+8>>3])*2.0;g=+h[b+8>>3]*+h[b+8>>3];j=b+8|0;h[j>>3]=+h[j>>3]*(1.00371+g*(g*-.011412+-.0935382));j=10;while(1){if((j|0)==0){break}k=+h[b+8>>3]+ +T(+h[b+8>>3])-f;l=k/(+S(+h[b+8>>3])+1.0);g=l;m=b+8|0;h[m>>3]=+h[m>>3]-l;if(+P(+g)<1.0e-7){m=4;break}j=j-1|0}h[e>>3]=+h[b>>3]*.5*(+S(+h[b+8>>3])+1.0);h[e+8>>3]=+h[b+8>>3];b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Th(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=238;c[d+4>>2]=240;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=98;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9312}e=d;f=e;i=b;return f|0}function Uh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Vh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0,j=0.0,k=0.0,l=0,m=0,n=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+h[b+8>>3]*.5;g=9;while(1){if((g|0)==0){break}j=+S(+h[e+8>>3]*.5);k=(+h[e+8>>3]- +U(+h[e+8>>3]/2.0)-f)/(1.0-.5/(j*j));l=e+8|0;h[l>>3]=+h[l>>3]-k;if(+P(+k)<1.0e-7){l=4;break}g=g-1|0}if((g|0)!=0){h[e>>3]=+h[b>>3]*2.0/(+S(+h[e+8>>3])+1.0);m=a;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=d;return}else{h[e+8>>3]=f<0.0?-1.5707963267948966:1.5707963267948966;h[e>>3]=+h[b>>3]*2.0;m=a;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];c[m+12>>2]=c[n+12>>2];i=d;return}}function Wh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3]*.5*(+S(+h[b+8>>3])+1.0);h[e+8>>3]=(+h[b+8>>3]- +U(+h[b+8>>3]*.5))*2.0;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Xh(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+4>>2]=298;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=100;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9272}e=d;f=e;i=b;return f|0}function Yh(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Zh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;if(+P(+(+h[b>>3]))<1.0e-10){h[e>>3]=0.0;h[e+8>>3]=+h[b+8>>3];f=a;g=e;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];c[f+8>>2]=c[g+8>>2];c[f+12>>2]=c[g+12>>2];i=d;return}if(+P(+(+h[b+8>>3]))<1.0e-10){h[e>>3]=+h[b>>3];h[e+8>>3]=0.0}else{if(+P(+(+P(+(+h[b>>3]))-1.5707963267948966))<1.0e-10){h[e>>3]=+h[b>>3]*+S(+h[b+8>>3]);h[e+8>>3]=1.5707963267948966*+T(+h[b+8>>3])}else{if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<1.0e-10){h[e>>3]=0.0;h[e+8>>3]=+h[b+8>>3]}else{j=1.5707963267948966/+h[b>>3]- +h[b>>3]/1.5707963267948966;k=+h[b+8>>3]/1.5707963267948966;l=+T(+h[b+8>>3]);m=l;n=(1.0-k*k)/(l-k);k=j/n;k=k*k;l=(j*m/n-.5*j)/(1.0+k);j=(m/k+.5*n)/(1.0/k+1.0);h[e>>3]=+S(+h[b+8>>3]);h[e>>3]=+Q(l*l+ +h[e>>3]*+h[e>>3]/(1.0+k));if(+h[b>>3]<0.0){o=-0.0- +h[e>>3]}else{o=+h[e>>3]}h[e>>3]=1.5707963267948966*(l+o);h[e+8>>3]=+Q(j*j-(m*m/k+n*m-1.0)/(1.0/k+1.0));if(+h[b+8>>3]<0.0){p=+h[e+8>>3]}else{p=-0.0- +h[e+8>>3]}h[e+8>>3]=1.5707963267948966*(j+p)}}}f=a;g=e;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];c[f+8>>2]=c[g+8>>2];c[f+12>>2]=c[g+12>>2];i=d;return}function _h(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+396>>2]=0;e=ai(d)|0;f=e;i=b;return f|0}a=om(400)|0;d=a;if((a|0)!=0){ln(d|0,0,400)|0;c[d+16>>2]=166;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9232}e=d;f=e;i=b;return f|0}function $h(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function ai(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0,j=0;b=i;i=i+8|0;d=b|0;e=a;ym(d,c[e>>2]|0,c[e+24>>2]|0,19032);f=+h[d>>3];h[e+296>>3]=f;if(f<=0.0){Cl(c[e>>2]|0,-30);$h(e);g=0;j=g;i=b;return j|0}if(+P(+(+P(+(+h[e+120>>3]))-1.5707963267948966))<1.0e-10){c[e+392>>2]=+h[e+120>>3]<0.0?1:0}else{if(+P(+(+h[e+120>>3]))<1.0e-10){c[e+392>>2]=2}else{c[e+392>>2]=3;h[e+304>>3]=+T(+h[e+120>>3]);h[e+312>>3]=+S(+h[e+120>>3])}}h[e+336>>3]=+h[e+296>>3]/+h[e+48>>3];h[e+320>>3]=+h[e+336>>3]+1.0;h[e+328>>3]=1.0/+h[e+320>>3];h[e+352>>3]=1.0/+h[e+336>>3];h[e+344>>3]=(+h[e+320>>3]+1.0)*+h[e+352>>3];c[e+8>>2]=126;c[e+4>>2]=380;h[e+64>>3]=0.0;g=e;j=g;i=b;return j|0}function bi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0,k=0,l=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)!=0){ym(d,c[f>>2]|0,c[f+24>>2]|0,18312);g=+h[d>>3]*.017453292519943295;ym(e,c[f>>2]|0,c[f+24>>2]|0,21312);j=+h[e>>3]*.017453292519943295;c[f+396>>2]=1;h[f+360>>3]=+S(j);h[f+368>>3]=+T(j);h[f+384>>3]=+S(g);h[f+376>>3]=+T(g);k=ai(f)|0;l=k;i=b;return l|0}e=om(400)|0;f=e;if((e|0)!=0){ln(f|0,0,400)|0;c[f+16>>2]=166;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=7672}k=f;l=k;i=b;return l|0}function ci(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if((c[g+396>>2]|0)!=0){j=1.0/(+h[g+336>>3]- +h[b+8>>3]*+h[g+376>>3]);k=+h[g+336>>3]*+h[b>>3]*j;l=+h[g+336>>3]*+h[b+8>>3]*+h[g+384>>3]*j;h[b>>3]=k*+h[g+360>>3]+l*+h[g+368>>3];h[b+8>>3]=l*+h[g+360>>3]-k*+h[g+368>>3]}k=+va(+(+h[b>>3]),+(+h[b+8>>3]));l=1.0-k*k*+h[g+344>>3];j=l;if(l<0.0){Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}l=+h[g+320>>3]- +Q(j);j=l/(+h[g+336>>3]/k+k/+h[g+336>>3]);l=+Q(1.0-j*j);if(+P(+k)<=1.0e-10){h[f>>3]=0.0;h[f+8>>3]=+h[g+120>>3]}else{m=c[g+392>>2]|0;if((m|0)==2){h[f+8>>3]=+W(+h[b+8>>3]*j/k);h[b+8>>3]=l*k;d=b|0;h[d>>3]=+h[d>>3]*j}else if((m|0)==3){h[f+8>>3]=+W(l*+h[g+304>>3]+ +h[b+8>>3]*j*+h[g+312>>3]/k);h[b+8>>3]=(l- +h[g+304>>3]*+T(+h[f+8>>3]))*k;d=b|0;h[d>>3]=+h[d>>3]*j*+h[g+312>>3]}else if((m|0)==0){h[f+8>>3]=+W(l);h[b+8>>3]=-0.0- +h[b+8>>3]}else if((m|0)==1){h[f+8>>3]=-0.0- +W(l)}h[f>>3]=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function di(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+S(+h[b>>3]);d=c[g+392>>2]|0;if((d|0)==1){h[f+8>>3]=-0.0-j}else if((d|0)==3){h[f+8>>3]=+h[g+304>>3]*j+ +h[g+312>>3]*k*l}else if((d|0)==2){h[f+8>>3]=k*l}else if((d|0)==0){h[f+8>>3]=j}if(+h[f+8>>3]<+h[g+328>>3]){Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}h[f+8>>3]=+h[g+336>>3]/(+h[g+320>>3]- +h[f+8>>3]);h[f>>3]=+h[f+8>>3]*k*+T(+h[b>>3]);b=c[g+392>>2]|0;if((b|0)==3){m=f+8|0;h[m>>3]=+h[m>>3]*(+h[g+312>>3]*j- +h[g+304>>3]*k*l)}else if((b|0)==2){m=f+8|0;h[m>>3]=+h[m>>3]*j}else if((b|0)==0){l=-0.0-l;n=12}else if((b|0)==1){n=12}if((n|0)==12){n=f+8|0;h[n>>3]=+h[n>>3]*k*l}if((c[g+396>>2]|0)!=0){l=+h[f+8>>3]*+h[g+360>>3]+ +h[f>>3]*+h[g+368>>3];k=1.0/(l*+h[g+376>>3]*+h[g+352>>3]+ +h[g+384>>3]);h[f>>3]=(+h[f>>3]*+h[g+360>>3]- +h[f+8>>3]*+h[g+368>>3])*+h[g+384>>3]*k;h[f+8>>3]=l*k}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ei(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+48>>3]=6378388.0;h[d+88>>3]=1.5677942451917318e-7;h[d+112>>3]=3.01941960595019;h[d+120>>3]=-.7155849933176751;h[d+128>>3]=251.0e4;h[d+136>>3]=6023150.0;c[d+8>>2]=402;c[d+4>>2]=84;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=168;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9192}e=d;f=e;i=b;return f|0}function fi(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function gi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0.0,s=0.0,t=0,u=0;e=i;i=i+96|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;k=e+48|0;l=e+64|0;m=e+80|0;n=d;ln(f|0,0,16)|0;h[g>>3]=+h[b+8>>3];h[g+8>>3]=+h[b>>3];d=20;while(1){if((d|0)==0){break}Lm(m,g,13208,5,k);o=j;p=m;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];p=j|0;h[p>>3]=+h[p>>3]- +h[b+8>>3];p=j+8|0;h[p>>3]=+h[p>>3]- +h[b>>3];r=+h[k>>3]*+h[k>>3]+ +h[k+8>>3]*+h[k+8>>3];s=(-0.0-(+h[j>>3]*+h[k>>3]+ +h[j+8>>3]*+h[k+8>>3]))/r;h[l>>3]=s;p=g|0;h[p>>3]=+h[p>>3]+s;s=(-0.0-(+h[j+8>>3]*+h[k>>3]- +h[j>>3]*+h[k+8>>3]))/r;h[l+8>>3]=s;p=g+8|0;h[p>>3]=+h[p>>3]+s;s=+P(+(+h[l>>3]));if(s+ +P(+(+h[l+8>>3]))<=1.0e-10){p=4;break}d=d-1|0}if((d|0)==0){h[f+8>>3]=q;h[f>>3]=q;t=a;u=f;c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];c[t+12>>2]=c[u+12>>2];i=e;return}h[f>>3]=+h[g+8>>3];d=8;l=656;h[f+8>>3]=+h[82];while(1){if((d|0)==0){break}k=l-8|0;l=k;h[f+8>>3]=+h[k>>3]+ +h[g>>3]*+h[f+8>>3];d=d-1|0}h[f+8>>3]=+h[n+120>>3]+ +h[g>>3]*+h[f+8>>3]*.484813681109536;t=a;u=f;c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];c[t+12>>2]=c[u+12>>2];i=e;return}function hi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0;e=i;i=i+48|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=e+32|0;ln(f|0,0,16)|0;h[b+8>>3]=(+h[b+8>>3]- +h[d+120>>3])*2.0626480624709638;d=9;k=584;h[g>>3]=+h[73];while(1){if((d|0)==0){break}l=k-8|0;k=l;h[g>>3]=+h[l>>3]+ +h[b+8>>3]*+h[g>>3];d=d-1|0}d=g|0;h[d>>3]=+h[d>>3]*+h[b+8>>3];h[g+8>>3]=+h[b>>3];Km(j,g,13208,5);b=g;d=j;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];h[f>>3]=+h[g+8>>3];h[f+8>>3]=+h[g>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function ii(a){a=a|0;var b=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0;b=i;i=i+96|0;e=b|0;f=b+8|0;g=b+16|0;j=b+24|0;k=b+32|0;l=b+40|0;m=b+48|0;n=b+56|0;o=b+64|0;p=b+72|0;q=b+80|0;r=b+88|0;s=a;if((s|0)==0){a=om(328)|0;s=a;if((a|0)!=0){ln(s|0,0,328)|0;c[s+16>>2]=60;c[s+4>>2]=0;c[s+8>>2]=0;c[s+12>>2]=0;c[s+20>>2]=9008;c[s+296>>2]=0}t=s;u=t;i=b;return u|0}ym(e,c[s>>2]|0,c[s+24>>2]|0,18152);a=c[e>>2]|0;e=a;if((a|0)==0){Cl(c[s>>2]|0,-26);ji(s);t=0;u=t;i=b;return u|0}a=0;while(1){v=2416+(a*12|0)|0;w=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24|0;x=w;if((w|0)!=0){y=(Hb(e|0,x|0)|0)!=0}else{y=0}if(!y){break}a=a+1|0}do{if((x|0)!=0){y=2420+(a*12|0)|0;e=Kb[(d[y]|d[y+1|0]<<8|d[y+2|0]<<16|d[y+3|0]<<24)&511](0)|0;c[s+296>>2]=e;if((e|0)==0){break}h[s+64>>3]=0.0;c[(c[s+296>>2]|0)+24>>2]=c[s+24>>2];c[(c[s+296>>2]|0)+28>>2]=c[s+28>>2];c[(c[s+296>>2]|0)+32>>2]=c[s+32>>2];h[(c[s+296>>2]|0)+48>>3]=+h[s+48>>3];h[(c[s+296>>2]|0)+64>>3]=+h[s+64>>3];h[(c[s+296>>2]|0)+88>>3]=+h[s+88>>3];h[(c[s+296>>2]|0)+112>>3]=+h[s+112>>3];h[(c[s+296>>2]|0)+120>>3]=+h[s+120>>3];h[(c[s+296>>2]|0)+128>>3]=+h[s+128>>3];h[(c[s+296>>2]|0)+136>>3]=+h[s+136>>3];h[(c[s+296>>2]|0)+144>>3]=+h[s+144>>3];h[(c[s+296>>2]|0)+104>>3]=1.0;h[(c[s+296>>2]|0)+96>>3]=1.0;h[(c[s+296>>2]|0)+80>>3]=0.0;h[(c[s+296>>2]|0)+64>>3]=0.0;e=2420+(a*12|0)|0;y=Kb[(d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24)&511](c[s+296>>2]|0)|0;c[s+296>>2]=y;if((y|0)==0){ji(s);t=0;u=t;i=b;return u|0}ym(f,c[s>>2]|0,c[s+24>>2]|0,21240);do{if((c[f>>2]|0)!=0){ym(g,c[s>>2]|0,c[s+24>>2]|0,18936);z=+h[g>>3];ym(j,c[s>>2]|0,c[s+24>>2]|0,17400);A=+h[j>>3];ym(k,c[s>>2]|0,c[s+24>>2]|0,16464);B=+h[k>>3];if(+P(+(+P(+A)-1.5707963267948966))>1.0e-10){h[s+304>>3]=z+ +gl(-0.0- +S(B),(-0.0- +T(B))*+T(A));C=+dl(c[s>>2]|0,+S(A)*+T(B));break}Cl(c[s>>2]|0,-32);ji(s);t=0;u=t;i=b;return u|0}else{ym(l,c[s>>2]|0,c[s+24>>2]|0,15512);a:do{if((c[l>>2]|0)!=0){ym(m,c[s>>2]|0,c[s+24>>2]|0,14800);h[s+304>>3]=+h[m>>3];ym(n,c[s>>2]|0,c[s+24>>2]|0,14392);C=+h[n>>3]}else{ym(o,c[s>>2]|0,c[s+24>>2]|0,14024);B=+h[o>>3];ym(p,c[s>>2]|0,c[s+24>>2]|0,13560);A=+h[p>>3];ym(q,c[s>>2]|0,c[s+24>>2]|0,22280);z=+h[q>>3];ym(r,c[s>>2]|0,c[s+24>>2]|0,21856);D=+h[r>>3];do{if(+P(+(A-D))>1.0e-10){E=+P(+A);if(E<=1.0e-10){break}if(+P(+(E-1.5707963267948966))<=1.0e-10){break}if(+P(+(+P(+D)-1.5707963267948966))<=1.0e-10){break}h[s+304>>3]=+Y(+(+S(A)*+T(D)*+S(B)- +T(A)*+S(D)*+S(z)),+(+T(A)*+S(D)*+T(z)- +S(A)*+T(D)*+T(B)));C=+X((-0.0- +S(+h[s+304>>3]-B))/+U(A));break a}}while(0);Cl(c[s>>2]|0,-33);ji(s);t=0;u=t;i=b;return u|0}}while(0)}}while(0);if(+P(+C)>1.0e-10){h[s+312>>3]=+S(C);h[s+320>>3]=+T(C);c[s+4>>2]=278;c[s+8>>2]=(c[(c[s+296>>2]|0)+8>>2]|0)!=0?98:0}else{c[s+4>>2]=332;c[s+8>>2]=(c[(c[s+296>>2]|0)+8>>2]|0)!=0?398:0}t=s;u=t;i=b;return u|0}}while(0);Cl(c[s>>2]|0,-37);ji(s);t=0;u=t;i=b;return u|0}function ji(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+296>>2]|0)!=0){Lb[c[(c[d+296>>2]|0)+16>>2]&255](c[d+296>>2]|0)}pm(d);i=b;return}function ki(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=d;ln(e|0,0,16)|0;g=+S(+h[b>>3]);j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=k*+T(+h[b>>3]);m=+gl(l,+h[f+320>>3]*k*g+ +h[f+312>>3]*j);h[b>>3]=+hl(m+ +h[f+304>>3]);h[b+8>>3]=+dl(c[f>>2]|0,+h[f+320>>3]*j- +h[f+312>>3]*k*g);Nb[c[(c[f+296>>2]|0)+4>>2]&511](a,b,c[f+296>>2]|0);i=e;return}function li(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;Nb[c[(c[j+296>>2]|0)+8>>2]&511](g,b,c[j+296>>2]|0);b=f;d=g;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];if(+h[f>>3]==q){k=a;l=f;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];i=e;return}d=f|0;m=+h[d>>3]- +h[j+304>>3];h[d>>3]=m;n=+S(m);m=+T(+h[f+8>>3]);o=+S(+h[f+8>>3]);h[f+8>>3]=+dl(c[j>>2]|0,+h[j+320>>3]*m+ +h[j+312>>3]*o*n);p=o*+T(+h[f>>3]);h[f>>3]=+gl(p,+h[j+320>>3]*o*n- +h[j+312>>3]*m);k=a;l=f;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];i=e;return}function mi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=d;ln(e|0,0,16)|0;g=+S(+h[b+8>>3]);j=+S(+h[b>>3]);k=g*+T(+h[b>>3]);l=+gl(k,+T(+h[b+8>>3]));h[b>>3]=+hl(l+ +h[f+304>>3]);h[b+8>>3]=+dl(c[f>>2]|0,(-0.0-g)*j);Nb[c[(c[f+296>>2]|0)+4>>2]&511](a,b,c[f+296>>2]|0);i=e;return}function ni(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;Nb[c[(c[j+296>>2]|0)+8>>2]&511](g,b,c[j+296>>2]|0);b=f;d=g;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];if(+h[f>>3]==q){k=a;l=f;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];i=e;return}m=+S(+h[f+8>>3]);n=+h[f>>3]- +h[j+304>>3];o=m*+T(n);h[f>>3]=+gl(o,-0.0- +T(+h[f+8>>3]));h[f+8>>3]=+dl(c[j>>2]|0,m*+S(n));k=a;l=f;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];i=e;return}function oi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0;b=i;i=i+56|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=b+32|0;k=b+40|0;l=b+48|0;m=a;if((m|0)==0){a=om(344)|0;m=a;if((a|0)!=0){ln(m|0,0,344)|0;c[m+16>>2]=54;c[m+4>>2]=0;c[m+8>>2]=0;c[m+12>>2]=0;c[m+20>>2]=8920}n=m;o=n;i=b;return o|0}p=0.0;h[m+296>>3]=+h[m+48>>3]/+h[m+144>>3];h[m+304>>3]=+h[m+48>>3]*+h[m+144>>3];ym(d,c[m>>2]|0,c[m+24>>2]|0,17984);if((c[d>>2]|0)!=0){ym(e,c[m>>2]|0,c[m+24>>2]|0,21200);q=+h[e>>3];ym(f,c[m>>2]|0,c[m+24>>2]|0,18912);h[m+328>>3]=+X((-0.0- +S(q))/((-0.0- +T(p))*+T(q)))+ +h[f>>3];h[m+312>>3]=+W(+S(p)*+T(q))}else{ym(g,c[m>>2]|0,c[m+24>>2]|0,17376);q=+h[g>>3];ym(j,c[m>>2]|0,c[m+24>>2]|0,16448);p=+h[j>>3];ym(k,c[m>>2]|0,c[m+24>>2]|0,15488);r=+h[k>>3];ym(l,c[m>>2]|0,c[m+24>>2]|0,14784);s=+h[l>>3];h[m+328>>3]=+Y(+(+S(q)*+T(p)*+S(r)- +T(q)*+S(p)*+S(s)),+(+T(q)*+S(p)*+T(s)- +S(q)*+T(p)*+T(r)));h[m+312>>3]=+X((-0.0- +S(+h[m+328>>3]-r))/+U(q))}h[m+112>>3]=+h[m+328>>3]+1.5707963267948966;h[m+320>>3]=+S(+h[m+312>>3]);h[m+312>>3]=+T(+h[m+312>>3]);h[m+336>>3]=+S(+h[m+328>>3]);h[m+328>>3]=+T(+h[m+328>>3]);c[m+8>>2]=292;c[m+4>>2]=88;h[m+64>>3]=0.0;n=m;o=n;i=b;return o|0}function pi(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function qi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+296>>3];d=b|0;h[d>>3]=+h[d>>3]/+h[g+304>>3];j=+Q(1.0- +h[b+8>>3]*+h[b+8>>3]);k=+T(+h[b>>3]);h[f+8>>3]=+W(+h[b+8>>3]*+h[g+312>>3]+j*+h[g+320>>3]*k);h[f>>3]=+Y(+(j*+h[g+312>>3]*k- +h[b+8>>3]*+h[g+320>>3]),+(j*+S(+h[b>>3])));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function ri(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+T(+h[b>>3]);j=+S(+h[b>>3]);k=+U(+h[b+8>>3]);h[f>>3]=+X((k*+h[g+320>>3]+ +h[g+312>>3]*+h[f+8>>3])/j);if(j<0.0){d=f|0;h[d>>3]=+h[d>>3]+3.141592653589793}d=f|0;h[d>>3]=+h[d>>3]*+h[g+304>>3];j=+h[g+312>>3]*+T(+h[b+8>>3]);k=+h[g+320>>3]*+S(+h[b+8>>3]);h[f+8>>3]=+h[g+296>>3]*(j-k*+h[f+8>>3]);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function si(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0;b=i;i=i+24|0;d=b|0;e=b+8|0;f=b+16|0;g=a;if((g|0)==0){a=om(384)|0;g=a;if((a|0)!=0){ln(g|0,0,384)|0;c[g+16>>2]=56;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+20>>2]=8872}j=g;k=j;i=b;return k|0}ym(d,c[g>>2]|0,c[g+24>>2]|0,17896);l=+h[d>>3];h[g+312>>3]=l;do{if(l>0.0){ym(e,c[g>>2]|0,c[g+24>>2]|0,21160);m=+h[e>>3];h[g+304>>3]=m;if(m<=0.0){break}ym(f,c[g>>2]|0,c[g+24>>2]|0,18904);h[g+296>>3]=+h[f>>3];h[g+376>>3]=+T(+h[g+120>>3]);h[g+368>>3]=+S(+h[g+120>>3]);h[g+344>>3]=1.0/+h[g+312>>3];h[g+336>>3]=1.0/+h[g+304>>3];h[g+328>>3]=+h[g+344>>3]*2.0;h[g+320>>3]=+h[g+336>>3]*2.0;h[g+352>>3]=+h[g+304>>3]*.5;h[g+360>>3]=+h[g+312>>3]*.5;c[g+4>>2]=78;c[g+8>>2]=162;h[g+64>>3]=0.0;j=g;k=j;i=b;return k|0}}while(0);Cl(c[g>>2]|0,-39);ti(g);j=0;k=j;i=b;return k|0}function ti(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function ui(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+T(+h[b+8>>3]);l=+S(+h[b>>3]);m=j*+T(+h[b>>3]);n=+gl(m,+h[g+368>>3]*k- +h[g+376>>3]*j*l);m=n+ +h[g+296>>3];n=+T(+el(c[g>>2]|0,+h[g+376>>3]*k+ +h[g+368>>3]*j*l)*.5);l=+dl(c[g>>2]|0,n*+T(m));j=n*+S(m)*+S(l);m=+dl(c[g>>2]|0,j/+S(l*+h[g+320>>3]));h[f+8>>3]=+h[g+312>>3]*+T(m*+h[g+328>>3]);j=+h[g+304>>3]*+T(l*+h[g+320>>3])*+S(m);h[f>>3]=j/+S(m*+h[g+328>>3]);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function vi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+360>>3];k=j*+dl(c[g>>2]|0,+h[b+8>>3]*+h[g+344>>3]);j=+h[g+352>>3];l=j*+dl(c[g>>2]|0,+h[b>>3]*+h[g+336>>3]*+S(k*+h[g+328>>3])/+S(k));j=+T(l)*2.0;m=+T(k)*2.0;k=m*+S(l*+h[g+320>>3])/+S(l);l=+gl(j,k);m=l- +h[g+296>>3];l=+S(m);b=c[g>>2]|0;n=+dl(b,+va(+j,+k)*.5)*2.0;k=+T(n);j=+S(n);h[f+8>>3]=+dl(c[g>>2]|0,+h[g+376>>3]*j+ +h[g+368>>3]*k*l);n=k*+T(m);h[f>>3]=+gl(n,+h[g+368>>3]*j- +h[g+376>>3]*k*l);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function wi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;b=i;i=i+96|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=b+32|0;k=b+40|0;l=b+48|0;m=b+56|0;n=b+64|0;o=b+72|0;p=b+80|0;q=b+88|0;r=a;if((r|0)==0){a=om(416)|0;r=a;if((a|0)!=0){ln(r|0,0,416)|0;c[r+16>>2]=48;c[r+4>>2]=0;c[r+8>>2]=0;c[r+12>>2]=0;c[r+20>>2]=8768}s=r;t=s;i=b;return t|0}a=0;ym(d,c[r>>2]|0,c[r+24>>2]|0,17728);c[r+408>>2]=c[d>>2];ym(e,c[r>>2]|0,c[r+24>>2]|0,21128);d=c[e>>2]|0;e=d;if((d|0)!=0){ym(f,c[r>>2]|0,c[r+24>>2]|0,18896);u=+h[f>>3]}ym(g,c[r>>2]|0,c[r+24>>2]|0,17368);f=c[g>>2]|0;g=f;if((f|0)!=0){ym(j,c[r>>2]|0,c[r+24>>2]|0,16440);v=+h[j>>3]}a:do{if((e|0)!=0){w=11}else{if((g|0)!=0){w=11;break}ym(n,c[r>>2]|0,c[r+24>>2]|0,14008);x=+h[n>>3];ym(o,c[r>>2]|0,c[r+24>>2]|0,13536);y=+h[o>>3];ym(p,c[r>>2]|0,c[r+24>>2]|0,22240);z=+h[p>>3];ym(q,c[r>>2]|0,c[r+24>>2]|0,21824);A=+h[q>>3];do{if(+P(+(y-A))>1.0e-7){B=+P(+y);C=B;if(B<=1.0e-7){break}if(+P(+(C-1.5707963267948966))<=1.0e-7){break}if(+P(+(+P(+(+h[r+120>>3]))-1.5707963267948966))<=1.0e-7){break}if(+P(+(+P(+A)-1.5707963267948966))<=1.0e-7){break}break a}}while(0);Cl(c[r>>2]|0,-33);xi(r);s=0;t=s;i=b;return t|0}}while(0);if((w|0)==11){ym(k,c[r>>2]|0,c[r+24>>2]|0,15480);D=+h[k>>3];ym(l,c[r>>2]|0,c[r+24>>2]|0,14776);if((c[l>>2]|0)!=0){E=1}else{ym(m,c[r>>2]|0,c[r+24>>2]|0,14368);E=(c[m>>2]|0)!=0}a=E&1}B=+Q(+h[r+96>>3]);if(+P(+(+h[r+120>>3]))>1.0e-10){F=+T(+h[r+120>>3]);G=+S(+h[r+120>>3]);C=1.0- +h[r+64>>3]*F*F;h[r+304>>3]=G*G;h[r+304>>3]=+Q(+h[r+64>>3]*+h[r+304>>3]*+h[r+304>>3]/+h[r+96>>3]+1.0);h[r+296>>3]=+h[r+304>>3]*+h[r+144>>3]*B/C;H=+h[r+304>>3]*B/(G*+Q(C));G=H*H-1.0;I=G;if(G<=0.0){I=0.0}else{I=+Q(I);if(+h[r+120>>3]<0.0){I=-0.0-I}}G=I+H;I=G;h[r+312>>3]=G;G=+Jm(+h[r+120>>3],F,+h[r+80>>3]);F=+R(+G,+(+h[r+304>>3]));E=r+312|0;h[E>>3]=+h[E>>3]*F}else{h[r+304>>3]=1.0/B;h[r+296>>3]=+h[r+144>>3];I=1.0;H=1.0;h[r+312>>3]=1.0}do{if((e|0)!=0){w=31}else{if((g|0)!=0){w=31;break}B=+T(y);F=+Jm(y,B,+h[r+80>>3]);B=+R(+F,+(+h[r+304>>3]));F=+T(A);G=+Jm(A,F,+h[r+80>>3]);F=+R(+G,+(+h[r+304>>3]));I=+h[r+312>>3]/B;G=(F-B)/(F+B);J=+h[r+312>>3]*+h[r+312>>3];J=(J-F*B)/(J+F*B);B=x-z;C=B;if(B<-3.141592653589793){z=z-6.283185307179586}else{if(C>3.141592653589793){z=z+6.283185307179586}}B=+X(J*+U(+h[r+304>>3]*.5*(x-z))/G);h[r+112>>3]=+hl((x+z)*.5-B/+h[r+304>>3]);B=+h[r+304>>3];K=+X(+T(B*+hl(x- +h[r+112>>3]))*2.0/(I-1.0/I));B=+W(H*+T(K));u=B;v=B}}while(0);b:do{if((w|0)==31){if((e|0)!=0){K=+W(+T(u)/H);if((g|0)==0){v=u}}else{x=v;K=x;u=+W(H*+T(x))}x=+P(+u);C=x;do{if(x>1.0e-7){if(+P(+(C-3.141592653589793))<=1.0e-7){break}if(+P(+(+P(+(+h[r+120>>3]))-1.5707963267948966))<=1.0e-7){break}z=+W((I-1.0/I)*.5*+U(K));h[r+112>>3]=D-z/+h[r+304>>3];break b}}while(0);Cl(c[r>>2]|0,-32);xi(r);s=0;t=s;i=b;return t|0}}while(0);h[r+352>>3]=+T(K);h[r+360>>3]=+S(K);h[r+368>>3]=+T(v);h[r+376>>3]=+S(v);v=+h[r+296>>3];D=1.0/+h[r+304>>3];h[r+344>>3]=D;C=v*D;h[r+328>>3]=C;h[r+336>>3]=1.0/C;h[r+320>>3]=+h[r+296>>3]*+h[r+304>>3];if((a|0)!=0){h[r+400>>3]=0.0}else{h[r+400>>3]=+P(+(+h[r+328>>3]*+Y(+(+Q(H*H-1.0)),+(+S(u)))));if(+h[r+120>>3]<0.0){h[r+400>>3]=-0.0- +h[r+400>>3]}}I=.5*K;h[r+384>>3]=+h[r+328>>3]*+_(+U(.7853981633974483-I));h[r+392>>3]=+h[r+328>>3]*+_(+U(.7853981633974483+I));c[r+8>>2]=384;c[r+4>>2]=86;s=r;t=s;i=b;return t|0}function xi(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function yi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if((c[g+408>>2]|0)!=0){j=+h[b+8>>3];k=+h[b>>3]}else{j=+h[b>>3]*+h[g+376>>3]- +h[b+8>>3]*+h[g+368>>3];k=+h[b+8>>3]*+h[g+376>>3]+ +h[b>>3]*+h[g+368>>3]+ +h[g+400>>3]}l=+Z((-0.0- +h[g+336>>3])*j);j=(l-1.0/l)*.5;m=+T(+h[g+336>>3]*k);n=(m*+h[g+360>>3]+j*+h[g+352>>3])/((l+1.0/l)*.5);do{if(+P(+(+P(+n)-1.0))<1.0e-10){h[f>>3]=0.0;h[f+8>>3]=n<0.0?-1.5707963267948966:1.5707963267948966}else{h[f+8>>3]=+h[g+312>>3]/+Q((1.0+n)/(1.0-n));l=+R(+(+h[f+8>>3]),+(1.0/+h[g+304>>3]));o=+zm(c[g>>2]|0,l,+h[g+80>>3]);h[f+8>>3]=o;if(o!=q){h[f>>3]=(-0.0- +h[g+344>>3])*+Y(+(j*+h[g+360>>3]-m*+h[g+352>>3]),+(+S(+h[g+336>>3]*k)));break}Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function zi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))>1.0e-10){j=+h[g+312>>3];k=+T(+h[b+8>>3]);l=+Jm(+h[b+8>>3],k,+h[g+80>>3]);k=j/+R(+l,+(+h[g+304>>3]));l=1.0/k;j=(k-l)*.5;m=+T(+h[g+304>>3]*+h[b>>3]);n=(j*+h[g+352>>3]-m*+h[g+360>>3])/((k+l)*.5);if(+P(+(+P(+n)-1.0))<1.0e-10){Cl(c[g>>2]|0,-20);d=a;o=f;c[d>>2]=c[o>>2];c[d+4>>2]=c[o+4>>2];c[d+8>>2]=c[o+8>>2];c[d+12>>2]=c[o+12>>2];i=e;return}p=+h[g+328>>3]*.5*+_((1.0-n)/(1.0+n));l=+S(+h[g+304>>3]*+h[b>>3]);if(+P(+l)<1.0e-7){q=+h[g+320>>3]*+h[b>>3]}else{q=+h[g+328>>3]*+Y(+(j*+h[g+360>>3]+m*+h[g+352>>3]),+l)}r=q}else{if(+h[b+8>>3]>0.0){s=+h[g+384>>3]}else{s=+h[g+392>>3]}p=s;r=+h[g+328>>3]*+h[b+8>>3]}if((c[g+408>>2]|0)!=0){h[f>>3]=r;h[f+8>>3]=p}else{r=r- +h[g+400>>3];h[f>>3]=p*+h[g+376>>3]+r*+h[g+368>>3];h[f+8>>3]=r*+h[g+376>>3]-p*+h[g+368>>3]}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Ai(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)==0){a=om(320)|0;d=a;if((a|0)!=0){ln(d|0,0,320)|0;c[d+16>>2]=52;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8704}e=d;f=e;i=b;return f|0}if(+P(+(+P(+(+h[d+120>>3]))-1.5707963267948966))<=1.0e-10){c[d+312>>2]=+h[d+120>>3]<0.0?1:0}else{if(+P(+(+h[d+120>>3]))>1.0e-10){c[d+312>>2]=3;h[d+296>>3]=+T(+h[d+120>>3]);h[d+304>>3]=+S(+h[d+120>>3])}else{c[d+312>>2]=2}}c[d+8>>2]=254;c[d+4>>2]=70;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}function Bi(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ci(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+va(+(+h[b>>3]),+(+h[b+8>>3]));k=j;l=j;do{if(j>1.0){if(l-1.0<=1.0e-10){l=1.0;break}Cl(c[g>>2]|0,-20);d=a;m=f;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];i=e;return}}while(0);j=+Q(1.0-l*l);if(+P(+k)<=1.0e-10){h[f+8>>3]=+h[g+120>>3];h[f>>3]=0.0}else{m=c[g+312>>2]|0;if((m|0)==0){h[b+8>>3]=-0.0- +h[b+8>>3];h[f+8>>3]=+V(l)}else if((m|0)==1){h[f+8>>3]=-0.0- +V(l)}else if((m|0)==2){h[f+8>>3]=+h[b+8>>3]*l/k;d=b|0;h[d>>3]=+h[d>>3]*l;h[b+8>>3]=j*k;n=12}else if((m|0)==3){h[f+8>>3]=j*+h[g+296>>3]+ +h[b+8>>3]*l*+h[g+304>>3]/k;h[b+8>>3]=(j- +h[g+296>>3]*+h[f+8>>3])*k;m=b|0;h[m>>3]=+h[m>>3]*l*+h[g+304>>3];n=12}if((n|0)==12){if(+P(+(+h[f+8>>3]))>=1.0){h[f+8>>3]=+h[f+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}else{h[f+8>>3]=+W(+h[f+8>>3])}}do{if(+h[b+8>>3]==0.0){if((c[g+312>>2]|0)!=3){if((c[g+312>>2]|0)!=2){n=23;break}}if(+h[b>>3]==0.0){o=0.0}else{o=+h[b>>3]<0.0?-1.5707963267948966:1.5707963267948966}p=o}else{n=23}}while(0);if((n|0)==23){p=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}h[f>>3]=p}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Di(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+S(+h[b>>3]);d=c[g+312>>2]|0;do{if((d|0)==2){if(j*k>=-1.0e-10){h[f+8>>3]=+T(+h[b+8>>3]);break}Cl(c[g>>2]|0,-20);l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}else if((d|0)==3){n=+T(+h[b+8>>3]);if(+h[g+296>>3]*n+ +h[g+304>>3]*j*k>=-1.0e-10){h[f+8>>3]=+h[g+304>>3]*n- +h[g+296>>3]*j*k;break}Cl(c[g>>2]|0,-20);m=a;l=f;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];c[m+12>>2]=c[l+12>>2];i=e;return}else if((d|0)==0){k=-0.0-k;o=9}else if((d|0)==1){o=9}}while(0);do{if((o|0)==9){if(+P(+(+h[b+8>>3]- +h[g+120>>3]))-1.0e-10<=1.5707963267948966){h[f+8>>3]=j*k;break}Cl(c[g>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}}while(0);h[f>>3]=j*+T(+h[b>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Ei(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0;b=i;d=a;if((d|0)==0){a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=50;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8608;c[d+304>>2]=0}e=d;f=e;i=b;return f|0}do{if(+h[d+64>>3]!=0.0){a=qm(+h[d+64>>3])|0;c[d+304>>2]=a;if((a|0)!=0){g=+T(+h[d+120>>3]);j=+S(+h[d+120>>3]);h[d+296>>3]=+rm(+h[d+120>>3],g,j,c[d+304>>2]|0);c[d+8>>2]=74;c[d+4>>2]=394;break}Fi(d);e=0;f=e;i=b;return f|0}else{h[d+296>>3]=-0.0- +h[d+120>>3];c[d+8>>2]=190;c[d+4>>2]=150}}while(0);e=d;f=e;i=b;return f|0}function Fi(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+304>>2]|0)!=0){pm(c[d+304>>2]|0)}pm(d);i=b;return}function Gi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0,s=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b+8|0;h[d>>3]=+h[d>>3]+ +h[g+296>>3];do{if(+P(+(+h[b+8>>3]))<=1.0e-10){h[f>>3]=+h[b>>3];h[f+8>>3]=0.0}else{j=+h[b+8>>3]*+h[b+8>>3]+ +h[b>>3]*+h[b>>3];h[f+8>>3]=+h[b+8>>3];d=20;while(1){if((d|0)==0){break}k=+T(+h[f+8>>3]);l=+S(+h[f+8>>3]);m=l;n=k*l;if(+P(+m)<1.0e-12){o=6;break}l=+Q(1.0- +h[g+64>>3]*k*k);p=l;q=k*l/m;l=+rm(+h[f+8>>3],k,m,c[g+304>>2]|0);m=l*l+j;p=+h[g+96>>3]/(p*p*p);k=(l+l+q*m- +h[b+8>>3]*2.0*(q*l+1.0))/(+h[g+64>>3]*n*(m- +h[b+8>>3]*2.0*l)/q+(+h[b+8>>3]-l)*2.0*(q*p-1.0/n)-p-p);r=f+8|0;h[r>>3]=+h[r>>3]+k;if(+P(+k)<=1.0e-12){o=8;break}d=d-1|0}if((o|0)==6){Cl(c[g>>2]|0,-20);r=a;s=f;c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];c[r+12>>2]=c[s+12>>2];i=e;return}if((d|0)!=0){q=+T(+h[f+8>>3]);j=+h[b>>3]*+U(+h[f+8>>3]);k=+W(j*+Q(1.0- +h[g+64>>3]*q*q));h[f>>3]=k/+T(+h[f+8>>3]);break}Cl(c[g>>2]|0,-20);s=a;r=f;c[s>>2]=c[r>>2];c[s+4>>2]=c[r+4>>2];c[s+8>>2]=c[r+8>>2];c[s+12>>2]=c[r+12>>2];i=e;return}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Hi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+P(+(+h[b+8>>3]))<=1.0e-10){h[f>>3]=+h[b>>3];h[f+8>>3]=-0.0- +h[g+296>>3];j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}l=+T(+h[b+8>>3]);m=+S(+h[b+8>>3]);n=m;if(+P(+m)>1.0e-10){o=+tm(l,n,+h[g+64>>3])/l}else{o=0.0}m=o;d=b|0;o=+h[d>>3]*l;h[d>>3]=o;h[f>>3]=m*+T(o);o=+rm(+h[b+8>>3],l,n,c[g+304>>2]|0);h[f+8>>3]=o- +h[g+296>>3]+m*(1.0- +S(+h[b>>3]));j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}function Ii(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+120>>3]+ +h[b+8>>3];h[b+8>>3]=j;do{if(+P(+j)<=1.0e-10){h[f>>3]=+h[b>>3];h[f+8>>3]=0.0}else{h[f+8>>3]=+h[b+8>>3];k=+h[b>>3]*+h[b>>3]+ +h[b+8>>3]*+h[b+8>>3];d=10;do{l=+U(+h[f+8>>3]);m=(+h[b+8>>3]*(+h[f+8>>3]*l+1.0)- +h[f+8>>3]-(+h[f+8>>3]*+h[f+8>>3]+k)*.5*l)/((+h[f+8>>3]- +h[b+8>>3])/l-1.0);n=f+8|0;h[n>>3]=+h[n>>3]-m;if(+P(+m)>1.0e-10){n=d-1|0;d=n;o=(n|0)!=0}else{o=0}}while(o);if((d|0)!=0){k=+W(+h[b>>3]*+U(+h[f+8>>3]));h[f>>3]=k/+T(+h[f+8>>3]);break}Cl(c[g>>2]|0,-20);n=a;p=f;c[n>>2]=c[p>>2];c[n+4>>2]=c[p+4>>2];c[n+8>>2]=c[p+8>>2];c[n+12>>2]=c[p+12>>2];i=e;return}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Ji(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if(+P(+(+h[b+8>>3]))<=1.0e-10){h[f>>3]=+h[b>>3];h[f+8>>3]=+h[g+296>>3]}else{j=1.0/+U(+h[b+8>>3]);k=+h[b>>3]*+T(+h[b+8>>3]);h[f>>3]=+T(k)*j;h[f+8>>3]=+h[b+8>>3]- +h[g+120>>3]+j*(1.0- +S(k))}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Ki(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=388;c[d+4>>2]=382;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=12;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8560}e=d;f=e;i=b;return f|0}function Li(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Mi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+dl(c[g>>2]|0,+h[b+8>>3]/1.71848);j=+S(+h[f+8>>3]);h[f>>3]=+h[b>>3]/(1.8949*(j-.5));h[f+8>>3]=+dl(c[g>>2]|0,(+h[f+8>>3]+ +T(+h[f+8>>3])*(j-1.0))/.6141848493043784);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Ni(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0,k=0.0,l=0.0,m=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+T(+h[b+8>>3])*.6141848493043784;g=+h[b+8>>3]*+h[b+8>>3];j=b+8|0;h[j>>3]=+h[j>>3]*(g*(g*.0046292+.00909953)+.615709);j=10;while(1){if((j|0)==0){break}k=+S(+h[b+8>>3]);g=+T(+h[b+8>>3]);l=(+h[b+8>>3]+g*(k-1.0)-f)/(k*(k-1.0)+1.0-g*g);m=b+8|0;h[m>>3]=+h[m>>3]-l;if(+P(+l)<1.0e-10){m=4;break}j=j-1|0}if((j|0)==0){h[b+8>>3]=+h[b+8>>3]<0.0?-1.0471975511965976:1.0471975511965976}h[e>>3]=1.8949*+h[b>>3]*(+S(+h[b+8>>3])-.5);h[e+8>>3]=1.71848*+T(+h[b+8>>3]);b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Oi(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.4052847344;e=Qi(d)|0;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=14;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8536}e=d;f=e;i=b;return f|0}function Pi(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Qi(a){a=a|0;var b=0;b=a;h[b+64>>3]=0.0;c[b+8>>2]=392;c[b+4>>2]=406;i=i;return b|0}function Ri(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.2026423672;e=Qi(d)|0;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=14;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8496}e=d;f=e;i=b;return f|0}function Si(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/.79788456;h[f>>3]=+h[b>>3]/((1.0- +h[d+296>>3]*+h[f+8>>3]*+h[f+8>>3])*.79788456);d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=e;return}function Ti(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f>>3]=+h[b>>3]*.79788456*(1.0- +h[d+296>>3]*+h[b+8>>3]*+h[b+8>>3]);h[f+8>>3]=+h[b+8>>3]*.79788456;b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Ui(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.874038744;h[d+304>>3]=3.883251825;e=Wi(d)|0;f=e;i=b;return f|0}a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=162;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8464}e=d;f=e;i=b;return f|0}function Vi(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Wi(a){a=a|0;var b=0;b=a;h[b+64>>3]=0.0;c[b+8>>2]=32;c[b+4>>2]=174;i=i;return b|0}function Xi(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=1.0;h[d+304>>3]=4.442882938;e=Wi(d)|0;f=e;i=b;return f|0}a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=162;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7024}e=d;f=e;i=b;return f|0}function Yi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+dl(c[g>>2]|0,+h[b+8>>3]/+h[g+304>>3]);j=+h[b>>3]*+S(+h[f+8>>3]);h[f>>3]=j/+h[g+296>>3];b=f+8|0;h[b>>3]=+h[b>>3]*3.0;j=+S(+h[f+8>>3]);b=f|0;h[b>>3]=+h[b>>3]/j;h[f+8>>3]=+dl(c[g>>2]|0,1.13137085*+T(+h[f+8>>3]));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Zi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[b+8>>3]=+dl(c[g>>2]|0,+T(+h[b+8>>3])*.883883476);h[f>>3]=+h[g+296>>3]*+h[b>>3]*+S(+h[b+8>>3]);d=b+8|0;j=+h[d>>3]*.333333333333333;h[d>>3]=j;k=+S(j);d=f|0;h[d>>3]=+h[d>>3]/k;h[f+8>>3]=+h[g+304>>3]*+T(+h[b+8>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function _i(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=2.0;h[d+304>>3]=1.0;e=aj(d)|0;f=e;i=b;return f|0}a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=194;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8440}e=d;f=e;i=b;return f|0}function $i(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function aj(a){a=a|0;var b=0;b=a;h[b+64>>3]=0.0;c[b+8>>2]=34;c[b+4>>2]=300;i=i;return b|0}function bj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=1.5;h[d+304>>3]=.5;e=aj(d)|0;f=e;i=b;return f|0}a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=194;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8408}e=d;f=e;i=b;return f|0}function cj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/1.01346;h[f>>3]=+h[b>>3]/(1.01346*(+h[g+296>>3]- +h[g+304>>3]*+Q(1.2158542*+h[f+8>>3]*+h[f+8>>3]+1.0)));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function dj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=1.01346*+h[b>>3]*(+h[g+296>>3]- +h[g+304>>3]*+Q(1.2158542*+h[b+8>>3]*+h[b+8>>3]+1.0));h[f+8>>3]=1.01346*+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function ej(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=1.01346;h[d+304>>3]=.9191;h[d+312>>3]=4.0;h[d+320>>3]=2.147143718212938;h[d+328>>3]=2.0;e=gj(d)|0;f=e;i=b;return f|0}a=om(336)|0;d=a;if((a|0)!=0){ln(d|0,0,336)|0;c[d+16>>2]=158;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8384}e=d;f=e;i=b;return f|0}function fj(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function gj(a){a=a|0;var b=0;b=a;h[b+64>>3]=0.0;c[b+8>>2]=140;c[b+4>>2]=124;i=i;return b|0}function hj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.44329;h[d+304>>3]=.80404;h[d+312>>3]=6.0;h[d+320>>3]=5.61125;h[d+328>>3]=3.0;e=gj(d)|0;f=e;i=b;return f|0}a=om(336)|0;d=a;if((a|0)!=0){ln(d|0,0,336)|0;c[d+16>>2]=158;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8352}e=d;f=e;i=b;return f|0}function ij(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/+h[g+304>>3];j=+Q(+h[f+8>>3]*+h[f+8>>3]+1.0);h[f>>3]=+h[b>>3]/(+h[g+296>>3]*(+h[g+328>>3]-j));k=(+h[g+312>>3]-j)*+h[f+8>>3]- +_(+h[f+8>>3]+j);h[f+8>>3]=+dl(c[g>>2]|0,k/+h[g+320>>3]);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function jj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+320>>3]*+T(+h[b+8>>3]);d=b+8|0;h[d>>3]=+h[d>>3]*1.10265779;d=10;while(1){if((d|0)==0){break}k=+Q(+h[b+8>>3]*+h[b+8>>3]+1.0);l=(+h[g+312>>3]-k)*+h[b+8>>3]- +_(+h[b+8>>3]+k)-j;m=l/(+h[g+312>>3]-2.0*k);n=b+8|0;h[n>>3]=+h[n>>3]-m;if(+P(+m)<1.0e-10){n=4;break}d=d-1|0}if((d|0)==0){h[b+8>>3]=j<0.0?-1.732050807568877:1.732050807568877}h[f>>3]=+h[g+296>>3]*+h[b>>3]*(+h[g+328>>3]- +Q(+h[b+8>>3]*+h[b+8>>3]+1.0));h[f+8>>3]=+h[g+304>>3]*+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function kj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=166;c[d+4>>2]=170;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=90;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8256}e=d;f=e;i=b;return f|0}function lj(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function mj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;j=e+16|0;k=d;ln(f|0,0,16)|0;h[f>>3]=+h[b>>3]/.8487;h[f+8>>3]=+P(+(+h[b+8>>3]/1.3523));do{if(+h[f+8>>3]>=1.0){if(+h[f+8>>3]>1.000001){Cl(c[k>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}else{h[f+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;l=f|0;h[l>>3]=+h[l>>3]/+g[5760];break}}else{l=~~+O(+h[f+8>>3]*18.0);while(1){if(+g[22448+(l<<4)>>2]>+h[f+8>>3]){l=l-1|0}else{if(+g[22448+(l+1<<4)>>2]>+h[f+8>>3]){break}l=l+1|0}}d=j;m=22448+(l<<4)|0;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];n=(+h[f+8>>3]- +g[j>>2])*5.0/(+g[22448+(l+1<<4)>>2]- +g[j>>2]);m=j|0;g[m>>2]=+g[m>>2]- +h[f+8>>3];do{o=(+g[j>>2]+n*(+g[j+4>>2]+n*(+g[j+8>>2]+n*+g[j+12>>2])))/(+g[j+4>>2]+n*(+g[j+8>>2]+ +g[j+8>>2]+n*3.0*+g[j+12>>2]));n=n-o;}while(+P(+o)>=1.0e-8);h[f+8>>3]=(+(l*5|0|0)+n)*.017453292519943295;if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}m=f|0;h[m>>3]=+h[m>>3]/(+g[22752+(l<<4)>>2]+n*(+g[22756+(l<<4)>>2]+n*(+g[22760+(l<<4)>>2]+n*+g[22764+(l<<4)>>2])))}}while(0);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function nj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,j=0.0,k=0,l=0,m=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+P(+(+h[b+8>>3]));j=f;k=~~+O(f*11.459155902616464);if((k|0)>=18){k=17}j=57.29577951308232*(j- +(k|0)*.08726646259971647);h[e>>3]=(+g[22752+(k<<4)>>2]+j*(+g[22756+(k<<4)>>2]+j*(+g[22760+(k<<4)>>2]+j*+g[22764+(k<<4)>>2])))*.8487*+h[b>>3];h[e+8>>3]=(+g[22448+(k<<4)>>2]+j*(+g[22452+(k<<4)>>2]+j*(+g[22456+(k<<4)>>2]+j*+g[22460+(k<<4)>>2])))*1.3523;if(+h[b+8>>3]>=0.0){l=a;m=e;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=d;return}h[e+8>>3]=-0.0- +h[e+8>>3];l=a;m=e;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=d;return}function oj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(328)|0;e=a;if((a|0)!=0){ln(e|0,0,328)|0;c[e+16>>2]=88;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=8160}f=e;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,17248);j=+P(+(+h[d>>3]));h[e+296>>3]=j;d=j>1.0e-9;c[e+320>>2]=d&1;if(d){h[e+312>>3]=+T(+h[e+296>>3])*.5;h[e+304>>3]=.5/+h[e+312>>3]}h[e+64>>3]=0.0;c[e+4>>2]=180;f=e;g=f;i=b;return g|0}function pj(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function qj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;if((c[g+320>>2]|0)!=0){j=+U(+h[b>>3]*+h[g+312>>3]);k=j*+h[g+304>>3]}else{k=+h[b>>3]*.5}if(+P(+(+h[b+8>>3]))<1.0e-9){h[f>>3]=k+k;h[f+8>>3]=-0.0- +h[g+120>>3];l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}else{h[f+8>>3]=1.0/+U(+h[b+8>>3]);j=+X(k*+T(+h[b+8>>3]))*2.0;k=j;n=+T(j);h[f>>3]=n*+h[f+8>>3];n=1.0- +S(k);h[f+8>>3]=+h[b+8>>3]- +h[g+120>>3]+n*+h[f+8>>3];l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}}function rj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=0;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11496}e=d;f=e;i=b;return f|0}function sj(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function tj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0,k=0.0;b=i;i=i+8|0;d=b|0;e=a;a=Aj(e,d)|0;if((a|0)!=0){Cl(c[e>>2]|0,a);sj(e);f=0;g=f;i=b;return g|0}a:do{switch(c[e+344>>2]|0){case 0:{h[e+296>>3]=+T(+h[e+320>>3])*+T(+h[d>>3])/+h[d>>3];h[d>>3]=+h[d>>3]*.5;j=+U(+h[d>>3]);h[e+304>>3]=+h[d>>3]/(j*+U(+h[e+320>>3]))+ +h[e+320>>3];h[e+312>>3]=+h[e+304>>3]- +h[e+120>>3];break};case 1:{h[e+304>>3]=+T(+h[d>>3])/(+h[d>>3]*+U(+h[e+320>>3]))+ +h[e+320>>3];h[e+312>>3]=+h[e+304>>3]- +h[e+120>>3];h[e+296>>3]=+T(+h[e+320>>3]);break};case 5:{h[e+296>>3]=+T(+h[e+320>>3]);k=+S(+h[d>>3]);h[e+304>>3]=+h[e+296>>3]/k+k/+h[e+296>>3];h[e+312>>3]=+Q((+h[e+304>>3]- +T(+h[e+120>>3])*2.0)/+h[e+296>>3]);break};case 2:{j=+Q(+S(+h[d>>3]));k=j;h[e+304>>3]=j/+U(+h[e+320>>3]);h[e+312>>3]=+h[e+304>>3]+ +U(+h[e+320>>3]- +h[e+120>>3]);h[e+296>>3]=+T(+h[e+320>>3])*k;break};case 6:{j=+U(+h[d>>3]);k=j;h[e+296>>3]=j*+T(+h[e+320>>3])/+h[d>>3];h[e+304>>3]=+h[d>>3]/(k*+U(+h[e+320>>3]))+ +h[e+320>>3];h[e+312>>3]=+h[e+304>>3]- +h[e+120>>3];break};case 3:{j=+U(+h[e+320>>3]);h[e+304>>3]=+h[d>>3]/(j*+U(+h[d>>3]))+ +h[e+320>>3];h[e+312>>3]=+h[e+304>>3]- +h[e+120>>3];h[e+296>>3]=+T(+h[e+320>>3])*+T(+h[d>>3])*+U(+h[d>>3])/(+h[d>>3]*+h[d>>3]);break};case 4:{h[e+296>>3]=+T(+h[e+320>>3]);h[e+336>>3]=+S(+h[d>>3]);h[e+328>>3]=1.0/+U(+h[e+320>>3]);j=+h[e+120>>3]- +h[e+320>>3];h[d>>3]=j;if(+P(+j)-1.0e-10<1.5707963267948966){h[e+312>>3]=+h[e+336>>3]*(+h[e+328>>3]- +U(+h[d>>3]));break a}Cl(c[e>>2]|0,-43);sj(e);f=0;g=f;i=b;return g|0};default:{}}}while(0);c[e+8>>2]=196;c[e+4>>2]=2;h[e+64>>3]=0.0;f=e;g=f;i=b;return g|0}function uj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=5;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7824}e=d;f=e;i=b;return f|0}function vj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=1;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9496}e=d;f=e;i=b;return f|0}function wj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=2;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9448}e=d;f=e;i=b;return f|0}function xj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=3;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9400}e=d;f=e;i=b;return f|0}function yj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=4;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8648}e=d;f=e;i=b;return f|0}function zj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+344>>2]=6;e=tj(d)|0;f=e;i=b;return f|0}a=om(352)|0;d=a;if((a|0)!=0){ln(d|0,0,352)|0;c[d+16>>2]=34;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7264}e=d;f=e;i=b;return f|0}function Aj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0,o=0;d=i;i=i+32|0;e=d|0;f=d+8|0;g=d+16|0;j=d+24|0;k=a;a=b;b=0;ym(e,c[k>>2]|0,c[k+24>>2]|0,17216);do{if((c[e>>2]|0)!=0){ym(f,c[k>>2]|0,c[k+24>>2]|0,21016);if((c[f>>2]|0)==0){break}ym(g,c[k>>2]|0,c[k+24>>2]|0,18864);l=+h[g>>3];ym(j,c[k>>2]|0,c[k+24>>2]|0,17272);m=+h[j>>3];h[a>>3]=(m-l)*.5;h[k+320>>3]=(m+l)*.5;if(+P(+(+h[a>>3]))<1.0e-10){n=1}else{n=+P(+(+h[k+320>>3]))<1.0e-10}b=n?-42:0;h[a>>3]=+h[a>>3];o=b;i=d;return o|0}}while(0);b=-41;o=b;i=d;return o|0}function Bj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3];k=+h[g+312>>3]- +h[b+8>>3];h[b+8>>3]=k;l=+va(+j,+k);if(+h[g+296>>3]<0.0){l=-0.0-l;h[b>>3]=-0.0- +h[b>>3];h[b+8>>3]=-0.0- +h[b+8>>3]}k=+Y(+(+h[b>>3]),+(+h[b+8>>3]));h[f>>3]=k/+h[g+296>>3];b=c[g+344>>2]|0;if((b|0)==4){k=+X(+h[g+328>>3]-l/+h[g+336>>3]);h[f+8>>3]=k+ +h[g+320>>3]}else if((b|0)==2){h[f+8>>3]=+h[g+320>>3]- +X(l- +h[g+304>>3])}else{h[f+8>>3]=+h[g+304>>3]-l}g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Cj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=c[g+344>>2]|0;if((d|0)==2){j=+h[g+304>>3]+ +U(+h[g+320>>3]- +h[b+8>>3])}else if((d|0)==4){j=+h[g+336>>3]*(+h[g+328>>3]- +U(+h[b+8>>3]- +h[g+320>>3]))}else{j=+h[g+304>>3]- +h[b+8>>3]}d=b|0;k=+h[d>>3]*+h[g+296>>3];h[d>>3]=k;h[f>>3]=j*+T(k);h[f+8>>3]=+h[g+312>>3]-j*+S(+h[b>>3]);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Dj(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,g=0.0,j=0,k=0;b=i;d=a;if((d|0)!=0){h[d+312>>3]=+h[d+80>>3]*.5;e=+S(+h[d+120>>3]);e=e*e;h[d+304>>3]=+Q(+h[d+64>>3]*e*e*+h[d+104>>3]+1.0);e=+T(+h[d+120>>3]);a=c[d>>2]|0;f=e/+h[d+304>>3];h[d+336>>3]=f;g=+dl(a,f);h[d+328>>3]=+S(g);e=e*+h[d+80>>3];f=+_(+U(.5*g+.7853981633974483));g=+_(+U(+h[d+120>>3]*.5+.7853981633974483));h[d+296>>3]=f- +h[d+304>>3]*(g- +h[d+312>>3]*+_((1.0+e)/(1.0-e)));h[d+320>>3]=+h[d+144>>3]*+Q(+h[d+96>>3])/(1.0-e*e);c[d+8>>2]=14;c[d+4>>2]=102;j=d;k=j;i=b;return k|0}a=om(344)|0;d=a;if((a|0)!=0){ln(d|0,0,344)|0;c[d+16>>2]=30;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8064}j=d;k=j;i=b;return k|0}function Ej(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Fj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=(+X(+Z(+h[b+8>>3]/+h[g+320>>3]))-.7853981633974483)*2.0;k=+h[b>>3]/+h[g+320>>3];l=+S(j);m=+h[g+328>>3]*+T(j);j=+dl(c[g>>2]|0,m+ +h[g+336>>3]*l*+S(k));m=+dl(c[g>>2]|0,l*+T(k)/+S(j));k=+h[g+296>>3]- +_(+U(.5*j+.7853981633974483));l=k/+h[g+304>>3];b=6;while(1){if((b|0)==0){break}k=+h[g+80>>3]*+T(j);n=l+ +_(+U(.5*j+.7853981633974483));o=(n- +h[g+312>>3]*+_((1.0+k)/(1.0-k)))*(1.0-k*k)*+S(j);k=o*+h[g+104>>3];j=j-k;if(+P(+k)<1.0e-10){d=4;break}b=b-1|0}if((b|0)==0){Cl(c[g>>2]|0,-20);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}h[f+8>>3]=j;h[f>>3]=m/+h[g+304>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Gj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+80>>3]*+T(+h[b+8>>3]);k=+_(+U(+h[b+8>>3]*.5+.7853981633974483));l=+h[g+304>>3]*(k- +h[g+312>>3]*+_((1.0+j)/(1.0-j)));j=+X(+Z(l+ +h[g+296>>3]))*2.0-1.5707963267948966;l=+h[g+304>>3]*+h[b>>3];k=+S(j);m=+h[g+328>>3]*+T(j);j=+dl(c[g>>2]|0,m- +h[g+336>>3]*k*+S(l));m=+dl(c[g>>2]|0,k*+T(l)/+S(j));h[f>>3]=+h[g+320>>3]*m;h[f+8>>3]=+h[g+320>>3]*+_(+U(.5*j+.7853981633974483));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Hj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0.0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(336)|0;f=a;if((a|0)!=0){ln(f|0,0,336)|0;c[f+16>>2]=192;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=8024}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,17040);if((c[d>>2]|0)!=0){ym(e,c[f>>2]|0,c[f+24>>2]|0,20968);k=+h[e>>3]}else{k=1.5707963267948966}h[f+296>>3]=k;g=Jj(f)|0;j=g;i=b;return j|0}function Ij(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Jj(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,g=0.0,j=0,k=0,l=0,m=0.0;b=i;d=a;e=+P(+(+h[d+120>>3]));f=e;if(+P(+(e-1.5707963267948966))<1.0e-10){c[d+328>>2]=+h[d+120>>3]<0.0?0:1}else{c[d+328>>2]=f>1.0e-10?2:3}h[d+296>>3]=+P(+(+h[d+296>>3]));if(+h[d+64>>3]!=0.0){a=c[d+328>>2]|0;if((a|0)==1|(a|0)==0){if(+P(+(+h[d+296>>3]-1.5707963267948966))<1.0e-10){e=+R(+(+h[d+80>>3]+1.0),+(+h[d+80>>3]+1.0));h[d+320>>3]=+h[d+144>>3]*2.0/+Q(e*+R(+(1.0- +h[d+80>>3]),+(1.0- +h[d+80>>3])))}else{e=+S(+h[d+296>>3]);g=+T(+h[d+296>>3]);f=g;h[d+320>>3]=e/+Jm(+h[d+296>>3],g,+h[d+80>>3]);f=f*+h[d+80>>3];g=+Q(1.0-f*f);j=d+320|0;h[j>>3]=+h[j>>3]/g}}else if((a|0)==2){f=+T(+h[d+120>>3]);g=+X(+Lj(+h[d+120>>3],f,+h[d+80>>3]))*2.0-1.5707963267948966;f=f*+h[d+80>>3];h[d+320>>3]=+h[d+144>>3]*2.0*+S(+h[d+120>>3])/+Q(1.0-f*f);h[d+304>>3]=+T(g);h[d+312>>3]=+S(g)}else if((a|0)==3){h[d+320>>3]=+h[d+144>>3]*2.0}c[d+8>>2]=120;c[d+4>>2]=18;k=d;i=b;return k|0}else{a=c[d+328>>2]|0;if((a|0)==3){l=15}else if((a|0)==0|(a|0)==1){if(+P(+(+h[d+296>>3]-1.5707963267948966))>=1.0e-10){g=+S(+h[d+296>>3]);m=g/+U(.7853981633974483- +h[d+296>>3]*.5)}else{m=+h[d+144>>3]*2.0}h[d+320>>3]=m}else if((a|0)==2){h[d+304>>3]=+T(+h[d+120>>3]);h[d+312>>3]=+S(+h[d+120>>3]);l=15}if((l|0)==15){h[d+320>>3]=+h[d+144>>3]*2.0}c[d+8>>2]=330;c[d+4>>2]=288;k=d;i=b;return k|0}return 0}function Kj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(336)|0;e=a;if((a|0)!=0){ln(e|0,0,336)|0;c[e+16>>2]=192;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=7616}f=e;g=f;i=b;return g|0}ym(d,c[e>>2]|0,c[e+24>>2]|0,18856);h[e+120>>3]=(c[d>>2]|0)!=0?-1.5707963267948966:1.5707963267948966;if(+h[e+64>>3]==0.0){Cl(c[e>>2]|0,-34);Ij(e);f=0;g=f;i=b;return g|0}h[e+144>>3]=.994;h[e+128>>3]=2.0e6;h[e+136>>3]=2.0e6;h[e+296>>3]=1.5707963267948966;h[e+112>>3]=0.0;f=Jj(e)|0;g=f;i=b;return g|0}function Lj(a,b,c){a=+a;b=+b;c=+c;var d=0.0;d=b;b=c;d=d*b;c=+U((1.5707963267948966+a)*.5)*+R(+((1.0-d)/(1.0+d)),+(.5*b));i=i;return+c}function Mj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=0.0;k=0.0;l=0.0;m=0.0;n=+va(+(+h[b>>3]),+(+h[b+8>>3]));d=c[g+328>>2]|0;if((d|0)==0){o=7}else if((d|0)==1){h[b+8>>3]=-0.0- +h[b+8>>3];o=7}else if((d|0)==2|(d|0)==3){p=+Y(+(n*+h[g+312>>3]),+(+h[g+320>>3]))*2.0;j=p;q=+S(p);r=+T(j);if(n==0.0){k=+W(q*+h[g+304>>3])}else{k=+W(q*+h[g+304>>3]+ +h[b+8>>3]*r*+h[g+312>>3]/n)}j=+U((1.5707963267948966+k)*.5);d=b|0;h[d>>3]=+h[d>>3]*r;h[b+8>>3]=n*+h[g+312>>3]*q- +h[b+8>>3]*+h[g+304>>3]*r;m=1.5707963267948966;l=+h[g+80>>3]*.5}if((o|0)==7){q=(-0.0-n)/+h[g+320>>3];j=q;k=1.5707963267948966- +X(q)*2.0;m=-1.5707963267948966;l=+h[g+80>>3]*-.5}d=8;while(1){s=d;d=s-1|0;if((s|0)==0){o=20;break}r=+h[g+80>>3]*+T(k);h[f+8>>3]=+X(j*+R(+((1.0+r)/(1.0-r)),+l))*2.0-m;if(+P(+(k- +h[f+8>>3]))<1.0e-10){break}k=+h[f+8>>3]}if((o|0)==20){Cl(c[g>>2]|0,-20);d=a;s=f;c[d>>2]=c[s>>2];c[d+4>>2]=c[s+4>>2];c[d+8>>2]=c[s+8>>2];c[d+12>>2]=c[s+12>>2];i=e;return}if((c[g+328>>2]|0)==0){h[f+8>>3]=-0.0- +h[f+8>>3]}do{if(+h[b>>3]==0.0){if(+h[b+8>>3]!=0.0){o=16;break}t=0.0}else{o=16}}while(0);if((o|0)==16){t=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}h[f>>3]=t;b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Nj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=0.0;k=0.0;l=+S(+h[b>>3]);m=+T(+h[b>>3]);n=+T(+h[b+8>>3]);if((c[g+328>>2]|0)==2){o=3}else{if((c[g+328>>2]|0)==3){o=3}}if((o|0)==3){p=+X(+Lj(+h[b+8>>3],n,+h[g+80>>3]))*2.0-1.5707963267948966;j=+T(p);k=+S(p)}d=c[g+328>>2]|0;if((d|0)==2){q=+h[g+320>>3]/(+h[g+312>>3]*(+h[g+304>>3]*j+1.0+ +h[g+312>>3]*k*l));h[f+8>>3]=q*(+h[g+312>>3]*j- +h[g+304>>3]*k*l);o=7}else if((d|0)==3){q=+h[g+320>>3]*2.0/(k*l+1.0);h[f+8>>3]=q*j;o=7}else if((d|0)==0){h[b+8>>3]=-0.0- +h[b+8>>3];l=-0.0-l;n=-0.0-n;o=9}else if((d|0)==1){o=9}if((o|0)==7){h[f>>3]=q*k}else if((o|0)==9){k=+h[g+320>>3];h[f>>3]=k*+Jm(+h[b+8>>3],n,+h[g+80>>3]);h[f+8>>3]=(-0.0- +h[f>>3])*l}h[f>>3]=+h[f>>3]*m;g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}



function Oj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+va(+(+h[b>>3]),+(+h[b+8>>3]));k=j;l=+X(j/+h[g+320>>3])*2.0;j=l;m=+T(l);l=+S(j);h[f>>3]=0.0;d=c[g+328>>2]|0;if((d|0)==0){n=17}else if((d|0)==3){if(+P(+k)<=1.0e-10){h[f+8>>3]=0.0}else{h[f+8>>3]=+W(+h[b+8>>3]*m/k)}if(l!=0.0){n=7}else{if(+h[b>>3]!=0.0){n=7}}if((n|0)==7){h[f>>3]=+Y(+(+h[b>>3]*m),+(l*k))}}else if((d|0)==1){h[b+8>>3]=-0.0- +h[b+8>>3];n=17}else if((d|0)==2){if(+P(+k)<=1.0e-10){h[f+8>>3]=+h[g+120>>3]}else{h[f+8>>3]=+W(l*+h[g+304>>3]+ +h[b+8>>3]*m*+h[g+312>>3]/k)}o=l- +h[g+304>>3]*+T(+h[f+8>>3]);j=o;if(o!=0.0){n=14}else{if(+h[b>>3]!=0.0){n=14}}if((n|0)==14){h[f>>3]=+Y(+(+h[b>>3]*m*+h[g+312>>3]),+(j*k))}}if((n|0)==17){if(+P(+k)<=1.0e-10){h[f+8>>3]=+h[g+120>>3]}else{if((c[g+328>>2]|0)==0){p=-0.0-l}else{p=l}h[f+8>>3]=+W(p)}do{if(+h[b>>3]==0.0){if(+h[b+8>>3]!=0.0){n=26;break}q=0.0}else{n=26}}while(0);if((n|0)==26){q=+Y(+(+h[b>>3]),+(+h[b+8>>3]))}h[f>>3]=q}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Pj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+S(+h[b>>3]);m=+T(+h[b>>3]);d=c[g+328>>2]|0;if((d|0)==3){h[f+8>>3]=k*l+1.0;n=4}else if((d|0)==2){h[f+8>>3]=+h[g+304>>3]*j+1.0+ +h[g+312>>3]*k*l;n=4}else if((d|0)==1){l=-0.0-l;h[b+8>>3]=-0.0- +h[b+8>>3];n=11}else if((d|0)==0){n=11}do{if((n|0)==4){if(+h[f+8>>3]<=1.0e-10){Cl(c[g>>2]|0,-20);d=a;o=f;c[d>>2]=c[o>>2];c[d+4>>2]=c[o+4>>2];c[d+8>>2]=c[o+8>>2];c[d+12>>2]=c[o+12>>2];i=e;return}p=+h[g+320>>3]/+h[f+8>>3];h[f+8>>3]=p;h[f>>3]=p*k*m;if((c[g+328>>2]|0)==3){q=j}else{q=+h[g+312>>3]*j- +h[g+304>>3]*k*l}o=f+8|0;h[o>>3]=+h[o>>3]*q}else if((n|0)==11){if(+P(+(+h[b+8>>3]-1.5707963267948966))>=1.0e-8){p=+h[g+320>>3]*+U(+h[b+8>>3]*.5+.7853981633974483);h[f+8>>3]=p;h[f>>3]=m*p;o=f+8|0;h[o>>3]=+h[o>>3]*l;break}Cl(c[g>>2]|0,-20);o=a;d=f;c[o>>2]=c[d>>2];c[o+4>>2]=c[d+4>>2];c[o+8>>2]=c[d+8>>2];c[o+12>>2]=c[d+12>>2];i=e;return}}while(0);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Qj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)==0){a=om(336)|0;e=a;if((a|0)!=0){ln(e|0,0,336)|0;c[e+16>>2]=124;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=7968;c[e+328>>2]=0}f=e;g=f;i=b;return g|0}a=Gl(+h[e+80>>3],+h[e+120>>3],e+296|0,d)|0;c[e+328>>2]=a;if((a|0)==0){Rj(e);f=0;g=f;i=b;return g|0}h[e+312>>3]=+T(+h[e+296>>3]);h[e+304>>3]=+S(+h[e+296>>3]);h[e+320>>3]=+h[d>>3]*2.0;c[e+8>>2]=264;c[e+4>>2]=312;f=e;g=f;i=b;return g|0}function Rj(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+328>>2]|0)!=0){$m(c[d+328>>2]|0)}$m(d);i=b;return}function Sj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b|0;h[d>>3]=+h[d>>3]/+h[g+144>>3];d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+144>>3];j=+va(+(+h[b>>3]),+(+h[b+8>>3]));k=j;if(j!=0.0){j=+Y(+k,+(+h[g+320>>3]))*2.0;l=+T(j);m=+S(j);h[f+8>>3]=+W(m*+h[g+312>>3]+ +h[b+8>>3]*l*+h[g+304>>3]/k);h[f>>3]=+Y(+(+h[b>>3]*l),+(k*+h[g+304>>3]*m- +h[b+8>>3]*+h[g+312>>3]*l));n=g;o=n|0;p=c[o>>2]|0;q=g;r=q+328|0;s=c[r>>2]|0;Jl(a,p,f,s);i=e;return}else{h[f+8>>3]=+h[g+296>>3];h[f>>3]=0.0;n=g;o=n|0;p=c[o>>2]|0;q=g;r=q+328|0;s=c[r>>2]|0;Jl(a,p,f,s);i=e;return}}function Tj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;ln(f|0,0,16)|0;Il(g,c[j>>2]|0,b,c[j+328>>2]|0);d=b;k=g;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];l=+T(+h[b+8>>3]);m=+S(+h[b+8>>3]);n=+S(+h[b>>3]);o=+h[j+144>>3]*+h[j+320>>3]/(+h[j+312>>3]*l+1.0+ +h[j+304>>3]*m*n);h[f>>3]=o*m*+T(+h[b>>3]);h[f+8>>3]=o*(+h[j+304>>3]*l- +h[j+312>>3]*m*n);j=a;a=f;c[j>>2]=c[a>>2];c[j+4>>2]=c[a+4>>2];c[j+8>>2]=c[a+8>>2];c[j+12>>2]=c[a+12>>2];i=e;return}function Uj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=Wj(d,1.50488,1.35439,0)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=126;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10616}e=d;f=e;i=b;return f|0}function Vj(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Wj(a,b,d,e){a=a|0;b=+b;d=+d;e=e|0;var f=0,g=0.0;f=a;g=b;b=d;h[f+64>>3]=0.0;c[f+8>>2]=408;c[f+4>>2]=250;h[f+296>>3]=b/g;h[f+304>>3]=g;h[f+312>>3]=1.0/b;c[f+320>>2]=e;i=i;return f|0}function Xj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=Wj(d,2.0,2.0,0)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=126;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8320}e=d;f=e;i=b;return f|0}function Yj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=Wj(d,1.48875,1.36509,0)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=126;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=9824}e=d;f=e;i=b;return f|0}function Zj(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=Wj(d,2.0,2.0,1)|0;f=e;i=b;return f|0}a=om(328)|0;d=a;if((a|0)!=0){ln(d|0,0,328)|0;c[d+16>>2]=126;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11448}e=d;f=e;i=b;return f|0}function _j(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+304>>3];if((c[g+320>>2]|0)!=0){j=+X(+h[b+8>>3])}else{j=+dl(c[g>>2]|0,+h[b+8>>3])}h[f+8>>3]=j;k=+S(j);d=f+8|0;h[d>>3]=+h[d>>3]/+h[g+312>>3];h[f>>3]=+h[b>>3]/(+h[g+296>>3]*+S(+h[f+8>>3]));if((c[g+320>>2]|0)!=0){g=f|0;h[g>>3]=+h[g>>3]/(k*k);l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}else{g=f|0;h[g>>3]=+h[g>>3]*k;l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}}function $j(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=+h[g+296>>3]*+h[b>>3]*+S(+h[b+8>>3]);h[f+8>>3]=+h[g+304>>3];d=b+8|0;h[d>>3]=+h[d>>3]*+h[g+312>>3];j=+S(+h[b+8>>3]);if((c[g+320>>2]|0)!=0){g=f|0;h[g>>3]=+h[g>>3]*j*j;k=+U(+h[b+8>>3]);g=f+8|0;h[g>>3]=+h[g>>3]*k;l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}else{g=f|0;h[g>>3]=+h[g>>3]/j;j=+T(+h[b+8>>3]);b=f+8|0;h[b>>3]=+h[b>>3]*j;l=a;m=f;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];c[l+12>>2]=c[m+12>>2];i=e;return}}function ak(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+4>>2]=244;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=128;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7912}e=d;f=e;i=b;return f|0}function bk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function ck(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,j=0.0,k=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;g=+S(+h[b+8>>3]);j=g*+T(+h[b>>3]);g=1.0-j*j;if(g<1.0e-10){Cl(c[d>>2]|0,-20);d=a;k=f;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return}else{h[f>>3]=j/+Q(g);g=+U(+h[b+8>>3]);h[f+8>>3]=+Y(+g,+(+S(+h[b>>3])));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}}function dk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=1.0/+h[d+144>>3];c[d+8>>2]=96;c[d+4>>2]=112;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=130;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7864}e=d;f=e;i=b;return f|0}function ek(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function fk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[b+8>>3]=+h[b+8>>3]*+h[g+296>>3]+ +h[g+120>>3];d=b|0;h[d>>3]=+h[d>>3]*+h[g+144>>3];j=+Q(1.0- +h[b>>3]*+h[b>>3]);h[f+8>>3]=+W(j*+T(+h[b+8>>3]));h[f>>3]=+Y(+(+h[b>>3]),+(j*+S(+h[b+8>>3])));b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function gk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[g+296>>3]*+S(+h[b+8>>3]);h[f>>3]=j*+T(+h[b>>3]);j=+U(+h[b+8>>3]);k=+Y(+j,+(+S(+h[b>>3])));h[f+8>>3]=+h[g+144>>3]*(k- +h[g+120>>3]);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function hk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){e=jk(d)|0;f=e;i=b;return f|0}a=om(320)|0;d=a;if((a|0)!=0){ln(d|0,0,320)|0;c[d+16>>2]=62;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7784;c[d+312>>2]=0}e=d;f=e;i=b;return f|0}function ik(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+312>>2]|0)!=0){pm(c[d+312>>2]|0)}pm(d);i=b;return}function jk(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,g=0,j=0;b=i;d=a;do{if(+h[d+64>>3]!=0.0){a=qm(+h[d+64>>3])|0;c[d+312>>2]=a;if((a|0)!=0){e=+T(+h[d+120>>3]);f=+S(+h[d+120>>3]);h[d+304>>3]=+rm(+h[d+120>>3],e,f,c[d+312>>2]|0);h[d+296>>3]=+h[d+64>>3]/(1.0- +h[d+64>>3]);c[d+8>>2]=400;c[d+4>>2]=352;break}ik(d);g=0;j=g;i=b;return j|0}else{h[d+296>>3]=+h[d+144>>3];h[d+304>>3]=+h[d+296>>3]*.5;c[d+8>>2]=164;c[d+4>>2]=372}}while(0);g=d;j=g;i=b;return j|0}function kk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0;b=i;i=i+24|0;d=b|0;e=b+8|0;f=b+16|0;g=a;if((g|0)==0){a=om(320)|0;g=a;if((a|0)!=0){ln(g|0,0,320)|0;c[g+16>>2]=62;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+20>>2]=7464;c[g+312>>2]=0}j=g;k=j;i=b;return k|0}if(+h[g+64>>3]==0.0){Cl(c[g>>2]|0,-34);ik(g);j=0;k=j;i=b;return k|0}ym(d,c[g>>2]|0,c[g+24>>2]|0,16872);h[g+136>>3]=(c[d>>2]|0)!=0?1.0e7:0.0;h[g+128>>3]=5.0e5;ym(e,c[g>>2]|0,c[g+24>>2]|0,20912);a:do{if((c[e>>2]|0)!=0){ym(f,c[g>>2]|0,c[g+24>>2]|0,18736);d=c[f>>2]|0;l=d;do{if((d|0)>0){if((l|0)>60){break}l=l-1|0;break a}}while(0);Cl(c[g>>2]|0,-35);ik(g);j=0;k=j;i=b;return k|0}else{d=~~+O((+hl(+h[g+112>>3])+3.141592653589793)*30.0/3.141592653589793);l=d;if((d|0)<0){l=0}else{if((l|0)>=60){l=59}}}}while(0);h[g+112>>3]=(+(l|0)+.5)*3.141592653589793/30.0-3.141592653589793;h[g+144>>3]=.9996;h[g+120>>3]=0.0;j=jk(g)|0;k=j;i=b;return k|0}function lk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+sm(c[g>>2]|0,+h[g+304>>3]+ +h[b+8>>3]/+h[g+144>>3],+h[g+64>>3],c[g+312>>2]|0);if(+P(+(+h[f+8>>3]))>=1.5707963267948966){h[f+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966;h[f>>3]=0.0;j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}l=+T(+h[f+8>>3]);m=+S(+h[f+8>>3]);if(+P(+m)>1.0e-10){n=l/m}else{n=0.0}o=n;n=+h[g+296>>3]*m*m;p=1.0- +h[g+64>>3]*l*l;l=p;q=+h[b>>3]*+Q(p);p=q/+h[g+144>>3];l=l*o;o=o*o;q=p*p;b=f+8|0;h[b>>3]=+h[b>>3]-l*q/(1.0- +h[g+64>>3])*.5*(1.0-q*.08333333333333333*(o*(3.0-9.0*n)+5.0+n*(1.0-4.0*n)-q*.03333333333333333*(o*(90.0-252.0*n+45.0*o)+61.0+46.0*n-q*.017857142857142856*(o*(o*(1574.0*o+4095.0)+3633.0)+1385.0))));h[f>>3]=p*(1.0-q*.16666666666666666*(2.0*o+1.0+n-q*.05*(o*(24.0*o+28.0+8.0*n)+5.0+6.0*n-q*.023809523809523808*(o*(o*(720.0*o+1320.0)+662.0)+61.0))))/m;j=a;k=f;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[j+12>>2]=c[k+12>>2];i=e;return}function mk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,r=0.0,s=0.0,t=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;do{if(+h[b>>3]>=-1.5707963267948966){if(+h[b>>3]>1.5707963267948966){break}j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);if(+P(+k)>1.0e-10){l=j/k}else{l=0.0}m=l;m=m*m;n=k*+h[b>>3];o=n*n;n=n/+Q(1.0- +h[g+64>>3]*j*j);p=+h[g+296>>3]*k*k;h[f>>3]=+h[g+144>>3]*n*(.16666666666666666*o*(1.0-m+p+.05*o*(m*(m-18.0)+5.0+p*(14.0-58.0*m)+.023809523809523808*o*(m*(m*(179.0-m)-479.0)+61.0)))+1.0);r=+h[g+144>>3];s=+rm(+h[b+8>>3],j,k,c[g+312>>2]|0);h[f+8>>3]=r*(s- +h[g+304>>3]+j*n*+h[b>>3]*.5*(.08333333333333333*o*(5.0-m+p*(4.0*p+9.0)+.03333333333333333*o*(m*(m-58.0)+61.0+p*(270.0-330.0*m)+.017857142857142856*o*(m*(m*(543.0-m)-3111.0)+1385.0)))+1.0));d=a;t=f;c[d>>2]=c[t>>2];c[d+4>>2]=c[t+4>>2];c[d+8>>2]=c[t+8>>2];c[d+12>>2]=c[t+12>>2];i=e;return}}while(0);h[f>>3]=q;h[f+8>>3]=q;Cl(c[g>>2]|0,-14);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function nk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+Z(+h[b>>3]/+h[g+296>>3]);k=(j-1.0/j)*.5;j=+S(+h[g+120>>3]+ +h[b+8>>3]/+h[g+296>>3]);h[f+8>>3]=+W(+Q((1.0-j*j)/(k*k+1.0)));if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}do{if(k!=0.0){l=5}else{if(j!=0.0){l=5;break}m=0.0}}while(0);if((l|0)==5){m=+Y(+k,+j)}h[f>>3]=m;l=a;a=f;c[l>>2]=c[a>>2];c[l+4>>2]=c[a+4>>2];c[l+8>>2]=c[a+8>>2];c[l+12>>2]=c[a+12>>2];i=e;return}function ok(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;do{if(+h[b>>3]>=-1.5707963267948966){if(+h[b>>3]>1.5707963267948966){break}j=+S(+h[b+8>>3]);k=j*+T(+h[b>>3]);if(+P(+(+P(+k)-1.0))<=1.0e-10){Cl(c[g>>2]|0,-20);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}h[f>>3]=+h[g+304>>3]*+_((1.0+k)/(1.0-k));m=j*+S(+h[b>>3])/+Q(1.0-k*k);h[f+8>>3]=m;j=+P(+m);k=j;do{if(j>=1.0){if(k-1.0>1.0e-10){Cl(c[g>>2]|0,-20);l=a;d=f;c[l>>2]=c[d>>2];c[l+4>>2]=c[d+4>>2];c[l+8>>2]=c[d+8>>2];c[l+12>>2]=c[d+12>>2];i=e;return}else{h[f+8>>3]=0.0;break}}else{h[f+8>>3]=+V(+h[f+8>>3])}}while(0);if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}h[f+8>>3]=+h[g+296>>3]*(+h[f+8>>3]- +h[g+120>>3]);d=a;l=f;c[d>>2]=c[l>>2];c[d+4>>2]=c[l+4>>2];c[d+8>>2]=c[l+8>>2];c[d+12>>2]=c[l+12>>2];i=e;return}}while(0);h[f>>3]=q;h[f+8>>3]=q;Cl(c[g>>2]|0,-14);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function pk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;j=a;if((j|0)==0){a=om(432)|0;j=a;if((a|0)!=0){ln(j|0,0,432)|0;c[j+16>>2]=16;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+20>>2]=7720}k=j;l=k;i=b;return l|0}ym(d,c[j>>2]|0,c[j+24>>2]|0,16800);m=+h[d>>3];ym(e,c[j>>2]|0,c[j+24>>2]|0,20880);n=+h[e>>3];ym(f,c[j>>2]|0,c[j+24>>2]|0,18728);o=+h[f>>3];ym(g,c[j>>2]|0,c[j+24>>2]|0,17224);p=+h[g>>3];do{if(m==o){if(n!=p){break}Cl(c[j>>2]|0,-25);qk(j);k=0;l=k;i=b;return l|0}}while(0);h[j+112>>3]=+hl((n+p)*.5);h[j+368>>3]=+hl(p-n);h[j+296>>3]=+S(m);h[j+312>>3]=+S(o);h[j+304>>3]=+T(m);h[j+320>>3]=+T(o);h[j+336>>3]=+h[j+296>>3]*+h[j+320>>3];h[j+344>>3]=+h[j+304>>3]*+h[j+312>>3];h[j+328>>3]=+h[j+296>>3]*+h[j+312>>3]*+T(+h[j+368>>3]);h[j+360>>3]=+el(c[j>>2]|0,+h[j+304>>3]*+h[j+320>>3]+ +h[j+296>>3]*+h[j+312>>3]*+S(+h[j+368>>3]));h[j+376>>3]=+h[j+360>>3]*.5;o=+h[j+312>>3]*+T(+h[j+368>>3]);m=+Y(+o,+(+h[j+296>>3]*+h[j+320>>3]- +h[j+304>>3]*+h[j+312>>3]*+S(+h[j+368>>3])));o=+dl(c[j>>2]|0,+h[j+296>>3]*+T(m));h[j+400>>3]=+S(o);h[j+408>>3]=+T(o);o=+h[j+296>>3]*+S(m);n=+Y(+o,+(+h[j+304>>3]));h[j+416>>3]=+hl(n- +h[j+376>>3]);g=j+368|0;h[g>>3]=+h[g>>3]*.5;n=+T(m);o=1.5707963267948966- +Y(+(n*+h[j+304>>3]),+(+S(m)));h[j+424>>3]=o- +h[j+368>>3];h[j+384>>3]=+U(+h[j+376>>3]);h[j+392>>3]=.5/+T(+h[j+376>>3]);h[j+352>>3]=.5/+h[j+360>>3];g=j+360|0;h[g>>3]=+h[g>>3]*+h[j+360>>3];c[j+8>>2]=148;c[j+4>>2]=118;h[j+64>>3]=0.0;k=j;l=k;i=b;return l|0}function qk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function rk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+va(+(+h[b+8>>3]),+(+h[b>>3]+ +h[g+376>>3])));k=+S(+va(+(+h[b+8>>3]),+(+h[b>>3]- +h[g+376>>3])));l=j+k;m=j-k;h[f>>3]=-0.0- +Y(+m,+(l*+h[g+384>>3]));d=c[g>>2]|0;k=+va(+(+h[g+384>>3]*l),+m);h[f+8>>3]=+el(d,k*+h[g+392>>3]);if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}k=+T(+h[f+8>>3]);m=+S(+h[f+8>>3]);b=c[g>>2]|0;j=+h[g+408>>3]*k;n=+h[g+400>>3]*m;d=f|0;o=+h[d>>3]- +h[g+416>>3];h[d>>3]=o;p=+S(o);l=p;h[f+8>>3]=+dl(b,j+n*p);p=m*+T(+h[f>>3]);n=+Y(+p,+(+h[g+408>>3]*m*l- +h[g+400>>3]*k));h[f>>3]=n+ +h[g+424>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function sk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+T(+h[b+8>>3]);k=+S(+h[b+8>>3]);l=+h[b>>3]+ +h[g+368>>3];m=+el(c[g>>2]|0,+h[g+304>>3]*j+ +h[g+296>>3]*k*+S(l));n=+h[b>>3]- +h[g+368>>3];o=+el(c[g>>2]|0,+h[g+320>>3]*j+ +h[g+312>>3]*k*+S(n));m=m*m;o=o*o;p=m-o;m=p;h[f>>3]=+h[g+352>>3]*p;m=+h[g+360>>3]-m;p=+h[g+352>>3];h[f+8>>3]=p*+fl(+h[g+360>>3]*4.0*o-m*m);m=+h[g+336>>3]*+T(l);if(+h[g+328>>3]*j-k*(m- +h[g+344>>3]*+T(n))>=0.0){q=a;r=f;c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];c[q+12>>2]=c[r+12>>2];i=e;return}h[f+8>>3]=-0.0- +h[f+8>>3];q=a;r=f;c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];c[q+12>>2]=c[r+12>>2];i=e;return}function tk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0.0,k=0.0,l=0,m=0;b=i;i=i+24|0;d=b|0;e=b+8|0;f=b+16|0;g=a;if((g|0)!=0){ym(d,c[g>>2]|0,c[g+24>>2]|0,16768);h[g+320>>3]=+h[d>>3];ym(e,c[g>>2]|0,c[g+24>>2]|0,20872);h[g+312>>3]=+h[e>>3]/3.0;ym(f,c[g>>2]|0,c[g+24>>2]|0,18720);j=+h[f>>3];k=+h[g+320>>3]*+T(j);h[g+296>>3]=+S(j)/+Q(1.0-k*k);h[g+304>>3]=1.0/(+h[g+296>>3]*+h[g+320>>3]);h[g+64>>3]=0.0;c[g+8>>2]=0;c[g+4>>2]=228;l=g;m=l;i=b;return m|0}f=om(328)|0;g=f;if((f|0)!=0){ln(g|0,0,328)|0;c[g+16>>2]=170;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+20>>2]=7576}l=g;m=l;i=b;return m|0}function uk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function vk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+dl(c[g>>2]|0,+h[g+320>>3]*+T(+h[b+8>>3]));h[b+8>>3]=j;k=j;h[f>>3]=+h[g+296>>3]*+h[b>>3]*+S(+h[b+8>>3]);k=k*k;h[f+8>>3]=+h[b+8>>3]*(k*+h[g+312>>3]+1.0)*+h[g+304>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function wk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a;if((f|0)==0){a=om(312)|0;f=a;if((a|0)!=0){ln(f|0,0,312)|0;c[f+16>>2]=24;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+20>>2]=7528}g=f;j=g;i=b;return j|0}ym(d,c[f>>2]|0,c[f+24>>2]|0,16720);if((c[d>>2]|0)==0){Cl(c[f>>2]|0,-40);xk(f);g=0;j=g;i=b;return j|0}ym(e,c[f>>2]|0,c[f+24>>2]|0,20848);h[f+296>>3]=+h[e>>3];do{if(+h[f+296>>3]>0.0){if(+h[f+296>>3]>1.0){break}g=yk(f)|0;j=g;i=b;return j|0}}while(0);Cl(c[f>>2]|0,-40);xk(f);g=0;j=g;i=b;return j|0}function xk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function yk(a){a=a|0;var b=0;b=a;h[b+304>>3]=1.139753528477/+h[b+296>>3];h[b+64>>3]=0.0;c[b+8>>2]=270;c[b+4>>2]=232;i=i;return b|0}function zk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+296>>3]=.8660254037844386;e=yk(d)|0;f=e;i=b;return f|0}a=om(312)|0;d=a;if((a|0)!=0){ln(d|0,0,312)|0;c[d+16>>2]=24;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7224}e=d;f=e;i=b;return f|0}function Ak(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;d=b+8|0;h[d>>3]=+h[d>>3]/+h[g+304>>3];j=+T(+h[b+8>>3]);h[f+8>>3]=+dl(c[g>>2]|0,j/+h[g+296>>3]);h[f>>3]=+h[b>>3]/(+S(+h[b+8>>3])*.8773826753);b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Bk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[b+8>>3]=+dl(c[g>>2]|0,+h[g+296>>3]*+T(+h[b+8>>3]));h[f>>3]=+h[b>>3]*.8773826753*+S(+h[b+8>>3]);h[f+8>>3]=+h[g+304>>3]*+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Ck(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=348;c[d+4>>2]=136;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=22;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7432}e=d;f=e;i=b;return f|0}function Dk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ek(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3]*+h[b>>3];k=+P(+(+h[b+8>>3]));l=k;if(k<1.0e-10){h[f+8>>3]=0.0;m=j*j+19.739208802178716*(j+4.934802200544679);if(+P(+(+h[b>>3]))<=1.0e-10){n=0.0}else{k=(j-9.869604401089358+ +Q(m))*.5;n=k/+h[b>>3]}h[f>>3]=n;d=a;o=f;c[d>>2]=c[o>>2];c[d+4>>2]=c[o+4>>2];c[d+8>>2]=c[o+8>>2];c[d+12>>2]=c[o+12>>2];i=e;return}n=+h[b+8>>3]*+h[b+8>>3];k=j+n;p=k*k;q=-3.141592653589793*l*(k+9.869604401089358);r=p+6.283185307179586*(l*k+3.141592653589793*(n+3.141592653589793*(l+1.5707963267948966)));s=q+9.869604401089358*(k-3.0*n);t=3.141592653589793*l;s=s/r;l=q/r-.3333333333333333*s*s;u=+Q(-.3333333333333333*l)*2.0;v=.07407407407407407*s*s*s+(t*t-.3333333333333333*s*q)/r;r=3.0*v/(l*u);v=r;l=+P(+r);m=l;if(l-1.0e-10>1.0){Cl(c[g>>2]|0,-20);g=a;o=f;c[g>>2]=c[o>>2];c[g+4>>2]=c[o+4>>2];c[g+8>>2]=c[o+8>>2];c[g+12>>2]=c[o+12>>2];i=e;return}if(m>1.0){w=v>0.0?0.0:3.141592653589793}else{w=+V(v)}v=w;h[f+8>>3]=3.141592653589793*(u*+S(v*.3333333333333333+4.188790204786391)-.3333333333333333*s);if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}m=p+19.739208802178716*(j-n+4.934802200544679);if(+P(+(+h[b>>3]))<=1.0e-10){x=0.0}else{if(m<=0.0){y=0.0}else{y=+Q(m)}x=(k-9.869604401089358+y)*.5/+h[b>>3]}h[f>>3]=x;b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Fk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+P(+(+h[b+8>>3]/1.5707963267948966));if(j-1.0e-10>1.0){Cl(c[g>>2]|0,-20);d=a;k=f;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];i=e;return}if(j>1.0){j=1.0}if(+P(+(+h[b+8>>3]))<=1.0e-10){h[f>>3]=+h[b>>3];h[f+8>>3]=0.0}else{do{if(+P(+(+h[b>>3]))<=1.0e-10){l=9}else{if(+P(+(j-1.0))<1.0e-10){l=9;break}m=+P(+(3.141592653589793/+h[b>>3]- +h[b>>3]/3.141592653589793))*.5;n=m*m;o=+Q(1.0-j*j);o=o/(j+o-1.0);p=o*o;j=o*(2.0/j-1.0);j=j*j;h[f>>3]=o-j;o=j+n;h[f>>3]=3.141592653589793*(m*+h[f>>3]+ +Q(n*+h[f>>3]*+h[f>>3]-o*(p-j)))/o;if(+h[b>>3]<0.0){h[f>>3]=-0.0- +h[f>>3]}h[f+8>>3]=+P(+(+h[f>>3]/3.141592653589793));h[f+8>>3]=1.0- +h[f+8>>3]*(+h[f+8>>3]+2.0*m);if(+h[f+8>>3]<-1.0e-10){Cl(c[g>>2]|0,-20);k=a;d=f;c[k>>2]=c[d>>2];c[k+4>>2]=c[d+4>>2];c[k+8>>2]=c[d+8>>2];c[k+12>>2]=c[d+12>>2];i=e;return}if(+h[f+8>>3]<0.0){h[f+8>>3]=0.0}else{m=+Q(+h[f+8>>3]);h[f+8>>3]=m*(+h[b+8>>3]<0.0?-3.141592653589793:3.141592653589793)}}}while(0);if((l|0)==9){h[f>>3]=0.0;h[f+8>>3]=3.141592653589793*+U(+W(j)*.5);if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}}}b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Gk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+296>>2]=0;c[d+8>>2]=0;c[d+4>>2]=138;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=44;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7392}e=d;f=e;i=b;return f|0}function Hk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ik(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+P(+(+h[b+8>>3]*.6366197723675814));k=1.0-j*j;l=k;if(k<0.0){l=0.0}else{l=+Q(l)}if(+P(+(+h[b>>3]))<1.0e-10){h[f>>3]=0.0;if(+h[b+8>>3]<0.0){m=-0.0-j}else{m=j}h[f+8>>3]=3.141592653589793*m/(1.0+l);n=a;o=f;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];i=e;return}m=+P(+(3.141592653589793/+h[b>>3]- +h[b>>3]/3.141592653589793))*.5;if((c[g+296>>2]|0)!=0){p=j/(1.0+l);h[f>>3]=3.141592653589793*(+Q(m*m+1.0-p*p)-m);h[f+8>>3]=3.141592653589793*p}else{p=(l*+Q(m*m+1.0)-m*l*l)/(m*m*j*j+1.0);h[f>>3]=3.141592653589793*p;h[f+8>>3]=3.141592653589793*+Q(1.0-p*(p+2.0*m)+1.0e-10)}if(+h[b>>3]<0.0){h[f>>3]=-0.0- +h[f>>3]}if(+h[b+8>>3]<0.0){h[f+8>>3]=-0.0- +h[f+8>>3]}n=a;o=f;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];i=e;return}function Jk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+296>>2]=1;h[d+64>>3]=0.0;c[d+4>>2]=138;e=d;f=e;i=b;return f|0}a=om(304)|0;d=a;if((a|0)!=0){ln(d|0,0,304)|0;c[d+16>>2]=44;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7352}e=d;f=e;i=b;return f|0}function Kk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+4>>2]=134;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=10;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7312}e=d;f=e;i=b;return f|0}function Lk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Mk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;if(+P(+(+h[b+8>>3]))<1.0e-10){h[e>>3]=+h[b>>3];h[e+8>>3]=0.0;f=a;g=e;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];c[f+8>>2]=c[g+8>>2];c[f+12>>2]=c[g+12>>2];i=d;return}do{if(+P(+(+h[b>>3]))<1.0e-10){j=5}else{if(+P(+(+P(+(+h[b+8>>3]))-1.5707963267948966))<1.0e-10){j=5;break}k=+P(+(+h[b+8>>3]*.6366197723675814));l=k*k;m=(k*(8.0-k*(2.0+l))-5.0)*.5/(l*(k-1.0));n=m*m;o=+h[b>>3]*.6366197723675814;o=o+1.0/o;o=+Q(o*o-4.0);if(+P(+(+h[b>>3]))-1.5707963267948966<0.0){o=-0.0-o}p=o*o;q=k+m;q=q*q;r=k+3.0*m;q=(o*(q+n-1.0)+ +Q(q*(l+n*p-1.0)+(1.0-l)*(l*(r*r+4.0*n)+n*(12.0*k*m+4.0*n)))*2.0)/(4.0*q+p);h[e>>3]=1.5707963267948966*q;h[e+8>>3]=1.5707963267948966*+Q(o*+P(+q)+1.0-q*q);if(+h[b>>3]<0.0){h[e>>3]=-0.0- +h[e>>3]}if(+h[b+8>>3]<0.0){h[e+8>>3]=-0.0- +h[e+8>>3]}}}while(0);if((j|0)==5){h[e>>3]=0.0;h[e+8>>3]=+h[b+8>>3]}f=a;g=e;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];c[f+8>>2]=c[g+8>>2];c[f+12>>2]=c[g+12>>2];i=d;return}function Nk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){h[d+64>>3]=0.0;c[d+8>>2]=58;c[d+4>>2]=142;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=46;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7200}e=d;f=e;i=b;return f|0}function Ok(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Pk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]/1.38725;h[f>>3]=+h[b>>3]/(+S(+h[f+8>>3])*.92483);h[f+8>>3]=+dl(c[d>>2]|0,+T(+h[f+8>>3])/.88022)/.8855;d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=e;return}function Qk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[b+8>>3]=+dl(c[d>>2]|0,+T(+h[b+8>>3]*.8855)*.88022);h[f>>3]=+h[b>>3]*.92483*+S(+h[b+8>>3]);h[f+8>>3]=1.38725*+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Rk(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0,j=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)!=0){ym(d,c[e>>2]|0,c[e+24>>2]|0,16616);f=+h[d>>3];h[e+296>>3]=+S(f)/+S(2.0*f/3.0);h[e+64>>3]=0.0;c[e+8>>2]=220;c[e+4>>2]=258;g=e;j=g;i=b;return j|0}d=om(304)|0;e=d;if((d|0)!=0){ln(e|0,0,304)|0;c[e+16>>2]=116;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=7160}g=e;j=g;i=b;return j|0}function Sk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Tk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3];h[f>>3]=+h[b>>3]/(+h[d+296>>3]*+S(+h[f+8>>3]*.6666666666666666));d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=e;return}function Uk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f>>3]=+h[d+296>>3]*+h[b>>3]*+S(+h[b+8>>3]*.6666666666666666);h[f+8>>3]=+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function Vk(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+4>>2]=256;c[d+8>>2]=0;h[d+64>>3]=0.0;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=136;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=7056}e=d;f=e;i=b;return f|0}function Wk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Xk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,g=0.0,j=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;f=+T(+h[b+8>>3])*.9063077870366499;h[e+8>>3]=f;g=+S(+W(f));j=b|0;f=+h[j>>3]/3.0;h[j>>3]=f;h[e>>3]=2.66723*g*+T(f);f=1.0/+Q((g*+S(+h[b>>3])+1.0)*.5);b=e+8|0;h[b>>3]=+h[b>>3]*1.24104*f;b=e|0;h[b>>3]=+h[b>>3]*f;b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Yk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)!=0){ym(d,c[e>>2]|0,c[e+24>>2]|0,16576);h[e+296>>3]=+S(+h[d>>3]);h[e+64>>3]=0.0;c[e+8>>2]=218;c[e+4>>2]=260;f=e;g=f;i=b;return g|0}d=om(304)|0;e=d;if((d|0)!=0){ln(e|0,0,304)|0;c[e+16>>2]=134;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=6992}f=e;g=f;i=b;return g|0}function Zk(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function _k(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3];h[f>>3]=+h[b>>3]*2.0/(+h[d+296>>3]+ +S(+h[f+8>>3]));d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=e;return}function $k(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;ln(f|0,0,16)|0;h[f>>3]=+h[b>>3]*.5*(+h[d+296>>3]+ +S(+h[b+8>>3]));h[f+8>>3]=+h[b+8>>3];b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function al(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+8|0;d=b|0;e=a;if((e|0)!=0){ym(d,c[e>>2]|0,c[e+24>>2]|0,16528);h[e+296>>3]=+S(+h[d>>3]);h[e+64>>3]=0.0;c[e+8>>2]=0;c[e+4>>2]=42;f=e;g=f;i=b;return g|0}d=om(304)|0;e=d;if((d|0)!=0){ln(e|0,0,304)|0;c[e+16>>2]=132;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+20>>2]=6952}f=e;g=f;i=b;return g|0}function bl(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function cl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]*.6366197723675814;j=3.141592653589793*+T(+h[b+8>>3]);d=b+8|0;h[d>>3]=+h[d>>3]*1.8;d=10;while(1){if((d|0)==0){break}k=+h[b+8>>3]+ +T(+h[b+8>>3])-j;l=k/(+S(+h[b+8>>3])+1.0);m=b+8|0;h[m>>3]=+h[m>>3]-l;if(+P(+l)<1.0e-7){m=4;break}d=d-1|0}if((d|0)!=0){d=b+8|0;h[d>>3]=+h[d>>3]*.5}else{h[b+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}j=+S(+h[b+8>>3]);h[f>>3]=+h[b>>3]*.5*(j+ +h[g+296>>3]);j=+T(+h[b+8>>3]);h[f+8>>3]=(j+ +h[f+8>>3])*.7853981633974483;b=a;a=f;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=e;return}function dl(a,b){a=a|0;b=+b;var c=0,d=0.0,e=0.0,f=0.0;c=i;d=b;b=+P(+d);if(b<1.0){e=+W(d);f=e;i=c;return+f}if(b>1.00000000000001){Cl(a,-19)}e=d<0.0?-1.5707963267948966:1.5707963267948966;f=e;i=c;return+f}function el(a,b){a=a|0;b=+b;var c=0,d=0.0,e=0.0,f=0.0;c=i;d=b;b=+P(+d);if(b<1.0){e=+V(d);f=e;i=c;return+f}if(b>1.00000000000001){Cl(a,-19)}e=d<0.0?3.141592653589793:0.0;f=e;i=c;return+f}function fl(a){a=+a;var b=0.0,c=0.0;b=a;if(b<=0.0){c=0.0}else{c=+Q(b)}i=i;return+c}function gl(a,b){a=+a;b=+b;var c=0,d=0.0,e=0.0;c=i;d=a;a=b;do{if(+P(+d)<1.0e-50){if(+P(+a)>=1.0e-50){break}e=0.0;i=c;return+e}}while(0);e=+Y(+d,+a);i=c;return+e}function hl(a){a=+a;var b=0,c=0.0,d=0.0,e=0.0;b=i;c=a;if(+P(+c)<=3.14159265359){d=c;e=d;i=b;return+e}else{c=c+3.141592653589793;c=c-6.283185307179586*+O(c/6.283185307179586);c=c-3.141592653589793;d=c;e=d;i=b;return+e}return 0.0}function il(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0;f=i;i=i+72|0;g=f|0;j=f+8|0;k=b;b=d;d=e;if((d|0)!=0){c[d>>2]=b}while(1){e=a[b]|0;l=e;if((xb(e|0)|0)==0){break}b=b+1|0}e=64;c[g>>2]=j;m=b;while(1){if((kb(a[m]|0)|0)!=0){n=e-1|0;e=n;o=(n|0)!=0}else{o=0}if(!o){break}n=m;m=n+1|0;p=a[n]|0;n=c[g>>2]|0;c[g>>2]=n+1;a[n]=p}a[c[g>>2]|0]=0;o=j|0;c[g>>2]=o;l=a[o]|0;do{if((l|0)==43){r=13}else{if((l|0)==45){r=13;break}l=43}}while(0);if((r|0)==13){c[g>>2]=(c[g>>2]|0)+1}s=0.0;o=0;a:while(1){if((o|0)>=3){break}if((Aa(a[c[g>>2]|0]|0)|0)==0){if((a[c[g>>2]|0]|0)!=46){r=19;break}}t=+jl(c[g>>2]|0,g);u=t;if(t==q){r=21;break}switch(a[c[g>>2]|0]|0){case 68:case 100:{e=0;r=31;break};case 39:{e=1;r=31;break};case 34:{e=2;r=31;break};case 114:case 82:{if((o|0)!=0){r=27;break a}c[g>>2]=(c[g>>2]|0)+1;s=u;r=30;break};default:{s=s+u*+h[8+(o<<3)>>3];r=30}}if((r|0)==30){r=0;e=4}else if((r|0)==31){r=0;if((e|0)<(o|0)){r=32;break}s=s+u*+h[8+(e<<3)>>3];c[g>>2]=(c[g>>2]|0)+1}o=e+1|0}if((r|0)!=19)if((r|0)==21){v=u;w=v;i=f;return+w}else if((r|0)==27){Cl(k,-16);v=q;w=v;i=f;return+w}else if((r|0)==32){Cl(k,-16);v=q;w=v;i=f;return+w}do{if((a[c[g>>2]|0]|0)!=0){k=Ga(c[166]|0,a[c[g>>2]|0]|0)|0;m=k;if((k|0)==0){break}l=(m-(c[166]|0)|0)>=4?45:43;c[g>>2]=(c[g>>2]|0)+1}}while(0);if((l|0)==45){s=-0.0-s}if((d|0)!=0){c[d>>2]=b+((c[g>>2]|0)-j)}v=s;w=v;i=f;return+w}function jl(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0.0,k=0.0,l=0.0;d=i;e=b;b=c;c=e;while(1){f=a[c]|0;g=f;if((f<<24>>24|0)==0){h=7;break}if((g<<24>>24|0)==100){h=5;break}if((g<<24>>24|0)==68){h=5;break}c=c+1|0}if((h|0)==5){a[c]=0;j=+kn(e,b);a[c]=g;k=j;l=k;i=d;return+l}else if((h|0)==7){k=+kn(e,b);l=k;i=d;return+l}return 0.0}function kl(a,b,c){a=a|0;b=+b;c=+c;var d=0,e=0,f=0.0,g=0;d=i;e=a;f=b;b=c;a=0;if(f<=0.0){a=a|4}if(b<=0.0){a=a|8}if(f<b){a=a|16}if((a|0)!=0){g=a;i=d;return g|0}h[e>>3]=f;h[e+8>>3]=b;h[e+16>>3]=f*f;h[e+24>>3]=b*b;h[e+32>>3]=(+h[e+16>>3]- +h[e+24>>3])/+h[e+16>>3];h[e+40>>3]=(+h[e+16>>3]- +h[e+24>>3])/+h[e+24>>3];g=a;i=d;return g|0}function ll(a,b,c,d,e,f,g){a=a|0;b=+b;c=+c;d=+d;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0.0,m=0,n=0,o=0.0;j=i;k=a;l=b;b=c;c=d;a=e;e=f;f=g;g=0;do{if(l<-1.5707963267948966){if(l<=-1.5723671231216914){m=4;break}l=-1.5707963267948966}else{m=4}}while(0);if((m|0)==4){do{if(l>1.5707963267948966){if(l>=1.5723671231216914){m=7;break}l=1.5707963267948966}else{m=7}}while(0);if((m|0)==7){if(l<-1.5707963267948966){m=9}else{if(l>1.5707963267948966){m=9}}if((m|0)==9){g=g|1}}}if((g|0)!=0){n=g;i=j;return n|0}if(b>3.141592653589793){b=b-6.283185307179586}d=+T(l);o=+S(l);l=+h[k>>3]/+Q(1.0- +h[k+32>>3]*d*d);h[a>>3]=(l+c)*o*+S(b);h[e>>3]=(l+c)*o*+T(b);h[f>>3]=(l*(1.0- +h[k+32>>3])+c)*d;n=g;i=j;return n|0}function ml(a,b,c,d,e,f,g){a=a|0;b=+b;c=+c;d=+d;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0;j=i;k=a;l=b;b=c;c=d;a=e;e=f;f=g;g=0;d=+Q(l*l+b*b);m=+Q(l*l+b*b+c*c);do{if(d/+h[k>>3]<1.0e-12){g=1;h[e>>3]=0.0;if(m/+h[k>>3]>=1.0e-12){break}h[a>>3]=1.5707963267948966;h[f>>3]=-0.0- +h[k+8>>3];i=j;return}else{h[e>>3]=+Y(+b,+l)}}while(0);l=c/m;b=d/m;m=1.0/+Q(1.0- +h[k+32>>3]*(2.0- +h[k+32>>3])*b*b);n=b*(1.0- +h[k+32>>3])*m;o=l*m;e=0;do{e=e+1|0;p=+h[k>>3]/+Q(1.0- +h[k+32>>3]*o*o);h[f>>3]=d*n+c*o-p*(1.0- +h[k+32>>3]*o*o);q=+h[k+32>>3]*p/(p+ +h[f>>3]);m=1.0/+Q(1.0-q*(2.0-q)*b*b);r=b*(1.0-q)*m;s=l*m;q=s*n-r*o;n=r;o=s;if(q*q>1.0e-24){t=(e|0)<30}else{t=0}}while(t);h[a>>3]=+X(s/+P(+r));i=j;return}function nl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,p=0,r=0,s=0,t=0.0,u=0,v=0;f=i;i=i+96|0;g=b;b=i;i=i+16|0;c[b>>2]=c[g>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];c[b+12>>2]=c[g+12>>2];g=f|0;j=f+16|0;k=f+32|0;l=f+48|0;m=f+64|0;n=f+80|0;p=e;if(+h[b>>3]==q){e=a;r=b;c[e>>2]=c[r>>2];c[e+4>>2]=c[r+4>>2];c[e+8>>2]=c[r+8>>2];c[e+12>>2]=c[r+12>>2];i=f;return}r=j;e=b;c[r>>2]=c[e>>2];c[r+4>>2]=c[e+4>>2];c[r+8>>2]=c[e+8>>2];c[r+12>>2]=c[e+12>>2];e=j|0;h[e>>3]=+h[e>>3]- +h[p+80>>3];e=j+8|0;h[e>>3]=+h[e>>3]- +h[p+88>>3];h[j>>3]=+hl(+h[j>>3]-3.141592653589793)+3.141592653589793;tl(k,j,p);e=g;r=k;c[e>>2]=c[r>>2];c[e+4>>2]=c[r+4>>2];c[e+8>>2]=c[r+8>>2];c[e+12>>2]=c[r+12>>2];do{if((d|0)!=0){r=9;if(+h[g>>3]==q){e=a;k=g;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];c[e+12>>2]=c[k+12>>2];i=f;return}h[g>>3]=+h[j>>3]+ +h[g>>3];h[g+8>>3]=+h[j+8>>3]- +h[g+8>>3];do{tl(n,g,p);k=l;e=n;c[k>>2]=c[e>>2];c[k+4>>2]=c[e+4>>2];c[k+8>>2]=c[e+8>>2];c[k+12>>2]=c[e+12>>2];if(+h[l>>3]==q){s=8;break}t=+h[g>>3]- +h[l>>3]- +h[j>>3];h[m>>3]=t;e=g|0;h[e>>3]=+h[e>>3]-t;t=+h[g+8>>3]+ +h[l+8>>3]- +h[j+8>>3];h[m+8>>3]=t;e=g+8|0;h[e>>3]=+h[e>>3]-t;e=r;r=e-1|0;do{if((e|0)!=0){if(+P(+(+h[m>>3]))<=1.0e-12){u=0;break}u=+P(+(+h[m+8>>3]))>1.0e-12}else{u=0}}while(0)}while(u);if((s|0)==8){if((hb(16352)|0)!=0){wa(c[o>>2]|0,20664,(v=i,i=i+1|0,i=i+7&-8,c[v>>2]=0,v)|0)|0;i=v}}if((r|0)>=0){h[b>>3]=+hl(+h[g>>3]+ +h[p+80>>3]);h[b+8>>3]=+h[g+8>>3]+ +h[p+88>>3];break}if((hb(16352)|0)!=0){wa(c[o>>2]|0,18632,(v=i,i=i+1|0,i=i+7&-8,c[v>>2]=0,v)|0)|0;i=v}h[g+8>>3]=q;h[g>>3]=q;e=a;k=g;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];c[e+12>>2]=c[k+12>>2];i=f;return}else{if(+h[g>>3]==q){k=b;e=g;c[k>>2]=c[e>>2];c[k+4>>2]=c[e+4>>2];c[k+8>>2]=c[e+8>>2];c[k+12>>2]=c[e+12>>2]}else{e=b|0;h[e>>3]=+h[e>>3]- +h[g>>3];e=b+8|0;h[e>>3]=+h[e>>3]+ +h[g+8>>3]}}}while(0);g=a;a=b;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=f;return}function ol(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=a;a=b;b=d;Oa(b|0,128,0)|0;d=aa(c[a+112>>2]|0,c[a+116>>2]|0)|0;c[a+120>>2]=om(d<<3)|0;do{if((c[a+120>>2]|0)!=0){if((ab(c[a+120>>2]|0,8,d|0,b|0)|0)!=(d|0)){break}g=1;h=g;i=e;return h|0}}while(0);pm(c[a+120>>2]|0);c[a+120>>2]=0;nm(f,1,16256,(a=i,i=i+1|0,i=i+7&-8,c[a>>2]=0,a)|0);i=a;Cl(f,-38);g=0;h=g;i=e;return h|0}function pl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;f=b;b=om(128)|0;do{if((b|0)!=0){if((ab(b|0,128,1,d|0)|0)!=1){break}do{if((c[b+112>>2]|0)>=1){if((c[b+112>>2]|0)>1e5){break}if((c[b+116>>2]|0)<1){break}if((c[b+116>>2]|0)>1e5){break}g=(nn(b|0)|0)-1|0;while(1){if((g|0)<=0){break}if((a[b+g|0]|0)!=10){if((a[b+g|0]|0)!=32){h=14;break}}a[b+g|0]=0;g=g-1|0}c[b+120>>2]=0;j=b;k=j;i=e;return k|0}}while(0);Cl(f,-38);j=0;k=j;i=e;return k|0}}while(0);Cl(f,-38);j=0;k=j;i=e;return k|0}function ql(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=a;a=b;b=e;Oa(b|0,160,0)|0;e=aa(c[a+112>>2]|0,c[a+116>>2]|0)|0;c[a+120>>2]=om(e<<3)|0;do{if((c[a+120>>2]|0)!=0){if((ab(c[a+120>>2]|0,8,e|0,b|0)|0)!=(e|0)){break}if((d[13200]|0|0)!=1){rl(c[a+120>>2]|0,4,e<<1)}h=1;j=h;i=f;return j|0}}while(0);pm(c[a+120>>2]|0);c[a+120>>2]=0;if((hb(20648)|0)!=0){wa(c[o>>2]|0,18568,(a=i,i=i+1|0,i=i+7&-8,c[a>>2]=0,a)|0)|0;i=a}Cl(g,-38);h=0;j=h;i=f;return j|0}function rl(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=c;c=e;e=b;b=0;while(1){if((b|0)>=(c|0)){break}h=0;while(1){if((h|0)>=((g|0)/2|0|0)){break}j=d[e+h|0]|0;a[e+h|0]=a[e+(g-h-1)|0]|0;a[e+(g-h-1)|0]=j;h=h+1|0}e=e+g|0;b=b+1|0}i=f;return}function sl(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+160|0;g=f|0;h=b;if((ab(g|0,160,1,e|0)|0)!=1){Cl(h,-38);j=0;k=j;i=f;return k|0}if((d[13200]|0)!=1){rl(g+96|0,8,4);rl(g+128|0,4,2)}if((ma(g|0,17184,9)|0)!=0){nm(h,1,16232,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;Cl(h,-38);j=0;k=j;i=f;return k|0}e=om(128)|0;if((e|0)==0){Cl(h,-38);j=0;k=j;i=f;return k|0}mn(e|0,g+16|0,80)|0;mn(e+80|0,g+96|0,8)|0;mn(e+88|0,g+104|0,8)|0;mn(e+96|0,g+112|0,8)|0;mn(e+104|0,g+120|0,8)|0;b=e+112|0;l=g+128|0;a[b]=a[l]|0;a[b+1|0]=a[l+1|0]|0;a[b+2|0]=a[l+2|0]|0;a[b+3|0]=a[l+3|0]|0;l=e+116|0;b=g+132|0;a[l]=a[b]|0;a[l+1|0]=a[b+1|0]|0;a[l+2|0]=a[b+2|0]|0;a[l+3|0]=a[b+3|0]|0;do{if((c[e+112>>2]|0)>=1){if((c[e+112>>2]|0)>1e5){break}if((c[e+116>>2]|0)<1){break}if((c[e+116>>2]|0)>1e5){break}b=(nn(e|0)|0)-1|0;while(1){if((b|0)<=0){break}if((a[e+b|0]|0)!=10){if((a[e+b|0]|0)!=32){l=19;break}}a[e+b|0]=0;b=b-1|0}c[e+120>>2]=0;j=e;k=j;i=f;return k|0}}while(0);Cl(h,-38);j=0;k=j;i=f;return k|0}function tl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,j=0,k=0,l=0,m=0.0,n=0,o=0,p=0.0,r=0.0,s=0.0,t=0.0;e=i;i=i+40|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;j=e+16|0;k=e+32|0;l=d;d=b|0;m=+h[d>>3]/+h[l+96>>3];h[d>>3]=m;c[k>>2]=~~+O(m);d=b+8|0;m=+h[d>>3]/+h[l+104>>3];h[d>>3]=m;c[k+4>>2]=~~+O(m);h[j>>3]=+h[b>>3]- +(c[k>>2]|0);h[j+8>>3]=+h[b+8>>3]- +(c[k+4>>2]|0);h[f+8>>3]=q;h[f>>3]=q;a:do{if((c[k>>2]|0)<0){do{if((c[k>>2]|0)==-1){if(+h[j>>3]<=.99999999999){break}b=k|0;c[b>>2]=(c[b>>2]|0)+1;h[j>>3]=0.0;break a}}while(0);b=a;d=f;c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];i=e;return}else{d=(c[k>>2]|0)+1|0;n=d;b:do{if((d|0)>=(c[l+112>>2]|0)){do{if((n|0)==(c[l+112>>2]|0)){if(+h[j>>3]>=1.0e-11){break}b=k|0;c[b>>2]=(c[b>>2]|0)-1;h[j>>3]=1.0;break b}}while(0);b=a;o=f;c[b>>2]=c[o>>2];c[b+4>>2]=c[o+4>>2];c[b+8>>2]=c[o+8>>2];c[b+12>>2]=c[o+12>>2];i=e;return}}while(0)}}while(0);c:do{if((c[k+4>>2]|0)<0){do{if((c[k+4>>2]|0)==-1){if(+h[j+8>>3]<=.99999999999){break}d=k+4|0;c[d>>2]=(c[d>>2]|0)+1;h[j+8>>3]=0.0;break c}}while(0);d=a;o=f;c[d>>2]=c[o>>2];c[d+4>>2]=c[o+4>>2];c[d+8>>2]=c[o+8>>2];c[d+12>>2]=c[o+12>>2];i=e;return}else{o=(c[k+4>>2]|0)+1|0;n=o;d:do{if((o|0)>=(c[l+116>>2]|0)){do{if((n|0)==(c[l+116>>2]|0)){if(+h[j+8>>3]>=1.0e-11){break}d=k+4|0;c[d>>2]=(c[d>>2]|0)-1;h[j+8>>3]=1.0;break d}}while(0);d=a;b=f;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];i=e;return}}while(0)}}while(0);n=aa(c[k+4>>2]|0,c[l+112>>2]|0)|0;o=n+(c[k>>2]|0)|0;k=o;o=k+1|0;n=(c[l+120>>2]|0)+(k<<3)|0;k=(c[l+120>>2]|0)+(o<<3)|0;o=o+(c[l+112>>2]|0)|0;b=o;o=b-1|0;d=(c[l+120>>2]|0)+(b<<3)|0;b=(c[l+120>>2]|0)+(o<<3)|0;m=+h[j>>3];p=m;r=m;m=1.0- +h[j>>3];s=m;t=m;r=r*+h[j+8>>3];s=s*+h[j+8>>3];h[j+8>>3]=1.0- +h[j+8>>3];t=t*+h[j+8>>3];p=p*+h[j+8>>3];h[f>>3]=t*+g[n>>2]+p*+g[k>>2]+s*+g[b>>2]+r*+g[d>>2];h[f+8>>3]=t*+g[n+4>>2]+p*+g[k+4>>2]+s*+g[b+4>>2]+r*+g[d+4>>2];d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=e;return}function ul(a,b,d,e,f,g,j,k,l){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=a;a=b;b=d;d=e;e=f;f=g;g=j;j=k;do{if((a|0)!=0){if((b|0)==0){break}c[p>>2]=0;k=0;a:while(1){if((k|0)>=(e|0)){r=49;break}s=aa(k,f)|0;h[m+8>>3]=+h[j+(s<<3)>>3];h[m>>3]=+h[g+(s<<3)>>3];h[n+8>>3]=q;h[n>>3]=q;t=0;b:while(1){if((t|0)>=(b|0)){break}u=c[a+(t<<2)>>2]|0;v=c[u+16>>2]|0;w=+P(+(+h[v+104>>3]));x=(w+ +P(+(+h[v+96>>3])))/1.0e4;do{if(+h[v+88>>3]-x>+h[m+8>>3]){r=12}else{if(+h[v+80>>3]-x>+h[m>>3]){r=12;break}if(+h[v+88>>3]+ +((c[v+116>>2]|0)-1|0)*+h[v+104>>3]+x<+h[m+8>>3]){r=12;break}if(+h[v+80>>3]+ +((c[v+112>>2]|0)-1|0)*+h[v+96>>3]+x<+h[m>>3]){r=12;break}if((c[u+24>>2]|0)!=0){y=c[u+24>>2]|0;c:while(1){if((y|0)==0){break}z=c[y+16>>2]|0;w=+P(+(+h[z+104>>3]));A=(w+ +P(+(+h[z+96>>3])))/1.0e4;do{if(+h[z+88>>3]-A<=+h[m+8>>3]){if(+h[z+80>>3]-A>+h[m>>3]){break}if(+h[z+88>>3]+ +((c[z+116>>2]|0)-1|0)*+h[z+104>>3]+A<+h[m+8>>3]){break}if(+h[z+80>>3]+ +((c[z+112>>2]|0)-1|0)*+h[z+96>>3]+A>=+h[m>>3]){r=21;break c}}}while(0);y=c[y+20>>2]|0}if((r|0)==21){r=0}if((y|0)!=0){u=y;v=c[y+16>>2]|0}}if((c[v+120>>2]|0)==0){if((Ol(p,u)|0)==0){r=28;break a}}nl(o,m,d,v);z=n;B=o;c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];c[z+12>>2]=c[B+12>>2];if(+h[n>>3]!=q){r=30;break b}}}while(0);if((r|0)==12){r=0}t=t+1|0}if((r|0)==30){r=0;u=c[5778]|0;c[5778]=u+1;if((u|0)<20){nm(p,3,20552,(C=i,i=i+8|0,c[C>>2]=v,C)|0);i=C}}if(+h[n>>3]==q){if((c[p+4>>2]|0)>=2){x=+h[j+(s<<3)>>3]*57.29577951308232;nm(p,2,18456,(C=i,i=i+16|0,h[C>>3]=+h[g+(s<<3)>>3]*57.29577951308232,h[C+8>>3]=x,C)|0);i=C;t=0;while(1){if((t|0)>=(b|0)){break}u=c[a+(t<<2)>>2]|0;if((t|0)==0){nm(p,2,17168,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0);i=C}else{nm(p,2,16224,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0);i=C}t=t+1|0}}}else{h[j+(s<<3)>>3]=+h[n+8>>3];h[g+(s<<3)>>3]=+h[n>>3]}k=k+1|0}if((r|0)==28){Cl(p,-38);D=-38;E=D;i=l;return E|0}else if((r|0)==49){D=0;E=D;i=l;return E|0}}}while(0);Cl(p,-38);D=-38;E=D;i=l;return E|0}function vl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=j|0;l=a;a=b;b=d;d=e;e=f;f=g;g=h;a:do{if((c[l+232>>2]|0)==0){h=zl(l)|0;ym(k,c[l>>2]|0,c[l+24>>2]|0,16096);c[l+232>>2]=Ul(h,c[k>>2]|0,l+236|0)|0;do{if((c[l+232>>2]|0)!=0){if((c[l+236>>2]|0)==0){break}break a}}while(0);m=c[c[l>>2]>>2]|0;n=m;i=j;return n|0}}while(0);k=zl(l)|0;m=ul(k,c[l+232>>2]|0,c[l+236>>2]|0,a,b,d,e,f,g)|0;n=m;i=j;return n|0}function wl(b,d,e,f,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0,E=0.0,F=0,G=0,H=0.0,I=0.0,J=0;p=i;i=i+3024|0;r=p|0;s=p+8|0;t=p+24|0;u=b;b=e;e=f;f=j;j=k;k=l;l=m;m=n;n=o;a:do{if((c[b>>2]|0)==0){o=zl(u)|0;ym(r,c[u>>2]|0,c[u+24>>2]|0,d);c[b>>2]=Ul(o,c[r>>2]|0,e)|0;do{if((c[b>>2]|0)!=0){if((c[e>>2]|0)==0){break}break a}}while(0);v=c[c[u>>2]>>2]|0;w=v;i=p;return w|0}}while(0);if((c[e>>2]|0)==0){Cl(c[u>>2]|0,-38);v=-38;w=v;i=p;return w|0}r=c[b>>2]|0;c[c[u>>2]>>2]=0;b=0;b:while(1){if((b|0)>=(j|0)){x=59;break}y=aa(b,k)|0;z=q;h[s+8>>3]=+h[m+(y<<3)>>3];h[s>>3]=+h[l+(y<<3)>>3];A=0;c:while(1){if((A|0)>=(c[e>>2]|0)){break}d=c[r+(A<<2)>>2]|0;B=c[d+16>>2]|0;do{if(+h[B+88>>3]>+h[s+8>>3]){x=16}else{if(+h[B+80>>3]>+h[s>>3]){x=16;break}if(+h[B+88>>3]+ +((c[B+116>>2]|0)-1|0)*+h[B+104>>3]<+h[s+8>>3]){x=16;break}if(+h[B+80>>3]+ +((c[B+112>>2]|0)-1|0)*+h[B+96>>3]<+h[s>>3]){x=16;break}if((c[d+24>>2]|0)!=0){o=c[d+24>>2]|0;d:while(1){if((o|0)==0){break}C=c[o+16>>2]|0;do{if(+h[C+88>>3]<=+h[s+8>>3]){if(+h[C+80>>3]>+h[s>>3]){break}if(+h[C+88>>3]+ +((c[C+116>>2]|0)-1|0)*+h[C+104>>3]<+h[s+8>>3]){break}if(+h[C+80>>3]+ +((c[C+112>>2]|0)-1|0)*+h[C+96>>3]>=+h[s>>3]){x=25;break d}}}while(0);o=c[o+20>>2]|0}if((x|0)==25){x=0}if((o|0)!=0){d=o;B=c[o+16>>2]|0}}if((c[B+120>>2]|0)==0){if((Ol(zl(u)|0,d)|0)==0){x=32;break b}}D=(+h[s>>3]- +h[B+80>>3])/+h[B+96>>3];E=(+h[s+8>>3]- +h[B+88>>3])/+h[B+104>>3];C=~~+O(D);F=~~+O(E);D=D- +(C|0);E=E- +(F|0);G=c[B+120>>2]|0;H=+g[G+(C+(aa(F,c[B+112>>2]|0)|0)<<2)>>2]*(1.0-D)*(1.0-E);I=H+ +g[G+(C+1+(aa(F,c[B+112>>2]|0)|0)<<2)>>2]*D*(1.0-E);H=I+ +g[G+(C+(aa(F+1|0,c[B+112>>2]|0)|0)<<2)>>2]*(1.0-D)*E;z=H+ +g[G+(C+1+(aa(F+1|0,c[B+112>>2]|0)|0)<<2)>>2]*D*E;do{if(z>1.0e3){x=35}else{if(z<-1.0e3){x=35;break}if((f|0)!=0){F=n+(y<<3)|0;h[F>>3]=+h[F>>3]-z}else{F=n+(y<<3)|0;h[F>>3]=+h[F>>3]+z}}}while(0);if((x|0)==35){x=0;z=q}if(z!=q){x=41;break c}}}while(0);if((x|0)==16){x=0}A=A+1|0}if((x|0)==41){x=0;d=c[5776]|0;c[5776]=d+1;if((d|0)<20){nm(c[u>>2]|0,3,16048,(J=i,i=i+8|0,c[J>>2]=B,J)|0);i=J}}if(z==q){x=47;break}b=b+1|0}if((x|0)==32){Cl(c[u>>2]|0,-38);v=-38;w=v;i=p;return w|0}else if((x|0)==47){E=+h[m+(y<<3)>>3]*57.29577951308232;nm(c[u>>2]|0,2,20416,(J=i,i=i+16|0,h[J>>3]=+h[l+(y<<3)>>3]*57.29577951308232,h[J+8>>3]=E,J)|0);i=J;a[t|0]=0;A=0;while(1){if((A|0)>=(c[e>>2]|0)){break}y=c[r+(A<<2)>>2]|0;l=nn(t|0)|0;if((l+(nn(c[y>>2]|0)|0)|0)>>>0>2900>>>0){x=50;break}if((A|0)==0){Ua(t|0,17120,(J=i,i=i+8|0,c[J>>2]=c[y>>2],J)|0)|0;i=J}else{l=t+(nn(t|0)|0)|0;Ua(l|0,16192,(J=i,i=i+8|0,c[J>>2]=c[y>>2],J)|0)|0;i=J}A=A+1|0}if((x|0)==50){pn(t|0,18432)|0}nm(c[u>>2]|0,2,15344,(J=i,i=i+8|0,c[J>>2]=t,J)|0);i=J;Cl(c[u>>2]|0,-48);v=-48;w=v;i=p;return w|0}else if((x|0)==59){v=0;w=v;i=p;return w|0}return 0}function xl(a){a=+a;var b=0,c=0.0,d=0,e=0,f=0;b=i;c=a;d=om(24)|0;e=d;if((d|0)==0){f=e;i=b;return f|0}h[e>>3]=c*.3333333333333333;a=c*c;d=e|0;h[d>>3]=+h[d>>3]+a*.17222222222222222;h[e+8>>3]=a*.06388888888888888;a=a*c;d=e|0;h[d>>3]=+h[d>>3]+a*.10257936507936508;d=e+8|0;h[d>>3]=+h[d>>3]+a*.0664021164021164;h[e+16>>3]=a*.01677689594356261;f=e;i=b;return f|0}function yl(a,b){a=+a;b=b|0;var c=0.0,d=0,e=0.0;c=a;d=b;a=c+c;e=c+ +h[d>>3]*+T(a);c=e+ +h[d+8>>3]*+T(a+a);e=c+ +h[d+16>>3]*+T(a+a+a);i=i;return+e}function zl(a){a=a|0;i=i;return c[a>>2]|0}function Al(){um();if((c[5804]|0)!=0){vm();return 23224}c[5804]=1;c[5806]=0;c[5807]=0;c[5808]=130;c[5809]=0;if((hb(15952)|0)!=0){if((sb(hb(15952)|0)|0)>0){c[5807]=sb(hb(15952)|0)|0}else{c[5807]=3}}vm();return 23224}function Bl(a){a=a|0;i=i;return c[a>>2]|0}function Cl(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=b;c[a>>2]=e;if((e|0)==0){i=d;return}c[5768]=e;i=d;return}function Dl(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;g=i;i=i+128|0;j=g|0;k=g+8|0;l=g+112|0;m=g+120|0;n=b;b=e;e=f;c[e+168>>2]=0;ym(j,n,b,15888);f=c[j>>2]|0;j=f;if((f|0)!=0){f=b;while(1){if((f|0)!=0){o=(c[f>>2]|0)!=0}else{o=0}if(!o){break}f=c[f>>2]|0}o=0;while(1){p=5208+(o<<4)|0;q=d[p]|d[p+1|0]<<8|d[p+2|0]<<16|d[p+3|0]<<24|0;r=q;if((q|0)!=0){s=(Hb(j|0,r|0)|0)!=0}else{s=0}if(!s){break}o=o+1|0}if((r|0)==0){Cl(n,-9);t=1;u=t;i=g;return u|0}r=5216+(o<<4)|0;do{if((d[r]|d[r+1|0]<<8|d[r+2|0]<<16|d[r+3|0]<<24|0)!=0){s=5216+(o<<4)|0;if((nn(d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24|0)|0)>>>0<=0>>>0){break}on(k|0,20352)|0;s=5216+(o<<4)|0;Ia(k|0,d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24|0,80)|0;s=xm(k|0)|0;c[f>>2]=s;f=s}}while(0);k=5212+(o<<4)|0;do{if((d[k]|d[k+1|0]<<8|d[k+2|0]<<16|d[k+3|0]<<24|0)!=0){r=5212+(o<<4)|0;if((nn(d[r]|d[r+1|0]<<8|d[r+2|0]<<16|d[r+3|0]<<24|0)|0)>>>0<=0>>>0){break}r=5212+(o<<4)|0;s=xm(d[r]|d[r+1|0]<<8|d[r+2|0]<<16|d[r+3|0]<<24|0)|0;c[f>>2]=s;f=s}}while(0)}ym(l,n,b,18392);if((c[l>>2]|0)!=0){c[e+168>>2]=3}else{ym(m,n,b,17088);b=c[m>>2]|0;m=b;if((b|0)!=0){b=0;ln(e+176|0,0,56)|0;n=m;n=m;while(1){if((a[n]|0)!=0){v=(b|0)<7}else{v=0}if(!v){break}m=b;b=m+1|0;h[e+176+(m<<3)>>3]=+jn(n);while(1){if((a[n]|0)!=0){w=(a[n]|0)!=44}else{w=0}if(!w){break}n=n+1|0}if((a[n]|0)==44){n=n+1|0}}do{if(+h[e+200>>3]!=0.0){x=42}else{if(+h[e+208>>3]!=0.0){x=42;break}if(+h[e+216>>3]!=0.0){x=42;break}if(+h[e+224>>3]!=0.0){x=42;break}c[e+168>>2]=1}}while(0);if((x|0)==42){c[e+168>>2]=2;x=e+200|0;h[x>>3]=+h[x>>3]*484813681109536.0e-20;x=e+208|0;h[x>>3]=+h[x>>3]*484813681109536.0e-20;x=e+216|0;h[x>>3]=+h[x>>3]*484813681109536.0e-20;h[e+224>>3]=+h[e+224>>3]/1.0e6+1.0}}}t=0;u=t;i=g;return u|0}function El(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,R=0,S=0,U=0,V=0,W=0.0,X=0.0;g=i;i=i+176|0;j=g|0;k=g+8|0;l=g+16|0;m=g+24|0;n=g+32|0;o=g+40|0;p=g+48|0;q=g+56|0;r=g+64|0;s=g+72|0;t=g+80|0;u=g+88|0;v=g+96|0;w=g+104|0;x=g+112|0;y=g+120|0;z=g+128|0;A=g+136|0;B=g+144|0;C=g+152|0;D=g+160|0;E=g+168|0;F=a;a=b;b=e;e=f;G=0.0;f=0;Cl(F,0);h[e>>3]=0.0;h[b>>3]=0.0;ym(j,0,a,15664);do{if((c[j>>2]|0)!=0){ym(k,0,a,20264);h[b>>3]=+h[k>>3]}else{ym(l,0,a,18304);H=c[l>>2]|0;I=H;do{if((H|0)!=0){f=a;while(1){if((f|0)!=0){J=(c[f>>2]|0)!=0}else{J=0}if(!J){break}f=c[f>>2]|0}K=f;L=0;while(1){M=4520+(L<<4)|0;N=d[M]|d[M+1|0]<<8|d[M+2|0]<<16|d[M+3|0]<<24|0;O=N;if((N|0)!=0){R=(Hb(I|0,O|0)|0)!=0}else{R=0}if(!R){break}L=L+1|0}if((O|0)!=0){N=4524+(L<<4)|0;M=xm(d[N]|d[N+1|0]<<8|d[N+2|0]<<16|d[N+3|0]<<24|0)|0;c[K>>2]=M;K=M;M=4528+(L<<4)|0;N=xm(d[M]|d[M+1|0]<<8|d[M+2|0]<<16|d[M+3|0]<<24|0)|0;c[K>>2]=N;K=N;break}Cl(F,-9);S=1;U=S;i=g;return U|0}}while(0);ym(m,0,a,17048);h[b>>3]=+h[m>>3];ym(n,0,a,16088);a:do{if((c[n>>2]|0)!=0){ym(o,0,a,15304);h[e>>3]=+h[o>>3];V=35}else{ym(p,0,a,14656);if((c[p>>2]|0)!=0){ym(q,0,a,14296);W=+h[q>>3];h[e>>3]=W*W}else{ym(r,0,a,13888);do{if((c[r>>2]|0)!=0){ym(s,0,a,13448);h[e>>3]=+h[s>>3];if(+h[e>>3]!=0.0){h[e>>3]=1.0/+h[e>>3];h[e>>3]=+h[e>>3]*(2.0- +h[e>>3]);break}else{Cl(F,-10);break a}}else{ym(t,0,a,22136);if((c[t>>2]|0)!=0){ym(u,0,a,21736);h[e>>3]=+h[u>>3];h[e>>3]=+h[e>>3]*(2.0- +h[e>>3])}else{ym(v,0,a,21304);if((c[v>>2]|0)!=0){ym(w,0,a,20976);G=+h[w>>3];h[e>>3]=1.0-G*G/(+h[b>>3]*+h[b>>3])}}}}while(0)}V=35}}while(0);do{if((V|0)==35){if(G==0.0){G=+h[b>>3]*+Q(1.0- +h[e>>3])}ym(x,0,a,20544);if((c[x>>2]|0)!=0){K=b;h[K>>3]=+h[K>>3]*(1.0- +h[e>>3]*(+h[e>>3]*(+h[e>>3]*.022156084656084655+.04722222222222222)+.16666666666666666));h[e>>3]=0.0}else{ym(y,0,a,20224);if((c[y>>2]|0)!=0){K=b;h[K>>3]=+h[K>>3]*(1.0- +h[e>>3]*(+h[e>>3]*(+h[e>>3]*.04243827160493827+.06944444444444445)+.16666666666666666));h[e>>3]=0.0}else{ym(z,0,a,20032);if((c[z>>2]|0)!=0){h[b>>3]=(+h[b>>3]+G)*.5;h[e>>3]=0.0}else{ym(A,0,a,19896);if((c[A>>2]|0)!=0){h[b>>3]=+Q(+h[b>>3]*G);h[e>>3]=0.0}else{ym(B,0,a,19728);if((c[B>>2]|0)!=0){h[b>>3]=+h[b>>3]*2.0*G/(+h[b>>3]+G);h[e>>3]=0.0}else{ym(C,0,a,19488);K=c[C>>2]|0;L=K;if((K|0)!=0){V=49}else{ym(D,0,a,19320);if((c[D>>2]|0)!=0){V=49}}if((V|0)==49){ym(E,0,a,(L|0)!=0?19144:19016);W=+T(+h[E>>3]);if(+P(+W)>1.5707963267948966){Cl(F,-11);break}W=1.0- +h[e>>3]*W*W;if((L|0)!=0){X=(1.0- +h[e>>3]+W)*.5/(W*+Q(W))}else{X=+Q(1.0- +h[e>>3])/W}K=b;h[K>>3]=+h[K>>3]*X;h[e>>3]=0.0}}}}}}}}while(0);if((f|0)!=0){pm(c[c[f>>2]>>2]|0);pm(c[f>>2]|0);c[f>>2]=0}if((c[F>>2]|0)==0){break}S=1;U=S;i=g;return U|0}}while(0);if(+h[e>>3]<0.0){Cl(F,-12);S=1;U=S;i=g;return U|0}if(+h[b>>3]<=0.0){Cl(F,-13);S=1;U=S;i=g;return U|0}else{S=0;U=S;i=g;return U|0}return 0}function Fl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0,n=0,o=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;k=+P(+(+h[b+8>>3]))-1.5707963267948966;l=k;do{if(k<=1.0e-12){if(+P(+(+h[b>>3]))>10.0){break}c[c[j>>2]>>2]=0;c[5768]=0;c[(wb()|0)>>2]=0;if(+P(+l)<=1.0e-12){h[b+8>>3]=+h[b+8>>3]<0.0?-1.5707963267948966:1.5707963267948966}else{if((c[j+32>>2]|0)!=0){h[b+8>>3]=+X(+h[j+104>>3]*+U(+h[b+8>>3]))}}d=b|0;h[d>>3]=+h[d>>3]- +h[j+112>>3];if((c[j+28>>2]|0)==0){h[b>>3]=+hl(+h[b>>3])}Nb[c[j+4>>2]&511](g,b,j);d=f;m=g;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];c[d+8>>2]=c[m+8>>2];c[d+12>>2]=c[m+12>>2];if((c[c[j>>2]>>2]|0)!=0){h[f+8>>3]=q;h[f>>3]=q}else{h[f>>3]=+h[j+160>>3]*(+h[j+48>>3]*+h[f>>3]+ +h[j+128>>3]);h[f+8>>3]=+h[j+160>>3]*(+h[j+48>>3]*+h[f+8>>3]+ +h[j+136>>3])}n=a;o=f;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];i=e;return}}while(0);h[f+8>>3]=q;h[f>>3]=q;Cl(c[j>>2]|0,-14);n=a;o=f;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];i=e;return}function Gl(a,b,c,d){a=+a;b=+b;c=c|0;d=d|0;var e=0,f=0.0,g=0,j=0,k=0,l=0,m=0.0,n=0.0;e=i;f=a;a=b;g=c;c=_m(32)|0;j=c;if((c|0)==0){k=0;l=k;i=e;return l|0}else{b=f*f;h[j+16>>3]=f;m=+T(a);n=+S(a);n=n*n;h[d>>3]=+Q(1.0-b)/(1.0-b*m*m);h[j>>3]=+Q(b*n*n/(1.0-b)+1.0);h[g>>3]=+W(m/+h[j>>3]);h[j+24>>3]=+h[j>>3]*.5*f;f=+U(+h[g>>3]*.5+.7853981633974483);b=+U(.5*a+.7853981633974483);a=+R(+b,+(+h[j>>3]));h[j+8>>3]=f/(a*+Hl(+h[j+16>>3]*m,+h[j+24>>3]));k=j;l=k;i=e;return l|0}return 0}function Hl(a,b){a=+a;b=+b;var c=0.0;c=a;a=+R(+((1.0-c)/(1.0+c)),+b);i=i;return+a}function Il(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0.0,k=0.0;b=i;i=i+16|0;f=d;d=i;i=i+16|0;c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];c[d+8>>2]=c[f+8>>2];c[d+12>>2]=c[f+12>>2];f=b|0;g=e;j=+U(+h[d+8>>3]*.5+.7853981633974483);k=+h[g+8>>3]*+R(+j,+(+h[g>>3]));j=+h[g+16>>3]*+T(+h[d+8>>3]);h[f+8>>3]=+X(k*+Hl(j,+h[g+24>>3]))*2.0-1.5707963267948966;h[f>>3]=+h[g>>3]*+h[d>>3];d=a;a=f;c[d>>2]=c[a>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];c[d+12>>2]=c[a+12>>2];i=b;return}function Jl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0,l=0.0,m=0,n=0,o=0;f=i;i=i+16|0;g=d;d=i;i=i+16|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];c[d+8>>2]=c[g+8>>2];c[d+12>>2]=c[g+12>>2];g=f|0;j=b;b=e;h[g>>3]=+h[d>>3]/+h[b>>3];k=+U(+h[d+8>>3]*.5+.7853981633974483);l=+R(+(k/+h[b+8>>3]),+(1.0/+h[b>>3]));e=20;while(1){if((e|0)==0){break}k=+h[b+16>>3]*+T(+h[d+8>>3]);h[g+8>>3]=+X(l*+Hl(k,+h[b+16>>3]*-.5))*2.0-1.5707963267948966;if(+P(+(+h[g+8>>3]- +h[d+8>>3]))<1.0e-14){m=4;break}h[d+8>>3]=+h[g+8>>3];e=e-1|0}if((e|0)!=0){n=a;o=g;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];i=f;return}Cl(j,-17);n=a;o=g;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];i=f;return}function Kl(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+40>>2]=1;h[d+128>>3]=0.0;h[d+136>>3]=0.0;c[d+8>>2]=266;c[d+4>>2]=192;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=20;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11360}e=d;f=e;i=b;return f|0}function Ll(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function Ml(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e+8>>3]=+h[b+8>>3];h[e>>3]=+h[b>>3];b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Nl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;d=i;i=i+16|0;e=b;b=i;i=i+16|0;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=d|0;ln(e|0,0,16)|0;h[e>>3]=+h[b>>3];h[e+8>>3]=+h[b+8>>3];b=a;a=e;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=d;return}function Ol(a,b){a=a|0;b=b|0;var e=0,f=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;f=a;a=b;do{if((a|0)!=0){if((c[a+16>>2]|0)==0){break}if((Hb(c[a+8>>2]|0,14864)|0)==0){b=wm(f,c[a+4>>2]|0,20112)|0;if((b|0)==0){Cl(f,-38);j=0;k=j;i=e;return k|0}else{l=ol(f,c[a+16>>2]|0,b)|0;sa(b|0)|0;j=l;k=j;i=e;return k|0}}if((Hb(c[a+8>>2]|0,18160)|0)==0){l=wm(f,c[a+4>>2]|0,20112)|0;if((l|0)==0){Cl(f,-38);j=0;k=j;i=e;return k|0}else{b=ql(f,c[a+16>>2]|0,l)|0;sa(l|0)|0;j=b;k=j;i=e;return k|0}}if((Hb(c[a+8>>2]|0,16952)|0)==0){b=wm(f,c[a+4>>2]|0,20112)|0;if((b|0)==0){Cl(f,-38);j=0;k=j;i=e;return k|0}Oa(b|0,c[a+12>>2]|0,0)|0;l=om(c[(c[a+16>>2]|0)+112>>2]<<3<<1)|0;m=om((aa(c[(c[a+16>>2]|0)+112>>2]|0,c[(c[a+16>>2]|0)+116>>2]|0)|0)<<3)|0;c[(c[a+16>>2]|0)+120>>2]=m;do{if((l|0)!=0){if((c[(c[a+16>>2]|0)+120>>2]|0)==0){break}m=0;while(1){if((m|0)>=(c[(c[a+16>>2]|0)+116>>2]|0)){n=30;break}o=ab(l|0,8,c[(c[a+16>>2]|0)+112>>2]<<1|0,b|0)|0;if((o|0)!=(c[(c[a+16>>2]|0)+112>>2]<<1|0)){n=21;break}if((d[13192]|0|0)==1){Pl(l,8,c[(c[a+16>>2]|0)+112>>2]<<1)}o=l;p=0;while(1){if((p|0)>=(c[(c[a+16>>2]|0)+112>>2]|0)){break}q=(c[(c[a+16>>2]|0)+120>>2]|0)+((aa(m,c[(c[a+16>>2]|0)+112>>2]|0)|0)<<3)|0;r=q+((c[(c[a+16>>2]|0)+112>>2]|0)-p-1<<3)|0;q=o;o=q+8|0;g[r+4>>2]=+h[q>>3]*484813681109536.0e-20;q=o;o=q+8|0;g[r>>2]=+h[q>>3]*484813681109536.0e-20;p=p+1|0}m=m+1|0}if((n|0)==21){pm(l);pm(c[(c[a+16>>2]|0)+120>>2]|0);Cl(f,-38);j=0;k=j;i=e;return k|0}else if((n|0)==30){pm(l);sa(b|0)|0;j=1;k=j;i=e;return k|0}}}while(0);Cl(f,-38);j=0;k=j;i=e;return k|0}if((Hb(c[a+8>>2]|0,16008)|0)!=0){if((Hb(c[a+8>>2]|0,14592)|0)!=0){j=0;k=j;i=e;return k|0}b=aa(c[(c[a+16>>2]|0)+112>>2]|0,c[(c[a+16>>2]|0)+116>>2]|0)|0;l=wm(f,c[a+4>>2]|0,20112)|0;if((l|0)==0){Cl(f,-38);j=0;k=j;i=e;return k|0}Oa(l|0,c[a+12>>2]|0,0)|0;m=om(b<<2)|0;c[(c[a+16>>2]|0)+120>>2]=m;if((c[(c[a+16>>2]|0)+120>>2]|0)==0){Cl(f,-38);j=0;k=j;i=e;return k|0}if((ab(c[(c[a+16>>2]|0)+120>>2]|0,4,b|0,l|0)|0)!=(b|0)){pm(c[(c[a+16>>2]|0)+120>>2]|0);c[(c[a+16>>2]|0)+120>>2]=0;j=0;k=j;i=e;return k|0}if((d[13192]|0|0)==1){Pl(c[(c[a+16>>2]|0)+120>>2]|0,4,b)}sa(l|0)|0;j=1;k=j;i=e;return k|0}nm(f,3,15192,(l=i,i=i+8|0,c[l>>2]=c[a+16>>2],l)|0);i=l;l=wm(f,c[a+4>>2]|0,20112)|0;if((l|0)==0){Cl(f,-38);j=0;k=j;i=e;return k|0}Oa(l|0,c[a+12>>2]|0,0)|0;b=om(c[(c[a+16>>2]|0)+112>>2]<<2<<2)|0;m=om((aa(c[(c[a+16>>2]|0)+112>>2]|0,c[(c[a+16>>2]|0)+116>>2]|0)|0)<<3)|0;c[(c[a+16>>2]|0)+120>>2]=m;do{if((b|0)!=0){if((c[(c[a+16>>2]|0)+120>>2]|0)==0){break}m=0;while(1){if((m|0)>=(c[(c[a+16>>2]|0)+116>>2]|0)){n=49;break}p=ab(b|0,4,c[(c[a+16>>2]|0)+112>>2]<<2|0,l|0)|0;if((p|0)!=(c[(c[a+16>>2]|0)+112>>2]<<2|0)){n=40;break}if((d[13192]|0|0)!=1){Pl(b,4,c[(c[a+16>>2]|0)+112>>2]<<2)}p=b;o=0;while(1){if((o|0)>=(c[(c[a+16>>2]|0)+112>>2]|0)){break}q=(c[(c[a+16>>2]|0)+120>>2]|0)+((aa(m,c[(c[a+16>>2]|0)+112>>2]|0)|0)<<3)|0;r=q+((c[(c[a+16>>2]|0)+112>>2]|0)-o-1<<3)|0;q=p;p=q+4|0;g[r+4>>2]=+g[q>>2]*484813681109536.0e-20;q=p;p=q+4|0;g[r>>2]=+g[q>>2]*484813681109536.0e-20;p=p+8|0;o=o+1|0}m=m+1|0}if((n|0)==40){pm(b);pm(c[(c[a+16>>2]|0)+120>>2]|0);c[(c[a+16>>2]|0)+120>>2]=0;Cl(f,-38);j=0;k=j;i=e;return k|0}else if((n|0)==49){pm(b);sa(l|0)|0;j=1;k=j;i=e;return k|0}}}while(0);Cl(f,-38);j=0;k=j;i=e;return k|0}}while(0);j=0;k=j;i=e;return k|0}function Pl(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=b;b=c;c=e;e=0;while(1){if((e|0)>=(c|0)){break}h=0;while(1){if((h|0)>=((b|0)/2|0|0)){break}j=d[g+h|0]|0;a[g+h|0]=a[g+(b-h-1)|0]|0;a[g+(b-h-1)|0]=j;h=h+1|0}g=g+b|0;e=e+1|0}i=f;return}function Ql(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0;d=i;i=i+1192|0;e=d|0;f=d+1032|0;g=a;a=b;c[5768]=0;c[(wb()|0)>>2]=0;c[g>>2]=0;b=om(28)|0;ln(b|0,0,28)|0;c[b>>2]=Ya(a|0)|0;c[b+4>>2]=0;c[b+8>>2]=14256;c[b+12>>2]=0;c[b+16>>2]=0;c[b+20>>2]=0;on(e|0,a|0)|0;j=wm(g,e|0,20112)|0;k=j;if((j|0)==0){c[g>>2]=0;l=b;m=l;i=d;return m|0}c[b+4>>2]=Ya(e|0)|0;if((ab(f|0,160,1,k|0)|0)!=1){sa(k|0)|0;Cl(g,-38);l=b;m=l;i=d;return m|0}Oa(k|0,0,0)|0;do{if((ma(f|0,13808,6)|0)==0){if((ma(f+96|0,13400,6)|0)!=0){n=9;break}if((ma(f+144|0,22080,16)|0)!=0){n=9;break}Rl(g,k,b)|0}else{n=9}}while(0);if((n|0)==9){do{if((ma(f|0,21680,8)|0)==0){if((ma(f+48|0,21256,7)|0)!=0){n=12;break}Sl(g,k,b)|0}else{n=12}}while(0);if((n|0)==12){do{if((nn(a|0)|0)>>>0>4>>>0){if((Hb(a+(nn(a|0)|0)-3|0,14592)|0)!=0){if((Hb(a+(nn(a|0)|0)-3|0,20944)|0)!=0){n=16;break}}Tl(g,k,b)|0}else{n=16}}while(0);if((n|0)==16){if((ma(f|0,20384,9)|0)==0){f=sl(g,k)|0;c[b+8>>2]=18160;c[b+16>>2]=f;n=c[f+112>>2]|0;a=c[f+116>>2]|0;o=+h[f+80>>3]*57.29577951308232;p=+h[f+88>>3]*57.29577951308232;q=(+h[f+80>>3]+ +((c[f+112>>2]|0)-1|0)*+h[f+96>>3])*57.29577951308232;r=(+h[f+88>>3]+ +((c[f+116>>2]|0)-1|0)*+h[f+104>>3])*57.29577951308232;nm(g,2,20152,(s=i,i=i+56|0,c[s>>2]=f,c[s+8>>2]=n,c[s+16>>2]=a,h[s+24>>3]=o,h[s+32>>3]=p,h[s+40>>3]=q,h[s+48>>3]=r,s)|0);i=s}else{a=pl(g,k)|0;c[b+8>>2]=14864;c[b+16>>2]=a;n=c[a+112>>2]|0;f=c[a+116>>2]|0;r=+h[a+80>>3]*57.29577951308232;q=+h[a+88>>3]*57.29577951308232;p=(+h[a+80>>3]+ +((c[a+112>>2]|0)-1|0)*+h[a+96>>3])*57.29577951308232;o=(+h[a+88>>3]+ +((c[a+116>>2]|0)-1|0)*+h[a+104>>3])*57.29577951308232;nm(g,2,19968,(s=i,i=i+56|0,c[s>>2]=a,c[s+8>>2]=n,c[s+16>>2]=f,h[s+24>>3]=r,h[s+32>>3]=q,h[s+40>>3]=p,h[s+48>>3]=o,s)|0);i=s}}}}sa(k|0)|0;l=b;m=l;i=d;return m|0}function Rl(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0;f=i;i=i+192|0;g=f|0;j=f+176|0;k=a;a=b;b=e;if((ab(g|0,176,1,a|0)|0)!=1){Cl(k,-38);l=0;m=l;i=f;return m|0}if((d[13192]|0|0)==1){Pl(g+8|0,4,1);Pl(g+24|0,8,1);Pl(g+40|0,8,1);Pl(g+56|0,8,1);Pl(g+72|0,8,1);Pl(g+88|0,8,1);Pl(g+104|0,8,1)}if((c[g+8>>2]|0)!=12){nm(k,1,18056,(n=i,i=i+1|0,i=i+7&-8,c[n>>2]=0,n)|0);i=n;Cl(k,-38);l=0;m=l;i=f;return m|0}else{e=om(128)|0;on(e|0,17944)|0;h[e+80>>3]=-0.0- +h[g+72>>3];h[e+88>>3]=+h[g+24>>3];h[j>>3]=-0.0- +h[g+56>>3];h[j+8>>3]=+h[g+40>>3];h[e+96>>3]=+h[g+104>>3];h[e+104>>3]=+h[g+88>>3];o=+P(+(+h[j>>3]- +h[e+80>>3]));c[e+112>>2]=~~(o/+h[e+96>>3]+.5)+1;o=+P(+(+h[j+8>>3]- +h[e+88>>3]));c[e+116>>2]=~~(o/+h[e+104>>3]+.5)+1;g=c[e+116>>2]|0;o=+h[e+80>>3];p=+h[e+88>>3];q=+h[j>>3];r=+h[j+8>>3];nm(k,3,17824,(n=i,i=i+48|0,c[n>>2]=c[e+112>>2],c[n+8>>2]=g,h[n+16>>3]=o,h[n+24>>3]=p,h[n+32>>3]=q,h[n+40>>3]=r,n)|0);i=n;n=e+80|0;h[n>>3]=+h[n>>3]*.017453292519943295;n=e+88|0;h[n>>3]=+h[n>>3]*.017453292519943295;n=e+96|0;h[n>>3]=+h[n>>3]*.017453292519943295;n=e+104|0;h[n>>3]=+h[n>>3]*.017453292519943295;c[e+120>>2]=0;c[b+16>>2]=e;c[b+12>>2]=Sa(a|0)|0;c[b+8>>2]=16952;l=1;m=l;i=f;return m|0}return 0}function Sl(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0;g=i;i=i+208|0;j=g|0;k=g+176|0;l=g+184|0;m=g+200|0;n=b;b=e;e=f;if((ab(j|0,176,1,b|0)|0)!=1){Cl(n,-38);o=0;p=o;i=g;return p|0}if((d[13192]|0|0)!=1){Pl(j+8|0,4,1);Pl(j+24|0,4,1);Pl(j+40|0,4,1);Pl(j+120|0,8,1);Pl(j+136|0,8,1);Pl(j+152|0,8,1);Pl(j+168|0,8,1)}f=k;q=j+40|0;a[f]=a[q]|0;a[f+1|0]=a[q+1|0]|0;a[f+2|0]=a[q+2|0]|0;a[f+3|0]=a[q+3|0]|0;q=0;while(1){if((q|0)>=(c[k>>2]|0)){r=48;break}if((ab(j|0,176,1,b|0)|0)!=1){r=8;break}if((ma(j|0,19120,8)|0)!=0){r=10;break}if((d[13192]|0|0)!=1){Pl(j+72|0,8,1);Pl(j+88|0,8,1);Pl(j+104|0,8,1);Pl(j+120|0,8,1);Pl(j+136|0,8,1);Pl(j+152|0,8,1);Pl(j+168|0,4,1)}s=om(128)|0;qn(s|0,j+8|0,8)|0;a[s+8|0]=0;h[s+80>>3]=-0.0- +h[j+120>>3];h[s+88>>3]=+h[j+72>>3];h[l>>3]=-0.0- +h[j+104>>3];h[l+8>>3]=+h[j+88>>3];h[s+96>>3]=+h[j+152>>3];h[s+104>>3]=+h[j+136>>3];t=+P(+(+h[l>>3]- +h[s+80>>3]));c[s+112>>2]=~~(t/+h[s+96>>3]+.5)+1;t=+P(+(+h[l+8>>3]- +h[s+88>>3]));c[s+116>>2]=~~(t/+h[s+104>>3]+.5)+1;f=c[s+112>>2]|0;u=c[s+116>>2]|0;t=+h[s+80>>3]/3600.0;v=+h[s+88>>3]/3600.0;w=+h[l>>3]/3600.0;x=+h[l+8>>3]/3600.0;nm(n,3,18952,(y=i,i=i+56|0,c[y>>2]=s,c[y+8>>2]=f,c[y+16>>2]=u,h[y+24>>3]=t,h[y+32>>3]=v,h[y+40>>3]=w,h[y+48>>3]=x,y)|0);i=y;u=s+80|0;h[u>>3]=+h[u>>3]*484813681109536.0e-20;u=s+88|0;h[u>>3]=+h[u>>3]*484813681109536.0e-20;u=s+96|0;h[u>>3]=+h[u>>3]*484813681109536.0e-20;u=s+104|0;h[u>>3]=+h[u>>3]*484813681109536.0e-20;u=m;f=j+168|0;a[u]=a[f]|0;a[u+1|0]=a[f+1|0]|0;a[u+2|0]=a[f+2|0]|0;a[u+3|0]=a[f+3|0]|0;if((c[m>>2]|0)!=(aa(c[s+112>>2]|0,c[s+116>>2]|0)|0)){r=14;break}c[s+120>>2]=0;if((q|0)==0){z=e}else{z=om(28)|0;ln(z|0,0,28)|0;c[z>>2]=Ya(c[e>>2]|0)|0;c[z+4>>2]=Ya(c[e+4>>2]|0)|0;c[z+20>>2]=0}c[z+16>>2]=s;c[z+8>>2]=16008;c[z+12>>2]=Sa(b|0)|0;if((ma(j+24|0,18424,4)|0)==0){if((z|0)!=(e|0)){f=e;while(1){if((c[f+20>>2]|0)==0){break}f=c[f+20>>2]|0}c[f+20>>2]=z}}else{u=e;while(1){if((u|0)!=0){A=(ma(c[u+16>>2]|0,j+24|0,8)|0)!=0}else{A=0}if(!A){break}u=c[u+20>>2]|0}if((u|0)==0){f=c[z+16>>2]|0;nm(n,1,18208,(y=i,i=i+16|0,c[y>>2]=j+24,c[y+8>>2]=f,y)|0);i=y;B=u;while(1){if((c[B+20>>2]|0)==0){break}B=c[B+20>>2]|0}c[B+20>>2]=z}else{if((c[u+24>>2]|0)==0){c[u+24>>2]=z}else{B=c[u+24>>2]|0;while(1){if((c[B+20>>2]|0)==0){break}B=c[B+20>>2]|0}c[B+20>>2]=z}}}Oa(b|0,c[m>>2]<<4|0,1)|0;q=q+1|0}if((r|0)==8){Cl(n,-38);o=0;p=o;i=g;return p|0}else if((r|0)==10){Cl(n,-38);o=0;p=o;i=g;return p|0}else if((r|0)==14){q=c[s+112>>2]|0;b=c[s+116>>2]|0;z=aa(c[s+112>>2]|0,c[s+116>>2]|0)|0;nm(n,1,18768,(y=i,i=i+32|0,c[y>>2]=c[m>>2],c[y+8>>2]=q,c[y+16>>2]=b,c[y+24>>2]=z,y)|0);i=y;Cl(n,-38);o=0;p=o;i=g;return p|0}else if((r|0)==48){o=1;p=o;i=g;return p|0}return 0}function Tl(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0;g=i;i=i+88|0;j=g|0;k=g+40|0;l=g+48|0;m=g+56|0;n=g+64|0;o=g+72|0;p=g+80|0;q=b;b=f;if((ab(j|0,40,1,e|0)|0)!=1){Cl(q,-38);r=0;s=r;i=g;return s|0}if((d[13192]|0|0)==1){Pl(j|0,8,4);Pl(j+32|0,4,2)}mn(l|0,j|0,8)|0;mn(k|0,j+8|0,8)|0;mn(n|0,j+16|0,8)|0;mn(m|0,j+24|0,8)|0;e=o;f=j+32|0;a[e]=a[f]|0;a[e+1|0]=a[f+1|0]|0;a[e+2|0]=a[f+2|0]|0;a[e+3|0]=a[f+3|0]|0;f=p;e=j+36|0;a[f]=a[e]|0;a[f+1|0]=a[e+1|0]|0;a[f+2|0]=a[e+2|0]|0;a[f+3|0]=a[e+3|0]|0;do{if(+h[k>>3]>=-360.0){if(+h[k>>3]>360.0){break}if(+h[l>>3]<-90.0){break}if(+h[l>>3]>90.0){break}e=om(128)|0;on(e|0,19664)|0;h[e+80>>3]=+h[k>>3];h[e+88>>3]=+h[l>>3];h[e+96>>3]=+h[m>>3];h[e+104>>3]=+h[n>>3];c[e+112>>2]=c[p>>2];c[e+116>>2]=c[o>>2];if(+h[e+80>>3]>=180.0){f=e+80|0;h[f>>3]=+h[f>>3]-360.0}do{if(+h[e+80>>3]>=0.0){if(+h[e+80>>3]+ +h[e+96>>3]*+(c[e+112>>2]|0)<=180.0){break}nm(q,2,19416,(t=i,i=i+1|0,i=i+7&-8,c[t>>2]=0,t)|0);i=t}}while(0);f=c[e+116>>2]|0;u=+h[e+80>>3];v=+h[e+88>>3];w=+h[e+80>>3]+ +((c[p>>2]|0)-1|0)*+h[m>>3];x=+h[e+88>>3]+ +((c[o>>2]|0)-1|0)*+h[n>>3];nm(q,3,19248,(t=i,i=i+48|0,c[t>>2]=c[e+112>>2],c[t+8>>2]=f,h[t+16>>3]=u,h[t+24>>3]=v,h[t+32>>3]=w,h[t+40>>3]=x,t)|0);i=t;f=e+80|0;h[f>>3]=+h[f>>3]*.017453292519943295;f=e+88|0;h[f>>3]=+h[f>>3]*.017453292519943295;f=e+96|0;h[f>>3]=+h[f>>3]*.017453292519943295;f=e+104|0;h[f>>3]=+h[f>>3]*.017453292519943295;c[e+120>>2]=0;c[b+16>>2]=e;c[b+12>>2]=40;c[b+8>>2]=14592;r=1;s=r;i=g;return s|0}}while(0);nm(q,1,19840,(t=i,i=i+1|0,i=i+7&-8,c[t>>2]=0,t)|0);i=t;Cl(q,-38);r=0;s=r;i=g;return s|0}function Ul(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+144|0;g=f|0;h=f+8|0;j=f+16|0;k=b;b=e;c[g>>2]=0;c[h>>2]=0;c[5768]=0;c[b>>2]=0;um();e=d;while(1){if((a[e]|0)==0){l=20;break}d=1;if((a[e]|0)==64){d=0;e=e+1|0}m=0;while(1){if((a[e+m|0]|0)!=0){n=(a[e+m|0]|0)!=44}else{n=0}if(!n){break}m=m+1|0}if(m>>>0>=128>>>0){l=12;break}qn(j|0,e|0,m|0)|0;a[j+m|0]=0;e=e+m|0;if((a[e]|0)==44){e=e+1|0}if((Vl(k,j|0,g,b,h)|0)==0){if((d|0)!=0){l=17;break}}c[5768]=0}if((l|0)==12){Cl(k,-38);vm();o=0;p=o;i=f;return p|0}else if((l|0)==17){Cl(k,-38);vm();o=0;p=o;i=f;return p|0}else if((l|0)==20){vm();o=c[g>>2]|0;p=o;i=f;return p|0}return 0}function Vl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;h=a;a=b;b=d;d=e;e=f;f=0;j=0;k=c[5802]|0;while(1){if((k|0)==0){break}if((Hb(c[k>>2]|0,a|0)|0)==0){f=1;if((c[k+16>>2]|0)==0){l=5;break}if((c[d>>2]|0)>=((c[e>>2]|0)-2|0)){m=(c[e>>2]|0)+20|0;n=om(m<<2)|0;if((c[b>>2]|0)!=0){mn(n|0,c[b>>2]|0,c[e>>2]<<2)|0;pm(c[b>>2]|0)}c[b>>2]=n;c[e>>2]=m}m=d;n=c[m>>2]|0;c[m>>2]=n+1;c[(c[b>>2]|0)+(n<<2)>>2]=k;c[(c[b>>2]|0)+(c[d>>2]<<2)>>2]=0}j=k;k=c[k+20>>2]|0}if((l|0)==5){o=0;p=o;i=g;return p|0}if((f|0)!=0){o=1;p=o;i=g;return p|0}k=Ql(h,a)|0;if((k|0)==0){ya(14728,20080,137,22416);return 0}if((j|0)!=0){c[j+20>>2]=k}else{c[5802]=k}o=Vl(h,a,b,d,e)|0;p=o;i=g;return p|0}function Wl(a){a=a|0;var b=0,c=0;b=i;c=Xl(Al()|0,a)|0;i=b;return c|0}function Xl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+800|0;f=e|0;g=b;b=d;d=0;h=0;j=om((nn(b|0)|0)+1|0)|0;on(j|0,b|0)|0;b=0;while(1){if((a[j+b|0]|0)==0){k=23;break}l=a[j+b|0]|0;if((l|0)==43){do{if((b|0)==0){k=7}else{if((a[j+(b-1)|0]|0)==0){k=7;break}if((h|0)>0){k=7}}}while(0);if((k|0)==7){k=0;if((h|0)>0){a[j+(b-h)|0]=0;h=0}if((d+1|0)==200){k=10;break}m=d;d=m+1|0;c[f+(m<<2)>>2]=j+b+1}}else if((l|0)==32|(l|0)==9|(l|0)==10){do{if((b|0)==0){k=17}else{if((a[j+(b-1)|0]|0)==0){k=17;break}if((d|0)==0){k=17;break}if((c[f+(d-1<<2)>>2]|0)==(j+b|0)){k=17;break}h=h+1|0}}while(0);if((k|0)==17){k=0;a[j+b|0]=0}}else{h=0}b=b+1|0}if((k|0)==10){Cl(g,-44);n=0;o=n;i=e;return o|0}else if((k|0)==23){a[j+(b-h)|0]=0;h=Yl(g,d,f|0)|0;pm(j);n=h;o=n;i=e;return o|0}return 0}function Yl(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0.0,ba=0,ca=0,da=0;g=i;i=i+240|0;j=g|0;k=g+8|0;l=g+16|0;m=g+24|0;n=g+32|0;o=g+40|0;p=g+48|0;q=g+56|0;r=g+64|0;s=g+72|0;t=g+80|0;u=g+88|0;v=g+96|0;w=g+104|0;x=g+112|0;y=g+120|0;z=g+128|0;A=g+136|0;B=g+144|0;C=g+152|0;D=g+160|0;E=g+168|0;F=g+176|0;G=g+184|0;H=g+192|0;I=g+200|0;J=g+208|0;K=g+216|0;L=g+224|0;M=g+232|0;N=b;b=e;e=f;c[k>>2]=0;f=0;c[N>>2]=0;c[k>>2]=0;O=Ya(ib(1,0)|0)|0;if((Hb(O|0,14664)|0)!=0){ib(1,14664)|0}a:do{if((b|0)<=0){Cl(N,-1);P=125}else{R=0;while(1){if((R|0)>=(b|0)){break}if((R|0)!=0){S=xm(c[e+(R<<2)>>2]|0)|0;c[T>>2]=S;T=S}else{S=xm(c[e+(R<<2)>>2]|0)|0;T=S;c[k>>2]=S}R=R+1|0}if((c[N>>2]|0)!=0){P=125;break}ym(l,N,c[k>>2]|0,20040);do{if((c[l>>2]|0)!=0){S=T;ym(m,N,c[k>>2]|0,18128);U=Zl(N,k,T,c[m>>2]|0)|0;T=U;if((U|0)==0){P=125;break a}if((T|0)==(S|0)){Cl(N,-2);P=125;break a}else{break}}}while(0);ym(n,N,c[k>>2]|0,16944);S=c[n>>2]|0;U=S;if((S|0)==0){Cl(N,-4);P=125;break}R=0;while(1){S=2416+(R*12|0)|0;V=d[S]|d[S+1|0]<<8|d[S+2|0]<<16|d[S+3|0]<<24|0;c[j>>2]=V;if((V|0)!=0){W=(Hb(U|0,c[j>>2]|0)|0)!=0}else{W=0}if(!W){break}R=R+1|0}if((c[j>>2]|0)==0){Cl(N,-5);P=125;break}ym(o,N,c[k>>2]|0,15984);if((c[o>>2]|0)==0){T=_l(N,k,T,U)|0}V=2420+(R*12|0)|0;S=d[V]|d[V+1|0]<<8|d[V+2|0]<<16|d[V+3|0]<<24|0;V=Kb[S&511](0)|0;f=V;if((V|0)==0){P=125;break}c[f>>2]=N;c[f+24>>2]=c[k>>2];c[f+36>>2]=0;c[f+40>>2]=0;c[f+288>>2]=0;h[f+280>>3]=0.0;on(f+292|0,15184)|0;c[f+232>>2]=0;c[f+236>>2]=0;c[f+244>>2]=0;c[f+248>>2]=0;if((Dl(N,c[k>>2]|0,f)|0)!=0){P=125;break}if((El(N,c[k>>2]|0,f+48|0,f+64|0)|0)!=0){P=125;break}h[f+56>>3]=+h[f+48>>3];h[f+72>>3]=+h[f+64>>3];h[f+80>>3]=+Q(+h[f+64>>3]);h[f+88>>3]=1.0/+h[f+48>>3];h[f+96>>3]=1.0- +h[f+64>>3];if(+h[f+96>>3]==0.0){Cl(N,-6);P=125;break}h[f+104>>3]=1.0/+h[f+96>>3];do{if((c[f+168>>2]|0)==1){if(+h[f+176>>3]!=0.0){break}if(+h[f+184>>3]!=0.0){break}if(+h[f+192>>3]!=0.0){break}if(+h[f+48>>3]!=6378137.0){break}if(+h[f+64>>3]-.00669437999<0.0){X=(+h[f+64>>3]-.00669437999)*-1.0}else{X=+h[f+64>>3]-.00669437999}if(X>=5.0e-11){break}c[f+168>>2]=4}}while(0);if(+h[f+64>>3]!=0.0){ym(p,N,c[k>>2]|0,14584);Y=(c[p>>2]|0)!=0}else{Y=0}c[f+32>>2]=Y&1;ym(q,N,c[k>>2]|0,14248);c[f+28>>2]=c[q>>2];ym(r,N,c[k>>2]|0,13792);c[f+240>>2]=c[r>>2];if((c[f+240>>2]|0)!=0){ym(s,N,c[k>>2]|0,13384)}ym(t,N,c[k>>2]|0,22064);c[f+288>>2]=c[t>>2];if((c[f+288>>2]|0)!=0){ym(u,N,c[k>>2]|0,21656);h[f+280>>3]=+h[u>>3]}ym(v,N,c[k>>2]|0,21232);b:do{if((c[v>>2]|0)!=0){ym(w,N,c[k>>2]|0,21232);V=c[w>>2]|0;if((nn(V|0)|0)!=3){Cl(N,-47);P=125;break a}do{if((Ga(c[1024]|0,a[V|0]|0)|0)!=0){if((Ga(c[1024]|0,a[V+1|0]|0)|0)==0){break}if((Ga(c[1024]|0,a[V+2|0]|0)|0)==0){break}on(f+292|0,V|0)|0;break b}}while(0);Cl(N,-47);P=125;break a}}while(0);ym(x,N,c[k>>2]|0,22064);c[f+288>>2]=c[x>>2];if((c[f+288>>2]|0)!=0){ym(y,N,c[k>>2]|0,21656);h[f+280>>3]=+h[y>>3]}ym(z,N,c[k>>2]|0,20376);h[f+112>>3]=+h[z>>3];ym(A,N,c[k>>2]|0,20144);h[f+120>>3]=+h[A>>3];ym(B,N,c[k>>2]|0,19960);h[f+128>>3]=+h[B>>3];ym(C,N,c[k>>2]|0,19832);h[f+136>>3]=+h[C>>3];ym(D,N,c[k>>2]|0,19656);if((c[D>>2]|0)!=0){ym(E,N,c[k>>2]|0,19408);h[f+144>>3]=+h[E>>3]}else{ym(F,N,c[k>>2]|0,19240);if((c[F>>2]|0)!=0){ym(G,N,c[k>>2]|0,19104);h[f+144>>3]=+h[G>>3]}else{h[f+144>>3]=1.0}}if(+h[f+144>>3]<=0.0){Cl(N,-31);P=125;break}c[j>>2]=0;ym(H,N,c[k>>2]|0,18928);V=c[H>>2]|0;U=V;do{if((V|0)!=0){R=0;while(1){Z=904+(R*12|0)|0;_=d[Z]|d[Z+1|0]<<8|d[Z+2|0]<<16|d[Z+3|0]<<24|0;c[j>>2]=_;if((_|0)!=0){$=(Hb(U|0,c[j>>2]|0)|0)!=0}else{$=0}if(!$){break}R=R+1|0}if((c[j>>2]|0)!=0){_=908+(R*12|0)|0;c[j>>2]=d[_]|d[_+1|0]<<8|d[_+2|0]<<16|d[_+3|0]<<24;break}else{Cl(N,-7);P=125;break a}}}while(0);do{if((c[j>>2]|0)!=0){P=86}else{ym(I,N,c[k>>2]|0,18752);V=c[I>>2]|0;c[j>>2]=V;if((V|0)!=0){P=86;break}h[f+160>>3]=1.0;h[f+152>>3]=1.0}}while(0);if((P|0)==86){h[f+152>>3]=+kn(c[j>>2]|0,j);if((a[c[j>>2]|0]|0)==47){V=(c[j>>2]|0)+1|0;c[j>>2]=V;aa=+kn(V,0);V=f+152|0;h[V>>3]=+h[V>>3]/aa}h[f+160>>3]=1.0/+h[f+152>>3]}c[j>>2]=0;ym(J,N,c[k>>2]|0,18416);V=c[J>>2]|0;U=V;do{if((V|0)!=0){R=0;while(1){_=904+(R*12|0)|0;Z=d[_]|d[_+1|0]<<8|d[_+2|0]<<16|d[_+3|0]<<24|0;c[j>>2]=Z;if((Z|0)!=0){ba=(Hb(U|0,c[j>>2]|0)|0)!=0}else{ba=0}if(!ba){break}R=R+1|0}if((c[j>>2]|0)!=0){Z=908+(R*12|0)|0;c[j>>2]=d[Z]|d[Z+1|0]<<8|d[Z+2|0]<<16|d[Z+3|0]<<24;break}else{Cl(N,-7);P=125;break a}}}while(0);do{if((c[j>>2]|0)!=0){P=102}else{ym(K,N,c[k>>2]|0,18192);V=c[K>>2]|0;c[j>>2]=V;if((V|0)!=0){P=102;break}h[f+256>>3]=+h[f+152>>3];h[f+264>>3]=+h[f+160>>3]}}while(0);if((P|0)==102){h[f+256>>3]=+kn(c[j>>2]|0,j);if((a[c[j>>2]|0]|0)==47){V=(c[j>>2]|0)+1|0;c[j>>2]=V;aa=+kn(V,0);V=f+256|0;h[V>>3]=+h[V>>3]/aa}h[f+264>>3]=1.0/+h[f+256>>3]}c[j>>2]=0;ym(L,N,c[k>>2]|0,18048);V=c[L>>2]|0;U=V;do{if((V|0)!=0){Z=0;c[M>>2]=0;R=0;while(1){_=2248+(R<<3)|0;if((d[_]|d[_+1|0]<<8|d[_+2|0]<<16|d[_+3|0]<<24|0)==0){break}_=2248+(R<<3)|0;if((Hb(U|0,d[_]|d[_+1|0]<<8|d[_+2|0]<<16|d[_+3|0]<<24|0)|0)==0){P=110;break}R=R+1|0}if((P|0)==110){_=2252+(R<<3)|0;Z=d[_]|d[_+1|0]<<8|d[_+2|0]<<16|d[_+3|0]<<24|0}do{if((Z|0)==0){if(+il(N,U,M)==0.0){if((a[U]|0)!=48){break}}if((a[c[M>>2]|0]|0)!=0){break}Z=U}}while(0);if((Z|0)!=0){h[f+272>>3]=+il(N,Z,0);break}else{Cl(N,-46);P=125;break a}}else{h[f+272>>3]=0.0}}while(0);U=Kb[S&511](f)|0;f=U;if((U|0)!=0){if((c[N>>2]|0)==0){break}}P=125}}while(0);if((P|0)==125){if((f|0)!=0){$l(f)}else{while(1){if((c[k>>2]|0)==0){break}T=c[c[k>>2]>>2]|0;pm(c[k>>2]|0);c[k>>2]=T}}f=0}if((Hb(O|0,14664)|0)==0){ca=O;$m(ca);da=f;i=g;return da|0}ib(1,O|0)|0;ca=O;$m(ca);da=f;i=g;return da|0}function Zl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+1080|0;h=g|0;j=b;b=d;d=e;e=f;f=0;k=d;qn(h|0,e|0,1075)|0;f=cm(e)|0;if((f|0)!=0){c[d>>2]=f;while(1){if((c[d>>2]|0)==0){break}d=c[d>>2]|0}l=d;m=l;i=g;return m|0}f=Xa(h|0,58)|0;n=f;if((f|0)==0){Cl(j,-3);l=0;m=l;i=g;return m|0}f=n;n=f+1|0;a[f]=0;f=wm(j,h|0,17816)|0;h=f;if((f|0)==0){l=0;m=l;i=g;return m|0}d=am(j,b,h,n,d)|0;sa(h|0)|0;if((c[(wb()|0)>>2]|0)==25){c[(wb()|0)>>2]=0}do{if((d|0)!=0){if((d|0)==(k|0)){break}dm(e,c[k>>2]|0)}}while(0);l=d;m=l;i=g;return m|0}function _l(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;g=a;a=b;b=d;d=wm(g,17928,17816)|0;h=d;if((d|0)!=0){b=am(g,a,h,17672,b)|0;Wa(h|0);b=am(g,a,h,e,b)|0;sa(h|0)|0}if((c[(wb()|0)>>2]|0)==0){j=g;k=j|0;c[k>>2]=0;l=b;i=f;return l|0}c[(wb()|0)>>2]=0;j=g;k=j|0;c[k>>2]=0;l=b;i=f;return l|0}function $l(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;if((d|0)==0){i=b;return}a=c[d+24>>2]|0;a=c[d+24>>2]|0;while(1){if((a|0)==0){break}e=c[a>>2]|0;pm(a);a=e}if((c[d+232>>2]|0)!=0){pm(c[d+232>>2]|0)}Lb[c[d+16>>2]&255](d);i=b;return}function am(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=i;i=i+360|0;j=h|0;k=h+304|0;l=h+312|0;m=h+320|0;n=h+328|0;o=h+336|0;p=h+344|0;q=h+352|0;r=b;b=d;d=e;e=f;f=g;g=j+1|0;s=1;t=nn(e|0)|0;a[j|0]=116;while(1){u=vb(d|0,17592,(v=i,i=i+8|0,c[v>>2]=g,v)|0)|0;i=v;if((u|0)!=1){break}if((a[g]|0)==35){do{u=Ra(d|0)|0;w=u;if((u|0)!=-1){x=(w|0)!=10}else{x=0}}while(x)}else{if((a[g]|0)==60){do{if((s|0)!=0){if((ma(e|0,g+1|0,t|0)|0)!=0){y=15;break}if((a[g+(t+1)|0]|0)!=62){y=15;break}s=0}else{y=15}}while(0);if((y|0)==15){y=0;if((s|0)==0){if((a[g]|0)==60){y=17;break}}}}else{do{if((s|0)==0){ym(k,r,c[b>>2]|0,j|0);if((c[k>>2]|0)!=0){break}do{if((ma(g|0,17464,6)|0)!=0){y=34}else{ym(l,r,c[b>>2]|0,17392);if((c[l>>2]|0)!=0){break}ym(m,r,c[b>>2]|0,17240);if((c[m>>2]|0)!=0){break}ym(n,r,c[b>>2]|0,17112);if((c[n>>2]|0)!=0){break}ym(o,r,c[b>>2]|0,17008);if((c[o>>2]|0)!=0){break}ym(p,r,c[b>>2]|0,16912);if((c[p>>2]|0)!=0){break}ym(q,r,c[b>>2]|0,16840);if((c[q>>2]|0)==0){y=34}}}while(0);if((y|0)==34){y=0;u=xm(g)|0;c[f>>2]=u;f=u}}}while(0)}}}if((y|0)==17){do{y=Ra(d|0)|0;w=y;if((y|0)!=-1){z=(w|0)!=10}else{z=0}}while(z)}if((c[(wb()|0)>>2]|0)!=25){A=f;i=h;return A|0}c[(wb()|0)>>2]=0;A=f;i=h;return A|0}function bm(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b;b=0;f=0;while(1){if((e|0)==0){break}g=om((nn(e+5|0)|0)+8|0)|0;a[g+4|0]=0;c[g>>2]=0;on(g+5|0,e+5|0)|0;if((b|0)==0){b=g}else{c[f>>2]=g}f=g;e=c[e>>2]|0}i=d;return b|0}function cm(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;a=0;um();e=0;while(1){if((a|0)==0){f=(e|0)<(c[5814]|0)}else{f=0}if(!f){break}if((Hb(d|0,c[(c[5812]|0)+(e<<2)>>2]|0)|0)==0){a=bm(c[(c[5810]|0)+(e<<2)>>2]|0)|0}e=e+1|0}vm();i=b;return a|0}function dm(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=a;um();if((c[5814]|0)==(c[5816]|0)){c[5816]=(c[5816]<<1)+15;a=om(c[5816]<<2)|0;mn(a|0,c[5812]|0,c[5814]<<2)|0;pm(c[5812]|0);c[5812]=a;a=om(c[5816]<<2)|0;mn(a|0,c[5810]|0,c[5814]<<2)|0;pm(c[5810]|0);c[5810]=a}a=om((nn(e|0)|0)+1|0)|0;c[(c[5812]|0)+(c[5814]<<2)>>2]=a;on(c[(c[5812]|0)+(c[5814]<<2)>>2]|0,e|0)|0;e=bm(b)|0;c[(c[5810]|0)+(c[5814]<<2)>>2]=e;c[5814]=(c[5814]|0)+1;vm();i=d;return}function em(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+16|0;j=d;do{if(+h[b>>3]!=q){if(+h[b+8>>3]==q){break}c[5768]=0;c[(wb()|0)>>2]=0;c[c[j>>2]>>2]=0;h[b>>3]=(+h[b>>3]*+h[j+152>>3]- +h[j+128>>3])*+h[j+88>>3];h[b+8>>3]=(+h[b+8>>3]*+h[j+152>>3]- +h[j+136>>3])*+h[j+88>>3];Nb[c[j+8>>2]&511](g,b,j);d=f;k=g;c[d>>2]=c[k>>2];c[d+4>>2]=c[k+4>>2];c[d+8>>2]=c[k+8>>2];c[d+12>>2]=c[k+12>>2];if((c[c[j>>2]>>2]|0)!=0){h[f+8>>3]=q;h[f>>3]=q}else{k=f|0;h[k>>3]=+h[k>>3]+ +h[j+112>>3];if((c[j+28>>2]|0)==0){h[f>>3]=+hl(+h[f>>3])}do{if((c[j+32>>2]|0)!=0){if(+P(+(+P(+(+h[f+8>>3]))-1.5707963267948966))<=1.0e-12){break}h[f+8>>3]=+X(+h[j+96>>3]*+U(+h[f+8>>3]))}}while(0)}k=a;d=f;c[k>>2]=c[d>>2];c[k+4>>2]=c[d+4>>2];c[k+8>>2]=c[d+8>>2];c[k+12>>2]=c[d+12>>2];i=e;return}}while(0);h[f+8>>3]=q;h[f>>3]=q;Cl(c[j>>2]|0,-15);j=a;a=f;c[j>>2]=c[a>>2];c[j+4>>2]=c[a+4>>2];c[j+8>>2]=c[a+8>>2];c[j+12>>2]=c[a+12>>2];i=e;return}function fm(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+36>>2]=1;h[d+128>>3]=0.0;h[d+136>>3]=0.0;c[d+8>>2]=208;c[d+4>>2]=188;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=84;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10304}e=d;f=e;i=b;return f|0}function gm(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){pm(c)}i=b;return}function hm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f+8>>3]=+h[b+8>>3]*+h[g+48>>3];h[f>>3]=+h[b>>3]*+h[g+48>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function im(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;h[f>>3]=+h[b>>3]/+h[g+48>>3];h[f+8>>3]=+h[b+8>>3]/+h[g+48>>3];g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function jm(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+36>>2]=1;h[d+128>>3]=0.0;h[d+136>>3]=0.0;c[d+8>>2]=208;c[d+4>>2]=188;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=84;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10040}e=d;f=e;i=b;return f|0}function km(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+36>>2]=1;h[d+128>>3]=0.0;h[d+136>>3]=0.0;c[d+8>>2]=208;c[d+4>>2]=188;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=84;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10336}e=d;f=e;i=b;return f|0}function lm(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a;if((d|0)!=0){c[d+36>>2]=1;h[d+128>>3]=0.0;h[d+136>>3]=0.0;c[d+8>>2]=208;c[d+4>>2]=188;e=d;f=e;i=b;return f|0}a=om(296)|0;d=a;if((a|0)!=0){ln(d|0,0,296)|0;c[d+16>>2]=84;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=10016}e=d;f=e;i=b;return f|0}function mm(a,b,d){a=a|0;b=b|0;d=d|0;b=i;wa(c[o>>2]|0,13984,(a=i,i=i+8|0,c[a>>2]=d,a)|0)|0;i=a;i=b;return}function nm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f|0;h=a;a=b;if((a|0)>(c[h+4>>2]|0)){i=f;return}b=_m(1e5)|0;if((b|0)==0){i=f;return}else{j=g|0;c[j>>2]=e;c[j+4>>2]=0;Gb(b|0,d|0,g|0)|0;Nb[c[h+8>>2]&511](c[h+12>>2]|0,a,b);$m(b);i=f;return}}function om(a){a=a|0;var b=0,d=0,e=0;b=i;d=c[(wb()|0)>>2]|0;e=_m(a)|0;do{if((e|0)!=0){if((d|0)!=0){break}c[(wb()|0)>>2]=0}}while(0);i=b;return e|0}function pm(a){a=a|0;var b=0;b=i;$m(a);i=b;return}function qm(a){a=+a;var b=0,c=0.0,d=0,e=0,f=0,g=0.0;b=i;c=a;d=om(40)|0;e=d;if((d|0)==0){f=e;i=b;return f|0}h[e>>3]=1.0-c*(c*(c*(c*.01068115234375+.01953125)+.046875)+.25);h[e+8>>3]=c*(.75-c*(c*(c*.01068115234375+.01953125)+.046875));a=c*c;g=a;h[e+16>>3]=a*(.46875-c*(c*.007120768229166667+.013020833333333334));a=g*c;g=a;h[e+24>>3]=a*(.3645833333333333-c*.005696614583333333);h[e+32>>3]=g*c*.3076171875;f=e;i=b;return f|0}function rm(a,b,c,d){a=+a;b=+b;c=+c;d=d|0;var e=0.0,f=0;e=b;b=c;f=d;b=b*e;e=e*e;i=i;return+(+h[f>>3]*a-b*(+h[f+8>>3]+e*(+h[f+16>>3]+e*(+h[f+24>>3]+e*+h[f+32>>3]))))}function sm(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0,f=0,g=0.0,h=0.0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;f=a;g=b;b=c;a=d;c=1.0/(1.0-b);h=g;d=10;while(1){if((d|0)==0){j=7;break}k=+T(h);l=1.0-b*k*k;m=(+rm(h,k,+S(h),a)-g)*l*+Q(l)*c;l=m;h=h-m;if(+P(+l)<1.0e-11){j=4;break}d=d-1|0}if((j|0)==4){n=h;o=n;i=e;return+o}else if((j|0)==7){Cl(f,-17);n=h;o=n;i=e;return+o}return 0.0}function tm(a,b,c){a=+a;b=+b;c=+c;var d=0.0;d=a;a=b/+Q(1.0-c*d*d);i=i;return+a}function um(){var a=0;a;return}function vm(){var a=0;a;return}function wm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+1032|0;g=f|0;h=b;b=d;d=e;e=0;do{if((a[b]|0)==126){if((Ga(2360,a[b+1|0]|0)|0)==0){j=7;break}k=hb(13816)|0;l=k;if((k|0)!=0){on(g|0,l|0)|0;k=nn(g|0)|0;e=k;a[g+k|0]=47;k=e+1|0;e=k;a[g+k|0]=0;on(g+e|0,b+1|0)|0;l=g|0;break}else{m=0;n=m;i=f;return n|0}}else{j=7}}while(0);if((j|0)==7){do{if((Ga(2360,a[b]|0)|0)!=0){j=14}else{if((a[b]|0)==46){if((Ga(2360,a[b+1|0]|0)|0)!=0){j=14;break}}if((ma(b|0,19696,2)|0)==0){if((Ga(2360,a[b+2|0]|0)|0)!=0){j=14;break}}if((a[b+1|0]|0)==58){if((Ga(2360,a[b+2|0]|0)|0)!=0){j=14;break}}do{if((c[5766]|0)!=0){if((Kb[c[5766]&511](b)|0)==0){j=18;break}l=Kb[c[5766]&511](b)|0}else{j=18}}while(0);if((j|0)==18){k=hb(17872)|0;l=k;do{if((k|0)!=0){j=20}else{o=c[224]|0;l=o;if((o|0)!=0){j=20;break}l=b}}while(0);if((j|0)==20){on(g|0,l|0)|0;k=nn(g|0)|0;e=k;a[g+k|0]=47;k=e+1|0;e=k;a[g+k|0]=0;on(g+e|0,b|0)|0;l=g|0}}}}while(0);if((j|0)==14){l=b}}j=Ja(l|0,d|0)|0;e=j;if((j|0)!=0){c[(wb()|0)>>2]=0}do{if((e|0)==0){if((c[5780]|0)<=0){break}j=0;while(1){if((e|0)==0){p=(j|0)<(c[5780]|0)}else{p=0}if(!p){break}Ua(g|0,16784,(q=i,i=i+24|0,c[q>>2]=c[(c[5764]|0)+(j<<2)>>2],c[q+8>>2]=47,c[q+16>>2]=b,q)|0)|0;i=q;l=g|0;e=Ja(l|0,d|0)|0;j=j+1|0}if((e|0)!=0){c[(wb()|0)>>2]=0}}}while(0);do{if((c[h>>2]|0)==0){if((c[(wb()|0)>>2]|0)==0){break}Cl(h,c[(wb()|0)>>2]|0)}}while(0);nm(h,2,15768,(q=i,i=i+24|0,c[q>>2]=b,c[q+8>>2]=l,c[q+16>>2]=(e|0)==0?15048:14512,q)|0);i=q;m=e;n=m;i=f;return n|0}function xm(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b;b=om((nn(e|0)|0)+8|0)|0;f=b;if((b|0)==0){g=f;i=d;return g|0}a[f+4|0]=0;c[f>>2]=0;if((a[e]|0)==43){e=e+1|0}on(f+5|0,e|0)|0;g=f;i=d;return g|0}function ym(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;j=g|0;k=d;d=e;e=f;if((k|0)==0){k=Al()|0}f=e;e=f+1|0;l=a[f]|0;f=nn(e|0)|0;while(1){if((d|0)!=0){if((ma(d+5|0,e|0,f|0)|0)!=0){m=0}else{if((a[d+5+f|0]|0)!=0){n=(a[d+5+f|0]|0)==61}else{n=1}m=n}p=m^1}else{p=0}if(!p){break}d=c[d>>2]|0}if((l|0)==116){c[j>>2]=(d|0)!=0;q=b;r=j;c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];i=g;return}if((d|0)!=0){p=d+4|0;a[p]=a[p]|1;e=d+5+f|0;if((a[e]|0)==61){e=e+1|0}switch(l|0){case 105:{c[j>>2]=sb(e|0)|0;break};case 100:{h[j>>3]=+jn(e);break};case 114:{h[j>>3]=+il(k,e,0);break};case 115:{c[j>>2]=e;break};case 98:{switch(a[e]|0){case 0:case 84:case 116:{c[j>>2]=1;break};case 70:case 102:{c[j>>2]=0;break};default:{Cl(k,-8);c[j>>2]=0}}break};default:{s=c[o>>2]|0;t=wa(s|0,13712,(u=i,i=i+1|0,i=i+7&-8,c[u>>2]=0,u)|0)|0;i=u;Ta(1)}}}else{switch(l|0){case 100:case 114:{h[j>>3]=0.0;break};case 115:{c[j>>2]=0;break};case 98:case 105:{c[j>>2]=0;break};default:{s=c[o>>2]|0;t=wa(s|0,13712,(u=i,i=i+1|0,i=i+7&-8,c[u>>2]=0,u)|0)|0;i=u;Ta(1)}}}q=b;r=j;c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];i=g;return}function zm(a,b,c){a=a|0;b=+b;c=+c;var d=0,e=0,f=0.0,g=0.0,h=0.0,j=0.0,k=0,l=0,m=0.0;d=i;e=a;f=b;b=c;c=.5*b;g=1.5707963267948966- +X(f)*2.0;a=15;do{h=b*+T(g);j=1.5707963267948966- +X(f*+R(+((1.0-h)/(1.0+h)),+c))*2.0-g;g=g+j;if(+P(+j)>1.0e-10){k=a-1|0;a=k;l=(k|0)!=0}else{l=0}}while(l);if((a|0)>0){m=g;i=d;return+m}Cl(e,-18);m=g;i=d;return+m}function Am(a,b,c){a=+a;b=+b;c=+c;var d=0,e=0.0,f=0.0,g=0.0;d=i;e=a;a=b;if(a>=1.0e-7){b=a*e;f=c*(e/(1.0-b*b)-.5/a*+_((1.0-b)/(1.0+b)));g=f;i=d;return+g}else{f=e+e;g=f;i=d;return+g}return 0.0}function Bm(a,b,d,e,f,g,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0;k=i;i=i+96|0;l=k|0;m=k+16|0;n=k+32|0;o=k+48|0;p=k+64|0;r=k+80|0;s=a;a=b;b=d;d=e;e=f;f=g;g=j;c[c[s>>2]>>2]=0;c[c[a>>2]>>2]=0;if((d|0)==0){d=1}do{if((Hb(s+292|0,13504)|0)!=0){j=Cm(c[s>>2]|0,s+292|0,0,b,d,e,f,g)|0;if((j|0)==0){break}t=j;u=t;i=k;return u|0}}while(0);do{if(+h[s+256>>3]!=1.0){if((g|0)==0){break}v=0;while(1){if((v|0)>=(b|0)){break}j=g+((aa(d,v)|0)<<3)|0;h[j>>3]=+h[j>>3]*+h[s+256>>3];v=v+1|0}}}while(0);do{if((c[s+40>>2]|0)!=0){if((g|0)==0){Cl(zl(s)|0,-45);t=-45;u=t;i=k;return u|0}if(+h[s+152>>3]!=1.0){v=0;while(1){if((v|0)>=(b|0)){break}if(+h[e+((aa(d,v)|0)<<3)>>3]!=q){j=e+((aa(d,v)|0)<<3)|0;h[j>>3]=+h[j>>3]*+h[s+152>>3];j=f+((aa(d,v)|0)<<3)|0;h[j>>3]=+h[j>>3]*+h[s+152>>3]}v=v+1|0}}j=Dm(+h[s+56>>3],+h[s+72>>3],b,d,e,f,g)|0;if((j|0)==0){break}t=j;u=t;i=k;return u|0}else{do{if((c[s+36>>2]|0)==0){if((c[s+8>>2]|0)==0){Cl(zl(s)|0,-17);nm(zl(s)|0,1,19520,(j=i,i=i+1|0,i=i+7&-8,c[j>>2]=0,j)|0);i=j;t=-17;u=t;i=k;return u|0}v=0;a:while(1){if((v|0)>=(b|0)){w=47;break}h[l>>3]=+h[e+((aa(d,v)|0)<<3)>>3];h[l+8>>3]=+h[f+((aa(d,v)|0)<<3)>>3];if(+h[l>>3]!=q){em(n,l,s);j=m;x=n;c[j>>2]=c[x>>2];c[j+4>>2]=c[x+4>>2];c[j+8>>2]=c[x+8>>2];c[j+12>>2]=c[x+12>>2];if((c[c[s>>2]>>2]|0)!=0){do{if((c[c[s>>2]>>2]|0)!=33){if((c[c[s>>2]>>2]|0)==34){break}if((c[c[s>>2]>>2]|0)>0){break a}if((c[c[s>>2]>>2]|0)<-44){break a}if((b|0)==1){break a}if((c[312+(-(c[c[s>>2]>>2]|0)<<2)>>2]|0)==0){break a}}}while(0);h[m>>3]=q;h[m+8>>3]=q}h[e+((aa(d,v)|0)<<3)>>3]=+h[m>>3];h[f+((aa(d,v)|0)<<3)>>3]=+h[m+8>>3]}v=v+1|0}if((w|0)==47){break}t=c[c[s>>2]>>2]|0;u=t;i=k;return u|0}}while(0)}}while(0);if(+h[s+272>>3]!=0.0){v=0;while(1){if((v|0)>=(b|0)){break}if(+h[e+((aa(d,v)|0)<<3)>>3]!=q){m=e+((aa(d,v)|0)<<3)|0;h[m>>3]=+h[m>>3]+ +h[s+272>>3]}v=v+1|0}}do{if((c[s+240>>2]|0)!=0){if((wl(s,17712,s+244|0,s+248|0,0,b,d,e,f,g)|0)==0){break}t=Bl(c[s>>2]|0)|0;u=t;i=k;return u|0}}while(0);if((Em(s,a,b,d,e,f,g)|0)!=0){if((c[c[s>>2]>>2]|0)!=0){t=c[c[s>>2]>>2]|0;u=t;i=k;return u|0}else{t=c[c[a>>2]>>2]|0;u=t;i=k;return u|0}}do{if((c[a+240>>2]|0)!=0){if((wl(a,17712,a+244|0,a+248|0,1,b,d,e,f,g)|0)==0){break}t=c[c[a>>2]>>2]|0;u=t;i=k;return u|0}}while(0);if(+h[a+272>>3]!=0.0){v=0;while(1){if((v|0)>=(b|0)){break}if(+h[e+((aa(d,v)|0)<<3)>>3]!=q){s=e+((aa(d,v)|0)<<3)|0;h[s>>3]=+h[s>>3]- +h[a+272>>3]}v=v+1|0}}if((c[a+40>>2]|0)!=0){if((g|0)==0){Cl(c[a>>2]|0,-45);t=-45;u=t;i=k;return u|0}Fm(+h[a+56>>3],+h[a+72>>3],b,d,e,f,g)|0;if(+h[a+160>>3]!=1.0){v=0;while(1){if((v|0)>=(b|0)){break}if(+h[e+((aa(d,v)|0)<<3)>>3]!=q){s=e+((aa(d,v)|0)<<3)|0;h[s>>3]=+h[s>>3]*+h[a+160>>3];s=f+((aa(d,v)|0)<<3)|0;h[s>>3]=+h[s>>3]*+h[a+160>>3]}v=v+1|0}}}else{do{if((c[a+36>>2]|0)!=0){do{if((c[a+36>>2]|0)!=0){if((c[a+288>>2]|0)==0){break}v=0;while(1){if((v|0)>=(b|0)){break}if(+h[e+((aa(d,v)|0)<<3)>>3]!=q){while(1){y=+h[e+((aa(d,v)|0)<<3)>>3];if(y>=+h[a+280>>3]-3.141592653589793){break}s=e+((aa(d,v)|0)<<3)|0;h[s>>3]=+h[s>>3]+6.283185307179586}while(1){y=+h[e+((aa(d,v)|0)<<3)>>3];if(y<=+h[a+280>>3]+3.141592653589793){break}s=e+((aa(d,v)|0)<<3)|0;h[s>>3]=+h[s>>3]-6.283185307179586}}v=v+1|0}}}while(0)}else{v=0;b:while(1){if((v|0)>=(b|0)){w=106;break}h[p>>3]=+h[e+((aa(d,v)|0)<<3)>>3];h[p+8>>3]=+h[f+((aa(d,v)|0)<<3)>>3];if(+h[p>>3]!=q){Fl(r,p,a);s=o;m=r;c[s>>2]=c[m>>2];c[s+4>>2]=c[m+4>>2];c[s+8>>2]=c[m+8>>2];c[s+12>>2]=c[m+12>>2];if((c[c[a>>2]>>2]|0)!=0){do{if((c[c[a>>2]>>2]|0)!=33){if((c[c[a>>2]>>2]|0)==34){break}if((c[c[a>>2]>>2]|0)>0){break b}if((c[c[a>>2]>>2]|0)<-44){break b}if((b|0)==1){break b}if((c[312+(-(c[c[a>>2]>>2]|0)<<2)>>2]|0)==0){break b}}}while(0);h[o>>3]=q;h[o+8>>3]=q}h[e+((aa(d,v)|0)<<3)>>3]=+h[o>>3];h[f+((aa(d,v)|0)<<3)>>3]=+h[o+8>>3]}v=v+1|0}if((w|0)==106){break}t=c[c[a>>2]>>2]|0;u=t;i=k;return u|0}}while(0)}do{if(+h[a+256>>3]!=1.0){if((g|0)==0){break}v=0;while(1){if((v|0)>=(b|0)){break}w=g+((aa(d,v)|0)<<3)|0;h[w>>3]=+h[w>>3]*+h[a+264>>3];v=v+1|0}}}while(0);do{if((Hb(a+292|0,13504)|0)!=0){v=Cm(c[a>>2]|0,a+292|0,1,b,d,e,f,g)|0;if((v|0)==0){break}t=v;u=t;i=k;return u|0}}while(0);t=0;u=t;i=k;return u|0}function Cm(b,c,d,e,f,g,j,k){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0.0;l=i;m=b;b=c;c=e;e=f;f=g;g=j;j=k;n=0.0;do{if((d|0)!=0){o=0;a:while(1){if((o|0)>=(c|0)){p=58;break}q=+h[f+((aa(e,o)|0)<<3)>>3];r=+h[g+((aa(e,o)|0)<<3)>>3];if((j|0)!=0){n=+h[j+((aa(e,o)|0)<<3)>>3]}s=0;while(1){if((s|0)>=3){break}do{if((s|0)==2){if((j|0)!=0){p=40;break}}else{p=40}}while(0);if((p|0)==40){p=0;if((s|0)==0){t=f}else{if((s|0)==1){t=g}else{t=j}}switch(a[b+s|0]|0){case 115:{h[t+((aa(e,o)|0)<<3)>>3]=-0.0-r;break};case 119:{h[t+((aa(e,o)|0)<<3)>>3]=-0.0-q;break};case 110:{h[t+((aa(e,o)|0)<<3)>>3]=r;break};case 117:{h[t+((aa(e,o)|0)<<3)>>3]=n;break};case 100:{h[t+((aa(e,o)|0)<<3)>>3]=-0.0-n;break};case 101:{h[t+((aa(e,o)|0)<<3)>>3]=q;break};default:{break a}}}s=s+1|0}o=o+1|0}if((p|0)==58){break}Cl(m,-47);u=-47;v=u;i=l;return v|0}else{o=0;b:while(1){if((o|0)>=(c|0)){p=30;break}q=+h[f+((aa(e,o)|0)<<3)>>3];r=+h[g+((aa(e,o)|0)<<3)>>3];if((j|0)!=0){n=+h[j+((aa(e,o)|0)<<3)>>3]}s=0;while(1){if((s|0)>=3){break}if((s|0)==0){w=q}else{if((s|0)==1){w=r}else{w=n}}switch(a[b+s|0]|0){case 101:{h[f+((aa(e,o)|0)<<3)>>3]=w;break};case 115:{h[g+((aa(e,o)|0)<<3)>>3]=-0.0-w;break};case 117:{if((j|0)!=0){h[j+((aa(e,o)|0)<<3)>>3]=w}break};case 110:{h[g+((aa(e,o)|0)<<3)>>3]=w;break};case 100:{if((j|0)!=0){h[j+((aa(e,o)|0)<<3)>>3]=-0.0-w}break};case 119:{h[f+((aa(e,o)|0)<<3)>>3]=-0.0-w;break};default:{break b}}s=s+1|0}o=o+1|0}if((p|0)==30){break}Cl(m,-47);u=-47;v=u;i=l;return v|0}}while(0);u=0;v=u;i=l;return v|0}function Dm(a,b,c,d,e,f,g){a=+a;b=+b;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0.0,m=0,n=0.0,o=0,p=0,r=0;j=i;i=i+48|0;k=j|0;l=a;a=b;m=c;c=d;d=e;e=f;f=g;if(a==0.0){n=l}else{n=l*+Q(1.0-a)}if((kl(k,l,n)|0)!=0){o=-45;p=o;i=j;return p|0}g=0;while(1){if((g|0)>=(m|0)){break}r=aa(g,c)|0;if(+h[d+(r<<3)>>3]!=q){ml(k,+h[d+(r<<3)>>3],+h[e+(r<<3)>>3],+h[f+(r<<3)>>3],e+(r<<3)|0,d+(r<<3)|0,f+(r<<3)|0)}g=g+1|0}o=0;p=o;i=j;return p|0}function Em(a,b,d,e,f,g,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0;k=i;l=a;a=b;b=d;d=e;e=f;f=g;g=j;j=0;do{if((c[l+168>>2]|0)!=0){if((c[a+168>>2]|0)==0){break}if((Gm(l,a)|0)!=0){m=0;n=m;i=k;return n|0}o=+h[l+56>>3];p=+h[l+72>>3];q=+h[a+56>>3];r=+h[a+72>>3];if((g|0)==0){s=aa(b<<3,d)|0;g=om(s)|0;ln(g|0,0,s|0)|0;j=1}if((c[l+168>>2]|0)==3){vl(l,0,b,d,e,f,g)|0;do{if((c[c[l>>2]>>2]|0)!=0){if((c[c[l>>2]>>2]|0)<=0){if((c[312+(-(c[c[l>>2]>>2]|0)<<2)>>2]|0)!=0){break}}if((j|0)!=0){pm(g)}m=c[c[l>>2]>>2]|0;n=m;i=k;return n|0}}while(0);o=6378137.0;p=.0066943799901413165}if((c[a+168>>2]|0)==3){q=6378137.0;r=.0066943799901413165}do{if(p!=r){t=24}else{if(o!=q){t=24;break}if((c[l+168>>2]|0)==1){t=24;break}if((c[l+168>>2]|0)==2){t=24;break}if((c[a+168>>2]|0)==1){t=24;break}if((c[a+168>>2]|0)==2){t=24}}}while(0);if((t|0)==24){s=Fm(o,p,b,d,e,f,g)|0;c[c[l>>2]>>2]=s;do{if((c[c[l>>2]>>2]|0)!=0){if((c[c[l>>2]>>2]|0)<=0){if((c[312+(-(c[c[l>>2]>>2]|0)<<2)>>2]|0)!=0){break}}if((j|0)!=0){pm(g)}m=c[c[l>>2]>>2]|0;n=m;i=k;return n|0}}while(0);if((c[l+168>>2]|0)==1){t=32}else{if((c[l+168>>2]|0)==2){t=32}}if((t|0)==32){Hm(l,b,d,e,f,g)|0;do{if((c[c[l>>2]>>2]|0)!=0){if((c[c[l>>2]>>2]|0)<=0){if((c[312+(-(c[c[l>>2]>>2]|0)<<2)>>2]|0)!=0){break}}if((j|0)!=0){pm(g)}m=c[c[l>>2]>>2]|0;n=m;i=k;return n|0}}while(0)}if((c[a+168>>2]|0)==1){t=41}else{if((c[a+168>>2]|0)==2){t=41}}if((t|0)==41){Im(a,b,d,e,f,g)|0;do{if((c[c[a>>2]>>2]|0)!=0){if((c[c[a>>2]>>2]|0)<=0){if((c[312+(-(c[c[a>>2]>>2]|0)<<2)>>2]|0)!=0){break}}if((j|0)!=0){pm(g)}m=c[c[a>>2]>>2]|0;n=m;i=k;return n|0}}while(0)}s=Dm(q,r,b,d,e,f,g)|0;c[c[a>>2]>>2]=s;do{if((c[c[a>>2]>>2]|0)!=0){if((c[c[a>>2]>>2]|0)<=0){if((c[312+(-(c[c[a>>2]>>2]|0)<<2)>>2]|0)!=0){break}}if((j|0)!=0){pm(g)}m=c[c[a>>2]>>2]|0;n=m;i=k;return n|0}}while(0)}if((c[a+168>>2]|0)==3){vl(a,1,b,d,e,f,g)|0;do{if((c[c[a>>2]>>2]|0)!=0){if((c[c[a>>2]>>2]|0)<=0){if((c[312+(-(c[c[a>>2]>>2]|0)<<2)>>2]|0)!=0){break}}if((j|0)!=0){pm(g)}m=c[c[a>>2]>>2]|0;n=m;i=k;return n|0}}while(0)}if((j|0)!=0){pm(g)}m=0;n=m;i=k;return n|0}}while(0);m=0;n=m;i=k;return n|0}function Fm(a,b,c,d,e,f,g){a=+a;b=+b;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0.0,m=0,n=0.0,o=0,p=0,r=0,s=0;j=i;i=i+48|0;k=j|0;l=a;a=b;m=c;c=d;d=e;e=f;f=g;g=0;if(a==0.0){n=l}else{n=l*+Q(1.0-a)}if((kl(k,l,n)|0)!=0){o=-45;p=o;i=j;return p|0}r=0;while(1){if((r|0)>=(m|0)){break}s=aa(r,c)|0;if(+h[d+(s<<3)>>3]!=q){if((ll(k,+h[e+(s<<3)>>3],+h[d+(s<<3)>>3],+h[f+(s<<3)>>3],d+(s<<3)|0,e+(s<<3)|0,f+(s<<3)|0)|0)!=0){g=-14;h[e+(s<<3)>>3]=q;h[d+(s<<3)>>3]=q}}r=r+1|0}o=g;p=o;i=j;return p|0}function Gm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0.0,m=0,n=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=a;a=b;if((c[g+168>>2]|0)!=(c[a+168>>2]|0)){j=0;k=j;i=d;return k|0}do{if(+h[g+56>>3]==+h[a+56>>3]){if(+h[g+72>>3]- +h[a+72>>3]<0.0){l=(+h[g+72>>3]- +h[a+72>>3])*-1.0}else{l=+h[g+72>>3]- +h[a+72>>3]}if(l>5.0e-11){break}if((c[g+168>>2]|0)==1){do{if(+h[g+176>>3]==+h[a+176>>3]){if(+h[g+184>>3]!=+h[a+184>>3]){m=0;break}m=+h[g+192>>3]==+h[a+192>>3]}else{m=0}}while(0);j=m&1;k=j;i=d;return k|0}if((c[g+168>>2]|0)!=2){if((c[g+168>>2]|0)==3){ym(e,c[g>>2]|0,c[g+24>>2]|0,16704);b=c[e>>2]|0;ym(f,c[a>>2]|0,c[a+24>>2]|0,16704);j=(Hb(b|0,c[f>>2]|0)|0)==0|0;k=j;i=d;return k|0}else{j=1;k=j;i=d;return k|0}}do{if(+h[g+176>>3]==+h[a+176>>3]){if(+h[g+184>>3]!=+h[a+184>>3]){n=0;break}if(+h[g+192>>3]!=+h[a+192>>3]){n=0;break}if(+h[g+200>>3]!=+h[a+200>>3]){n=0;break}if(+h[g+208>>3]!=+h[a+208>>3]){n=0;break}if(+h[g+216>>3]!=+h[a+216>>3]){n=0;break}n=+h[g+224>>3]==+h[a+224>>3]}else{n=0}}while(0);j=n&1;k=j;i=d;return k|0}}while(0);j=0;k=j;i=d;return k|0}function Hm(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0.0,n=0.0;j=i;k=a;a=b;b=d;d=e;e=f;f=g;if((c[k+168>>2]|0)==1){l=0;while(1){if((l|0)>=(a|0)){break}g=aa(l,b)|0;if(+h[d+(g<<3)>>3]!=q){h[d+(g<<3)>>3]=+h[d+(g<<3)>>3]+ +h[k+176>>3];h[e+(g<<3)>>3]=+h[e+(g<<3)>>3]+ +h[k+184>>3];h[f+(g<<3)>>3]=+h[f+(g<<3)>>3]+ +h[k+192>>3]}l=l+1|0}i=j;return 0}if((c[k+168>>2]|0)==2){l=0;while(1){if((l|0)>=(a|0)){break}g=aa(l,b)|0;if(+h[d+(g<<3)>>3]!=q){m=+h[k+224>>3]*(+h[k+216>>3]*+h[d+(g<<3)>>3]+ +h[e+(g<<3)>>3]- +h[k+200>>3]*+h[f+(g<<3)>>3])+ +h[k+184>>3];n=+h[k+224>>3]*((-0.0- +h[k+208>>3])*+h[d+(g<<3)>>3]+ +h[k+200>>3]*+h[e+(g<<3)>>3]+ +h[f+(g<<3)>>3])+ +h[k+192>>3];h[d+(g<<3)>>3]=+h[k+224>>3]*(+h[d+(g<<3)>>3]- +h[k+216>>3]*+h[e+(g<<3)>>3]+ +h[k+208>>3]*+h[f+(g<<3)>>3])+ +h[k+176>>3];h[e+(g<<3)>>3]=m;h[f+(g<<3)>>3]=n}l=l+1|0}}i=j;return 0}function Im(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0.0,n=0.0,o=0.0;j=i;k=a;a=b;b=d;d=e;e=f;f=g;if((c[k+168>>2]|0)==1){l=0;while(1){if((l|0)>=(a|0)){break}g=aa(l,b)|0;if(+h[d+(g<<3)>>3]!=q){h[d+(g<<3)>>3]=+h[d+(g<<3)>>3]- +h[k+176>>3];h[e+(g<<3)>>3]=+h[e+(g<<3)>>3]- +h[k+184>>3];h[f+(g<<3)>>3]=+h[f+(g<<3)>>3]- +h[k+192>>3]}l=l+1|0}i=j;return 0}if((c[k+168>>2]|0)==2){l=0;while(1){if((l|0)>=(a|0)){break}g=aa(l,b)|0;if(+h[d+(g<<3)>>3]!=q){m=(+h[d+(g<<3)>>3]- +h[k+176>>3])/+h[k+224>>3];n=(+h[e+(g<<3)>>3]- +h[k+184>>3])/+h[k+224>>3];o=(+h[f+(g<<3)>>3]- +h[k+192>>3])/+h[k+224>>3];h[d+(g<<3)>>3]=m+ +h[k+216>>3]*n- +h[k+208>>3]*o;h[e+(g<<3)>>3]=(-0.0- +h[k+216>>3])*m+n+ +h[k+200>>3]*o;h[f+(g<<3)>>3]=+h[k+208>>3]*m- +h[k+200>>3]*n+o}l=l+1|0}}i=j;return 0}function Jm(a,b,c){a=+a;b=+b;c=+c;var d=0.0;d=b;b=c;d=d*b;c=+U((1.5707963267948966-a)*.5)/+R(+((1.0-d)/(1.0+d)),+(.5*b));i=i;return+c}function Km(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0.0,n=0.0;f=i;i=i+16|0;g=b;b=i;i=i+16|0;c[b>>2]=c[g>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];c[b+12>>2]=c[g+12>>2];g=f|0;j=d;d=e;e=j+(d<<4)|0;j=e;k=g;l=e;c[k>>2]=c[l>>2];c[k+4>>2]=c[l+4>>2];c[k+8>>2]=c[l+8>>2];c[k+12>>2]=c[l+12>>2];while(1){l=d;d=l-1|0;if((l|0)<=0){break}l=j-16|0;j=l;m=+h[g>>3];n=m;h[g>>3]=+h[l>>3]+ +h[b>>3]*m- +h[b+8>>3]*+h[g+8>>3];h[g+8>>3]=+h[j+8>>3]+ +h[b>>3]*+h[g+8>>3]+ +h[b+8>>3]*n}m=+h[g>>3];n=m;h[g>>3]=+h[b>>3]*m- +h[b+8>>3]*+h[g+8>>3];h[g+8>>3]=+h[b>>3]*+h[g+8>>3]+ +h[b+8>>3]*n;b=a;a=g;c[b>>2]=c[a>>2];c[b+4>>2]=c[a+4>>2];c[b+8>>2]=c[a+8>>2];c[b+12>>2]=c[a+12>>2];i=f;return}function Lm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0;g=i;i=i+32|0;j=b;b=i;i=i+16|0;c[b>>2]=c[j>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[b+12>>2]=c[j+12>>2];j=g|0;k=g+16|0;l=d;d=e;e=f;f=1;m=l+(d<<4)|0;l=m;n=j;o=m;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];while(1){o=d;d=o-1|0;if((o|0)<=0){break}if((f|0)!=0){f=0;o=k;n=j;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2];c[o+12>>2]=c[n+12>>2]}else{p=+h[k>>3];q=p;h[k>>3]=+h[j>>3]+ +h[b>>3]*p- +h[b+8>>3]*+h[k+8>>3];h[k+8>>3]=+h[j+8>>3]+ +h[b>>3]*+h[k+8>>3]+ +h[b+8>>3]*q}n=l-16|0;l=n;p=+h[j>>3];q=p;h[j>>3]=+h[n>>3]+ +h[b>>3]*p- +h[b+8>>3]*+h[j+8>>3];h[j+8>>3]=+h[l+8>>3]+ +h[b>>3]*+h[j+8>>3]+ +h[b+8>>3]*q}p=+h[k>>3];q=p;h[k>>3]=+h[j>>3]+ +h[b>>3]*p- +h[b+8>>3]*+h[k+8>>3];h[k+8>>3]=+h[j+8>>3]+ +h[b>>3]*+h[k+8>>3]+ +h[b+8>>3]*q;p=+h[j>>3];q=p;h[j>>3]=+h[b>>3]*p- +h[b+8>>3]*+h[j+8>>3];h[j+8>>3]=+h[b>>3]*+h[j+8>>3]+ +h[b+8>>3]*q;b=e;e=k;c[b>>2]=c[e>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[b+12>>2]=c[e+12>>2];e=a;a=j;c[e>>2]=c[a>>2];c[e+4>>2]=c[a+4>>2];c[e+8>>2]=c[a+8>>2];c[e+12>>2]=c[a+12>>2];i=g;return}function Mm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0,k=0.0;b=i;d=a;if((d|0)==0){a=om(472)|0;d=a;if((a|0)!=0){ln(d|0,0,472)|0;c[d+16>>2]=28;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=11536}e=d;f=e;i=b;return f|0}if(+h[d+64>>3]<=0.0){Cl(c[d>>2]|0,-34);Nm(d);e=0;f=e;i=b;return f|0}g=1.0- +Q(1.0- +h[d+64>>3]);j=g/(2.0-g);g=j;k=j;h[d+312>>3]=g*(g*(g*(g*(2.577777777777778+g*.5777777777777777)+-2.0)+-.6666666666666666)+2.0);h[d+352>>3]=g*(g*(g*(1.3333333333333333+g*(g*.7111111111111111+ -1.8222222222222222))+.6666666666666666)+-2.0);k=k*g;h[d+320>>3]=k*(2.3333333333333335+g*(g*(g*8.584126984126984+ -5.044444444444444)+ -1.6));h[d+360>>3]=k*(1.6666666666666667+g*(g*(g*2.86984126984127+ -1.4444444444444444)+ -1.0666666666666667));k=k*g;h[d+328>>3]=k*(3.7333333333333334+g*(g*12.019047619047619+ -3.8857142857142857));h[d+368>>3]=k*(g*(1.619047619047619+g*1.6)+ -1.7333333333333334);k=k*g;h[d+336>>3]=k*(6.792063492063492+g*-9.2);h[d+376>>3]=k*(1.9634920634920634+g*-2.4);k=k*g;h[d+344>>3]=k*13.250793650793652;h[d+384>>3]=k*-2.3301587301587303;k=g*g;h[d+296>>3]=+h[d+144>>3]/(1.0+g)*(k*(k*(k/256.0+.015625)+.25)+1.0);h[d+392>>3]=g*(g*(g*(g*(g*.158203125+.002777777777777778)+-.3854166666666667)+.6666666666666666)+-.5);h[d+432>>3]=g*(g*(g*(g*(g*-.4409722222222222+.22777777777777777)+.3125)+-.6666666666666666)+.5);h[d+400>>3]=k*(g*(g*(g*-.4380952380952381+.3034722222222222)+-.06666666666666667)+-.020833333333333332);h[d+440>>3]=k*(g*(g*(g*.44603174603174606+.38680555555555557)+-.6)+.2708333333333333);k=k*g;h[d+408>>3]=k*(g*(g*.046651785714285715+.04404761904761905)+-.035416666666666666);h[d+448>>3]=k*(g*(g*.5603050595238095+-.7357142857142858)+.25416666666666665);k=k*g;h[d+416>>3]=k*(g*.021825396825396824+-.02726314484126984);h[d+456>>3]=k*(g*-1.0654761904761905+.30729786706349205);k=k*g;h[d+424>>3]=k*-.02841641865079365;h[d+464>>3]=k*.4306671626984127;k=+Om(d+352|0,5,+h[d+120>>3]);g=-0.0- +h[d+296>>3];h[d+304>>3]=g*(k+ +Pm(d+432|0,5,2.0*k));c[d+8>>2]=262;c[d+4>>2]=230;e=d;f=e;i=b;return f|0}function Nm(a){a=a|0;var b=0,c=0;b=i;c=a;if((c|0)!=0){$m(c)}i=b;return}function Om(a,b,c){a=a|0;b=b|0;c=+c;var d=0,e=0,f=0.0,g=0.0,j=0.0,k=0.0;d=i;e=a;f=c;c=0.0;g=0.0;j=+S(2.0*f)*2.0;a=e+(b<<3)|0;b=a-8|0;a=b;k=+h[b>>3];while(1){if(((a-e|0)/8|0|0)==0){break}b=a-8|0;a=b;c=-0.0-g+j*k+ +h[b>>3];g=k;k=c}k=f+c*+T(2.0*f);i=d;return+k}function Pm(a,b,c){a=a|0;b=b|0;c=+c;var d=0,e=0,f=0.0,g=0.0,j=0.0,k=0.0;d=i;e=a;f=c;a=e+(b<<3)|0;c=+S(f)*2.0;g=0.0;b=a-8|0;a=b;j=+h[b>>3];while(1){if(((e-a|0)/8|0|0)==0){break}k=g;g=j;b=a-8|0;a=b;j=-0.0-k+c*g+ +h[b>>3]}g=+T(f)*j;i=d;return+g}function Qm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,r=0,s=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+24|0;j=d;ln(f|0,0,16)|0;k=+h[b+8>>3];l=+h[b>>3];k=(k- +h[j+304>>3])/+h[j+296>>3];l=l/+h[j+296>>3];if(l<0.0){m=-0.0-l}else{m=l}if(m<=2.623395162778){k=k+ +Sm(j+392|0,5,2.0*k,2.0*l,e+16|0,g);l=l+ +h[g>>3];l=(+X(+Z(l))-.7853981633974483)*2.0;m=+S(k);n=+T(l);o=+S(l);l=+Y(+n,+(o*m));p=+T(k)*o;k=+Y(+p,+(+va(+n,+(o*m))));h[f+8>>3]=+Om(j+312|0,5,k);h[f>>3]=l;r=a;s=f;c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];c[r+12>>2]=c[s+12>>2];i=e;return}else{h[f>>3]=q;h[f+8>>3]=q;r=a;s=f;c[r>>2]=c[s>>2];c[r+4>>2]=c[s+4>>2];c[r+8>>2]=c[s+8>>2];c[r+12>>2]=c[s+12>>2];i=e;return}}function Rm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,r=0.0,s=0,t=0;e=i;i=i+32|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=e+24|0;j=d;ln(f|0,0,16)|0;k=+h[b+8>>3];l=+h[b>>3];k=+Om(j+352|0,5,k);m=+T(k);n=+S(k);o=+S(l);k=+Y(+m,+(o*n));p=+T(l)*n;l=+Y(+p,+(+va(+m,+(n*o))));l=+_(+U(l*.5+.7853981633974483));k=k+ +Sm(j+432|0,5,2.0*k,2.0*l,e+16|0,g);l=l+ +h[g>>3];if(l<0.0){r=-0.0-l}else{r=l}if(r<=2.623395162778){h[f+8>>3]=+h[j+296>>3]*k+ +h[j+304>>3];h[f>>3]=+h[j+296>>3]*l;s=a;t=f;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[s+12>>2]=c[t+12>>2];i=e;return}else{h[f+8>>3]=q;h[f>>3]=q;s=a;t=f;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[s+12>>2]=c[t+12>>2];i=e;return}}function Sm(a,b,c,d,e,f){a=a|0;b=b|0;c=+c;d=+d;e=e|0;f=f|0;var g=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;g=i;j=a;k=c;c=d;a=e;e=f;f=j+(b<<3)|0;d=+T(k);l=+S(k);k=+Z(c);m=+Z(-0.0-c);c=(k-m)/2.0;n=(k+m)/2.0;m=2.0*l*n;k=-2.0*d*c;o=0.0;p=0.0;q=0.0;b=f-8|0;f=b;r=+h[b>>3];while(1){if(((j-f|0)/8|0|0)==0){break}s=p;t=q;p=r;q=o;b=f-8|0;f=b;r=-0.0-s+m*p-k*q+ +h[b>>3];o=-0.0-t+k*p+m*q}m=d*n;k=l*c;h[a>>3]=m*r-k*o;h[e>>3]=m*o+k*r;i=g;return+(+h[a>>3])}function Tm(a){a=+a;var b=0,d=0,e=0.0,f=0.0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0,r=0,s=0,t=0;b=i;i=i+160|0;d=b|0;e=a;a=e;f=1.0;g=1.0;j=1.0;k=1.0;l=4.0;h[d>>3]=1.0;m=1.0;n=1.0;o=1;while(1){if((o|0)>=20){break}j=j*g*g;p=j/(l*k*k*g)*a;h[d+(o<<3)>>3]=p;n=n-p;a=a*e;l=l*4.0;p=f+1.0;f=p;k=k*p;g=g+2.0;if(n==m){q=4;break}m=n;o=o+1|0}q=_m((o<<3)+32|0)|0;r=q;if((q|0)==0){s=0;t=s;i=b;return t|0}c[r>>2]=o-1;h[r+8>>3]=e;h[r+16>>3]=n;e=1.0-n;n=e;h[r+24>>3]=e;k=1.0;j=1.0;e=2.0;f=3.0;q=1;while(1){if((q|0)>=(o|0)){break}n=n- +h[d+(q<<3)>>3];j=j*e;k=k*f;h[r+24+(q<<3)>>3]=n*j/k;e=e+2.0;f=f+2.0;q=q+1|0}s=r;t=s;i=b;return t|0}function Um(a,b,d,e){a=+a;b=+b;d=+d;e=e|0;var f=0,g=0.0,j=0,k=0;f=i;g=b;j=e;b=g*d;d=g*g;g=a*+h[j+16>>3]- +h[j+8>>3]*b/+Q(1.0- +h[j+8>>3]*d);e=c[j>>2]|0;k=e;a=+h[j+24+(e<<3)>>3];while(1){if((k|0)==0){break}e=k-1|0;k=e;a=+h[j+24+(e<<3)>>3]+d*a}i=f;return+(g+b*a)}function Vm(a,b,c){a=a|0;b=+b;c=c|0;var d=0,e=0,f=0.0,g=0.0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;d=i;e=a;f=b;a=c;b=1.0/(1.0- +h[a+8>>3]);c=20;g=f;while(1){j=c;c=j-1|0;if((j|0)==0){k=6;break}l=+T(g);m=1.0- +h[a+8>>3]*l*l;n=(+Um(g,l,+S(g),a)-f)*m*+Q(m)*b;m=n;g=g-n;if(+P(+m)<1.0e-14){k=4;break}}if((k|0)==4){o=g;p=o;i=d;return+p}else if((k|0)==6){Cl(e,-17);o=g;p=o;i=d;return+p}return 0.0}



function Wm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;b=i;d=a;if((d|0)==0){a=om(576)|0;d=a;if((a|0)!=0){ln(d|0,0,576)|0;c[d+16>>2]=182;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+20>>2]=8216;c[d+568>>2]=0}e=d;f=e;i=b;return f|0}a=Tm(+h[d+64>>3])|0;c[d+568>>2]=a;if((a|0)==0){Xm(d);e=0;f=e;i=b;return f|0}g=+T(+h[d+120>>3]);j=+S(+h[d+120>>3]);h[d+296>>3]=+Um(+h[d+120>>3],g,j,c[d+568>>2]|0);j=+h[d+64>>3]*g*g;g=j;k=1.0-j;j=1.0/+Q(k);l=k*k/+h[d+96>>3];m=l*l;k=+U(+h[d+120>>3]);n=k*k;o=l/4.0;h[d+304>>3]=o;h[d+416>>3]=o;o=l*(2.0*n-1.0-2.0*g)/12.0;h[d+312>>3]=o;h[d+424>>3]=o;h[d+320>>3]=l*k*(4.0*n+1.0)/(12.0*j);h[d+328>>3]=m/24.0;h[d+336>>3]=m*(n*(12.0*n+11.0)+-1.0)/24.0;h[d+344>>3]=m*(n*(11.0-2.0*n)+-2.0)/240.0;h[d+352>>3]=k/(2.0*j);h[d+360>>3]=l/12.0;h[d+368>>3]=l*(2.0*n+1.0-2.0*g)/4.0;h[d+376>>3]=l*k*(2.0-n)/(24.0*j);h[d+384>>3]=l*k*(4.0*n+5.0)/(8.0*j);h[d+392>>3]=m*(n*(6.0*n+-5.0)+-2.0)/48.0;h[d+400>>3]=m*(n*(12.0*n+19.0)+5.0)/24.0;h[d+408>>3]=m/120.0;h[d+432>>3]=l*k*(1.0+n)/(3.0*j);h[d+440>>3]=m*(n*(22.0*n+34.0)+-3.0)/240.0;h[d+448>>3]=m*(n*(12.0*n+13.0)+4.0)/24.0;h[d+456>>3]=m/16.0;h[d+464>>3]=m*k*(n*(n*16.0+33.0)+11.0)/(48.0*j);h[d+472>>3]=m*k*(n*4.0+1.0)/(36.0*j);h[d+480>>3]=k/(2.0*j);h[d+488>>3]=l/12.0;h[d+496>>3]=l*(2.0*n+1.0-2.0*g)/4.0;h[d+504>>3]=l*k*(1.0+n)/(8.0*j);h[d+512>>3]=l*k*(n*2.0+1.0)/(4.0*j);h[d+520>>3]=m*(n*(n*6.0+6.0)+1.0)/16.0;h[d+528>>3]=m*n*(n*4.0+3.0)/8.0;h[d+536>>3]=m/80.0;h[d+544>>3]=m*k*(n*(178.0-n*26.0)+-21.0)/720.0;h[d+552>>3]=m*k*(n*(n*48.0+86.0)+29.0)/(96.0*j);h[d+560>>3]=m*k*(n*44.0+37.0)/(96.0*j);c[d+4>>2]=122;c[d+8>>2]=396;e=d;f=e;i=b;return f|0}function Xm(a){a=a|0;var b=0,d=0;b=i;d=a;if((d|0)==0){i=b;return}if((c[d+568>>2]|0)!=0){$m(c[d+568>>2]|0)}$m(d);i=b;return}function Ym(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+S(+h[b+8>>3]);k=+T(+h[b+8>>3]);l=+Um(+h[b+8>>3],k,j,c[g+568>>2]|0);m=l- +h[g+296>>3];l=m*m;n=+h[b>>3]*j/+Q(1.0- +h[g+64>>3]*k*k);k=n*n;h[f>>3]=+h[g+144>>3]*n*(l*(+h[g+304>>3]+l*+h[g+328>>3])+1.0-k*(+h[g+312>>3]+m*+h[g+320>>3]+l*+h[g+336>>3]+k*+h[g+344>>3]));h[f+8>>3]=+h[g+144>>3]*(k*(+h[g+352>>3]+k*+h[g+376>>3])+m*(k*(+h[g+368>>3]-k*+h[g+392>>3])+1.0+l*(+h[g+360>>3]+l*+h[g+408>>3])+m*k*(+h[g+384>>3]+m*+h[g+400>>3])));g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function Zm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=i;i=i+16|0;f=b;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];f=e|0;g=d;ln(f|0,0,16)|0;j=+h[b>>3]/+h[g+144>>3];k=+h[b+8>>3]/+h[g+144>>3];l=j*j;m=k*k;n=j*(1.0- +h[g+416>>3]*m+l*(+h[g+424>>3]+ +h[g+432>>3]*k- +h[g+440>>3]*l+ +h[g+448>>3]*m- +h[g+464>>3]*l*k)+m*(+h[g+456>>3]*m- +h[g+472>>3]*l*k));j=+h[g+296>>3]+k*(m*(-0.0- +h[g+488>>3]+ +h[g+536>>3]*m)+1.0)+l*(-0.0- +h[g+480>>3]+k*(-0.0- +h[g+496>>3]+k*(-0.0- +h[g+512>>3]+k*(-0.0- +h[g+528>>3]+k*+h[g+560>>3])))+l*(+h[g+504>>3]+k*(+h[g+520>>3]+k*+h[g+552>>3])-l*+h[g+544>>3]));h[f+8>>3]=+Vm(c[g>>2]|0,j,c[g+568>>2]|0);j=+T(+h[f+8>>3]);l=n*+Q(1.0- +h[g+64>>3]*j*j);h[f>>3]=l/+S(+h[f+8>>3]);g=a;a=f;c[g>>2]=c[a>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];i=e;return}function _m(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){b=16}else{b=a+11&-8}d=b>>>3;e=c[5820]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=23320+(h<<2)|0;j=23320+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[5820]=e&~(1<<g)}else{if(l>>>0<(c[5824]|0)>>>0){oa();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{oa();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[5822]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=23320+(p<<2)|0;m=23320+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[5820]=e&~(1<<r)}else{if(l>>>0<(c[5824]|0)>>>0){oa();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{oa();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[5822]|0;if((l|0)!=0){q=c[5825]|0;d=l>>>3;l=d<<1;f=23320+(l<<2)|0;k=c[5820]|0;h=1<<d;do{if((k&h|0)==0){c[5820]=k|h;s=f;t=23320+(l+2<<2)|0}else{d=23320+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[5824]|0)>>>0){s=g;t=d;break}oa();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[5822]=m;c[5825]=e;n=i;return n|0}l=c[5821]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[23584+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[5824]|0;if(r>>>0<i>>>0){oa();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){oa();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){oa();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){oa();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){oa();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{oa();return 0}}}while(0);a:do{if((e|0)!=0){f=d+28|0;i=23584+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[5821]=c[5821]&~(1<<c[f>>2]);break a}else{if(e>>>0<(c[5824]|0)>>>0){oa();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break a}}}while(0);if(v>>>0<(c[5824]|0)>>>0){oa();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16>>>0){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[5822]|0;if((f|0)!=0){e=c[5825]|0;i=f>>>3;f=i<<1;q=23320+(f<<2)|0;k=c[5820]|0;g=1<<i;do{if((k&g|0)==0){c[5820]=k|g;y=q;z=23320+(f+2<<2)|0}else{i=23320+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[5824]|0)>>>0){y=l;z=i;break}oa();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[5822]=p;c[5825]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231>>>0){o=-1;break}f=a+11|0;g=f&-8;k=c[5821]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215>>>0){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[23584+(A<<2)>>2]|0;b:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break b}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[23584+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[5822]|0)-g|0)>>>0){o=g;break}q=K;m=c[5824]|0;if(q>>>0<m>>>0){oa();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){oa();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){oa();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){oa();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){oa();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{oa();return 0}}}while(0);c:do{if((e|0)!=0){i=K+28|0;m=23584+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[5821]=c[5821]&~(1<<c[i>>2]);break c}else{if(e>>>0<(c[5824]|0)>>>0){oa();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break c}}}while(0);if(L>>>0<(c[5824]|0)>>>0){oa();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16>>>0){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256>>>0){e=i<<1;m=23320+(e<<2)|0;r=c[5820]|0;j=1<<i;do{if((r&j|0)==0){c[5820]=r|j;O=m;P=23320+(e+2<<2)|0}else{i=23320+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[5824]|0)>>>0){O=d;P=i;break}oa();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215>>>0){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=23584+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[5821]|0;l=1<<Q;if((m&l|0)==0){c[5821]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=151;break}else{l=l<<1;m=j}}if((T|0)==151){if(S>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[5824]|0;if(m>>>0<i>>>0){oa();return 0}if(j>>>0<i>>>0){oa();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[5822]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[5825]|0;if(S>>>0>15>>>0){R=J;c[5825]=R+o;c[5822]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[5822]=0;c[5825]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[5823]|0;if(o>>>0<J>>>0){S=J-o|0;c[5823]=S;J=c[5826]|0;K=J;c[5826]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[5782]|0)==0){J=_a(30)|0;if((J-1&J|0)==0){c[5784]=J;c[5783]=J;c[5785]=-1;c[5786]=-1;c[5787]=0;c[5931]=0;c[5782]=(fb(0)|0)&-16^1431655768;break}else{oa();return 0}}}while(0);J=o+48|0;S=c[5784]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[5930]|0;do{if((O|0)!=0){P=c[5928]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);d:do{if((c[5931]&4|0)==0){O=c[5826]|0;e:do{if((O|0)==0){T=181}else{L=O;P=23728;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=181;break e}else{P=M}}if((P|0)==0){T=181;break}L=R-(c[5823]|0)&Q;if(L>>>0>=2147483647>>>0){W=0;break}m=Bb(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=190}}while(0);do{if((T|0)==181){O=Bb(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[5783]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[5928]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647>>>0)){W=0;break}m=c[5930]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=Bb($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=190}}while(0);f:do{if((T|0)==190){m=-_|0;if((X|0)!=-1){aa=Y;ba=X;T=201;break d}do{if((Z|0)!=-1&_>>>0<2147483647>>>0&_>>>0<J>>>0){g=c[5784]|0;O=K-_+g&-g;if(O>>>0>=2147483647>>>0){ca=_;break}if((Bb(O|0)|0)==-1){Bb(m|0)|0;W=Y;break f}else{ca=O+_|0;break}}else{ca=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ca;ba=Z;T=201;break d}}}while(0);c[5931]=c[5931]|4;da=W;T=198}else{da=0;T=198}}while(0);do{if((T|0)==198){if(S>>>0>=2147483647>>>0){break}W=Bb(S|0)|0;Z=Bb(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ca=Z-W|0;Z=ca>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ca:da;ba=Y;T=201}}}while(0);do{if((T|0)==201){da=(c[5928]|0)+aa|0;c[5928]=da;if(da>>>0>(c[5929]|0)>>>0){c[5929]=da}da=c[5826]|0;g:do{if((da|0)==0){S=c[5824]|0;if((S|0)==0|ba>>>0<S>>>0){c[5824]=ba}c[5932]=ba;c[5933]=aa;c[5935]=0;c[5829]=c[5782];c[5828]=-1;S=0;do{Y=S<<1;ca=23320+(Y<<2)|0;c[23320+(Y+3<<2)>>2]=ca;c[23320+(Y+2<<2)>>2]=ca;S=S+1|0;}while(S>>>0<32>>>0);S=ba+8|0;if((S&7|0)==0){ea=0}else{ea=-S&7}S=aa-40-ea|0;c[5826]=ba+ea;c[5823]=S;c[ba+(ea+4)>>2]=S|1;c[ba+(aa-36)>>2]=40;c[5827]=c[5786]}else{S=23728;while(1){fa=c[S>>2]|0;ga=S+4|0;ha=c[ga>>2]|0;if((ba|0)==(fa+ha|0)){T=213;break}ca=c[S+8>>2]|0;if((ca|0)==0){break}else{S=ca}}do{if((T|0)==213){if((c[S+12>>2]&8|0)!=0){break}ca=da;if(!(ca>>>0>=fa>>>0&ca>>>0<ba>>>0)){break}c[ga>>2]=ha+aa;ca=c[5826]|0;Y=(c[5823]|0)+aa|0;Z=ca;W=ca+8|0;if((W&7|0)==0){ia=0}else{ia=-W&7}W=Y-ia|0;c[5826]=Z+ia;c[5823]=W;c[Z+(ia+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[5827]=c[5786];break g}}while(0);if(ba>>>0<(c[5824]|0)>>>0){c[5824]=ba}S=ba+aa|0;Y=23728;while(1){ja=Y|0;if((c[ja>>2]|0)==(S|0)){T=223;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==223){if((c[Y+12>>2]&8|0)!=0){break}c[ja>>2]=ba;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ba+8|0;if((S&7|0)==0){ka=0}else{ka=-S&7}S=ba+(aa+8)|0;if((S&7|0)==0){la=0}else{la=-S&7}S=ba+(la+aa)|0;Z=S;W=ka+o|0;ca=ba+W|0;_=ca;K=S-(ba+ka)-o|0;c[ba+(ka+4)>>2]=o|3;do{if((Z|0)==(c[5826]|0)){J=(c[5823]|0)+K|0;c[5823]=J;c[5826]=_;c[ba+(W+4)>>2]=J|1}else{if((Z|0)==(c[5825]|0)){J=(c[5822]|0)+K|0;c[5822]=J;c[5825]=_;c[ba+(W+4)>>2]=J|1;c[ba+(J+W)>>2]=J;break}J=aa+4|0;X=c[ba+(J+la)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;h:do{if(X>>>0<256>>>0){U=c[ba+((la|8)+aa)>>2]|0;Q=c[ba+(aa+12+la)>>2]|0;R=23320+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[5824]|0)>>>0){oa();return 0}if((c[U+12>>2]|0)==(Z|0)){break}oa();return 0}}while(0);if((Q|0)==(U|0)){c[5820]=c[5820]&~(1<<V);break}do{if((Q|0)==(R|0)){ma=Q+8|0}else{if(Q>>>0<(c[5824]|0)>>>0){oa();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){ma=m;break}oa();return 0}}while(0);c[U+12>>2]=Q;c[ma>>2]=U}else{R=S;m=c[ba+((la|24)+aa)>>2]|0;P=c[ba+(aa+12+la)>>2]|0;do{if((P|0)==(R|0)){O=la|16;g=ba+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ba+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){na=0;break}else{pa=O;qa=e}}else{pa=L;qa=g}while(1){g=pa+20|0;L=c[g>>2]|0;if((L|0)!=0){pa=L;qa=g;continue}g=pa+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{pa=L;qa=g}}if(qa>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[qa>>2]=0;na=pa;break}}else{g=c[ba+((la|8)+aa)>>2]|0;if(g>>>0<(c[5824]|0)>>>0){oa();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){oa();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;na=P;break}else{oa();return 0}}}while(0);if((m|0)==0){break}P=ba+(aa+28+la)|0;U=23584+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=na;if((na|0)!=0){break}c[5821]=c[5821]&~(1<<c[P>>2]);break h}else{if(m>>>0<(c[5824]|0)>>>0){oa();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=na}else{c[m+20>>2]=na}if((na|0)==0){break h}}}while(0);if(na>>>0<(c[5824]|0)>>>0){oa();return 0}c[na+24>>2]=m;R=la|16;P=c[ba+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[na+16>>2]=P;c[P+24>>2]=na;break}}}while(0);P=c[ba+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[na+20>>2]=P;c[P+24>>2]=na;break}}}while(0);ra=ba+(($|la)+aa)|0;sa=$+K|0}else{ra=Z;sa=K}J=ra+4|0;c[J>>2]=c[J>>2]&-2;c[ba+(W+4)>>2]=sa|1;c[ba+(sa+W)>>2]=sa;J=sa>>>3;if(sa>>>0<256>>>0){V=J<<1;X=23320+(V<<2)|0;P=c[5820]|0;m=1<<J;do{if((P&m|0)==0){c[5820]=P|m;ta=X;ua=23320+(V+2<<2)|0}else{J=23320+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[5824]|0)>>>0){ta=U;ua=J;break}oa();return 0}}while(0);c[ua>>2]=_;c[ta+12>>2]=_;c[ba+(W+8)>>2]=ta;c[ba+(W+12)>>2]=X;break}V=ca;m=sa>>>8;do{if((m|0)==0){va=0}else{if(sa>>>0>16777215>>>0){va=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;va=sa>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=23584+(va<<2)|0;c[ba+(W+28)>>2]=va;c[ba+(W+20)>>2]=0;c[ba+(W+16)>>2]=0;X=c[5821]|0;Q=1<<va;if((X&Q|0)==0){c[5821]=X|Q;c[m>>2]=V;c[ba+(W+24)>>2]=m;c[ba+(W+12)>>2]=V;c[ba+(W+8)>>2]=V;break}if((va|0)==31){wa=0}else{wa=25-(va>>>1)|0}Q=sa<<wa;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(sa|0)){break}xa=X+16+(Q>>>31<<2)|0;m=c[xa>>2]|0;if((m|0)==0){T=296;break}else{Q=Q<<1;X=m}}if((T|0)==296){if(xa>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[xa>>2]=V;c[ba+(W+24)>>2]=X;c[ba+(W+12)>>2]=V;c[ba+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[5824]|0;if(X>>>0<$>>>0){oa();return 0}if(m>>>0<$>>>0){oa();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ba+(W+8)>>2]=m;c[ba+(W+12)>>2]=X;c[ba+(W+24)>>2]=0;break}}}while(0);n=ba+(ka|8)|0;return n|0}}while(0);Y=da;W=23728;while(1){ya=c[W>>2]|0;if(ya>>>0<=Y>>>0){za=c[W+4>>2]|0;Aa=ya+za|0;if(Aa>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ya+(za-39)|0;if((W&7|0)==0){Ba=0}else{Ba=-W&7}W=ya+(za-47+Ba)|0;ca=W>>>0<(da+16|0)>>>0?Y:W;W=ca+8|0;_=ba+8|0;if((_&7|0)==0){Ca=0}else{Ca=-_&7}_=aa-40-Ca|0;c[5826]=ba+Ca;c[5823]=_;c[ba+(Ca+4)>>2]=_|1;c[ba+(aa-36)>>2]=40;c[5827]=c[5786];c[ca+4>>2]=27;c[W>>2]=c[5932];c[W+4>>2]=c[5933];c[W+8>>2]=c[5934];c[W+12>>2]=c[5935];c[5932]=ba;c[5933]=aa;c[5935]=0;c[5934]=W;W=ca+28|0;c[W>>2]=7;if((ca+32|0)>>>0<Aa>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<Aa>>>0){_=W}else{break}}}if((ca|0)==(Y|0)){break}_=ca-da|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[da+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256>>>0){K=W<<1;Z=23320+(K<<2)|0;S=c[5820]|0;m=1<<W;do{if((S&m|0)==0){c[5820]=S|m;Da=Z;Ea=23320+(K+2<<2)|0}else{W=23320+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[5824]|0)>>>0){Da=Q;Ea=W;break}oa();return 0}}while(0);c[Ea>>2]=da;c[Da+12>>2]=da;c[da+8>>2]=Da;c[da+12>>2]=Z;break}K=da;m=_>>>8;do{if((m|0)==0){Fa=0}else{if(_>>>0>16777215>>>0){Fa=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ca=(Y+520192|0)>>>16&4;W=Y<<ca;Y=(W+245760|0)>>>16&2;Q=14-(ca|S|Y)+(W<<Y>>>15)|0;Fa=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=23584+(Fa<<2)|0;c[da+28>>2]=Fa;c[da+20>>2]=0;c[da+16>>2]=0;Z=c[5821]|0;Q=1<<Fa;if((Z&Q|0)==0){c[5821]=Z|Q;c[m>>2]=K;c[da+24>>2]=m;c[da+12>>2]=da;c[da+8>>2]=da;break}if((Fa|0)==31){Ga=0}else{Ga=25-(Fa>>>1)|0}Q=_<<Ga;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}Ha=Z+16+(Q>>>31<<2)|0;m=c[Ha>>2]|0;if((m|0)==0){T=331;break}else{Q=Q<<1;Z=m}}if((T|0)==331){if(Ha>>>0<(c[5824]|0)>>>0){oa();return 0}else{c[Ha>>2]=K;c[da+24>>2]=Z;c[da+12>>2]=da;c[da+8>>2]=da;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[5824]|0;if(Z>>>0<m>>>0){oa();return 0}if(_>>>0<m>>>0){oa();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[da+8>>2]=_;c[da+12>>2]=Z;c[da+24>>2]=0;break}}}while(0);da=c[5823]|0;if(da>>>0<=o>>>0){break}_=da-o|0;c[5823]=_;da=c[5826]|0;Q=da;c[5826]=Q+o;c[Q+(o+4)>>2]=_|1;c[da+4>>2]=o|3;n=da+8|0;return n|0}}while(0);c[(wb()|0)>>2]=12;n=0;return n|0}function $m(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[5824]|0;if(b>>>0<e>>>0){oa()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){oa()}h=f&-8;i=a+(h-8)|0;j=i;a:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){oa()}if((n|0)==(c[5825]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[5822]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256>>>0){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=23320+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){oa()}if((c[k+12>>2]|0)==(n|0)){break}oa()}}while(0);if((s|0)==(k|0)){c[5820]=c[5820]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){oa()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}oa()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){oa()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){oa()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){oa()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{oa()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=23584+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[5821]=c[5821]&~(1<<c[v>>2]);q=n;r=o;break a}else{if(p>>>0<(c[5824]|0)>>>0){oa()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break a}}}while(0);if(A>>>0<(c[5824]|0)>>>0){oa()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[5824]|0)>>>0){oa()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[5824]|0)>>>0){oa()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){oa()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){oa()}do{if((e&2|0)==0){if((j|0)==(c[5826]|0)){B=(c[5823]|0)+r|0;c[5823]=B;c[5826]=q;c[q+4>>2]=B|1;if((q|0)!=(c[5825]|0)){return}c[5825]=0;c[5822]=0;return}if((j|0)==(c[5825]|0)){B=(c[5822]|0)+r|0;c[5822]=B;c[5825]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;b:do{if(e>>>0<256>>>0){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=23320+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[5824]|0)>>>0){oa()}if((c[u+12>>2]|0)==(j|0)){break}oa()}}while(0);if((g|0)==(u|0)){c[5820]=c[5820]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[5824]|0)>>>0){oa()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}oa()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[5824]|0)>>>0){oa()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[5824]|0)>>>0){oa()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){oa()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{oa()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=23584+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[5821]=c[5821]&~(1<<c[t>>2]);break b}else{if(f>>>0<(c[5824]|0)>>>0){oa()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break b}}}while(0);if(E>>>0<(c[5824]|0)>>>0){oa()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[5824]|0)>>>0){oa()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[5824]|0)>>>0){oa()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[5825]|0)){H=B;break}c[5822]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256>>>0){d=r<<1;e=23320+(d<<2)|0;A=c[5820]|0;E=1<<r;do{if((A&E|0)==0){c[5820]=A|E;I=e;J=23320+(d+2<<2)|0}else{r=23320+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[5824]|0)>>>0){I=h;J=r;break}oa()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215>>>0){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=23584+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[5821]|0;d=1<<K;do{if((r&d|0)==0){c[5821]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=129;break}else{A=A<<1;J=E}}if((N|0)==129){if(M>>>0<(c[5824]|0)>>>0){oa()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[5824]|0;if(J>>>0<E>>>0){oa()}if(B>>>0<E>>>0){oa()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[5828]|0)-1|0;c[5828]=q;if((q|0)==0){O=23736}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[5828]=-1;return}function an(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0,S=0.0,T=0.0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0.0,ia=0.0,ja=0,ka=0,la=0.0,ma=0.0,na=0,oa=0.0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0.0,ya=0,za=0.0,Aa=0,Ba=0.0,Ca=0,Da=0,Ea=0,Fa=0.0,Ga=0,Ha=0.0,Ia=0.0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,yb=0,zb=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0.0,Ac=0,Bc=0,Cc=0.0,Dc=0.0,Ec=0.0,Fc=0.0,Gc=0.0,Hc=0.0,Ic=0.0,Jc=0,Kc=0,Lc=0.0,Mc=0,Nc=0;g=i;i=i+512|0;h=g|0;if((e|0)==2){j=-1074;k=53}else if((e|0)==0){j=-149;k=24}else if((e|0)==1){j=-1074;k=53}else{l=0.0;i=g;return+l}e=b+4|0;m=b+100|0;do{n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;o=d[n]|0}else{o=dn(b)|0}}while((xb(o|0)|0)!=0);do{if((o|0)==45|(o|0)==43){n=1-(((o|0)==45)<<1)|0;r=c[e>>2]|0;if(r>>>0<(c[m>>2]|0)>>>0){c[e>>2]=r+1;s=d[r]|0;t=n;break}else{s=dn(b)|0;t=n;break}}else{s=o;t=1}}while(0);o=0;n=s;while(1){if((n|32|0)!=(a[14888+o|0]|0)){u=o;v=n;break}do{if(o>>>0<7>>>0){s=c[e>>2]|0;if(s>>>0<(c[m>>2]|0)>>>0){c[e>>2]=s+1;w=d[s]|0;break}else{w=dn(b)|0;break}}else{w=n}}while(0);s=o+1|0;if(s>>>0<8>>>0){o=s;n=w}else{u=s;v=w;break}}do{if((u|0)==3){x=23}else if((u|0)!=8){w=(f|0)==0;if(!(u>>>0<4>>>0|w)){if((u|0)==8){break}else{x=23;break}}do{if((u|0)==0){if((v|32|0)==110){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;y=d[n]|0}else{y=dn(b)|0}if((y|32|0)!=97){break}n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;z=d[n]|0}else{z=dn(b)|0}if((z|32|0)!=110){break}n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;A=d[n]|0}else{A=dn(b)|0}if((A|0)==40){B=1}else{if((c[m>>2]|0)==0){l=+p;i=g;return+l}c[e>>2]=(c[e>>2]|0)-1;l=+p;i=g;return+l}while(1){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;C=d[n]|0}else{C=dn(b)|0}if(!((C-48|0)>>>0<10>>>0|(C-65|0)>>>0<26>>>0)){if(!((C-97|0)>>>0<26>>>0|(C|0)==95)){break}}B=B+1|0}if((C|0)==41){l=+p;i=g;return+l}n=(c[m>>2]|0)==0;if(!n){c[e>>2]=(c[e>>2]|0)-1}if(w){c[(wb()|0)>>2]=22;cn(b,0);l=0.0;i=g;return+l}if((B|0)==0|n){l=+p;i=g;return+l}else{D=B}while(1){n=D-1|0;c[e>>2]=(c[e>>2]|0)-1;if((n|0)==0){l=+p;break}else{D=n}}i=g;return+l}do{if((v|0)==48){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;F=d[n]|0}else{F=dn(b)|0}if((F|32|0)!=120){if((c[m>>2]|0)==0){G=48;break}c[e>>2]=(c[e>>2]|0)-1;G=48;break}n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;H=d[n]|0;I=0}else{H=dn(b)|0;I=0}while(1){if((H|0)==46){x=68;break}else if((H|0)!=48){J=H;K=0;L=0;M=0;N=0;O=I;Q=0;R=0;S=1.0;T=0.0;U=0;break}n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;H=d[n]|0;I=1;continue}else{H=dn(b)|0;I=1;continue}}a:do{if((x|0)==68){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;V=d[n]|0}else{V=dn(b)|0}if((V|0)==48){W=-1;X=-1}else{J=V;K=0;L=0;M=0;N=0;O=I;Q=1;R=0;S=1.0;T=0.0;U=0;break}while(1){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;Y=d[n]|0}else{Y=dn(b)|0}if((Y|0)!=48){J=Y;K=0;L=0;M=W;N=X;O=1;Q=1;R=0;S=1.0;T=0.0;U=0;break a}n=rn(X,W,-1,-1)|0;W=E;X=n}}}while(0);b:while(1){n=J-48|0;do{if(n>>>0<10>>>0){Z=n;x=82}else{o=J|32;s=(J|0)==46;if(!((o-97|0)>>>0<6>>>0|s)){_=J;break b}if(s){if((Q|0)==0){$=K;ba=L;ca=K;da=L;ea=O;fa=1;ga=R;ha=S;ia=T;ja=U;break}else{_=46;break b}}else{Z=(J|0)>57?o-87|0:n;x=82;break}}}while(0);if((x|0)==82){x=0;n=0;do{if((K|0)<(n|0)|(K|0)==(n|0)&L>>>0<8>>>0){ka=R;la=S;ma=T;na=Z+(U<<4)|0}else{o=0;if((K|0)<(o|0)|(K|0)==(o|0)&L>>>0<14>>>0){oa=S*.0625;ka=R;la=oa;ma=T+oa*+(Z|0);na=U;break}if(!((Z|0)!=0&(R|0)==0)){ka=R;la=S;ma=T;na=U;break}ka=1;la=S;ma=T+S*.5;na=U}}while(0);n=rn(L,K,1,0)|0;$=E;ba=n;ca=M;da=N;ea=1;fa=Q;ga=ka;ha=la;ia=ma;ja=na}n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;J=d[n]|0;K=$;L=ba;M=ca;N=da;O=ea;Q=fa;R=ga;S=ha;T=ia;U=ja;continue}else{J=dn(b)|0;K=$;L=ba;M=ca;N=da;O=ea;Q=fa;R=ga;S=ha;T=ia;U=ja;continue}}if((O|0)==0){n=(c[m>>2]|0)==0;if(!n){c[e>>2]=(c[e>>2]|0)-1}do{if(w){cn(b,0)}else{if(n){break}o=c[e>>2]|0;c[e>>2]=o-1;if((Q|0)==0){break}c[e>>2]=o-2}}while(0);l=+(t|0)*0.0;i=g;return+l}n=(Q|0)==0;o=n?L:N;s=n?K:M;n=0;if((K|0)<(n|0)|(K|0)==(n|0)&L>>>0<8>>>0){n=U;r=K;pa=L;while(1){qa=n<<4;ra=rn(pa,r,1,0)|0;sa=E;ta=0;if((sa|0)<(ta|0)|(sa|0)==(ta|0)&ra>>>0<8>>>0){n=qa;r=sa;pa=ra}else{ua=qa;break}}}else{ua=U}do{if((_|32|0)==112){pa=bn(b,f)|0;r=E;if(!((pa|0)==0&(r|0)==(-2147483648|0))){va=r;wa=pa;break}if(w){cn(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)-1;va=0;wa=0;break}}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)-1;va=0;wa=0}}while(0);pa=rn(o<<2|0>>>30,s<<2|o>>>30,-32,-1)|0;r=rn(pa,E,wa,va)|0;pa=E;if((ua|0)==0){l=+(t|0)*0.0;i=g;return+l}n=0;if((pa|0)>(n|0)|(pa|0)==(n|0)&r>>>0>(-j|0)>>>0){c[(wb()|0)>>2]=34;l=+(t|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}n=j-106|0;qa=(n|0)<0|0?-1:0;if((pa|0)<(qa|0)|(pa|0)==(qa|0)&r>>>0<n>>>0){c[(wb()|0)>>2]=34;l=+(t|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((ua|0)>-1){n=ua;oa=T;qa=pa;ra=r;while(1){sa=n<<1;if(oa<.5){xa=oa;ya=sa}else{xa=oa+-1.0;ya=sa|1}za=oa+xa;sa=rn(ra,qa,-1,-1)|0;ta=E;if((ya|0)>-1){n=ya;oa=za;qa=ta;ra=sa}else{Aa=ya;Ba=za;Ca=ta;Da=sa;break}}}else{Aa=ua;Ba=T;Ca=pa;Da=r}ra=0;qa=sn(32,0,j,(j|0)<0|0?-1:0)|0;n=rn(Da,Ca,qa,E)|0;qa=E;if((ra|0)>(qa|0)|(ra|0)==(qa|0)&k>>>0>n>>>0){qa=n;Ea=(qa|0)<0?0:qa}else{Ea=k}do{if((Ea|0)<53){oa=+(t|0);za=+Ab(+(+en(1.0,84-Ea|0)),+oa);if(!((Ea|0)<32&Ba!=0.0)){Fa=Ba;Ga=Aa;Ha=za;Ia=oa;break}qa=Aa&1;Fa=(qa|0)==0?0.0:Ba;Ga=(qa^1)+Aa|0;Ha=za;Ia=oa}else{Fa=Ba;Ga=Aa;Ha=0.0;Ia=+(t|0)}}while(0);oa=Ia*Fa+(Ha+Ia*+(Ga>>>0>>>0))-Ha;if(oa==0.0){c[(wb()|0)>>2]=34}l=+fn(oa,Da);i=g;return+l}else{G=v}}while(0);r=j+k|0;pa=3-r|0;qa=G;n=0;while(1){if((qa|0)==46){x=137;break}else if((qa|0)!=48){Ja=qa;Ka=0;La=n;Ma=0;Na=0;break}ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;qa=d[ra]|0;n=1;continue}else{qa=dn(b)|0;n=1;continue}}c:do{if((x|0)==137){qa=c[e>>2]|0;if(qa>>>0<(c[m>>2]|0)>>>0){c[e>>2]=qa+1;Oa=d[qa]|0}else{Oa=dn(b)|0}if((Oa|0)==48){Pa=-1;Qa=-1}else{Ja=Oa;Ka=1;La=n;Ma=0;Na=0;break}while(1){qa=c[e>>2]|0;if(qa>>>0<(c[m>>2]|0)>>>0){c[e>>2]=qa+1;Ra=d[qa]|0}else{Ra=dn(b)|0}if((Ra|0)!=48){Ja=Ra;Ka=1;La=1;Ma=Pa;Na=Qa;break c}qa=rn(Qa,Pa,-1,-1)|0;Pa=E;Qa=qa}}}while(0);n=h|0;c[n>>2]=0;qa=Ja-48|0;ra=(Ja|0)==46;d:do{if(qa>>>0<10>>>0|ra){o=h+496|0;s=Ma;sa=Na;ta=0;Sa=0;Ta=0;Ua=La;Va=Ka;Wa=0;Xa=0;Ya=Ja;Za=qa;_a=ra;while(1){do{if(_a){if((Va|0)==0){$a=Xa;ab=Wa;cb=1;db=Ua;eb=Ta;fb=ta;gb=Sa;hb=ta;ib=Sa}else{jb=s;kb=sa;lb=ta;mb=Sa;nb=Ta;ob=Ua;pb=Wa;qb=Xa;rb=Ya;break d}}else{sb=rn(Sa,ta,1,0)|0;tb=E;ub=(Ya|0)!=48;if((Wa|0)>=125){if(!ub){$a=Xa;ab=Wa;cb=Va;db=Ua;eb=Ta;fb=tb;gb=sb;hb=s;ib=sa;break}c[o>>2]=c[o>>2]|1;$a=Xa;ab=Wa;cb=Va;db=Ua;eb=Ta;fb=tb;gb=sb;hb=s;ib=sa;break}vb=h+(Wa<<2)|0;if((Xa|0)==0){yb=Za}else{yb=Ya-48+((c[vb>>2]|0)*10|0)|0}c[vb>>2]=yb;vb=Xa+1|0;zb=(vb|0)==9;$a=zb?0:vb;ab=(zb&1)+Wa|0;cb=Va;db=1;eb=ub?sb:Ta;fb=tb;gb=sb;hb=s;ib=sa}}while(0);sb=c[e>>2]|0;if(sb>>>0<(c[m>>2]|0)>>>0){c[e>>2]=sb+1;Bb=d[sb]|0}else{Bb=dn(b)|0}sb=Bb-48|0;tb=(Bb|0)==46;if(sb>>>0<10>>>0|tb){s=hb;sa=ib;ta=fb;Sa=gb;Ta=eb;Ua=db;Va=cb;Wa=ab;Xa=$a;Ya=Bb;Za=sb;_a=tb}else{Cb=hb;Db=ib;Eb=fb;Fb=gb;Gb=eb;Hb=db;Ib=cb;Jb=ab;Kb=$a;Lb=Bb;x=160;break}}}else{Cb=Ma;Db=Na;Eb=0;Fb=0;Gb=0;Hb=La;Ib=Ka;Jb=0;Kb=0;Lb=Ja;x=160}}while(0);if((x|0)==160){ra=(Ib|0)==0;jb=ra?Eb:Cb;kb=ra?Fb:Db;lb=Eb;mb=Fb;nb=Gb;ob=Hb;pb=Jb;qb=Kb;rb=Lb}ra=(ob|0)!=0;do{if(ra){if((rb|32|0)!=101){x=169;break}qa=bn(b,f)|0;_a=E;do{if((qa|0)==0&(_a|0)==(-2147483648|0)){if(w){cn(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){Mb=0;Nb=0;break}c[e>>2]=(c[e>>2]|0)-1;Mb=0;Nb=0;break}}else{Mb=_a;Nb=qa}}while(0);qa=rn(Nb,Mb,kb,jb)|0;Ob=E;Pb=qa}else{x=169}}while(0);do{if((x|0)==169){if((rb|0)<=-1){Ob=jb;Pb=kb;break}if((c[m>>2]|0)==0){Ob=jb;Pb=kb;break}c[e>>2]=(c[e>>2]|0)-1;Ob=jb;Pb=kb}}while(0);if(!ra){c[(wb()|0)>>2]=22;cn(b,0);l=0.0;i=g;return+l}qa=c[n>>2]|0;if((qa|0)==0){l=+(t|0)*0.0;i=g;return+l}_a=0;do{if((Pb|0)==(mb|0)&(Ob|0)==(lb|0)&((lb|0)<(_a|0)|(lb|0)==(_a|0)&mb>>>0<10>>>0)){if(k>>>0<=30>>>0){if((qa>>>(k>>>0)|0)!=0){break}}l=+(t|0)*+(qa>>>0>>>0);i=g;return+l}}while(0);qa=(j|0)/-2|0;_a=(qa|0)<0|0?-1:0;if((Ob|0)>(_a|0)|(Ob|0)==(_a|0)&Pb>>>0>qa>>>0){c[(wb()|0)>>2]=34;l=+(t|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}qa=j-106|0;_a=(qa|0)<0|0?-1:0;if((Ob|0)<(_a|0)|(Ob|0)==(_a|0)&Pb>>>0<qa>>>0){c[(wb()|0)>>2]=34;l=+(t|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((qb|0)==0){Qb=pb}else{if((qb|0)<9){qa=h+(pb<<2)|0;_a=qb;ra=c[qa>>2]|0;do{ra=ra*10|0;_a=_a+1|0;}while((_a|0)<9);c[qa>>2]=ra}Qb=pb+1|0}_a=Pb;do{if((nb|0)<9){if(!((nb|0)<=(_a|0)&(_a|0)<18)){break}if((_a|0)==9){l=+(t|0)*+((c[n>>2]|0)>>>0>>>0);i=g;return+l}if((_a|0)<9){l=+(t|0)*+((c[n>>2]|0)>>>0>>>0)/+(c[12656+(8-_a<<2)>>2]|0);i=g;return+l}Za=k+27+(_a*-3|0)|0;Ya=c[n>>2]|0;if((Za|0)<=30){if((Ya>>>(Za>>>0)|0)!=0){break}}l=+(t|0)*+(Ya>>>0>>>0)*+(c[12656+(_a-10<<2)>>2]|0);i=g;return+l}}while(0);n=(_a|0)%9|0;if((n|0)==0){Rb=0;Sb=Qb;Tb=0;Ub=_a}else{ra=(_a|0)>-1?n:n+9|0;n=c[12656+(8-ra<<2)>>2]|0;do{if((Qb|0)==0){Vb=0;Wb=0;Xb=_a}else{qa=1e9/(n|0)|0;Ya=_a;Za=0;Xa=0;Wa=0;while(1){Va=h+(Xa<<2)|0;Ua=c[Va>>2]|0;Ta=((Ua>>>0)/(n>>>0)|0)+Wa|0;c[Va>>2]=Ta;Yb=aa((Ua>>>0)%(n>>>0)|0,qa)|0;Ua=Xa+1|0;if((Xa|0)==(Za|0)&(Ta|0)==0){Zb=Ua&127;_b=Ya-9|0}else{Zb=Za;_b=Ya}if((Ua|0)==(Qb|0)){break}else{Ya=_b;Za=Zb;Xa=Ua;Wa=Yb}}if((Yb|0)==0){Vb=Qb;Wb=Zb;Xb=_b;break}c[h+(Qb<<2)>>2]=Yb;Vb=Qb+1|0;Wb=Zb;Xb=_b}}while(0);Rb=Wb;Sb=Vb;Tb=0;Ub=9-ra+Xb|0}e:while(1){n=h+(Rb<<2)|0;if((Ub|0)<18){_a=Sb;Wa=Tb;while(1){Xa=0;Za=_a+127|0;Ya=_a;while(1){qa=Za&127;Ua=h+(qa<<2)|0;Ta=c[Ua>>2]|0;Va=rn(Ta<<29|0>>>3,0<<29|Ta>>>3,Xa,0)|0;Ta=E;Sa=0;if(Ta>>>0>Sa>>>0|Ta>>>0==Sa>>>0&Va>>>0>1e9>>>0){Sa=Cn(Va,Ta,1e9,0)|0;ta=Dn(Va,Ta,1e9,0)|0;$b=Sa;ac=ta}else{$b=0;ac=Va}c[Ua>>2]=ac;Ua=(qa|0)==(Rb|0);if((qa|0)!=(Ya+127&127|0)|Ua){bc=Ya}else{bc=(ac|0)==0?qa:Ya}if(Ua){break}else{Xa=$b;Za=qa-1|0;Ya=bc}}Ya=Wa-29|0;if(($b|0)==0){_a=bc;Wa=Ya}else{cc=Ya;dc=bc;ec=$b;break}}}else{if((Ub|0)==18){fc=Sb;gc=Tb}else{hc=Rb;ic=Sb;jc=Tb;kc=Ub;break}while(1){if((c[n>>2]|0)>>>0>=9007199>>>0){hc=Rb;ic=fc;jc=gc;kc=18;break e}Wa=0;_a=fc+127|0;Ya=fc;while(1){Za=_a&127;Xa=h+(Za<<2)|0;qa=c[Xa>>2]|0;Ua=rn(qa<<29|0>>>3,0<<29|qa>>>3,Wa,0)|0;qa=E;Va=0;if(qa>>>0>Va>>>0|qa>>>0==Va>>>0&Ua>>>0>1e9>>>0){Va=Cn(Ua,qa,1e9,0)|0;ta=Dn(Ua,qa,1e9,0)|0;lc=Va;mc=ta}else{lc=0;mc=Ua}c[Xa>>2]=mc;Xa=(Za|0)==(Rb|0);if((Za|0)!=(Ya+127&127|0)|Xa){nc=Ya}else{nc=(mc|0)==0?Za:Ya}if(Xa){break}else{Wa=lc;_a=Za-1|0;Ya=nc}}Ya=gc-29|0;if((lc|0)==0){fc=nc;gc=Ya}else{cc=Ya;dc=nc;ec=lc;break}}}n=Rb+127&127;if((n|0)==(dc|0)){Ya=dc+127&127;_a=h+((dc+126&127)<<2)|0;c[_a>>2]=c[_a>>2]|c[h+(Ya<<2)>>2];oc=Ya}else{oc=dc}c[h+(n<<2)>>2]=ec;Rb=n;Sb=oc;Tb=cc;Ub=Ub+9|0}f:while(1){pc=ic+1&127;ra=h+((ic+127&127)<<2)|0;n=hc;Ya=jc;_a=kc;while(1){Wa=(_a|0)==18;Za=(_a|0)>27?9:1;qc=n;rc=Ya;while(1){Xa=0;while(1){if((Xa|0)>=2){sc=Xa;break}Ua=Xa+qc&127;if((Ua|0)==(ic|0)){sc=2;break}ta=c[h+(Ua<<2)>>2]|0;Ua=c[12648+(Xa<<2)>>2]|0;if(ta>>>0<Ua>>>0){sc=2;break}if(ta>>>0>Ua>>>0){sc=Xa;break}else{Xa=Xa+1|0}}if((sc|0)==2&Wa){break f}tc=Za+rc|0;if((qc|0)==(ic|0)){qc=ic;rc=tc}else{break}}Wa=(1<<Za)-1|0;Xa=1e9>>>(Za>>>0);uc=_a;vc=qc;Ua=qc;wc=0;do{ta=h+(Ua<<2)|0;Va=c[ta>>2]|0;qa=(Va>>>(Za>>>0))+wc|0;c[ta>>2]=qa;wc=aa(Va&Wa,Xa)|0;Va=(Ua|0)==(vc|0)&(qa|0)==0;Ua=Ua+1&127;uc=Va?uc-9|0:uc;vc=Va?Ua:vc;}while((Ua|0)!=(ic|0));if((wc|0)==0){n=vc;Ya=tc;_a=uc;continue}if((pc|0)!=(vc|0)){break}c[ra>>2]=c[ra>>2]|1;n=vc;Ya=tc;_a=uc}c[h+(ic<<2)>>2]=wc;hc=vc;ic=pc;jc=tc;kc=uc}_a=qc&127;if((_a|0)==(ic|0)){c[h+(pc-1<<2)>>2]=0;xc=pc}else{xc=ic}oa=+((c[h+(_a<<2)>>2]|0)>>>0>>>0);_a=qc+1&127;if((_a|0)==(xc|0)){Ya=xc+1&127;c[h+(Ya-1<<2)>>2]=0;yc=Ya}else{yc=xc}za=+(t|0);zc=za*(oa*1.0e9+ +((c[h+(_a<<2)>>2]|0)>>>0>>>0));_a=rc+53|0;Ya=_a-j|0;if((Ya|0)<(k|0)){Ac=(Ya|0)<0?0:Ya;Bc=1}else{Ac=k;Bc=0}if((Ac|0)<53){oa=+Ab(+(+en(1.0,105-Ac|0)),+zc);Cc=+bb(+zc,+(+en(1.0,53-Ac|0)));Dc=oa;Ec=Cc;Fc=oa+(zc-Cc)}else{Dc=0.0;Ec=0.0;Fc=zc}n=qc+2&127;do{if((n|0)==(yc|0)){Gc=Ec}else{ra=c[h+(n<<2)>>2]|0;do{if(ra>>>0<5e8>>>0){if((ra|0)==0){if((qc+3&127|0)==(yc|0)){Hc=Ec;break}}Hc=za*.25+Ec}else{if(ra>>>0>5e8>>>0){Hc=za*.75+Ec;break}if((qc+3&127|0)==(yc|0)){Hc=za*.5+Ec;break}else{Hc=za*.75+Ec;break}}}while(0);if((53-Ac|0)<=1){Gc=Hc;break}if(+bb(+Hc,+1.0)!=0.0){Gc=Hc;break}Gc=Hc+1.0}}while(0);za=Fc+Gc-Dc;do{if((_a&2147483647|0)>(-2-r|0)){if(+P(+za)<9007199254740992.0){Ic=za;Jc=Bc;Kc=rc}else{Ic=za*.5;Jc=(Bc|0)!=0&(Ac|0)==(Ya|0)?0:Bc;Kc=rc+1|0}if((Kc+53|0)<=(pa|0)){if(!((Jc|0)!=0&Gc!=0.0)){Lc=Ic;Mc=Kc;break}}c[(wb()|0)>>2]=34;Lc=Ic;Mc=Kc}else{Lc=za;Mc=rc}}while(0);l=+fn(Lc,Mc);i=g;return+l}}while(0);if((c[m>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)-1}c[(wb()|0)>>2]=22;cn(b,0);l=0.0;i=g;return+l}}while(0);do{if((x|0)==23){b=(c[m>>2]|0)==0;if(!b){c[e>>2]=(c[e>>2]|0)-1}if(u>>>0<4>>>0|(f|0)==0|b){break}else{Nc=u}do{c[e>>2]=(c[e>>2]|0)-1;Nc=Nc-1|0;}while(Nc>>>0>3>>>0)}}while(0);l=+(t|0)*q;i=g;return+l}function bn(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=a+4|0;f=c[e>>2]|0;g=a+100|0;if(f>>>0<(c[g>>2]|0)>>>0){c[e>>2]=f+1;h=d[f]|0}else{h=dn(a)|0}do{if((h|0)==45|(h|0)==43){f=(h|0)==45|0;i=c[e>>2]|0;if(i>>>0<(c[g>>2]|0)>>>0){c[e>>2]=i+1;j=d[i]|0}else{j=dn(a)|0}if((j-48|0)>>>0<10>>>0|(b|0)==0){k=f;l=j;break}if((c[g>>2]|0)==0){k=f;l=j;break}c[e>>2]=(c[e>>2]|0)-1;k=f;l=j}else{k=0;l=h}}while(0);if((l-48|0)>>>0>9>>>0){if((c[g>>2]|0)==0){m=-2147483648;n=0;return(E=m,n)|0}c[e>>2]=(c[e>>2]|0)-1;m=-2147483648;n=0;return(E=m,n)|0}else{o=l;p=0}while(1){q=o-48+p|0;l=c[e>>2]|0;if(l>>>0<(c[g>>2]|0)>>>0){c[e>>2]=l+1;r=d[l]|0}else{r=dn(a)|0}if(!((r-48|0)>>>0<10>>>0&(q|0)<214748364)){break}o=r;p=q*10|0}p=q;o=(q|0)<0|0?-1:0;if((r-48|0)>>>0<10>>>0){q=r;l=o;h=p;while(1){j=Bn(h,l,10,0)|0;b=E;f=rn(q,(q|0)<0|0?-1:0,-48,-1)|0;i=rn(f,E,j,b)|0;b=E;j=c[e>>2]|0;if(j>>>0<(c[g>>2]|0)>>>0){c[e>>2]=j+1;s=d[j]|0}else{s=dn(a)|0}j=21474836;if((s-48|0)>>>0<10>>>0&((b|0)<(j|0)|(b|0)==(j|0)&i>>>0<2061584302>>>0)){q=s;l=b;h=i}else{t=s;u=b;v=i;break}}}else{t=r;u=o;v=p}if((t-48|0)>>>0<10>>>0){do{t=c[e>>2]|0;if(t>>>0<(c[g>>2]|0)>>>0){c[e>>2]=t+1;w=d[t]|0}else{w=dn(a)|0}}while((w-48|0)>>>0<10>>>0)}if((c[g>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)-1}e=(k|0)!=0;k=sn(0,0,v,u)|0;m=e?E:u;n=e?k:v;return(E=m,n)|0}function cn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;d=c[a+8>>2]|0;e=c[a+4>>2]|0;f=d-e|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0)){c[a+100>>2]=e+b;return}else{c[a+100>>2]=d;return}}function dn(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=b+104|0;f=c[e>>2]|0;if((f|0)==0){g=3}else{if((c[b+108>>2]|0)<(f|0)){g=3}}do{if((g|0)==3){f=hn(b)|0;if((f|0)<0){break}h=c[e>>2]|0;i=c[b+8>>2]|0;do{if((h|0)==0){g=8}else{j=c[b+4>>2]|0;k=h-(c[b+108>>2]|0)-1|0;if((i-j|0)<=(k|0)){g=8;break}c[b+100>>2]=j+k}}while(0);if((g|0)==8){c[b+100>>2]=i}h=c[b+4>>2]|0;if((i|0)!=0){k=b+108|0;c[k>>2]=i+1-h+(c[k>>2]|0)}k=h-1|0;if((d[k]|0|0)==(f|0)){l=f;return l|0}a[k]=f;l=f;return l|0}}while(0);c[b+100>>2]=0;l=-1;return l|0}function en(a,b){a=+a;b=b|0;var d=0.0,e=0,f=0.0,g=0;do{if((b|0)>1023){d=a*8.98846567431158e+307;e=b-1023|0;if((e|0)<=1023){f=d;g=e;break}e=b-2046|0;f=d*8.98846567431158e+307;g=(e|0)>1023?1023:e}else{if((b|0)>=-1022){f=a;g=b;break}d=a*2.2250738585072014e-308;e=b+1022|0;if((e|0)>=-1022){f=d;g=e;break}e=b+2044|0;f=d*2.2250738585072014e-308;g=(e|0)<-1022?-1022:e}}while(0);return+(f*(c[k>>2]=0<<20|0>>>12,c[k+4>>2]=g+1023<<20|0>>>12,+h[k>>3]))}function fn(a,b){a=+a;b=b|0;return+(+en(a,b))}function gn(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b+74|0;e=a[d]|0;a[d]=e-1&255|e;e=b+20|0;d=b+44|0;if((c[e>>2]|0)>>>0>(c[d>>2]|0)>>>0){Mb[c[b+36>>2]&1](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[e>>2]=0;e=b|0;f=c[e>>2]|0;if((f&20|0)==0){g=c[d>>2]|0;c[b+8>>2]=g;c[b+4>>2]=g;h=0;return h|0}if((f&4|0)==0){h=-1;return h|0}c[e>>2]=f|32;h=-1;return h|0}function hn(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+8|0;e=b|0;if((c[a+8>>2]|0)==0){if((gn(a)|0)==0){f=3}else{g=-1}}else{f=3}do{if((f|0)==3){if((Mb[c[a+32>>2]&1](a,e,1)|0)!=1){g=-1;break}g=d[e]|0}}while(0);i=b;return g|0}function jn(a){a=a|0;return+(+kn(a,0))}function kn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0.0,j=0,k=0;d=i;i=i+112|0;e=d|0;ln(e|0,0,112)|0;f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;cn(e,0);h=+an(e,1,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if((b|0)==0){i=d;return+h}if((j|0)==0){k=a}else{k=a+j|0}c[b>>2]=k;i=d;return+h}function ln(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function mn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function nn(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function on(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function pn(b,c){b=b|0;c=c|0;var d=0,e=0;d=b+(nn(b)|0)|0;do{a[d+e|0]=a[c+e|0];e=e+1|0}while(a[c+(e-1)|0]|0);return b|0}function qn(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function rn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(E=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function sn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(E=e,a-c>>>0|0)|0}function tn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){E=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}E=a<<c-32;return 0}function un(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){E=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}E=0;return b>>>c-32|0}function vn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){E=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}E=(b|0)<0?-1:0;return b>>c-32|0}function wn(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function xn(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function yn(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=aa(d,c)|0;f=a>>>16;a=(e>>>16)+(aa(d,f)|0)|0;d=b>>>16;b=aa(d,c)|0;return(E=(a>>>16)+(aa(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function zn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=sn(e^a,f^b,e,f)|0;b=E;a=g^e;e=h^f;f=sn((En(i,b,sn(g^c,h^d,g,h)|0,E,0)|0)^a,E^e,a,e)|0;return(E=E,f)|0}function An(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=sn(h^a,j^b,h,j)|0;b=E;En(m,b,sn(k^d,l^e,k,l)|0,E,g)|0;l=sn(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=E;i=f;return(E=j,l)|0}function Bn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=yn(e,a)|0;f=E;return(E=(aa(b,a)|0)+(aa(d,e)|0)+f|f&0,c|0|0)|0}function Cn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=En(a,b,c,d,0)|0;return(E=E,e)|0}function Dn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;En(a,b,d,e,g)|0;i=f;return(E=c[g+4>>2]|0,c[g>>2]|0)|0}function En(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(E=n,o)|0}else{if(!m){n=0;o=0;return(E=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(E=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(E=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(E=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((xn(l|0)|0)>>>0);return(E=n,o)|0}p=(wn(l|0)|0)-(wn(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(E=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(E=n,o)|0}else{if(!m){r=(wn(l|0)|0)-(wn(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(E=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(E=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(wn(j|0)|0)+33-(wn(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(E=n,o)|0}else{p=xn(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(E=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;F=t;G=0;H=0}else{g=d|0|0;d=k|e&0;e=rn(g,d,-1,-1)|0;k=E;i=w;w=v;v=u;u=t;t=s;s=0;while(1){I=w>>>31|i<<1;J=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;sn(e,k,j,a)|0;b=E;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=sn(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=E;b=t-1|0;if((b|0)==0){break}else{i=I;w=J;v=M;u=L;t=b;s=K}}B=I;C=J;D=M;F=L;G=0;H=K}K=C;C=0;if((f|0)!=0){c[f>>2]=F;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|G;o=(K<<1|0>>>31)&-2|H;return(E=n,o)|0}function Fn(a,b){a=a|0;b=b|0;return Kb[a&511](b|0)|0}function Gn(a,b){a=a|0;b=b|0;Lb[a&255](b|0)}function Hn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Mb[a&1](b|0,c|0,d|0)|0}function In(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Nb[a&511](b|0,c|0,d|0)}function Jn(a){a=a|0;Ob[a&1]()}function Kn(a,b,c){a=a|0;b=b|0;c=c|0;return Pb[a&1](b|0,c|0)|0}function Ln(a){a=a|0;ba(0);return 0}function Mn(a){a=a|0;ba(1)}function Nn(a,b,c){a=a|0;b=b|0;c=c|0;ba(2);return 0}function On(a,b,c){a=a|0;b=b|0;c=c|0;ba(3)}function Pn(){ba(4)}function Qn(a,b){a=a|0;b=b|0;ba(5);return 0}




// EMSCRIPTEN_END_FUNCS
var Kb=[Ln,Ln,yj,Ln,vj,Ln,xj,Ln,wj,Ln,Fc,Ln,Oc,Ln,pk,Ln,hh,Ln,dh,Ln,He,Ln,zk,Ln,Rk,Ln,Nk,Ln,Ih,Ln,Hh,Ln,Vk,Ln,Nd,Ln,Th,Ln,fc,Ln,hk,Ln,Gf,Ln,Zj,Ln,Md,Ln,Uj,Ln,qd,Ln,Zd,Ln,bi,Ln,yd,Ln,Bg,Ln,ak,Ln,kk,Ln,Cc,Ln,Kc,Ln,wi,Ln,fm,Ln,Jc,Ln,al,Ln,Yk,Ln,Rc,Ln,km,Ln,Bh,Ln,oe,Ln,kj,Ln,ii,Ln,fd,Ln,Ki,Ln,oi,Ln,Kj,Ln,wk,Ln,jm,Ln,Ac,Ln,Ah,Ln,ic,Ln,Sg,Ln,mc,Ln,lh,Ln,ei,Ln,Hg,Ln,ej,Ln,si,Ln,ge,Ln,xc,Ln,dk,Ln,bd,Ln,ye,Ln,ke,Ln,Kl,Ln,Dj,Ln,hj,Ln,$g,Ln,ld,Ln,og,Ln,Od,Ln,Yj,Ln,_i,Ln,lm,Ln,Ai,Ln,Ie,Ln,uj,Ln,Xh,Ln,Ph,Ln,Xi,Ln,mf,Ln,_e,Ln,bj,Ln,Wg,Ln,Ic,Ln,Nf,Ln,ud,Ln,yg,Ln,_h,Ln,tk,Ln,oj,Ln,sf,Ln,Xc,Ln,Xe,Ln,Oi,Ln,Xj,Ln,Ck,Ln,Vd,Ln,Rd,Ln,Ge,Ln,Bd,Ln,Jd,Ln,Fd,Ln,Kk,Ln,Gk,Ln,Jk,Ln,se,Ln,Be,Ln,Pe,Ln,rj,Ln,Hj,Ln,Te,Ln,Eh,Ln,Qj,Ln,sg,Ln,uc,Ln,Cf,Ln,kg,Ln,Le,Ln,Mg,Ln,Lh,Ln,zj,Ln,Eg,Ln,yh,Ln,Wm,Ln,Ri,Ln,zh,Ln,Mm,Ln,be,Ln,Ui,Ln,Ei,Ln,rh,Ln,vh,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln,Ln];var Lb=[Mn,Mn,nf,Mn,Ye,Mn,$e,Mn,gd,Mn,Lk,Mn,Li,Mn,Pi,Mn,qk,Mn,lg,Mn,Ll,Mn,Dk,Mn,xk,Mn,Xg,Mn,Nm,Mn,Ej,Mn,sh,Mn,sj,Mn,Ue,Mn,md,Mn,rd,Mn,Of,Mn,Hk,Mn,Ok,Mn,xi,Mn,Fi,Mn,Bi,Mn,pi,Mn,ti,Mn,cd,Mn,ji,Mn,ik,Mn,pg,Mn,yc,Mn,vc,Mn,le,Mn,_d,Mn,ce,Mn,Gd,Mn,vd,Mn,zd,Mn,Cd,Mn,gm,Mn,Fh,Mn,pj,Mn,lj,Mn,Mh,Mn,Qh,Mn,gc,Mn,Uh,Mn,Yh,Mn,mh,Mn,Gc,Mn,Lc,Mn,Dc,Mn,wh,Mn,Df,Mn,Hf,Mn,Sk,Mn,Ng,Mn,Ig,Mn,Tg,Mn,Rj,Mn,Vj,Mn,bk,Mn,ek,Mn,bl,Mn,Zk,Mn,Wk,Mn,ze,Mn,pe,Mn,he,Mn,te,Mn,Wd,Mn,Kd,Mn,Sd,Mn,Ce,Mn,Me,Mn,zg,Mn,fj,Mn,nc,Mn,Vi,Mn,Qe,Mn,$h,Mn,fi,Mn,uk,Mn,Sc,Mn,Pc,Mn,Fg,Mn,Yc,Mn,tg,Mn,Xm,Mn,Cg,Mn,ih,Mn,ah,Mn,eh,Mn,Ij,Mn,$i,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn];var Mb=[Nn,Nn];var Nb=[On,On,Cj,On,wd,On,Dd,On,Hd,On,Uc,On,of,On,Fj,On,nh,On,Nj,On,$d,On,xg,On,Ag,On,Dg,On,Gg,On,ee,On,Yi,On,cj,On,oh,On,rc,On,af,On,cl,On,Pg,On,Pd,On,vg,On,rg,On,ng,On,pd,On,kd,On,Pk,On,td,On,Lf,On,Kh,On,tc,On,sd,On,Di,On,jd,On,Gi,On,Re,On,ui,On,Oe,On,We,On,hi,On,zi,On,ri,On,fh,On,jh,On,wg,On,fk,On,li,On,bh,On,Gj,On,qc,On,we,On,uf,On,wc,On,gk,On,wf,On,th,On,sk,On,Mj,On,Ym,On,jj,On,ci,On,ue,On,mm,On,ph,On,Mk,On,Fk,On,Ik,On,ij,On,Qk,On,Dh,On,Ef,On,rk,On,Ji,On,xd,On,Ed,On,Ad,On,hd,On,Vg,On,vi,On,nk,On,mj,On,Ee,On,nj,On,Pf,On,Zi,On,$c,On,dd,On,qj,On,Ke,On,Zc,On,Tc,On,im,On,Ii,On,Nl,On,_c,On,Bj,On,_g,On,oc,On,Je,On,Hc,On,Ec,On,hm,On,Bc,On,Nc,On,Vc,On,kc,On,_k,On,Tk,On,vf,On,mg,On,Zg,On,vk,On,Rm,On,Bk,On,Rh,On,Nh,On,Vh,On,Wh,On,Sh,On,ck,On,de,On,Oh,On,$j,On,De,On,Ci,On,Xk,On,Uk,On,$k,On,Qm,On,Sj,On,Ml,On,fe,On,Ak,On,jc,On,Yd,On,ae,On,ki,On,Kg,On,Qd,On,Ud,On,Id,On,Pj,On,rf,On,qi,On,ve,On,Td,On,Zh,On,dj,On,Xd,On,Ae,On,Ch,On,xe,On,qe,On,Tj,On,me,On,ie,On,Jh,On,id,On,kh,On,gh,On,qf,On,ch,On,Oj,On,mi,On,Ff,On,Qc,On,Ne,On,Ve,On,Wc,On,Se,On,sc,On,Ek,On,Jg,On,mk,On,Og,On,Kf,On,pc,On,ed,On,ad,On,qh,On,ug,On,qg,On,uh,On,ok,On,pf,On,Lg,On,Mc,On,di,On,Ni,On,yi,On,Ze,On,Mi,On,bf,On,Si,On,Hi,On,Zm,On,ni,On,lk,On,gi,On,Ug,On,Ti,On,_j,On,tf,On,je,On,ne,On,re,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On,On];var Ob=[Pn,Pn];var Pb=[Qn,Qn];return{_strlen:nn,_strcat:pn,_free:$m,_strncpy:qn,_pj_init_plus:Wl,_memset:ln,_malloc:_m,_pj_transform:Bm,_memcpy:mn,_strcpy:on,runPostSets:ec,stackAlloc:Qb,stackSave:Rb,stackRestore:Sb,setThrew:Tb,setTempRet0:Wb,setTempRet1:Xb,setTempRet2:Yb,setTempRet3:Zb,setTempRet4:_b,setTempRet5:$b,setTempRet6:ac,setTempRet7:bc,setTempRet8:cc,setTempRet9:dc,dynCall_ii:Fn,dynCall_vi:Gn,dynCall_iiii:Hn,dynCall_viii:In,dynCall_v:Jn,dynCall_iii:Kn}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "_strncmp": _strncmp, "_llvm_va_end": _llvm_va_end, "_abort": _abort, "_snprintf": _snprintf, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_cosh": _cosh, "__getFloat": __getFloat, "_hypot": _hypot, "_fprintf": _fprintf, "_send": _send, "___assert_fail": ___assert_fail, "_close": _close, "_isdigit": _isdigit, "_pread": _pread, "_tan": _tan, "___buildEnvironment": ___buildEnvironment, "__reallyNegative": __reallyNegative, "_fflush": _fflush, "_strchr": _strchr, "_asin": _asin, "_strncat": _strncat, "_fopen": _fopen, "_log": _log, "_fabs": _fabs, "_floor": _floor, "___setErrNo": ___setErrNo, "_fseek": _fseek, "_sqrt": _sqrt, "_write": _write, "_fgetc": _fgetc, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_llvm_lifetime_end": _llvm_lifetime_end, "_rewind": _rewind, "_strrchr": _strrchr, "_strdup": _strdup, "_sin": _sin, "_sysconf": _sysconf, "_strtol": _strtol, "_fread": _fread, "_fmod": _fmod, "_atan": _atan, "_read": _read, "__exit": __exit, "_time": _time, "__formatString": __formatString, "_getenv": _getenv, "_setlocale": _setlocale, "__parseInt": __parseInt, "_isgraph": _isgraph, "_sinh": _sinh, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_fabsl": _fabsl, "_recv": _recv, "_pthread_mutex_lock": _pthread_mutex_lock, "_cos": _cos, "_pwrite": _pwrite, "_atoi": _atoi, "_llvm_pow_f64": _llvm_pow_f64, "_fsync": _fsync, "_fscanf": _fscanf, "___errno_location": ___errno_location, "_isspace": _isspace, "_atan2": _atan2, "_open": _open, "_copysign": _copysign, "_sbrk": _sbrk, "_exp": _exp, "_fwrite": _fwrite, "_ungetc": _ungetc, "_acos": _acos, "_vsprintf": _vsprintf, "_strcmp": _strcmp, "_llvm_lifetime_start": _llvm_lifetime_start, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _strcat = Module["_strcat"] = asm["_strcat"];
var _free = Module["_free"] = asm["_free"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _pj_init_plus = Module["_pj_init_plus"] = asm["_pj_init_plus"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _pj_transform = Module["_pj_transform"] = asm["_pj_transform"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






  var _SRS = {};

  Module.AddSRS = function(srs_name, srs_def) {
    var srs_arr = srs_name.split(":",2);
    switch ( srs_arr[0] ) {
      case "TPS" :
        _SRS[srs_name] = {tps: srs_def};
        break;
      case "EPSG" : 
      case "PROJ" : 
        var def = {proj: Module.getProjection(srs_def)};
        if (srs_def.indexOf("latlong") > -1 || srs_def.indexOf("longlat") > -1) {
          def["latlong"] = 1;
        }
        _SRS[srs_name] = def;
        break;
      default : 
        break;
    }
  };

  Module.getProjection = Module.cwrap('pj_init_plus', 'number', ['string']);
  Module._pj_transform = Module.cwrap('pj_transform', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
  Module._base_transform = function (coord, from_pj, to_pj) {
    var _gridPointerX    = new Float64Array(1);
    var _gridPointerY    = new Float64Array(1);
    _gridPointerX[0] = coord[0];
    _gridPointerY[0] = coord[1];
    var _xpointer = Module._malloc(8);
    var _ypointer = Module._malloc(8);
    var _xheapbytes = new Uint8Array(Module.HEAPU8.buffer, _xpointer, 8);
    var _yheapbytes = new Uint8Array(Module.HEAPU8.buffer, _ypointer, 8);
    _xheapbytes.set(new Uint8Array(_gridPointerX.buffer));
    _yheapbytes.set(new Uint8Array(_gridPointerY.buffer));
    Module._pj_transform(from_pj, to_pj, 1, 1, _xpointer, _ypointer, 0);

    var _myX = new Float64Array(Module.HEAPU8.buffer, _xpointer, 1);
    var _myY = new Float64Array(Module.HEAPU8.buffer, _ypointer, 1);

    var ret_coord = [_myX[0],_myY[0]];
    Module._free(_xpointer);
    Module._free(_ypointer);
    return ret_coord;
  };

  Module.transform = function(coord,from_srs,to_srs) {
    var from_def = _SRS[from_srs];
    var to_def   = _SRS[to_srs];
    var ret_coord = [coord[0], coord[1]];
    if (!from_def || !to_def) {
      return coord;
    }

    if (from_def.latlong) {
      ret_coord[0] /= 57.2957795;
      ret_coord[1] /= 57.2957795;
    }

    if (from_def.tps) {
      var tps = from_def.tps;

      //絵地図 => メルカトル
      ret_coord = tps.transform(ret_coord);

      if (to_srs === "EPSG:3857") {
        return ret_coord;
      } else {
        return Module.transform(ret_coord, "EPSG:3857", to_srs);
      }
    } else if (to_def.tps) {
      var tps = to_def.tps;

      if (from_srs !== "EPSG:3857") {
        ret_coord = Module.transform(coord, from_srs, "EPSG:3857");
      }

      //メルカトル => 絵地図
      return tps.transform(ret_coord, true);
    } else {
      ret_coord = Module._base_transform(ret_coord, from_def.proj, to_def.proj);
    }

    if (to_def.latlong) {
      ret_coord[0] *= 57.2957795;
      ret_coord[1] *= 57.2957795;
    }

    return ret_coord;
  };

  Module.AddSRS("EPSG:4326","+proj=longlat +datum=WGS84");
  Module.AddSRS("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");

  //Globalに公開
  var global = (function() {return this})();
  global['EmProj4'] = Module;

  return Module;
})();

