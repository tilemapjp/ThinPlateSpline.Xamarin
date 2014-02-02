// Note: Some Emscripten settings will significantly limit the speed of the generated code.
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
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
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
  Module['print'] = print;
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
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
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
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
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
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
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
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
    assert(type, 'Must know what type to store in allocate!');
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
    assert(ptr + i < TOTAL_MEMORY);
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
    assert(ptr + i < TOTAL_MEMORY);
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
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
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
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
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
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
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
var runDependencyTracking = {};
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
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
STATICTOP = STATIC_BASE + 2280;
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } },{ func: function() { __GLOBAL__I_a35() } });
var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,144,6,0,0,34,0,0,0,68,0,0,0,48,0,0,0,70,0,0,0,60,0,0,0,8,0,0,0,26,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv119__pointer_type_infoE;
__ZTVN10__cxxabiv119__pointer_type_infoE=allocate([0,0,0,0,160,6,0,0,34,0,0,0,50,0,0,0,48,0,0,0,70,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,192,6,0,0,34,0,0,0,20,0,0,0,48,0,0,0,70,0,0,0,60,0,0,0,40,0,0,0,42,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTIt;
__ZTIt=allocate([96,2,0,0,184,2,0,0], "i8", ALLOC_STATIC);
var __ZTIs;
__ZTIs=allocate([96,2,0,0,192,2,0,0], "i8", ALLOC_STATIC);
var __ZTIm;
__ZTIm=allocate([96,2,0,0,200,2,0,0], "i8", ALLOC_STATIC);
var __ZTIl;
__ZTIl=allocate([96,2,0,0,208,2,0,0], "i8", ALLOC_STATIC);
var __ZTIj;
__ZTIj=allocate([96,2,0,0,216,2,0,0], "i8", ALLOC_STATIC);
var __ZTIi;
__ZTIi=allocate([96,2,0,0,224,2,0,0], "i8", ALLOC_STATIC);
var __ZTIh;
__ZTIh=allocate([96,2,0,0,232,2,0,0], "i8", ALLOC_STATIC);
var __ZTIf;
__ZTIf=allocate([96,2,0,0,240,2,0,0], "i8", ALLOC_STATIC);
var __ZTId;
__ZTId=allocate([96,2,0,0,248,2,0,0], "i8", ALLOC_STATIC);
var __ZTIc;
__ZTIc=allocate([96,2,0,0,0,3,0,0], "i8", ALLOC_STATIC);
var __ZTIa;
__ZTIa=allocate([96,2,0,0,16,3,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([108,111,110,103,0,0,0,0,115,111,108,118,101,0,0,0,117,110,115,105,103,110,101,100,32,105,110,116,0,0,0,0,97,100,100,95,112,111,105,110,116,0,0,0,0,0,0,0,105,110,116,0,0,0,0,0,95,84,80,83,0,0,0,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,0,115,104,111,114,116,0,0,0,32,65,32,112,111,105,110,116,32,119,97,115,32,100,101,108,101,116,101,100,32,97,102,116,101,114,32,116,104,101,32,108,97,115,116,32,115,111,108,118,101,10,0,0,0,0,0,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,0,0,32,78,79,32,105,110,116,101,114,112,111,108,97,116,105,111,110,32,45,32,114,101,116,117,114,110,32,118,97,108,117,101,115,32,97,114,101,32,122,101,114,111,10,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,115,105,103,110,101,100,32,99,104,97,114,0,0,0,0,0,32,65,32,112,111,105,110,116,32,119,97,115,32,97,100,100,101,100,32,97,102,116,101,114,32,116,104,101,32,108,97,115,116,32,115,111,108,118,101,10,0,0,0,0,0,0,0,0,99,104,97,114,0,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,0,118,111,105,100,0,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,47,85,115,101,114,115,47,107,111,107,111,103,105,107,111,47,101,109,115,99,114,105,112,116,101,110,47,115,121,115,116,101,109,47,105,110,99,108,117,100,101,47,101,109,115,99,114,105,112,116,101,110,47,98,105,110,100,46,104,0,0,0,0,0,115,116,100,58,58,119,115,116,114,105,110,103,0,0,0,0,112,116,114,0,0,0,0,0,115,116,100,58,58,115,116,114,105,110,103,0,0,0,0,0,100,101,115,101,114,105,97,108,105,122,101,0,0,0,0,0,100,111,117,98,108,101,0,0,115,101,114,105,97,108,105,122,101,0,0,0,0,0,0,0,98,111,111,108,0,0,0,0,102,108,111,97,116,0,0,0,115,101,114,105,97,108,105,122,101,95,115,105,122,101,0,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,0,0,103,101,116,95,112,111,105,110,116,0,0,0,0,0,0,0,103,101,116,65,99,116,117,97,108,84,121,112,101,0,0,0,0,0,0,0,200,5,0,0,38,0,0,0,14,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,6,0,0,34,0,0,0,72,0,0,0,48,0,0,0,70,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,6,0,0,34,0,0,0,56,0,0,0,48,0,0,0,70,0,0,0,60,0,0,0,36,0,0,0,46,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,80,100,0,0,0,0,0,0,80,99,0,0,0,0,0,0,80,75,100,0,0,0,0,0,80,75,49,55,86,105,122,71,101,111,114,101,102,83,112,108,105,110,101,50,68,0,0,0,80,49,55,86,105,122,71,101,111,114,101,102,83,112,108,105,110,101,50,68,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,0,0,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,68,110,0,0,0,0,0,0,49,55,86,105,122,71,101,111,114,101,102,83,112,108,105,110,101,50,68,0,0,0,0,0,96,2,0,0,176,2,0,0,96,2,0,0,8,3,0,0,0,0,0,0,24,3,0,0,0,0,0,0,40,3,0,0,0,0,0,0,56,3,0,0,192,5,0,0,0,0,0,0,0,0,0,0,72,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,96,3,0,0,1,0,0,0,232,6,0,0,0,0,0,0,120,3,0,0,0,0,0,0,232,6,0,0,0,0,0,0,144,3,0,0,136,2,0,0,184,3,0,0,0,0,0,0,1,0,0,0,40,6,0,0,0,0,0,0,136,2,0,0,248,3,0,0,0,0,0,0,1,0,0,0,40,6,0,0,0,0,0,0,0,0,0,0,56,4,0,0,0,0,0,0,80,4,0,0,0,0,0,0,112,4,0,0,208,6,0,0,0,0,0,0,0,0,0,0,152,4,0,0,192,6,0,0,0,0,0,0,0,0,0,0,192,4,0,0,192,6,0,0,0,0,0,0,0,0,0,0,232,4,0,0,176,6,0,0,0,0,0,0,0,0,0,0,16,5,0,0,208,6,0,0,0,0,0,0,0,0,0,0,56,5,0,0,208,6,0,0,0,0,0,0,0,0,0,0,96,5,0,0,184,5,0,0,0,0,0,0,96,2,0,0,136,5,0,0,0,0,0,0,144,5,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[((1464 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((1472 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((1480 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1496 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((1508 )>>2)]=__ZTId;
HEAP32[((1512 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((1524 )>>2)]=__ZTIc;
HEAP32[((1528 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((1540 )>>2)]=__ZTId;
HEAP32[((1544 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((1560 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((1576 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((1632 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((1640 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((1648 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1664 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1680 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1696 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1712 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1728 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1744 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1768 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
}
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
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr;;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return tempRet0 = typeArray[i],thrown;
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return tempRet0 = throwntype,thrown;
    }function ___gxx_personality_v0() {
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
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
            assert(buffer.length);
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
          if (this.stack) this.stack = demangleAll(this.stack);
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
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
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
              HEAP32[((ptr)>>2)]=ret.length
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
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  var _fabs=Math_abs;
  var _sqrt=Math_sqrt;
  var _log=Math_log;
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return tempRet0 = x*y > 4294967295,(x*y)>>>0;
    }
;
;
;
  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
;
;
;
;
;
;
;
;
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
      return (ptr-num)|0;
    }var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      Module['abort']();
    }
  var _llvm_memset_p0i8_i32=_memset;
  function ___errno_location() {
      return ___errno_state;
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
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function _llvm_lifetime_start() {}
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
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
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
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
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
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
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
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
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
var FUNCTION_TABLE = [0,0,__ZN17VizGeorefSpline2D9get_pointEddPd,0,__ZN17VizGeorefSpline2D14serialize_sizeEv,0,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN10emscripten8internal12operator_newI17VizGeorefSpline2DJiEEEPT_DpT0_,0,__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZNSt9bad_allocD0Ev,0,__ZN17VizGeorefSpline2D9serializeEPc,0,__ZN17VizGeorefSpline2D5solveEv,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,__ZN10emscripten8internal14raw_destructorI17VizGeorefSpline2DEEvPT_,0,__ZNKSt9bad_alloc4whatEv,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFiddPdEiPS2_JddS3_EE6invokeERKS5_S6_ddS3_,0,__ZN10emscripten8internal13getActualTypeI17VizGeorefSpline2DEEPKNS0_7_TYPEIDEPT_,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNSt9bad_allocD2Ev,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFPcS3_ES3_PS2_JS3_EE6invokeERKS5_S6_S3_,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZN10__cxxabiv119__pointer_type_infoD0Ev,0,__ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFiddPKdEiPS2_JddS4_EE6invokeERKS6_S7_ddS4_,0,__ZN10emscripten8internal7InvokerIP17VizGeorefSpline2DJiEE6invokeEPFS3_iEi,0,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,0,__ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFivEiPS2_JEE6invokeERKS4_S5_,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZN17VizGeorefSpline2D11deserializeEPc,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN17VizGeorefSpline2D9add_pointEddPKd,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZN10__cxxabiv123__fundamental_type_infoD0Ev,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0];
// EMSCRIPTEN_START_FUNCS
function __ZN17VizGeorefSpline2D11grow_pointsEv($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this+12)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=$2<<1;
 var $4=((($3)+(5))|0);
 var $5=($2|0)==0;
 if($5){label=2;break;}else{label=11;break;}
 case 2: 
 var $7=$4<<3;
 var $8=_malloc($7);
 var $9=$8;
 var $10=(($this+64)|0);
 HEAP32[(($10)>>2)]=$9;
 var $11=_malloc($7);
 var $12=$11;
 var $13=(($this+68)|0);
 HEAP32[(($13)>>2)]=$12;
 var $14=_malloc($7);
 var $15=$14;
 var $16=(($this+88)|0);
 HEAP32[(($16)>>2)]=$15;
 var $17=$4<<2;
 var $18=_malloc($17);
 var $19=$18;
 var $20=(($this+92)|0);
 HEAP32[(($20)>>2)]=$19;
 var $21=_malloc($17);
 var $22=$21;
 var $23=(($this+96)|0);
 HEAP32[(($23)>>2)]=$22;
 var $24=($4>>>0)>65535;
 var $25=$4&536870911;
 var $26=($25|0)==($4|0);
 var $__i=($26?$7:-1);
 var $storemerge1=0;label=3;break;
 case 3: 
 var $storemerge1;
 var $28=($storemerge1|0)<2;
 if($28){label=4;break;}else{label=14;break;}
 case 4: 
 var $__i_=($24?$__i:$7);
 var $30=_malloc($__i_);
 var $31=($30|0)==0;
 if($31){label=7;break;}else{label=5;break;}
 case 5: 
 var $33=((($30)-(4))|0);
 var $34=$33;
 var $35=HEAP32[(($34)>>2)];
 var $36=$35&3;
 var $37=($36|0)==0;
 if($37){label=7;break;}else{label=6;break;}
 case 6: 
 _memset($30, 0, $__i_)|0;
 label=7;break;
 case 7: 
 var $39=$30;
 var $40=(($this+72+($storemerge1<<2))|0);
 HEAP32[(($40)>>2)]=$39;
 var $__i_27=($24?$__i:$7);
 var $41=_malloc($__i_27);
 var $42=($41|0)==0;
 if($42){label=10;break;}else{label=8;break;}
 case 8: 
 var $44=((($41)-(4))|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46&3;
 var $48=($47|0)==0;
 if($48){label=10;break;}else{label=9;break;}
 case 9: 
 _memset($41, 0, $__i_27)|0;
 label=10;break;
 case 10: 
 var $51=$41;
 var $52=(($this+80+($storemerge1<<2))|0);
 HEAP32[(($52)>>2)]=$51;
 var $53=((($storemerge1)+(1))|0);
 var $storemerge1=$53;label=3;break;
 case 11: 
 var $55=(($this+64)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=$56;
 var $58=$4<<3;
 var $59=_realloc($57,$58);
 var $60=$59;
 HEAP32[(($55)>>2)]=$60;
 var $61=(($this+68)|0);
 var $62=HEAP32[(($61)>>2)];
 var $63=$62;
 var $64=_realloc($63,$58);
 var $65=$64;
 HEAP32[(($61)>>2)]=$65;
 var $66=(($this+88)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=$67;
 var $69=_realloc($68,$58);
 var $70=$69;
 HEAP32[(($66)>>2)]=$70;
 var $71=(($this+92)|0);
 var $72=HEAP32[(($71)>>2)];
 var $73=$72;
 var $74=$4<<2;
 var $75=_realloc($73,$74);
 var $76=$75;
 HEAP32[(($71)>>2)]=$76;
 var $77=(($this+96)|0);
 var $78=HEAP32[(($77)>>2)];
 var $79=$78;
 var $80=_realloc($79,$74);
 var $81=$80;
 HEAP32[(($77)>>2)]=$81;
 var $storemerge=0;label=12;break;
 case 12: 
 var $storemerge;
 var $83=($storemerge|0)<2;
 if($83){label=13;break;}else{label=14;break;}
 case 13: 
 var $85=(($this+72+($storemerge<<2))|0);
 var $86=HEAP32[(($85)>>2)];
 var $87=$86;
 var $88=_realloc($87,$58);
 var $89=$88;
 HEAP32[(($85)>>2)]=$89;
 var $90=(($this+80+($storemerge<<2))|0);
 var $91=HEAP32[(($90)>>2)];
 var $92=$91;
 var $93=_realloc($92,$58);
 var $94=$93;
 HEAP32[(($90)>>2)]=$94;
 var $95=((($storemerge)+(1))|0);
 var $storemerge=$95;label=12;break;
 case 14: 
 var $96=((($3)+(2))|0);
 HEAP32[(($1)>>2)]=$96;
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN17VizGeorefSpline2D9add_pointEddPKd($this,$Px,$Py,$Pvars){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 HEAP32[(($1)>>2)]=5;
 var $2=(($this+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($this+12)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($3|0)==($5|0);
 if($6){label=2;break;}else{var $9=$3;label=3;break;}
 case 2: 
 __ZN17VizGeorefSpline2D11grow_pointsEv($this);
 var $_pre=HEAP32[(($2)>>2)];
 var $9=$_pre;label=3;break;
 case 3: 
 var $9;
 var $10=(($this+64)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+($9<<3))|0);
 HEAPF64[(($12)>>3)]=$Px;
 var $13=(($this+68)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=(($14+($9<<3))|0);
 HEAPF64[(($15)>>3)]=$Py;
 var $16=(($this+4)|0);
 var $17=((($9)+(3))|0);
 var $storemerge=0;label=4;break;
 case 4: 
 var $storemerge;
 var $19=HEAP32[(($16)>>2)];
 var $20=($storemerge|0)<($19|0);
 if($20){label=5;break;}else{label=6;break;}
 case 5: 
 var $22=(($Pvars+($storemerge<<3))|0);
 var $23=HEAPF64[(($22)>>3)];
 var $24=(($this+72+($storemerge<<2))|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=(($25+($17<<3))|0);
 HEAPF64[(($26)>>3)]=$23;
 var $27=((($storemerge)+(1))|0);
 var $storemerge=$27;label=4;break;
 case 6: 
 var $29=HEAP32[(($2)>>2)];
 var $30=((($29)+(1))|0);
 HEAP32[(($2)>>2)]=$30;
 return 1;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN17VizGeorefSpline2D5solveEv($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)<1;
 if($3){label=2;break;}else{label=3;break;}
 case 2: 
 var $5=(($this)|0);
 HEAP32[(($5)>>2)]=0;
 var $_0=0;label=110;break;
 case 3: 
 if(($2|0)==1){ label=4;break;}else if(($2|0)==2){ label=5;break;}else{label=6;break;}
 case 4: 
 var $8=(($this)|0);
 HEAP32[(($8)>>2)]=1;
 var $_0=1;label=110;break;
 case 5: 
 var $10=(($this+64)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+8)|0);
 var $13=HEAPF64[(($12)>>3)];
 var $14=HEAPF64[(($11)>>3)];
 var $15=($13)-($14);
 var $16=(($this+48)|0);
 HEAPF64[(($16)>>3)]=$15;
 var $17=(($this+68)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+8)|0);
 var $20=HEAPF64[(($19)>>3)];
 var $21=HEAPF64[(($18)>>3)];
 var $22=($20)-($21);
 var $23=(($this+56)|0);
 var $24=($15)*($15);
 var $25=($22)*($22);
 var $26=($24)+($25);
 var $27=(1)/($26);
 var $28=($15)*($27);
 HEAPF64[(($16)>>3)]=$28;
 var $29=($22)*($27);
 HEAPF64[(($23)>>3)]=$29;
 var $30=(($this)|0);
 HEAP32[(($30)>>2)]=2;
 var $_0=2;label=110;break;
 case 6: 
 var $32=(($this+64)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=HEAPF64[(($33)>>3)];
 var $35=(($this+68)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=HEAPF64[(($36)>>3)];
 var $storemerge=0;var $sumxy_0=0;var $sumy2_0=0;var $sumx2_0=0;var $sumy_0=0;var $sumx_0=0;var $xmax_0=$34;var $xmin_0=$34;var $ymin_0=$37;var $ymax_0=$37;label=7;break;
 case 7: 
 var $ymax_0;
 var $ymin_0;
 var $xmin_0;
 var $xmax_0;
 var $sumx_0;
 var $sumy_0;
 var $sumx2_0;
 var $sumy2_0;
 var $sumxy_0;
 var $storemerge;
 var $39=($storemerge|0)<($2|0);
 if($39){label=8;break;}else{label=9;break;}
 case 8: 
 var $41=(($33+($storemerge<<3))|0);
 var $42=HEAPF64[(($41)>>3)];
 var $43=(($36+($storemerge<<3))|0);
 var $44=HEAPF64[(($43)>>3)];
 var $45=$xmax_0>$42;
 var $46=($45?$xmax_0:$42);
 var $47=$xmin_0<$42;
 var $48=($47?$xmin_0:$42);
 var $49=$ymax_0>$44;
 var $50=($49?$ymax_0:$44);
 var $51=$ymin_0<$44;
 var $52=($51?$ymin_0:$44);
 var $53=($sumx_0)+($42);
 var $54=($42)*($42);
 var $55=($sumx2_0)+($54);
 var $56=($sumy_0)+($44);
 var $57=($44)*($44);
 var $58=($sumy2_0)+($57);
 var $59=($42)*($44);
 var $60=($sumxy_0)+($59);
 var $61=((($storemerge)+(1))|0);
 var $storemerge=$61;var $sumxy_0=$60;var $sumy2_0=$58;var $sumx2_0=$55;var $sumy_0=$56;var $sumx_0=$53;var $xmax_0=$46;var $xmin_0=$48;var $ymin_0=$52;var $ymax_0=$50;label=7;break;
 case 9: 
 var $63=($xmax_0)-($xmin_0);
 var $64=($ymax_0)-($ymin_0);
 var $65=($sumx_0)*($sumx_0);
 var $66=($2|0);
 var $67=($65)/($66);
 var $68=($sumx2_0)-($67);
 var $69=($sumy_0)*($sumy_0);
 var $70=($69)/($66);
 var $71=($sumy2_0)-($70);
 var $72=($sumx_0)*($sumy_0);
 var $73=($72)/($66);
 var $74=($sumxy_0)-($73);
 var $75=($64)*((0.001));
 var $76=$63<$75;
 var $77=($63)*((0.001));
 var $78=$64<$77;
 var $or_cond=$76|$78;
 if($or_cond){label=11;break;}else{label=10;break;}
 case 10: 
 var $80=($74)*($74);
 var $81=($68)*($71);
 var $82=($80)/($81);
 var $83=Math_abs($82);
 var $84=$83>(0.99);
 if($84){label=11;break;}else{label=21;break;}
 case 11: 
 var $86=(($this)|0);
 HEAP32[(($86)>>2)]=3;
 var $87=($66)*($sumx2_0);
 var $88=($87)-($65);
 var $89=(($this+48)|0);
 var $90=($66)*($sumy2_0);
 var $91=($90)-($69);
 var $92=(($this+56)|0);
 var $93=($88)*($88);
 var $94=($91)*($91);
 var $95=($93)+($94);
 var $96=Math_sqrt($95);
 var $97=(1)/($96);
 var $98=($88)*($97);
 HEAPF64[(($89)>>3)]=$98;
 var $99=($91)*($97);
 HEAPF64[(($92)>>3)]=$99;
 var $100=(($this+88)|0);
 var $101=(($this+92)|0);
 var $storemerge9=0;var $103=$2;label=12;break;
 case 12: 
 var $103;
 var $storemerge9;
 var $104=($storemerge9|0)<($103|0);
 if($104){label=14;break;}else{label=13;break;}
 case 13: 
 var $105=(($this+96)|0);
 var $storemerge10=0;var $128=$103;label=15;break;
 case 14: 
 var $107=HEAP32[(($32)>>2)];
 var $108=(($107+($storemerge9<<3))|0);
 var $109=HEAPF64[(($108)>>3)];
 var $110=HEAPF64[(($107)>>3)];
 var $111=($109)-($110);
 var $112=HEAP32[(($35)>>2)];
 var $113=(($112+($storemerge9<<3))|0);
 var $114=HEAPF64[(($113)>>3)];
 var $115=HEAPF64[(($112)>>3)];
 var $116=($114)-($115);
 var $117=HEAPF64[(($89)>>3)];
 var $118=($117)*($111);
 var $119=HEAPF64[(($92)>>3)];
 var $120=($119)*($116);
 var $121=($118)+($120);
 var $122=HEAP32[(($100)>>2)];
 var $123=(($122+($storemerge9<<3))|0);
 HEAPF64[(($123)>>3)]=$121;
 var $124=HEAP32[(($101)>>2)];
 var $125=(($124+($storemerge9<<2))|0);
 HEAP32[(($125)>>2)]=1;
 var $126=((($storemerge9)+(1))|0);
 var $_pre=HEAP32[(($1)>>2)];
 var $storemerge9=$126;var $103=$_pre;label=12;break;
 case 15: 
 var $128;
 var $storemerge10;
 var $129=($storemerge10|0)<($128|0);
 if($129){var $storemerge11=0;var $min_u_0=0;var $min_index_0=-1;label=16;break;}else{var $_0=3;label=110;break;}
 case 16: 
 var $min_index_0;
 var $min_u_0;
 var $storemerge11;
 var $131=($storemerge11|0)<($128|0);
 if($131){label=17;break;}else{label=20;break;}
 case 17: 
 var $133=HEAP32[(($101)>>2)];
 var $134=(($133+($storemerge11<<2))|0);
 var $135=HEAP32[(($134)>>2)];
 var $136=($135|0)==0;
 if($136){var $min_u_1=$min_u_0;var $min_index_1=$min_index_0;label=19;break;}else{label=18;break;}
 case 18: 
 var $138=($min_index_0|0)<0;
 var $_pre223=HEAP32[(($100)>>2)];
 var $_phi_trans_insert=(($_pre223+($storemerge11<<3))|0);
 var $_pre224=HEAPF64[(($_phi_trans_insert)>>3)];
 var $139=$_pre224<$min_u_0;
 var $or_cond226=$138|$139;
 var $storemerge11_min_index_0=($or_cond226?$storemerge11:$min_index_0);
 var $_pre224_min_u_0=($or_cond226?$_pre224:$min_u_0);
 var $min_u_1=$_pre224_min_u_0;var $min_index_1=$storemerge11_min_index_0;label=19;break;
 case 19: 
 var $min_index_1;
 var $min_u_1;
 var $140=((($storemerge11)+(1))|0);
 var $storemerge11=$140;var $min_u_0=$min_u_1;var $min_index_0=$min_index_1;label=16;break;
 case 20: 
 var $142=HEAP32[(($105)>>2)];
 var $143=(($142+($storemerge10<<2))|0);
 HEAP32[(($143)>>2)]=$min_index_0;
 var $144=HEAP32[(($101)>>2)];
 var $145=(($144+($min_index_0<<2))|0);
 HEAP32[(($145)>>2)]=0;
 var $146=((($storemerge10)+(1))|0);
 var $_pre218=HEAP32[(($1)>>2)];
 var $storemerge10=$146;var $128=$_pre218;label=15;break;
 case 21: 
 var $148=(($this)|0);
 HEAP32[(($148)>>2)]=4;
 var $149=(($this+100)|0);
 var $150=HEAP32[(($149)>>2)];
 var $151=($150|0)==0;
 if($151){label=23;break;}else{label=22;break;}
 case 22: 
 var $153=$150;
 _free($153);
 label=23;break;
 case 23: 
 var $155=(($this+104)|0);
 var $156=HEAP32[(($155)>>2)];
 var $157=($156|0)==0;
 if($157){label=25;break;}else{label=24;break;}
 case 24: 
 var $159=$156;
 _free($159);
 label=25;break;
 case 25: 
 var $160=HEAP32[(($1)>>2)];
 var $161=((($160)+(3))|0);
 var $162=(($this+16)|0);
 HEAP32[(($162)>>2)]=$161;
 var $163=(Math_imul($161,$161)|0);
 var $164=($163|0)==0;
 if($164){var $req_0_i=0;label=28;break;}else{label=26;break;}
 case 26: 
 var $166=$163<<3;
 var $167=($163>>>0)>65535;
 if($167){label=27;break;}else{var $req_0_i=$166;label=28;break;}
 case 27: 
 var $169=(((($166>>>0))/(($163>>>0)))&-1);
 var $170=($169|0)==8;
 var $__i=($170?$166:-1);
 var $req_0_i=$__i;label=28;break;
 case 28: 
 var $req_0_i;
 var $172=_malloc($req_0_i);
 var $173=($172|0)==0;
 if($173){label=31;break;}else{label=29;break;}
 case 29: 
 var $175=((($172)-(4))|0);
 var $176=$175;
 var $177=HEAP32[(($176)>>2)];
 var $178=$177&3;
 var $179=($178|0)==0;
 if($179){label=31;break;}else{label=30;break;}
 case 30: 
 _memset($172, 0, $req_0_i)|0;
 label=31;break;
 case 31: 
 var $181=$172;
 HEAP32[(($149)>>2)]=$181;
 var $182=HEAP32[(($162)>>2)];
 var $183=(Math_imul($182,$182)|0);
 var $184=($183|0)==0;
 if($184){var $req_0_i13=0;label=34;break;}else{label=32;break;}
 case 32: 
 var $186=$183<<3;
 var $187=($183>>>0)>65535;
 if($187){label=33;break;}else{var $req_0_i13=$186;label=34;break;}
 case 33: 
 var $189=(((($186>>>0))/(($183>>>0)))&-1);
 var $190=($189|0)==8;
 var $__i12=($190?$186:-1);
 var $req_0_i13=$__i12;label=34;break;
 case 34: 
 var $req_0_i13;
 var $192=_malloc($req_0_i13);
 var $193=($192|0)==0;
 if($193){label=37;break;}else{label=35;break;}
 case 35: 
 var $195=((($192)-(4))|0);
 var $196=$195;
 var $197=HEAP32[(($196)>>2)];
 var $198=$197&3;
 var $199=($198|0)==0;
 if($199){label=37;break;}else{label=36;break;}
 case 36: 
 _memset($192, 0, $req_0_i13)|0;
 label=37;break;
 case 37: 
 var $201=$192;
 HEAP32[(($155)>>2)]=$201;
 var $storemerge1=0;label=38;break;
 case 38: 
 var $storemerge1;
 var $203=($storemerge1|0)<3;
 if($203){var $storemerge8=0;label=39;break;}else{var $storemerge2=0;label=42;break;}
 case 39: 
 var $storemerge8;
 var $204=($storemerge8|0)<3;
 if($204){label=40;break;}else{label=41;break;}
 case 40: 
 var $206=HEAP32[(($162)>>2)];
 var $207=(Math_imul($206,$storemerge1)|0);
 var $208=((($207)+($storemerge8))|0);
 var $209=HEAP32[(($149)>>2)];
 var $210=(($209+($208<<3))|0);
 HEAPF64[(($210)>>3)]=0;
 var $211=((($storemerge8)+(1))|0);
 var $storemerge8=$211;label=39;break;
 case 41: 
 var $213=((($storemerge1)+(1))|0);
 var $storemerge1=$213;label=38;break;
 case 42: 
 var $storemerge2;
 var $214=HEAP32[(($1)>>2)];
 var $215=($storemerge2|0)<($214|0);
 if($215){label=43;break;}else{var $storemerge3=0;var $256=$214;label=44;break;}
 case 43: 
 var $217=((($storemerge2)+(3))|0);
 var $218=HEAP32[(($149)>>2)];
 var $219=(($218+($217<<3))|0);
 HEAPF64[(($219)>>3)]=1;
 var $220=HEAP32[(($32)>>2)];
 var $221=(($220+($storemerge2<<3))|0);
 var $222=HEAPF64[(($221)>>3)];
 var $223=HEAP32[(($162)>>2)];
 var $224=((($223)+($217))|0);
 var $225=HEAP32[(($149)>>2)];
 var $226=(($225+($224<<3))|0);
 HEAPF64[(($226)>>3)]=$222;
 var $227=HEAP32[(($35)>>2)];
 var $228=(($227+($storemerge2<<3))|0);
 var $229=HEAPF64[(($228)>>3)];
 var $230=HEAP32[(($162)>>2)];
 var $231=$230<<1;
 var $232=((($231)+($217))|0);
 var $233=HEAP32[(($149)>>2)];
 var $234=(($233+($232<<3))|0);
 HEAPF64[(($234)>>3)]=$229;
 var $235=HEAP32[(($162)>>2)];
 var $236=(Math_imul($235,$217)|0);
 var $237=HEAP32[(($149)>>2)];
 var $238=(($237+($236<<3))|0);
 HEAPF64[(($238)>>3)]=1;
 var $239=HEAP32[(($32)>>2)];
 var $240=(($239+($storemerge2<<3))|0);
 var $241=HEAPF64[(($240)>>3)];
 var $242=HEAP32[(($162)>>2)];
 var $243=(Math_imul($242,$217)|0);
 var $244=((($243)+(1))|0);
 var $245=HEAP32[(($149)>>2)];
 var $246=(($245+($244<<3))|0);
 HEAPF64[(($246)>>3)]=$241;
 var $247=HEAP32[(($35)>>2)];
 var $248=(($247+($storemerge2<<3))|0);
 var $249=HEAPF64[(($248)>>3)];
 var $250=HEAP32[(($162)>>2)];
 var $251=(Math_imul($250,$217)|0);
 var $252=((($251)+(2))|0);
 var $253=HEAP32[(($149)>>2)];
 var $254=(($253+($252<<3))|0);
 HEAPF64[(($254)>>3)]=$249;
 var $255=((($storemerge2)+(1))|0);
 var $storemerge2=$255;label=42;break;
 case 44: 
 var $256;
 var $storemerge3;
 var $257=($storemerge3|0)<($256|0);
 if($257){label=45;break;}else{label=53;break;}
 case 45: 
 var $259=((($storemerge3)+(3))|0);
 var $storemerge7=$storemerge3;var $261=$256;label=46;break;
 case 46: 
 var $261;
 var $storemerge7;
 var $262=($storemerge7|0)<($261|0);
 if($262){label=47;break;}else{label=52;break;}
 case 47: 
 var $264=HEAP32[(($32)>>2)];
 var $265=(($264+($storemerge3<<3))|0);
 var $266=HEAPF64[(($265)>>3)];
 var $267=HEAP32[(($35)>>2)];
 var $268=(($267+($storemerge3<<3))|0);
 var $269=HEAPF64[(($268)>>3)];
 var $270=(($264+($storemerge7<<3))|0);
 var $271=HEAPF64[(($270)>>3)];
 var $272=(($267+($storemerge7<<3))|0);
 var $273=HEAPF64[(($272)>>3)];
 var $274=$266==$271;
 var $275=$269==$273;
 var $or_cond227=$274&$275;
 if($or_cond227){var $storemerge_i=0;label=49;break;}else{label=48;break;}
 case 48: 
 var $277=($271)-($266);
 var $278=($277)*($277);
 var $279=($273)-($269);
 var $280=($279)*($279);
 var $281=($278)+($280);
 var $282=Math_log($281);
 var $283=($281)*($282);
 var $storemerge_i=$283;label=49;break;
 case 49: 
 var $storemerge_i;
 var $284=HEAP32[(($162)>>2)];
 var $285=(Math_imul($284,$259)|0);
 var $286=((($storemerge7)+(3))|0);
 var $287=((($285)+($286))|0);
 var $288=HEAP32[(($149)>>2)];
 var $289=(($288+($287<<3))|0);
 HEAPF64[(($289)>>3)]=$storemerge_i;
 var $290=($storemerge3|0)==($storemerge7|0);
 if($290){label=51;break;}else{label=50;break;}
 case 50: 
 var $292=HEAP32[(($162)>>2)];
 var $293=(Math_imul($292,$259)|0);
 var $294=((($293)+($286))|0);
 var $295=HEAP32[(($149)>>2)];
 var $296=(($295+($294<<3))|0);
 var $297=HEAPF64[(($296)>>3)];
 var $298=(Math_imul($292,$286)|0);
 var $299=((($298)+($259))|0);
 var $300=(($295+($299<<3))|0);
 HEAPF64[(($300)>>3)]=$297;
 label=51;break;
 case 51: 
 var $302=((($storemerge7)+(1))|0);
 var $_pre219=HEAP32[(($1)>>2)];
 var $storemerge7=$302;var $261=$_pre219;label=46;break;
 case 52: 
 var $304=((($storemerge3)+(1))|0);
 var $storemerge3=$304;var $256=$261;label=44;break;
 case 53: 
 var $306=HEAP32[(($162)>>2)];
 var $307=HEAP32[(($149)>>2)];
 var $308=HEAP32[(($155)>>2)];
 var $309=$306<<1;
 var $310=(Math_imul($309,$306)|0);
 var $311$0=_llvm_umul_with_overflow_i32($310,8);
 var $311$1=tempRet0;
 var $312=$311$1;
 var $313=$311$0;
 var $314=($312?-1:$313);
 var $315=($314|0)==0;
 var $_size_i_i_i=($315?1:$314);
 label=54;break;
 case 54: 
 var $317=_malloc($_size_i_i_i);
 var $318=($317|0)==0;
 if($318){label=55;break;}else{label=68;break;}
 case 55: 
 var $320=(tempValue=HEAP32[((2280)>>2)],HEAP32[((2280)>>2)]=tempValue+0,tempValue);
 var $321=($320|0)==0;
 if($321){label=62;break;}else{label=56;break;}
 case 56: 
 var $323=$320;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$323]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=54;break; } else { label=57;break; }
 case 57: 
 var $lpad_loopexit_i_i_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i_i_i$1 = tempRet0;
 var $lpad_phi_i_i_i$1=$lpad_loopexit_i_i_i$1;var $lpad_phi_i_i_i$0=$lpad_loopexit_i_i_i$0;label=59;break;
 case 58: 
 var $lpad_nonloopexit_i_i_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i_i_i$1 = tempRet0;
 var $lpad_phi_i_i_i$1=$lpad_nonloopexit_i_i_i$1;var $lpad_phi_i_i_i$0=$lpad_nonloopexit_i_i_i$0;label=59;break;
 case 59: 
 var $lpad_phi_i_i_i$0;
 var $lpad_phi_i_i_i$1;
 var $325=$lpad_phi_i_i_i$1;
 var $326=($325|0)<0;
 if($326){label=60;break;}else{var $eh_lpad_body_i_i$1=$lpad_phi_i_i_i$1;var $eh_lpad_body_i_i$0=$lpad_phi_i_i_i$0;label=65;break;}
 case 60: 
 var $328=$lpad_phi_i_i_i$0;
 (function() { try { __THREW__ = 0; return ___cxa_call_unexpected($328) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=61;break; } else { label=64;break; }
 case 61: 
 throw "Reached an unreachable!";
 case 62: 
 var $330=___cxa_allocate_exception(4);
 var $331=$330;
 HEAP32[(($331)>>2)]=576;
 (function() { try { __THREW__ = 0; return ___cxa_throw($330,1480,(38)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=63;break; } else { label=58;break; }
 case 63: 
 throw "Reached an unreachable!";
 case 64: 
 var $334$0 = ___cxa_find_matching_catch(-1, -1); var $334$1 = tempRet0;
 var $eh_lpad_body_i_i$1=$334$1;var $eh_lpad_body_i_i$0=$334$0;label=65;break;
 case 65: 
 var $eh_lpad_body_i_i$0;
 var $eh_lpad_body_i_i$1;
 var $335=$eh_lpad_body_i_i$1;
 var $336=($335|0)<0;
 if($336){label=66;break;}else{label=67;break;}
 case 66: 
 var $338=$eh_lpad_body_i_i$0;
 ___cxa_call_unexpected($338);
 throw "Reached an unreachable!";
 case 67: 
 ___resumeException($eh_lpad_body_i_i$0)
 case 68: 
 var $341=$317;
 var $storemerge_i15=0;label=69;break;
 case 69: 
 var $storemerge_i15;
 var $343=($storemerge_i15|0)<($306|0);
 if($343){label=70;break;}else{var $storemerge1_i=0;label=74;break;}
 case 70: 
 var $344=(Math_imul($storemerge_i15,$306)|0);
 var $345=$storemerge_i15<<1;
 var $346=(Math_imul($345,$306)|0);
 var $storemerge9_i=0;label=71;break;
 case 71: 
 var $storemerge9_i;
 var $348=($storemerge9_i|0)<($306|0);
 if($348){label=72;break;}else{label=73;break;}
 case 72: 
 var $350=((($344)+($storemerge9_i))|0);
 var $351=(($307+($350<<3))|0);
 var $352=HEAPF64[(($351)>>3)];
 var $353=((($346)+($storemerge9_i))|0);
 var $354=(($341+($353<<3))|0);
 HEAPF64[(($354)>>3)]=$352;
 var $355=((($353)+($306))|0);
 var $356=(($341+($355<<3))|0);
 HEAPF64[(($356)>>3)]=0;
 var $357=((($storemerge9_i)+(1))|0);
 var $storemerge9_i=$357;label=71;break;
 case 73: 
 var $359=((($346)+($storemerge_i15))|0);
 var $360=((($359)+($306))|0);
 var $361=(($341+($360<<3))|0);
 HEAPF64[(($361)>>3)]=1;
 var $362=((($storemerge_i15)+(1))|0);
 var $storemerge_i15=$362;label=69;break;
 case 74: 
 var $storemerge1_i;
 var $363=($storemerge1_i|0)<($306|0);
 if($363){label=75;break;}else{var $storemerge2_i=0;label=94;break;}
 case 75: 
 var $365=((($storemerge1_i)+(1))|0);
 var $366=($365|0)<($306|0);
 if($366){var $storemerge7_in_i=$storemerge1_i;var $max_i_0=$storemerge1_i;label=76;break;}else{label=83;break;}
 case 76: 
 var $max_i_0;
 var $storemerge7_in_i;
 var $storemerge7_i=((($storemerge7_in_i)+(1))|0);
 var $368=($storemerge7_i|0)<($306|0);
 if($368){label=77;break;}else{label=79;break;}
 case 77: 
 var $370=$storemerge7_i<<1;
 var $371=(Math_imul($370,$306)|0);
 var $372=((($371)+($storemerge1_i))|0);
 var $373=(($341+($372<<3))|0);
 var $374=HEAPF64[(($373)>>3)];
 var $375=Math_abs($374);
 var $376=$max_i_0<<1;
 var $377=(Math_imul($376,$306)|0);
 var $378=((($377)+($storemerge1_i))|0);
 var $379=(($341+($378<<3))|0);
 var $380=HEAPF64[(($379)>>3)];
 var $381=Math_abs($380);
 var $382=$375>$381;
 if($382){label=78;break;}else{var $storemerge7_in_i=$storemerge7_i;var $max_i_0=$max_i_0;label=76;break;}
 case 78: 
 var $storemerge7_in_i=$storemerge7_i;var $max_i_0=$storemerge7_i;label=76;break;
 case 79: 
 var $385=($max_i_0|0)==($storemerge1_i|0);
 if($385){label=83;break;}else{label=80;break;}
 case 80: 
 var $387=$storemerge1_i<<1;
 var $388=(Math_imul($387,$306)|0);
 var $389=$max_i_0<<1;
 var $390=(Math_imul($389,$306)|0);
 var $storemerge8_i=$storemerge1_i;label=81;break;
 case 81: 
 var $storemerge8_i;
 var $392=($storemerge8_i|0)<($309|0);
 if($392){label=82;break;}else{label=83;break;}
 case 82: 
 var $394=((($388)+($storemerge8_i))|0);
 var $395=(($341+($394<<3))|0);
 var $396=HEAPF64[(($395)>>3)];
 var $397=((($390)+($storemerge8_i))|0);
 var $398=(($341+($397<<3))|0);
 var $399=HEAPF64[(($398)>>3)];
 HEAPF64[(($395)>>3)]=$399;
 HEAPF64[(($398)>>3)]=$396;
 var $400=((($storemerge8_i)+(1))|0);
 var $storemerge8_i=$400;label=81;break;
 case 83: 
 var $401=$storemerge1_i<<1;
 var $402=(Math_imul($401,$306)|0);
 var $403=((($402)+($storemerge1_i))|0);
 var $404=(($341+($403<<3))|0);
 var $405=HEAPF64[(($404)>>3)];
 var $406=$405==0;
 if($406){label=84;break;}else{var $storemerge4_i=$storemerge1_i;label=86;break;}
 case 84: 
 var $408=($317|0)==0;
 if($408){var $_0=0;label=110;break;}else{label=85;break;}
 case 85: 
 _free($317);
 var $_0=0;label=110;break;
 case 86: 
 var $storemerge4_i;
 var $410=($storemerge4_i|0)<($309|0);
 if($410){label=87;break;}else{var $storemerge5_i=0;label=88;break;}
 case 87: 
 var $412=((($402)+($storemerge4_i))|0);
 var $413=(($341+($412<<3))|0);
 var $414=HEAPF64[(($413)>>3)];
 var $415=($414)/($405);
 HEAPF64[(($413)>>3)]=$415;
 var $416=((($storemerge4_i)+(1))|0);
 var $storemerge4_i=$416;label=86;break;
 case 88: 
 var $storemerge5_i;
 var $417=($storemerge5_i|0)<($306|0);
 if($417){label=89;break;}else{var $storemerge1_i=$365;label=74;break;}
 case 89: 
 var $419=($storemerge5_i|0)==($storemerge1_i|0);
 if($419){label=93;break;}else{label=90;break;}
 case 90: 
 var $421=$storemerge5_i<<1;
 var $422=(Math_imul($421,$306)|0);
 var $423=((($422)+($storemerge1_i))|0);
 var $424=(($341+($423<<3))|0);
 var $425=HEAPF64[(($424)>>3)];
 var $storemerge6_i=$storemerge1_i;label=91;break;
 case 91: 
 var $storemerge6_i;
 var $427=($storemerge6_i|0)<($309|0);
 if($427){label=92;break;}else{label=93;break;}
 case 92: 
 var $429=((($402)+($storemerge6_i))|0);
 var $430=(($341+($429<<3))|0);
 var $431=HEAPF64[(($430)>>3)];
 var $432=($425)*($431);
 var $433=((($422)+($storemerge6_i))|0);
 var $434=(($341+($433<<3))|0);
 var $435=HEAPF64[(($434)>>3)];
 var $436=($435)-($432);
 HEAPF64[(($434)>>3)]=$436;
 var $437=((($storemerge6_i)+(1))|0);
 var $storemerge6_i=$437;label=91;break;
 case 93: 
 var $438=((($storemerge5_i)+(1))|0);
 var $storemerge5_i=$438;label=88;break;
 case 94: 
 var $storemerge2_i;
 var $439=($storemerge2_i|0)<($306|0);
 if($439){label=95;break;}else{label=99;break;}
 case 95: 
 var $440=$storemerge2_i<<1;
 var $441=(Math_imul($440,$306)|0);
 var $442=(Math_imul($storemerge2_i,$306)|0);
 var $storemerge3_i=0;label=96;break;
 case 96: 
 var $storemerge3_i;
 var $444=($storemerge3_i|0)<($306|0);
 if($444){label=97;break;}else{label=98;break;}
 case 97: 
 var $446=((($441)+($storemerge3_i))|0);
 var $447=((($446)+($306))|0);
 var $448=(($341+($447<<3))|0);
 var $449=HEAPF64[(($448)>>3)];
 var $450=((($442)+($storemerge3_i))|0);
 var $451=(($308+($450<<3))|0);
 HEAPF64[(($451)>>3)]=$449;
 var $452=((($storemerge3_i)+(1))|0);
 var $storemerge3_i=$452;label=96;break;
 case 98: 
 var $454=((($storemerge2_i)+(1))|0);
 var $storemerge2_i=$454;label=94;break;
 case 99: 
 var $456=($317|0)==0;
 if($456){label=101;break;}else{label=100;break;}
 case 100: 
 _free($317);
 label=101;break;
 case 101: 
 var $457=(($this+4)|0);
 var $storemerge4=0;label=102;break;
 case 102: 
 var $storemerge4;
 var $459=HEAP32[(($457)>>2)];
 var $460=($storemerge4|0)<($459|0);
 if($460){label=103;break;}else{var $_0=4;label=110;break;}
 case 103: 
 var $461=(($this+80+($storemerge4<<2))|0);
 var $462=(($this+72+($storemerge4<<2))|0);
 var $_pre220=HEAP32[(($162)>>2)];
 var $storemerge5=0;var $464=$_pre220;label=104;break;
 case 104: 
 var $464;
 var $storemerge5;
 var $465=($storemerge5|0)<($464|0);
 if($465){label=105;break;}else{label=109;break;}
 case 105: 
 var $467=HEAP32[(($461)>>2)];
 var $468=(($467+($storemerge5<<3))|0);
 HEAPF64[(($468)>>3)]=0;
 var $storemerge6=0;label=106;break;
 case 106: 
 var $storemerge6;
 var $470=HEAP32[(($162)>>2)];
 var $471=($storemerge6|0)<($470|0);
 if($471){label=107;break;}else{label=108;break;}
 case 107: 
 var $473=(Math_imul($470,$storemerge5)|0);
 var $474=((($473)+($storemerge6))|0);
 var $475=HEAP32[(($155)>>2)];
 var $476=(($475+($474<<3))|0);
 var $477=HEAPF64[(($476)>>3)];
 var $478=HEAP32[(($462)>>2)];
 var $479=(($478+($storemerge6<<3))|0);
 var $480=HEAPF64[(($479)>>3)];
 var $481=($477)*($480);
 var $482=HEAP32[(($461)>>2)];
 var $483=(($482+($storemerge5<<3))|0);
 var $484=HEAPF64[(($483)>>3)];
 var $485=($484)+($481);
 HEAPF64[(($483)>>3)]=$485;
 var $486=((($storemerge6)+(1))|0);
 var $storemerge6=$486;label=106;break;
 case 108: 
 var $488=((($storemerge5)+(1))|0);
 var $storemerge5=$488;var $464=$470;label=104;break;
 case 109: 
 var $490=((($storemerge4)+(1))|0);
 var $storemerge4=$490;label=102;break;
 case 110: 
 var $_0;
 return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN17VizGeorefSpline2D9get_pointEddPd($this,$Px,$Py,$vars){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=HEAP32[(($1)>>2)];
 switch(($2|0)){case 3:{ label=12;break;}case 4:{ label=2;break;}case 1:{ label=3;break;}case 5:{ label=34;break;}case 6:{ label=37;break;}case 0:{ label=4;break;}case 2:{ label=9;break;}default:{var $_0=0;label=40;break;}}break;
 case 2: 
 var $3=(($this+4)|0);
 var $storemerge2=0;label=24;break;
 case 3: 
 var $4=(($this+4)|0);
 var $storemerge8=0;label=7;break;
 case 4: 
 var $5=(($this+4)|0);
 var $storemerge9=0;label=5;break;
 case 5: 
 var $storemerge9;
 var $7=HEAP32[(($5)>>2)];
 var $8=($storemerge9|0)<($7|0);
 if($8){label=6;break;}else{var $_0=1;label=40;break;}
 case 6: 
 var $10=(($vars+($storemerge9<<3))|0);
 HEAPF64[(($10)>>3)]=0;
 var $11=((($storemerge9)+(1))|0);
 var $storemerge9=$11;label=5;break;
 case 7: 
 var $storemerge8;
 var $13=HEAP32[(($4)>>2)];
 var $14=($storemerge8|0)<($13|0);
 if($14){label=8;break;}else{var $_0=1;label=40;break;}
 case 8: 
 var $16=(($this+72+($storemerge8<<2))|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17+24)|0);
 var $19=HEAPF64[(($18)>>3)];
 var $20=(($vars+($storemerge8<<3))|0);
 HEAPF64[(($20)>>3)]=$19;
 var $21=((($storemerge8)+(1))|0);
 var $storemerge8=$21;label=7;break;
 case 9: 
 var $23=(($this+48)|0);
 var $24=HEAPF64[(($23)>>3)];
 var $25=(($this+64)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=HEAPF64[(($26)>>3)];
 var $28=($Px)-($27);
 var $29=($24)*($28);
 var $30=(($this+56)|0);
 var $31=HEAPF64[(($30)>>3)];
 var $32=(($this+68)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=HEAPF64[(($33)>>3)];
 var $35=($Py)-($34);
 var $36=($31)*($35);
 var $37=($29)+($36);
 var $38=(($this+4)|0);
 var $39=(1)-($37);
 var $storemerge7=0;label=10;break;
 case 10: 
 var $storemerge7;
 var $41=HEAP32[(($38)>>2)];
 var $42=($storemerge7|0)<($41|0);
 if($42){label=11;break;}else{var $_0=1;label=40;break;}
 case 11: 
 var $44=(($this+72+($storemerge7<<2))|0);
 var $45=HEAP32[(($44)>>2)];
 var $46=(($45+24)|0);
 var $47=HEAPF64[(($46)>>3)];
 var $48=($39)*($47);
 var $49=(($45+32)|0);
 var $50=HEAPF64[(($49)>>3)];
 var $51=($37)*($50);
 var $52=($48)+($51);
 var $53=(($vars+($storemerge7<<3))|0);
 HEAPF64[(($53)>>3)]=$52;
 var $54=((($storemerge7)+(1))|0);
 var $storemerge7=$54;label=10;break;
 case 12: 
 var $56=(($this+48)|0);
 var $57=HEAPF64[(($56)>>3)];
 var $58=(($this+64)|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=HEAPF64[(($59)>>3)];
 var $61=($Px)-($60);
 var $62=($57)*($61);
 var $63=(($this+56)|0);
 var $64=HEAPF64[(($63)>>3)];
 var $65=(($this+68)|0);
 var $66=HEAP32[(($65)>>2)];
 var $67=HEAPF64[(($66)>>3)];
 var $68=($Py)-($67);
 var $69=($64)*($68);
 var $70=($62)+($69);
 var $71=(($this+96)|0);
 var $72=HEAP32[(($71)>>2)];
 var $73=HEAP32[(($72)>>2)];
 var $74=(($this+88)|0);
 var $75=HEAP32[(($74)>>2)];
 var $76=(($75+($73<<3))|0);
 var $77=HEAPF64[(($76)>>3)];
 var $78=$70>$77;
 if($78){label=14;break;}else{label=13;break;}
 case 13: 
 var $80=(($72+4)|0);
 var $81=HEAP32[(($80)>>2)];
 var $rightP_1=$81;var $leftP_1=$73;label=21;break;
 case 14: 
 var $83=(($this+8)|0);
 var $84=HEAP32[(($83)>>2)];
 var $85=((($84)-(1))|0);
 var $86=(($72+($85<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($75+($87<<3))|0);
 var $89=HEAPF64[(($88)>>3)];
 var $90=$70<$89;
 if($90){var $storemerge5=1;var $found_0=0;var $rightP_0=0;var $leftP_0=0;var $95=$73;label=16;break;}else{label=15;break;}
 case 15: 
 var $92=((($84)-(2))|0);
 var $93=(($72+($92<<2))|0);
 var $94=HEAP32[(($93)>>2)];
 var $rightP_1=$87;var $leftP_1=$94;label=21;break;
 case 16: 
 var $95;
 var $leftP_0;
 var $rightP_0;
 var $found_0;
 var $storemerge5;
 var $96=($found_0|0)==0;
 var $97=($storemerge5|0)<($84|0);
 var $or_cond=$96&$97;
 if($or_cond){label=17;break;}else{var $rightP_1=$rightP_0;var $leftP_1=$leftP_0;label=21;break;}
 case 17: 
 var $99=(($72+($storemerge5<<2))|0);
 var $100=HEAP32[(($99)>>2)];
 var $101=(($75+($95<<3))|0);
 var $102=HEAPF64[(($101)>>3)];
 var $103=$70<$102;
 if($103){var $found_1=0;label=20;break;}else{label=18;break;}
 case 18: 
 var $105=(($75+($100<<3))|0);
 var $106=HEAPF64[(($105)>>3)];
 var $107=$70>$106;
 if($107){var $found_1=0;label=20;break;}else{label=19;break;}
 case 19: 
 var $found_1=1;label=20;break;
 case 20: 
 var $found_1;
 var $110=((($storemerge5)+(1))|0);
 var $storemerge5=$110;var $found_0=$found_1;var $rightP_0=$100;var $leftP_0=$95;var $95=$100;label=16;break;
 case 21: 
 var $leftP_1;
 var $rightP_1;
 var $111=(($75+($leftP_1<<3))|0);
 var $112=HEAPF64[(($111)>>3)];
 var $113=($70)-($112);
 var $114=(($75+($rightP_1<<3))|0);
 var $115=HEAPF64[(($114)>>3)];
 var $116=($115)-($112);
 var $117=($113)/($116);
 var $118=(($this+4)|0);
 var $119=(1)-($117);
 var $120=((($leftP_1)+(3))|0);
 var $121=((($rightP_1)+(3))|0);
 var $storemerge6=0;label=22;break;
 case 22: 
 var $storemerge6;
 var $123=HEAP32[(($118)>>2)];
 var $124=($storemerge6|0)<($123|0);
 if($124){label=23;break;}else{var $_0=1;label=40;break;}
 case 23: 
 var $126=(($this+72+($storemerge6<<2))|0);
 var $127=HEAP32[(($126)>>2)];
 var $128=(($127+($120<<3))|0);
 var $129=HEAPF64[(($128)>>3)];
 var $130=($119)*($129);
 var $131=(($127+($121<<3))|0);
 var $132=HEAPF64[(($131)>>3)];
 var $133=($117)*($132);
 var $134=($130)+($133);
 var $135=(($vars+($storemerge6<<3))|0);
 HEAPF64[(($135)>>3)]=$134;
 var $136=((($storemerge6)+(1))|0);
 var $storemerge6=$136;label=22;break;
 case 24: 
 var $storemerge2;
 var $138=HEAP32[(($3)>>2)];
 var $139=($storemerge2|0)<($138|0);
 if($139){label=26;break;}else{label=25;break;}
 case 25: 
 var $140=(($this+8)|0);
 var $141=(($this+64)|0);
 var $142=(($this+68)|0);
 var $storemerge3=0;var $158=$138;label=27;break;
 case 26: 
 var $144=(($this+80+($storemerge2<<2))|0);
 var $145=HEAP32[(($144)>>2)];
 var $146=HEAPF64[(($145)>>3)];
 var $147=(($145+8)|0);
 var $148=HEAPF64[(($147)>>3)];
 var $149=($148)*($Px);
 var $150=($146)+($149);
 var $151=(($145+16)|0);
 var $152=HEAPF64[(($151)>>3)];
 var $153=($152)*($Py);
 var $154=($150)+($153);
 var $155=(($vars+($storemerge2<<3))|0);
 HEAPF64[(($155)>>3)]=$154;
 var $156=((($storemerge2)+(1))|0);
 var $storemerge2=$156;label=24;break;
 case 27: 
 var $158;
 var $storemerge3;
 var $159=HEAP32[(($140)>>2)];
 var $160=($storemerge3|0)<($159|0);
 if($160){label=28;break;}else{var $_0=1;label=40;break;}
 case 28: 
 var $162=HEAP32[(($141)>>2)];
 var $163=(($162+($storemerge3<<3))|0);
 var $164=HEAPF64[(($163)>>3)];
 var $165=HEAP32[(($142)>>2)];
 var $166=(($165+($storemerge3<<3))|0);
 var $167=HEAPF64[(($166)>>3)];
 var $168=$164==$Px;
 var $169=$167==$Py;
 var $or_cond86=$168&$169;
 if($or_cond86){var $storemerge_i=0;label=30;break;}else{label=29;break;}
 case 29: 
 var $171=($164)-($Px);
 var $172=($171)*($171);
 var $173=($167)-($Py);
 var $174=($173)*($173);
 var $175=($172)+($174);
 var $176=Math_log($175);
 var $177=($175)*($176);
 var $storemerge_i=$177;label=30;break;
 case 30: 
 var $storemerge_i;
 var $178=((($storemerge3)+(3))|0);
 var $storemerge4=0;var $180=$158;label=31;break;
 case 31: 
 var $180;
 var $storemerge4;
 var $181=($storemerge4|0)<($180|0);
 if($181){label=32;break;}else{label=33;break;}
 case 32: 
 var $183=(($this+80+($storemerge4<<2))|0);
 var $184=HEAP32[(($183)>>2)];
 var $185=(($184+($178<<3))|0);
 var $186=HEAPF64[(($185)>>3)];
 var $187=($186)*($storemerge_i);
 var $188=(($vars+($storemerge4<<3))|0);
 var $189=HEAPF64[(($188)>>3)];
 var $190=($189)+($187);
 HEAPF64[(($188)>>3)]=$190;
 var $191=((($storemerge4)+(1))|0);
 var $_pre=HEAP32[(($3)>>2)];
 var $storemerge4=$191;var $180=$_pre;label=31;break;
 case 33: 
 var $193=((($storemerge3)+(1))|0);
 var $storemerge3=$193;var $158=$180;label=27;break;
 case 34: 
 var $195=HEAP32[((_stderr)>>2)];
 var $196=_fprintf($195,240,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $197=_fprintf($195,160,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $198=(($this+4)|0);
 var $storemerge1=0;label=35;break;
 case 35: 
 var $storemerge1;
 var $200=HEAP32[(($198)>>2)];
 var $201=($storemerge1|0)<($200|0);
 if($201){label=36;break;}else{var $_0=0;label=40;break;}
 case 36: 
 var $203=(($vars+($storemerge1<<3))|0);
 HEAPF64[(($203)>>3)]=0;
 var $204=((($storemerge1)+(1))|0);
 var $storemerge1=$204;label=35;break;
 case 37: 
 var $206=HEAP32[((_stderr)>>2)];
 var $207=_fprintf($206,96,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $208=_fprintf($206,160,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $209=(($this+4)|0);
 var $storemerge=0;label=38;break;
 case 38: 
 var $storemerge;
 var $211=HEAP32[(($209)>>2)];
 var $212=($storemerge|0)<($211|0);
 if($212){label=39;break;}else{var $_0=0;label=40;break;}
 case 39: 
 var $214=(($vars+($storemerge<<3))|0);
 HEAPF64[(($214)>>3)]=0;
 var $215=((($storemerge)+(1))|0);
 var $storemerge=$215;label=38;break;
 case 40: 
 var $_0;
 STACKTOP=sp;return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN17VizGeorefSpline2D14serialize_sizeEv($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this+12)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=$2<<6;
 var $4=((($3)+(256))|0);
 var $5=(($this+16)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=(($this+100)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){var $alloc_size_0=$4;label=3;break;}else{label=2;break;}
 case 2: 
 var $11=(Math_imul($6,$6)|0);
 var $12=$11<<4;
 var $13=((($4)+($12))|0);
 var $alloc_size_0=$13;label=3;break;
 case 3: 
 var $alloc_size_0;
 return $alloc_size_0;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN17VizGeorefSpline2D9serializeEPc($this,$serial){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $is_aa;
 var $0=(($this+12)|0);
 var $1=HEAP32[(($0)>>2)];
 var $2=(($this+16)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(Math_imul($3,$3)|0);
 var $5=(($this+100)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==0;
 var $8=((($1)+(3))|0);
 var $storemerge69=($7?0:1);
 $is_aa=$storemerge69;
 var $9=(($this+4)|0);
 var $10=$serial;
 var $11=((((HEAPU8[($9)])|(HEAPU8[((($9)+(1))|0)]<<8)|(HEAPU8[((($9)+(2))|0)]<<16)|(HEAPU8[((($9)+(3))|0)]<<24))|0));
 tempBigInt=$11;HEAP8[($10)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($10)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($10)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($10)+(3))|0)]=tempBigInt&0xff;
 var $12=(($serial+4)|0);
 var $13=(($this+8)|0);
 var $14=$12;
 var $15=((((HEAPU8[($13)])|(HEAPU8[((($13)+(1))|0)]<<8)|(HEAPU8[((($13)+(2))|0)]<<16)|(HEAPU8[((($13)+(3))|0)]<<24))|0));
 tempBigInt=$15;HEAP8[($14)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($14)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($14)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($14)+(3))|0)]=tempBigInt&0xff;
 var $16=(($serial+8)|0);
 var $17=$16;
 var $18=((((HEAPU8[($0)])|(HEAPU8[((($0)+(1))|0)]<<8)|(HEAPU8[((($0)+(2))|0)]<<16)|(HEAPU8[((($0)+(3))|0)]<<24))|0));
 tempBigInt=$18;HEAP8[($17)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($17)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($17)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($17)+(3))|0)]=tempBigInt&0xff;
 var $19=(($serial+12)|0);
 var $20=$19;
 var $21=((((HEAPU8[($2)])|(HEAPU8[((($2)+(1))|0)]<<8)|(HEAPU8[((($2)+(2))|0)]<<16)|(HEAPU8[((($2)+(3))|0)]<<24))|0));
 tempBigInt=$21;HEAP8[($20)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($20)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($20)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($20)+(3))|0)]=tempBigInt&0xff;
 var $22=(($serial+16)|0);
 var $23=$22;
 var $24=$is_aa;
 tempBigInt=$24;HEAP8[($23)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($23)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($23)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($23)+(3))|0)]=tempBigInt&0xff;
 var $25=(($serial+20)|0);
 var $26=(($this)|0);
 var $27=$25;
 var $28=((((HEAPU8[($26)])|(HEAPU8[((($26)+(1))|0)]<<8)|(HEAPU8[((($26)+(2))|0)]<<16)|(HEAPU8[((($26)+(3))|0)]<<24))|0));
 tempBigInt=$28;HEAP8[($27)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($27)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($27)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($27)+(3))|0)]=tempBigInt&0xff;
 var $29=(($serial+24)|0);
 var $30=(($this+24)|0);
 var $31=$30;
 var $32=$29;
 var $ld$0$0=(($31)|0);
 var $33$0=((((HEAPU8[($ld$0$0)])|(HEAPU8[((($ld$0$0)+(1))|0)]<<8)|(HEAPU8[((($ld$0$0)+(2))|0)]<<16)|(HEAPU8[((($ld$0$0)+(3))|0)]<<24))|0));
 var $ld$1$1=(($31+4)|0);
 var $33$1=((((HEAPU8[($ld$1$1)])|(HEAPU8[((($ld$1$1)+(1))|0)]<<8)|(HEAPU8[((($ld$1$1)+(2))|0)]<<16)|(HEAPU8[((($ld$1$1)+(3))|0)]<<24))|0));
 var $st$2$0=(($32)|0);
 tempBigInt=$33$0;HEAP8[($st$2$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$2$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$2$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$2$0)+(3))|0)]=tempBigInt&0xff;
 var $st$3$1=(($32+4)|0);
 tempBigInt=$33$1;HEAP8[($st$3$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$3$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$3$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$3$1)+(3))|0)]=tempBigInt&0xff;
 var $34=(($serial+32)|0);
 var $35=(($this+32)|0);
 var $36=$35;
 var $37=$34;
 var $ld$4$0=(($36)|0);
 var $38$0=((((HEAPU8[($ld$4$0)])|(HEAPU8[((($ld$4$0)+(1))|0)]<<8)|(HEAPU8[((($ld$4$0)+(2))|0)]<<16)|(HEAPU8[((($ld$4$0)+(3))|0)]<<24))|0));
 var $ld$5$1=(($36+4)|0);
 var $38$1=((((HEAPU8[($ld$5$1)])|(HEAPU8[((($ld$5$1)+(1))|0)]<<8)|(HEAPU8[((($ld$5$1)+(2))|0)]<<16)|(HEAPU8[((($ld$5$1)+(3))|0)]<<24))|0));
 var $st$6$0=(($37)|0);
 tempBigInt=$38$0;HEAP8[($st$6$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$6$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$6$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$6$0)+(3))|0)]=tempBigInt&0xff;
 var $st$7$1=(($37+4)|0);
 tempBigInt=$38$1;HEAP8[($st$7$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$7$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$7$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$7$1)+(3))|0)]=tempBigInt&0xff;
 var $39=(($serial+40)|0);
 var $40=(($this+40)|0);
 var $41=$40;
 var $42=$39;
 var $ld$8$0=(($41)|0);
 var $43$0=((((HEAPU8[($ld$8$0)])|(HEAPU8[((($ld$8$0)+(1))|0)]<<8)|(HEAPU8[((($ld$8$0)+(2))|0)]<<16)|(HEAPU8[((($ld$8$0)+(3))|0)]<<24))|0));
 var $ld$9$1=(($41+4)|0);
 var $43$1=((((HEAPU8[($ld$9$1)])|(HEAPU8[((($ld$9$1)+(1))|0)]<<8)|(HEAPU8[((($ld$9$1)+(2))|0)]<<16)|(HEAPU8[((($ld$9$1)+(3))|0)]<<24))|0));
 var $st$10$0=(($42)|0);
 tempBigInt=$43$0;HEAP8[($st$10$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$10$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$10$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$10$0)+(3))|0)]=tempBigInt&0xff;
 var $st$11$1=(($42+4)|0);
 tempBigInt=$43$1;HEAP8[($st$11$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$11$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$11$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$11$1)+(3))|0)]=tempBigInt&0xff;
 var $44=(($serial+48)|0);
 var $45=(($this+48)|0);
 var $46=$45;
 var $47=$44;
 var $ld$12$0=(($46)|0);
 var $48$0=((((HEAPU8[($ld$12$0)])|(HEAPU8[((($ld$12$0)+(1))|0)]<<8)|(HEAPU8[((($ld$12$0)+(2))|0)]<<16)|(HEAPU8[((($ld$12$0)+(3))|0)]<<24))|0));
 var $ld$13$1=(($46+4)|0);
 var $48$1=((((HEAPU8[($ld$13$1)])|(HEAPU8[((($ld$13$1)+(1))|0)]<<8)|(HEAPU8[((($ld$13$1)+(2))|0)]<<16)|(HEAPU8[((($ld$13$1)+(3))|0)]<<24))|0));
 var $st$14$0=(($47)|0);
 tempBigInt=$48$0;HEAP8[($st$14$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$14$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$14$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$14$0)+(3))|0)]=tempBigInt&0xff;
 var $st$15$1=(($47+4)|0);
 tempBigInt=$48$1;HEAP8[($st$15$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$15$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$15$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$15$1)+(3))|0)]=tempBigInt&0xff;
 var $49=(($serial+56)|0);
 var $50=(($this+56)|0);
 var $51=$50;
 var $52=$49;
 var $ld$16$0=(($51)|0);
 var $53$0=((((HEAPU8[($ld$16$0)])|(HEAPU8[((($ld$16$0)+(1))|0)]<<8)|(HEAPU8[((($ld$16$0)+(2))|0)]<<16)|(HEAPU8[((($ld$16$0)+(3))|0)]<<24))|0));
 var $ld$17$1=(($51+4)|0);
 var $53$1=((((HEAPU8[($ld$17$1)])|(HEAPU8[((($ld$17$1)+(1))|0)]<<8)|(HEAPU8[((($ld$17$1)+(2))|0)]<<16)|(HEAPU8[((($ld$17$1)+(3))|0)]<<24))|0));
 var $st$18$0=(($52)|0);
 tempBigInt=$53$0;HEAP8[($st$18$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$18$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$18$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$18$0)+(3))|0)]=tempBigInt&0xff;
 var $st$19$1=(($52+4)|0);
 tempBigInt=$53$1;HEAP8[($st$19$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$19$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$19$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$19$1)+(3))|0)]=tempBigInt&0xff;
 var $54=(($serial+64)|0);
 var $55=(($this+92)|0);
 var $56=(($this+96)|0);
 var $57=(($this+64)|0);
 var $58=(($this+68)|0);
 var $59=(($this+88)|0);
 var $storemerge=0;var $work_0=$54;label=2;break;
 case 2: 
 var $work_0;
 var $storemerge;
 var $61=($storemerge|0)<($8|0);
 if($61){label=3;break;}else{label=7;break;}
 case 3: 
 var $63=HEAP32[(($55)>>2)];
 var $64=(($63+($storemerge<<2))|0);
 var $65=$work_0;
 var $66=((((HEAPU8[($64)])|(HEAPU8[((($64)+(1))|0)]<<8)|(HEAPU8[((($64)+(2))|0)]<<16)|(HEAPU8[((($64)+(3))|0)]<<24))|0));
 tempBigInt=$66;HEAP8[($65)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($65)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($65)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($65)+(3))|0)]=tempBigInt&0xff;
 var $67=(($work_0+4)|0);
 var $68=HEAP32[(($56)>>2)];
 var $69=(($68+($storemerge<<2))|0);
 var $70=$67;
 var $71=((((HEAPU8[($69)])|(HEAPU8[((($69)+(1))|0)]<<8)|(HEAPU8[((($69)+(2))|0)]<<16)|(HEAPU8[((($69)+(3))|0)]<<24))|0));
 tempBigInt=$71;HEAP8[($70)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($70)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($70)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($70)+(3))|0)]=tempBigInt&0xff;
 var $72=(($work_0+8)|0);
 var $73=HEAP32[(($57)>>2)];
 var $74=(($73+($storemerge<<3))|0);
 var $75=$74;
 var $76=$72;
 var $ld$20$0=(($75)|0);
 var $77$0=((((HEAPU8[($ld$20$0)])|(HEAPU8[((($ld$20$0)+(1))|0)]<<8)|(HEAPU8[((($ld$20$0)+(2))|0)]<<16)|(HEAPU8[((($ld$20$0)+(3))|0)]<<24))|0));
 var $ld$21$1=(($75+4)|0);
 var $77$1=((((HEAPU8[($ld$21$1)])|(HEAPU8[((($ld$21$1)+(1))|0)]<<8)|(HEAPU8[((($ld$21$1)+(2))|0)]<<16)|(HEAPU8[((($ld$21$1)+(3))|0)]<<24))|0));
 var $st$22$0=(($76)|0);
 tempBigInt=$77$0;HEAP8[($st$22$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$22$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$22$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$22$0)+(3))|0)]=tempBigInt&0xff;
 var $st$23$1=(($76+4)|0);
 tempBigInt=$77$1;HEAP8[($st$23$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$23$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$23$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$23$1)+(3))|0)]=tempBigInt&0xff;
 var $78=(($work_0+16)|0);
 var $79=HEAP32[(($58)>>2)];
 var $80=(($79+($storemerge<<3))|0);
 var $81=$80;
 var $82=$78;
 var $ld$24$0=(($81)|0);
 var $83$0=((((HEAPU8[($ld$24$0)])|(HEAPU8[((($ld$24$0)+(1))|0)]<<8)|(HEAPU8[((($ld$24$0)+(2))|0)]<<16)|(HEAPU8[((($ld$24$0)+(3))|0)]<<24))|0));
 var $ld$25$1=(($81+4)|0);
 var $83$1=((((HEAPU8[($ld$25$1)])|(HEAPU8[((($ld$25$1)+(1))|0)]<<8)|(HEAPU8[((($ld$25$1)+(2))|0)]<<16)|(HEAPU8[((($ld$25$1)+(3))|0)]<<24))|0));
 var $st$26$0=(($82)|0);
 tempBigInt=$83$0;HEAP8[($st$26$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$26$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$26$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$26$0)+(3))|0)]=tempBigInt&0xff;
 var $st$27$1=(($82+4)|0);
 tempBigInt=$83$1;HEAP8[($st$27$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$27$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$27$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$27$1)+(3))|0)]=tempBigInt&0xff;
 var $84=(($work_0+24)|0);
 var $85=HEAP32[(($59)>>2)];
 var $86=(($85+($storemerge<<3))|0);
 var $87=$86;
 var $88=$84;
 var $ld$28$0=(($87)|0);
 var $89$0=((((HEAPU8[($ld$28$0)])|(HEAPU8[((($ld$28$0)+(1))|0)]<<8)|(HEAPU8[((($ld$28$0)+(2))|0)]<<16)|(HEAPU8[((($ld$28$0)+(3))|0)]<<24))|0));
 var $ld$29$1=(($87+4)|0);
 var $89$1=((((HEAPU8[($ld$29$1)])|(HEAPU8[((($ld$29$1)+(1))|0)]<<8)|(HEAPU8[((($ld$29$1)+(2))|0)]<<16)|(HEAPU8[((($ld$29$1)+(3))|0)]<<24))|0));
 var $st$30$0=(($88)|0);
 tempBigInt=$89$0;HEAP8[($st$30$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$30$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$30$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$30$0)+(3))|0)]=tempBigInt&0xff;
 var $st$31$1=(($88+4)|0);
 tempBigInt=$89$1;HEAP8[($st$31$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$31$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$31$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$31$1)+(3))|0)]=tempBigInt&0xff;
 var $90=(($work_0+32)|0);
 var $storemerge2=0;var $work_1=$90;label=4;break;
 case 4: 
 var $work_1;
 var $storemerge2;
 var $92=($storemerge2|0)<2;
 if($92){label=5;break;}else{label=6;break;}
 case 5: 
 var $94=(($this+72+($storemerge2<<2))|0);
 var $95=HEAP32[(($94)>>2)];
 var $96=(($95+($storemerge<<3))|0);
 var $97=$96;
 var $98=$work_1;
 var $ld$32$0=(($97)|0);
 var $99$0=((((HEAPU8[($ld$32$0)])|(HEAPU8[((($ld$32$0)+(1))|0)]<<8)|(HEAPU8[((($ld$32$0)+(2))|0)]<<16)|(HEAPU8[((($ld$32$0)+(3))|0)]<<24))|0));
 var $ld$33$1=(($97+4)|0);
 var $99$1=((((HEAPU8[($ld$33$1)])|(HEAPU8[((($ld$33$1)+(1))|0)]<<8)|(HEAPU8[((($ld$33$1)+(2))|0)]<<16)|(HEAPU8[((($ld$33$1)+(3))|0)]<<24))|0));
 var $st$34$0=(($98)|0);
 tempBigInt=$99$0;HEAP8[($st$34$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$34$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$34$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$34$0)+(3))|0)]=tempBigInt&0xff;
 var $st$35$1=(($98+4)|0);
 tempBigInt=$99$1;HEAP8[($st$35$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$35$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$35$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$35$1)+(3))|0)]=tempBigInt&0xff;
 var $100=(($work_1+8)|0);
 var $101=(($this+80+($storemerge2<<2))|0);
 var $102=HEAP32[(($101)>>2)];
 var $103=(($102+($storemerge<<3))|0);
 var $104=$103;
 var $105=$100;
 var $ld$36$0=(($104)|0);
 var $106$0=((((HEAPU8[($ld$36$0)])|(HEAPU8[((($ld$36$0)+(1))|0)]<<8)|(HEAPU8[((($ld$36$0)+(2))|0)]<<16)|(HEAPU8[((($ld$36$0)+(3))|0)]<<24))|0));
 var $ld$37$1=(($104+4)|0);
 var $106$1=((((HEAPU8[($ld$37$1)])|(HEAPU8[((($ld$37$1)+(1))|0)]<<8)|(HEAPU8[((($ld$37$1)+(2))|0)]<<16)|(HEAPU8[((($ld$37$1)+(3))|0)]<<24))|0));
 var $st$38$0=(($105)|0);
 tempBigInt=$106$0;HEAP8[($st$38$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$38$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$38$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$38$0)+(3))|0)]=tempBigInt&0xff;
 var $st$39$1=(($105+4)|0);
 tempBigInt=$106$1;HEAP8[($st$39$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$39$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$39$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$39$1)+(3))|0)]=tempBigInt&0xff;
 var $107=(($work_1+16)|0);
 var $108=((($storemerge2)+(1))|0);
 var $storemerge2=$108;var $work_1=$107;label=4;break;
 case 6: 
 var $110=((($storemerge)+(1))|0);
 var $storemerge=$110;var $work_0=$work_1;label=2;break;
 case 7: 
 var $is_aa_0_load=$is_aa;
 var $112=($is_aa_0_load|0)==0;
 if($112){var $work_3=$work_0;label=11;break;}else{label=8;break;}
 case 8: 
 var $113=(($this+104)|0);
 var $storemerge1=0;var $work_2=$work_0;label=9;break;
 case 9: 
 var $work_2;
 var $storemerge1;
 var $115=($storemerge1|0)<($4|0);
 if($115){label=10;break;}else{var $work_3=$work_2;label=11;break;}
 case 10: 
 var $117=HEAP32[(($5)>>2)];
 var $118=(($117+($storemerge1<<3))|0);
 var $119=$118;
 var $120=$work_2;
 var $ld$40$0=(($119)|0);
 var $121$0=((((HEAPU8[($ld$40$0)])|(HEAPU8[((($ld$40$0)+(1))|0)]<<8)|(HEAPU8[((($ld$40$0)+(2))|0)]<<16)|(HEAPU8[((($ld$40$0)+(3))|0)]<<24))|0));
 var $ld$41$1=(($119+4)|0);
 var $121$1=((((HEAPU8[($ld$41$1)])|(HEAPU8[((($ld$41$1)+(1))|0)]<<8)|(HEAPU8[((($ld$41$1)+(2))|0)]<<16)|(HEAPU8[((($ld$41$1)+(3))|0)]<<24))|0));
 var $st$42$0=(($120)|0);
 tempBigInt=$121$0;HEAP8[($st$42$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$42$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$42$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$42$0)+(3))|0)]=tempBigInt&0xff;
 var $st$43$1=(($120+4)|0);
 tempBigInt=$121$1;HEAP8[($st$43$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$43$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$43$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$43$1)+(3))|0)]=tempBigInt&0xff;
 var $122=(($work_2+8)|0);
 var $123=HEAP32[(($113)>>2)];
 var $124=(($123+($storemerge1<<3))|0);
 var $125=$124;
 var $126=$122;
 var $ld$44$0=(($125)|0);
 var $127$0=((((HEAPU8[($ld$44$0)])|(HEAPU8[((($ld$44$0)+(1))|0)]<<8)|(HEAPU8[((($ld$44$0)+(2))|0)]<<16)|(HEAPU8[((($ld$44$0)+(3))|0)]<<24))|0));
 var $ld$45$1=(($125+4)|0);
 var $127$1=((((HEAPU8[($ld$45$1)])|(HEAPU8[((($ld$45$1)+(1))|0)]<<8)|(HEAPU8[((($ld$45$1)+(2))|0)]<<16)|(HEAPU8[((($ld$45$1)+(3))|0)]<<24))|0));
 var $st$46$0=(($126)|0);
 tempBigInt=$127$0;HEAP8[($st$46$0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$46$0)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$46$0)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$46$0)+(3))|0)]=tempBigInt&0xff;
 var $st$47$1=(($126+4)|0);
 tempBigInt=$127$1;HEAP8[($st$47$1)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$47$1)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$47$1)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($st$47$1)+(3))|0)]=tempBigInt&0xff;
 var $128=(($work_2+16)|0);
 var $129=((($storemerge1)+(1))|0);
 var $storemerge1=$129;var $work_2=$128;label=9;break;
 case 11: 
 var $work_3;
 STACKTOP=sp;return $work_3;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN17VizGeorefSpline2D11deserializeEPc($this,$serial){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $is_aa;
 var $1=(($this+100)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=2;break;}
 case 2: 
 var $5=$2;
 _free($5);
 HEAP32[(($1)>>2)]=0;
 label=3;break;
 case 3: 
 var $7=(($this+104)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){label=5;break;}else{label=4;break;}
 case 4: 
 var $11=$8;
 _free($11);
 HEAP32[(($7)>>2)]=0;
 label=5;break;
 case 5: 
 var $13=(($this+64)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=$14;
 _free($15);
 var $16=(($this+68)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=$17;
 _free($18);
 var $19=(($this+88)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=$20;
 _free($21);
 var $22=(($this+92)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=$23;
 _free($24);
 var $25=(($this+96)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=$26;
 _free($27);
 var $storemerge=0;label=6;break;
 case 6: 
 var $storemerge;
 var $29=($storemerge|0)<2;
 if($29){label=7;break;}else{label=8;break;}
 case 7: 
 var $31=(($this+72+($storemerge<<2))|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=$32;
 _free($33);
 var $34=(($this+80+($storemerge<<2))|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=$35;
 _free($36);
 var $37=((($storemerge)+(1))|0);
 var $storemerge=$37;label=6;break;
 case 8: 
 var $39=(($this+4)|0);
 var $40=$serial;
 var $41=((((HEAPU8[($40)])|(HEAPU8[((($40)+(1))|0)]<<8)|(HEAPU8[((($40)+(2))|0)]<<16)|(HEAPU8[((($40)+(3))|0)]<<24))|0));
 tempBigInt=$41;HEAP8[($39)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($39)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($39)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($39)+(3))|0)]=tempBigInt&0xff;
 var $42=(($this+8)|0);
 var $43=(($serial+4)|0);
 var $44=$43;
 var $45=((((HEAPU8[($44)])|(HEAPU8[((($44)+(1))|0)]<<8)|(HEAPU8[((($44)+(2))|0)]<<16)|(HEAPU8[((($44)+(3))|0)]<<24))|0));
 tempBigInt=$45;HEAP8[($42)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($42)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($42)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($42)+(3))|0)]=tempBigInt&0xff;
 var $46=(($this+12)|0);
 var $47=(($serial+8)|0);
 var $48=$47;
 var $49=((((HEAPU8[($48)])|(HEAPU8[((($48)+(1))|0)]<<8)|(HEAPU8[((($48)+(2))|0)]<<16)|(HEAPU8[((($48)+(3))|0)]<<24))|0));
 tempBigInt=$49;HEAP8[($46)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($46)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($46)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($46)+(3))|0)]=tempBigInt&0xff;
 var $50=(($this+16)|0);
 var $51=(($serial+12)|0);
 var $52=$51;
 var $53=((((HEAPU8[($52)])|(HEAPU8[((($52)+(1))|0)]<<8)|(HEAPU8[((($52)+(2))|0)]<<16)|(HEAPU8[((($52)+(3))|0)]<<24))|0));
 tempBigInt=$53;HEAP8[($50)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($50)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($50)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($50)+(3))|0)]=tempBigInt&0xff;
 var $54=(($serial+16)|0);
 var $55=$54;
 var $56=((((HEAPU8[($55)])|(HEAPU8[((($55)+(1))|0)]<<8)|(HEAPU8[((($55)+(2))|0)]<<16)|(HEAPU8[((($55)+(3))|0)]<<24))|0));
 $is_aa=$56;
 var $57=(($serial+20)|0);
 var $58=$57;
 var $59=((((HEAPU8[($58)])|(HEAPU8[((($58)+(1))|0)]<<8)|(HEAPU8[((($58)+(2))|0)]<<16)|(HEAPU8[((($58)+(3))|0)]<<24))|0));
 var $60=(($this)|0);
 tempBigInt=$59;HEAP8[($60)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($60)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($60)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($60)+(3))|0)]=tempBigInt&0xff;
 var $61=(($serial+24)|0);
 var $62=(($this+24)|0);
 var $63=$61;
 var $64=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($63)])|(HEAPU8[((($63)+(1))|0)]<<8)|(HEAPU8[((($63)+(2))|0)]<<16)|(HEAPU8[((($63)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($63)+(4))|0)])|(HEAPU8[((($63)+(5))|0)]<<8)|(HEAPU8[((($63)+(6))|0)]<<16)|(HEAPU8[((($63)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$64,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($62)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($62)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($62)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($62)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($62)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($62)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($62)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($62)+(7))|0)]=tempBigInt&0xff);
 var $65=(($this+32)|0);
 var $66=(($serial+32)|0);
 var $67=$66;
 var $68=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($67)])|(HEAPU8[((($67)+(1))|0)]<<8)|(HEAPU8[((($67)+(2))|0)]<<16)|(HEAPU8[((($67)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($67)+(4))|0)])|(HEAPU8[((($67)+(5))|0)]<<8)|(HEAPU8[((($67)+(6))|0)]<<16)|(HEAPU8[((($67)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$68,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($65)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($65)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($65)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($65)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($65)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($65)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($65)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($65)+(7))|0)]=tempBigInt&0xff);
 var $69=(($this+40)|0);
 var $70=(($serial+40)|0);
 var $71=$70;
 var $72=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($71)])|(HEAPU8[((($71)+(1))|0)]<<8)|(HEAPU8[((($71)+(2))|0)]<<16)|(HEAPU8[((($71)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($71)+(4))|0)])|(HEAPU8[((($71)+(5))|0)]<<8)|(HEAPU8[((($71)+(6))|0)]<<16)|(HEAPU8[((($71)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$72,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($69)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($69)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($69)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($69)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($69)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($69)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($69)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($69)+(7))|0)]=tempBigInt&0xff);
 var $73=(($this+48)|0);
 var $74=(($serial+48)|0);
 var $75=$74;
 var $76=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($75)])|(HEAPU8[((($75)+(1))|0)]<<8)|(HEAPU8[((($75)+(2))|0)]<<16)|(HEAPU8[((($75)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($75)+(4))|0)])|(HEAPU8[((($75)+(5))|0)]<<8)|(HEAPU8[((($75)+(6))|0)]<<16)|(HEAPU8[((($75)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$76,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($73)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($73)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($73)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($73)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($73)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($73)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($73)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($73)+(7))|0)]=tempBigInt&0xff);
 var $77=(($this+56)|0);
 var $78=(($serial+56)|0);
 var $79=$78;
 var $80=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($79)])|(HEAPU8[((($79)+(1))|0)]<<8)|(HEAPU8[((($79)+(2))|0)]<<16)|(HEAPU8[((($79)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($79)+(4))|0)])|(HEAPU8[((($79)+(5))|0)]<<8)|(HEAPU8[((($79)+(6))|0)]<<16)|(HEAPU8[((($79)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$80,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($77)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($77)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($77)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($77)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($77)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($77)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($77)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($77)+(7))|0)]=tempBigInt&0xff);
 var $81=(($serial+64)|0);
 var $82=HEAP32[(($46)>>2)];
 var $83=((($82)+(3))|0);
 var $84=HEAP32[(($50)>>2)];
 var $85=(Math_imul($84,$84)|0);
 var $is_aa_0_load56=$is_aa;
 var $86=($is_aa_0_load56|0)==0;
 var $87=$83<<3;
 var $88=_malloc($87);
 var $89=$88;
 HEAP32[(($13)>>2)]=$89;
 var $90=_malloc($87);
 var $91=$90;
 HEAP32[(($16)>>2)]=$91;
 var $92=_malloc($87);
 var $93=$92;
 HEAP32[(($19)>>2)]=$93;
 var $94=$83<<2;
 var $95=_malloc($94);
 var $96=$95;
 HEAP32[(($22)>>2)]=$96;
 var $97=_malloc($94);
 var $98=$97;
 HEAP32[(($25)>>2)]=$98;
 var $99=($83>>>0)>65535;
 var $100=$83&536870911;
 var $101=($100|0)==($83|0);
 var $__i5=($101?$87:-1);
 var $storemerge1=0;label=9;break;
 case 9: 
 var $storemerge1;
 var $103=($storemerge1|0)<2;
 if($103){label=10;break;}else{var $storemerge2=0;var $work_0=$81;label=17;break;}
 case 10: 
 var $__i5_=($99?$__i5:$87);
 var $105=_malloc($__i5_);
 var $106=($105|0)==0;
 if($106){label=13;break;}else{label=11;break;}
 case 11: 
 var $108=((($105)-(4))|0);
 var $109=$108;
 var $110=HEAP32[(($109)>>2)];
 var $111=$110&3;
 var $112=($111|0)==0;
 if($112){label=13;break;}else{label=12;break;}
 case 12: 
 _memset($105, 0, $__i5_)|0;
 label=13;break;
 case 13: 
 var $115=$105;
 var $116=(($this+72+($storemerge1<<2))|0);
 HEAP32[(($116)>>2)]=$115;
 var $__i5_96=($99?$__i5:$87);
 var $117=_malloc($__i5_96);
 var $118=($117|0)==0;
 if($118){label=16;break;}else{label=14;break;}
 case 14: 
 var $120=((($117)-(4))|0);
 var $121=$120;
 var $122=HEAP32[(($121)>>2)];
 var $123=$122&3;
 var $124=($123|0)==0;
 if($124){label=16;break;}else{label=15;break;}
 case 15: 
 _memset($117, 0, $__i5_96)|0;
 label=16;break;
 case 16: 
 var $127=$117;
 var $128=(($this+80+($storemerge1<<2))|0);
 HEAP32[(($128)>>2)]=$127;
 var $129=((($storemerge1)+(1))|0);
 var $storemerge1=$129;label=9;break;
 case 17: 
 var $work_0;
 var $storemerge2;
 var $130=($storemerge2|0)<($83|0);
 if($130){label=18;break;}else{label=22;break;}
 case 18: 
 var $132=HEAP32[(($22)>>2)];
 var $133=(($132+($storemerge2<<2))|0);
 var $134=$work_0;
 var $135=((((HEAPU8[($134)])|(HEAPU8[((($134)+(1))|0)]<<8)|(HEAPU8[((($134)+(2))|0)]<<16)|(HEAPU8[((($134)+(3))|0)]<<24))|0));
 tempBigInt=$135;HEAP8[($133)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($133)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($133)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($133)+(3))|0)]=tempBigInt&0xff;
 var $136=HEAP32[(($25)>>2)];
 var $137=(($136+($storemerge2<<2))|0);
 var $138=(($work_0+4)|0);
 var $139=$138;
 var $140=((((HEAPU8[($139)])|(HEAPU8[((($139)+(1))|0)]<<8)|(HEAPU8[((($139)+(2))|0)]<<16)|(HEAPU8[((($139)+(3))|0)]<<24))|0));
 tempBigInt=$140;HEAP8[($137)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($137)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($137)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($137)+(3))|0)]=tempBigInt&0xff;
 var $141=(($work_0+8)|0);
 var $142=HEAP32[(($13)>>2)];
 var $143=(($142+($storemerge2<<3))|0);
 var $144=$141;
 var $145=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($144)])|(HEAPU8[((($144)+(1))|0)]<<8)|(HEAPU8[((($144)+(2))|0)]<<16)|(HEAPU8[((($144)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($144)+(4))|0)])|(HEAPU8[((($144)+(5))|0)]<<8)|(HEAPU8[((($144)+(6))|0)]<<16)|(HEAPU8[((($144)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$145,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($143)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($143)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($143)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($143)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($143)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($143)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($143)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($143)+(7))|0)]=tempBigInt&0xff);
 var $146=HEAP32[(($16)>>2)];
 var $147=(($146+($storemerge2<<3))|0);
 var $148=(($work_0+16)|0);
 var $149=$148;
 var $150=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($149)])|(HEAPU8[((($149)+(1))|0)]<<8)|(HEAPU8[((($149)+(2))|0)]<<16)|(HEAPU8[((($149)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($149)+(4))|0)])|(HEAPU8[((($149)+(5))|0)]<<8)|(HEAPU8[((($149)+(6))|0)]<<16)|(HEAPU8[((($149)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$150,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($147)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($147)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($147)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($147)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($147)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($147)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($147)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($147)+(7))|0)]=tempBigInt&0xff);
 var $151=HEAP32[(($19)>>2)];
 var $152=(($151+($storemerge2<<3))|0);
 var $153=(($work_0+24)|0);
 var $154=$153;
 var $155=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($154)])|(HEAPU8[((($154)+(1))|0)]<<8)|(HEAPU8[((($154)+(2))|0)]<<16)|(HEAPU8[((($154)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($154)+(4))|0)])|(HEAPU8[((($154)+(5))|0)]<<8)|(HEAPU8[((($154)+(6))|0)]<<16)|(HEAPU8[((($154)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$155,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($152)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($152)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($152)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($152)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($152)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($152)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($152)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($152)+(7))|0)]=tempBigInt&0xff);
 var $156=(($work_0+32)|0);
 var $storemerge4=0;var $work_1=$156;label=19;break;
 case 19: 
 var $work_1;
 var $storemerge4;
 var $158=($storemerge4|0)<2;
 if($158){label=20;break;}else{label=21;break;}
 case 20: 
 var $160=(($this+72+($storemerge4<<2))|0);
 var $161=HEAP32[(($160)>>2)];
 var $162=(($161+($storemerge2<<3))|0);
 var $163=$work_1;
 var $164=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($163)])|(HEAPU8[((($163)+(1))|0)]<<8)|(HEAPU8[((($163)+(2))|0)]<<16)|(HEAPU8[((($163)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($163)+(4))|0)])|(HEAPU8[((($163)+(5))|0)]<<8)|(HEAPU8[((($163)+(6))|0)]<<16)|(HEAPU8[((($163)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$164,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($162)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($162)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($162)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($162)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($162)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($162)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($162)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($162)+(7))|0)]=tempBigInt&0xff);
 var $165=(($this+80+($storemerge4<<2))|0);
 var $166=HEAP32[(($165)>>2)];
 var $167=(($166+($storemerge2<<3))|0);
 var $168=(($work_1+8)|0);
 var $169=$168;
 var $170=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($169)])|(HEAPU8[((($169)+(1))|0)]<<8)|(HEAPU8[((($169)+(2))|0)]<<16)|(HEAPU8[((($169)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($169)+(4))|0)])|(HEAPU8[((($169)+(5))|0)]<<8)|(HEAPU8[((($169)+(6))|0)]<<16)|(HEAPU8[((($169)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$170,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($167)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($167)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($167)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($167)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($167)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($167)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($167)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($167)+(7))|0)]=tempBigInt&0xff);
 var $171=(($work_1+16)|0);
 var $172=((($storemerge4)+(1))|0);
 var $storemerge4=$172;var $work_1=$171;label=19;break;
 case 21: 
 var $174=((($storemerge2)+(1))|0);
 var $storemerge2=$174;var $work_0=$work_1;label=17;break;
 case 22: 
 if($86){var $work_3=$work_0;label=26;break;}else{label=23;break;}
 case 23: 
 var $177=$85<<3;
 var $178=_malloc($177);
 var $179=$178;
 HEAP32[(($1)>>2)]=$179;
 var $180=_malloc($177);
 var $181=$180;
 HEAP32[(($7)>>2)]=$181;
 var $storemerge3=0;var $work_2=$work_0;label=24;break;
 case 24: 
 var $work_2;
 var $storemerge3;
 var $183=($storemerge3|0)<($85|0);
 if($183){label=25;break;}else{var $work_3=$work_2;label=26;break;}
 case 25: 
 var $185=HEAP32[(($1)>>2)];
 var $186=(($185+($storemerge3<<3))|0);
 var $187=$work_2;
 var $188=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($187)])|(HEAPU8[((($187)+(1))|0)]<<8)|(HEAPU8[((($187)+(2))|0)]<<16)|(HEAPU8[((($187)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($187)+(4))|0)])|(HEAPU8[((($187)+(5))|0)]<<8)|(HEAPU8[((($187)+(6))|0)]<<16)|(HEAPU8[((($187)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$188,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($186)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($186)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($186)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($186)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($186)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($186)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($186)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($186)+(7))|0)]=tempBigInt&0xff);
 var $189=HEAP32[(($7)>>2)];
 var $190=(($189+($storemerge3<<3))|0);
 var $191=(($work_2+8)|0);
 var $192=$191;
 var $193=(HEAP32[((tempDoublePtr)>>2)]=((((HEAPU8[($192)])|(HEAPU8[((($192)+(1))|0)]<<8)|(HEAPU8[((($192)+(2))|0)]<<16)|(HEAPU8[((($192)+(3))|0)]<<24))|0)),HEAP32[(((tempDoublePtr)+(4))>>2)]=((((HEAPU8[((($192)+(4))|0)])|(HEAPU8[((($192)+(5))|0)]<<8)|(HEAPU8[((($192)+(6))|0)]<<16)|(HEAPU8[((($192)+(7))|0)]<<24))|0)),HEAPF64[(tempDoublePtr)>>3]);
 (HEAPF64[(tempDoublePtr)>>3]=$193,tempBigInt=HEAP32[((tempDoublePtr)>>2)],HEAP8[($190)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($190)+(1))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($190)+(2))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($190)+(3))|0)]=tempBigInt&0xff,tempBigInt=HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP8[((($190)+(4))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($190)+(5))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($190)+(6))|0)]=tempBigInt&0xff,tempBigInt = tempBigInt>>8,HEAP8[((($190)+(7))|0)]=tempBigInt&0xff);
 var $194=(($work_2+16)|0);
 var $195=((($storemerge3)+(1))|0);
 var $storemerge3=$195;var $work_2=$194;label=24;break;
 case 26: 
 var $work_3;
 STACKTOP=sp;return $work_3;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten6class_I17VizGeorefSpline2DNS_8internal11NoBaseClassEE8functionIPcJS6_EJNS_18allow_raw_pointersEEEERS4_PKcMS1_FT_DpT0_EDpT1_($this,$methodName,$_01,$_12){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $args=sp;
 var $1=(($args)|0);
 HEAP32[(($1)>>2)]=3;
 var $2=(($args+4)|0);
 HEAP32[(($2)>>2)]=1512;
 var $3=(($args+8)|0);
 HEAP32[(($3)>>2)]=1560;
 var $4=(($args+12)|0);
 HEAP32[(($4)>>2)]=1512;
 var $5=_malloc(8);
 var $6=($5|0)==0;
 if($6){label=3;break;}else{label=2;break;}
 case 2: 
 var $memberFunction_fca_0_insert$0=$_01;
 var $memberFunction_fca_0_insert$1=0;
 var $8=$5;
 var $memberFunction_fca_1_insert$0=$memberFunction_fca_0_insert$0;
 var $memberFunction_fca_1_insert$1=$_12;
 var $st$0$0=(($8)|0);
 HEAP32[(($st$0$0)>>2)]=$memberFunction_fca_1_insert$0;
 var $st$1$1=(($8+4)|0);
 HEAP32[(($st$1$1)>>2)]=$memberFunction_fca_1_insert$1;
 label=3;break;
 case 3: 
 __embind_register_class_function(1768,$methodName,3,$2,(44),$5);
 STACKTOP=sp;return $this;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFPcS3_ES3_PS2_JS3_EE6invokeERKS5_S6_S3_($method,$wireThis,$args){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$wireThis;
 var $4=(($3+$2)|0);
 var $5=$4;
 var $6=$1$0;
 var $7=$6&1;
 var $8=($7|0)==0;
 if($8){label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$4;
 var $11=HEAP32[(($10)>>2)];
 var $12=((($6)-(1))|0);
 var $13=(($11+$12)|0);
 var $14=$13;
 var $15=HEAP32[(($14)>>2)];
 var $19=$15;label=4;break;
 case 3: 
 var $17=$6;
 var $19=$17;label=4;break;
 case 4: 
 var $19;
 var $20=FUNCTION_TABLE[$19]($5,$args);
 return $20;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFiddPdEiPS2_JddS3_EE6invokeERKS5_S6_ddS3_($method,$wireThis,$args,$args1,$args2){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$wireThis;
 var $4=(($3+$2)|0);
 var $5=$4;
 var $6=$1$0;
 var $7=$6&1;
 var $8=($7|0)==0;
 if($8){label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$4;
 var $11=HEAP32[(($10)>>2)];
 var $12=((($6)-(1))|0);
 var $13=(($11+$12)|0);
 var $14=$13;
 var $15=HEAP32[(($14)>>2)];
 var $19=$15;label=4;break;
 case 3: 
 var $17=$6;
 var $19=$17;label=4;break;
 case 4: 
 var $19;
 var $20=FUNCTION_TABLE[$19]($5,$args,$args1,$args2);
 return $20;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFivEiPS2_JEE6invokeERKS4_S5_($method,$wireThis){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$wireThis;
 var $4=(($3+$2)|0);
 var $5=$4;
 var $6=$1$0;
 var $7=$6&1;
 var $8=($7|0)==0;
 if($8){label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$4;
 var $11=HEAP32[(($10)>>2)];
 var $12=((($6)-(1))|0);
 var $13=(($11+$12)|0);
 var $14=$13;
 var $15=HEAP32[(($14)>>2)];
 var $19=$15;label=4;break;
 case 3: 
 var $17=$6;
 var $19=$17;label=4;break;
 case 4: 
 var $19;
 var $20=FUNCTION_TABLE[$19]($5);
 return $20;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal13MethodInvokerIM17VizGeorefSpline2DFiddPKdEiPS2_JddS4_EE6invokeERKS6_S7_ddS4_($method,$wireThis,$args,$args1,$args2){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$wireThis;
 var $4=(($3+$2)|0);
 var $5=$4;
 var $6=$1$0;
 var $7=$6&1;
 var $8=($7|0)==0;
 if($8){label=3;break;}else{label=2;break;}
 case 2: 
 var $10=$4;
 var $11=HEAP32[(($10)>>2)];
 var $12=((($6)-(1))|0);
 var $13=(($11+$12)|0);
 var $14=$13;
 var $15=HEAP32[(($14)>>2)];
 var $19=$15;label=4;break;
 case 3: 
 var $17=$6;
 var $19=$17;label=4;break;
 case 4: 
 var $19;
 var $20=FUNCTION_TABLE[$19]($5,$args,$args1,$args2);
 return $20;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal12operator_newI17VizGeorefSpline2DJiEEEPT_DpT0_($args){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(112);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((2280)>>2)],HEAP32[((2280)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=576;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,1480,(38)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $19=$2;
 var $20=(($2+88)|0);
 var $21=$20;
 HEAP32[(($21)>>2)]=0;
 var $22=(($2+68)|0);
 var $23=$22;
 HEAP32[(($23)>>2)]=0;
 var $24=(($2+64)|0);
 var $25=$24;
 HEAP32[(($25)>>2)]=0;
 var $26=(($2+96)|0);
 var $27=$26;
 HEAP32[(($27)>>2)]=0;
 var $28=(($2+92)|0);
 var $29=$28;
 HEAP32[(($29)>>2)]=0;
 var $storemerge_i=0;label=13;break;
 case 13: 
 var $storemerge_i;
 var $31=($storemerge_i|0)<($args|0);
 if($31){label=14;break;}else{label=15;break;}
 case 14: 
 var $33=(($19+72+($storemerge_i<<2))|0);
 HEAP32[(($33)>>2)]=0;
 var $34=(($19+80+($storemerge_i<<2))|0);
 HEAP32[(($34)>>2)]=0;
 var $35=((($storemerge_i)+(1))|0);
 var $storemerge_i=$35;label=13;break;
 case 15: 
 var $37=(($2+24)|0);
 var $38=(($2+40)|0);
 var $39=$38;
 HEAP32[(($37)>>2)]=0; HEAP32[((($37)+(4))>>2)]=0; HEAP32[((($37)+(8))>>2)]=0; HEAP32[((($37)+(12))>>2)]=0;
 HEAPF64[(($39)>>3)]=10;
 var $40=(($2+8)|0);
 var $41=$40;
 HEAP32[(($41)>>2)]=0;
 var $42=(($2+4)|0);
 var $43=$42;
 HEAP32[(($43)>>2)]=$args;
 var $44=(($2+12)|0);
 var $45=$44;
 HEAP32[(($45)>>2)]=0;
 var $46=(($2+100)|0);
 var $47=$46;
 HEAP32[(($47)>>2)]=0;
 var $48=(($2+104)|0);
 var $49=$48;
 HEAP32[(($49)>>2)]=0;
 __ZN17VizGeorefSpline2D11grow_pointsEv($19);
 var $50=$2;
 HEAP32[(($50)>>2)]=0;
 return $19;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal7InvokerIP17VizGeorefSpline2DJiEE6invokeEPFS3_iEi($fn,$args){
 var label=0;
 var $1=FUNCTION_TABLE[$fn]($args);
 return $1;
}
function __ZN10emscripten8internal13getActualTypeI17VizGeorefSpline2DEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0;
 if($1){label=2;break;}else{label=3;break;}
 case 2: 
 ___assert_fail(424,344,797,552);
 throw "Reached an unreachable!";
 case 3: 
 return 1768;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10emscripten8internal14raw_destructorI17VizGeorefSpline2DEEvPT_($ptr){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0;
 if($1){label=10;break;}else{label=2;break;}
 case 2: 
 var $3=(($ptr+100)|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=($4|0)==0;
 if($5){label=4;break;}else{label=3;break;}
 case 3: 
 var $7=$4;
 _free($7);
 label=4;break;
 case 4: 
 var $9=(($ptr+104)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=($10|0)==0;
 if($11){label=6;break;}else{label=5;break;}
 case 5: 
 var $13=$10;
 _free($13);
 label=6;break;
 case 6: 
 var $15=(($ptr+64)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$16;
 _free($17);
 var $18=(($ptr+68)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19;
 _free($20);
 var $21=(($ptr+88)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=$22;
 _free($23);
 var $24=(($ptr+92)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=$25;
 _free($26);
 var $27=(($ptr+96)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=$28;
 _free($29);
 var $30=(($ptr+4)|0);
 var $storemerge_i=0;label=7;break;
 case 7: 
 var $storemerge_i;
 var $32=HEAP32[(($30)>>2)];
 var $33=($storemerge_i|0)<($32|0);
 if($33){label=8;break;}else{label=9;break;}
 case 8: 
 var $35=(($ptr+72+($storemerge_i<<2))|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=$36;
 _free($37);
 var $38=(($ptr+80+($storemerge_i<<2))|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=$39;
 _free($40);
 var $41=((($storemerge_i)+(1))|0);
 var $storemerge_i=$41;label=7;break;
 case 9: 
 var $42=$ptr;
 _free($42);
 label=10;break;
 case 10: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __GLOBAL__I_a(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+104)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $args_i15_i_i=sp;
 var $args_i10_i_i=(sp)+(16);
 var $args_i5_i_i=(sp)+(40);
 var $args_i_i_i=(sp)+(56);
 var $args_i_i_i_i=(sp)+(80);
 var $1=(sp)+(96);
 var $2=(($1)|0);
 __embind_register_class(1768,1560,1544,0,(32),0,0,64,(22));
 var $3=$args_i_i_i_i;
 var $4=(($args_i_i_i_i)|0);
 HEAP32[(($4)>>2)]=2;
 var $5=(($args_i_i_i_i+4)|0);
 HEAP32[(($5)>>2)]=1560;
 var $6=(($args_i_i_i_i+8)|0);
 HEAP32[(($6)>>2)]=__ZTIi;
 __embind_register_class_constructor(1768,2,$5,(54),(10));
 var $7=$args_i_i_i;
 var $8=(($args_i_i_i)|0);
 HEAP32[(($8)>>2)]=5;
 var $9=(($args_i_i_i+4)|0);
 HEAP32[(($9)>>2)]=__ZTIi;
 var $10=(($args_i_i_i+8)|0);
 HEAP32[(($10)>>2)]=1560;
 var $11=(($args_i_i_i+12)|0);
 HEAP32[(($11)>>2)]=__ZTId;
 var $12=(($args_i_i_i+16)|0);
 HEAP32[(($12)>>2)]=__ZTId;
 var $13=(($args_i_i_i+20)|0);
 HEAP32[(($13)>>2)]=1528;
 var $14=_malloc(8);
 var $15=($14|0)==0;
 if($15){label=3;break;}else{label=2;break;}
 case 2: 
 var $17=$14;
 var $$etemp$0=(66);
 var $st$1$0=(($17)|0);
 HEAP32[(($st$1$0)>>2)]=$$etemp$0;
 var $st$2$1=(($17+4)|0);
 HEAP32[(($st$2$1)>>2)]=0;
 label=3;break;
 case 3: 
 __embind_register_class_function(1768,40,5,$9,(52),$14);
 var $18=$args_i5_i_i;
 var $19=(($args_i5_i_i)|0);
 HEAP32[(($19)>>2)]=2;
 var $20=(($args_i5_i_i+4)|0);
 HEAP32[(($20)>>2)]=__ZTIi;
 var $21=(($args_i5_i_i+8)|0);
 HEAP32[(($21)>>2)]=1560;
 var $22=_malloc(8);
 var $23=($22|0)==0;
 if($23){label=5;break;}else{label=4;break;}
 case 4: 
 var $25=$22;
 var $$etemp$3=(18);
 var $st$4$0=(($25)|0);
 HEAP32[(($st$4$0)>>2)]=$$etemp$3;
 var $st$5$1=(($25+4)|0);
 HEAP32[(($st$5$1)>>2)]=0;
 label=5;break;
 case 5: 
 __embind_register_class_function(1768,16,2,$20,(58),$22);
 var $26=$args_i10_i_i;
 var $27=(($args_i10_i_i)|0);
 HEAP32[(($27)>>2)]=5;
 var $28=(($args_i10_i_i+4)|0);
 HEAP32[(($28)>>2)]=__ZTIi;
 var $29=(($args_i10_i_i+8)|0);
 HEAP32[(($29)>>2)]=1560;
 var $30=(($args_i10_i_i+12)|0);
 HEAP32[(($30)>>2)]=__ZTId;
 var $31=(($args_i10_i_i+16)|0);
 HEAP32[(($31)>>2)]=__ZTId;
 var $32=(($args_i10_i_i+20)|0);
 HEAP32[(($32)>>2)]=1496;
 var $33=_malloc(8);
 var $34=($33|0)==0;
 if($34){label=7;break;}else{label=6;break;}
 case 6: 
 var $36=$33;
 var $$etemp$6=(2);
 var $st$7$0=(($36)|0);
 HEAP32[(($st$7$0)>>2)]=$$etemp$6;
 var $st$8$1=(($36+4)|0);
 HEAP32[(($st$8$1)>>2)]=0;
 label=7;break;
 case 7: 
 __embind_register_class_function(1768,536,5,$28,(30),$33);
 var $37=$args_i15_i_i;
 var $38=(($args_i15_i_i)|0);
 HEAP32[(($38)>>2)]=2;
 var $39=(($args_i15_i_i+4)|0);
 HEAP32[(($39)>>2)]=__ZTIi;
 var $40=(($args_i15_i_i+8)|0);
 HEAP32[(($40)>>2)]=1560;
 var $41=_malloc(8);
 var $42=($41|0)==0;
 if($42){label=9;break;}else{label=8;break;}
 case 8: 
 var $44=$41;
 var $$etemp$9=(4);
 var $st$10$0=(($44)|0);
 HEAP32[(($st$10$0)>>2)]=$$etemp$9;
 var $st$11$1=(($44+4)|0);
 HEAP32[(($st$11$1)>>2)]=0;
 label=9;break;
 case 9: 
 __embind_register_class_function(1768,504,2,$39,(58),$41);
 var $45=__ZN10emscripten6class_I17VizGeorefSpline2DNS_8internal11NoBaseClassEE8functionIPcJS6_EJNS_18allow_raw_pointersEEEERS4_PKcMS1_FT_DpT0_EDpT1_($1,472,(16),0);
 var $46=__ZN10emscripten6class_I17VizGeorefSpline2DNS_8internal11NoBaseClassEE8functionIPcJS6_EJNS_18allow_raw_pointersEEEERS4_PKcMS1_FT_DpT0_EDpT1_($45,448,(62),0);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }
}
function ___getTypeName($ti){
 var label=0;
 var $1=(($ti+4)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=_strdup($2);
 return $3;
}
Module["___getTypeName"] = ___getTypeName;
function __GLOBAL__I_a35(){
 var label=0;
 __embind_register_void(1448,320);
 __embind_register_bool(1456,488,1,0);
 __embind_register_integer(__ZTIc,288,-128,127);
 __embind_register_integer(__ZTIa,224,-128,127);
 __embind_register_integer(__ZTIh,144,0,255);
 __embind_register_integer(__ZTIs,88,-32768,32767);
 __embind_register_integer(__ZTIt,72,0,65535);
 __embind_register_integer(__ZTIi,56,-2147483648,2147483647);
 __embind_register_integer(__ZTIj,24,0,-1);
 __embind_register_integer(__ZTIl,8,-2147483648,2147483647);
 __embind_register_integer(__ZTIm,520,0,-1);
 __embind_register_float(__ZTIf,496);
 __embind_register_float(__ZTId,464);
 __embind_register_std_string(1608,432);
 __embind_register_std_wstring(1584,4,408);
 __embind_register_emval(1632,328);
 __embind_register_memory_view(1640,296);
 return;
}
function __ZN10__cxxabiv116__shim_type_infoD2Ev($this){
 var label=0;
 return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this){
 var label=0;
 return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this){
 var label=0;
 return;
}
function __ZN10__cxxabiv123__fundamental_type_infoD0Ev($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv117__class_type_infoD0Ev($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZN10__cxxabiv119__pointer_type_infoD0Ev($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$0){
 var label=0;
 var $2=(($this)|0);
 var $3=(($thrown_type)|0);
 var $4=($2|0)==($3|0);
 return $4;
}
function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=(($this)|0);
 var $2=(($thrown_type)|0);
 var $3=($1|0)==($2|0);
 if($3){var $_0=1;label=6;break;}else{label=2;break;}
 case 2: 
 var $5=($thrown_type|0)==0;
 if($5){var $_0=0;label=6;break;}else{label=3;break;}
 case 3: 
 var $7=$thrown_type;
 var $8=___dynamic_cast($7,1728);
 var $9=$8;
 var $10=($8|0)==0;
 if($10){var $_0=0;label=6;break;}else{label=4;break;}
 case 4: 
 var $12=$info;
 _memset($12, 0, 56)|0;
 var $13=(($info)|0);
 HEAP32[(($13)>>2)]=$9;
 var $14=(($info+8)|0);
 HEAP32[(($14)>>2)]=$this;
 var $15=(($info+12)|0);
 HEAP32[(($15)>>2)]=-1;
 var $16=(($info+48)|0);
 HEAP32[(($16)>>2)]=1;
 var $17=$8;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+28)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=HEAP32[(($adjustedPtr)>>2)];
 FUNCTION_TABLE[$20]($9,$info,$21,1);
 var $22=(($info+24)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==1;
 if($24){label=5;break;}else{var $_0=0;label=6;break;}
 case 5: 
 var $26=(($info+16)|0);
 var $27=HEAP32[(($26)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$27;
 var $_0=1;label=6;break;
 case 6: 
 var $_0;
 STACKTOP=sp;return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=8;break;}
 case 2: 
 var $5=(($info+16)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==0;
 if($7){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[(($5)>>2)]=$adjustedPtr;
 var $9=(($info+24)|0);
 HEAP32[(($9)>>2)]=$path_below;
 var $10=(($info+36)|0);
 HEAP32[(($10)>>2)]=1;
 label=8;break;
 case 4: 
 var $12=($6|0)==($adjustedPtr|0);
 if($12){label=5;break;}else{label=7;break;}
 case 5: 
 var $14=(($info+24)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)==2;
 if($16){label=6;break;}else{label=8;break;}
 case 6: 
 HEAP32[(($14)>>2)]=$path_below;
 label=8;break;
 case 7: 
 var $19=(($info+36)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=((($20)+(1))|0);
 HEAP32[(($19)>>2)]=$21;
 var $22=(($info+24)|0);
 HEAP32[(($22)>>2)]=2;
 var $23=(($info+54)|0);
 HEAP8[($23)]=1;
 label=8;break;
 case 8: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=8;break;}
 case 2: 
 var $7=(($info+16)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[(($7)>>2)]=$adjustedPtr;
 var $11=(($info+24)|0);
 HEAP32[(($11)>>2)]=$path_below;
 var $12=(($info+36)|0);
 HEAP32[(($12)>>2)]=1;
 label=9;break;
 case 4: 
 var $14=($8|0)==($adjustedPtr|0);
 if($14){label=5;break;}else{label=7;break;}
 case 5: 
 var $16=(($info+24)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=($17|0)==2;
 if($18){label=6;break;}else{label=9;break;}
 case 6: 
 HEAP32[(($16)>>2)]=$path_below;
 label=9;break;
 case 7: 
 var $21=(($info+36)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=((($22)+(1))|0);
 HEAP32[(($21)>>2)]=$23;
 var $24=(($info+24)|0);
 HEAP32[(($24)>>2)]=2;
 var $25=(($info+54)|0);
 HEAP8[($25)]=1;
 label=9;break;
 case 8: 
 var $27=(($this+8)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=$28;
 var $30=HEAP32[(($29)>>2)];
 var $31=(($30+28)|0);
 var $32=HEAP32[(($31)>>2)];
 FUNCTION_TABLE[$32]($28,$info,$adjustedPtr,$path_below);
 label=9;break;
 case 9: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=8;break;}
 case 2: 
 var $7=(($info+16)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[(($7)>>2)]=$adjustedPtr;
 var $11=(($info+24)|0);
 HEAP32[(($11)>>2)]=$path_below;
 var $12=(($info+36)|0);
 HEAP32[(($12)>>2)]=1;
 label=16;break;
 case 4: 
 var $14=($8|0)==($adjustedPtr|0);
 if($14){label=5;break;}else{label=7;break;}
 case 5: 
 var $16=(($info+24)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=($17|0)==2;
 if($18){label=6;break;}else{label=16;break;}
 case 6: 
 HEAP32[(($16)>>2)]=$path_below;
 label=16;break;
 case 7: 
 var $21=(($info+36)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=((($22)+(1))|0);
 HEAP32[(($21)>>2)]=$23;
 var $24=(($info+24)|0);
 HEAP32[(($24)>>2)]=2;
 var $25=(($info+54)|0);
 HEAP8[($25)]=1;
 label=16;break;
 case 8: 
 var $27=(($this+12)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=(($this+16+($28<<3))|0);
 var $30=(($this+20)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=$31>>8;
 var $33=$31&1;
 var $34=($33|0)==0;
 if($34){var $offset_to_base_0_i16=$32;label=10;break;}else{label=9;break;}
 case 9: 
 var $36=$adjustedPtr;
 var $37=HEAP32[(($36)>>2)];
 var $38=(($37+$32)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $offset_to_base_0_i16=$40;label=10;break;
 case 10: 
 var $offset_to_base_0_i16;
 var $41=(($this+16)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=$42;
 var $44=HEAP32[(($43)>>2)];
 var $45=(($44+28)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=(($adjustedPtr+$offset_to_base_0_i16)|0);
 var $48=$31&2;
 var $49=($48|0)!=0;
 var $50=($49?$path_below:2);
 FUNCTION_TABLE[$46]($42,$info,$47,$50);
 var $51=($28|0)>1;
 if($51){label=11;break;}else{label=16;break;}
 case 11: 
 var $52=(($this+24)|0);
 var $53=(($info+54)|0);
 var $54=$adjustedPtr;
 var $p_0=$52;label=12;break;
 case 12: 
 var $p_0;
 var $56=(($p_0+4)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=$57>>8;
 var $59=$57&1;
 var $60=($59|0)==0;
 if($60){var $offset_to_base_0_i=$58;label=14;break;}else{label=13;break;}
 case 13: 
 var $62=HEAP32[(($54)>>2)];
 var $63=(($62+$58)|0);
 var $64=$63;
 var $65=HEAP32[(($64)>>2)];
 var $offset_to_base_0_i=$65;label=14;break;
 case 14: 
 var $offset_to_base_0_i;
 var $66=(($p_0)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=$67;
 var $69=HEAP32[(($68)>>2)];
 var $70=(($69+28)|0);
 var $71=HEAP32[(($70)>>2)];
 var $72=(($adjustedPtr+$offset_to_base_0_i)|0);
 var $73=$57&2;
 var $74=($73|0)!=0;
 var $75=($74?$path_below:2);
 FUNCTION_TABLE[$71]($67,$info,$72,$75);
 var $76=HEAP8[($53)];
 var $77=$76&1;
 var $78=(($77<<24)>>24)==0;
 if($78){label=15;break;}else{label=16;break;}
 case 15: 
 var $80=(($p_0+8)|0);
 var $81=($80>>>0)<($29>>>0);
 if($81){var $p_0=$80;label=12;break;}else{label=16;break;}
 case 16: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=HEAP32[(($adjustedPtr)>>2)];
 var $2=$1;
 var $3=HEAP32[(($2)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$3;
 var $4=(($this)|0);
 var $5=(($thrown_type)|0);
 var $6=($4|0)==($5|0);
 var $7=($5|0)==1760;
 var $__i=$6|$7;
 if($__i){var $_0=1;label=12;break;}else{label=2;break;}
 case 2: 
 var $9=($thrown_type|0)==0;
 if($9){var $_0=0;label=12;break;}else{label=3;break;}
 case 3: 
 var $11=$thrown_type;
 var $12=___dynamic_cast($11,1696);
 var $13=($12|0)==0;
 if($13){var $_0=0;label=12;break;}else{label=4;break;}
 case 4: 
 var $15=(($12+8)|0);
 var $16=$15;
 var $17=HEAP32[(($16)>>2)];
 var $18=(($this+8)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19^-1;
 var $21=$17&$20;
 var $22=($21|0)==0;
 if($22){label=5;break;}else{var $_0=0;label=12;break;}
 case 5: 
 var $24=(($this+12)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=(($25)|0);
 var $27=(($12+12)|0);
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $30=($25|0)==($29|0);
 var $31=($26|0)==1448;
 var $or_cond=$30|$31;
 if($or_cond){var $_0=1;label=12;break;}else{label=6;break;}
 case 6: 
 var $33=($25|0)==0;
 if($33){var $_0=0;label=12;break;}else{label=7;break;}
 case 7: 
 var $35=$25;
 var $36=___dynamic_cast($35,1728);
 var $37=$36;
 var $38=($36|0)==0;
 if($38){var $_0=0;label=12;break;}else{label=8;break;}
 case 8: 
 var $40=HEAP32[(($28)>>2)];
 var $41=($40|0)==0;
 if($41){var $_0=0;label=12;break;}else{label=9;break;}
 case 9: 
 var $43=$40;
 var $44=___dynamic_cast($43,1728);
 var $45=$44;
 var $46=($44|0)==0;
 if($46){var $_0=0;label=12;break;}else{label=10;break;}
 case 10: 
 var $48=$info;
 _memset($48, 0, 56)|0;
 var $49=(($info)|0);
 HEAP32[(($49)>>2)]=$45;
 var $50=(($info+8)|0);
 HEAP32[(($50)>>2)]=$37;
 var $51=(($info+12)|0);
 HEAP32[(($51)>>2)]=-1;
 var $52=(($info+48)|0);
 HEAP32[(($52)>>2)]=1;
 var $53=$44;
 var $54=HEAP32[(($53)>>2)];
 var $55=(($54+28)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=HEAP32[(($adjustedPtr)>>2)];
 FUNCTION_TABLE[$56]($45,$info,$57,1);
 var $58=(($info+24)|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=($59|0)==1;
 if($60){label=11;break;}else{var $_0=0;label=12;break;}
 case 11: 
 var $62=(($info+16)|0);
 var $63=HEAP32[(($62)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$63;
 var $_0=1;label=12;break;
 case 12: 
 var $_0;
 STACKTOP=sp;return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function ___dynamic_cast($static_ptr,$dst_type){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=$static_ptr;
 var $2=HEAP32[(($1)>>2)];
 var $3=((($2)-(8))|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=$4;
 var $6=(($static_ptr+$5)|0);
 var $7=((($2)-(4))|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=$8;
 var $10=(($info)|0);
 HEAP32[(($10)>>2)]=$dst_type;
 var $11=(($info+4)|0);
 HEAP32[(($11)>>2)]=$static_ptr;
 var $12=(($info+8)|0);
 HEAP32[(($12)>>2)]=1744;
 var $13=(($info+12)|0);
 HEAP32[(($13)>>2)]=-1;
 var $14=(($info+16)|0);
 var $15=(($info+20)|0);
 var $16=(($info+24)|0);
 var $17=(($info+28)|0);
 var $18=(($info+32)|0);
 var $19=(($info+40)|0);
 var $20=$8;
 var $21=(($dst_type)|0);
 var $22=($20|0)==($21|0);
 var $23=$14;
 _memset($23, 0, 39)|0;
 if($22){label=2;break;}else{label=3;break;}
 case 2: 
 var $25=(($info+48)|0);
 HEAP32[(($25)>>2)]=1;
 var $26=$8;
 var $27=HEAP32[(($26)>>2)];
 var $28=(($27+20)|0);
 var $29=HEAP32[(($28)>>2)];
 FUNCTION_TABLE[$29]($9,$info,$6,$6,1,0);
 var $30=HEAP32[(($16)>>2)];
 var $31=($30|0)==1;
 var $_=($31?$6:0);
 STACKTOP=sp;return $_;
 case 3: 
 var $33=(($info+36)|0);
 var $34=$8;
 var $35=HEAP32[(($34)>>2)];
 var $36=(($35+24)|0);
 var $37=HEAP32[(($36)>>2)];
 FUNCTION_TABLE[$37]($9,$info,$6,1,0);
 var $38=HEAP32[(($33)>>2)];
 if(($38|0)==0){ label=4;break;}else if(($38|0)==1){ label=7;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 4: 
 var $40=HEAP32[(($19)>>2)];
 var $41=($40|0)==1;
 if($41){label=5;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 5: 
 var $43=HEAP32[(($17)>>2)];
 var $44=($43|0)==1;
 if($44){label=6;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 6: 
 var $46=HEAP32[(($18)>>2)];
 var $47=($46|0)==1;
 var $48=HEAP32[(($15)>>2)];
 var $_13=($47?$48:0);
 var $dst_ptr_0=$_13;label=12;break;
 case 7: 
 var $50=HEAP32[(($16)>>2)];
 var $51=($50|0)==1;
 if($51){label=11;break;}else{label=8;break;}
 case 8: 
 var $53=HEAP32[(($19)>>2)];
 var $54=($53|0)==0;
 if($54){label=9;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 9: 
 var $56=HEAP32[(($17)>>2)];
 var $57=($56|0)==1;
 if($57){label=10;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 10: 
 var $59=HEAP32[(($18)>>2)];
 var $60=($59|0)==1;
 if($60){label=11;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 11: 
 var $62=HEAP32[(($14)>>2)];
 var $dst_ptr_0=$62;label=12;break;
 case 12: 
 var $dst_ptr_0;
 STACKTOP=sp;return $dst_ptr_0;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=5;break;}
 case 2: 
 var $7=(($info+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==($current_ptr|0);
 if($9){label=3;break;}else{label=53;break;}
 case 3: 
 var $11=(($info+28)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==1;
 if($13){label=53;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$path_below;
 label=53;break;
 case 5: 
 var $16=(($info)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17)|0);
 var $19=($1|0)==($18|0);
 if($19){label=6;break;}else{label=29;break;}
 case 6: 
 var $21=(($info+16)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=($22|0)==($current_ptr|0);
 if($23){label=8;break;}else{label=7;break;}
 case 7: 
 var $25=(($info+20)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=($26|0)==($current_ptr|0);
 if($27){label=8;break;}else{label=10;break;}
 case 8: 
 var $29=($path_below|0)==1;
 if($29){label=9;break;}else{label=53;break;}
 case 9: 
 var $31=(($info+32)|0);
 HEAP32[(($31)>>2)]=1;
 label=53;break;
 case 10: 
 var $33=(($info+32)|0);
 HEAP32[(($33)>>2)]=$path_below;
 var $34=(($info+44)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==4;
 if($36){label=53;break;}else{label=11;break;}
 case 11: 
 var $38=(($this+12)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=(($this+16+($39<<3))|0);
 var $41=($39|0)>0;
 if($41){label=12;break;}else{var $is_dst_type_derived_from_static_type_2_off098=0;label=23;break;}
 case 12: 
 var $42=(($this+16)|0);
 var $43=(($info+52)|0);
 var $44=(($info+53)|0);
 var $45=(($info+54)|0);
 var $46=(($this+8)|0);
 var $47=(($info+24)|0);
 var $48=$current_ptr;
 var $does_dst_type_point_to_our_static_type_0_off087=0;var $p_088=$42;var $is_dst_type_derived_from_static_type_0_off089=0;label=13;break;
 case 13: 
 var $is_dst_type_derived_from_static_type_0_off089;
 var $p_088;
 var $does_dst_type_point_to_our_static_type_0_off087;
 HEAP8[($43)]=0;
 HEAP8[($44)]=0;
 var $50=(($p_088+4)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=$51>>8;
 var $53=$51&1;
 var $54=($53|0)==0;
 if($54){var $offset_to_base_0_i81=$52;label=15;break;}else{label=14;break;}
 case 14: 
 var $56=HEAP32[(($48)>>2)];
 var $57=(($56+$52)|0);
 var $58=$57;
 var $59=HEAP32[(($58)>>2)];
 var $offset_to_base_0_i81=$59;label=15;break;
 case 15: 
 var $offset_to_base_0_i81;
 var $60=(($p_088)|0);
 var $61=HEAP32[(($60)>>2)];
 var $62=$61;
 var $63=HEAP32[(($62)>>2)];
 var $64=(($63+20)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=(($current_ptr+$offset_to_base_0_i81)|0);
 var $67=$51>>>1;
 var $68=$67&1;
 var $69=(((2)-($68))|0);
 FUNCTION_TABLE[$65]($61,$info,$current_ptr,$66,$69,$use_strcmp);
 var $70=HEAP8[($45)];
 var $71=$70&1;
 var $72=(($71<<24)>>24)==0;
 if($72){label=16;break;}else{var $is_dst_type_derived_from_static_type_2_off0=$is_dst_type_derived_from_static_type_0_off089;var $does_dst_type_point_to_our_static_type_0_off0_lcssa=$does_dst_type_point_to_our_static_type_0_off087;label=22;break;}
 case 16: 
 var $74=HEAP8[($44)];
 var $75=$74&1;
 var $76=(($75<<24)>>24)==0;
 if($76){var $is_dst_type_derived_from_static_type_1_off0=$is_dst_type_derived_from_static_type_0_off089;var $does_dst_type_point_to_our_static_type_1_off0=$does_dst_type_point_to_our_static_type_0_off087;label=21;break;}else{label=17;break;}
 case 17: 
 var $78=HEAP8[($43)];
 var $79=$78&1;
 var $80=(($79<<24)>>24)==0;
 if($80){label=20;break;}else{label=18;break;}
 case 18: 
 var $82=HEAP32[(($47)>>2)];
 var $83=($82|0)==1;
 if($83){label=27;break;}else{label=19;break;}
 case 19: 
 var $85=HEAP32[(($46)>>2)];
 var $86=$85&2;
 var $87=($86|0)==0;
 if($87){label=27;break;}else{var $is_dst_type_derived_from_static_type_1_off0=1;var $does_dst_type_point_to_our_static_type_1_off0=1;label=21;break;}
 case 20: 
 var $89=HEAP32[(($46)>>2)];
 var $90=$89&1;
 var $91=($90|0)==0;
 if($91){var $is_dst_type_derived_from_static_type_2_off0=1;var $does_dst_type_point_to_our_static_type_0_off0_lcssa=$does_dst_type_point_to_our_static_type_0_off087;label=22;break;}else{var $is_dst_type_derived_from_static_type_1_off0=1;var $does_dst_type_point_to_our_static_type_1_off0=$does_dst_type_point_to_our_static_type_0_off087;label=21;break;}
 case 21: 
 var $does_dst_type_point_to_our_static_type_1_off0;
 var $is_dst_type_derived_from_static_type_1_off0;
 var $93=(($p_088+8)|0);
 var $94=($93>>>0)<($40>>>0);
 if($94){var $does_dst_type_point_to_our_static_type_0_off087=$does_dst_type_point_to_our_static_type_1_off0;var $p_088=$93;var $is_dst_type_derived_from_static_type_0_off089=$is_dst_type_derived_from_static_type_1_off0;label=13;break;}else{var $is_dst_type_derived_from_static_type_2_off0=$is_dst_type_derived_from_static_type_1_off0;var $does_dst_type_point_to_our_static_type_0_off0_lcssa=$does_dst_type_point_to_our_static_type_1_off0;label=22;break;}
 case 22: 
 var $does_dst_type_point_to_our_static_type_0_off0_lcssa;
 var $is_dst_type_derived_from_static_type_2_off0;
 if($does_dst_type_point_to_our_static_type_0_off0_lcssa){var $is_dst_type_derived_from_static_type_2_off099=$is_dst_type_derived_from_static_type_2_off0;label=26;break;}else{var $is_dst_type_derived_from_static_type_2_off098=$is_dst_type_derived_from_static_type_2_off0;label=23;break;}
 case 23: 
 var $is_dst_type_derived_from_static_type_2_off098;
 HEAP32[(($25)>>2)]=$current_ptr;
 var $95=(($info+40)|0);
 var $96=HEAP32[(($95)>>2)];
 var $97=((($96)+(1))|0);
 HEAP32[(($95)>>2)]=$97;
 var $98=(($info+36)|0);
 var $99=HEAP32[(($98)>>2)];
 var $100=($99|0)==1;
 if($100){label=24;break;}else{var $is_dst_type_derived_from_static_type_2_off099=$is_dst_type_derived_from_static_type_2_off098;label=26;break;}
 case 24: 
 var $102=(($info+24)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==2;
 if($104){label=25;break;}else{var $is_dst_type_derived_from_static_type_2_off099=$is_dst_type_derived_from_static_type_2_off098;label=26;break;}
 case 25: 
 var $106=(($info+54)|0);
 HEAP8[($106)]=1;
 if($is_dst_type_derived_from_static_type_2_off098){label=27;break;}else{label=28;break;}
 case 26: 
 var $is_dst_type_derived_from_static_type_2_off099;
 if($is_dst_type_derived_from_static_type_2_off099){label=27;break;}else{label=28;break;}
 case 27: 
 HEAP32[(($34)>>2)]=3;
 label=53;break;
 case 28: 
 HEAP32[(($34)>>2)]=4;
 label=53;break;
 case 29: 
 var $110=(($this+12)|0);
 var $111=HEAP32[(($110)>>2)];
 var $112=(($this+16+($111<<3))|0);
 var $113=(($this+20)|0);
 var $114=HEAP32[(($113)>>2)];
 var $115=$114>>8;
 var $116=$114&1;
 var $117=($116|0)==0;
 if($117){var $offset_to_base_0_i82=$115;label=31;break;}else{label=30;break;}
 case 30: 
 var $119=$current_ptr;
 var $120=HEAP32[(($119)>>2)];
 var $121=(($120+$115)|0);
 var $122=$121;
 var $123=HEAP32[(($122)>>2)];
 var $offset_to_base_0_i82=$123;label=31;break;
 case 31: 
 var $offset_to_base_0_i82;
 var $124=(($this+16)|0);
 var $125=HEAP32[(($124)>>2)];
 var $126=$125;
 var $127=HEAP32[(($126)>>2)];
 var $128=(($127+24)|0);
 var $129=HEAP32[(($128)>>2)];
 var $130=(($current_ptr+$offset_to_base_0_i82)|0);
 var $131=$114&2;
 var $132=($131|0)!=0;
 var $133=($132?$path_below:2);
 FUNCTION_TABLE[$129]($125,$info,$130,$133,$use_strcmp);
 var $134=(($this+24)|0);
 var $135=($111|0)>1;
 if($135){label=32;break;}else{label=53;break;}
 case 32: 
 var $137=(($this+8)|0);
 var $138=HEAP32[(($137)>>2)];
 var $139=$138&2;
 var $140=($139|0)==0;
 if($140){label=33;break;}else{label=34;break;}
 case 33: 
 var $142=(($info+36)|0);
 var $143=HEAP32[(($142)>>2)];
 var $144=($143|0)==1;
 if($144){label=34;break;}else{label=39;break;}
 case 34: 
 var $145=(($info+54)|0);
 var $146=$current_ptr;
 var $p2_0=$134;label=35;break;
 case 35: 
 var $p2_0;
 var $148=HEAP8[($145)];
 var $149=$148&1;
 var $150=(($149<<24)>>24)==0;
 if($150){label=36;break;}else{label=53;break;}
 case 36: 
 var $152=(($p2_0+4)|0);
 var $153=HEAP32[(($152)>>2)];
 var $154=$153>>8;
 var $155=$153&1;
 var $156=($155|0)==0;
 if($156){var $offset_to_base_0_i79=$154;label=38;break;}else{label=37;break;}
 case 37: 
 var $158=HEAP32[(($146)>>2)];
 var $159=(($158+$154)|0);
 var $160=$159;
 var $161=HEAP32[(($160)>>2)];
 var $offset_to_base_0_i79=$161;label=38;break;
 case 38: 
 var $offset_to_base_0_i79;
 var $162=(($p2_0)|0);
 var $163=HEAP32[(($162)>>2)];
 var $164=$163;
 var $165=HEAP32[(($164)>>2)];
 var $166=(($165+24)|0);
 var $167=HEAP32[(($166)>>2)];
 var $168=(($current_ptr+$offset_to_base_0_i79)|0);
 var $169=$153&2;
 var $170=($169|0)!=0;
 var $171=($170?$path_below:2);
 FUNCTION_TABLE[$167]($163,$info,$168,$171,$use_strcmp);
 var $172=(($p2_0+8)|0);
 var $173=($172>>>0)<($112>>>0);
 if($173){var $p2_0=$172;label=35;break;}else{label=53;break;}
 case 39: 
 var $175=$138&1;
 var $176=($175|0)==0;
 if($176){label=41;break;}else{label=40;break;}
 case 40: 
 var $177=(($info+24)|0);
 var $178=(($info+54)|0);
 var $179=$current_ptr;
 var $p2_1=$134;label=42;break;
 case 41: 
 var $180=(($info+54)|0);
 var $181=$current_ptr;
 var $p2_2=$134;label=48;break;
 case 42: 
 var $p2_1;
 var $183=HEAP8[($178)];
 var $184=$183&1;
 var $185=(($184<<24)>>24)==0;
 if($185){label=43;break;}else{label=53;break;}
 case 43: 
 var $187=HEAP32[(($142)>>2)];
 var $188=($187|0)==1;
 if($188){label=44;break;}else{label=45;break;}
 case 44: 
 var $190=HEAP32[(($177)>>2)];
 var $191=($190|0)==1;
 if($191){label=53;break;}else{label=45;break;}
 case 45: 
 var $193=(($p2_1+4)|0);
 var $194=HEAP32[(($193)>>2)];
 var $195=$194>>8;
 var $196=$194&1;
 var $197=($196|0)==0;
 if($197){var $offset_to_base_0_i77=$195;label=47;break;}else{label=46;break;}
 case 46: 
 var $199=HEAP32[(($179)>>2)];
 var $200=(($199+$195)|0);
 var $201=$200;
 var $202=HEAP32[(($201)>>2)];
 var $offset_to_base_0_i77=$202;label=47;break;
 case 47: 
 var $offset_to_base_0_i77;
 var $203=(($p2_1)|0);
 var $204=HEAP32[(($203)>>2)];
 var $205=$204;
 var $206=HEAP32[(($205)>>2)];
 var $207=(($206+24)|0);
 var $208=HEAP32[(($207)>>2)];
 var $209=(($current_ptr+$offset_to_base_0_i77)|0);
 var $210=$194&2;
 var $211=($210|0)!=0;
 var $212=($211?$path_below:2);
 FUNCTION_TABLE[$208]($204,$info,$209,$212,$use_strcmp);
 var $213=(($p2_1+8)|0);
 var $214=($213>>>0)<($112>>>0);
 if($214){var $p2_1=$213;label=42;break;}else{label=53;break;}
 case 48: 
 var $p2_2;
 var $216=HEAP8[($180)];
 var $217=$216&1;
 var $218=(($217<<24)>>24)==0;
 if($218){label=49;break;}else{label=53;break;}
 case 49: 
 var $220=HEAP32[(($142)>>2)];
 var $221=($220|0)==1;
 if($221){label=53;break;}else{label=50;break;}
 case 50: 
 var $223=(($p2_2+4)|0);
 var $224=HEAP32[(($223)>>2)];
 var $225=$224>>8;
 var $226=$224&1;
 var $227=($226|0)==0;
 if($227){var $offset_to_base_0_i=$225;label=52;break;}else{label=51;break;}
 case 51: 
 var $229=HEAP32[(($181)>>2)];
 var $230=(($229+$225)|0);
 var $231=$230;
 var $232=HEAP32[(($231)>>2)];
 var $offset_to_base_0_i=$232;label=52;break;
 case 52: 
 var $offset_to_base_0_i;
 var $233=(($p2_2)|0);
 var $234=HEAP32[(($233)>>2)];
 var $235=$234;
 var $236=HEAP32[(($235)>>2)];
 var $237=(($236+24)|0);
 var $238=HEAP32[(($237)>>2)];
 var $239=(($current_ptr+$offset_to_base_0_i)|0);
 var $240=$224&2;
 var $241=($240|0)!=0;
 var $242=($241?$path_below:2);
 FUNCTION_TABLE[$238]($234,$info,$239,$242,$use_strcmp);
 var $243=(($p2_2+8)|0);
 var $244=($243>>>0)<($112>>>0);
 if($244){var $p2_2=$243;label=48;break;}else{label=53;break;}
 case 53: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=5;break;}
 case 2: 
 var $7=(($info+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==($current_ptr|0);
 if($9){label=3;break;}else{label=20;break;}
 case 3: 
 var $11=(($info+28)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==1;
 if($13){label=20;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$path_below;
 label=20;break;
 case 5: 
 var $16=(($info)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17)|0);
 var $19=($1|0)==($18|0);
 if($19){label=6;break;}else{label=19;break;}
 case 6: 
 var $21=(($info+16)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=($22|0)==($current_ptr|0);
 if($23){label=8;break;}else{label=7;break;}
 case 7: 
 var $25=(($info+20)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=($26|0)==($current_ptr|0);
 if($27){label=8;break;}else{label=10;break;}
 case 8: 
 var $29=($path_below|0)==1;
 if($29){label=9;break;}else{label=20;break;}
 case 9: 
 var $31=(($info+32)|0);
 HEAP32[(($31)>>2)]=1;
 label=20;break;
 case 10: 
 var $33=(($info+32)|0);
 HEAP32[(($33)>>2)]=$path_below;
 var $34=(($info+44)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==4;
 if($36){label=20;break;}else{label=11;break;}
 case 11: 
 var $38=(($info+52)|0);
 HEAP8[($38)]=0;
 var $39=(($info+53)|0);
 HEAP8[($39)]=0;
 var $40=(($this+8)|0);
 var $41=HEAP32[(($40)>>2)];
 var $42=$41;
 var $43=HEAP32[(($42)>>2)];
 var $44=(($43+20)|0);
 var $45=HEAP32[(($44)>>2)];
 FUNCTION_TABLE[$45]($41,$info,$current_ptr,$current_ptr,1,$use_strcmp);
 var $46=HEAP8[($39)];
 var $47=$46&1;
 var $48=(($47<<24)>>24)==0;
 if($48){var $is_dst_type_derived_from_static_type_0_off036=0;label=13;break;}else{label=12;break;}
 case 12: 
 var $50=HEAP8[($38)];
 var $51=$50&1;
 var $not_=(($51<<24)>>24)==0;
 if($not_){var $is_dst_type_derived_from_static_type_0_off036=1;label=13;break;}else{label=17;break;}
 case 13: 
 var $is_dst_type_derived_from_static_type_0_off036;
 HEAP32[(($25)>>2)]=$current_ptr;
 var $52=(($info+40)|0);
 var $53=HEAP32[(($52)>>2)];
 var $54=((($53)+(1))|0);
 HEAP32[(($52)>>2)]=$54;
 var $55=(($info+36)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=($56|0)==1;
 if($57){label=14;break;}else{label=16;break;}
 case 14: 
 var $59=(($info+24)|0);
 var $60=HEAP32[(($59)>>2)];
 var $61=($60|0)==2;
 if($61){label=15;break;}else{label=16;break;}
 case 15: 
 var $63=(($info+54)|0);
 HEAP8[($63)]=1;
 if($is_dst_type_derived_from_static_type_0_off036){label=17;break;}else{label=18;break;}
 case 16: 
 if($is_dst_type_derived_from_static_type_0_off036){label=17;break;}else{label=18;break;}
 case 17: 
 HEAP32[(($34)>>2)]=3;
 label=20;break;
 case 18: 
 HEAP32[(($34)>>2)]=4;
 label=20;break;
 case 19: 
 var $67=(($this+8)|0);
 var $68=HEAP32[(($67)>>2)];
 var $69=$68;
 var $70=HEAP32[(($69)>>2)];
 var $71=(($70+24)|0);
 var $72=HEAP32[(($71)>>2)];
 FUNCTION_TABLE[$72]($68,$info,$current_ptr,$path_below,$use_strcmp);
 label=20;break;
 case 20: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=5;break;}
 case 2: 
 var $5=(($info+4)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==($current_ptr|0);
 if($7){label=3;break;}else{label=14;break;}
 case 3: 
 var $9=(($info+28)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=($10|0)==1;
 if($11){label=14;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($9)>>2)]=$path_below;
 label=14;break;
 case 5: 
 var $14=(($info)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)==($this|0);
 if($16){label=6;break;}else{label=14;break;}
 case 6: 
 var $18=(($info+16)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=($19|0)==($current_ptr|0);
 if($20){label=8;break;}else{label=7;break;}
 case 7: 
 var $22=(($info+20)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==($current_ptr|0);
 if($24){label=8;break;}else{label=10;break;}
 case 8: 
 var $26=($path_below|0)==1;
 if($26){label=9;break;}else{label=14;break;}
 case 9: 
 var $28=(($info+32)|0);
 HEAP32[(($28)>>2)]=1;
 label=14;break;
 case 10: 
 var $30=(($info+32)|0);
 HEAP32[(($30)>>2)]=$path_below;
 HEAP32[(($22)>>2)]=$current_ptr;
 var $31=(($info+40)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=((($32)+(1))|0);
 HEAP32[(($31)>>2)]=$33;
 var $34=(($info+36)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 if($36){label=11;break;}else{label=13;break;}
 case 11: 
 var $38=(($info+24)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=($39|0)==2;
 if($40){label=12;break;}else{label=13;break;}
 case 12: 
 var $42=(($info+54)|0);
 HEAP8[($42)]=1;
 label=13;break;
 case 13: 
 var $44=(($info+44)|0);
 HEAP32[(($44)>>2)]=4;
 label=14;break;
 case 14: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=12;break;}
 case 2: 
 var $7=(($info+53)|0);
 HEAP8[($7)]=1;
 var $8=(($info+4)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=($9|0)==($current_ptr|0);
 if($10){label=3;break;}else{label=26;break;}
 case 3: 
 var $12=(($info+52)|0);
 HEAP8[($12)]=1;
 var $13=(($info+16)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=($14|0)==0;
 if($15){label=4;break;}else{label=6;break;}
 case 4: 
 HEAP32[(($13)>>2)]=$dst_ptr;
 var $17=(($info+24)|0);
 HEAP32[(($17)>>2)]=$path_below;
 var $18=(($info+36)|0);
 HEAP32[(($18)>>2)]=1;
 var $19=(($info+48)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=($20|0)==1;
 var $22=($path_below|0)==1;
 var $or_cond_i=$21&$22;
 if($or_cond_i){label=5;break;}else{label=26;break;}
 case 5: 
 var $24=(($info+54)|0);
 HEAP8[($24)]=1;
 label=26;break;
 case 6: 
 var $26=($14|0)==($dst_ptr|0);
 if($26){label=7;break;}else{label=11;break;}
 case 7: 
 var $28=(($info+24)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=($29|0)==2;
 if($30){label=8;break;}else{var $33=$29;label=9;break;}
 case 8: 
 HEAP32[(($28)>>2)]=$path_below;
 var $33=$path_below;label=9;break;
 case 9: 
 var $33;
 var $34=(($info+48)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 var $37=($33|0)==1;
 var $or_cond23_i=$36&$37;
 if($or_cond23_i){label=10;break;}else{label=26;break;}
 case 10: 
 var $39=(($info+54)|0);
 HEAP8[($39)]=1;
 label=26;break;
 case 11: 
 var $41=(($info+36)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=((($42)+(1))|0);
 HEAP32[(($41)>>2)]=$43;
 var $44=(($info+54)|0);
 HEAP8[($44)]=1;
 label=26;break;
 case 12: 
 var $46=(($info+52)|0);
 var $47=HEAP8[($46)];
 var $48=$47&1;
 var $49=(($info+53)|0);
 var $50=HEAP8[($49)];
 var $51=$50&1;
 var $52=(($this+12)|0);
 var $53=HEAP32[(($52)>>2)];
 var $54=(($this+16+($53<<3))|0);
 HEAP8[($46)]=0;
 HEAP8[($49)]=0;
 var $55=(($this+20)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=$56>>8;
 var $58=$56&1;
 var $59=($58|0)==0;
 if($59){var $offset_to_base_0_i32=$57;label=14;break;}else{label=13;break;}
 case 13: 
 var $61=$current_ptr;
 var $62=HEAP32[(($61)>>2)];
 var $63=(($62+$57)|0);
 var $64=$63;
 var $65=HEAP32[(($64)>>2)];
 var $offset_to_base_0_i32=$65;label=14;break;
 case 14: 
 var $offset_to_base_0_i32;
 var $66=(($this+16)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=$67;
 var $69=HEAP32[(($68)>>2)];
 var $70=(($69+20)|0);
 var $71=HEAP32[(($70)>>2)];
 var $72=(($current_ptr+$offset_to_base_0_i32)|0);
 var $73=$56&2;
 var $74=($73|0)!=0;
 var $75=($74?$path_below:2);
 FUNCTION_TABLE[$71]($67,$info,$dst_ptr,$72,$75,$use_strcmp);
 var $76=($53|0)>1;
 if($76){label=15;break;}else{label=25;break;}
 case 15: 
 var $77=(($this+24)|0);
 var $78=(($info+24)|0);
 var $79=(($this+8)|0);
 var $80=(($info+54)|0);
 var $81=$current_ptr;
 var $p_0=$77;label=16;break;
 case 16: 
 var $p_0;
 var $83=HEAP8[($80)];
 var $84=$83&1;
 var $85=(($84<<24)>>24)==0;
 if($85){label=17;break;}else{label=25;break;}
 case 17: 
 var $87=HEAP8[($46)];
 var $88=$87&1;
 var $89=(($88<<24)>>24)==0;
 if($89){label=20;break;}else{label=18;break;}
 case 18: 
 var $91=HEAP32[(($78)>>2)];
 var $92=($91|0)==1;
 if($92){label=25;break;}else{label=19;break;}
 case 19: 
 var $94=HEAP32[(($79)>>2)];
 var $95=$94&2;
 var $96=($95|0)==0;
 if($96){label=25;break;}else{label=22;break;}
 case 20: 
 var $98=HEAP8[($49)];
 var $99=$98&1;
 var $100=(($99<<24)>>24)==0;
 if($100){label=22;break;}else{label=21;break;}
 case 21: 
 var $102=HEAP32[(($79)>>2)];
 var $103=$102&1;
 var $104=($103|0)==0;
 if($104){label=25;break;}else{label=22;break;}
 case 22: 
 HEAP8[($46)]=0;
 HEAP8[($49)]=0;
 var $106=(($p_0+4)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=$107>>8;
 var $109=$107&1;
 var $110=($109|0)==0;
 if($110){var $offset_to_base_0_i=$108;label=24;break;}else{label=23;break;}
 case 23: 
 var $112=HEAP32[(($81)>>2)];
 var $113=(($112+$108)|0);
 var $114=$113;
 var $115=HEAP32[(($114)>>2)];
 var $offset_to_base_0_i=$115;label=24;break;
 case 24: 
 var $offset_to_base_0_i;
 var $116=(($p_0)|0);
 var $117=HEAP32[(($116)>>2)];
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=(($119+20)|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=(($current_ptr+$offset_to_base_0_i)|0);
 var $123=$107&2;
 var $124=($123|0)!=0;
 var $125=($124?$path_below:2);
 FUNCTION_TABLE[$121]($117,$info,$dst_ptr,$122,$125,$use_strcmp);
 var $126=(($p_0+8)|0);
 var $127=($126>>>0)<($54>>>0);
 if($127){var $p_0=$126;label=16;break;}else{label=25;break;}
 case 25: 
 HEAP8[($46)]=$48;
 HEAP8[($49)]=$51;
 label=26;break;
 case 26: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=12;break;}
 case 2: 
 var $7=(($info+53)|0);
 HEAP8[($7)]=1;
 var $8=(($info+4)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=($9|0)==($current_ptr|0);
 if($10){label=3;break;}else{label=13;break;}
 case 3: 
 var $12=(($info+52)|0);
 HEAP8[($12)]=1;
 var $13=(($info+16)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=($14|0)==0;
 if($15){label=4;break;}else{label=6;break;}
 case 4: 
 HEAP32[(($13)>>2)]=$dst_ptr;
 var $17=(($info+24)|0);
 HEAP32[(($17)>>2)]=$path_below;
 var $18=(($info+36)|0);
 HEAP32[(($18)>>2)]=1;
 var $19=(($info+48)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=($20|0)==1;
 var $22=($path_below|0)==1;
 var $or_cond_i=$21&$22;
 if($or_cond_i){label=5;break;}else{label=13;break;}
 case 5: 
 var $24=(($info+54)|0);
 HEAP8[($24)]=1;
 label=13;break;
 case 6: 
 var $26=($14|0)==($dst_ptr|0);
 if($26){label=7;break;}else{label=11;break;}
 case 7: 
 var $28=(($info+24)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=($29|0)==2;
 if($30){label=8;break;}else{var $33=$29;label=9;break;}
 case 8: 
 HEAP32[(($28)>>2)]=$path_below;
 var $33=$path_below;label=9;break;
 case 9: 
 var $33;
 var $34=(($info+48)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 var $37=($33|0)==1;
 var $or_cond23_i=$36&$37;
 if($or_cond23_i){label=10;break;}else{label=13;break;}
 case 10: 
 var $39=(($info+54)|0);
 HEAP8[($39)]=1;
 label=13;break;
 case 11: 
 var $41=(($info+36)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=((($42)+(1))|0);
 HEAP32[(($41)>>2)]=$43;
 var $44=(($info+54)|0);
 HEAP8[($44)]=1;
 label=13;break;
 case 12: 
 var $46=(($this+8)|0);
 var $47=HEAP32[(($46)>>2)];
 var $48=$47;
 var $49=HEAP32[(($48)>>2)];
 var $50=(($49+20)|0);
 var $51=HEAP32[(($50)>>2)];
 FUNCTION_TABLE[$51]($47,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp);
 label=13;break;
 case 13: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=12;break;}
 case 2: 
 var $5=(($info+53)|0);
 HEAP8[($5)]=1;
 var $6=(($info+4)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=($7|0)==($current_ptr|0);
 if($8){label=3;break;}else{label=12;break;}
 case 3: 
 var $10=(($info+52)|0);
 HEAP8[($10)]=1;
 var $11=(($info+16)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==0;
 if($13){label=4;break;}else{label=6;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$dst_ptr;
 var $15=(($info+24)|0);
 HEAP32[(($15)>>2)]=$path_below;
 var $16=(($info+36)|0);
 HEAP32[(($16)>>2)]=1;
 var $17=(($info+48)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=($18|0)==1;
 var $20=($path_below|0)==1;
 var $or_cond_i=$19&$20;
 if($or_cond_i){label=5;break;}else{label=12;break;}
 case 5: 
 var $22=(($info+54)|0);
 HEAP8[($22)]=1;
 label=12;break;
 case 6: 
 var $24=($12|0)==($dst_ptr|0);
 if($24){label=7;break;}else{label=11;break;}
 case 7: 
 var $26=(($info+24)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=($27|0)==2;
 if($28){label=8;break;}else{var $31=$27;label=9;break;}
 case 8: 
 HEAP32[(($26)>>2)]=$path_below;
 var $31=$path_below;label=9;break;
 case 9: 
 var $31;
 var $32=(($info+48)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=($33|0)==1;
 var $35=($31|0)==1;
 var $or_cond23_i=$34&$35;
 if($or_cond23_i){label=10;break;}else{label=12;break;}
 case 10: 
 var $37=(($info+54)|0);
 HEAP8[($37)]=1;
 label=12;break;
 case 11: 
 var $39=(($info+36)|0);
 var $40=HEAP32[(($39)>>2)];
 var $41=((($40)+(1))|0);
 HEAP32[(($39)>>2)]=$41;
 var $42=(($info+54)|0);
 HEAP8[($42)]=1;
 label=12;break;
 case 12: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($bytes>>>0)<245;
 if($1){label=2;break;}else{label=78;break;}
 case 2: 
 var $3=($bytes>>>0)<11;
 if($3){var $8=16;label=4;break;}else{label=3;break;}
 case 3: 
 var $5=((($bytes)+(11))|0);
 var $6=$5&-8;
 var $8=$6;label=4;break;
 case 4: 
 var $8;
 var $9=$8>>>3;
 var $10=HEAP32[((1808)>>2)];
 var $11=$10>>>($9>>>0);
 var $12=$11&3;
 var $13=($12|0)==0;
 if($13){label=12;break;}else{label=5;break;}
 case 5: 
 var $15=$11&1;
 var $16=$15^1;
 var $17=((($16)+($9))|0);
 var $18=$17<<1;
 var $19=((1848+($18<<2))|0);
 var $20=$19;
 var $_sum111=((($18)+(2))|0);
 var $21=((1848+($_sum111<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+8)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($20|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6: 
 var $27=1<<$17;
 var $28=$27^-1;
 var $29=$10&$28;
 HEAP32[((1808)>>2)]=$29;
 label=11;break;
 case 7: 
 var $31=$24;
 var $32=HEAP32[((1824)>>2)];
 var $33=($31>>>0)<($32>>>0);
 if($33){label=10;break;}else{label=8;break;}
 case 8: 
 var $35=(($24+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==($22|0);
 if($37){label=9;break;}else{label=10;break;}
 case 9: 
 HEAP32[(($35)>>2)]=$20;
 HEAP32[(($21)>>2)]=$24;
 label=11;break;
 case 10: 
 _abort();
 throw "Reached an unreachable!";
 case 11: 
 var $40=$17<<3;
 var $41=$40|3;
 var $42=(($22+4)|0);
 HEAP32[(($42)>>2)]=$41;
 var $43=$22;
 var $_sum113114=$40|4;
 var $44=(($43+$_sum113114)|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46|1;
 HEAP32[(($45)>>2)]=$47;
 var $48=$23;
 var $mem_0=$48;label=341;break;
 case 12: 
 var $50=HEAP32[((1816)>>2)];
 var $51=($8>>>0)>($50>>>0);
 if($51){label=13;break;}else{var $nb_0=$8;label=160;break;}
 case 13: 
 var $53=($11|0)==0;
 if($53){label=27;break;}else{label=14;break;}
 case 14: 
 var $55=$11<<$9;
 var $56=2<<$9;
 var $57=(((-$56))|0);
 var $58=$56|$57;
 var $59=$55&$58;
 var $60=(((-$59))|0);
 var $61=$59&$60;
 var $62=((($61)-(1))|0);
 var $63=$62>>>12;
 var $64=$63&16;
 var $65=$62>>>($64>>>0);
 var $66=$65>>>5;
 var $67=$66&8;
 var $68=$67|$64;
 var $69=$65>>>($67>>>0);
 var $70=$69>>>2;
 var $71=$70&4;
 var $72=$68|$71;
 var $73=$69>>>($71>>>0);
 var $74=$73>>>1;
 var $75=$74&2;
 var $76=$72|$75;
 var $77=$73>>>($75>>>0);
 var $78=$77>>>1;
 var $79=$78&1;
 var $80=$76|$79;
 var $81=$77>>>($79>>>0);
 var $82=((($80)+($81))|0);
 var $83=$82<<1;
 var $84=((1848+($83<<2))|0);
 var $85=$84;
 var $_sum104=((($83)+(2))|0);
 var $86=((1848+($_sum104<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($85|0)==($89|0);
 if($90){label=15;break;}else{label=16;break;}
 case 15: 
 var $92=1<<$82;
 var $93=$92^-1;
 var $94=$10&$93;
 HEAP32[((1808)>>2)]=$94;
 label=20;break;
 case 16: 
 var $96=$89;
 var $97=HEAP32[((1824)>>2)];
 var $98=($96>>>0)<($97>>>0);
 if($98){label=19;break;}else{label=17;break;}
 case 17: 
 var $100=(($89+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==($87|0);
 if($102){label=18;break;}else{label=19;break;}
 case 18: 
 HEAP32[(($100)>>2)]=$85;
 HEAP32[(($86)>>2)]=$89;
 label=20;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 var $105=$82<<3;
 var $106=((($105)-($8))|0);
 var $107=$8|3;
 var $108=(($87+4)|0);
 HEAP32[(($108)>>2)]=$107;
 var $109=$87;
 var $110=(($109+$8)|0);
 var $111=$110;
 var $112=$106|1;
 var $_sum106107=$8|4;
 var $113=(($109+$_sum106107)|0);
 var $114=$113;
 HEAP32[(($114)>>2)]=$112;
 var $115=(($109+$105)|0);
 var $116=$115;
 HEAP32[(($116)>>2)]=$106;
 var $117=HEAP32[((1816)>>2)];
 var $118=($117|0)==0;
 if($118){label=26;break;}else{label=21;break;}
 case 21: 
 var $120=HEAP32[((1828)>>2)];
 var $121=$117>>>3;
 var $122=$121<<1;
 var $123=((1848+($122<<2))|0);
 var $124=$123;
 var $125=HEAP32[((1808)>>2)];
 var $126=1<<$121;
 var $127=$125&$126;
 var $128=($127|0)==0;
 if($128){label=22;break;}else{label=23;break;}
 case 22: 
 var $130=$125|$126;
 HEAP32[((1808)>>2)]=$130;
 var $_sum109_pre=((($122)+(2))|0);
 var $_pre=((1848+($_sum109_pre<<2))|0);
 var $F4_0=$124;var $_pre_phi=$_pre;label=25;break;
 case 23: 
 var $_sum110=((($122)+(2))|0);
 var $132=((1848+($_sum110<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=$133;
 var $135=HEAP32[((1824)>>2)];
 var $136=($134>>>0)<($135>>>0);
 if($136){label=24;break;}else{var $F4_0=$133;var $_pre_phi=$132;label=25;break;}
 case 24: 
 _abort();
 throw "Reached an unreachable!";
 case 25: 
 var $_pre_phi;
 var $F4_0;
 HEAP32[(($_pre_phi)>>2)]=$120;
 var $139=(($F4_0+12)|0);
 HEAP32[(($139)>>2)]=$120;
 var $140=(($120+8)|0);
 HEAP32[(($140)>>2)]=$F4_0;
 var $141=(($120+12)|0);
 HEAP32[(($141)>>2)]=$124;
 label=26;break;
 case 26: 
 HEAP32[((1816)>>2)]=$106;
 HEAP32[((1828)>>2)]=$111;
 var $143=$88;
 var $mem_0=$143;label=341;break;
 case 27: 
 var $145=HEAP32[((1812)>>2)];
 var $146=($145|0)==0;
 if($146){var $nb_0=$8;label=160;break;}else{label=28;break;}
 case 28: 
 var $148=(((-$145))|0);
 var $149=$145&$148;
 var $150=((($149)-(1))|0);
 var $151=$150>>>12;
 var $152=$151&16;
 var $153=$150>>>($152>>>0);
 var $154=$153>>>5;
 var $155=$154&8;
 var $156=$155|$152;
 var $157=$153>>>($155>>>0);
 var $158=$157>>>2;
 var $159=$158&4;
 var $160=$156|$159;
 var $161=$157>>>($159>>>0);
 var $162=$161>>>1;
 var $163=$162&2;
 var $164=$160|$163;
 var $165=$161>>>($163>>>0);
 var $166=$165>>>1;
 var $167=$166&1;
 var $168=$164|$167;
 var $169=$165>>>($167>>>0);
 var $170=((($168)+($169))|0);
 var $171=((2112+($170<<2))|0);
 var $172=HEAP32[(($171)>>2)];
 var $173=(($172+4)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=$174&-8;
 var $176=((($175)-($8))|0);
 var $t_0_i=$172;var $v_0_i=$172;var $rsize_0_i=$176;label=29;break;
 case 29: 
 var $rsize_0_i;
 var $v_0_i;
 var $t_0_i;
 var $178=(($t_0_i+16)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=($179|0)==0;
 if($180){label=30;break;}else{var $185=$179;label=31;break;}
 case 30: 
 var $182=(($t_0_i+20)|0);
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=32;break;}else{var $185=$183;label=31;break;}
 case 31: 
 var $185;
 var $186=(($185+4)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=$187&-8;
 var $189=((($188)-($8))|0);
 var $190=($189>>>0)<($rsize_0_i>>>0);
 var $_rsize_0_i=($190?$189:$rsize_0_i);
 var $_v_0_i=($190?$185:$v_0_i);
 var $t_0_i=$185;var $v_0_i=$_v_0_i;var $rsize_0_i=$_rsize_0_i;label=29;break;
 case 32: 
 var $192=$v_0_i;
 var $193=HEAP32[((1824)>>2)];
 var $194=($192>>>0)<($193>>>0);
 if($194){label=76;break;}else{label=33;break;}
 case 33: 
 var $196=(($192+$8)|0);
 var $197=$196;
 var $198=($192>>>0)<($196>>>0);
 if($198){label=34;break;}else{label=76;break;}
 case 34: 
 var $200=(($v_0_i+24)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($v_0_i+12)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=($203|0)==($v_0_i|0);
 if($204){label=40;break;}else{label=35;break;}
 case 35: 
 var $206=(($v_0_i+8)|0);
 var $207=HEAP32[(($206)>>2)];
 var $208=$207;
 var $209=($208>>>0)<($193>>>0);
 if($209){label=39;break;}else{label=36;break;}
 case 36: 
 var $211=(($207+12)|0);
 var $212=HEAP32[(($211)>>2)];
 var $213=($212|0)==($v_0_i|0);
 if($213){label=37;break;}else{label=39;break;}
 case 37: 
 var $215=(($203+8)|0);
 var $216=HEAP32[(($215)>>2)];
 var $217=($216|0)==($v_0_i|0);
 if($217){label=38;break;}else{label=39;break;}
 case 38: 
 HEAP32[(($211)>>2)]=$203;
 HEAP32[(($215)>>2)]=$207;
 var $R_1_i=$203;label=47;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $220=(($v_0_i+20)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=($221|0)==0;
 if($222){label=41;break;}else{var $R_0_i=$221;var $RP_0_i=$220;label=42;break;}
 case 41: 
 var $224=(($v_0_i+16)|0);
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){var $R_1_i=0;label=47;break;}else{var $R_0_i=$225;var $RP_0_i=$224;label=42;break;}
 case 42: 
 var $RP_0_i;
 var $R_0_i;
 var $227=(($R_0_i+20)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=($228|0)==0;
 if($229){label=43;break;}else{var $R_0_i=$228;var $RP_0_i=$227;label=42;break;}
 case 43: 
 var $231=(($R_0_i+16)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==0;
 if($233){label=44;break;}else{var $R_0_i=$232;var $RP_0_i=$231;label=42;break;}
 case 44: 
 var $235=$RP_0_i;
 var $236=($235>>>0)<($193>>>0);
 if($236){label=46;break;}else{label=45;break;}
 case 45: 
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=47;break;
 case 46: 
 _abort();
 throw "Reached an unreachable!";
 case 47: 
 var $R_1_i;
 var $240=($201|0)==0;
 if($240){label=67;break;}else{label=48;break;}
 case 48: 
 var $242=(($v_0_i+28)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=((2112+($243<<2))|0);
 var $245=HEAP32[(($244)>>2)];
 var $246=($v_0_i|0)==($245|0);
 if($246){label=49;break;}else{label=51;break;}
 case 49: 
 HEAP32[(($244)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=50;break;}else{label=57;break;}
 case 50: 
 var $248=HEAP32[(($242)>>2)];
 var $249=1<<$248;
 var $250=$249^-1;
 var $251=HEAP32[((1812)>>2)];
 var $252=$251&$250;
 HEAP32[((1812)>>2)]=$252;
 label=67;break;
 case 51: 
 var $254=$201;
 var $255=HEAP32[((1824)>>2)];
 var $256=($254>>>0)<($255>>>0);
 if($256){label=55;break;}else{label=52;break;}
 case 52: 
 var $258=(($201+16)|0);
 var $259=HEAP32[(($258)>>2)];
 var $260=($259|0)==($v_0_i|0);
 if($260){label=53;break;}else{label=54;break;}
 case 53: 
 HEAP32[(($258)>>2)]=$R_1_i;
 label=56;break;
 case 54: 
 var $263=(($201+20)|0);
 HEAP32[(($263)>>2)]=$R_1_i;
 label=56;break;
 case 55: 
 _abort();
 throw "Reached an unreachable!";
 case 56: 
 var $266=($R_1_i|0)==0;
 if($266){label=67;break;}else{label=57;break;}
 case 57: 
 var $268=$R_1_i;
 var $269=HEAP32[((1824)>>2)];
 var $270=($268>>>0)<($269>>>0);
 if($270){label=66;break;}else{label=58;break;}
 case 58: 
 var $272=(($R_1_i+24)|0);
 HEAP32[(($272)>>2)]=$201;
 var $273=(($v_0_i+16)|0);
 var $274=HEAP32[(($273)>>2)];
 var $275=($274|0)==0;
 if($275){label=62;break;}else{label=59;break;}
 case 59: 
 var $277=$274;
 var $278=HEAP32[((1824)>>2)];
 var $279=($277>>>0)<($278>>>0);
 if($279){label=61;break;}else{label=60;break;}
 case 60: 
 var $281=(($R_1_i+16)|0);
 HEAP32[(($281)>>2)]=$274;
 var $282=(($274+24)|0);
 HEAP32[(($282)>>2)]=$R_1_i;
 label=62;break;
 case 61: 
 _abort();
 throw "Reached an unreachable!";
 case 62: 
 var $285=(($v_0_i+20)|0);
 var $286=HEAP32[(($285)>>2)];
 var $287=($286|0)==0;
 if($287){label=67;break;}else{label=63;break;}
 case 63: 
 var $289=$286;
 var $290=HEAP32[((1824)>>2)];
 var $291=($289>>>0)<($290>>>0);
 if($291){label=65;break;}else{label=64;break;}
 case 64: 
 var $293=(($R_1_i+20)|0);
 HEAP32[(($293)>>2)]=$286;
 var $294=(($286+24)|0);
 HEAP32[(($294)>>2)]=$R_1_i;
 label=67;break;
 case 65: 
 _abort();
 throw "Reached an unreachable!";
 case 66: 
 _abort();
 throw "Reached an unreachable!";
 case 67: 
 var $298=($rsize_0_i>>>0)<16;
 if($298){label=68;break;}else{label=69;break;}
 case 68: 
 var $300=((($rsize_0_i)+($8))|0);
 var $301=$300|3;
 var $302=(($v_0_i+4)|0);
 HEAP32[(($302)>>2)]=$301;
 var $_sum4_i=((($300)+(4))|0);
 var $303=(($192+$_sum4_i)|0);
 var $304=$303;
 var $305=HEAP32[(($304)>>2)];
 var $306=$305|1;
 HEAP32[(($304)>>2)]=$306;
 label=77;break;
 case 69: 
 var $308=$8|3;
 var $309=(($v_0_i+4)|0);
 HEAP32[(($309)>>2)]=$308;
 var $310=$rsize_0_i|1;
 var $_sum_i137=$8|4;
 var $311=(($192+$_sum_i137)|0);
 var $312=$311;
 HEAP32[(($312)>>2)]=$310;
 var $_sum1_i=((($rsize_0_i)+($8))|0);
 var $313=(($192+$_sum1_i)|0);
 var $314=$313;
 HEAP32[(($314)>>2)]=$rsize_0_i;
 var $315=HEAP32[((1816)>>2)];
 var $316=($315|0)==0;
 if($316){label=75;break;}else{label=70;break;}
 case 70: 
 var $318=HEAP32[((1828)>>2)];
 var $319=$315>>>3;
 var $320=$319<<1;
 var $321=((1848+($320<<2))|0);
 var $322=$321;
 var $323=HEAP32[((1808)>>2)];
 var $324=1<<$319;
 var $325=$323&$324;
 var $326=($325|0)==0;
 if($326){label=71;break;}else{label=72;break;}
 case 71: 
 var $328=$323|$324;
 HEAP32[((1808)>>2)]=$328;
 var $_sum2_pre_i=((($320)+(2))|0);
 var $_pre_i=((1848+($_sum2_pre_i<<2))|0);
 var $F1_0_i=$322;var $_pre_phi_i=$_pre_i;label=74;break;
 case 72: 
 var $_sum3_i=((($320)+(2))|0);
 var $330=((1848+($_sum3_i<<2))|0);
 var $331=HEAP32[(($330)>>2)];
 var $332=$331;
 var $333=HEAP32[((1824)>>2)];
 var $334=($332>>>0)<($333>>>0);
 if($334){label=73;break;}else{var $F1_0_i=$331;var $_pre_phi_i=$330;label=74;break;}
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $_pre_phi_i;
 var $F1_0_i;
 HEAP32[(($_pre_phi_i)>>2)]=$318;
 var $337=(($F1_0_i+12)|0);
 HEAP32[(($337)>>2)]=$318;
 var $338=(($318+8)|0);
 HEAP32[(($338)>>2)]=$F1_0_i;
 var $339=(($318+12)|0);
 HEAP32[(($339)>>2)]=$322;
 label=75;break;
 case 75: 
 HEAP32[((1816)>>2)]=$rsize_0_i;
 HEAP32[((1828)>>2)]=$197;
 label=77;break;
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $342=(($v_0_i+8)|0);
 var $343=$342;
 var $344=($342|0)==0;
 if($344){var $nb_0=$8;label=160;break;}else{var $mem_0=$343;label=341;break;}
 case 78: 
 var $346=($bytes>>>0)>4294967231;
 if($346){var $nb_0=-1;label=160;break;}else{label=79;break;}
 case 79: 
 var $348=((($bytes)+(11))|0);
 var $349=$348&-8;
 var $350=HEAP32[((1812)>>2)];
 var $351=($350|0)==0;
 if($351){var $nb_0=$349;label=160;break;}else{label=80;break;}
 case 80: 
 var $353=(((-$349))|0);
 var $354=$348>>>8;
 var $355=($354|0)==0;
 if($355){var $idx_0_i=0;label=83;break;}else{label=81;break;}
 case 81: 
 var $357=($349>>>0)>16777215;
 if($357){var $idx_0_i=31;label=83;break;}else{label=82;break;}
 case 82: 
 var $359=((($354)+(1048320))|0);
 var $360=$359>>>16;
 var $361=$360&8;
 var $362=$354<<$361;
 var $363=((($362)+(520192))|0);
 var $364=$363>>>16;
 var $365=$364&4;
 var $366=$365|$361;
 var $367=$362<<$365;
 var $368=((($367)+(245760))|0);
 var $369=$368>>>16;
 var $370=$369&2;
 var $371=$366|$370;
 var $372=(((14)-($371))|0);
 var $373=$367<<$370;
 var $374=$373>>>15;
 var $375=((($372)+($374))|0);
 var $376=$375<<1;
 var $377=((($375)+(7))|0);
 var $378=$349>>>($377>>>0);
 var $379=$378&1;
 var $380=$379|$376;
 var $idx_0_i=$380;label=83;break;
 case 83: 
 var $idx_0_i;
 var $382=((2112+($idx_0_i<<2))|0);
 var $383=HEAP32[(($382)>>2)];
 var $384=($383|0)==0;
 if($384){var $v_2_i=0;var $rsize_2_i=$353;var $t_1_i=0;label=90;break;}else{label=84;break;}
 case 84: 
 var $386=($idx_0_i|0)==31;
 if($386){var $391=0;label=86;break;}else{label=85;break;}
 case 85: 
 var $388=$idx_0_i>>>1;
 var $389=(((25)-($388))|0);
 var $391=$389;label=86;break;
 case 86: 
 var $391;
 var $392=$349<<$391;
 var $v_0_i118=0;var $rsize_0_i117=$353;var $t_0_i116=$383;var $sizebits_0_i=$392;var $rst_0_i=0;label=87;break;
 case 87: 
 var $rst_0_i;
 var $sizebits_0_i;
 var $t_0_i116;
 var $rsize_0_i117;
 var $v_0_i118;
 var $394=(($t_0_i116+4)|0);
 var $395=HEAP32[(($394)>>2)];
 var $396=$395&-8;
 var $397=((($396)-($349))|0);
 var $398=($397>>>0)<($rsize_0_i117>>>0);
 if($398){label=88;break;}else{var $v_1_i=$v_0_i118;var $rsize_1_i=$rsize_0_i117;label=89;break;}
 case 88: 
 var $400=($396|0)==($349|0);
 if($400){var $v_2_i=$t_0_i116;var $rsize_2_i=$397;var $t_1_i=$t_0_i116;label=90;break;}else{var $v_1_i=$t_0_i116;var $rsize_1_i=$397;label=89;break;}
 case 89: 
 var $rsize_1_i;
 var $v_1_i;
 var $402=(($t_0_i116+20)|0);
 var $403=HEAP32[(($402)>>2)];
 var $404=$sizebits_0_i>>>31;
 var $405=(($t_0_i116+16+($404<<2))|0);
 var $406=HEAP32[(($405)>>2)];
 var $407=($403|0)==0;
 var $408=($403|0)==($406|0);
 var $or_cond_i=$407|$408;
 var $rst_1_i=($or_cond_i?$rst_0_i:$403);
 var $409=($406|0)==0;
 var $410=$sizebits_0_i<<1;
 if($409){var $v_2_i=$v_1_i;var $rsize_2_i=$rsize_1_i;var $t_1_i=$rst_1_i;label=90;break;}else{var $v_0_i118=$v_1_i;var $rsize_0_i117=$rsize_1_i;var $t_0_i116=$406;var $sizebits_0_i=$410;var $rst_0_i=$rst_1_i;label=87;break;}
 case 90: 
 var $t_1_i;
 var $rsize_2_i;
 var $v_2_i;
 var $411=($t_1_i|0)==0;
 var $412=($v_2_i|0)==0;
 var $or_cond21_i=$411&$412;
 if($or_cond21_i){label=91;break;}else{var $t_2_ph_i=$t_1_i;label=93;break;}
 case 91: 
 var $414=2<<$idx_0_i;
 var $415=(((-$414))|0);
 var $416=$414|$415;
 var $417=$350&$416;
 var $418=($417|0)==0;
 if($418){var $nb_0=$349;label=160;break;}else{label=92;break;}
 case 92: 
 var $420=(((-$417))|0);
 var $421=$417&$420;
 var $422=((($421)-(1))|0);
 var $423=$422>>>12;
 var $424=$423&16;
 var $425=$422>>>($424>>>0);
 var $426=$425>>>5;
 var $427=$426&8;
 var $428=$427|$424;
 var $429=$425>>>($427>>>0);
 var $430=$429>>>2;
 var $431=$430&4;
 var $432=$428|$431;
 var $433=$429>>>($431>>>0);
 var $434=$433>>>1;
 var $435=$434&2;
 var $436=$432|$435;
 var $437=$433>>>($435>>>0);
 var $438=$437>>>1;
 var $439=$438&1;
 var $440=$436|$439;
 var $441=$437>>>($439>>>0);
 var $442=((($440)+($441))|0);
 var $443=((2112+($442<<2))|0);
 var $444=HEAP32[(($443)>>2)];
 var $t_2_ph_i=$444;label=93;break;
 case 93: 
 var $t_2_ph_i;
 var $445=($t_2_ph_i|0)==0;
 if($445){var $rsize_3_lcssa_i=$rsize_2_i;var $v_3_lcssa_i=$v_2_i;label=96;break;}else{var $t_228_i=$t_2_ph_i;var $rsize_329_i=$rsize_2_i;var $v_330_i=$v_2_i;label=94;break;}
 case 94: 
 var $v_330_i;
 var $rsize_329_i;
 var $t_228_i;
 var $446=(($t_228_i+4)|0);
 var $447=HEAP32[(($446)>>2)];
 var $448=$447&-8;
 var $449=((($448)-($349))|0);
 var $450=($449>>>0)<($rsize_329_i>>>0);
 var $_rsize_3_i=($450?$449:$rsize_329_i);
 var $t_2_v_3_i=($450?$t_228_i:$v_330_i);
 var $451=(($t_228_i+16)|0);
 var $452=HEAP32[(($451)>>2)];
 var $453=($452|0)==0;
 if($453){label=95;break;}else{var $t_228_i=$452;var $rsize_329_i=$_rsize_3_i;var $v_330_i=$t_2_v_3_i;label=94;break;}
 case 95: 
 var $454=(($t_228_i+20)|0);
 var $455=HEAP32[(($454)>>2)];
 var $456=($455|0)==0;
 if($456){var $rsize_3_lcssa_i=$_rsize_3_i;var $v_3_lcssa_i=$t_2_v_3_i;label=96;break;}else{var $t_228_i=$455;var $rsize_329_i=$_rsize_3_i;var $v_330_i=$t_2_v_3_i;label=94;break;}
 case 96: 
 var $v_3_lcssa_i;
 var $rsize_3_lcssa_i;
 var $457=($v_3_lcssa_i|0)==0;
 if($457){var $nb_0=$349;label=160;break;}else{label=97;break;}
 case 97: 
 var $459=HEAP32[((1816)>>2)];
 var $460=((($459)-($349))|0);
 var $461=($rsize_3_lcssa_i>>>0)<($460>>>0);
 if($461){label=98;break;}else{var $nb_0=$349;label=160;break;}
 case 98: 
 var $463=$v_3_lcssa_i;
 var $464=HEAP32[((1824)>>2)];
 var $465=($463>>>0)<($464>>>0);
 if($465){label=158;break;}else{label=99;break;}
 case 99: 
 var $467=(($463+$349)|0);
 var $468=$467;
 var $469=($463>>>0)<($467>>>0);
 if($469){label=100;break;}else{label=158;break;}
 case 100: 
 var $471=(($v_3_lcssa_i+24)|0);
 var $472=HEAP32[(($471)>>2)];
 var $473=(($v_3_lcssa_i+12)|0);
 var $474=HEAP32[(($473)>>2)];
 var $475=($474|0)==($v_3_lcssa_i|0);
 if($475){label=106;break;}else{label=101;break;}
 case 101: 
 var $477=(($v_3_lcssa_i+8)|0);
 var $478=HEAP32[(($477)>>2)];
 var $479=$478;
 var $480=($479>>>0)<($464>>>0);
 if($480){label=105;break;}else{label=102;break;}
 case 102: 
 var $482=(($478+12)|0);
 var $483=HEAP32[(($482)>>2)];
 var $484=($483|0)==($v_3_lcssa_i|0);
 if($484){label=103;break;}else{label=105;break;}
 case 103: 
 var $486=(($474+8)|0);
 var $487=HEAP32[(($486)>>2)];
 var $488=($487|0)==($v_3_lcssa_i|0);
 if($488){label=104;break;}else{label=105;break;}
 case 104: 
 HEAP32[(($482)>>2)]=$474;
 HEAP32[(($486)>>2)]=$478;
 var $R_1_i122=$474;label=113;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 var $491=(($v_3_lcssa_i+20)|0);
 var $492=HEAP32[(($491)>>2)];
 var $493=($492|0)==0;
 if($493){label=107;break;}else{var $R_0_i120=$492;var $RP_0_i119=$491;label=108;break;}
 case 107: 
 var $495=(($v_3_lcssa_i+16)|0);
 var $496=HEAP32[(($495)>>2)];
 var $497=($496|0)==0;
 if($497){var $R_1_i122=0;label=113;break;}else{var $R_0_i120=$496;var $RP_0_i119=$495;label=108;break;}
 case 108: 
 var $RP_0_i119;
 var $R_0_i120;
 var $498=(($R_0_i120+20)|0);
 var $499=HEAP32[(($498)>>2)];
 var $500=($499|0)==0;
 if($500){label=109;break;}else{var $R_0_i120=$499;var $RP_0_i119=$498;label=108;break;}
 case 109: 
 var $502=(($R_0_i120+16)|0);
 var $503=HEAP32[(($502)>>2)];
 var $504=($503|0)==0;
 if($504){label=110;break;}else{var $R_0_i120=$503;var $RP_0_i119=$502;label=108;break;}
 case 110: 
 var $506=$RP_0_i119;
 var $507=($506>>>0)<($464>>>0);
 if($507){label=112;break;}else{label=111;break;}
 case 111: 
 HEAP32[(($RP_0_i119)>>2)]=0;
 var $R_1_i122=$R_0_i120;label=113;break;
 case 112: 
 _abort();
 throw "Reached an unreachable!";
 case 113: 
 var $R_1_i122;
 var $511=($472|0)==0;
 if($511){label=133;break;}else{label=114;break;}
 case 114: 
 var $513=(($v_3_lcssa_i+28)|0);
 var $514=HEAP32[(($513)>>2)];
 var $515=((2112+($514<<2))|0);
 var $516=HEAP32[(($515)>>2)];
 var $517=($v_3_lcssa_i|0)==($516|0);
 if($517){label=115;break;}else{label=117;break;}
 case 115: 
 HEAP32[(($515)>>2)]=$R_1_i122;
 var $cond_i123=($R_1_i122|0)==0;
 if($cond_i123){label=116;break;}else{label=123;break;}
 case 116: 
 var $519=HEAP32[(($513)>>2)];
 var $520=1<<$519;
 var $521=$520^-1;
 var $522=HEAP32[((1812)>>2)];
 var $523=$522&$521;
 HEAP32[((1812)>>2)]=$523;
 label=133;break;
 case 117: 
 var $525=$472;
 var $526=HEAP32[((1824)>>2)];
 var $527=($525>>>0)<($526>>>0);
 if($527){label=121;break;}else{label=118;break;}
 case 118: 
 var $529=(($472+16)|0);
 var $530=HEAP32[(($529)>>2)];
 var $531=($530|0)==($v_3_lcssa_i|0);
 if($531){label=119;break;}else{label=120;break;}
 case 119: 
 HEAP32[(($529)>>2)]=$R_1_i122;
 label=122;break;
 case 120: 
 var $534=(($472+20)|0);
 HEAP32[(($534)>>2)]=$R_1_i122;
 label=122;break;
 case 121: 
 _abort();
 throw "Reached an unreachable!";
 case 122: 
 var $537=($R_1_i122|0)==0;
 if($537){label=133;break;}else{label=123;break;}
 case 123: 
 var $539=$R_1_i122;
 var $540=HEAP32[((1824)>>2)];
 var $541=($539>>>0)<($540>>>0);
 if($541){label=132;break;}else{label=124;break;}
 case 124: 
 var $543=(($R_1_i122+24)|0);
 HEAP32[(($543)>>2)]=$472;
 var $544=(($v_3_lcssa_i+16)|0);
 var $545=HEAP32[(($544)>>2)];
 var $546=($545|0)==0;
 if($546){label=128;break;}else{label=125;break;}
 case 125: 
 var $548=$545;
 var $549=HEAP32[((1824)>>2)];
 var $550=($548>>>0)<($549>>>0);
 if($550){label=127;break;}else{label=126;break;}
 case 126: 
 var $552=(($R_1_i122+16)|0);
 HEAP32[(($552)>>2)]=$545;
 var $553=(($545+24)|0);
 HEAP32[(($553)>>2)]=$R_1_i122;
 label=128;break;
 case 127: 
 _abort();
 throw "Reached an unreachable!";
 case 128: 
 var $556=(($v_3_lcssa_i+20)|0);
 var $557=HEAP32[(($556)>>2)];
 var $558=($557|0)==0;
 if($558){label=133;break;}else{label=129;break;}
 case 129: 
 var $560=$557;
 var $561=HEAP32[((1824)>>2)];
 var $562=($560>>>0)<($561>>>0);
 if($562){label=131;break;}else{label=130;break;}
 case 130: 
 var $564=(($R_1_i122+20)|0);
 HEAP32[(($564)>>2)]=$557;
 var $565=(($557+24)|0);
 HEAP32[(($565)>>2)]=$R_1_i122;
 label=133;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $569=($rsize_3_lcssa_i>>>0)<16;
 if($569){label=134;break;}else{label=135;break;}
 case 134: 
 var $571=((($rsize_3_lcssa_i)+($349))|0);
 var $572=$571|3;
 var $573=(($v_3_lcssa_i+4)|0);
 HEAP32[(($573)>>2)]=$572;
 var $_sum19_i=((($571)+(4))|0);
 var $574=(($463+$_sum19_i)|0);
 var $575=$574;
 var $576=HEAP32[(($575)>>2)];
 var $577=$576|1;
 HEAP32[(($575)>>2)]=$577;
 label=159;break;
 case 135: 
 var $579=$349|3;
 var $580=(($v_3_lcssa_i+4)|0);
 HEAP32[(($580)>>2)]=$579;
 var $581=$rsize_3_lcssa_i|1;
 var $_sum_i125136=$349|4;
 var $582=(($463+$_sum_i125136)|0);
 var $583=$582;
 HEAP32[(($583)>>2)]=$581;
 var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
 var $584=(($463+$_sum1_i126)|0);
 var $585=$584;
 HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
 var $586=$rsize_3_lcssa_i>>>3;
 var $587=($rsize_3_lcssa_i>>>0)<256;
 if($587){label=136;break;}else{label=141;break;}
 case 136: 
 var $589=$586<<1;
 var $590=((1848+($589<<2))|0);
 var $591=$590;
 var $592=HEAP32[((1808)>>2)];
 var $593=1<<$586;
 var $594=$592&$593;
 var $595=($594|0)==0;
 if($595){label=137;break;}else{label=138;break;}
 case 137: 
 var $597=$592|$593;
 HEAP32[((1808)>>2)]=$597;
 var $_sum15_pre_i=((($589)+(2))|0);
 var $_pre_i127=((1848+($_sum15_pre_i<<2))|0);
 var $F5_0_i=$591;var $_pre_phi_i128=$_pre_i127;label=140;break;
 case 138: 
 var $_sum18_i=((($589)+(2))|0);
 var $599=((1848+($_sum18_i<<2))|0);
 var $600=HEAP32[(($599)>>2)];
 var $601=$600;
 var $602=HEAP32[((1824)>>2)];
 var $603=($601>>>0)<($602>>>0);
 if($603){label=139;break;}else{var $F5_0_i=$600;var $_pre_phi_i128=$599;label=140;break;}
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 var $_pre_phi_i128;
 var $F5_0_i;
 HEAP32[(($_pre_phi_i128)>>2)]=$468;
 var $606=(($F5_0_i+12)|0);
 HEAP32[(($606)>>2)]=$468;
 var $_sum16_i=((($349)+(8))|0);
 var $607=(($463+$_sum16_i)|0);
 var $608=$607;
 HEAP32[(($608)>>2)]=$F5_0_i;
 var $_sum17_i=((($349)+(12))|0);
 var $609=(($463+$_sum17_i)|0);
 var $610=$609;
 HEAP32[(($610)>>2)]=$591;
 label=159;break;
 case 141: 
 var $612=$467;
 var $613=$rsize_3_lcssa_i>>>8;
 var $614=($613|0)==0;
 if($614){var $I7_0_i=0;label=144;break;}else{label=142;break;}
 case 142: 
 var $616=($rsize_3_lcssa_i>>>0)>16777215;
 if($616){var $I7_0_i=31;label=144;break;}else{label=143;break;}
 case 143: 
 var $618=((($613)+(1048320))|0);
 var $619=$618>>>16;
 var $620=$619&8;
 var $621=$613<<$620;
 var $622=((($621)+(520192))|0);
 var $623=$622>>>16;
 var $624=$623&4;
 var $625=$624|$620;
 var $626=$621<<$624;
 var $627=((($626)+(245760))|0);
 var $628=$627>>>16;
 var $629=$628&2;
 var $630=$625|$629;
 var $631=(((14)-($630))|0);
 var $632=$626<<$629;
 var $633=$632>>>15;
 var $634=((($631)+($633))|0);
 var $635=$634<<1;
 var $636=((($634)+(7))|0);
 var $637=$rsize_3_lcssa_i>>>($636>>>0);
 var $638=$637&1;
 var $639=$638|$635;
 var $I7_0_i=$639;label=144;break;
 case 144: 
 var $I7_0_i;
 var $641=((2112+($I7_0_i<<2))|0);
 var $_sum2_i=((($349)+(28))|0);
 var $642=(($463+$_sum2_i)|0);
 var $643=$642;
 HEAP32[(($643)>>2)]=$I7_0_i;
 var $_sum3_i129=((($349)+(16))|0);
 var $644=(($463+$_sum3_i129)|0);
 var $_sum4_i130=((($349)+(20))|0);
 var $645=(($463+$_sum4_i130)|0);
 var $646=$645;
 HEAP32[(($646)>>2)]=0;
 var $647=$644;
 HEAP32[(($647)>>2)]=0;
 var $648=HEAP32[((1812)>>2)];
 var $649=1<<$I7_0_i;
 var $650=$648&$649;
 var $651=($650|0)==0;
 if($651){label=145;break;}else{label=146;break;}
 case 145: 
 var $653=$648|$649;
 HEAP32[((1812)>>2)]=$653;
 HEAP32[(($641)>>2)]=$612;
 var $654=$641;
 var $_sum5_i=((($349)+(24))|0);
 var $655=(($463+$_sum5_i)|0);
 var $656=$655;
 HEAP32[(($656)>>2)]=$654;
 var $_sum6_i=((($349)+(12))|0);
 var $657=(($463+$_sum6_i)|0);
 var $658=$657;
 HEAP32[(($658)>>2)]=$612;
 var $_sum7_i=((($349)+(8))|0);
 var $659=(($463+$_sum7_i)|0);
 var $660=$659;
 HEAP32[(($660)>>2)]=$612;
 label=159;break;
 case 146: 
 var $662=HEAP32[(($641)>>2)];
 var $663=($I7_0_i|0)==31;
 if($663){var $668=0;label=148;break;}else{label=147;break;}
 case 147: 
 var $665=$I7_0_i>>>1;
 var $666=(((25)-($665))|0);
 var $668=$666;label=148;break;
 case 148: 
 var $668;
 var $669=$rsize_3_lcssa_i<<$668;
 var $K12_0_i=$669;var $T_0_i=$662;label=149;break;
 case 149: 
 var $T_0_i;
 var $K12_0_i;
 var $671=(($T_0_i+4)|0);
 var $672=HEAP32[(($671)>>2)];
 var $673=$672&-8;
 var $674=($673|0)==($rsize_3_lcssa_i|0);
 if($674){label=154;break;}else{label=150;break;}
 case 150: 
 var $676=$K12_0_i>>>31;
 var $677=(($T_0_i+16+($676<<2))|0);
 var $678=HEAP32[(($677)>>2)];
 var $679=($678|0)==0;
 var $680=$K12_0_i<<1;
 if($679){label=151;break;}else{var $K12_0_i=$680;var $T_0_i=$678;label=149;break;}
 case 151: 
 var $682=$677;
 var $683=HEAP32[((1824)>>2)];
 var $684=($682>>>0)<($683>>>0);
 if($684){label=153;break;}else{label=152;break;}
 case 152: 
 HEAP32[(($677)>>2)]=$612;
 var $_sum12_i=((($349)+(24))|0);
 var $686=(($463+$_sum12_i)|0);
 var $687=$686;
 HEAP32[(($687)>>2)]=$T_0_i;
 var $_sum13_i=((($349)+(12))|0);
 var $688=(($463+$_sum13_i)|0);
 var $689=$688;
 HEAP32[(($689)>>2)]=$612;
 var $_sum14_i=((($349)+(8))|0);
 var $690=(($463+$_sum14_i)|0);
 var $691=$690;
 HEAP32[(($691)>>2)]=$612;
 label=159;break;
 case 153: 
 _abort();
 throw "Reached an unreachable!";
 case 154: 
 var $694=(($T_0_i+8)|0);
 var $695=HEAP32[(($694)>>2)];
 var $696=$T_0_i;
 var $697=HEAP32[((1824)>>2)];
 var $698=($696>>>0)<($697>>>0);
 if($698){label=157;break;}else{label=155;break;}
 case 155: 
 var $700=$695;
 var $701=($700>>>0)<($697>>>0);
 if($701){label=157;break;}else{label=156;break;}
 case 156: 
 var $703=(($695+12)|0);
 HEAP32[(($703)>>2)]=$612;
 HEAP32[(($694)>>2)]=$612;
 var $_sum9_i=((($349)+(8))|0);
 var $704=(($463+$_sum9_i)|0);
 var $705=$704;
 HEAP32[(($705)>>2)]=$695;
 var $_sum10_i=((($349)+(12))|0);
 var $706=(($463+$_sum10_i)|0);
 var $707=$706;
 HEAP32[(($707)>>2)]=$T_0_i;
 var $_sum11_i=((($349)+(24))|0);
 var $708=(($463+$_sum11_i)|0);
 var $709=$708;
 HEAP32[(($709)>>2)]=0;
 label=159;break;
 case 157: 
 _abort();
 throw "Reached an unreachable!";
 case 158: 
 _abort();
 throw "Reached an unreachable!";
 case 159: 
 var $711=(($v_3_lcssa_i+8)|0);
 var $712=$711;
 var $713=($711|0)==0;
 if($713){var $nb_0=$349;label=160;break;}else{var $mem_0=$712;label=341;break;}
 case 160: 
 var $nb_0;
 var $714=HEAP32[((1816)>>2)];
 var $715=($nb_0>>>0)>($714>>>0);
 if($715){label=165;break;}else{label=161;break;}
 case 161: 
 var $717=((($714)-($nb_0))|0);
 var $718=HEAP32[((1828)>>2)];
 var $719=($717>>>0)>15;
 if($719){label=162;break;}else{label=163;break;}
 case 162: 
 var $721=$718;
 var $722=(($721+$nb_0)|0);
 var $723=$722;
 HEAP32[((1828)>>2)]=$723;
 HEAP32[((1816)>>2)]=$717;
 var $724=$717|1;
 var $_sum102=((($nb_0)+(4))|0);
 var $725=(($721+$_sum102)|0);
 var $726=$725;
 HEAP32[(($726)>>2)]=$724;
 var $727=(($721+$714)|0);
 var $728=$727;
 HEAP32[(($728)>>2)]=$717;
 var $729=$nb_0|3;
 var $730=(($718+4)|0);
 HEAP32[(($730)>>2)]=$729;
 label=164;break;
 case 163: 
 HEAP32[((1816)>>2)]=0;
 HEAP32[((1828)>>2)]=0;
 var $732=$714|3;
 var $733=(($718+4)|0);
 HEAP32[(($733)>>2)]=$732;
 var $734=$718;
 var $_sum101=((($714)+(4))|0);
 var $735=(($734+$_sum101)|0);
 var $736=$735;
 var $737=HEAP32[(($736)>>2)];
 var $738=$737|1;
 HEAP32[(($736)>>2)]=$738;
 label=164;break;
 case 164: 
 var $740=(($718+8)|0);
 var $741=$740;
 var $mem_0=$741;label=341;break;
 case 165: 
 var $743=HEAP32[((1820)>>2)];
 var $744=($nb_0>>>0)<($743>>>0);
 if($744){label=166;break;}else{label=167;break;}
 case 166: 
 var $746=((($743)-($nb_0))|0);
 HEAP32[((1820)>>2)]=$746;
 var $747=HEAP32[((1832)>>2)];
 var $748=$747;
 var $749=(($748+$nb_0)|0);
 var $750=$749;
 HEAP32[((1832)>>2)]=$750;
 var $751=$746|1;
 var $_sum=((($nb_0)+(4))|0);
 var $752=(($748+$_sum)|0);
 var $753=$752;
 HEAP32[(($753)>>2)]=$751;
 var $754=$nb_0|3;
 var $755=(($747+4)|0);
 HEAP32[(($755)>>2)]=$754;
 var $756=(($747+8)|0);
 var $757=$756;
 var $mem_0=$757;label=341;break;
 case 167: 
 var $759=HEAP32[((1776)>>2)];
 var $760=($759|0)==0;
 if($760){label=168;break;}else{label=171;break;}
 case 168: 
 var $762=_sysconf(30);
 var $763=((($762)-(1))|0);
 var $764=$763&$762;
 var $765=($764|0)==0;
 if($765){label=170;break;}else{label=169;break;}
 case 169: 
 _abort();
 throw "Reached an unreachable!";
 case 170: 
 HEAP32[((1784)>>2)]=$762;
 HEAP32[((1780)>>2)]=$762;
 HEAP32[((1788)>>2)]=-1;
 HEAP32[((1792)>>2)]=-1;
 HEAP32[((1796)>>2)]=0;
 HEAP32[((2252)>>2)]=0;
 var $767=_time(0);
 var $768=$767&-16;
 var $769=$768^1431655768;
 HEAP32[((1776)>>2)]=$769;
 label=171;break;
 case 171: 
 var $771=((($nb_0)+(48))|0);
 var $772=HEAP32[((1784)>>2)];
 var $773=((($nb_0)+(47))|0);
 var $774=((($772)+($773))|0);
 var $775=(((-$772))|0);
 var $776=$774&$775;
 var $777=($776>>>0)>($nb_0>>>0);
 if($777){label=172;break;}else{var $mem_0=0;label=341;break;}
 case 172: 
 var $779=HEAP32[((2248)>>2)];
 var $780=($779|0)==0;
 if($780){label=174;break;}else{label=173;break;}
 case 173: 
 var $782=HEAP32[((2240)>>2)];
 var $783=((($782)+($776))|0);
 var $784=($783>>>0)<=($782>>>0);
 var $785=($783>>>0)>($779>>>0);
 var $or_cond1_i=$784|$785;
 if($or_cond1_i){var $mem_0=0;label=341;break;}else{label=174;break;}
 case 174: 
 var $787=HEAP32[((2252)>>2)];
 var $788=$787&4;
 var $789=($788|0)==0;
 if($789){label=175;break;}else{var $tsize_1_i=0;label=198;break;}
 case 175: 
 var $791=HEAP32[((1832)>>2)];
 var $792=($791|0)==0;
 if($792){label=181;break;}else{label=176;break;}
 case 176: 
 var $794=$791;
 var $sp_0_i_i=2256;label=177;break;
 case 177: 
 var $sp_0_i_i;
 var $796=(($sp_0_i_i)|0);
 var $797=HEAP32[(($796)>>2)];
 var $798=($797>>>0)>($794>>>0);
 if($798){label=179;break;}else{label=178;break;}
 case 178: 
 var $800=(($sp_0_i_i+4)|0);
 var $801=HEAP32[(($800)>>2)];
 var $802=(($797+$801)|0);
 var $803=($802>>>0)>($794>>>0);
 if($803){label=180;break;}else{label=179;break;}
 case 179: 
 var $805=(($sp_0_i_i+8)|0);
 var $806=HEAP32[(($805)>>2)];
 var $807=($806|0)==0;
 if($807){label=181;break;}else{var $sp_0_i_i=$806;label=177;break;}
 case 180: 
 var $808=($sp_0_i_i|0)==0;
 if($808){label=181;break;}else{label=188;break;}
 case 181: 
 var $809=_sbrk(0);
 var $810=($809|0)==-1;
 if($810){var $tsize_0303639_i=0;label=197;break;}else{label=182;break;}
 case 182: 
 var $812=$809;
 var $813=HEAP32[((1780)>>2)];
 var $814=((($813)-(1))|0);
 var $815=$814&$812;
 var $816=($815|0)==0;
 if($816){var $ssize_0_i=$776;label=184;break;}else{label=183;break;}
 case 183: 
 var $818=((($814)+($812))|0);
 var $819=(((-$813))|0);
 var $820=$818&$819;
 var $821=((($776)-($812))|0);
 var $822=((($821)+($820))|0);
 var $ssize_0_i=$822;label=184;break;
 case 184: 
 var $ssize_0_i;
 var $824=HEAP32[((2240)>>2)];
 var $825=((($824)+($ssize_0_i))|0);
 var $826=($ssize_0_i>>>0)>($nb_0>>>0);
 var $827=($ssize_0_i>>>0)<2147483647;
 var $or_cond_i131=$826&$827;
 if($or_cond_i131){label=185;break;}else{var $tsize_0303639_i=0;label=197;break;}
 case 185: 
 var $829=HEAP32[((2248)>>2)];
 var $830=($829|0)==0;
 if($830){label=187;break;}else{label=186;break;}
 case 186: 
 var $832=($825>>>0)<=($824>>>0);
 var $833=($825>>>0)>($829>>>0);
 var $or_cond2_i=$832|$833;
 if($or_cond2_i){var $tsize_0303639_i=0;label=197;break;}else{label=187;break;}
 case 187: 
 var $835=_sbrk($ssize_0_i);
 var $836=($835|0)==($809|0);
 var $ssize_0__i=($836?$ssize_0_i:0);
 var $__i=($836?$809:-1);
 var $tbase_0_i=$__i;var $tsize_0_i=$ssize_0__i;var $br_0_i=$835;var $ssize_1_i=$ssize_0_i;label=190;break;
 case 188: 
 var $838=HEAP32[((1820)>>2)];
 var $839=((($774)-($838))|0);
 var $840=$839&$775;
 var $841=($840>>>0)<2147483647;
 if($841){label=189;break;}else{var $tsize_0303639_i=0;label=197;break;}
 case 189: 
 var $843=_sbrk($840);
 var $844=HEAP32[(($796)>>2)];
 var $845=HEAP32[(($800)>>2)];
 var $846=(($844+$845)|0);
 var $847=($843|0)==($846|0);
 var $_3_i=($847?$840:0);
 var $_4_i=($847?$843:-1);
 var $tbase_0_i=$_4_i;var $tsize_0_i=$_3_i;var $br_0_i=$843;var $ssize_1_i=$840;label=190;break;
 case 190: 
 var $ssize_1_i;
 var $br_0_i;
 var $tsize_0_i;
 var $tbase_0_i;
 var $849=(((-$ssize_1_i))|0);
 var $850=($tbase_0_i|0)==-1;
 if($850){label=191;break;}else{var $tsize_244_i=$tsize_0_i;var $tbase_245_i=$tbase_0_i;label=201;break;}
 case 191: 
 var $852=($br_0_i|0)!=-1;
 var $853=($ssize_1_i>>>0)<2147483647;
 var $or_cond5_i=$852&$853;
 var $854=($ssize_1_i>>>0)<($771>>>0);
 var $or_cond6_i=$or_cond5_i&$854;
 if($or_cond6_i){label=192;break;}else{var $ssize_2_i=$ssize_1_i;label=196;break;}
 case 192: 
 var $856=HEAP32[((1784)>>2)];
 var $857=((($773)-($ssize_1_i))|0);
 var $858=((($857)+($856))|0);
 var $859=(((-$856))|0);
 var $860=$858&$859;
 var $861=($860>>>0)<2147483647;
 if($861){label=193;break;}else{var $ssize_2_i=$ssize_1_i;label=196;break;}
 case 193: 
 var $863=_sbrk($860);
 var $864=($863|0)==-1;
 if($864){label=195;break;}else{label=194;break;}
 case 194: 
 var $866=((($860)+($ssize_1_i))|0);
 var $ssize_2_i=$866;label=196;break;
 case 195: 
 var $868=_sbrk($849);
 var $tsize_0303639_i=$tsize_0_i;label=197;break;
 case 196: 
 var $ssize_2_i;
 var $870=($br_0_i|0)==-1;
 if($870){var $tsize_0303639_i=$tsize_0_i;label=197;break;}else{var $tsize_244_i=$ssize_2_i;var $tbase_245_i=$br_0_i;label=201;break;}
 case 197: 
 var $tsize_0303639_i;
 var $871=HEAP32[((2252)>>2)];
 var $872=$871|4;
 HEAP32[((2252)>>2)]=$872;
 var $tsize_1_i=$tsize_0303639_i;label=198;break;
 case 198: 
 var $tsize_1_i;
 var $874=($776>>>0)<2147483647;
 if($874){label=199;break;}else{label=340;break;}
 case 199: 
 var $876=_sbrk($776);
 var $877=_sbrk(0);
 var $notlhs_i=($876|0)!=-1;
 var $notrhs_i=($877|0)!=-1;
 var $or_cond8_not_i=$notrhs_i&$notlhs_i;
 var $878=($876>>>0)<($877>>>0);
 var $or_cond9_i=$or_cond8_not_i&$878;
 if($or_cond9_i){label=200;break;}else{label=340;break;}
 case 200: 
 var $879=$877;
 var $880=$876;
 var $881=((($879)-($880))|0);
 var $882=((($nb_0)+(40))|0);
 var $883=($881>>>0)>($882>>>0);
 var $_tsize_1_i=($883?$881:$tsize_1_i);
 var $_tbase_1_i=($883?$876:-1);
 var $884=($_tbase_1_i|0)==-1;
 if($884){label=340;break;}else{var $tsize_244_i=$_tsize_1_i;var $tbase_245_i=$_tbase_1_i;label=201;break;}
 case 201: 
 var $tbase_245_i;
 var $tsize_244_i;
 var $885=HEAP32[((2240)>>2)];
 var $886=((($885)+($tsize_244_i))|0);
 HEAP32[((2240)>>2)]=$886;
 var $887=HEAP32[((2244)>>2)];
 var $888=($886>>>0)>($887>>>0);
 if($888){label=202;break;}else{label=203;break;}
 case 202: 
 HEAP32[((2244)>>2)]=$886;
 label=203;break;
 case 203: 
 var $890=HEAP32[((1832)>>2)];
 var $891=($890|0)==0;
 if($891){label=204;break;}else{var $sp_067_i=2256;label=211;break;}
 case 204: 
 var $893=HEAP32[((1824)>>2)];
 var $894=($893|0)==0;
 var $895=($tbase_245_i>>>0)<($893>>>0);
 var $or_cond10_i=$894|$895;
 if($or_cond10_i){label=205;break;}else{label=206;break;}
 case 205: 
 HEAP32[((1824)>>2)]=$tbase_245_i;
 label=206;break;
 case 206: 
 HEAP32[((2256)>>2)]=$tbase_245_i;
 HEAP32[((2260)>>2)]=$tsize_244_i;
 HEAP32[((2268)>>2)]=0;
 var $897=HEAP32[((1776)>>2)];
 HEAP32[((1844)>>2)]=$897;
 HEAP32[((1840)>>2)]=-1;
 var $i_02_i_i=0;label=207;break;
 case 207: 
 var $i_02_i_i;
 var $899=$i_02_i_i<<1;
 var $900=((1848+($899<<2))|0);
 var $901=$900;
 var $_sum_i_i=((($899)+(3))|0);
 var $902=((1848+($_sum_i_i<<2))|0);
 HEAP32[(($902)>>2)]=$901;
 var $_sum1_i_i=((($899)+(2))|0);
 var $903=((1848+($_sum1_i_i<<2))|0);
 HEAP32[(($903)>>2)]=$901;
 var $904=((($i_02_i_i)+(1))|0);
 var $905=($904>>>0)<32;
 if($905){var $i_02_i_i=$904;label=207;break;}else{label=208;break;}
 case 208: 
 var $906=((($tsize_244_i)-(40))|0);
 var $907=(($tbase_245_i+8)|0);
 var $908=$907;
 var $909=$908&7;
 var $910=($909|0)==0;
 if($910){var $914=0;label=210;break;}else{label=209;break;}
 case 209: 
 var $912=(((-$908))|0);
 var $913=$912&7;
 var $914=$913;label=210;break;
 case 210: 
 var $914;
 var $915=(($tbase_245_i+$914)|0);
 var $916=$915;
 var $917=((($906)-($914))|0);
 HEAP32[((1832)>>2)]=$916;
 HEAP32[((1820)>>2)]=$917;
 var $918=$917|1;
 var $_sum_i14_i=((($914)+(4))|0);
 var $919=(($tbase_245_i+$_sum_i14_i)|0);
 var $920=$919;
 HEAP32[(($920)>>2)]=$918;
 var $_sum2_i_i=((($tsize_244_i)-(36))|0);
 var $921=(($tbase_245_i+$_sum2_i_i)|0);
 var $922=$921;
 HEAP32[(($922)>>2)]=40;
 var $923=HEAP32[((1792)>>2)];
 HEAP32[((1836)>>2)]=$923;
 label=338;break;
 case 211: 
 var $sp_067_i;
 var $924=(($sp_067_i)|0);
 var $925=HEAP32[(($924)>>2)];
 var $926=(($sp_067_i+4)|0);
 var $927=HEAP32[(($926)>>2)];
 var $928=(($925+$927)|0);
 var $929=($tbase_245_i|0)==($928|0);
 if($929){label=213;break;}else{label=212;break;}
 case 212: 
 var $931=(($sp_067_i+8)|0);
 var $932=HEAP32[(($931)>>2)];
 var $933=($932|0)==0;
 if($933){label=218;break;}else{var $sp_067_i=$932;label=211;break;}
 case 213: 
 var $934=(($sp_067_i+12)|0);
 var $935=HEAP32[(($934)>>2)];
 var $936=$935&8;
 var $937=($936|0)==0;
 if($937){label=214;break;}else{label=218;break;}
 case 214: 
 var $939=$890;
 var $940=($939>>>0)>=($925>>>0);
 var $941=($939>>>0)<($tbase_245_i>>>0);
 var $or_cond47_i=$940&$941;
 if($or_cond47_i){label=215;break;}else{label=218;break;}
 case 215: 
 var $943=((($927)+($tsize_244_i))|0);
 HEAP32[(($926)>>2)]=$943;
 var $944=HEAP32[((1832)>>2)];
 var $945=HEAP32[((1820)>>2)];
 var $946=((($945)+($tsize_244_i))|0);
 var $947=$944;
 var $948=(($944+8)|0);
 var $949=$948;
 var $950=$949&7;
 var $951=($950|0)==0;
 if($951){var $955=0;label=217;break;}else{label=216;break;}
 case 216: 
 var $953=(((-$949))|0);
 var $954=$953&7;
 var $955=$954;label=217;break;
 case 217: 
 var $955;
 var $956=(($947+$955)|0);
 var $957=$956;
 var $958=((($946)-($955))|0);
 HEAP32[((1832)>>2)]=$957;
 HEAP32[((1820)>>2)]=$958;
 var $959=$958|1;
 var $_sum_i18_i=((($955)+(4))|0);
 var $960=(($947+$_sum_i18_i)|0);
 var $961=$960;
 HEAP32[(($961)>>2)]=$959;
 var $_sum2_i19_i=((($946)+(4))|0);
 var $962=(($947+$_sum2_i19_i)|0);
 var $963=$962;
 HEAP32[(($963)>>2)]=40;
 var $964=HEAP32[((1792)>>2)];
 HEAP32[((1836)>>2)]=$964;
 label=338;break;
 case 218: 
 var $965=HEAP32[((1824)>>2)];
 var $966=($tbase_245_i>>>0)<($965>>>0);
 if($966){label=219;break;}else{label=220;break;}
 case 219: 
 HEAP32[((1824)>>2)]=$tbase_245_i;
 label=220;break;
 case 220: 
 var $968=(($tbase_245_i+$tsize_244_i)|0);
 var $sp_160_i=2256;label=221;break;
 case 221: 
 var $sp_160_i;
 var $970=(($sp_160_i)|0);
 var $971=HEAP32[(($970)>>2)];
 var $972=($971|0)==($968|0);
 if($972){label=223;break;}else{label=222;break;}
 case 222: 
 var $974=(($sp_160_i+8)|0);
 var $975=HEAP32[(($974)>>2)];
 var $976=($975|0)==0;
 if($976){label=304;break;}else{var $sp_160_i=$975;label=221;break;}
 case 223: 
 var $977=(($sp_160_i+12)|0);
 var $978=HEAP32[(($977)>>2)];
 var $979=$978&8;
 var $980=($979|0)==0;
 if($980){label=224;break;}else{label=304;break;}
 case 224: 
 HEAP32[(($970)>>2)]=$tbase_245_i;
 var $982=(($sp_160_i+4)|0);
 var $983=HEAP32[(($982)>>2)];
 var $984=((($983)+($tsize_244_i))|0);
 HEAP32[(($982)>>2)]=$984;
 var $985=(($tbase_245_i+8)|0);
 var $986=$985;
 var $987=$986&7;
 var $988=($987|0)==0;
 if($988){var $993=0;label=226;break;}else{label=225;break;}
 case 225: 
 var $990=(((-$986))|0);
 var $991=$990&7;
 var $993=$991;label=226;break;
 case 226: 
 var $993;
 var $994=(($tbase_245_i+$993)|0);
 var $_sum93_i=((($tsize_244_i)+(8))|0);
 var $995=(($tbase_245_i+$_sum93_i)|0);
 var $996=$995;
 var $997=$996&7;
 var $998=($997|0)==0;
 if($998){var $1003=0;label=228;break;}else{label=227;break;}
 case 227: 
 var $1000=(((-$996))|0);
 var $1001=$1000&7;
 var $1003=$1001;label=228;break;
 case 228: 
 var $1003;
 var $_sum94_i=((($1003)+($tsize_244_i))|0);
 var $1004=(($tbase_245_i+$_sum94_i)|0);
 var $1005=$1004;
 var $1006=$1004;
 var $1007=$994;
 var $1008=((($1006)-($1007))|0);
 var $_sum_i21_i=((($993)+($nb_0))|0);
 var $1009=(($tbase_245_i+$_sum_i21_i)|0);
 var $1010=$1009;
 var $1011=((($1008)-($nb_0))|0);
 var $1012=$nb_0|3;
 var $_sum1_i22_i=((($993)+(4))|0);
 var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
 var $1014=$1013;
 HEAP32[(($1014)>>2)]=$1012;
 var $1015=HEAP32[((1832)>>2)];
 var $1016=($1005|0)==($1015|0);
 if($1016){label=229;break;}else{label=230;break;}
 case 229: 
 var $1018=HEAP32[((1820)>>2)];
 var $1019=((($1018)+($1011))|0);
 HEAP32[((1820)>>2)]=$1019;
 HEAP32[((1832)>>2)]=$1010;
 var $1020=$1019|1;
 var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
 var $1021=(($tbase_245_i+$_sum46_i_i)|0);
 var $1022=$1021;
 HEAP32[(($1022)>>2)]=$1020;
 label=303;break;
 case 230: 
 var $1024=HEAP32[((1828)>>2)];
 var $1025=($1005|0)==($1024|0);
 if($1025){label=231;break;}else{label=232;break;}
 case 231: 
 var $1027=HEAP32[((1816)>>2)];
 var $1028=((($1027)+($1011))|0);
 HEAP32[((1816)>>2)]=$1028;
 HEAP32[((1828)>>2)]=$1010;
 var $1029=$1028|1;
 var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
 var $1030=(($tbase_245_i+$_sum44_i_i)|0);
 var $1031=$1030;
 HEAP32[(($1031)>>2)]=$1029;
 var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
 var $1032=(($tbase_245_i+$_sum45_i_i)|0);
 var $1033=$1032;
 HEAP32[(($1033)>>2)]=$1028;
 label=303;break;
 case 232: 
 var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
 var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
 var $1035=(($tbase_245_i+$_sum95_i)|0);
 var $1036=$1035;
 var $1037=HEAP32[(($1036)>>2)];
 var $1038=$1037&3;
 var $1039=($1038|0)==1;
 if($1039){label=233;break;}else{var $oldfirst_0_i_i=$1005;var $qsize_0_i_i=$1011;label=280;break;}
 case 233: 
 var $1041=$1037&-8;
 var $1042=$1037>>>3;
 var $1043=($1037>>>0)<256;
 if($1043){label=234;break;}else{label=246;break;}
 case 234: 
 var $_sum3940_i_i=$1003|8;
 var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
 var $1045=(($tbase_245_i+$_sum105_i)|0);
 var $1046=$1045;
 var $1047=HEAP32[(($1046)>>2)];
 var $_sum41_i_i=((($tsize_244_i)+(12))|0);
 var $_sum106_i=((($_sum41_i_i)+($1003))|0);
 var $1048=(($tbase_245_i+$_sum106_i)|0);
 var $1049=$1048;
 var $1050=HEAP32[(($1049)>>2)];
 var $1051=$1042<<1;
 var $1052=((1848+($1051<<2))|0);
 var $1053=$1052;
 var $1054=($1047|0)==($1053|0);
 if($1054){label=237;break;}else{label=235;break;}
 case 235: 
 var $1056=$1047;
 var $1057=HEAP32[((1824)>>2)];
 var $1058=($1056>>>0)<($1057>>>0);
 if($1058){label=245;break;}else{label=236;break;}
 case 236: 
 var $1060=(($1047+12)|0);
 var $1061=HEAP32[(($1060)>>2)];
 var $1062=($1061|0)==($1005|0);
 if($1062){label=237;break;}else{label=245;break;}
 case 237: 
 var $1063=($1050|0)==($1047|0);
 if($1063){label=238;break;}else{label=239;break;}
 case 238: 
 var $1065=1<<$1042;
 var $1066=$1065^-1;
 var $1067=HEAP32[((1808)>>2)];
 var $1068=$1067&$1066;
 HEAP32[((1808)>>2)]=$1068;
 label=279;break;
 case 239: 
 var $1070=($1050|0)==($1053|0);
 if($1070){label=240;break;}else{label=241;break;}
 case 240: 
 var $_pre56_i_i=(($1050+8)|0);
 var $_pre_phi57_i_i=$_pre56_i_i;label=243;break;
 case 241: 
 var $1072=$1050;
 var $1073=HEAP32[((1824)>>2)];
 var $1074=($1072>>>0)<($1073>>>0);
 if($1074){label=244;break;}else{label=242;break;}
 case 242: 
 var $1076=(($1050+8)|0);
 var $1077=HEAP32[(($1076)>>2)];
 var $1078=($1077|0)==($1005|0);
 if($1078){var $_pre_phi57_i_i=$1076;label=243;break;}else{label=244;break;}
 case 243: 
 var $_pre_phi57_i_i;
 var $1079=(($1047+12)|0);
 HEAP32[(($1079)>>2)]=$1050;
 HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
 label=279;break;
 case 244: 
 _abort();
 throw "Reached an unreachable!";
 case 245: 
 _abort();
 throw "Reached an unreachable!";
 case 246: 
 var $1081=$1004;
 var $_sum34_i_i=$1003|24;
 var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
 var $1082=(($tbase_245_i+$_sum96_i)|0);
 var $1083=$1082;
 var $1084=HEAP32[(($1083)>>2)];
 var $_sum5_i_i=((($tsize_244_i)+(12))|0);
 var $_sum97_i=((($_sum5_i_i)+($1003))|0);
 var $1085=(($tbase_245_i+$_sum97_i)|0);
 var $1086=$1085;
 var $1087=HEAP32[(($1086)>>2)];
 var $1088=($1087|0)==($1081|0);
 if($1088){label=252;break;}else{label=247;break;}
 case 247: 
 var $_sum3637_i_i=$1003|8;
 var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
 var $1090=(($tbase_245_i+$_sum98_i)|0);
 var $1091=$1090;
 var $1092=HEAP32[(($1091)>>2)];
 var $1093=$1092;
 var $1094=HEAP32[((1824)>>2)];
 var $1095=($1093>>>0)<($1094>>>0);
 if($1095){label=251;break;}else{label=248;break;}
 case 248: 
 var $1097=(($1092+12)|0);
 var $1098=HEAP32[(($1097)>>2)];
 var $1099=($1098|0)==($1081|0);
 if($1099){label=249;break;}else{label=251;break;}
 case 249: 
 var $1101=(($1087+8)|0);
 var $1102=HEAP32[(($1101)>>2)];
 var $1103=($1102|0)==($1081|0);
 if($1103){label=250;break;}else{label=251;break;}
 case 250: 
 HEAP32[(($1097)>>2)]=$1087;
 HEAP32[(($1101)>>2)]=$1092;
 var $R_1_i_i=$1087;label=259;break;
 case 251: 
 _abort();
 throw "Reached an unreachable!";
 case 252: 
 var $_sum67_i_i=$1003|16;
 var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
 var $1106=(($tbase_245_i+$_sum103_i)|0);
 var $1107=$1106;
 var $1108=HEAP32[(($1107)>>2)];
 var $1109=($1108|0)==0;
 if($1109){label=253;break;}else{var $R_0_i_i=$1108;var $RP_0_i_i=$1107;label=254;break;}
 case 253: 
 var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
 var $1111=(($tbase_245_i+$_sum104_i)|0);
 var $1112=$1111;
 var $1113=HEAP32[(($1112)>>2)];
 var $1114=($1113|0)==0;
 if($1114){var $R_1_i_i=0;label=259;break;}else{var $R_0_i_i=$1113;var $RP_0_i_i=$1112;label=254;break;}
 case 254: 
 var $RP_0_i_i;
 var $R_0_i_i;
 var $1115=(($R_0_i_i+20)|0);
 var $1116=HEAP32[(($1115)>>2)];
 var $1117=($1116|0)==0;
 if($1117){label=255;break;}else{var $R_0_i_i=$1116;var $RP_0_i_i=$1115;label=254;break;}
 case 255: 
 var $1119=(($R_0_i_i+16)|0);
 var $1120=HEAP32[(($1119)>>2)];
 var $1121=($1120|0)==0;
 if($1121){label=256;break;}else{var $R_0_i_i=$1120;var $RP_0_i_i=$1119;label=254;break;}
 case 256: 
 var $1123=$RP_0_i_i;
 var $1124=HEAP32[((1824)>>2)];
 var $1125=($1123>>>0)<($1124>>>0);
 if($1125){label=258;break;}else{label=257;break;}
 case 257: 
 HEAP32[(($RP_0_i_i)>>2)]=0;
 var $R_1_i_i=$R_0_i_i;label=259;break;
 case 258: 
 _abort();
 throw "Reached an unreachable!";
 case 259: 
 var $R_1_i_i;
 var $1129=($1084|0)==0;
 if($1129){label=279;break;}else{label=260;break;}
 case 260: 
 var $_sum31_i_i=((($tsize_244_i)+(28))|0);
 var $_sum99_i=((($_sum31_i_i)+($1003))|0);
 var $1131=(($tbase_245_i+$_sum99_i)|0);
 var $1132=$1131;
 var $1133=HEAP32[(($1132)>>2)];
 var $1134=((2112+($1133<<2))|0);
 var $1135=HEAP32[(($1134)>>2)];
 var $1136=($1081|0)==($1135|0);
 if($1136){label=261;break;}else{label=263;break;}
 case 261: 
 HEAP32[(($1134)>>2)]=$R_1_i_i;
 var $cond_i_i=($R_1_i_i|0)==0;
 if($cond_i_i){label=262;break;}else{label=269;break;}
 case 262: 
 var $1138=HEAP32[(($1132)>>2)];
 var $1139=1<<$1138;
 var $1140=$1139^-1;
 var $1141=HEAP32[((1812)>>2)];
 var $1142=$1141&$1140;
 HEAP32[((1812)>>2)]=$1142;
 label=279;break;
 case 263: 
 var $1144=$1084;
 var $1145=HEAP32[((1824)>>2)];
 var $1146=($1144>>>0)<($1145>>>0);
 if($1146){label=267;break;}else{label=264;break;}
 case 264: 
 var $1148=(($1084+16)|0);
 var $1149=HEAP32[(($1148)>>2)];
 var $1150=($1149|0)==($1081|0);
 if($1150){label=265;break;}else{label=266;break;}
 case 265: 
 HEAP32[(($1148)>>2)]=$R_1_i_i;
 label=268;break;
 case 266: 
 var $1153=(($1084+20)|0);
 HEAP32[(($1153)>>2)]=$R_1_i_i;
 label=268;break;
 case 267: 
 _abort();
 throw "Reached an unreachable!";
 case 268: 
 var $1156=($R_1_i_i|0)==0;
 if($1156){label=279;break;}else{label=269;break;}
 case 269: 
 var $1158=$R_1_i_i;
 var $1159=HEAP32[((1824)>>2)];
 var $1160=($1158>>>0)<($1159>>>0);
 if($1160){label=278;break;}else{label=270;break;}
 case 270: 
 var $1162=(($R_1_i_i+24)|0);
 HEAP32[(($1162)>>2)]=$1084;
 var $_sum3233_i_i=$1003|16;
 var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
 var $1163=(($tbase_245_i+$_sum100_i)|0);
 var $1164=$1163;
 var $1165=HEAP32[(($1164)>>2)];
 var $1166=($1165|0)==0;
 if($1166){label=274;break;}else{label=271;break;}
 case 271: 
 var $1168=$1165;
 var $1169=HEAP32[((1824)>>2)];
 var $1170=($1168>>>0)<($1169>>>0);
 if($1170){label=273;break;}else{label=272;break;}
 case 272: 
 var $1172=(($R_1_i_i+16)|0);
 HEAP32[(($1172)>>2)]=$1165;
 var $1173=(($1165+24)|0);
 HEAP32[(($1173)>>2)]=$R_1_i_i;
 label=274;break;
 case 273: 
 _abort();
 throw "Reached an unreachable!";
 case 274: 
 var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
 var $1176=(($tbase_245_i+$_sum101_i)|0);
 var $1177=$1176;
 var $1178=HEAP32[(($1177)>>2)];
 var $1179=($1178|0)==0;
 if($1179){label=279;break;}else{label=275;break;}
 case 275: 
 var $1181=$1178;
 var $1182=HEAP32[((1824)>>2)];
 var $1183=($1181>>>0)<($1182>>>0);
 if($1183){label=277;break;}else{label=276;break;}
 case 276: 
 var $1185=(($R_1_i_i+20)|0);
 HEAP32[(($1185)>>2)]=$1178;
 var $1186=(($1178+24)|0);
 HEAP32[(($1186)>>2)]=$R_1_i_i;
 label=279;break;
 case 277: 
 _abort();
 throw "Reached an unreachable!";
 case 278: 
 _abort();
 throw "Reached an unreachable!";
 case 279: 
 var $_sum9_i_i=$1041|$1003;
 var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
 var $1190=(($tbase_245_i+$_sum102_i)|0);
 var $1191=$1190;
 var $1192=((($1041)+($1011))|0);
 var $oldfirst_0_i_i=$1191;var $qsize_0_i_i=$1192;label=280;break;
 case 280: 
 var $qsize_0_i_i;
 var $oldfirst_0_i_i;
 var $1194=(($oldfirst_0_i_i+4)|0);
 var $1195=HEAP32[(($1194)>>2)];
 var $1196=$1195&-2;
 HEAP32[(($1194)>>2)]=$1196;
 var $1197=$qsize_0_i_i|1;
 var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
 var $1198=(($tbase_245_i+$_sum10_i_i)|0);
 var $1199=$1198;
 HEAP32[(($1199)>>2)]=$1197;
 var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
 var $1200=(($tbase_245_i+$_sum11_i_i)|0);
 var $1201=$1200;
 HEAP32[(($1201)>>2)]=$qsize_0_i_i;
 var $1202=$qsize_0_i_i>>>3;
 var $1203=($qsize_0_i_i>>>0)<256;
 if($1203){label=281;break;}else{label=286;break;}
 case 281: 
 var $1205=$1202<<1;
 var $1206=((1848+($1205<<2))|0);
 var $1207=$1206;
 var $1208=HEAP32[((1808)>>2)];
 var $1209=1<<$1202;
 var $1210=$1208&$1209;
 var $1211=($1210|0)==0;
 if($1211){label=282;break;}else{label=283;break;}
 case 282: 
 var $1213=$1208|$1209;
 HEAP32[((1808)>>2)]=$1213;
 var $_sum27_pre_i_i=((($1205)+(2))|0);
 var $_pre_i24_i=((1848+($_sum27_pre_i_i<<2))|0);
 var $F4_0_i_i=$1207;var $_pre_phi_i25_i=$_pre_i24_i;label=285;break;
 case 283: 
 var $_sum30_i_i=((($1205)+(2))|0);
 var $1215=((1848+($_sum30_i_i<<2))|0);
 var $1216=HEAP32[(($1215)>>2)];
 var $1217=$1216;
 var $1218=HEAP32[((1824)>>2)];
 var $1219=($1217>>>0)<($1218>>>0);
 if($1219){label=284;break;}else{var $F4_0_i_i=$1216;var $_pre_phi_i25_i=$1215;label=285;break;}
 case 284: 
 _abort();
 throw "Reached an unreachable!";
 case 285: 
 var $_pre_phi_i25_i;
 var $F4_0_i_i;
 HEAP32[(($_pre_phi_i25_i)>>2)]=$1010;
 var $1222=(($F4_0_i_i+12)|0);
 HEAP32[(($1222)>>2)]=$1010;
 var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
 var $1223=(($tbase_245_i+$_sum28_i_i)|0);
 var $1224=$1223;
 HEAP32[(($1224)>>2)]=$F4_0_i_i;
 var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
 var $1225=(($tbase_245_i+$_sum29_i_i)|0);
 var $1226=$1225;
 HEAP32[(($1226)>>2)]=$1207;
 label=303;break;
 case 286: 
 var $1228=$1009;
 var $1229=$qsize_0_i_i>>>8;
 var $1230=($1229|0)==0;
 if($1230){var $I7_0_i_i=0;label=289;break;}else{label=287;break;}
 case 287: 
 var $1232=($qsize_0_i_i>>>0)>16777215;
 if($1232){var $I7_0_i_i=31;label=289;break;}else{label=288;break;}
 case 288: 
 var $1234=((($1229)+(1048320))|0);
 var $1235=$1234>>>16;
 var $1236=$1235&8;
 var $1237=$1229<<$1236;
 var $1238=((($1237)+(520192))|0);
 var $1239=$1238>>>16;
 var $1240=$1239&4;
 var $1241=$1240|$1236;
 var $1242=$1237<<$1240;
 var $1243=((($1242)+(245760))|0);
 var $1244=$1243>>>16;
 var $1245=$1244&2;
 var $1246=$1241|$1245;
 var $1247=(((14)-($1246))|0);
 var $1248=$1242<<$1245;
 var $1249=$1248>>>15;
 var $1250=((($1247)+($1249))|0);
 var $1251=$1250<<1;
 var $1252=((($1250)+(7))|0);
 var $1253=$qsize_0_i_i>>>($1252>>>0);
 var $1254=$1253&1;
 var $1255=$1254|$1251;
 var $I7_0_i_i=$1255;label=289;break;
 case 289: 
 var $I7_0_i_i;
 var $1257=((2112+($I7_0_i_i<<2))|0);
 var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
 var $1258=(($tbase_245_i+$_sum12_i26_i)|0);
 var $1259=$1258;
 HEAP32[(($1259)>>2)]=$I7_0_i_i;
 var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
 var $1260=(($tbase_245_i+$_sum13_i_i)|0);
 var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
 var $1261=(($tbase_245_i+$_sum14_i_i)|0);
 var $1262=$1261;
 HEAP32[(($1262)>>2)]=0;
 var $1263=$1260;
 HEAP32[(($1263)>>2)]=0;
 var $1264=HEAP32[((1812)>>2)];
 var $1265=1<<$I7_0_i_i;
 var $1266=$1264&$1265;
 var $1267=($1266|0)==0;
 if($1267){label=290;break;}else{label=291;break;}
 case 290: 
 var $1269=$1264|$1265;
 HEAP32[((1812)>>2)]=$1269;
 HEAP32[(($1257)>>2)]=$1228;
 var $1270=$1257;
 var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
 var $1271=(($tbase_245_i+$_sum15_i_i)|0);
 var $1272=$1271;
 HEAP32[(($1272)>>2)]=$1270;
 var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
 var $1273=(($tbase_245_i+$_sum16_i_i)|0);
 var $1274=$1273;
 HEAP32[(($1274)>>2)]=$1228;
 var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
 var $1275=(($tbase_245_i+$_sum17_i_i)|0);
 var $1276=$1275;
 HEAP32[(($1276)>>2)]=$1228;
 label=303;break;
 case 291: 
 var $1278=HEAP32[(($1257)>>2)];
 var $1279=($I7_0_i_i|0)==31;
 if($1279){var $1284=0;label=293;break;}else{label=292;break;}
 case 292: 
 var $1281=$I7_0_i_i>>>1;
 var $1282=(((25)-($1281))|0);
 var $1284=$1282;label=293;break;
 case 293: 
 var $1284;
 var $1285=$qsize_0_i_i<<$1284;
 var $K8_0_i_i=$1285;var $T_0_i27_i=$1278;label=294;break;
 case 294: 
 var $T_0_i27_i;
 var $K8_0_i_i;
 var $1287=(($T_0_i27_i+4)|0);
 var $1288=HEAP32[(($1287)>>2)];
 var $1289=$1288&-8;
 var $1290=($1289|0)==($qsize_0_i_i|0);
 if($1290){label=299;break;}else{label=295;break;}
 case 295: 
 var $1292=$K8_0_i_i>>>31;
 var $1293=(($T_0_i27_i+16+($1292<<2))|0);
 var $1294=HEAP32[(($1293)>>2)];
 var $1295=($1294|0)==0;
 var $1296=$K8_0_i_i<<1;
 if($1295){label=296;break;}else{var $K8_0_i_i=$1296;var $T_0_i27_i=$1294;label=294;break;}
 case 296: 
 var $1298=$1293;
 var $1299=HEAP32[((1824)>>2)];
 var $1300=($1298>>>0)<($1299>>>0);
 if($1300){label=298;break;}else{label=297;break;}
 case 297: 
 HEAP32[(($1293)>>2)]=$1228;
 var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
 var $1302=(($tbase_245_i+$_sum24_i_i)|0);
 var $1303=$1302;
 HEAP32[(($1303)>>2)]=$T_0_i27_i;
 var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
 var $1304=(($tbase_245_i+$_sum25_i_i)|0);
 var $1305=$1304;
 HEAP32[(($1305)>>2)]=$1228;
 var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
 var $1306=(($tbase_245_i+$_sum26_i_i)|0);
 var $1307=$1306;
 HEAP32[(($1307)>>2)]=$1228;
 label=303;break;
 case 298: 
 _abort();
 throw "Reached an unreachable!";
 case 299: 
 var $1310=(($T_0_i27_i+8)|0);
 var $1311=HEAP32[(($1310)>>2)];
 var $1312=$T_0_i27_i;
 var $1313=HEAP32[((1824)>>2)];
 var $1314=($1312>>>0)<($1313>>>0);
 if($1314){label=302;break;}else{label=300;break;}
 case 300: 
 var $1316=$1311;
 var $1317=($1316>>>0)<($1313>>>0);
 if($1317){label=302;break;}else{label=301;break;}
 case 301: 
 var $1319=(($1311+12)|0);
 HEAP32[(($1319)>>2)]=$1228;
 HEAP32[(($1310)>>2)]=$1228;
 var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
 var $1320=(($tbase_245_i+$_sum21_i_i)|0);
 var $1321=$1320;
 HEAP32[(($1321)>>2)]=$1311;
 var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
 var $1322=(($tbase_245_i+$_sum22_i_i)|0);
 var $1323=$1322;
 HEAP32[(($1323)>>2)]=$T_0_i27_i;
 var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
 var $1324=(($tbase_245_i+$_sum23_i_i)|0);
 var $1325=$1324;
 HEAP32[(($1325)>>2)]=0;
 label=303;break;
 case 302: 
 _abort();
 throw "Reached an unreachable!";
 case 303: 
 var $_sum1819_i_i=$993|8;
 var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
 var $mem_0=$1326;label=341;break;
 case 304: 
 var $1327=$890;
 var $sp_0_i_i_i=2256;label=305;break;
 case 305: 
 var $sp_0_i_i_i;
 var $1329=(($sp_0_i_i_i)|0);
 var $1330=HEAP32[(($1329)>>2)];
 var $1331=($1330>>>0)>($1327>>>0);
 if($1331){label=307;break;}else{label=306;break;}
 case 306: 
 var $1333=(($sp_0_i_i_i+4)|0);
 var $1334=HEAP32[(($1333)>>2)];
 var $1335=(($1330+$1334)|0);
 var $1336=($1335>>>0)>($1327>>>0);
 if($1336){label=308;break;}else{label=307;break;}
 case 307: 
 var $1338=(($sp_0_i_i_i+8)|0);
 var $1339=HEAP32[(($1338)>>2)];
 var $sp_0_i_i_i=$1339;label=305;break;
 case 308: 
 var $_sum_i15_i=((($1334)-(47))|0);
 var $_sum1_i16_i=((($1334)-(39))|0);
 var $1340=(($1330+$_sum1_i16_i)|0);
 var $1341=$1340;
 var $1342=$1341&7;
 var $1343=($1342|0)==0;
 if($1343){var $1348=0;label=310;break;}else{label=309;break;}
 case 309: 
 var $1345=(((-$1341))|0);
 var $1346=$1345&7;
 var $1348=$1346;label=310;break;
 case 310: 
 var $1348;
 var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
 var $1349=(($1330+$_sum2_i17_i)|0);
 var $1350=(($890+16)|0);
 var $1351=$1350;
 var $1352=($1349>>>0)<($1351>>>0);
 var $1353=($1352?$1327:$1349);
 var $1354=(($1353+8)|0);
 var $1355=$1354;
 var $1356=((($tsize_244_i)-(40))|0);
 var $1357=(($tbase_245_i+8)|0);
 var $1358=$1357;
 var $1359=$1358&7;
 var $1360=($1359|0)==0;
 if($1360){var $1364=0;label=312;break;}else{label=311;break;}
 case 311: 
 var $1362=(((-$1358))|0);
 var $1363=$1362&7;
 var $1364=$1363;label=312;break;
 case 312: 
 var $1364;
 var $1365=(($tbase_245_i+$1364)|0);
 var $1366=$1365;
 var $1367=((($1356)-($1364))|0);
 HEAP32[((1832)>>2)]=$1366;
 HEAP32[((1820)>>2)]=$1367;
 var $1368=$1367|1;
 var $_sum_i_i_i=((($1364)+(4))|0);
 var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
 var $1370=$1369;
 HEAP32[(($1370)>>2)]=$1368;
 var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
 var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
 var $1372=$1371;
 HEAP32[(($1372)>>2)]=40;
 var $1373=HEAP32[((1792)>>2)];
 HEAP32[((1836)>>2)]=$1373;
 var $1374=(($1353+4)|0);
 var $1375=$1374;
 HEAP32[(($1375)>>2)]=27;
 assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[((2256)>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((2260)>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((2264)>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((2268)>>2)];
 HEAP32[((2256)>>2)]=$tbase_245_i;
 HEAP32[((2260)>>2)]=$tsize_244_i;
 HEAP32[((2268)>>2)]=0;
 HEAP32[((2264)>>2)]=$1355;
 var $1376=(($1353+28)|0);
 var $1377=$1376;
 HEAP32[(($1377)>>2)]=7;
 var $1378=(($1353+32)|0);
 var $1379=($1378>>>0)<($1335>>>0);
 if($1379){var $1380=$1377;label=313;break;}else{label=314;break;}
 case 313: 
 var $1380;
 var $1381=(($1380+4)|0);
 HEAP32[(($1381)>>2)]=7;
 var $1382=(($1380+8)|0);
 var $1383=$1382;
 var $1384=($1383>>>0)<($1335>>>0);
 if($1384){var $1380=$1381;label=313;break;}else{label=314;break;}
 case 314: 
 var $1385=($1353|0)==($1327|0);
 if($1385){label=338;break;}else{label=315;break;}
 case 315: 
 var $1387=$1353;
 var $1388=$890;
 var $1389=((($1387)-($1388))|0);
 var $1390=(($1327+$1389)|0);
 var $_sum3_i_i=((($1389)+(4))|0);
 var $1391=(($1327+$_sum3_i_i)|0);
 var $1392=$1391;
 var $1393=HEAP32[(($1392)>>2)];
 var $1394=$1393&-2;
 HEAP32[(($1392)>>2)]=$1394;
 var $1395=$1389|1;
 var $1396=(($890+4)|0);
 HEAP32[(($1396)>>2)]=$1395;
 var $1397=$1390;
 HEAP32[(($1397)>>2)]=$1389;
 var $1398=$1389>>>3;
 var $1399=($1389>>>0)<256;
 if($1399){label=316;break;}else{label=321;break;}
 case 316: 
 var $1401=$1398<<1;
 var $1402=((1848+($1401<<2))|0);
 var $1403=$1402;
 var $1404=HEAP32[((1808)>>2)];
 var $1405=1<<$1398;
 var $1406=$1404&$1405;
 var $1407=($1406|0)==0;
 if($1407){label=317;break;}else{label=318;break;}
 case 317: 
 var $1409=$1404|$1405;
 HEAP32[((1808)>>2)]=$1409;
 var $_sum11_pre_i_i=((($1401)+(2))|0);
 var $_pre_i_i=((1848+($_sum11_pre_i_i<<2))|0);
 var $F_0_i_i=$1403;var $_pre_phi_i_i=$_pre_i_i;label=320;break;
 case 318: 
 var $_sum12_i_i=((($1401)+(2))|0);
 var $1411=((1848+($_sum12_i_i<<2))|0);
 var $1412=HEAP32[(($1411)>>2)];
 var $1413=$1412;
 var $1414=HEAP32[((1824)>>2)];
 var $1415=($1413>>>0)<($1414>>>0);
 if($1415){label=319;break;}else{var $F_0_i_i=$1412;var $_pre_phi_i_i=$1411;label=320;break;}
 case 319: 
 _abort();
 throw "Reached an unreachable!";
 case 320: 
 var $_pre_phi_i_i;
 var $F_0_i_i;
 HEAP32[(($_pre_phi_i_i)>>2)]=$890;
 var $1418=(($F_0_i_i+12)|0);
 HEAP32[(($1418)>>2)]=$890;
 var $1419=(($890+8)|0);
 HEAP32[(($1419)>>2)]=$F_0_i_i;
 var $1420=(($890+12)|0);
 HEAP32[(($1420)>>2)]=$1403;
 label=338;break;
 case 321: 
 var $1422=$890;
 var $1423=$1389>>>8;
 var $1424=($1423|0)==0;
 if($1424){var $I1_0_i_i=0;label=324;break;}else{label=322;break;}
 case 322: 
 var $1426=($1389>>>0)>16777215;
 if($1426){var $I1_0_i_i=31;label=324;break;}else{label=323;break;}
 case 323: 
 var $1428=((($1423)+(1048320))|0);
 var $1429=$1428>>>16;
 var $1430=$1429&8;
 var $1431=$1423<<$1430;
 var $1432=((($1431)+(520192))|0);
 var $1433=$1432>>>16;
 var $1434=$1433&4;
 var $1435=$1434|$1430;
 var $1436=$1431<<$1434;
 var $1437=((($1436)+(245760))|0);
 var $1438=$1437>>>16;
 var $1439=$1438&2;
 var $1440=$1435|$1439;
 var $1441=(((14)-($1440))|0);
 var $1442=$1436<<$1439;
 var $1443=$1442>>>15;
 var $1444=((($1441)+($1443))|0);
 var $1445=$1444<<1;
 var $1446=((($1444)+(7))|0);
 var $1447=$1389>>>($1446>>>0);
 var $1448=$1447&1;
 var $1449=$1448|$1445;
 var $I1_0_i_i=$1449;label=324;break;
 case 324: 
 var $I1_0_i_i;
 var $1451=((2112+($I1_0_i_i<<2))|0);
 var $1452=(($890+28)|0);
 var $I1_0_c_i_i=$I1_0_i_i;
 HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
 var $1453=(($890+20)|0);
 HEAP32[(($1453)>>2)]=0;
 var $1454=(($890+16)|0);
 HEAP32[(($1454)>>2)]=0;
 var $1455=HEAP32[((1812)>>2)];
 var $1456=1<<$I1_0_i_i;
 var $1457=$1455&$1456;
 var $1458=($1457|0)==0;
 if($1458){label=325;break;}else{label=326;break;}
 case 325: 
 var $1460=$1455|$1456;
 HEAP32[((1812)>>2)]=$1460;
 HEAP32[(($1451)>>2)]=$1422;
 var $1461=(($890+24)|0);
 var $_c_i_i=$1451;
 HEAP32[(($1461)>>2)]=$_c_i_i;
 var $1462=(($890+12)|0);
 HEAP32[(($1462)>>2)]=$890;
 var $1463=(($890+8)|0);
 HEAP32[(($1463)>>2)]=$890;
 label=338;break;
 case 326: 
 var $1465=HEAP32[(($1451)>>2)];
 var $1466=($I1_0_i_i|0)==31;
 if($1466){var $1471=0;label=328;break;}else{label=327;break;}
 case 327: 
 var $1468=$I1_0_i_i>>>1;
 var $1469=(((25)-($1468))|0);
 var $1471=$1469;label=328;break;
 case 328: 
 var $1471;
 var $1472=$1389<<$1471;
 var $K2_0_i_i=$1472;var $T_0_i_i=$1465;label=329;break;
 case 329: 
 var $T_0_i_i;
 var $K2_0_i_i;
 var $1474=(($T_0_i_i+4)|0);
 var $1475=HEAP32[(($1474)>>2)];
 var $1476=$1475&-8;
 var $1477=($1476|0)==($1389|0);
 if($1477){label=334;break;}else{label=330;break;}
 case 330: 
 var $1479=$K2_0_i_i>>>31;
 var $1480=(($T_0_i_i+16+($1479<<2))|0);
 var $1481=HEAP32[(($1480)>>2)];
 var $1482=($1481|0)==0;
 var $1483=$K2_0_i_i<<1;
 if($1482){label=331;break;}else{var $K2_0_i_i=$1483;var $T_0_i_i=$1481;label=329;break;}
 case 331: 
 var $1485=$1480;
 var $1486=HEAP32[((1824)>>2)];
 var $1487=($1485>>>0)<($1486>>>0);
 if($1487){label=333;break;}else{label=332;break;}
 case 332: 
 HEAP32[(($1480)>>2)]=$1422;
 var $1489=(($890+24)|0);
 var $T_0_c8_i_i=$T_0_i_i;
 HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
 var $1490=(($890+12)|0);
 HEAP32[(($1490)>>2)]=$890;
 var $1491=(($890+8)|0);
 HEAP32[(($1491)>>2)]=$890;
 label=338;break;
 case 333: 
 _abort();
 throw "Reached an unreachable!";
 case 334: 
 var $1494=(($T_0_i_i+8)|0);
 var $1495=HEAP32[(($1494)>>2)];
 var $1496=$T_0_i_i;
 var $1497=HEAP32[((1824)>>2)];
 var $1498=($1496>>>0)<($1497>>>0);
 if($1498){label=337;break;}else{label=335;break;}
 case 335: 
 var $1500=$1495;
 var $1501=($1500>>>0)<($1497>>>0);
 if($1501){label=337;break;}else{label=336;break;}
 case 336: 
 var $1503=(($1495+12)|0);
 HEAP32[(($1503)>>2)]=$1422;
 HEAP32[(($1494)>>2)]=$1422;
 var $1504=(($890+8)|0);
 var $_c7_i_i=$1495;
 HEAP32[(($1504)>>2)]=$_c7_i_i;
 var $1505=(($890+12)|0);
 var $T_0_c_i_i=$T_0_i_i;
 HEAP32[(($1505)>>2)]=$T_0_c_i_i;
 var $1506=(($890+24)|0);
 HEAP32[(($1506)>>2)]=0;
 label=338;break;
 case 337: 
 _abort();
 throw "Reached an unreachable!";
 case 338: 
 var $1507=HEAP32[((1820)>>2)];
 var $1508=($1507>>>0)>($nb_0>>>0);
 if($1508){label=339;break;}else{label=340;break;}
 case 339: 
 var $1510=((($1507)-($nb_0))|0);
 HEAP32[((1820)>>2)]=$1510;
 var $1511=HEAP32[((1832)>>2)];
 var $1512=$1511;
 var $1513=(($1512+$nb_0)|0);
 var $1514=$1513;
 HEAP32[((1832)>>2)]=$1514;
 var $1515=$1510|1;
 var $_sum_i134=((($nb_0)+(4))|0);
 var $1516=(($1512+$_sum_i134)|0);
 var $1517=$1516;
 HEAP32[(($1517)>>2)]=$1515;
 var $1518=$nb_0|3;
 var $1519=(($1511+4)|0);
 HEAP32[(($1519)>>2)]=$1518;
 var $1520=(($1511+8)|0);
 var $1521=$1520;
 var $mem_0=$1521;label=341;break;
 case 340: 
 var $1522=___errno_location();
 HEAP32[(($1522)>>2)]=12;
 var $mem_0=0;label=341;break;
 case 341: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($mem|0)==0;
 if($1){label=140;break;}else{label=2;break;}
 case 2: 
 var $3=((($mem)-(8))|0);
 var $4=$3;
 var $5=HEAP32[((1824)>>2)];
 var $6=($3>>>0)<($5>>>0);
 if($6){label=139;break;}else{label=3;break;}
 case 3: 
 var $8=((($mem)-(4))|0);
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=$10&3;
 var $12=($11|0)==1;
 if($12){label=139;break;}else{label=4;break;}
 case 4: 
 var $14=$10&-8;
 var $_sum=((($14)-(8))|0);
 var $15=(($mem+$_sum)|0);
 var $16=$15;
 var $17=$10&1;
 var $18=($17|0)==0;
 if($18){label=5;break;}else{var $p_0=$4;var $psize_0=$14;label=56;break;}
 case 5: 
 var $20=$3;
 var $21=HEAP32[(($20)>>2)];
 var $22=($11|0)==0;
 if($22){label=140;break;}else{label=6;break;}
 case 6: 
 var $_sum232=(((-8)-($21))|0);
 var $24=(($mem+$_sum232)|0);
 var $25=$24;
 var $26=((($21)+($14))|0);
 var $27=($24>>>0)<($5>>>0);
 if($27){label=139;break;}else{label=7;break;}
 case 7: 
 var $29=HEAP32[((1828)>>2)];
 var $30=($25|0)==($29|0);
 if($30){label=54;break;}else{label=8;break;}
 case 8: 
 var $32=$21>>>3;
 var $33=($21>>>0)<256;
 if($33){label=9;break;}else{label=21;break;}
 case 9: 
 var $_sum276=((($_sum232)+(8))|0);
 var $35=(($mem+$_sum276)|0);
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $_sum277=((($_sum232)+(12))|0);
 var $38=(($mem+$_sum277)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=$32<<1;
 var $42=((1848+($41<<2))|0);
 var $43=$42;
 var $44=($37|0)==($43|0);
 if($44){label=12;break;}else{label=10;break;}
 case 10: 
 var $46=$37;
 var $47=($46>>>0)<($5>>>0);
 if($47){label=20;break;}else{label=11;break;}
 case 11: 
 var $49=(($37+12)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)==($25|0);
 if($51){label=12;break;}else{label=20;break;}
 case 12: 
 var $52=($40|0)==($37|0);
 if($52){label=13;break;}else{label=14;break;}
 case 13: 
 var $54=1<<$32;
 var $55=$54^-1;
 var $56=HEAP32[((1808)>>2)];
 var $57=$56&$55;
 HEAP32[((1808)>>2)]=$57;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 14: 
 var $59=($40|0)==($43|0);
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre305=(($40+8)|0);
 var $_pre_phi306=$_pre305;label=18;break;
 case 16: 
 var $61=$40;
 var $62=($61>>>0)<($5>>>0);
 if($62){label=19;break;}else{label=17;break;}
 case 17: 
 var $64=(($40+8)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=($65|0)==($25|0);
 if($66){var $_pre_phi306=$64;label=18;break;}else{label=19;break;}
 case 18: 
 var $_pre_phi306;
 var $67=(($37+12)|0);
 HEAP32[(($67)>>2)]=$40;
 HEAP32[(($_pre_phi306)>>2)]=$37;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 _abort();
 throw "Reached an unreachable!";
 case 21: 
 var $69=$24;
 var $_sum266=((($_sum232)+(24))|0);
 var $70=(($mem+$_sum266)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $_sum267=((($_sum232)+(12))|0);
 var $73=(($mem+$_sum267)|0);
 var $74=$73;
 var $75=HEAP32[(($74)>>2)];
 var $76=($75|0)==($69|0);
 if($76){label=27;break;}else{label=22;break;}
 case 22: 
 var $_sum273=((($_sum232)+(8))|0);
 var $78=(($mem+$_sum273)|0);
 var $79=$78;
 var $80=HEAP32[(($79)>>2)];
 var $81=$80;
 var $82=($81>>>0)<($5>>>0);
 if($82){label=26;break;}else{label=23;break;}
 case 23: 
 var $84=(($80+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=($85|0)==($69|0);
 if($86){label=24;break;}else{label=26;break;}
 case 24: 
 var $88=(($75+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($89|0)==($69|0);
 if($90){label=25;break;}else{label=26;break;}
 case 25: 
 HEAP32[(($84)>>2)]=$75;
 HEAP32[(($88)>>2)]=$80;
 var $R_1=$75;label=34;break;
 case 26: 
 _abort();
 throw "Reached an unreachable!";
 case 27: 
 var $_sum269=((($_sum232)+(20))|0);
 var $93=(($mem+$_sum269)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=28;break;}else{var $R_0=$95;var $RP_0=$94;label=29;break;}
 case 28: 
 var $_sum268=((($_sum232)+(16))|0);
 var $98=(($mem+$_sum268)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==0;
 if($101){var $R_1=0;label=34;break;}else{var $R_0=$100;var $RP_0=$99;label=29;break;}
 case 29: 
 var $RP_0;
 var $R_0;
 var $102=(($R_0+20)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==0;
 if($104){label=30;break;}else{var $R_0=$103;var $RP_0=$102;label=29;break;}
 case 30: 
 var $106=(($R_0+16)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=($107|0)==0;
 if($108){label=31;break;}else{var $R_0=$107;var $RP_0=$106;label=29;break;}
 case 31: 
 var $110=$RP_0;
 var $111=($110>>>0)<($5>>>0);
 if($111){label=33;break;}else{label=32;break;}
 case 32: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=34;break;
 case 33: 
 _abort();
 throw "Reached an unreachable!";
 case 34: 
 var $R_1;
 var $115=($72|0)==0;
 if($115){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=35;break;}
 case 35: 
 var $_sum270=((($_sum232)+(28))|0);
 var $117=(($mem+$_sum270)|0);
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=((2112+($119<<2))|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=($69|0)==($121|0);
 if($122){label=36;break;}else{label=38;break;}
 case 36: 
 HEAP32[(($120)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=37;break;}else{label=44;break;}
 case 37: 
 var $124=HEAP32[(($118)>>2)];
 var $125=1<<$124;
 var $126=$125^-1;
 var $127=HEAP32[((1812)>>2)];
 var $128=$127&$126;
 HEAP32[((1812)>>2)]=$128;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 38: 
 var $130=$72;
 var $131=HEAP32[((1824)>>2)];
 var $132=($130>>>0)<($131>>>0);
 if($132){label=42;break;}else{label=39;break;}
 case 39: 
 var $134=(($72+16)|0);
 var $135=HEAP32[(($134)>>2)];
 var $136=($135|0)==($69|0);
 if($136){label=40;break;}else{label=41;break;}
 case 40: 
 HEAP32[(($134)>>2)]=$R_1;
 label=43;break;
 case 41: 
 var $139=(($72+20)|0);
 HEAP32[(($139)>>2)]=$R_1;
 label=43;break;
 case 42: 
 _abort();
 throw "Reached an unreachable!";
 case 43: 
 var $142=($R_1|0)==0;
 if($142){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=44;break;}
 case 44: 
 var $144=$R_1;
 var $145=HEAP32[((1824)>>2)];
 var $146=($144>>>0)<($145>>>0);
 if($146){label=53;break;}else{label=45;break;}
 case 45: 
 var $148=(($R_1+24)|0);
 HEAP32[(($148)>>2)]=$72;
 var $_sum271=((($_sum232)+(16))|0);
 var $149=(($mem+$_sum271)|0);
 var $150=$149;
 var $151=HEAP32[(($150)>>2)];
 var $152=($151|0)==0;
 if($152){label=49;break;}else{label=46;break;}
 case 46: 
 var $154=$151;
 var $155=HEAP32[((1824)>>2)];
 var $156=($154>>>0)<($155>>>0);
 if($156){label=48;break;}else{label=47;break;}
 case 47: 
 var $158=(($R_1+16)|0);
 HEAP32[(($158)>>2)]=$151;
 var $159=(($151+24)|0);
 HEAP32[(($159)>>2)]=$R_1;
 label=49;break;
 case 48: 
 _abort();
 throw "Reached an unreachable!";
 case 49: 
 var $_sum272=((($_sum232)+(20))|0);
 var $162=(($mem+$_sum272)|0);
 var $163=$162;
 var $164=HEAP32[(($163)>>2)];
 var $165=($164|0)==0;
 if($165){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=50;break;}
 case 50: 
 var $167=$164;
 var $168=HEAP32[((1824)>>2)];
 var $169=($167>>>0)<($168>>>0);
 if($169){label=52;break;}else{label=51;break;}
 case 51: 
 var $171=(($R_1+20)|0);
 HEAP32[(($171)>>2)]=$164;
 var $172=(($164+24)|0);
 HEAP32[(($172)>>2)]=$R_1;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 52: 
 _abort();
 throw "Reached an unreachable!";
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_sum233=((($14)-(4))|0);
 var $176=(($mem+$_sum233)|0);
 var $177=$176;
 var $178=HEAP32[(($177)>>2)];
 var $179=$178&3;
 var $180=($179|0)==3;
 if($180){label=55;break;}else{var $p_0=$25;var $psize_0=$26;label=56;break;}
 case 55: 
 HEAP32[((1816)>>2)]=$26;
 var $182=HEAP32[(($177)>>2)];
 var $183=$182&-2;
 HEAP32[(($177)>>2)]=$183;
 var $184=$26|1;
 var $_sum264=((($_sum232)+(4))|0);
 var $185=(($mem+$_sum264)|0);
 var $186=$185;
 HEAP32[(($186)>>2)]=$184;
 var $187=$15;
 HEAP32[(($187)>>2)]=$26;
 label=140;break;
 case 56: 
 var $psize_0;
 var $p_0;
 var $189=$p_0;
 var $190=($189>>>0)<($15>>>0);
 if($190){label=57;break;}else{label=139;break;}
 case 57: 
 var $_sum263=((($14)-(4))|0);
 var $192=(($mem+$_sum263)|0);
 var $193=$192;
 var $194=HEAP32[(($193)>>2)];
 var $195=$194&1;
 var $phitmp=($195|0)==0;
 if($phitmp){label=139;break;}else{label=58;break;}
 case 58: 
 var $197=$194&2;
 var $198=($197|0)==0;
 if($198){label=59;break;}else{label=112;break;}
 case 59: 
 var $200=HEAP32[((1832)>>2)];
 var $201=($16|0)==($200|0);
 if($201){label=60;break;}else{label=62;break;}
 case 60: 
 var $203=HEAP32[((1820)>>2)];
 var $204=((($203)+($psize_0))|0);
 HEAP32[((1820)>>2)]=$204;
 HEAP32[((1832)>>2)]=$p_0;
 var $205=$204|1;
 var $206=(($p_0+4)|0);
 HEAP32[(($206)>>2)]=$205;
 var $207=HEAP32[((1828)>>2)];
 var $208=($p_0|0)==($207|0);
 if($208){label=61;break;}else{label=140;break;}
 case 61: 
 HEAP32[((1828)>>2)]=0;
 HEAP32[((1816)>>2)]=0;
 label=140;break;
 case 62: 
 var $211=HEAP32[((1828)>>2)];
 var $212=($16|0)==($211|0);
 if($212){label=63;break;}else{label=64;break;}
 case 63: 
 var $214=HEAP32[((1816)>>2)];
 var $215=((($214)+($psize_0))|0);
 HEAP32[((1816)>>2)]=$215;
 HEAP32[((1828)>>2)]=$p_0;
 var $216=$215|1;
 var $217=(($p_0+4)|0);
 HEAP32[(($217)>>2)]=$216;
 var $218=(($189+$215)|0);
 var $219=$218;
 HEAP32[(($219)>>2)]=$215;
 label=140;break;
 case 64: 
 var $221=$194&-8;
 var $222=((($221)+($psize_0))|0);
 var $223=$194>>>3;
 var $224=($194>>>0)<256;
 if($224){label=65;break;}else{label=77;break;}
 case 65: 
 var $226=(($mem+$14)|0);
 var $227=$226;
 var $228=HEAP32[(($227)>>2)];
 var $_sum257258=$14|4;
 var $229=(($mem+$_sum257258)|0);
 var $230=$229;
 var $231=HEAP32[(($230)>>2)];
 var $232=$223<<1;
 var $233=((1848+($232<<2))|0);
 var $234=$233;
 var $235=($228|0)==($234|0);
 if($235){label=68;break;}else{label=66;break;}
 case 66: 
 var $237=$228;
 var $238=HEAP32[((1824)>>2)];
 var $239=($237>>>0)<($238>>>0);
 if($239){label=76;break;}else{label=67;break;}
 case 67: 
 var $241=(($228+12)|0);
 var $242=HEAP32[(($241)>>2)];
 var $243=($242|0)==($16|0);
 if($243){label=68;break;}else{label=76;break;}
 case 68: 
 var $244=($231|0)==($228|0);
 if($244){label=69;break;}else{label=70;break;}
 case 69: 
 var $246=1<<$223;
 var $247=$246^-1;
 var $248=HEAP32[((1808)>>2)];
 var $249=$248&$247;
 HEAP32[((1808)>>2)]=$249;
 label=110;break;
 case 70: 
 var $251=($231|0)==($234|0);
 if($251){label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre303=(($231+8)|0);
 var $_pre_phi304=$_pre303;label=74;break;
 case 72: 
 var $253=$231;
 var $254=HEAP32[((1824)>>2)];
 var $255=($253>>>0)<($254>>>0);
 if($255){label=75;break;}else{label=73;break;}
 case 73: 
 var $257=(($231+8)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=($258|0)==($16|0);
 if($259){var $_pre_phi304=$257;label=74;break;}else{label=75;break;}
 case 74: 
 var $_pre_phi304;
 var $260=(($228+12)|0);
 HEAP32[(($260)>>2)]=$231;
 HEAP32[(($_pre_phi304)>>2)]=$228;
 label=110;break;
 case 75: 
 _abort();
 throw "Reached an unreachable!";
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $262=$15;
 var $_sum235=((($14)+(16))|0);
 var $263=(($mem+$_sum235)|0);
 var $264=$263;
 var $265=HEAP32[(($264)>>2)];
 var $_sum236237=$14|4;
 var $266=(($mem+$_sum236237)|0);
 var $267=$266;
 var $268=HEAP32[(($267)>>2)];
 var $269=($268|0)==($262|0);
 if($269){label=83;break;}else{label=78;break;}
 case 78: 
 var $271=(($mem+$14)|0);
 var $272=$271;
 var $273=HEAP32[(($272)>>2)];
 var $274=$273;
 var $275=HEAP32[((1824)>>2)];
 var $276=($274>>>0)<($275>>>0);
 if($276){label=82;break;}else{label=79;break;}
 case 79: 
 var $278=(($273+12)|0);
 var $279=HEAP32[(($278)>>2)];
 var $280=($279|0)==($262|0);
 if($280){label=80;break;}else{label=82;break;}
 case 80: 
 var $282=(($268+8)|0);
 var $283=HEAP32[(($282)>>2)];
 var $284=($283|0)==($262|0);
 if($284){label=81;break;}else{label=82;break;}
 case 81: 
 HEAP32[(($278)>>2)]=$268;
 HEAP32[(($282)>>2)]=$273;
 var $R7_1=$268;label=90;break;
 case 82: 
 _abort();
 throw "Reached an unreachable!";
 case 83: 
 var $_sum239=((($14)+(12))|0);
 var $287=(($mem+$_sum239)|0);
 var $288=$287;
 var $289=HEAP32[(($288)>>2)];
 var $290=($289|0)==0;
 if($290){label=84;break;}else{var $R7_0=$289;var $RP9_0=$288;label=85;break;}
 case 84: 
 var $_sum238=((($14)+(8))|0);
 var $292=(($mem+$_sum238)|0);
 var $293=$292;
 var $294=HEAP32[(($293)>>2)];
 var $295=($294|0)==0;
 if($295){var $R7_1=0;label=90;break;}else{var $R7_0=$294;var $RP9_0=$293;label=85;break;}
 case 85: 
 var $RP9_0;
 var $R7_0;
 var $296=(($R7_0+20)|0);
 var $297=HEAP32[(($296)>>2)];
 var $298=($297|0)==0;
 if($298){label=86;break;}else{var $R7_0=$297;var $RP9_0=$296;label=85;break;}
 case 86: 
 var $300=(($R7_0+16)|0);
 var $301=HEAP32[(($300)>>2)];
 var $302=($301|0)==0;
 if($302){label=87;break;}else{var $R7_0=$301;var $RP9_0=$300;label=85;break;}
 case 87: 
 var $304=$RP9_0;
 var $305=HEAP32[((1824)>>2)];
 var $306=($304>>>0)<($305>>>0);
 if($306){label=89;break;}else{label=88;break;}
 case 88: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=90;break;
 case 89: 
 _abort();
 throw "Reached an unreachable!";
 case 90: 
 var $R7_1;
 var $310=($265|0)==0;
 if($310){label=110;break;}else{label=91;break;}
 case 91: 
 var $_sum250=((($14)+(20))|0);
 var $312=(($mem+$_sum250)|0);
 var $313=$312;
 var $314=HEAP32[(($313)>>2)];
 var $315=((2112+($314<<2))|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=($262|0)==($316|0);
 if($317){label=92;break;}else{label=94;break;}
 case 92: 
 HEAP32[(($315)>>2)]=$R7_1;
 var $cond298=($R7_1|0)==0;
 if($cond298){label=93;break;}else{label=100;break;}
 case 93: 
 var $319=HEAP32[(($313)>>2)];
 var $320=1<<$319;
 var $321=$320^-1;
 var $322=HEAP32[((1812)>>2)];
 var $323=$322&$321;
 HEAP32[((1812)>>2)]=$323;
 label=110;break;
 case 94: 
 var $325=$265;
 var $326=HEAP32[((1824)>>2)];
 var $327=($325>>>0)<($326>>>0);
 if($327){label=98;break;}else{label=95;break;}
 case 95: 
 var $329=(($265+16)|0);
 var $330=HEAP32[(($329)>>2)];
 var $331=($330|0)==($262|0);
 if($331){label=96;break;}else{label=97;break;}
 case 96: 
 HEAP32[(($329)>>2)]=$R7_1;
 label=99;break;
 case 97: 
 var $334=(($265+20)|0);
 HEAP32[(($334)>>2)]=$R7_1;
 label=99;break;
 case 98: 
 _abort();
 throw "Reached an unreachable!";
 case 99: 
 var $337=($R7_1|0)==0;
 if($337){label=110;break;}else{label=100;break;}
 case 100: 
 var $339=$R7_1;
 var $340=HEAP32[((1824)>>2)];
 var $341=($339>>>0)<($340>>>0);
 if($341){label=109;break;}else{label=101;break;}
 case 101: 
 var $343=(($R7_1+24)|0);
 HEAP32[(($343)>>2)]=$265;
 var $_sum251=((($14)+(8))|0);
 var $344=(($mem+$_sum251)|0);
 var $345=$344;
 var $346=HEAP32[(($345)>>2)];
 var $347=($346|0)==0;
 if($347){label=105;break;}else{label=102;break;}
 case 102: 
 var $349=$346;
 var $350=HEAP32[((1824)>>2)];
 var $351=($349>>>0)<($350>>>0);
 if($351){label=104;break;}else{label=103;break;}
 case 103: 
 var $353=(($R7_1+16)|0);
 HEAP32[(($353)>>2)]=$346;
 var $354=(($346+24)|0);
 HEAP32[(($354)>>2)]=$R7_1;
 label=105;break;
 case 104: 
 _abort();
 throw "Reached an unreachable!";
 case 105: 
 var $_sum252=((($14)+(12))|0);
 var $357=(($mem+$_sum252)|0);
 var $358=$357;
 var $359=HEAP32[(($358)>>2)];
 var $360=($359|0)==0;
 if($360){label=110;break;}else{label=106;break;}
 case 106: 
 var $362=$359;
 var $363=HEAP32[((1824)>>2)];
 var $364=($362>>>0)<($363>>>0);
 if($364){label=108;break;}else{label=107;break;}
 case 107: 
 var $366=(($R7_1+20)|0);
 HEAP32[(($366)>>2)]=$359;
 var $367=(($359+24)|0);
 HEAP32[(($367)>>2)]=$R7_1;
 label=110;break;
 case 108: 
 _abort();
 throw "Reached an unreachable!";
 case 109: 
 _abort();
 throw "Reached an unreachable!";
 case 110: 
 var $371=$222|1;
 var $372=(($p_0+4)|0);
 HEAP32[(($372)>>2)]=$371;
 var $373=(($189+$222)|0);
 var $374=$373;
 HEAP32[(($374)>>2)]=$222;
 var $375=HEAP32[((1828)>>2)];
 var $376=($p_0|0)==($375|0);
 if($376){label=111;break;}else{var $psize_1=$222;label=113;break;}
 case 111: 
 HEAP32[((1816)>>2)]=$222;
 label=140;break;
 case 112: 
 var $379=$194&-2;
 HEAP32[(($193)>>2)]=$379;
 var $380=$psize_0|1;
 var $381=(($p_0+4)|0);
 HEAP32[(($381)>>2)]=$380;
 var $382=(($189+$psize_0)|0);
 var $383=$382;
 HEAP32[(($383)>>2)]=$psize_0;
 var $psize_1=$psize_0;label=113;break;
 case 113: 
 var $psize_1;
 var $385=$psize_1>>>3;
 var $386=($psize_1>>>0)<256;
 if($386){label=114;break;}else{label=119;break;}
 case 114: 
 var $388=$385<<1;
 var $389=((1848+($388<<2))|0);
 var $390=$389;
 var $391=HEAP32[((1808)>>2)];
 var $392=1<<$385;
 var $393=$391&$392;
 var $394=($393|0)==0;
 if($394){label=115;break;}else{label=116;break;}
 case 115: 
 var $396=$391|$392;
 HEAP32[((1808)>>2)]=$396;
 var $_sum248_pre=((($388)+(2))|0);
 var $_pre=((1848+($_sum248_pre<<2))|0);
 var $F16_0=$390;var $_pre_phi=$_pre;label=118;break;
 case 116: 
 var $_sum249=((($388)+(2))|0);
 var $398=((1848+($_sum249<<2))|0);
 var $399=HEAP32[(($398)>>2)];
 var $400=$399;
 var $401=HEAP32[((1824)>>2)];
 var $402=($400>>>0)<($401>>>0);
 if($402){label=117;break;}else{var $F16_0=$399;var $_pre_phi=$398;label=118;break;}
 case 117: 
 _abort();
 throw "Reached an unreachable!";
 case 118: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$p_0;
 var $405=(($F16_0+12)|0);
 HEAP32[(($405)>>2)]=$p_0;
 var $406=(($p_0+8)|0);
 HEAP32[(($406)>>2)]=$F16_0;
 var $407=(($p_0+12)|0);
 HEAP32[(($407)>>2)]=$390;
 label=140;break;
 case 119: 
 var $409=$p_0;
 var $410=$psize_1>>>8;
 var $411=($410|0)==0;
 if($411){var $I18_0=0;label=122;break;}else{label=120;break;}
 case 120: 
 var $413=($psize_1>>>0)>16777215;
 if($413){var $I18_0=31;label=122;break;}else{label=121;break;}
 case 121: 
 var $415=((($410)+(1048320))|0);
 var $416=$415>>>16;
 var $417=$416&8;
 var $418=$410<<$417;
 var $419=((($418)+(520192))|0);
 var $420=$419>>>16;
 var $421=$420&4;
 var $422=$421|$417;
 var $423=$418<<$421;
 var $424=((($423)+(245760))|0);
 var $425=$424>>>16;
 var $426=$425&2;
 var $427=$422|$426;
 var $428=(((14)-($427))|0);
 var $429=$423<<$426;
 var $430=$429>>>15;
 var $431=((($428)+($430))|0);
 var $432=$431<<1;
 var $433=((($431)+(7))|0);
 var $434=$psize_1>>>($433>>>0);
 var $435=$434&1;
 var $436=$435|$432;
 var $I18_0=$436;label=122;break;
 case 122: 
 var $I18_0;
 var $438=((2112+($I18_0<<2))|0);
 var $439=(($p_0+28)|0);
 var $I18_0_c=$I18_0;
 HEAP32[(($439)>>2)]=$I18_0_c;
 var $440=(($p_0+20)|0);
 HEAP32[(($440)>>2)]=0;
 var $441=(($p_0+16)|0);
 HEAP32[(($441)>>2)]=0;
 var $442=HEAP32[((1812)>>2)];
 var $443=1<<$I18_0;
 var $444=$442&$443;
 var $445=($444|0)==0;
 if($445){label=123;break;}else{label=124;break;}
 case 123: 
 var $447=$442|$443;
 HEAP32[((1812)>>2)]=$447;
 HEAP32[(($438)>>2)]=$409;
 var $448=(($p_0+24)|0);
 var $_c=$438;
 HEAP32[(($448)>>2)]=$_c;
 var $449=(($p_0+12)|0);
 HEAP32[(($449)>>2)]=$p_0;
 var $450=(($p_0+8)|0);
 HEAP32[(($450)>>2)]=$p_0;
 label=136;break;
 case 124: 
 var $452=HEAP32[(($438)>>2)];
 var $453=($I18_0|0)==31;
 if($453){var $458=0;label=126;break;}else{label=125;break;}
 case 125: 
 var $455=$I18_0>>>1;
 var $456=(((25)-($455))|0);
 var $458=$456;label=126;break;
 case 126: 
 var $458;
 var $459=$psize_1<<$458;
 var $K19_0=$459;var $T_0=$452;label=127;break;
 case 127: 
 var $T_0;
 var $K19_0;
 var $461=(($T_0+4)|0);
 var $462=HEAP32[(($461)>>2)];
 var $463=$462&-8;
 var $464=($463|0)==($psize_1|0);
 if($464){label=132;break;}else{label=128;break;}
 case 128: 
 var $466=$K19_0>>>31;
 var $467=(($T_0+16+($466<<2))|0);
 var $468=HEAP32[(($467)>>2)];
 var $469=($468|0)==0;
 var $470=$K19_0<<1;
 if($469){label=129;break;}else{var $K19_0=$470;var $T_0=$468;label=127;break;}
 case 129: 
 var $472=$467;
 var $473=HEAP32[((1824)>>2)];
 var $474=($472>>>0)<($473>>>0);
 if($474){label=131;break;}else{label=130;break;}
 case 130: 
 HEAP32[(($467)>>2)]=$409;
 var $476=(($p_0+24)|0);
 var $T_0_c245=$T_0;
 HEAP32[(($476)>>2)]=$T_0_c245;
 var $477=(($p_0+12)|0);
 HEAP32[(($477)>>2)]=$p_0;
 var $478=(($p_0+8)|0);
 HEAP32[(($478)>>2)]=$p_0;
 label=136;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 var $481=(($T_0+8)|0);
 var $482=HEAP32[(($481)>>2)];
 var $483=$T_0;
 var $484=HEAP32[((1824)>>2)];
 var $485=($483>>>0)<($484>>>0);
 if($485){label=135;break;}else{label=133;break;}
 case 133: 
 var $487=$482;
 var $488=($487>>>0)<($484>>>0);
 if($488){label=135;break;}else{label=134;break;}
 case 134: 
 var $490=(($482+12)|0);
 HEAP32[(($490)>>2)]=$409;
 HEAP32[(($481)>>2)]=$409;
 var $491=(($p_0+8)|0);
 var $_c244=$482;
 HEAP32[(($491)>>2)]=$_c244;
 var $492=(($p_0+12)|0);
 var $T_0_c=$T_0;
 HEAP32[(($492)>>2)]=$T_0_c;
 var $493=(($p_0+24)|0);
 HEAP32[(($493)>>2)]=0;
 label=136;break;
 case 135: 
 _abort();
 throw "Reached an unreachable!";
 case 136: 
 var $495=HEAP32[((1840)>>2)];
 var $496=((($495)-(1))|0);
 HEAP32[((1840)>>2)]=$496;
 var $497=($496|0)==0;
 if($497){var $sp_0_in_i=2264;label=137;break;}else{label=140;break;}
 case 137: 
 var $sp_0_in_i;
 var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
 var $498=($sp_0_i|0)==0;
 var $499=(($sp_0_i+8)|0);
 if($498){label=138;break;}else{var $sp_0_in_i=$499;label=137;break;}
 case 138: 
 HEAP32[((1840)>>2)]=-1;
 label=140;break;
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
function _realloc($oldmem,$bytes){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($oldmem|0)==0;
 if($1){label=2;break;}else{label=3;break;}
 case 2: 
 var $3=_malloc($bytes);
 var $mem_0=$3;label=80;break;
 case 3: 
 var $5=($bytes>>>0)>4294967231;
 if($5){label=4;break;}else{label=5;break;}
 case 4: 
 var $7=___errno_location();
 HEAP32[(($7)>>2)]=12;
 var $mem_0=0;label=80;break;
 case 5: 
 var $9=($bytes>>>0)<11;
 if($9){var $14=16;label=7;break;}else{label=6;break;}
 case 6: 
 var $11=((($bytes)+(11))|0);
 var $12=$11&-8;
 var $14=$12;label=7;break;
 case 7: 
 var $14;
 var $15=((($oldmem)-(8))|0);
 var $16=((($oldmem)-(4))|0);
 var $17=$16;
 var $18=HEAP32[(($17)>>2)];
 var $19=$18&-8;
 var $_sum=((($19)-(8))|0);
 var $20=(($oldmem+$_sum)|0);
 var $21=$20;
 var $22=HEAP32[((1824)>>2)];
 var $23=($15>>>0)<($22>>>0);
 if($23){label=76;break;}else{label=8;break;}
 case 8: 
 var $25=$18&3;
 var $26=($25|0)!=1;
 var $27=($_sum|0)>-8;
 var $or_cond_i=$26&$27;
 if($or_cond_i){label=9;break;}else{label=76;break;}
 case 9: 
 var $_sum3334_i=$19|4;
 var $_sum1=((($_sum3334_i)-(8))|0);
 var $29=(($oldmem+$_sum1)|0);
 var $30=$29;
 var $31=HEAP32[(($30)>>2)];
 var $32=$31&1;
 var $phitmp_i=($32|0)==0;
 if($phitmp_i){label=76;break;}else{label=10;break;}
 case 10: 
 var $34=($25|0)==0;
 if($34){label=11;break;}else{label=13;break;}
 case 11: 
 var $36=($14>>>0)<256;
 var $37=$14|4;
 var $38=($19>>>0)<($37>>>0);
 var $or_cond=$36|$38;
 if($or_cond){label=78;break;}else{label=12;break;}
 case 12: 
 var $40=((($19)-($14))|0);
 var $41=HEAP32[((1784)>>2)];
 var $42=$41<<1;
 var $43=($40>>>0)>($42>>>0);
 var $44=($15|0)==0;
 var $or_cond35=$43|$44;
 if($or_cond35){label=78;break;}else{var $mem_0=$oldmem;label=80;break;}
 case 13: 
 var $46=($19>>>0)<($14>>>0);
 if($46){label=16;break;}else{label=14;break;}
 case 14: 
 var $48=((($19)-($14))|0);
 var $49=($48>>>0)>15;
 if($49){label=15;break;}else{label=77;break;}
 case 15: 
 var $_sum2=((($14)-(8))|0);
 var $50=(($oldmem+$_sum2)|0);
 var $51=$50;
 var $52=$18&1;
 var $53=$52|$14;
 var $54=$53|2;
 HEAP32[(($17)>>2)]=$54;
 var $_sum29_i3=$14|4;
 var $_sum4=((($_sum29_i3)-(8))|0);
 var $55=(($oldmem+$_sum4)|0);
 var $56=$55;
 var $57=$48|3;
 HEAP32[(($56)>>2)]=$57;
 var $58=HEAP32[(($30)>>2)];
 var $59=$58|1;
 HEAP32[(($30)>>2)]=$59;
 _dispose_chunk($51,$48);
 var $mem_0=$oldmem;label=80;break;
 case 16: 
 var $61=HEAP32[((1832)>>2)];
 var $62=($21|0)==($61|0);
 if($62){label=17;break;}else{label=19;break;}
 case 17: 
 var $64=HEAP32[((1820)>>2)];
 var $65=((($64)+($19))|0);
 var $66=($65>>>0)>($14>>>0);
 if($66){label=18;break;}else{label=78;break;}
 case 18: 
 var $68=((($65)-($14))|0);
 var $_sum28=((($14)-(8))|0);
 var $69=(($oldmem+$_sum28)|0);
 var $70=$69;
 var $71=$18&1;
 var $72=$71|$14;
 var $73=$72|2;
 HEAP32[(($17)>>2)]=$73;
 var $_sum28_i29=$14|4;
 var $_sum30=((($_sum28_i29)-(8))|0);
 var $74=(($oldmem+$_sum30)|0);
 var $75=$74;
 var $76=$68|1;
 HEAP32[(($75)>>2)]=$76;
 HEAP32[((1832)>>2)]=$70;
 HEAP32[((1820)>>2)]=$68;
 label=77;break;
 case 19: 
 var $78=HEAP32[((1828)>>2)];
 var $79=($21|0)==($78|0);
 if($79){label=20;break;}else{label=25;break;}
 case 20: 
 var $81=HEAP32[((1816)>>2)];
 var $82=((($81)+($19))|0);
 var $83=($82>>>0)<($14>>>0);
 if($83){label=78;break;}else{label=21;break;}
 case 21: 
 var $85=((($82)-($14))|0);
 var $86=($85>>>0)>15;
 if($86){label=22;break;}else{label=23;break;}
 case 22: 
 var $_sum23=((($14)-(8))|0);
 var $88=(($oldmem+$_sum23)|0);
 var $89=$88;
 var $_sum24=((($82)-(8))|0);
 var $90=(($oldmem+$_sum24)|0);
 var $91=$18&1;
 var $92=$91|$14;
 var $93=$92|2;
 HEAP32[(($17)>>2)]=$93;
 var $_sum25_i25=$14|4;
 var $_sum26=((($_sum25_i25)-(8))|0);
 var $94=(($oldmem+$_sum26)|0);
 var $95=$94;
 var $96=$85|1;
 HEAP32[(($95)>>2)]=$96;
 var $97=$90;
 HEAP32[(($97)>>2)]=$85;
 var $_sum27=((($82)-(4))|0);
 var $98=(($oldmem+$_sum27)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=$100&-2;
 HEAP32[(($99)>>2)]=$101;
 var $storemerge_i=$89;var $storemerge27_i=$85;label=24;break;
 case 23: 
 var $103=$18&1;
 var $104=$103|$82;
 var $105=$104|2;
 HEAP32[(($17)>>2)]=$105;
 var $_sum22=((($82)-(4))|0);
 var $106=(($oldmem+$_sum22)|0);
 var $107=$106;
 var $108=HEAP32[(($107)>>2)];
 var $109=$108|1;
 HEAP32[(($107)>>2)]=$109;
 var $storemerge_i=0;var $storemerge27_i=0;label=24;break;
 case 24: 
 var $storemerge27_i;
 var $storemerge_i;
 HEAP32[((1816)>>2)]=$storemerge27_i;
 HEAP32[((1828)>>2)]=$storemerge_i;
 label=77;break;
 case 25: 
 var $112=$31&2;
 var $113=($112|0)==0;
 if($113){label=26;break;}else{label=78;break;}
 case 26: 
 var $115=$31&-8;
 var $116=((($115)+($19))|0);
 var $117=($116>>>0)<($14>>>0);
 if($117){label=78;break;}else{label=27;break;}
 case 27: 
 var $119=((($116)-($14))|0);
 var $120=$31>>>3;
 var $121=($31>>>0)<256;
 if($121){label=28;break;}else{label=40;break;}
 case 28: 
 var $123=(($oldmem+$19)|0);
 var $124=$123;
 var $125=HEAP32[(($124)>>2)];
 var $126=(($oldmem+$_sum3334_i)|0);
 var $127=$126;
 var $128=HEAP32[(($127)>>2)];
 var $129=$120<<1;
 var $130=((1848+($129<<2))|0);
 var $131=$130;
 var $132=($125|0)==($131|0);
 if($132){label=31;break;}else{label=29;break;}
 case 29: 
 var $134=$125;
 var $135=($134>>>0)<($22>>>0);
 if($135){label=39;break;}else{label=30;break;}
 case 30: 
 var $137=(($125+12)|0);
 var $138=HEAP32[(($137)>>2)];
 var $139=($138|0)==($21|0);
 if($139){label=31;break;}else{label=39;break;}
 case 31: 
 var $140=($128|0)==($125|0);
 if($140){label=32;break;}else{label=33;break;}
 case 32: 
 var $142=1<<$120;
 var $143=$142^-1;
 var $144=HEAP32[((1808)>>2)];
 var $145=$144&$143;
 HEAP32[((1808)>>2)]=$145;
 label=73;break;
 case 33: 
 var $147=($128|0)==($131|0);
 if($147){label=34;break;}else{label=35;break;}
 case 34: 
 var $_pre_i=(($128+8)|0);
 var $_pre_phi_i=$_pre_i;label=37;break;
 case 35: 
 var $149=$128;
 var $150=($149>>>0)<($22>>>0);
 if($150){label=38;break;}else{label=36;break;}
 case 36: 
 var $152=(($128+8)|0);
 var $153=HEAP32[(($152)>>2)];
 var $154=($153|0)==($21|0);
 if($154){var $_pre_phi_i=$152;label=37;break;}else{label=38;break;}
 case 37: 
 var $_pre_phi_i;
 var $155=(($125+12)|0);
 HEAP32[(($155)>>2)]=$128;
 HEAP32[(($_pre_phi_i)>>2)]=$125;
 label=73;break;
 case 38: 
 _abort();
 throw "Reached an unreachable!";
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $157=$20;
 var $_sum5=((($19)+(16))|0);
 var $158=(($oldmem+$_sum5)|0);
 var $159=$158;
 var $160=HEAP32[(($159)>>2)];
 var $161=(($oldmem+$_sum3334_i)|0);
 var $162=$161;
 var $163=HEAP32[(($162)>>2)];
 var $164=($163|0)==($157|0);
 if($164){label=46;break;}else{label=41;break;}
 case 41: 
 var $166=(($oldmem+$19)|0);
 var $167=$166;
 var $168=HEAP32[(($167)>>2)];
 var $169=$168;
 var $170=($169>>>0)<($22>>>0);
 if($170){label=45;break;}else{label=42;break;}
 case 42: 
 var $172=(($168+12)|0);
 var $173=HEAP32[(($172)>>2)];
 var $174=($173|0)==($157|0);
 if($174){label=43;break;}else{label=45;break;}
 case 43: 
 var $176=(($163+8)|0);
 var $177=HEAP32[(($176)>>2)];
 var $178=($177|0)==($157|0);
 if($178){label=44;break;}else{label=45;break;}
 case 44: 
 HEAP32[(($172)>>2)]=$163;
 HEAP32[(($176)>>2)]=$168;
 var $R_1_i=$163;label=53;break;
 case 45: 
 _abort();
 throw "Reached an unreachable!";
 case 46: 
 var $_sum17=((($19)+(12))|0);
 var $181=(($oldmem+$_sum17)|0);
 var $182=$181;
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=47;break;}else{var $R_0_i=$183;var $RP_0_i=$182;label=48;break;}
 case 47: 
 var $_sum18=((($19)+(8))|0);
 var $186=(($oldmem+$_sum18)|0);
 var $187=$186;
 var $188=HEAP32[(($187)>>2)];
 var $189=($188|0)==0;
 if($189){var $R_1_i=0;label=53;break;}else{var $R_0_i=$188;var $RP_0_i=$187;label=48;break;}
 case 48: 
 var $RP_0_i;
 var $R_0_i;
 var $190=(($R_0_i+20)|0);
 var $191=HEAP32[(($190)>>2)];
 var $192=($191|0)==0;
 if($192){label=49;break;}else{var $R_0_i=$191;var $RP_0_i=$190;label=48;break;}
 case 49: 
 var $194=(($R_0_i+16)|0);
 var $195=HEAP32[(($194)>>2)];
 var $196=($195|0)==0;
 if($196){label=50;break;}else{var $R_0_i=$195;var $RP_0_i=$194;label=48;break;}
 case 50: 
 var $198=$RP_0_i;
 var $199=($198>>>0)<($22>>>0);
 if($199){label=52;break;}else{label=51;break;}
 case 51: 
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=53;break;
 case 52: 
 _abort();
 throw "Reached an unreachable!";
 case 53: 
 var $R_1_i;
 var $203=($160|0)==0;
 if($203){label=73;break;}else{label=54;break;}
 case 54: 
 var $_sum9=((($19)+(20))|0);
 var $205=(($oldmem+$_sum9)|0);
 var $206=$205;
 var $207=HEAP32[(($206)>>2)];
 var $208=((2112+($207<<2))|0);
 var $209=HEAP32[(($208)>>2)];
 var $210=($157|0)==($209|0);
 if($210){label=55;break;}else{label=57;break;}
 case 55: 
 HEAP32[(($208)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=56;break;}else{label=63;break;}
 case 56: 
 var $212=HEAP32[(($206)>>2)];
 var $213=1<<$212;
 var $214=$213^-1;
 var $215=HEAP32[((1812)>>2)];
 var $216=$215&$214;
 HEAP32[((1812)>>2)]=$216;
 label=73;break;
 case 57: 
 var $218=$160;
 var $219=HEAP32[((1824)>>2)];
 var $220=($218>>>0)<($219>>>0);
 if($220){label=61;break;}else{label=58;break;}
 case 58: 
 var $222=(($160+16)|0);
 var $223=HEAP32[(($222)>>2)];
 var $224=($223|0)==($157|0);
 if($224){label=59;break;}else{label=60;break;}
 case 59: 
 HEAP32[(($222)>>2)]=$R_1_i;
 label=62;break;
 case 60: 
 var $227=(($160+20)|0);
 HEAP32[(($227)>>2)]=$R_1_i;
 label=62;break;
 case 61: 
 _abort();
 throw "Reached an unreachable!";
 case 62: 
 var $230=($R_1_i|0)==0;
 if($230){label=73;break;}else{label=63;break;}
 case 63: 
 var $232=$R_1_i;
 var $233=HEAP32[((1824)>>2)];
 var $234=($232>>>0)<($233>>>0);
 if($234){label=72;break;}else{label=64;break;}
 case 64: 
 var $236=(($R_1_i+24)|0);
 HEAP32[(($236)>>2)]=$160;
 var $_sum10=((($19)+(8))|0);
 var $237=(($oldmem+$_sum10)|0);
 var $238=$237;
 var $239=HEAP32[(($238)>>2)];
 var $240=($239|0)==0;
 if($240){label=68;break;}else{label=65;break;}
 case 65: 
 var $242=$239;
 var $243=HEAP32[((1824)>>2)];
 var $244=($242>>>0)<($243>>>0);
 if($244){label=67;break;}else{label=66;break;}
 case 66: 
 var $246=(($R_1_i+16)|0);
 HEAP32[(($246)>>2)]=$239;
 var $247=(($239+24)|0);
 HEAP32[(($247)>>2)]=$R_1_i;
 label=68;break;
 case 67: 
 _abort();
 throw "Reached an unreachable!";
 case 68: 
 var $_sum11=((($19)+(12))|0);
 var $250=(($oldmem+$_sum11)|0);
 var $251=$250;
 var $252=HEAP32[(($251)>>2)];
 var $253=($252|0)==0;
 if($253){label=73;break;}else{label=69;break;}
 case 69: 
 var $255=$252;
 var $256=HEAP32[((1824)>>2)];
 var $257=($255>>>0)<($256>>>0);
 if($257){label=71;break;}else{label=70;break;}
 case 70: 
 var $259=(($R_1_i+20)|0);
 HEAP32[(($259)>>2)]=$252;
 var $260=(($252+24)|0);
 HEAP32[(($260)>>2)]=$R_1_i;
 label=73;break;
 case 71: 
 _abort();
 throw "Reached an unreachable!";
 case 72: 
 _abort();
 throw "Reached an unreachable!";
 case 73: 
 var $264=($119>>>0)<16;
 if($264){label=74;break;}else{label=75;break;}
 case 74: 
 var $265=HEAP32[(($17)>>2)];
 var $266=$265&1;
 var $267=$116|$266;
 var $268=$267|2;
 HEAP32[(($17)>>2)]=$268;
 var $_sum910_i=$116|4;
 var $_sum16=((($_sum910_i)-(8))|0);
 var $269=(($oldmem+$_sum16)|0);
 var $270=$269;
 var $271=HEAP32[(($270)>>2)];
 var $272=$271|1;
 HEAP32[(($270)>>2)]=$272;
 var $mem_0=$oldmem;label=80;break;
 case 75: 
 var $_sum12=((($14)-(8))|0);
 var $274=(($oldmem+$_sum12)|0);
 var $275=$274;
 var $276=HEAP32[(($17)>>2)];
 var $277=$276&1;
 var $278=$277|$14;
 var $279=$278|2;
 HEAP32[(($17)>>2)]=$279;
 var $_sum5_i13=$14|4;
 var $_sum14=((($_sum5_i13)-(8))|0);
 var $280=(($oldmem+$_sum14)|0);
 var $281=$280;
 var $282=$119|3;
 HEAP32[(($281)>>2)]=$282;
 var $_sum78_i=$116|4;
 var $_sum15=((($_sum78_i)-(8))|0);
 var $283=(($oldmem+$_sum15)|0);
 var $284=$283;
 var $285=HEAP32[(($284)>>2)];
 var $286=$285|1;
 HEAP32[(($284)>>2)]=$286;
 _dispose_chunk($275,$119);
 label=77;break;
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $_old=($15|0)==0;
 if($_old){label=78;break;}else{var $mem_0=$oldmem;label=80;break;}
 case 78: 
 var $287=_malloc($bytes);
 var $288=($287|0)==0;
 if($288){var $mem_0=0;label=80;break;}else{label=79;break;}
 case 79: 
 var $290=HEAP32[(($17)>>2)];
 var $291=$290&-8;
 var $292=$290&3;
 var $293=($292|0)==0;
 var $294=($293?8:4);
 var $295=((($291)-($294))|0);
 var $296=($295>>>0)<($bytes>>>0);
 var $297=($296?$295:$bytes);
 assert($297 % 1 === 0);(_memcpy($287, $oldmem, $297)|0);
 _free($oldmem);
 var $mem_0=$287;label=80;break;
 case 80: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_realloc"] = _realloc;
function _dispose_chunk($p,$psize){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$p;
 var $2=(($1+$psize)|0);
 var $3=$2;
 var $4=(($p+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=$5&1;
 var $7=($6|0)==0;
 if($7){label=2;break;}else{var $_0=$p;var $_0277=$psize;label=54;break;}
 case 2: 
 var $9=(($p)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$5&3;
 var $12=($11|0)==0;
 if($12){label=134;break;}else{label=3;break;}
 case 3: 
 var $14=(((-$10))|0);
 var $15=(($1+$14)|0);
 var $16=$15;
 var $17=((($10)+($psize))|0);
 var $18=HEAP32[((1824)>>2)];
 var $19=($15>>>0)<($18>>>0);
 if($19){label=53;break;}else{label=4;break;}
 case 4: 
 var $21=HEAP32[((1828)>>2)];
 var $22=($16|0)==($21|0);
 if($22){label=51;break;}else{label=5;break;}
 case 5: 
 var $24=$10>>>3;
 var $25=($10>>>0)<256;
 if($25){label=6;break;}else{label=18;break;}
 case 6: 
 var $_sum35=(((8)-($10))|0);
 var $27=(($1+$_sum35)|0);
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $_sum36=(((12)-($10))|0);
 var $30=(($1+$_sum36)|0);
 var $31=$30;
 var $32=HEAP32[(($31)>>2)];
 var $33=$24<<1;
 var $34=((1848+($33<<2))|0);
 var $35=$34;
 var $36=($29|0)==($35|0);
 if($36){label=9;break;}else{label=7;break;}
 case 7: 
 var $38=$29;
 var $39=($38>>>0)<($18>>>0);
 if($39){label=17;break;}else{label=8;break;}
 case 8: 
 var $41=(($29+12)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=($42|0)==($16|0);
 if($43){label=9;break;}else{label=17;break;}
 case 9: 
 var $44=($32|0)==($29|0);
 if($44){label=10;break;}else{label=11;break;}
 case 10: 
 var $46=1<<$24;
 var $47=$46^-1;
 var $48=HEAP32[((1808)>>2)];
 var $49=$48&$47;
 HEAP32[((1808)>>2)]=$49;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 11: 
 var $51=($32|0)==($35|0);
 if($51){label=12;break;}else{label=13;break;}
 case 12: 
 var $_pre62=(($32+8)|0);
 var $_pre_phi63=$_pre62;label=15;break;
 case 13: 
 var $53=$32;
 var $54=($53>>>0)<($18>>>0);
 if($54){label=16;break;}else{label=14;break;}
 case 14: 
 var $56=(($32+8)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=($57|0)==($16|0);
 if($58){var $_pre_phi63=$56;label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre_phi63;
 var $59=(($29+12)|0);
 HEAP32[(($59)>>2)]=$32;
 HEAP32[(($_pre_phi63)>>2)]=$29;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 16: 
 _abort();
 throw "Reached an unreachable!";
 case 17: 
 _abort();
 throw "Reached an unreachable!";
 case 18: 
 var $61=$15;
 var $_sum26=(((24)-($10))|0);
 var $62=(($1+$_sum26)|0);
 var $63=$62;
 var $64=HEAP32[(($63)>>2)];
 var $_sum27=(((12)-($10))|0);
 var $65=(($1+$_sum27)|0);
 var $66=$65;
 var $67=HEAP32[(($66)>>2)];
 var $68=($67|0)==($61|0);
 if($68){label=24;break;}else{label=19;break;}
 case 19: 
 var $_sum33=(((8)-($10))|0);
 var $70=(($1+$_sum33)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $73=$72;
 var $74=($73>>>0)<($18>>>0);
 if($74){label=23;break;}else{label=20;break;}
 case 20: 
 var $76=(($72+12)|0);
 var $77=HEAP32[(($76)>>2)];
 var $78=($77|0)==($61|0);
 if($78){label=21;break;}else{label=23;break;}
 case 21: 
 var $80=(($67+8)|0);
 var $81=HEAP32[(($80)>>2)];
 var $82=($81|0)==($61|0);
 if($82){label=22;break;}else{label=23;break;}
 case 22: 
 HEAP32[(($76)>>2)]=$67;
 HEAP32[(($80)>>2)]=$72;
 var $R_1=$67;label=31;break;
 case 23: 
 _abort();
 throw "Reached an unreachable!";
 case 24: 
 var $_sum28=(((16)-($10))|0);
 var $_sum29=((($_sum28)+(4))|0);
 var $85=(($1+$_sum29)|0);
 var $86=$85;
 var $87=HEAP32[(($86)>>2)];
 var $88=($87|0)==0;
 if($88){label=25;break;}else{var $R_0=$87;var $RP_0=$86;label=26;break;}
 case 25: 
 var $90=(($1+$_sum28)|0);
 var $91=$90;
 var $92=HEAP32[(($91)>>2)];
 var $93=($92|0)==0;
 if($93){var $R_1=0;label=31;break;}else{var $R_0=$92;var $RP_0=$91;label=26;break;}
 case 26: 
 var $RP_0;
 var $R_0;
 var $94=(($R_0+20)|0);
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=27;break;}else{var $R_0=$95;var $RP_0=$94;label=26;break;}
 case 27: 
 var $98=(($R_0+16)|0);
 var $99=HEAP32[(($98)>>2)];
 var $100=($99|0)==0;
 if($100){label=28;break;}else{var $R_0=$99;var $RP_0=$98;label=26;break;}
 case 28: 
 var $102=$RP_0;
 var $103=($102>>>0)<($18>>>0);
 if($103){label=30;break;}else{label=29;break;}
 case 29: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=31;break;
 case 30: 
 _abort();
 throw "Reached an unreachable!";
 case 31: 
 var $R_1;
 var $107=($64|0)==0;
 if($107){var $_0=$16;var $_0277=$17;label=54;break;}else{label=32;break;}
 case 32: 
 var $_sum30=(((28)-($10))|0);
 var $109=(($1+$_sum30)|0);
 var $110=$109;
 var $111=HEAP32[(($110)>>2)];
 var $112=((2112+($111<<2))|0);
 var $113=HEAP32[(($112)>>2)];
 var $114=($61|0)==($113|0);
 if($114){label=33;break;}else{label=35;break;}
 case 33: 
 HEAP32[(($112)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=34;break;}else{label=41;break;}
 case 34: 
 var $116=HEAP32[(($110)>>2)];
 var $117=1<<$116;
 var $118=$117^-1;
 var $119=HEAP32[((1812)>>2)];
 var $120=$119&$118;
 HEAP32[((1812)>>2)]=$120;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 35: 
 var $122=$64;
 var $123=HEAP32[((1824)>>2)];
 var $124=($122>>>0)<($123>>>0);
 if($124){label=39;break;}else{label=36;break;}
 case 36: 
 var $126=(($64+16)|0);
 var $127=HEAP32[(($126)>>2)];
 var $128=($127|0)==($61|0);
 if($128){label=37;break;}else{label=38;break;}
 case 37: 
 HEAP32[(($126)>>2)]=$R_1;
 label=40;break;
 case 38: 
 var $131=(($64+20)|0);
 HEAP32[(($131)>>2)]=$R_1;
 label=40;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $134=($R_1|0)==0;
 if($134){var $_0=$16;var $_0277=$17;label=54;break;}else{label=41;break;}
 case 41: 
 var $136=$R_1;
 var $137=HEAP32[((1824)>>2)];
 var $138=($136>>>0)<($137>>>0);
 if($138){label=50;break;}else{label=42;break;}
 case 42: 
 var $140=(($R_1+24)|0);
 HEAP32[(($140)>>2)]=$64;
 var $_sum31=(((16)-($10))|0);
 var $141=(($1+$_sum31)|0);
 var $142=$141;
 var $143=HEAP32[(($142)>>2)];
 var $144=($143|0)==0;
 if($144){label=46;break;}else{label=43;break;}
 case 43: 
 var $146=$143;
 var $147=HEAP32[((1824)>>2)];
 var $148=($146>>>0)<($147>>>0);
 if($148){label=45;break;}else{label=44;break;}
 case 44: 
 var $150=(($R_1+16)|0);
 HEAP32[(($150)>>2)]=$143;
 var $151=(($143+24)|0);
 HEAP32[(($151)>>2)]=$R_1;
 label=46;break;
 case 45: 
 _abort();
 throw "Reached an unreachable!";
 case 46: 
 var $_sum32=((($_sum31)+(4))|0);
 var $154=(($1+$_sum32)|0);
 var $155=$154;
 var $156=HEAP32[(($155)>>2)];
 var $157=($156|0)==0;
 if($157){var $_0=$16;var $_0277=$17;label=54;break;}else{label=47;break;}
 case 47: 
 var $159=$156;
 var $160=HEAP32[((1824)>>2)];
 var $161=($159>>>0)<($160>>>0);
 if($161){label=49;break;}else{label=48;break;}
 case 48: 
 var $163=(($R_1+20)|0);
 HEAP32[(($163)>>2)]=$156;
 var $164=(($156+24)|0);
 HEAP32[(($164)>>2)]=$R_1;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 49: 
 _abort();
 throw "Reached an unreachable!";
 case 50: 
 _abort();
 throw "Reached an unreachable!";
 case 51: 
 var $_sum=((($psize)+(4))|0);
 var $168=(($1+$_sum)|0);
 var $169=$168;
 var $170=HEAP32[(($169)>>2)];
 var $171=$170&3;
 var $172=($171|0)==3;
 if($172){label=52;break;}else{var $_0=$16;var $_0277=$17;label=54;break;}
 case 52: 
 HEAP32[((1816)>>2)]=$17;
 var $174=HEAP32[(($169)>>2)];
 var $175=$174&-2;
 HEAP32[(($169)>>2)]=$175;
 var $176=$17|1;
 var $_sum24=(((4)-($10))|0);
 var $177=(($1+$_sum24)|0);
 var $178=$177;
 HEAP32[(($178)>>2)]=$176;
 var $179=$2;
 HEAP32[(($179)>>2)]=$17;
 label=134;break;
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_0277;
 var $_0;
 var $181=HEAP32[((1824)>>2)];
 var $182=($2>>>0)<($181>>>0);
 if($182){label=133;break;}else{label=55;break;}
 case 55: 
 var $_sum1=((($psize)+(4))|0);
 var $184=(($1+$_sum1)|0);
 var $185=$184;
 var $186=HEAP32[(($185)>>2)];
 var $187=$186&2;
 var $188=($187|0)==0;
 if($188){label=56;break;}else{label=109;break;}
 case 56: 
 var $190=HEAP32[((1832)>>2)];
 var $191=($3|0)==($190|0);
 if($191){label=57;break;}else{label=59;break;}
 case 57: 
 var $193=HEAP32[((1820)>>2)];
 var $194=((($193)+($_0277))|0);
 HEAP32[((1820)>>2)]=$194;
 HEAP32[((1832)>>2)]=$_0;
 var $195=$194|1;
 var $196=(($_0+4)|0);
 HEAP32[(($196)>>2)]=$195;
 var $197=HEAP32[((1828)>>2)];
 var $198=($_0|0)==($197|0);
 if($198){label=58;break;}else{label=134;break;}
 case 58: 
 HEAP32[((1828)>>2)]=0;
 HEAP32[((1816)>>2)]=0;
 label=134;break;
 case 59: 
 var $201=HEAP32[((1828)>>2)];
 var $202=($3|0)==($201|0);
 if($202){label=60;break;}else{label=61;break;}
 case 60: 
 var $204=HEAP32[((1816)>>2)];
 var $205=((($204)+($_0277))|0);
 HEAP32[((1816)>>2)]=$205;
 HEAP32[((1828)>>2)]=$_0;
 var $206=$205|1;
 var $207=(($_0+4)|0);
 HEAP32[(($207)>>2)]=$206;
 var $208=$_0;
 var $209=(($208+$205)|0);
 var $210=$209;
 HEAP32[(($210)>>2)]=$205;
 label=134;break;
 case 61: 
 var $212=$186&-8;
 var $213=((($212)+($_0277))|0);
 var $214=$186>>>3;
 var $215=($186>>>0)<256;
 if($215){label=62;break;}else{label=74;break;}
 case 62: 
 var $_sum20=((($psize)+(8))|0);
 var $217=(($1+$_sum20)|0);
 var $218=$217;
 var $219=HEAP32[(($218)>>2)];
 var $_sum21=((($psize)+(12))|0);
 var $220=(($1+$_sum21)|0);
 var $221=$220;
 var $222=HEAP32[(($221)>>2)];
 var $223=$214<<1;
 var $224=((1848+($223<<2))|0);
 var $225=$224;
 var $226=($219|0)==($225|0);
 if($226){label=65;break;}else{label=63;break;}
 case 63: 
 var $228=$219;
 var $229=($228>>>0)<($181>>>0);
 if($229){label=73;break;}else{label=64;break;}
 case 64: 
 var $231=(($219+12)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==($3|0);
 if($233){label=65;break;}else{label=73;break;}
 case 65: 
 var $234=($222|0)==($219|0);
 if($234){label=66;break;}else{label=67;break;}
 case 66: 
 var $236=1<<$214;
 var $237=$236^-1;
 var $238=HEAP32[((1808)>>2)];
 var $239=$238&$237;
 HEAP32[((1808)>>2)]=$239;
 label=107;break;
 case 67: 
 var $241=($222|0)==($225|0);
 if($241){label=68;break;}else{label=69;break;}
 case 68: 
 var $_pre60=(($222+8)|0);
 var $_pre_phi61=$_pre60;label=71;break;
 case 69: 
 var $243=$222;
 var $244=($243>>>0)<($181>>>0);
 if($244){label=72;break;}else{label=70;break;}
 case 70: 
 var $246=(($222+8)|0);
 var $247=HEAP32[(($246)>>2)];
 var $248=($247|0)==($3|0);
 if($248){var $_pre_phi61=$246;label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre_phi61;
 var $249=(($219+12)|0);
 HEAP32[(($249)>>2)]=$222;
 HEAP32[(($_pre_phi61)>>2)]=$219;
 label=107;break;
 case 72: 
 _abort();
 throw "Reached an unreachable!";
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $251=$2;
 var $_sum2=((($psize)+(24))|0);
 var $252=(($1+$_sum2)|0);
 var $253=$252;
 var $254=HEAP32[(($253)>>2)];
 var $_sum3=((($psize)+(12))|0);
 var $255=(($1+$_sum3)|0);
 var $256=$255;
 var $257=HEAP32[(($256)>>2)];
 var $258=($257|0)==($251|0);
 if($258){label=80;break;}else{label=75;break;}
 case 75: 
 var $_sum18=((($psize)+(8))|0);
 var $260=(($1+$_sum18)|0);
 var $261=$260;
 var $262=HEAP32[(($261)>>2)];
 var $263=$262;
 var $264=($263>>>0)<($181>>>0);
 if($264){label=79;break;}else{label=76;break;}
 case 76: 
 var $266=(($262+12)|0);
 var $267=HEAP32[(($266)>>2)];
 var $268=($267|0)==($251|0);
 if($268){label=77;break;}else{label=79;break;}
 case 77: 
 var $270=(($257+8)|0);
 var $271=HEAP32[(($270)>>2)];
 var $272=($271|0)==($251|0);
 if($272){label=78;break;}else{label=79;break;}
 case 78: 
 HEAP32[(($266)>>2)]=$257;
 HEAP32[(($270)>>2)]=$262;
 var $R7_1=$257;label=87;break;
 case 79: 
 _abort();
 throw "Reached an unreachable!";
 case 80: 
 var $_sum5=((($psize)+(20))|0);
 var $275=(($1+$_sum5)|0);
 var $276=$275;
 var $277=HEAP32[(($276)>>2)];
 var $278=($277|0)==0;
 if($278){label=81;break;}else{var $R7_0=$277;var $RP9_0=$276;label=82;break;}
 case 81: 
 var $_sum4=((($psize)+(16))|0);
 var $280=(($1+$_sum4)|0);
 var $281=$280;
 var $282=HEAP32[(($281)>>2)];
 var $283=($282|0)==0;
 if($283){var $R7_1=0;label=87;break;}else{var $R7_0=$282;var $RP9_0=$281;label=82;break;}
 case 82: 
 var $RP9_0;
 var $R7_0;
 var $284=(($R7_0+20)|0);
 var $285=HEAP32[(($284)>>2)];
 var $286=($285|0)==0;
 if($286){label=83;break;}else{var $R7_0=$285;var $RP9_0=$284;label=82;break;}
 case 83: 
 var $288=(($R7_0+16)|0);
 var $289=HEAP32[(($288)>>2)];
 var $290=($289|0)==0;
 if($290){label=84;break;}else{var $R7_0=$289;var $RP9_0=$288;label=82;break;}
 case 84: 
 var $292=$RP9_0;
 var $293=($292>>>0)<($181>>>0);
 if($293){label=86;break;}else{label=85;break;}
 case 85: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=87;break;
 case 86: 
 _abort();
 throw "Reached an unreachable!";
 case 87: 
 var $R7_1;
 var $297=($254|0)==0;
 if($297){label=107;break;}else{label=88;break;}
 case 88: 
 var $_sum15=((($psize)+(28))|0);
 var $299=(($1+$_sum15)|0);
 var $300=$299;
 var $301=HEAP32[(($300)>>2)];
 var $302=((2112+($301<<2))|0);
 var $303=HEAP32[(($302)>>2)];
 var $304=($251|0)==($303|0);
 if($304){label=89;break;}else{label=91;break;}
 case 89: 
 HEAP32[(($302)>>2)]=$R7_1;
 var $cond53=($R7_1|0)==0;
 if($cond53){label=90;break;}else{label=97;break;}
 case 90: 
 var $306=HEAP32[(($300)>>2)];
 var $307=1<<$306;
 var $308=$307^-1;
 var $309=HEAP32[((1812)>>2)];
 var $310=$309&$308;
 HEAP32[((1812)>>2)]=$310;
 label=107;break;
 case 91: 
 var $312=$254;
 var $313=HEAP32[((1824)>>2)];
 var $314=($312>>>0)<($313>>>0);
 if($314){label=95;break;}else{label=92;break;}
 case 92: 
 var $316=(($254+16)|0);
 var $317=HEAP32[(($316)>>2)];
 var $318=($317|0)==($251|0);
 if($318){label=93;break;}else{label=94;break;}
 case 93: 
 HEAP32[(($316)>>2)]=$R7_1;
 label=96;break;
 case 94: 
 var $321=(($254+20)|0);
 HEAP32[(($321)>>2)]=$R7_1;
 label=96;break;
 case 95: 
 _abort();
 throw "Reached an unreachable!";
 case 96: 
 var $324=($R7_1|0)==0;
 if($324){label=107;break;}else{label=97;break;}
 case 97: 
 var $326=$R7_1;
 var $327=HEAP32[((1824)>>2)];
 var $328=($326>>>0)<($327>>>0);
 if($328){label=106;break;}else{label=98;break;}
 case 98: 
 var $330=(($R7_1+24)|0);
 HEAP32[(($330)>>2)]=$254;
 var $_sum16=((($psize)+(16))|0);
 var $331=(($1+$_sum16)|0);
 var $332=$331;
 var $333=HEAP32[(($332)>>2)];
 var $334=($333|0)==0;
 if($334){label=102;break;}else{label=99;break;}
 case 99: 
 var $336=$333;
 var $337=HEAP32[((1824)>>2)];
 var $338=($336>>>0)<($337>>>0);
 if($338){label=101;break;}else{label=100;break;}
 case 100: 
 var $340=(($R7_1+16)|0);
 HEAP32[(($340)>>2)]=$333;
 var $341=(($333+24)|0);
 HEAP32[(($341)>>2)]=$R7_1;
 label=102;break;
 case 101: 
 _abort();
 throw "Reached an unreachable!";
 case 102: 
 var $_sum17=((($psize)+(20))|0);
 var $344=(($1+$_sum17)|0);
 var $345=$344;
 var $346=HEAP32[(($345)>>2)];
 var $347=($346|0)==0;
 if($347){label=107;break;}else{label=103;break;}
 case 103: 
 var $349=$346;
 var $350=HEAP32[((1824)>>2)];
 var $351=($349>>>0)<($350>>>0);
 if($351){label=105;break;}else{label=104;break;}
 case 104: 
 var $353=(($R7_1+20)|0);
 HEAP32[(($353)>>2)]=$346;
 var $354=(($346+24)|0);
 HEAP32[(($354)>>2)]=$R7_1;
 label=107;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 _abort();
 throw "Reached an unreachable!";
 case 107: 
 var $358=$213|1;
 var $359=(($_0+4)|0);
 HEAP32[(($359)>>2)]=$358;
 var $360=$_0;
 var $361=(($360+$213)|0);
 var $362=$361;
 HEAP32[(($362)>>2)]=$213;
 var $363=HEAP32[((1828)>>2)];
 var $364=($_0|0)==($363|0);
 if($364){label=108;break;}else{var $_1=$213;label=110;break;}
 case 108: 
 HEAP32[((1816)>>2)]=$213;
 label=134;break;
 case 109: 
 var $367=$186&-2;
 HEAP32[(($185)>>2)]=$367;
 var $368=$_0277|1;
 var $369=(($_0+4)|0);
 HEAP32[(($369)>>2)]=$368;
 var $370=$_0;
 var $371=(($370+$_0277)|0);
 var $372=$371;
 HEAP32[(($372)>>2)]=$_0277;
 var $_1=$_0277;label=110;break;
 case 110: 
 var $_1;
 var $374=$_1>>>3;
 var $375=($_1>>>0)<256;
 if($375){label=111;break;}else{label=116;break;}
 case 111: 
 var $377=$374<<1;
 var $378=((1848+($377<<2))|0);
 var $379=$378;
 var $380=HEAP32[((1808)>>2)];
 var $381=1<<$374;
 var $382=$380&$381;
 var $383=($382|0)==0;
 if($383){label=112;break;}else{label=113;break;}
 case 112: 
 var $385=$380|$381;
 HEAP32[((1808)>>2)]=$385;
 var $_sum13_pre=((($377)+(2))|0);
 var $_pre=((1848+($_sum13_pre<<2))|0);
 var $F16_0=$379;var $_pre_phi=$_pre;label=115;break;
 case 113: 
 var $_sum14=((($377)+(2))|0);
 var $387=((1848+($_sum14<<2))|0);
 var $388=HEAP32[(($387)>>2)];
 var $389=$388;
 var $390=HEAP32[((1824)>>2)];
 var $391=($389>>>0)<($390>>>0);
 if($391){label=114;break;}else{var $F16_0=$388;var $_pre_phi=$387;label=115;break;}
 case 114: 
 _abort();
 throw "Reached an unreachable!";
 case 115: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$_0;
 var $394=(($F16_0+12)|0);
 HEAP32[(($394)>>2)]=$_0;
 var $395=(($_0+8)|0);
 HEAP32[(($395)>>2)]=$F16_0;
 var $396=(($_0+12)|0);
 HEAP32[(($396)>>2)]=$379;
 label=134;break;
 case 116: 
 var $398=$_0;
 var $399=$_1>>>8;
 var $400=($399|0)==0;
 if($400){var $I19_0=0;label=119;break;}else{label=117;break;}
 case 117: 
 var $402=($_1>>>0)>16777215;
 if($402){var $I19_0=31;label=119;break;}else{label=118;break;}
 case 118: 
 var $404=((($399)+(1048320))|0);
 var $405=$404>>>16;
 var $406=$405&8;
 var $407=$399<<$406;
 var $408=((($407)+(520192))|0);
 var $409=$408>>>16;
 var $410=$409&4;
 var $411=$410|$406;
 var $412=$407<<$410;
 var $413=((($412)+(245760))|0);
 var $414=$413>>>16;
 var $415=$414&2;
 var $416=$411|$415;
 var $417=(((14)-($416))|0);
 var $418=$412<<$415;
 var $419=$418>>>15;
 var $420=((($417)+($419))|0);
 var $421=$420<<1;
 var $422=((($420)+(7))|0);
 var $423=$_1>>>($422>>>0);
 var $424=$423&1;
 var $425=$424|$421;
 var $I19_0=$425;label=119;break;
 case 119: 
 var $I19_0;
 var $427=((2112+($I19_0<<2))|0);
 var $428=(($_0+28)|0);
 var $I19_0_c=$I19_0;
 HEAP32[(($428)>>2)]=$I19_0_c;
 var $429=(($_0+20)|0);
 HEAP32[(($429)>>2)]=0;
 var $430=(($_0+16)|0);
 HEAP32[(($430)>>2)]=0;
 var $431=HEAP32[((1812)>>2)];
 var $432=1<<$I19_0;
 var $433=$431&$432;
 var $434=($433|0)==0;
 if($434){label=120;break;}else{label=121;break;}
 case 120: 
 var $436=$431|$432;
 HEAP32[((1812)>>2)]=$436;
 HEAP32[(($427)>>2)]=$398;
 var $437=(($_0+24)|0);
 var $_c=$427;
 HEAP32[(($437)>>2)]=$_c;
 var $438=(($_0+12)|0);
 HEAP32[(($438)>>2)]=$_0;
 var $439=(($_0+8)|0);
 HEAP32[(($439)>>2)]=$_0;
 label=134;break;
 case 121: 
 var $441=HEAP32[(($427)>>2)];
 var $442=($I19_0|0)==31;
 if($442){var $447=0;label=123;break;}else{label=122;break;}
 case 122: 
 var $444=$I19_0>>>1;
 var $445=(((25)-($444))|0);
 var $447=$445;label=123;break;
 case 123: 
 var $447;
 var $448=$_1<<$447;
 var $K20_0=$448;var $T_0=$441;label=124;break;
 case 124: 
 var $T_0;
 var $K20_0;
 var $450=(($T_0+4)|0);
 var $451=HEAP32[(($450)>>2)];
 var $452=$451&-8;
 var $453=($452|0)==($_1|0);
 if($453){label=129;break;}else{label=125;break;}
 case 125: 
 var $455=$K20_0>>>31;
 var $456=(($T_0+16+($455<<2))|0);
 var $457=HEAP32[(($456)>>2)];
 var $458=($457|0)==0;
 var $459=$K20_0<<1;
 if($458){label=126;break;}else{var $K20_0=$459;var $T_0=$457;label=124;break;}
 case 126: 
 var $461=$456;
 var $462=HEAP32[((1824)>>2)];
 var $463=($461>>>0)<($462>>>0);
 if($463){label=128;break;}else{label=127;break;}
 case 127: 
 HEAP32[(($456)>>2)]=$398;
 var $465=(($_0+24)|0);
 var $T_0_c10=$T_0;
 HEAP32[(($465)>>2)]=$T_0_c10;
 var $466=(($_0+12)|0);
 HEAP32[(($466)>>2)]=$_0;
 var $467=(($_0+8)|0);
 HEAP32[(($467)>>2)]=$_0;
 label=134;break;
 case 128: 
 _abort();
 throw "Reached an unreachable!";
 case 129: 
 var $470=(($T_0+8)|0);
 var $471=HEAP32[(($470)>>2)];
 var $472=$T_0;
 var $473=HEAP32[((1824)>>2)];
 var $474=($472>>>0)<($473>>>0);
 if($474){label=132;break;}else{label=130;break;}
 case 130: 
 var $476=$471;
 var $477=($476>>>0)<($473>>>0);
 if($477){label=132;break;}else{label=131;break;}
 case 131: 
 var $479=(($471+12)|0);
 HEAP32[(($479)>>2)]=$398;
 HEAP32[(($470)>>2)]=$398;
 var $480=(($_0+8)|0);
 var $_c9=$471;
 HEAP32[(($480)>>2)]=$_c9;
 var $481=(($_0+12)|0);
 var $T_0_c=$T_0;
 HEAP32[(($481)>>2)]=$T_0_c;
 var $482=(($_0+24)|0);
 HEAP32[(($482)>>2)]=0;
 label=134;break;
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 _abort();
 throw "Reached an unreachable!";
 case 134: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNSt9bad_allocD0Ev($this){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function __ZNSt9bad_allocD2Ev($this){
 var label=0;
 return;
}
function __ZNKSt9bad_alloc4whatEv($this){
 var label=0;
 return 208;
}
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
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
/*global Module*/
/*global _malloc, _free, _memcpy*/
/*global FUNCTION_TABLE, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32*/
/*global readLatin1String*/
/*global __emval_register, _emval_handle_array, __emval_decref*/
/*global ___getTypeName*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */
var InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
var BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
var UnboundTypeError = Module['UnboundTypeError'] = extendError(BindingError, 'UnboundTypeError');
function throwInternalError(message) {
    throw new InternalError(message);
}
function throwBindingError(message) {
    throw new BindingError(message);
}
function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};
    function visit(type) {
        if (seen[type]) {
            return;
        }
        if (registeredTypes[type]) {
            return;
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
        }
        unboundTypes.push(type);
        seen[type] = true;
    }
    types.forEach(visit);
    throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
}
// Creates a function overload resolution table to the given method 'methodName' in the given prototype,
// if the overload table doesn't yet exist.
function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function() {
            // TODO This check can be removed in -O3 level "unsafe" optimizations.
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    }            
}
/* Registers a symbol (function, class, enum, ...) as part of the Module JS object so that
   hand-written code is able to access that symbol via 'Module.name'.
   name: The name of the symbol that's being exposed.
   value: The object itself to expose (function, class, ...)
   numArguments: For functions, specifies the number of arguments the function takes in. For other types, unused and undefined.
   To implement support for multiple overloads of a function, an 'overload selector' function is used. That selector function chooses
   the appropriate overload to call from an function overload table. This selector function is only used if multiple overloads are
   actually registered, since it carries a slight performance penalty. */
function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
            throwBindingError("Cannot register public name '" + name + "' twice");
        }
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
        }
    }
}
function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistant public symbol');
    }
    // If there's an overload table for this symbol, replace the symbol in the overload table instead.
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
    }
}
// from https://github.com/imvu/imvujs/blob/master/src/error.js
function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + '\n' +
                stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function() {
        if (this.message === undefined) {
            return this.name;
        } else {
            return this.name + ': ' + this.message;
        }
    };
    return errorClass;
}
// from https://github.com/imvu/imvujs/blob/master/src/function.js
function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    /*jshint evil:true*/
    return new Function(
        "body",
        "return function " + name + "() {\n" +
        "    \"use strict\";" +
        "    return body.apply(this, arguments);\n" +
        "};\n"
    )(body);
}
function _embind_repr(v) {
    var t = typeof v;
    if (t === 'object' || t === 'array' || t === 'function') {
        return v.toString();
    } else {
        return '' + v;
    }
}
// typeID -> { toWireType: ..., fromWireType: ... }
var registeredTypes = {};
// typeID -> [callback]
var awaitingDependencies = {};
// typeID -> [dependentTypes]
var typeDependencies = {};
// class typeID -> {pointerType: ..., constPointerType: ...}
var registeredPointers = {};
function registerType(rawType, registeredInstance) {
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        throwBindingError("Cannot register type '" + name + "' twice");
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
            cb();
        });
    }
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
    });
    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
        }
    }
    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function(dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(function() {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters);
                }
            });
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
    }
}
var __charCodes = (function() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
    }
    return codes;
})();
function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += __charCodes[HEAPU8[c++]];
    }
    return ret;
}
function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv;
}
function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i]);
    }
    return array;
}
function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
    }
    return impl;
}
function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function() {
            return undefined;
        },
        'toWireType': function(destructors, o) {
            // TODO: assert if anything else is given?
            return undefined;
        },
    });
}
function __embind_register_bool(rawType, name, trueValue, falseValue) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(wt) {
            // ambiguous emscripten ABI: sometimes return values are
            // true or false, and sometimes integers (0 or 1)
            return !!wt;
        },
        'toWireType': function(destructors, o) {
            return o ? trueValue : falseValue;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
// When converting a number from JS to C++ side, the valid range of the number is
// [minRange, maxRange], inclusive.
function __embind_register_integer(primitiveType, name, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
        maxRange = 4294967295;
    }
    registerType(primitiveType, {
        name: name,
        minRange: minRange,
        maxRange: maxRange,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following two if()s and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
            }
            return value | 0;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_float(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following if() and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            return value;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value);
            }
            function getTAElement(ta, index) {
                return ta[index];
            }
            function getStringElement(string, index) {
                return string.charCodeAt(index);
            }
            var getElement;
            if (value instanceof Uint8Array) {
                getElement = getTAElement;
            } else if (value instanceof Int8Array) {
                getElement = getTAElement;
            } else if (typeof value === 'string') {
                getElement = getStringElement;
            } else {
                throwBindingError('Cannot pass non-string to std::string');
            }
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length);
            HEAPU32[ptr >> 2] = length;
            for (var i = 0; i < length; ++i) {
                var charCode = getElement(value, i);
                if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + 4 + i] = charCode;
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        destructorFunction: function(ptr) { _free(ptr); },
    });
}
function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var HEAP, shift;
    if (charSize === 2) {
        HEAP = HEAPU16;
        shift = 1;
    } else if (charSize === 4) {
        HEAP = HEAPU32;
        shift = 2;
    }
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = (value + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            HEAPU32[ptr >> 2] = length;
            var start = (ptr + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i);
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        destructorFunction: function(ptr) { _free(ptr); },
    });
}
function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var rv = _emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv;
        },
        'toWireType': function(destructors, value) {
            return __emval_register(value);
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_memory_view(rawType, name) {
    var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,        
    ];
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var type = HEAPU32[handle >> 2];
            var size = HEAPU32[(handle >> 2) + 1]; // in elements
            var data = HEAPU32[(handle >> 2) + 2]; // byte offset into emscripten heap
            var TA = typeMapping[type];
            return new TA(HEAP8.buffer, data, size);
        },
    });
}
function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    }
}
// Function implementation of operator new, per
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
// 13.2.2
// ES3
function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError('new_ called with constructor type ' + typeof(constructor) + " which is not a function");
    }
    /*
     * Previously, the following line was just:
     function dummy() {};
     * Unfortunately, Chrome was preserving 'dummy' as the object's name, even though at creation, the 'dummy' has the
     * correct constructor name.  Thus, objects created with IMVU.new would show up in the debugger as 'dummy', which
     * isn't very helpful.  Using IMVU.createNamedFunction addresses the issue.  Doublely-unfortunately, there's no way
     * to write a test for this behavior.  -NRD 2013.02.22
     */
    var dummy = createNamedFunction(constructor.name, function(){});
    dummy.prototype = constructor.prototype;
    var obj = new dummy;
    var r = constructor.apply(obj, argumentList);
    return (r instanceof Object) ? r : obj;
}
// The path to interop from JS code to C++ code:
// (hand-written JS code) -> (autogenerated JS invoker) -> (template-generated C++ invoker) -> (target C++ function)
// craftInvokerFunction generates the JS invoker function for each function exposed to JS through embind.
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    // humanName: a human-readable string name for the function to be generated.
    // argTypes: An array that contains the embind type objects for all types in the function signature.
    //    argTypes[0] is the type object for the function return value.
    //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
    //    argTypes[2...] are the actual function parameters.
    // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
    // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
    // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
    }
    var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
    if (!isClassMethodFunc && !FUNCTION_TABLE[cppTargetFunc]) {
        throwBindingError('Global function '+humanName+' is not defined!');
    }
    // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
// TODO: This omits argument count check - enable only at -O3 or similar.
//    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
//       return FUNCTION_TABLE[fn];
//    }
    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount-2; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i;
        argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
    }
    var invokerFnBody =
        "return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n" +
        "if (arguments.length !== "+(argCount - 2)+") {\n" +
            "throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount - 2)+" args!');\n" +
        "}\n";
    // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
    // TODO: Remove this completely once all function invokers are being dynamically generated.
    var needsDestructorStack = false;
    for(var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
            needsDestructorStack = true;
            break;
        }
    }
    if (needsDestructorStack) {
        invokerFnBody +=
            "var destructors = [];\n";
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "classType", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, classType, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
    }
    for(var i = 0; i < argCount-2; ++i) {
        invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2]);
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
    }
    var returns = (argTypes[0].name !== "void");
    invokerFnBody +=
        (returns?"var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
    } else {
        for(var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
            var paramName = (i === 1 ? "thisWired" : ("arg"+(i-2)+"Wired"));
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
                args1.push(paramName+"_dtor");
                args2.push(argTypes[i].destructorFunction);
            }
        }
    }
    if (returns) {
        invokerFnBody += "return retType.fromWireType(rv);\n";
    }
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __embind_register_function(name, argCount, rawArgTypesAddr, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    exposePublicSymbol(name, function() {
        throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes);
    }, argCount - 1);
    whenDependentTypesAreResolved([], argTypes, function(argTypes) {
        var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn), argCount - 1);
        return [];
    });
}
var tupleRegistrations = {};
function __embind_register_value_array(rawType, name, rawConstructor, rawDestructor) {
    tupleRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: FUNCTION_TABLE[rawConstructor],
        rawDestructor: FUNCTION_TABLE[rawDestructor],
        elements: [],
    };
}
function __embind_register_value_array_element(
    rawTupleType,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    tupleRegistrations[rawTupleType].elements.push({
        getterReturnType: getterReturnType,
        getter: FUNCTION_TABLE[getter],
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: FUNCTION_TABLE[setter],
        setterContext: setterContext,
    });
}
function __embind_finalize_value_array(rawTupleType) {
    var reg = tupleRegistrations[rawTupleType];
    delete tupleRegistrations[rawTupleType];
    var elements = reg.elements;
    var elementsLength = elements.length;
    var elementTypes = elements.map(function(elt) { return elt.getterReturnType; }).
                concat(elements.map(function(elt) { return elt.setterArgumentType; }));
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    whenDependentTypesAreResolved([rawTupleType], elementTypes, function(elementTypes) {
        elements.forEach(function(elt, i) {
            var getterReturnType = elementTypes[i];
            var getter = elt.getter;
            var getterContext = elt.getterContext;
            var setterArgumentType = elementTypes[i + elementsLength];
            var setter = elt.setter;
            var setterContext = elt.setterContext;
            elt.read = function(ptr) {
                return getterReturnType['fromWireType'](getter(getterContext, ptr));
            };
            elt.write = function(ptr, o) {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                runDestructors(destructors);
            };
        });
        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = new Array(elementsLength);
                for (var i = 0; i < elementsLength; ++i) {
                    rv[i] = elements[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                if (elementsLength !== o.length) {
                    throw new TypeError("Incorrect number of tuple elements for " + reg.name + ": expected=" + elementsLength + ", actual=" + o.length);
                }
                var ptr = rawConstructor();
                for (var i = 0; i < elementsLength; ++i) {
                    elements[i].write(ptr, o[i]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            destructorFunction: rawDestructor,
        }];
    });
}
var structRegistrations = {};
function __embind_register_value_object(
    rawType,
    name,
    rawConstructor,
    rawDestructor
) {
    structRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: FUNCTION_TABLE[rawConstructor],
        rawDestructor: FUNCTION_TABLE[rawDestructor],
        fields: [],
    };
}
function __embind_register_value_object_field(
    structType,
    fieldName,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    structRegistrations[structType].fields.push({
        fieldName: readLatin1String(fieldName),
        getterReturnType: getterReturnType,
        getter: FUNCTION_TABLE[getter],
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: FUNCTION_TABLE[setter],
        setterContext: setterContext,
    });
}
function __embind_finalize_value_object(structType) {
    var reg = structRegistrations[structType];
    delete structRegistrations[structType];
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    var fieldRecords = reg.fields;
    var fieldTypes = fieldRecords.map(function(field) { return field.getterReturnType; }).
              concat(fieldRecords.map(function(field) { return field.setterArgumentType; }));
    whenDependentTypesAreResolved([structType], fieldTypes, function(fieldTypes) {
        var fields = {};
        fieldRecords.forEach(function(field, i) {
            var fieldName = field.fieldName;
            var getterReturnType = fieldTypes[i];
            var getter = field.getter;
            var getterContext = field.getterContext;
            var setterArgumentType = fieldTypes[i + fieldRecords.length];
            var setter = field.setter;
            var setterContext = field.setterContext;
            fields[fieldName] = {
                read: function(ptr) {
                    return getterReturnType['fromWireType'](
                        getter(getterContext, ptr));
                },
                write: function(ptr, o) {
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                    runDestructors(destructors);
                }
            };
        });
        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = {};
                for (var i in fields) {
                    rv[i] = fields[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                // todo: Here we have an opportunity for -O3 level "unsafe" optimizations:
                // assume all fields are present without checking.
                for (var fieldName in fields) {
                    if (!(fieldName in o)) {
                        throw new TypeError('Missing field');
                    }
                }
                var ptr = rawConstructor();
                for (fieldName in fields) {
                    fields[fieldName].write(ptr, o[fieldName]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            destructorFunction: rawDestructor,
        }];
    });
}
var genericPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        if (this.isSmartPointer) {
            var ptr = this.rawConstructor();
            if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
        } else {
            return 0;
        }
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
        switch (this.sharingPolicy) {
            case 0: // NONE
                // no upcasting
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
                }
                break;
            case 1: // INTRUSIVE
                ptr = handle.$$.smartPtr;
                break;
            case 2: // BY_EMVAL
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    var clonedHandle = handle['clone']();
                    ptr = this.rawShare(
                        ptr,
                        __emval_register(function() {
                            clonedHandle['delete']();
                        })
                    );
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr);
                    }
                }
                break;
            default:
                throwBindingError('Unsupporting sharing policy');
        }
    }
    return ptr;
};
// If we know a pointer type is not going to have SmartPtr logic in it, we can
// special-case optimize it a bit (compare to genericPointerToWireType)
var constNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};
// An optimized version for non-const method accesses - there we must additionally restrict that
// the pointer is not a const-pointer.
var nonConstNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};
function RegisteredPointer(
    name,
    registeredClass,
    isReference,
    isConst,
    // smart pointer properties
    isSmartPointer,
    pointeeType,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;
    // smart pointer properties
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;
    if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        }
    } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in 
        //       craftInvokerFunction altogether.
    }
}
RegisteredPointer.prototype.getPointee = function(ptr) {
    if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
    }
    return ptr;
};
RegisteredPointer.prototype.destructor = function(ptr) {
    if (this.rawDestructor) {
        this.rawDestructor(ptr);
    }
};
RegisteredPointer.prototype['fromWireType'] = function(ptr) {
    // ptr is a raw pointer (or a raw smartpointer)
    // rawPointer is a maybe-null raw pointer
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
        this.destructor(ptr);
        return null;
    }
    function makeDefaultHandle() {
        if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: rawPointer,
                smartPtrType: this,
                smartPtr: ptr,
            });
        } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this,
                ptr: ptr,
            });
        }
    }
    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
    }
    var toType;
    if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
    } else {
        toType = registeredPointerRecord.pointerType;
    }
    var dp = downcastPointer(
        rawPointer,
        this.registeredClass,
        toType.registeredClass);
    if (dp === null) {
        return makeDefaultHandle.call(this);
    }
    if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr,
        });
    } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
        });
    }
};
function makeClassHandle(prototype, record) {
    if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
    }
    record.count = { value: 1 };
    return Object.create(prototype, {
        $$: {
            value: record,
        },
    });
}
// root of all pointer and smart pointer handles in embind
function ClassHandle() {
}
function getInstanceTypeName(handle) {
    return handle.$$.ptrType.registeredClass.name;
}
ClassHandle.prototype['isAliasOf'] = function(other) {
    if (!(this instanceof ClassHandle)) {
        return false;
    }
    if (!(other instanceof ClassHandle)) {
        return false;
    }
    var leftClass = this.$$.ptrType.registeredClass;
    var left = this.$$.ptr;
    var rightClass = other.$$.ptrType.registeredClass;
    var right = other.$$.ptr;
    while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
    }
    while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
    }
    return leftClass === rightClass && left === right;
};
function throwInstanceAlreadyDeleted(obj) {
    throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
}
ClassHandle.prototype['clone'] = function() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    var clone = Object.create(Object.getPrototypeOf(this), {
        $$: {
            value: shallowCopy(this.$$),
        }
    });
    clone.$$.count.value += 1;
    return clone;
};
function runDestructor(handle) {
    var $$ = handle.$$;
    if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
    } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
    }
}
ClassHandle.prototype['delete'] = function ClassHandle_delete() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    this.$$.count.value -= 1;
    if (0 === this.$$.count.value) {
        runDestructor(this);
    }
    this.$$.smartPtr = undefined;
    this.$$.ptr = undefined;
};
var deletionQueue = [];
ClassHandle.prototype['isDeleted'] = function isDeleted() {
    return !this.$$.ptr;
};
ClassHandle.prototype['deleteLater'] = function deleteLater() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    deletionQueue.push(this);
    if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
    this.$$.deleteScheduled = true;
    return this;
};
function flushPendingDeletes() {
    while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
    }
}
Module['flushPendingDeletes'] = flushPendingDeletes;
var delayFunction;
Module['setDelayFunction'] = function setDelayFunction(fn) {
    delayFunction = fn;
    if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
};
function RegisteredClass(
    name,
    constructor,
    instancePrototype,
    rawDestructor,
    baseClass,
    getActualType,
    upcast,
    downcast
) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
}
function shallowCopy(o) {
    var rv = {};
    for (var k in o) {
        rv[k] = o[k];
    }
    return rv;
}
function __embind_register_class(
    rawType,
    rawPointerType,
    rawConstPointerType,
    baseClassRawType,
    getActualType,
    upcast,
    downcast,
    name,
    rawDestructor
) {
    name = readLatin1String(name);
    rawDestructor = FUNCTION_TABLE[rawDestructor];
    getActualType = FUNCTION_TABLE[getActualType];
    upcast = FUNCTION_TABLE[upcast];
    downcast = FUNCTION_TABLE[downcast];
    var legalFunctionName = makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
    });
    whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        function(base) {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
                baseClass = base.registeredClass;
                basePrototype = baseClass.instancePrototype;
            } else {
                basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(legalFunctionName, function() {
                if (Object.getPrototypeOf(this) !== instancePrototype) {
                    throw new BindingError("Use 'new' to construct " + name);
                }
                if (undefined === registeredClass.constructor_body) {
                    throw new BindingError(name + " has no accessible constructor");
                }
                var body = registeredClass.constructor_body[arguments.length];
                if (undefined === body) {
                    throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
                }
                return body.apply(this, arguments);
            });
            var instancePrototype = Object.create(basePrototype, {
                constructor: { value: constructor },
            });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(
                name,
                constructor,
                instancePrototype,
                rawDestructor,
                baseClass,
                getActualType,
                upcast,
                downcast);
            var referenceConverter = new RegisteredPointer(
                name,
                registeredClass,
                true,
                false,
                false);
            var pointerConverter = new RegisteredPointer(
                name + '*',
                registeredClass,
                false,
                false,
                false);
            var constPointerConverter = new RegisteredPointer(
                name + ' const*',
                registeredClass,
                false,
                true,
                false);
            registeredPointers[rawType] = {
                pointerType: pointerConverter,
                constPointerType: constPointerConverter
            };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
        }
    );
}
function __embind_register_class_constructor(
    rawClassType,
    argCount,
    rawArgTypesAddr,
    invoker,
    rawConstructor
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = FUNCTION_TABLE[invoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = 'constructor ' + classType.name;
        if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount-1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = function() {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
        };
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            classType.registeredClass.constructor_body[argCount - 1] = function() {
                if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount-1));
                }
                var destructors = [];
                var args = new Array(argCount);
                args[0] = rawConstructor;
                for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1]);
                }
                var ptr = invoker.apply(null, args);
                runDestructors(destructors);
                return argTypes[0]['fromWireType'](ptr);
            };
            return [];
        });
        return [];
    });
}
function downcastPointer(ptr, ptrClass, desiredClass) {
    if (ptrClass === desiredClass) {
        return ptr;
    }
    if (undefined === desiredClass.baseClass) {
        return null; // no conversion
    }
    // O(depth) stack space used
    return desiredClass.downcast(
        downcastPointer(ptr, ptrClass, desiredClass.baseClass));
}
function upcastPointer(ptr, ptrClass, desiredClass) {
    while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
    }
    return ptr;
}
function validateThis(this_, classType, humanName) {
    if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_);
    }
    if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name);
    }
    if (!this_.$$.ptr) {
        throwBindingError('cannot call emscripten binding method ' + humanName + ' on deleted object');
    }
    // todo: kill this
    return upcastPointer(
        this_.$$.ptr,
        this_.$$.ptrType.registeredClass,
        classType.registeredClass);
}
function __embind_register_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr, // [ReturnType, ThisType, Args...]
    rawInvoker,
    context
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
        var unboundTypesHandler = function() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
        };
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount-2)) {
            // This is the first overload to be registered, OR we are replacing a function in the base class with a function in the derived class.
            unboundTypesHandler.argCount = argCount-2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-2] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
            // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = memberFunction;
            } else {
                proto[methodName].overloadTable[argCount-2] = memberFunction;
            }
            return [];
        });
        return [];
    });
}
function __embind_register_class_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr,
    rawInvoker,
    fn
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
        var unboundTypesHandler = function() {
                throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
            };
        var proto = classType.registeredClass.constructor;
        if (undefined === proto[methodName]) {
            // This is the first function to be registered with this name.
            unboundTypesHandler.argCount = argCount-1;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-1] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            // Replace the initial unbound-types-handler stub with the proper function. If multiple overloads are registered,
            // the function handlers go into an overload table.
            var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
            var func = craftInvokerFunction(humanName, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn);
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = func;
            } else {
                proto[methodName].overloadTable[argCount-1] = func;
            }
            return [];
        });
        return [];
    });
}
function __embind_register_class_property(
    classType,
    fieldName,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    fieldName = readLatin1String(fieldName);
    getter = FUNCTION_TABLE[getter];
    whenDependentTypesAreResolved([], [classType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + fieldName;
        var desc = {
            get: function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            },
            enumerable: true,
            configurable: true
        };
        if (setter) {
            desc.set = function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            };
        } else {
            desc.set = function(v) {
                throwBindingError(humanName + ' is a read-only property');
            };
        }
        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
        whenDependentTypesAreResolved(
            [],
            (setter ? [getterReturnType, setterArgumentType] : [getterReturnType]),
        function(types) {
            var getterReturnType = types[0];
            var desc = {
                get: function() {
                    var ptr = validateThis(this, classType, humanName + ' getter');
                    return getterReturnType['fromWireType'](getter(getterContext, ptr));
                },
                enumerable: true
            };
            if (setter) {
                setter = FUNCTION_TABLE[setter];
                var setterArgumentType = types[1];
                desc.set = function(v) {
                    var ptr = validateThis(this, classType, humanName + ' setter');
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, v));
                    runDestructors(destructors);
                };
            }
            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
            return [];
        });
        return [];
    });
}
var char_0 = '0'.charCodeAt(0);
var char_9 = '9'.charCodeAt(0);
function makeLegalFunctionName(name) {
    name = name.replace(/[^a-zA-Z0-9_]/g, '$');
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return '_' + name;
    } else {
        return name;
    }
}
function __embind_register_smart_ptr(
    rawType,
    rawPointeeType,
    name,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    name = readLatin1String(name);
    rawGetPointee = FUNCTION_TABLE[rawGetPointee];
    rawConstructor = FUNCTION_TABLE[rawConstructor];
    rawShare = FUNCTION_TABLE[rawShare];
    rawDestructor = FUNCTION_TABLE[rawDestructor];
    whenDependentTypesAreResolved([rawType], [rawPointeeType], function(pointeeType) {
        pointeeType = pointeeType[0];
        var registeredPointer = new RegisteredPointer(
            name,
            pointeeType.registeredClass,
            false,
            false,
            // smart pointer properties
            true,
            pointeeType,
            sharingPolicy,
            rawGetPointee,
            rawConstructor,
            rawShare,
            rawDestructor);
        return [registeredPointer];
    });
}
function __embind_register_enum(
    rawType,
    name
) {
    name = readLatin1String(name);
    function constructor() {
    }
    constructor.values = {};
    registerType(rawType, {
        name: name,
        constructor: constructor,
        'fromWireType': function(c) {
            return this.constructor.values[c];
        },
        'toWireType': function(destructors, c) {
            return c.value;
        },
        destructorFunction: null,
    });
    exposePublicSymbol(name, constructor);
}
function __embind_register_enum_value(
    rawEnumType,
    name,
    enumValue
) {
    var enumType = requireRegisteredType(rawEnumType, 'enum');
    name = readLatin1String(name);
    var Enum = enumType.constructor;
    var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(enumType.name + '_' + name, function() {})},
    });
    Enum.values[enumValue] = Value;
    Enum[name] = Value;
}
function __embind_register_constant(name, type, value) {
    name = readLatin1String(name);
    whenDependentTypesAreResolved([], [type], function(type) {
        type = type[0];
        Module[name] = type['fromWireType'](value);
        return [];
    });
}
/*global Module:true, Runtime*/
/*global HEAP32*/
/*global new_*/
/*global createNamedFunction*/
/*global readLatin1String, writeStringToMemory*/
/*global requireRegisteredType, throwBindingError*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */
var Module = Module || {};
var _emval_handle_array = [{}]; // reserve zero
var _emval_free_list = [];
// Public JS API
/** @expose */
Module.count_emval_handles = function() {
    var count = 0;
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            ++count;
        }
    }
    return count;
};
/** @expose */
Module.get_first_emval = function() {
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            return _emval_handle_array[i];
        }
    }
    return null;
};
// Private C++ API
var _emval_symbols = {}; // address -> string
function __emval_register_symbol(address) {
    _emval_symbols[address] = readLatin1String(address);
}
function getStringOrSymbol(address) {
    var symbol = _emval_symbols[address];
    if (symbol === undefined) {
        return readLatin1String(address);
    } else {
        return symbol;
    }
}
function requireHandle(handle) {
    if (!handle) {
        throwBindingError('Cannot use deleted val. handle = ' + handle);
    }
}
function __emval_register(value) {
    var handle = _emval_free_list.length ?
        _emval_free_list.pop() :
        _emval_handle_array.length;
    _emval_handle_array[handle] = {refcount: 1, value: value};
    return handle;
}
function __emval_incref(handle) {
    if (handle) {
        _emval_handle_array[handle].refcount += 1;
    }
}
function __emval_decref(handle) {
    if (handle && 0 === --_emval_handle_array[handle].refcount) {
        _emval_handle_array[handle] = undefined;
        _emval_free_list.push(handle);
    }
}
function __emval_new_array() {
    return __emval_register([]);
}
function __emval_new_object() {
    return __emval_register({});
}
function __emval_undefined() {
    return __emval_register(undefined);
}
function __emval_null() {
    return __emval_register(null);
}
function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v));
}
function __emval_take_value(type, v) {
    type = requireRegisteredType(type, '_emval_take_value');
    v = type['fromWireType'](v);
    return __emval_register(v);
}
var __newers = {}; // arity -> function
function craftEmvalAllocator(argCount) {
    /*This function returns a new function that looks like this:
    function emval_allocator_3(handle, argTypes, arg0Wired, arg1Wired, arg2Wired) {
        var argType0 = requireRegisteredType(HEAP32[(argTypes >> 2)], "parameter 0");
        var arg0 = argType0.fromWireType(arg0Wired);
        var argType1 = requireRegisteredType(HEAP32[(argTypes >> 2) + 1], "parameter 1");
        var arg1 = argType1.fromWireType(arg1Wired);
        var argType2 = requireRegisteredType(HEAP32[(argTypes >> 2) + 2], "parameter 2");
        var arg2 = argType2.fromWireType(arg2Wired);
        var constructor = _emval_handle_array[handle].value;
        var emval = new constructor(arg0, arg1, arg2);
        return emval;
    } */
    var args1 = ["requireRegisteredType", "HEAP32", "_emval_handle_array", "__emval_register"];
    var args2 = [requireRegisteredType, HEAP32, _emval_handle_array, __emval_register];
    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i; // 'arg0, arg1, ..., argn'
        argsListWired += ", arg"+i+"Wired"; // ', arg0Wired, arg1Wired, ..., argnWired'
    }
    var invokerFnBody =
        "return function emval_allocator_"+argCount+"(handle, argTypes " + argsListWired + ") {\n";
    for(var i = 0; i < argCount; ++i) {
        invokerFnBody += 
            "var argType"+i+" = requireRegisteredType(HEAP32[(argTypes >> 2) + "+i+"], \"parameter "+i+"\");\n" +
            "var arg"+i+" = argType"+i+".fromWireType(arg"+i+"Wired);\n";
    }
    invokerFnBody +=
        "var constructor = _emval_handle_array[handle].value;\n" +
        "var obj = new constructor("+argsList+");\n" +
        "return __emval_register(obj);\n" +
        "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __emval_new(handle, argCount, argTypes) {
    requireHandle(handle);
    var newer = __newers[argCount];
    if (!newer) {
        newer = craftEmvalAllocator(argCount);
        __newers[argCount] = newer;
    }
    if (argCount === 0) {
        return newer(handle, argTypes);
    } else if (argCount === 1) {
        return newer(handle, argTypes, arguments[3]);
    } else if (argCount === 2) {
        return newer(handle, argTypes, arguments[3], arguments[4]);
    } else if (argCount === 3) {
        return newer(handle, argTypes, arguments[3], arguments[4], arguments[5]);
    } else if (argCount === 4) {
        return newer(handle, argTypes, arguments[3], arguments[4], arguments[5], arguments[6]);
    } else {
        // This is a slow path! (.apply and .splice are slow), so a few specializations are present above.
        return newer.apply(null, arguments.splice(1));
    }
}
// appease jshint (technically this code uses eval)
var global = (function(){return Function;})()('return this')();
function __emval_get_global(name) {
    name = getStringOrSymbol(name);
    return __emval_register(global[name]);
}
function __emval_get_module_property(name) {
    name = getStringOrSymbol(name);
    return __emval_register(Module[name]);
}
function __emval_get_property(handle, key) {
    requireHandle(handle);
    return __emval_register(_emval_handle_array[handle].value[_emval_handle_array[key].value]);
}
function __emval_set_property(handle, key, value) {
    requireHandle(handle);
    _emval_handle_array[handle].value[_emval_handle_array[key].value] = _emval_handle_array[value].value;
}
function __emval_as(handle, returnType) {
    requireHandle(handle);
    returnType = requireRegisteredType(returnType, 'emval::as');
    var destructors = [];
    // caller owns destructing
    return returnType['toWireType'](destructors, _emval_handle_array[handle].value);
}
function parseParameters(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var argType = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
        a[i] = argType['fromWireType'](argWireTypes[i]);
    }
    return a;
}
function __emval_call(handle, argCount, argTypes) {
    requireHandle(handle);
    var types = lookupTypes(argCount, argTypes);
    var args = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        args[i] = types[i]['fromWireType'](arguments[3 + i]);
    }
    var fn = _emval_handle_array[handle].value;
    var rv = fn.apply(undefined, args);
    return __emval_register(rv);
}
function lookupTypes(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
    }
    return a;
}
function __emval_get_method_caller(argCount, argTypes) {
    var types = lookupTypes(argCount, argTypes);
    var retType = types[0];
    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) { return t.name; }).join("_") + "$";
    var args1 = ["addFunction", "createNamedFunction", "requireHandle", "getStringOrSymbol", "_emval_handle_array", "retType"];
    var args2 = [Runtime.addFunction, createNamedFunction, requireHandle, getStringOrSymbol, _emval_handle_array, retType];
    var argsList = ""; // 'arg0, arg1, arg2, ... , argN'
    var argsListWired = ""; // 'arg0Wired, ..., argNWired'
    for (var i = 0; i < argCount - 1; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += ", arg" + i + "Wired";
        args1.push("argType" + i);
        args2.push(types[1 + i]);
    }
    var invokerFnBody =
        "return addFunction(createNamedFunction('" + signatureName + "', function (handle, name" + argsListWired + ") {\n" +
        "requireHandle(handle);\n" +
        "name = getStringOrSymbol(name);\n";
    for (var i = 0; i < argCount - 1; ++i) {
        invokerFnBody += "var arg" + i + " = argType" + i + ".fromWireType(arg" + i + "Wired);\n";
    }
    invokerFnBody +=
        "var obj = _emval_handle_array[handle].value;\n" +
        "return retType.toWireType(null, obj[name](" + argsList + "));\n" + 
        "}));\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __emval_has_function(handle, name) {
    name = getStringOrSymbol(name);
    return _emval_handle_array[handle].value[name] instanceof Function;
}
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
//@ sourceMappingURL=a.out.js.map