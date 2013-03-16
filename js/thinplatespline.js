var ThinPlateSpline = (function(){

function ThinPlateSpline(options) {
  if (!options) { options = {}; }

  this.__ord = {
    pointer : Runtime.stackAlloc(104),
    solved  : false
  };
  this.__rev = {
    pointer : Runtime.stackAlloc(104),
    solved  : false
  };
  this.isWorker = false;
  var me     = this;

  Module['ccall']('_ZN17VizGeorefSpline2DC1Ei', 'void', ['number', 'number'], [this.__ord.pointer, 2]);
  Module['ccall']('_ZN17VizGeorefSpline2DC1Ei', 'void', ['number', 'number'], [this.__rev.pointer, 2]);
  //__ZN17VizGeorefSpline2DC1Ei(this.__ord.pointer,2);
  //__ZN17VizGeorefSpline2DC1Ei(this.__rev.pointer,2);

  if (options.use_worker) {
    var root = '';
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
      var match = scripts[i].src.match(/(^|.*\/)thinplatespline\.js/);
      if (match) {
        root = match[1];
        break;
      }
    }

    var worker = this.worker = new Worker(root + 'thinplatespline.js');

    worker.onmessage = function(e) {
      var data      = e.data;
      var e_type    = data.event;

      switch (e_type){
        case 'solved':
          console.log("Solved");
          worker.postMessage({'method':'serialize'});
          break;
        case 'serialized':
          var serial = data.serial;
          console.log(serial);
          delete(me.worker);
          worker.terminate();
          me.deserialize(serial);
          console.log("Serialized");
          break;
        case 'echo':
          console.log(data.data);
      }
    };
  }

  if (options.transform_callback) {
    this.transform_callback = options.transform_callback;
  }

  if (options.error_callback) {
    this.error_callback = options.error_callback;
  }

  if (options.web_falback && options.transform_callback) {
    this.web_fallback = options.web_falback;
  }
}

ThinPlateSpline.prototype.destructor = function() {
  Module['ccall']('_ZN17VizGeorefSpline2DD1Ev', 'void', ['number'], [this.__ord.pointer]);
  Module['ccall']('_ZN17VizGeorefSpline2DD1Ev', 'void', ['number'], [this.__rev.pointer]);
  Module['ccall']('_ZdlPv', 'void', ['number'], [this.__ord.pointer]);
  Module['ccall']('_ZdlPv', 'void', ['number'], [this.__rev.pointer]);
  //__ZN17VizGeorefSpline2DD1Ev(this.__ord.pointer);
  //__ZN17VizGeorefSpline2DD1Ev(this.__rev.pointer);
  //__ZdlPv(this.__ord.pointer);
  //__ZdlPv(this.__rev.pointer);
};

ThinPlateSpline.prototype.push_points = function(points) {
  if (this.worker) {
    this.worker.postMessage({'method':'push_points','data':points});
  } else {
    for (var i=0,len=points.length;i<len;i++) {
      var point = points[i];
      this.add_point(point[0],point[1]);
    }
    this.solve();
  }
};

ThinPlateSpline.prototype.load_points = function(url) {
  var me = this;
  if (this.worker) {
    this.worker.postMessage({'method':'load_points','data':url});
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function(e) {
      if (this.status == 200) {
        var points = JSON.parse(this.response);
        me.push_points(points);
      } else {
        //self.postMessage({'event':'cannotLoad'});
      }
    };
    xhr.send();
  }
};

ThinPlateSpline.prototype.load_serial = function(url) {
  var me = this;
  if (this.worker) {
    this.worker.postMessage({'method':'load_serial','data':url});
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function(e) {
      if (this.status == 200) {
        var serial = JSON.parse(this.response);
        me.deserialize(serial);
      } else {
        //self.postMessage({'event':'cannotLoad'});
      }
    };
    xhr.send();
  }
};

ThinPlateSpline.prototype.add_point = function(P, D) {
  this.__add_point(this.__ord, P, D);
  this.__add_point(this.__rev, D, P);
};

ThinPlateSpline.prototype.__add_point = function(self, P, D) {
  /*var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; assert(STACKTOP|0 % 4 == 0); assert(STACKTOP < STACK_MAX);
  var DPtr=(__stackBase__);

  var DPtr1=((DPtr)|0);
  (HEAPF64[(tempDoublePtr)>>3]=D[0],HEAP32[((DPtr1)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((DPtr1)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
  var DPtr2=((DPtr+8)|0);
  (HEAPF64[(tempDoublePtr)>>3]=D[1],HEAP32[((DPtr2)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((DPtr2)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);

  var ret = __ZN17VizGeorefSpline2D9add_pointEddPKd(self.pointer, P[0], P[1], DPtr);
  //var ret = Module['ccall']('_ZN17VizGeorefSpline2D9add_pointEddPKd', 'number', ['number','number','number','number'], [self.pointer, P[0], P[1], DPtr]);
  STACKTOP = __stackBase__;*/

  var DPtr = _malloc(16);
  Module.setValue(DPtr,     D[0], 'double');
  Module.setValue(DPtr + 8, D[1], 'double');
  var ret = Module['ccall']('_ZN17VizGeorefSpline2D9add_pointEddPKd', 'number', ['number','number','number','number'], [self.pointer, P[0], P[1], DPtr]);

  _free(DPtr);

  self.solved = false;

  return ret;
};

ThinPlateSpline.prototype.solve = function() {
  this.__solve(this.__ord);
  this.__solve(this.__rev);
};

ThinPlateSpline.prototype.__solve = function(self) {
  self.solved = true;
  //return __ZN17VizGeorefSpline2D5solveEv(self.pointer);
  return Module['ccall']('_ZN17VizGeorefSpline2D5solveEv', 'number', ['number'], [self.pointer]);
};

ThinPlateSpline.prototype.transform = function(P, isRev) {
  var self = isRev ? this.__rev : this.__ord;
  var ret  = this.__get_point(self, P);
  var me   = this;

  if (me.transform_callback) {
    if (ret === 0) {
      if (me.web_fallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.web_fallback + '?x=' + P[0] + '&y=' + P[1] + '&inv=' + isRev, true);

        xhr.onload = function(e) {
          if (this.status == 200) {
            var data = JSON.parse(this.response);
            me.transform_callback([data.data.x,data.data.y], isRev);
          } else if (me.error_callback) {
            me.error_callback(P, isRev);
          }
        };
        xhr.send();
      } else if (me.error_callback) {
        me.error_callback(P, isRev);
      }
    } else {
      me.transform_callback(ret, isRev);
    }
  } else {
    return ret;
  }
};

ThinPlateSpline.prototype.__get_point = function(self, P) {
  if (!self.solved) { return 0; } //this.__solve(self); }
  
  /*var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; assert(STACKTOP|0 % 4 == 0); assert(STACKTOP < STACK_MAX);
  var $__dstr=(__stackBase__);

  //var res = __ZN15ThinPlateSpline9get_pointEddPd(this.pointer, P[0], P[1], $__dstr);
  var res = __ZN17VizGeorefSpline2D9get_pointEddPd(self.pointer, P[0], P[1], $__dstr);
  var $21=(($__dstr)|0);
  var $22=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($21)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($21)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
  var $23=(($__dstr+8)|0);
  var $24=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($23)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($23)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);

  STACKTOP = __stackBase__;*/

  var DPtr = _malloc(16);
  var res  = Module['ccall']('_ZN17VizGeorefSpline2D9get_pointEddPd', 'number', ['number','number','number','number'], [self.pointer, P[0], P[1], DPtr]);
  var ret  = [];
  ret[0]   = Module.getValue(DPtr,    'double');
  ret[1]   = Module.getValue(DPtr + 8,'double');

  _free(DPtr);

  return ret;
};

ThinPlateSpline.prototype.serialize = function() {
  var alloc_size = this.serialize_size();
  var ord_serial = _malloc(alloc_size[0]+1);
  var rev_serial = _malloc(alloc_size[1]+1);
  //__ZN17VizGeorefSpline2D9serializeEPc(this.__ord.pointer, ord_serial);
  //__ZN17VizGeorefSpline2D9serializeEPc(this.__rev.pointer, rev_serial);
  Module['ccall']('_ZN17VizGeorefSpline2D9serializeEPc', 'void', ['number', 'number'], [this.__ord.pointer, ord_serial]);
  Module['ccall']('_ZN17VizGeorefSpline2D9serializeEPc', 'void', ['number', 'number'], [this.__rev.pointer, rev_serial]);

  var ret = [{binary:[],solved:this.__ord.solved},{binary:[],solved:this.__rev.solved}];
  var bin = ret[0]['binary'];
  for (var i=0,len=alloc_size[0];i<len;i++) {
    bin[i] = HEAP8[ord_serial+i];
  }
  bin     = ret[1]['binary'];
  for (i=0,len=alloc_size[1];i<len;i++) {
    bin[i] = HEAP8[rev_serial+i];
  }

  _free(ord_serial);
  _free(rev_serial);

  return ret;
};

ThinPlateSpline.prototype.serialize2 = function() {
  return msgpack.pack(this.serialize());
};

ThinPlateSpline.prototype.deserialize = function(serial) {
  var me = this;
  if (this.worker) {
    this.worker.postMessage({'method':'deserialize','data':serial});
  } else {
    var ord_bin    = serial[0]['binary'];
    var rev_bin    = serial[1]['binary'];
    var ord_size   = ord_bin.length;
    var rev_size   = rev_bin.length;
    var ord_serial = _malloc(ord_size);
    var rev_serial = _malloc(rev_size);

    /*var ord_i = 0;
    var rev_i = 0;
    var ord_f = function() {
      HEAP8[ord_serial+ord_i] = ord_bin[ord_i];
      ord_i++;
      if (ord_i < ord_size) {
        setTimeout(ord_f,1);
      } else {
        __ZN17VizGeorefSpline2D11deserializeEPc(me.__ord.pointer, ord_serial);
        me.__ord.solved = serial[0]['solved'];
        _free(ord_serial);
      }
    };

    var rev_f = function() {
      HEAP8[rev_serial+rev_i] = rev_bin[rev_i];
      rev_i++;
      if (rev_i < rev_size) {
        setTimeout(rev_f,1);
      } else {
        __ZN17VizGeorefSpline2D11deserializeEPc(me.__rev.pointer, rev_serial);
        me.__rev.solved = serial[1]['solved'];
        _free(rev_serial);
      }
    };
    ord_f();
    rev_f();*/

    for (var i=0,len=ord_size;i<len;i++) {
      HEAP8[ord_serial+i] = ord_bin[i];
    }
    for (i=0,len=rev_size;i<len;i++) {
      HEAP8[rev_serial+i] = rev_bin[i];
    }

    //__ZN17VizGeorefSpline2D11deserializeEPc(this.__ord.pointer, ord_serial);
    //__ZN17VizGeorefSpline2D11deserializeEPc(this.__rev.pointer, rev_serial);
    Module['ccall']('_ZN17VizGeorefSpline2D11deserializeEPc', 'void', ['number', 'number'], [this.__ord.pointer, ord_serial]);
    Module['ccall']('_ZN17VizGeorefSpline2D11deserializeEPc', 'void', ['number', 'number'], [this.__rev.pointer, rev_serial]);

    this.__ord.solved = serial[0]['solved'];
    this.__rev.solved = serial[1]['solved'];

    _free(ord_serial);
    _free(rev_serial);
  }
};

ThinPlateSpline.prototype.deserialize2 = function(serial) {
  this.deserialize(msgpack.unpack(serial));
};

ThinPlateSpline.prototype.serialize_size = function() {
  return [this.__serialize_size(this.__ord),this.__serialize_size(this.__rev)];
};

ThinPlateSpline.prototype.__serialize_size = function(self) {
  //return __ZN17VizGeorefSpline2D14serialize_sizeEv(self.pointer);
  return Module['ccall']('_ZN17VizGeorefSpline2D14serialize_sizeEv', 'number', ['number'], [self.pointer]);
};

// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
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
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function(filename) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename).toString();
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename).toString();
    }
    return ret;
  };

  Module['load'] = function(f) {
    globalEval(read(f));
  };

  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}

if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  // Polyfill over SpiderMonkey/V8 differences
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function(f) { snarf(f) };
  }

  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}

if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }

  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}

if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}

if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  Module['load'] = importScripts;
}

if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
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
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];

  
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
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
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
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  BITSHIFT64_SHL: 0,
  BITSHIFT64_ASHR: 1,
  BITSHIFT64_LSHR: 2,
  bitshift64: function (low, high, op, bits) {
    var ret;
    var ander = Math.pow(2, bits)-1;
    if (bits < 32) {
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [low << bits, (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits))];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [(((low >>> bits ) | ((high&ander) << (32 - bits))) >> 0) >>> 0, (high >> bits) >>> 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [((low >>> bits) | ((high&ander) << (32 - bits))) >>> 0, high >>> bits];
          break;
      }
    } else if (bits == 32) {
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [0, low];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [high, (high|0) < 0 ? ander : 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [high, 0];
          break;
      }
    } else { // bits > 32
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [0, low << (bits - 32)];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [(high >> (bits - 32)) >>> 0, (high|0) < 0 ? ander : 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [high >>>  (bits - 32) , 0];
          break;
      }
    }
    assert(ret);
    HEAP32[tempDoublePtr>>2] = ret[0]; // cannot use utility functions since we are in runtime itself
    HEAP32[tempDoublePtr+4>>2] = ret[1];
  },
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
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
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
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
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
  addFunction: function (func, sig) {
    //assert(sig); // TODO: support asm
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
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
      Runtime.funcWrappers[func] = function() {
        Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function stackAlloc(size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2);assert(STACKTOP|0 < STACK_MAX|0); return ret; },
  staticAlloc: function staticAlloc(size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function alignMemory(size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function makeBigInt(low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

var ABORT = false;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}

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
//                   'array' for JavaScript arrays and typed arrays).
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
    var func = globalScope['Module']['_' + ident]; // closure exported function
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
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
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
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((ptr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]); break;
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
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_NONE = 3; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
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
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
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
    HEAPU8.set(new Uint8Array(slab), ret);
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
  var utf8 = new Runtime.UTF8Processor();
  var nullTerminated = typeof(length) == "undefined";
  var ret = "";
  var i = 0;
  var t;
  while (1) {
  assert(i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (nullTerminated && t == 0) break;
    ret += utf8.processCChar(t);
    i += 1;
    if (!nullTerminated && i == length) break;
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

function Array_stringify(array) {
  var ret = "";
  for (var i = 0; i < array.length; i++) {
    ret += String.fromCharCode(array[i]);
  }
  return ret;
}
Module['Array_stringify'] = Array_stringify;

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
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

STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max

var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
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

STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY

var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
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

var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown

function initRuntime() {
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

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
    HEAP8[(((buffer)+(i))|0)]=chr
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

if (!Math.imul) Math.imul = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledRun = false;
var runDependencyWatcher = null;
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
      }, 6000);
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
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

// === Body ===



assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);

STATICTOP += 752;

assert(STATICTOP < TOTAL_MEMORY);

var _stderr;







var __ZTVSt9exception;

var __ZTVN10__cxxabiv120__si_class_type_infoE;

var __ZTISt9exception;


allocate(24, "i8", ALLOC_NONE, 5242880);
allocate([109,97,116,114,105,120,73,110,118,101,114,116,40,41,58,32,69,82,82,79,82,32,45,32,109,101,109,111,114,121,32,97,108,108,111,99,97,116,105,111,110,32,102,97,105,108,101,100,46,10,0] /* matrixInvert(): ERRO */, "i8", ALLOC_NONE, 5242904);
allocate([32,65,32,112,111,105,110,116,32,119,97,115,32,100,101,108,101,116,101,100,32,97,102,116,101,114,32,116,104,101,32,108,97,115,116,32,115,111,108,118,101,10,0] /*  A point was deleted */, "i8", ALLOC_NONE, 5242956);
allocate([32,78,79,32,105,110,116,101,114,112,111,108,97,116,105,111,110,32,45,32,114,101,116,117,114,110,32,118,97,108,117,101,115,32,97,114,101,32,122,101,114,111,10,0] /*  NO interpolation -  */, "i8", ALLOC_NONE, 5243000);
allocate([115,116,100,58,58,98,97,100,95,97,108,108,111,99,0] /* std::bad_alloc\00 */, "i8", ALLOC_NONE, 5243044);
allocate([32,65,32,112,111,105,110,116,32,119,97,115,32,97,100,100,101,100,32,97,102,116,101,114,32,116,104,101,32,108,97,115,116,32,115,111,108,118,101,10,0] /*  A point was added a */, "i8", ALLOC_NONE, 5243060);
allocate(472, "i8", ALLOC_NONE, 5243104);
allocate([0,0,0,0,224,2,80,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, 5243576);
allocate(1, "i8", ALLOC_NONE, 5243596);
allocate([83,116,57,98,97,100,95,97,108,108,111,99,0] /* St9bad_alloc\00 */, "i8", ALLOC_NONE, 5243600);
allocate(12, "i8", ALLOC_NONE, 5243616);
allocate(4, "i8", ALLOC_NONE, 5243628);
HEAP32[((5243584)>>2)]=(4);
HEAP32[((5243588)>>2)]=(2);
HEAP32[((5243592)>>2)]=(6);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([2,0,0,0], "i8", ALLOC_STATIC);
HEAP32[((5243616)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5243620)>>2)]=((5243600)|0);
HEAP32[((5243624)>>2)]=__ZTISt9exception;

  
  
  
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
  
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  
  var _stdin=allocate(1, "i32*", ALLOC_STACK);
  
  var _stdout=allocate(1, "i32*", ALLOC_STACK);
  
  var _stderr=allocate(1, "i32*", ALLOC_STACK);
  
  var __impure_ptr=allocate(1, "i32*", ALLOC_STACK);var FS={currentPath:"/",nextInode:2,streams:[null],checkStreams:function () {
        for (var i in FS.streams) if (FS.streams.hasOwnProperty(i)) assert(i >= 0 && i < FS.streams.length); // no keys not in dense span
        for (var i = 0; i < FS.streams.length; i++) assert(typeof FS.streams[i] == 'object'); // no non-null holes in dense span
      },ignorePermissions:true,joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
  
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
  
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
  
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
  
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
    
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
    
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.ensureObjects();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
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
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
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
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureRoot();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
  
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === '\n'.charCodeAt(0)) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
  
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
  
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
  
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        assert(Math.max(_stdin, _stdout, _stderr) < 128); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
  
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
  
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        FS.checkStreams();
        assert(FS.streams.length < 1024); // at this early stage, we should not have a large set of file descriptors - just a few
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output('\n'.charCodeAt(0));
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output('\n'.charCodeAt(0));
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]|0 != 0) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],HEAPF64[(tempDoublePtr)>>3]);
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == '%'.charCodeAt(0)) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case '+'.charCodeAt(0):
                flagAlwaysSigned = true;
                break;
              case '-'.charCodeAt(0):
                flagLeftAlign = true;
                break;
              case '#'.charCodeAt(0):
                flagAlternative = true;
                break;
              case '0'.charCodeAt(0):
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == '*'.charCodeAt(0)) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= '0'.charCodeAt(0) && next <= '9'.charCodeAt(0)) {
              width = width * 10 + (next - '0'.charCodeAt(0));
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false;
          if (next == '.'.charCodeAt(0)) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == '*'.charCodeAt(0)) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < '0'.charCodeAt(0) ||
                    precisionChr > '9'.charCodeAt(0)) break;
                precision = precision * 10 + (precisionChr - '0'.charCodeAt(0));
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 'h'.charCodeAt(0)) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 'l'.charCodeAt(0)) {
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
          if (['d', 'i', 'u', 'o', 'x', 'X', 'p'].indexOf(String.fromCharCode(next)) != -1) {
            // Integer.
            var signed = next == 'd'.charCodeAt(0) || next == 'i'.charCodeAt(0);
            argSize = argSize || 4;
            var currArg = getNextArg('i' + (argSize * 8));
            var origArg = currArg;
            var argText;
            // Flatten i64-1 [low, high] into a (slightly rounded) double
            if (argSize == 8) {
              currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 'u'.charCodeAt(0));
            }
            // Truncate to requested size.
            if (argSize <= 4) {
              var limit = Math.pow(256, argSize) - 1;
              currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
            }
            // Format the number.
            var currAbsArg = Math.abs(currArg);
            var prefix = '';
            if (next == 'd'.charCodeAt(0) || next == 'i'.charCodeAt(0)) {
              if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
              argText = reSign(currArg, 8 * argSize, 1).toString(10);
            } else if (next == 'u'.charCodeAt(0)) {
              if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
              argText = unSign(currArg, 8 * argSize, 1).toString(10);
              currArg = Math.abs(currArg);
            } else if (next == 'o'.charCodeAt(0)) {
              argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
            } else if (next == 'x'.charCodeAt(0) || next == 'X'.charCodeAt(0)) {
              prefix = flagAlternative ? '0x' : '';
              if (argSize == 8 && i64Math) argText = (origArg[1]>>>0).toString(16) + (origArg[0]>>>0).toString(16); else
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
              if (next == 'X'.charCodeAt(0)) {
                prefix = prefix.toUpperCase();
                argText = argText.toUpperCase();
              }
            } else if (next == 'p'.charCodeAt(0)) {
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
            if (flagAlwaysSigned) {
              if (currArg < 0) {
                prefix = '-' + prefix;
              } else {
                prefix = '+' + prefix;
              }
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
          } else if (['f', 'F', 'e', 'E', 'g', 'G'].indexOf(String.fromCharCode(next)) != -1) {
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
              if (next == 'g'.charCodeAt(0) || next == 'G'.charCodeAt(0)) {
                isGeneral = true;
                precision = precision || 1;
                var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                if (precision > exponent && exponent >= -4) {
                  next = ((next == 'g'.charCodeAt(0)) ? 'f' : 'F').charCodeAt(0);
                  precision -= exponent + 1;
                } else {
                  next = ((next == 'g'.charCodeAt(0)) ? 'e' : 'E').charCodeAt(0);
                  precision--;
                }
                effectivePrecision = Math.min(precision, 20);
              }
  
              if (next == 'e'.charCodeAt(0) || next == 'E'.charCodeAt(0)) {
                argText = currArg.toExponential(effectivePrecision);
                // Make sure the exponent has at least 2 digits.
                if (/[eE][-+]\d$/.test(argText)) {
                  argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                }
              } else if (next == 'f'.charCodeAt(0) || next == 'F'.charCodeAt(0)) {
                argText = currArg.toFixed(effectivePrecision);
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
              if (next == 'E'.charCodeAt(0)) argText = argText.toUpperCase();
  
              // Add sign.
              if (flagAlwaysSigned && currArg >= 0) {
                argText = '+' + argText;
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
            if (next < 'a'.charCodeAt(0)) argText = argText.toUpperCase();
  
            // Insert the result into the buffer.
            argText.split('').forEach(function(chr) {
              ret.push(chr.charCodeAt(0));
            });
          } else if (next == 's'.charCodeAt(0)) {
            // String.
            var arg = getNextArg('i8*') || nullString;
            var argLength = _strlen(arg);
            if (precisionSet) argLength = Math.min(argLength, precision);
            if (!flagLeftAlign) {
              while (argLength < width--) {
                ret.push(' '.charCodeAt(0));
              }
            }
            for (var i = 0; i < argLength; i++) {
              ret.push(HEAPU8[((arg++)|0)]);
            }
            if (flagLeftAlign) {
              while (argLength < width--) {
                ret.push(' '.charCodeAt(0));
              }
            }
          } else if (next == 'c'.charCodeAt(0)) {
            // Character.
            if (flagLeftAlign) ret.push(getNextArg('i8'));
            while (--width > 0) {
              ret.push(' '.charCodeAt(0));
            }
            if (!flagLeftAlign) ret.push(getNextArg('i8'));
          } else if (next == 'n'.charCodeAt(0)) {
            // Write the length written so far to the next parameter.
            var ptr = getNextArg('i32*');
            HEAP32[((ptr)>>2)]=ret.length
          } else if (next == '%'.charCodeAt(0)) {
            // Literal percent sign.
            ret.push(curr);
          } else {
            // Unknown specifiers remain untouched.
            for (var i = startTextIndex; i < textIndex + 2; i++) {
              ret.push(HEAP8[(i)]);
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

  var _fabs=Math.abs;

  var _sqrt=Math.sqrt;

  var _log=Math.log;

  
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
      return (tempRet0 = x*y > 4294967295,(x*y)>>>0);
    }


  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }

  
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
    }var _llvm_memset_p0i8_i32=_memset;

  
  function ___errno_location() {
      return ___setErrNo.ret;
    }var ___errno=___errno_location;

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
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

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
  
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
      return ret;  // Previous break location.
    }

  function ___gxx_personality_v0() {
    }

  function ___cxa_allocate_exception(size) {
      return _malloc(size);
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
    }function ___cxa_find_matching_catch(thrown, throwntype, typeArray) {
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
          return (tempRet0 = typeArray[i],thrown);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return (tempRet0 = throwntype,thrown);
    }function ___cxa_throw(ptr, type, destructor) {
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

  function __ZNSt9exceptionD2Ev(){}





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
        }},pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],ensureObjects:function () {
        if (Browser.ensured) return;
        Browser.ensured = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(-3)];
          return ret;
        }
  
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
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
          img.onload = function() {
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
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
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
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
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
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false,
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
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
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},requestFullScreen:function () {
        var canvas = Module['canvas'];
        function fullScreenChange() {
          var isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                        canvas['mozRequestPointerLock'] ||
                                        canvas['webkitRequestPointerLock'];
            canvas.requestPointerLock();
            isFullScreen = true;
          }
          if (Module['onFullScreen']) Module['onFullScreen'](isFullScreen);
        }
  
        document.addEventListener('fullscreenchange', fullScreenChange, false);
        document.addEventListener('mozfullscreenchange', fullScreenChange, false);
        document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen(); 
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
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
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200) {
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
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___setErrNo(0);
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function() { Browser.requestFullScreen() };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  


var FUNCTION_TABLE = [0,0,__ZNSt9bad_allocD0Ev,0,__ZNSt9bad_allocD1Ev,0,__ZNKSt9bad_alloc4whatEv,0];

function __ZN17VizGeorefSpline2DC1Ei($this, $nof_vars) {
  var label = 0;


  var $this_addr;
  var $nof_vars_addr;
  $this_addr=$this;
  $nof_vars_addr=$nof_vars;
  var $this1=$this_addr;
  var $0=$nof_vars_addr;
  __ZN17VizGeorefSpline2DC2Ei($this1, $0);

  return;
}
Module["__ZN17VizGeorefSpline2DC1Ei"] = __ZN17VizGeorefSpline2DC1Ei;

function __ZN17VizGeorefSpline2DC2Ei($this, $nof_vars) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $this_addr;
      var $nof_vars_addr;
      var $i;
      $this_addr=$this;
      $nof_vars_addr=$nof_vars;
      var $this1=$this_addr;
      var $u=(($this1+84)|0);
      HEAP32[(($u)>>2)]=0;
      var $y=(($this1+64)|0);
      HEAP32[(($y)>>2)]=0;
      var $x=(($this1+60)|0);
      HEAP32[(($x)>>2)]=0;
      var $index=(($this1+92)|0);
      HEAP32[(($index)>>2)]=0;
      var $unused=(($this1+88)|0);
      HEAP32[(($unused)>>2)]=0;
      $i=0;
      label = 3; break;
    case 3: 
      var $0=$i;
      var $1=$nof_vars_addr;
      var $cmp=(($0)|(0)) < (($1)|(0));
      if ($cmp) { label = 4; break; } else { label = 6; break; }
    case 4: 
      var $2=$i;
      var $rhs=(($this1+68)|0);
      var $arrayidx=(($rhs+($2<<2))|0);
      HEAP32[(($arrayidx)>>2)]=0;
      var $3=$i;
      var $coef=(($this1+76)|0);
      var $arrayidx2=(($coef+($3<<2))|0);
      HEAP32[(($arrayidx2)>>2)]=0;
      label = 5; break;
    case 5: 
      var $4=$i;
      var $inc=((($4)+(1))|0);
      $i=$inc;
      label = 3; break;
    case 6: 
      var $_ty=(($this1+28)|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($_ty)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_ty)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_tx=(($this1+20)|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($_tx)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_tx)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_ta=(($this1+36)|0);
      (HEAPF64[(tempDoublePtr)>>3]=10,HEAP32[(($_ta)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_ta)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_nof_points=(($this1+8)|0);
      HEAP32[(($_nof_points)>>2)]=0;
      var $5=$nof_vars_addr;
      var $_nof_vars=(($this1+4)|0);
      HEAP32[(($_nof_vars)>>2)]=$5;
      var $_max_nof_points=(($this1+12)|0);
      HEAP32[(($_max_nof_points)>>2)]=0;
      var $_AA=(($this1+96)|0);
      HEAP32[(($_AA)>>2)]=0;
      var $_Ainv=(($this1+100)|0);
      HEAP32[(($_Ainv)>>2)]=0;
      __ZN17VizGeorefSpline2D11grow_pointsEv($this1);
      var $type=(($this1)|0);
      HEAP32[(($type)>>2)]=0;

      return;
    default: assert(0, "bad label: " + label);
  }

}


function __ZN17VizGeorefSpline2D11grow_pointsEv($this) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $this_addr;
      var $new_max;
      var $i;
      $this_addr=$this;
      var $this1=$this_addr;
      var $_max_nof_points=(($this1+12)|0);
      var $0=HEAP32[(($_max_nof_points)>>2)];
      var $mul=($0<<1);
      var $add=((($mul)+(2))|0);
      var $add2=((($add)+(3))|0);
      $new_max=$add2;
      var $_max_nof_points3=(($this1+12)|0);
      var $1=HEAP32[(($_max_nof_points3)>>2)];
      var $cmp=(($1)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 8; break; }
    case 3: 
      var $2=$new_max;
      var $mul4=($2<<3);
      var $call=_malloc($mul4);
      var $3=$call;
      var $x=(($this1+60)|0);
      HEAP32[(($x)>>2)]=$3;
      var $4=$new_max;
      var $mul5=($4<<3);
      var $call6=_malloc($mul5);
      var $5=$call6;
      var $y=(($this1+64)|0);
      HEAP32[(($y)>>2)]=$5;
      var $6=$new_max;
      var $mul7=($6<<3);
      var $call8=_malloc($mul7);
      var $7=$call8;
      var $u=(($this1+84)|0);
      HEAP32[(($u)>>2)]=$7;
      var $8=$new_max;
      var $mul9=($8<<2);
      var $call10=_malloc($mul9);
      var $9=$call10;
      var $unused=(($this1+88)|0);
      HEAP32[(($unused)>>2)]=$9;
      var $10=$new_max;
      var $mul11=($10<<2);
      var $call12=_malloc($mul11);
      var $11=$call12;
      var $index=(($this1+92)|0);
      HEAP32[(($index)>>2)]=$11;
      $i=0;
      label = 4; break;
    case 4: 
      var $12=$i;
      var $cmp13=(($12)|(0)) < 2;
      if ($cmp13) { label = 5; break; } else { label = 7; break; }
    case 5: 
      var $13=$new_max;
      var $call14=_calloc(8, $13);
      var $14=$call14;
      var $15=$i;
      var $rhs=(($this1+68)|0);
      var $arrayidx=(($rhs+($15<<2))|0);
      HEAP32[(($arrayidx)>>2)]=$14;
      var $16=$new_max;
      var $call15=_calloc(8, $16);
      var $17=$call15;
      var $18=$i;
      var $coef=(($this1+76)|0);
      var $arrayidx16=(($coef+($18<<2))|0);
      HEAP32[(($arrayidx16)>>2)]=$17;
      label = 6; break;
    case 6: 
      var $19=$i;
      var $inc=((($19)+(1))|0);
      $i=$inc;
      label = 4; break;
    case 7: 
      label = 13; break;
    case 8: 
      var $x17=(($this1+60)|0);
      var $20=HEAP32[(($x17)>>2)];
      var $21=$20;
      var $22=$new_max;
      var $mul18=($22<<3);
      var $call19=_realloc($21, $mul18);
      var $23=$call19;
      var $x20=(($this1+60)|0);
      HEAP32[(($x20)>>2)]=$23;
      var $y21=(($this1+64)|0);
      var $24=HEAP32[(($y21)>>2)];
      var $25=$24;
      var $26=$new_max;
      var $mul22=($26<<3);
      var $call23=_realloc($25, $mul22);
      var $27=$call23;
      var $y24=(($this1+64)|0);
      HEAP32[(($y24)>>2)]=$27;
      var $u25=(($this1+84)|0);
      var $28=HEAP32[(($u25)>>2)];
      var $29=$28;
      var $30=$new_max;
      var $mul26=($30<<3);
      var $call27=_realloc($29, $mul26);
      var $31=$call27;
      var $u28=(($this1+84)|0);
      HEAP32[(($u28)>>2)]=$31;
      var $unused29=(($this1+88)|0);
      var $32=HEAP32[(($unused29)>>2)];
      var $33=$32;
      var $34=$new_max;
      var $mul30=($34<<2);
      var $call31=_realloc($33, $mul30);
      var $35=$call31;
      var $unused32=(($this1+88)|0);
      HEAP32[(($unused32)>>2)]=$35;
      var $index33=(($this1+92)|0);
      var $36=HEAP32[(($index33)>>2)];
      var $37=$36;
      var $38=$new_max;
      var $mul34=($38<<2);
      var $call35=_realloc($37, $mul34);
      var $39=$call35;
      var $index36=(($this1+92)|0);
      HEAP32[(($index36)>>2)]=$39;
      $i=0;
      label = 9; break;
    case 9: 
      var $40=$i;
      var $cmp38=(($40)|(0)) < 2;
      if ($cmp38) { label = 10; break; } else { label = 12; break; }
    case 10: 
      var $41=$i;
      var $rhs40=(($this1+68)|0);
      var $arrayidx41=(($rhs40+($41<<2))|0);
      var $42=HEAP32[(($arrayidx41)>>2)];
      var $43=$42;
      var $44=$new_max;
      var $mul42=($44<<3);
      var $call43=_realloc($43, $mul42);
      var $45=$call43;
      var $46=$i;
      var $rhs44=(($this1+68)|0);
      var $arrayidx45=(($rhs44+($46<<2))|0);
      HEAP32[(($arrayidx45)>>2)]=$45;
      var $47=$i;
      var $coef46=(($this1+76)|0);
      var $arrayidx47=(($coef46+($47<<2))|0);
      var $48=HEAP32[(($arrayidx47)>>2)];
      var $49=$48;
      var $50=$new_max;
      var $mul48=($50<<3);
      var $call49=_realloc($49, $mul48);
      var $51=$call49;
      var $52=$i;
      var $coef50=(($this1+76)|0);
      var $arrayidx51=(($coef50+($52<<2))|0);
      HEAP32[(($arrayidx51)>>2)]=$51;
      label = 11; break;
    case 11: 
      var $53=$i;
      var $inc53=((($53)+(1))|0);
      $i=$inc53;
      label = 9; break;
    case 12: 
      label = 13; break;
    case 13: 
      var $54=$new_max;
      var $sub=((($54)-(3))|0);
      var $_max_nof_points55=(($this1+12)|0);
      HEAP32[(($_max_nof_points55)>>2)]=$sub;

      return;
    default: assert(0, "bad label: " + label);
  }

}


function __ZN17VizGeorefSpline2D9add_pointEddPKd($this, $Px, $Py, $Pvars) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $this_addr;
      var $Px_addr;
      var $Py_addr;
      var $Pvars_addr;
      var $i;
      var $j;
      $this_addr=$this;
      $Px_addr=$Px;
      $Py_addr=$Py;
      $Pvars_addr=$Pvars;
      var $this1=$this_addr;
      var $type=(($this1)|0);
      HEAP32[(($type)>>2)]=5;
      var $_nof_points=(($this1+8)|0);
      var $0=HEAP32[(($_nof_points)>>2)];
      var $_max_nof_points=(($this1+12)|0);
      var $1=HEAP32[(($_max_nof_points)>>2)];
      var $cmp=(($0)|(0))==(($1)|(0));
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      __ZN17VizGeorefSpline2D11grow_pointsEv($this1);
      label = 4; break;
    case 4: 
      var $_nof_points2=(($this1+8)|0);
      var $2=HEAP32[(($_nof_points2)>>2)];
      $i=$2;
      var $3=$Px_addr;
      var $4=$i;
      var $x=(($this1+60)|0);
      var $5=HEAP32[(($x)>>2)];
      var $arrayidx=(($5+($4<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$3,HEAP32[(($arrayidx)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $6=$Py_addr;
      var $7=$i;
      var $y=(($this1+64)|0);
      var $8=HEAP32[(($y)>>2)];
      var $arrayidx3=(($8+($7<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$6,HEAP32[(($arrayidx3)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx3)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      $j=0;
      label = 5; break;
    case 5: 
      var $9=$j;
      var $_nof_vars=(($this1+4)|0);
      var $10=HEAP32[(($_nof_vars)>>2)];
      var $cmp4=(($9)|(0)) < (($10)|(0));
      if ($cmp4) { label = 6; break; } else { label = 8; break; }
    case 6: 
      var $11=$j;
      var $12=$Pvars_addr;
      var $arrayidx5=(($12+($11<<3))|0);
      var $13=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx5)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx5)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $14=$i;
      var $add=((($14)+(3))|0);
      var $15=$j;
      var $rhs=(($this1+68)|0);
      var $arrayidx6=(($rhs+($15<<2))|0);
      var $16=HEAP32[(($arrayidx6)>>2)];
      var $arrayidx7=(($16+($add<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$13,HEAP32[(($arrayidx7)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx7)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 7; break;
    case 7: 
      var $17=$j;
      var $inc=((($17)+(1))|0);
      $j=$inc;
      label = 5; break;
    case 8: 
      var $_nof_points8=(($this1+8)|0);
      var $18=HEAP32[(($_nof_points8)>>2)];
      var $inc9=((($18)+(1))|0);
      HEAP32[(($_nof_points8)>>2)]=$inc9;

      return 1;
    default: assert(0, "bad label: " + label);
  }

}
Module["__ZN17VizGeorefSpline2D9add_pointEddPKd"] = __ZN17VizGeorefSpline2D9add_pointEddPKd;

function __ZN17VizGeorefSpline2D5solveEv($this) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $this_addr;
      var $r;
      var $c;
      var $v;
      var $p;
      var $fact;
      var $xmax;
      var $xmin;
      var $ymax;
      var $ymin;
      var $delx;
      var $dely;
      var $xx;
      var $yy;
      var $sumx;
      var $sumy;
      var $sumx2;
      var $sumy2;
      var $sumxy;
      var $SSxx;
      var $SSyy;
      var $SSxy;
      var $p1;
      var $fact95;
      var $dxp;
      var $dyp;
      var $min_index;
      var $min_u;
      var $status;
      $this_addr=$this;
      var $this1=$this_addr;
      var $_nof_points=(($this1+8)|0);
      var $0=HEAP32[(($_nof_points)>>2)];
      var $cmp=(($0)|(0)) < 1;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $type=(($this1)|0);
      HEAP32[(($type)>>2)]=0;
      $retval=0;
      label = 74; break;
    case 4: 
      var $_nof_points2=(($this1+8)|0);
      var $1=HEAP32[(($_nof_points2)>>2)];
      var $cmp3=(($1)|(0))==1;
      if ($cmp3) { label = 5; break; } else { label = 6; break; }
    case 5: 
      var $type5=(($this1)|0);
      HEAP32[(($type5)>>2)]=1;
      $retval=1;
      label = 74; break;
    case 6: 
      var $_nof_points7=(($this1+8)|0);
      var $2=HEAP32[(($_nof_points7)>>2)];
      var $cmp8=(($2)|(0))==2;
      if ($cmp8) { label = 7; break; } else { label = 8; break; }
    case 7: 
      var $x=(($this1+60)|0);
      var $3=HEAP32[(($x)>>2)];
      var $arrayidx=(($3+8)|0);
      var $4=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $x10=(($this1+60)|0);
      var $5=HEAP32[(($x10)>>2)];
      var $arrayidx11=(($5)|0);
      var $6=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx11)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx11)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub=($4)-($6);
      var $_dx=(($this1+44)|0);
      (HEAPF64[(tempDoublePtr)>>3]=$sub,HEAP32[(($_dx)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dx)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $y=(($this1+64)|0);
      var $7=HEAP32[(($y)>>2)];
      var $arrayidx12=(($7+8)|0);
      var $8=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx12)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx12)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $y13=(($this1+64)|0);
      var $9=HEAP32[(($y13)>>2)];
      var $arrayidx14=(($9)|0);
      var $10=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx14)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx14)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub15=($8)-($10);
      var $_dy=(($this1+52)|0);
      (HEAPF64[(tempDoublePtr)>>3]=$sub15,HEAP32[(($_dy)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dy)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_dx16=(($this1+44)|0);
      var $11=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx16)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx16)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_dx17=(($this1+44)|0);
      var $12=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx17)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx17)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul=($11)*($12);
      var $_dy18=(($this1+52)|0);
      var $13=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy18)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy18)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_dy19=(($this1+52)|0);
      var $14=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy19)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy19)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul20=($13)*($14);
      var $add=($mul)+($mul20);
      var $div=(1)/($add);
      $fact=$div;
      var $15=$fact;
      var $_dx21=(($this1+44)|0);
      var $16=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx21)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx21)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul22=($16)*($15);
      (HEAPF64[(tempDoublePtr)>>3]=$mul22,HEAP32[(($_dx21)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dx21)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $17=$fact;
      var $_dy23=(($this1+52)|0);
      var $18=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy23)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy23)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul24=($18)*($17);
      (HEAPF64[(tempDoublePtr)>>3]=$mul24,HEAP32[(($_dy23)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dy23)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $type25=(($this1)|0);
      HEAP32[(($type25)>>2)]=2;
      $retval=2;
      label = 74; break;
    case 8: 
      var $x27=(($this1+60)|0);
      var $19=HEAP32[(($x27)>>2)];
      var $arrayidx28=(($19)|0);
      var $20=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx28)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx28)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $xmax=$20;
      var $x29=(($this1+60)|0);
      var $21=HEAP32[(($x29)>>2)];
      var $arrayidx30=(($21)|0);
      var $22=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx30)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx30)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $xmin=$22;
      var $y31=(($this1+64)|0);
      var $23=HEAP32[(($y31)>>2)];
      var $arrayidx32=(($23)|0);
      var $24=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx32)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx32)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $ymax=$24;
      var $y33=(($this1+64)|0);
      var $25=HEAP32[(($y33)>>2)];
      var $arrayidx34=(($25)|0);
      var $26=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx34)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx34)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $ymin=$26;
      $sumx=0;
      $sumy=0;
      $sumx2=0;
      $sumy2=0;
      $sumxy=0;
      $p=0;
      label = 9; break;
    case 9: 
      var $27=$p;
      var $_nof_points35=(($this1+8)|0);
      var $28=HEAP32[(($_nof_points35)>>2)];
      var $cmp36=(($27)|(0)) < (($28)|(0));
      if ($cmp36) { label = 10; break; } else { label = 12; break; }
    case 10: 
      var $29=$p;
      var $x37=(($this1+60)|0);
      var $30=HEAP32[(($x37)>>2)];
      var $arrayidx38=(($30+($29<<3))|0);
      var $31=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx38)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx38)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $xx=$31;
      var $32=$p;
      var $y39=(($this1+64)|0);
      var $33=HEAP32[(($y39)>>2)];
      var $arrayidx40=(($33+($32<<3))|0);
      var $34=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx40)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx40)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $yy=$34;
      var $35=$xmax;
      var $36=$xx;
      var $cmp41=$35 > $36;
      var $37=$xmax;
      var $38=$xx;
      var $cond=$cmp41 ? $37 : $38;
      $xmax=$cond;
      var $39=$xmin;
      var $40=$xx;
      var $cmp42=$39 < $40;
      var $41=$xmin;
      var $42=$xx;
      var $cond43=$cmp42 ? $41 : $42;
      $xmin=$cond43;
      var $43=$ymax;
      var $44=$yy;
      var $cmp44=$43 > $44;
      var $45=$ymax;
      var $46=$yy;
      var $cond45=$cmp44 ? $45 : $46;
      $ymax=$cond45;
      var $47=$ymin;
      var $48=$yy;
      var $cmp46=$47 < $48;
      var $49=$ymin;
      var $50=$yy;
      var $cond47=$cmp46 ? $49 : $50;
      $ymin=$cond47;
      var $51=$xx;
      var $52=$sumx;
      var $add48=($52)+($51);
      $sumx=$add48;
      var $53=$xx;
      var $54=$xx;
      var $mul49=($53)*($54);
      var $55=$sumx2;
      var $add50=($55)+($mul49);
      $sumx2=$add50;
      var $56=$yy;
      var $57=$sumy;
      var $add51=($57)+($56);
      $sumy=$add51;
      var $58=$yy;
      var $59=$yy;
      var $mul52=($58)*($59);
      var $60=$sumy2;
      var $add53=($60)+($mul52);
      $sumy2=$add53;
      var $61=$xx;
      var $62=$yy;
      var $mul54=($61)*($62);
      var $63=$sumxy;
      var $add55=($63)+($mul54);
      $sumxy=$add55;
      label = 11; break;
    case 11: 
      var $64=$p;
      var $inc=((($64)+(1))|0);
      $p=$inc;
      label = 9; break;
    case 12: 
      var $65=$xmax;
      var $66=$xmin;
      var $sub56=($65)-($66);
      $delx=$sub56;
      var $67=$ymax;
      var $68=$ymin;
      var $sub57=($67)-($68);
      $dely=$sub57;
      var $69=$sumx2;
      var $70=$sumx;
      var $71=$sumx;
      var $mul58=($70)*($71);
      var $_nof_points59=(($this1+8)|0);
      var $72=HEAP32[(($_nof_points59)>>2)];
      var $conv=(($72)|(0));
      var $div60=($mul58)/($conv);
      var $sub61=($69)-($div60);
      $SSxx=$sub61;
      var $73=$sumy2;
      var $74=$sumy;
      var $75=$sumy;
      var $mul62=($74)*($75);
      var $_nof_points63=(($this1+8)|0);
      var $76=HEAP32[(($_nof_points63)>>2)];
      var $conv64=(($76)|(0));
      var $div65=($mul62)/($conv64);
      var $sub66=($73)-($div65);
      $SSyy=$sub66;
      var $77=$sumxy;
      var $78=$sumx;
      var $79=$sumy;
      var $mul67=($78)*($79);
      var $_nof_points68=(($this1+8)|0);
      var $80=HEAP32[(($_nof_points68)>>2)];
      var $conv69=(($80)|(0));
      var $div70=($mul67)/($conv69);
      var $sub71=($77)-($div70);
      $SSxy=$sub71;
      var $81=$delx;
      var $82=$dely;
      var $mul72=($82)*(0.001);
      var $cmp73=$81 < $mul72;
      if ($cmp73) { label = 15; break; } else { label = 13; break; }
    case 13: 
      var $83=$dely;
      var $84=$delx;
      var $mul74=($84)*(0.001);
      var $cmp75=$83 < $mul74;
      if ($cmp75) { label = 15; break; } else { label = 14; break; }
    case 14: 
      var $85=$SSxy;
      var $86=$SSxy;
      var $mul77=($85)*($86);
      var $87=$SSxx;
      var $88=$SSyy;
      var $mul78=($87)*($88);
      var $div79=($mul77)/($mul78);
      var $call=Math.abs($div79);
      var $cmp80=$call > 0.99;
      if ($cmp80) { label = 15; break; } else { label = 33; break; }
    case 15: 
      var $type82=(($this1)|0);
      HEAP32[(($type82)>>2)]=3;
      var $_nof_points83=(($this1+8)|0);
      var $89=HEAP32[(($_nof_points83)>>2)];
      var $conv84=(($89)|(0));
      var $90=$sumx2;
      var $mul85=($conv84)*($90);
      var $91=$sumx;
      var $92=$sumx;
      var $mul86=($91)*($92);
      var $sub87=($mul85)-($mul86);
      var $_dx88=(($this1+44)|0);
      (HEAPF64[(tempDoublePtr)>>3]=$sub87,HEAP32[(($_dx88)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dx88)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_nof_points89=(($this1+8)|0);
      var $93=HEAP32[(($_nof_points89)>>2)];
      var $conv90=(($93)|(0));
      var $94=$sumy2;
      var $mul91=($conv90)*($94);
      var $95=$sumy;
      var $96=$sumy;
      var $mul92=($95)*($96);
      var $sub93=($mul91)-($mul92);
      var $_dy94=(($this1+52)|0);
      (HEAPF64[(tempDoublePtr)>>3]=$sub93,HEAP32[(($_dy94)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dy94)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_dx96=(($this1+44)|0);
      var $97=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx96)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx96)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_dx97=(($this1+44)|0);
      var $98=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx97)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx97)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul98=($97)*($98);
      var $_dy99=(($this1+52)|0);
      var $99=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy99)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy99)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_dy100=(($this1+52)|0);
      var $100=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy100)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy100)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul101=($99)*($100);
      var $add102=($mul98)+($mul101);
      var $call103=Math.sqrt($add102);
      var $div104=(1)/($call103);
      $fact95=$div104;
      var $101=$fact95;
      var $_dx105=(($this1+44)|0);
      var $102=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx105)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx105)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul106=($102)*($101);
      (HEAPF64[(tempDoublePtr)>>3]=$mul106,HEAP32[(($_dx105)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dx105)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $103=$fact95;
      var $_dy107=(($this1+52)|0);
      var $104=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy107)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy107)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul108=($104)*($103);
      (HEAPF64[(tempDoublePtr)>>3]=$mul108,HEAP32[(($_dy107)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($_dy107)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      $p=0;
      label = 16; break;
    case 16: 
      var $105=$p;
      var $_nof_points110=(($this1+8)|0);
      var $106=HEAP32[(($_nof_points110)>>2)];
      var $cmp111=(($105)|(0)) < (($106)|(0));
      if ($cmp111) { label = 17; break; } else { label = 19; break; }
    case 17: 
      var $107=$p;
      var $x113=(($this1+60)|0);
      var $108=HEAP32[(($x113)>>2)];
      var $arrayidx114=(($108+($107<<3))|0);
      var $109=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx114)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx114)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $x115=(($this1+60)|0);
      var $110=HEAP32[(($x115)>>2)];
      var $arrayidx116=(($110)|0);
      var $111=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx116)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx116)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub117=($109)-($111);
      $dxp=$sub117;
      var $112=$p;
      var $y118=(($this1+64)|0);
      var $113=HEAP32[(($y118)>>2)];
      var $arrayidx119=(($113+($112<<3))|0);
      var $114=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx119)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx119)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $y120=(($this1+64)|0);
      var $115=HEAP32[(($y120)>>2)];
      var $arrayidx121=(($115)|0);
      var $116=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx121)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx121)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub122=($114)-($116);
      $dyp=$sub122;
      var $_dx123=(($this1+44)|0);
      var $117=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx123)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx123)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $118=$dxp;
      var $mul124=($117)*($118);
      var $_dy125=(($this1+52)|0);
      var $119=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy125)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy125)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $120=$dyp;
      var $mul126=($119)*($120);
      var $add127=($mul124)+($mul126);
      var $121=$p;
      var $u=(($this1+84)|0);
      var $122=HEAP32[(($u)>>2)];
      var $arrayidx128=(($122+($121<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$add127,HEAP32[(($arrayidx128)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx128)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $123=$p;
      var $unused=(($this1+88)|0);
      var $124=HEAP32[(($unused)>>2)];
      var $arrayidx129=(($124+($123<<2))|0);
      HEAP32[(($arrayidx129)>>2)]=1;
      label = 18; break;
    case 18: 
      var $125=$p;
      var $inc131=((($125)+(1))|0);
      $p=$inc131;
      label = 16; break;
    case 19: 
      $p=0;
      label = 20; break;
    case 20: 
      var $126=$p;
      var $_nof_points134=(($this1+8)|0);
      var $127=HEAP32[(($_nof_points134)>>2)];
      var $cmp135=(($126)|(0)) < (($127)|(0));
      if ($cmp135) { label = 21; break; } else { label = 32; break; }
    case 21: 
      $min_index=-1;
      $min_u=0;
      $p1=0;
      label = 22; break;
    case 22: 
      var $128=$p1;
      var $_nof_points138=(($this1+8)|0);
      var $129=HEAP32[(($_nof_points138)>>2)];
      var $cmp139=(($128)|(0)) < (($129)|(0));
      if ($cmp139) { label = 23; break; } else { label = 30; break; }
    case 23: 
      var $130=$p1;
      var $unused141=(($this1+88)|0);
      var $131=HEAP32[(($unused141)>>2)];
      var $arrayidx142=(($131+($130<<2))|0);
      var $132=HEAP32[(($arrayidx142)>>2)];
      var $tobool=(($132)|(0))!=0;
      if ($tobool) { label = 24; break; } else { label = 28; break; }
    case 24: 
      var $133=$min_index;
      var $cmp144=(($133)|(0)) < 0;
      if ($cmp144) { label = 26; break; } else { label = 25; break; }
    case 25: 
      var $134=$p1;
      var $u146=(($this1+84)|0);
      var $135=HEAP32[(($u146)>>2)];
      var $arrayidx147=(($135+($134<<3))|0);
      var $136=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx147)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx147)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $137=$min_u;
      var $cmp148=$136 < $137;
      if ($cmp148) { label = 26; break; } else { label = 27; break; }
    case 26: 
      var $138=$p1;
      $min_index=$138;
      var $139=$p1;
      var $u150=(($this1+84)|0);
      var $140=HEAP32[(($u150)>>2)];
      var $arrayidx151=(($140+($139<<3))|0);
      var $141=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx151)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx151)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $min_u=$141;
      label = 27; break;
    case 27: 
      label = 28; break;
    case 28: 
      label = 29; break;
    case 29: 
      var $142=$p1;
      var $inc155=((($142)+(1))|0);
      $p1=$inc155;
      label = 22; break;
    case 30: 
      var $143=$min_index;
      var $144=$p;
      var $index=(($this1+92)|0);
      var $145=HEAP32[(($index)>>2)];
      var $arrayidx157=(($145+($144<<2))|0);
      HEAP32[(($arrayidx157)>>2)]=$143;
      var $146=$min_index;
      var $unused158=(($this1+88)|0);
      var $147=HEAP32[(($unused158)>>2)];
      var $arrayidx159=(($147+($146<<2))|0);
      HEAP32[(($arrayidx159)>>2)]=0;
      label = 31; break;
    case 31: 
      var $148=$p;
      var $inc161=((($148)+(1))|0);
      $p=$inc161;
      label = 20; break;
    case 32: 
      $retval=3;
      label = 74; break;
    case 33: 
      var $type164=(($this1)|0);
      HEAP32[(($type164)>>2)]=4;
      var $_AA=(($this1+96)|0);
      var $149=HEAP32[(($_AA)>>2)];
      var $tobool165=(($149)|(0))!=0;
      if ($tobool165) { label = 34; break; } else { label = 35; break; }
    case 34: 
      var $_AA167=(($this1+96)|0);
      var $150=HEAP32[(($_AA167)>>2)];
      var $151=$150;
      _free($151);
      label = 35; break;
    case 35: 
      var $_Ainv=(($this1+100)|0);
      var $152=HEAP32[(($_Ainv)>>2)];
      var $tobool169=(($152)|(0))!=0;
      if ($tobool169) { label = 36; break; } else { label = 37; break; }
    case 36: 
      var $_Ainv171=(($this1+100)|0);
      var $153=HEAP32[(($_Ainv171)>>2)];
      var $154=$153;
      _free($154);
      label = 37; break;
    case 37: 
      var $_nof_points173=(($this1+8)|0);
      var $155=HEAP32[(($_nof_points173)>>2)];
      var $add174=((($155)+(3))|0);
      var $_nof_eqs=(($this1+16)|0);
      HEAP32[(($_nof_eqs)>>2)]=$add174;
      var $_nof_eqs175=(($this1+16)|0);
      var $156=HEAP32[(($_nof_eqs175)>>2)];
      var $_nof_eqs176=(($this1+16)|0);
      var $157=HEAP32[(($_nof_eqs176)>>2)];
      var $mul177=Math.imul($156,$157);
      var $call178=_calloc($mul177, 8);
      var $158=$call178;
      var $_AA179=(($this1+96)|0);
      HEAP32[(($_AA179)>>2)]=$158;
      var $_nof_eqs180=(($this1+16)|0);
      var $159=HEAP32[(($_nof_eqs180)>>2)];
      var $_nof_eqs181=(($this1+16)|0);
      var $160=HEAP32[(($_nof_eqs181)>>2)];
      var $mul182=Math.imul($159,$160);
      var $call183=_calloc($mul182, 8);
      var $161=$call183;
      var $_Ainv184=(($this1+100)|0);
      HEAP32[(($_Ainv184)>>2)]=$161;
      $r=0;
      label = 38; break;
    case 38: 
      var $162=$r;
      var $cmp186=(($162)|(0)) < 3;
      if ($cmp186) { label = 39; break; } else { label = 45; break; }
    case 39: 
      $c=0;
      label = 40; break;
    case 40: 
      var $163=$c;
      var $cmp189=(($163)|(0)) < 3;
      if ($cmp189) { label = 41; break; } else { label = 43; break; }
    case 41: 
      var $_nof_eqs191=(($this1+16)|0);
      var $164=HEAP32[(($_nof_eqs191)>>2)];
      var $165=$r;
      var $mul192=Math.imul($164,$165);
      var $166=$c;
      var $add193=((($mul192)+($166))|0);
      var $_AA194=(($this1+96)|0);
      var $167=HEAP32[(($_AA194)>>2)];
      var $arrayidx195=(($167+($add193<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($arrayidx195)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx195)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 42; break;
    case 42: 
      var $168=$c;
      var $inc197=((($168)+(1))|0);
      $c=$inc197;
      label = 40; break;
    case 43: 
      label = 44; break;
    case 44: 
      var $169=$r;
      var $inc200=((($169)+(1))|0);
      $r=$inc200;
      label = 38; break;
    case 45: 
      $c=0;
      label = 46; break;
    case 46: 
      var $170=$c;
      var $_nof_points203=(($this1+8)|0);
      var $171=HEAP32[(($_nof_points203)>>2)];
      var $cmp204=(($170)|(0)) < (($171)|(0));
      if ($cmp204) { label = 47; break; } else { label = 49; break; }
    case 47: 
      var $_nof_eqs206=(($this1+16)|0);
      var $172=HEAP32[(($_nof_eqs206)>>2)];
      var $mul207=0;
      var $173=$c;
      var $add208=((($173)+(3))|0);
      var $add209=((($mul207)+($add208))|0);
      var $_AA210=(($this1+96)|0);
      var $174=HEAP32[(($_AA210)>>2)];
      var $arrayidx211=(($174+($add209<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=1,HEAP32[(($arrayidx211)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx211)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $175=$c;
      var $x212=(($this1+60)|0);
      var $176=HEAP32[(($x212)>>2)];
      var $arrayidx213=(($176+($175<<3))|0);
      var $177=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx213)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx213)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_nof_eqs214=(($this1+16)|0);
      var $178=HEAP32[(($_nof_eqs214)>>2)];
      var $mul215=$178;
      var $179=$c;
      var $add216=((($179)+(3))|0);
      var $add217=((($mul215)+($add216))|0);
      var $_AA218=(($this1+96)|0);
      var $180=HEAP32[(($_AA218)>>2)];
      var $arrayidx219=(($180+($add217<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$177,HEAP32[(($arrayidx219)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx219)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $181=$c;
      var $y220=(($this1+64)|0);
      var $182=HEAP32[(($y220)>>2)];
      var $arrayidx221=(($182+($181<<3))|0);
      var $183=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx221)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx221)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_nof_eqs222=(($this1+16)|0);
      var $184=HEAP32[(($_nof_eqs222)>>2)];
      var $mul223=($184<<1);
      var $185=$c;
      var $add224=((($185)+(3))|0);
      var $add225=((($mul223)+($add224))|0);
      var $_AA226=(($this1+96)|0);
      var $186=HEAP32[(($_AA226)>>2)];
      var $arrayidx227=(($186+($add225<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$183,HEAP32[(($arrayidx227)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx227)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $_nof_eqs228=(($this1+16)|0);
      var $187=HEAP32[(($_nof_eqs228)>>2)];
      var $188=$c;
      var $add229=((($188)+(3))|0);
      var $mul230=Math.imul($187,$add229);
      var $add231=(($mul230)|0);
      var $_AA232=(($this1+96)|0);
      var $189=HEAP32[(($_AA232)>>2)];
      var $arrayidx233=(($189+($add231<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=1,HEAP32[(($arrayidx233)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx233)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $190=$c;
      var $x234=(($this1+60)|0);
      var $191=HEAP32[(($x234)>>2)];
      var $arrayidx235=(($191+($190<<3))|0);
      var $192=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx235)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx235)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_nof_eqs236=(($this1+16)|0);
      var $193=HEAP32[(($_nof_eqs236)>>2)];
      var $194=$c;
      var $add237=((($194)+(3))|0);
      var $mul238=Math.imul($193,$add237);
      var $add239=((($mul238)+(1))|0);
      var $_AA240=(($this1+96)|0);
      var $195=HEAP32[(($_AA240)>>2)];
      var $arrayidx241=(($195+($add239<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$192,HEAP32[(($arrayidx241)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx241)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $196=$c;
      var $y242=(($this1+64)|0);
      var $197=HEAP32[(($y242)>>2)];
      var $arrayidx243=(($197+($196<<3))|0);
      var $198=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx243)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx243)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_nof_eqs244=(($this1+16)|0);
      var $199=HEAP32[(($_nof_eqs244)>>2)];
      var $200=$c;
      var $add245=((($200)+(3))|0);
      var $mul246=Math.imul($199,$add245);
      var $add247=((($mul246)+(2))|0);
      var $_AA248=(($this1+96)|0);
      var $201=HEAP32[(($_AA248)>>2)];
      var $arrayidx249=(($201+($add247<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$198,HEAP32[(($arrayidx249)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx249)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 48; break;
    case 48: 
      var $202=$c;
      var $inc251=((($202)+(1))|0);
      $c=$inc251;
      label = 46; break;
    case 49: 
      $r=0;
      label = 50; break;
    case 50: 
      var $203=$r;
      var $_nof_points254=(($this1+8)|0);
      var $204=HEAP32[(($_nof_points254)>>2)];
      var $cmp255=(($203)|(0)) < (($204)|(0));
      if ($cmp255) { label = 51; break; } else { label = 59; break; }
    case 51: 
      var $205=$r;
      $c=$205;
      label = 52; break;
    case 52: 
      var $206=$c;
      var $_nof_points258=(($this1+8)|0);
      var $207=HEAP32[(($_nof_points258)>>2)];
      var $cmp259=(($206)|(0)) < (($207)|(0));
      if ($cmp259) { label = 53; break; } else { label = 57; break; }
    case 53: 
      var $208=$r;
      var $x261=(($this1+60)|0);
      var $209=HEAP32[(($x261)>>2)];
      var $arrayidx262=(($209+($208<<3))|0);
      var $210=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx262)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx262)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $211=$r;
      var $y263=(($this1+64)|0);
      var $212=HEAP32[(($y263)>>2)];
      var $arrayidx264=(($212+($211<<3))|0);
      var $213=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx264)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx264)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $214=$c;
      var $x265=(($this1+60)|0);
      var $215=HEAP32[(($x265)>>2)];
      var $arrayidx266=(($215+($214<<3))|0);
      var $216=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx266)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx266)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $217=$c;
      var $y267=(($this1+64)|0);
      var $218=HEAP32[(($y267)>>2)];
      var $arrayidx268=(($218+($217<<3))|0);
      var $219=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx268)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx268)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $call269=__ZN17VizGeorefSpline2D9base_funcEdddd($this1, $210, $213, $216, $219);
      var $_nof_eqs270=(($this1+16)|0);
      var $220=HEAP32[(($_nof_eqs270)>>2)];
      var $221=$r;
      var $add271=((($221)+(3))|0);
      var $mul272=Math.imul($220,$add271);
      var $222=$c;
      var $add273=((($222)+(3))|0);
      var $add274=((($mul272)+($add273))|0);
      var $_AA275=(($this1+96)|0);
      var $223=HEAP32[(($_AA275)>>2)];
      var $arrayidx276=(($223+($add274<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$call269,HEAP32[(($arrayidx276)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx276)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $224=$r;
      var $225=$c;
      var $cmp277=(($224)|(0))!=(($225)|(0));
      if ($cmp277) { label = 54; break; } else { label = 55; break; }
    case 54: 
      var $_nof_eqs279=(($this1+16)|0);
      var $226=HEAP32[(($_nof_eqs279)>>2)];
      var $227=$r;
      var $add280=((($227)+(3))|0);
      var $mul281=Math.imul($226,$add280);
      var $228=$c;
      var $add282=((($228)+(3))|0);
      var $add283=((($mul281)+($add282))|0);
      var $_AA284=(($this1+96)|0);
      var $229=HEAP32[(($_AA284)>>2)];
      var $arrayidx285=(($229+($add283<<3))|0);
      var $230=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx285)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx285)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $_nof_eqs286=(($this1+16)|0);
      var $231=HEAP32[(($_nof_eqs286)>>2)];
      var $232=$c;
      var $add287=((($232)+(3))|0);
      var $mul288=Math.imul($231,$add287);
      var $233=$r;
      var $add289=((($233)+(3))|0);
      var $add290=((($mul288)+($add289))|0);
      var $_AA291=(($this1+96)|0);
      var $234=HEAP32[(($_AA291)>>2)];
      var $arrayidx292=(($234+($add290<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$230,HEAP32[(($arrayidx292)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx292)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 55; break;
    case 55: 
      label = 56; break;
    case 56: 
      var $235=$c;
      var $inc295=((($235)+(1))|0);
      $c=$inc295;
      label = 52; break;
    case 57: 
      label = 58; break;
    case 58: 
      var $236=$r;
      var $inc298=((($236)+(1))|0);
      $r=$inc298;
      label = 50; break;
    case 59: 
      var $_nof_eqs300=(($this1+16)|0);
      var $237=HEAP32[(($_nof_eqs300)>>2)];
      var $_AA301=(($this1+96)|0);
      var $238=HEAP32[(($_AA301)>>2)];
      var $_Ainv302=(($this1+100)|0);
      var $239=HEAP32[(($_Ainv302)>>2)];
      var $call303=__Z12matrixInvertiPdS_($237, $238, $239);
      $status=$call303;
      var $240=$status;
      var $tobool304=(($240)|(0))!=0;
      if ($tobool304) { label = 61; break; } else { label = 60; break; }
    case 60: 
      $retval=0;
      label = 74; break;
    case 61: 
      $v=0;
      label = 62; break;
    case 62: 
      var $241=$v;
      var $_nof_vars=(($this1+4)|0);
      var $242=HEAP32[(($_nof_vars)>>2)];
      var $cmp308=(($241)|(0)) < (($242)|(0));
      if ($cmp308) { label = 63; break; } else { label = 73; break; }
    case 63: 
      $r=0;
      label = 64; break;
    case 64: 
      var $243=$r;
      var $_nof_eqs311=(($this1+16)|0);
      var $244=HEAP32[(($_nof_eqs311)>>2)];
      var $cmp312=(($243)|(0)) < (($244)|(0));
      if ($cmp312) { label = 65; break; } else { label = 71; break; }
    case 65: 
      var $245=$r;
      var $246=$v;
      var $coef=(($this1+76)|0);
      var $arrayidx314=(($coef+($246<<2))|0);
      var $247=HEAP32[(($arrayidx314)>>2)];
      var $arrayidx315=(($247+($245<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($arrayidx315)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx315)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      $c=0;
      label = 66; break;
    case 66: 
      var $248=$c;
      var $_nof_eqs317=(($this1+16)|0);
      var $249=HEAP32[(($_nof_eqs317)>>2)];
      var $cmp318=(($248)|(0)) < (($249)|(0));
      if ($cmp318) { label = 67; break; } else { label = 69; break; }
    case 67: 
      var $_nof_eqs320=(($this1+16)|0);
      var $250=HEAP32[(($_nof_eqs320)>>2)];
      var $251=$r;
      var $mul321=Math.imul($250,$251);
      var $252=$c;
      var $add322=((($mul321)+($252))|0);
      var $_Ainv323=(($this1+100)|0);
      var $253=HEAP32[(($_Ainv323)>>2)];
      var $arrayidx324=(($253+($add322<<3))|0);
      var $254=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx324)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx324)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $255=$c;
      var $256=$v;
      var $rhs=(($this1+68)|0);
      var $arrayidx325=(($rhs+($256<<2))|0);
      var $257=HEAP32[(($arrayidx325)>>2)];
      var $arrayidx326=(($257+($255<<3))|0);
      var $258=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx326)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx326)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul327=($254)*($258);
      var $259=$r;
      var $260=$v;
      var $coef328=(($this1+76)|0);
      var $arrayidx329=(($coef328+($260<<2))|0);
      var $261=HEAP32[(($arrayidx329)>>2)];
      var $arrayidx330=(($261+($259<<3))|0);
      var $262=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx330)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx330)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $add331=($262)+($mul327);
      (HEAPF64[(tempDoublePtr)>>3]=$add331,HEAP32[(($arrayidx330)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx330)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 68; break;
    case 68: 
      var $263=$c;
      var $inc333=((($263)+(1))|0);
      $c=$inc333;
      label = 66; break;
    case 69: 
      label = 70; break;
    case 70: 
      var $264=$r;
      var $inc336=((($264)+(1))|0);
      $r=$inc336;
      label = 64; break;
    case 71: 
      label = 72; break;
    case 72: 
      var $265=$v;
      var $inc339=((($265)+(1))|0);
      $v=$inc339;
      label = 62; break;
    case 73: 
      $retval=4;
      label = 74; break;
    case 74: 
      var $266=$retval;

      return $266;
    default: assert(0, "bad label: " + label);
  }

}
Module["__ZN17VizGeorefSpline2D5solveEv"] = __ZN17VizGeorefSpline2D5solveEv;

function __ZN17VizGeorefSpline2D9base_funcEdddd($this, $x1, $y1, $x2, $y2) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $this_addr;
      var $x1_addr;
      var $y1_addr;
      var $x2_addr;
      var $y2_addr;
      var $dist;
      $this_addr=$this;
      $x1_addr=$x1;
      $y1_addr=$y1;
      $x2_addr=$x2;
      $y2_addr=$y2;
      var $this1=$this_addr;
      var $0=$x1_addr;
      var $1=$x2_addr;
      var $cmp=$0 == $1;
      if ($cmp) { label = 3; break; } else { label = 5; break; }
    case 3: 
      var $2=$y1_addr;
      var $3=$y2_addr;
      var $cmp2=$2 == $3;
      if ($cmp2) { label = 4; break; } else { label = 5; break; }
    case 4: 
      $retval=0;
      label = 6; break;
    case 5: 
      var $4=$x2_addr;
      var $5=$x1_addr;
      var $sub=($4)-($5);
      var $6=$x2_addr;
      var $7=$x1_addr;
      var $sub3=($6)-($7);
      var $mul=($sub)*($sub3);
      var $8=$y2_addr;
      var $9=$y1_addr;
      var $sub4=($8)-($9);
      var $10=$y2_addr;
      var $11=$y1_addr;
      var $sub5=($10)-($11);
      var $mul6=($sub4)*($sub5);
      var $add=($mul)+($mul6);
      $dist=$add;
      var $12=$dist;
      var $13=$dist;
      var $call=Math.log($13);
      var $mul7=($12)*($call);
      $retval=$mul7;
      label = 6; break;
    case 6: 
      var $14=$retval;

      return $14;
    default: assert(0, "bad label: " + label);
  }

}


function __Z12matrixInvertiPdS_($N, $input, $output) {
  var label = 0;
  var __stackBase__  = STACKTOP; assert(STACKTOP|0 % 4 == 0); assert(STACKTOP < STACK_MAX);
  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $N_addr;
      var $input_addr;
      var $output_addr;
      var $row;
      var $col;
      var $tempSize;
      var $temp;
      var $ftemp;
      var $max;
      var $k;
      $N_addr=$N;
      $input_addr=$input;
      $output_addr=$output;
      var $0=$N_addr;
      var $mul=($0<<1);
      var $1=$N_addr;
      var $mul1=Math.imul($mul,$1);
      $tempSize=$mul1;
      var $2=$tempSize;
      var $3$0=_llvm_umul_with_overflow_i32($2, 8);
      var $3$1=tempRet0;
      var $4=$3$1;
      var $5=$3$0;
      var $6=$4 ? -1 : $5;
      var $call=__Znaj($6);
      var $7=$call;
      $temp=$7;
      var $8=$temp;
      var $cmp=(($8)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $9=HEAP32[((_stderr)>>2)];
      var $call2=_fprintf($9, ((5242904)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+3)>>2)<<2),assert(STACKTOP|0 < STACK_MAX|0),HEAP32[((tempInt)>>2)]=0,tempInt));
      $retval=0;
      label = 59; break;
    case 4: 
      $row=0;
      label = 5; break;
    case 5: 
      var $10=$row;
      var $11=$N_addr;
      var $cmp3=(($10)|(0)) < (($11)|(0));
      if ($cmp3) { label = 6; break; } else { label = 12; break; }
    case 6: 
      $col=0;
      label = 7; break;
    case 7: 
      var $12=$col;
      var $13=$N_addr;
      var $cmp5=(($12)|(0)) < (($13)|(0));
      if ($cmp5) { label = 8; break; } else { label = 10; break; }
    case 8: 
      var $14=$row;
      var $15=$N_addr;
      var $mul7=Math.imul($14,$15);
      var $16=$col;
      var $add=((($mul7)+($16))|0);
      var $17=$input_addr;
      var $arrayidx=(($17+($add<<3))|0);
      var $18=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $19=$row;
      var $mul8=($19<<1);
      var $20=$N_addr;
      var $mul9=Math.imul($mul8,$20);
      var $21=$col;
      var $add10=((($mul9)+($21))|0);
      var $22=$temp;
      var $arrayidx11=(($22+($add10<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$18,HEAP32[(($arrayidx11)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx11)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $23=$row;
      var $mul12=($23<<1);
      var $24=$N_addr;
      var $mul13=Math.imul($mul12,$24);
      var $25=$col;
      var $add14=((($mul13)+($25))|0);
      var $26=$N_addr;
      var $add15=((($add14)+($26))|0);
      var $27=$temp;
      var $arrayidx16=(($27+($add15<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($arrayidx16)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx16)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 9; break;
    case 9: 
      var $28=$col;
      var $inc=((($28)+(1))|0);
      $col=$inc;
      label = 7; break;
    case 10: 
      var $29=$row;
      var $mul17=($29<<1);
      var $30=$N_addr;
      var $mul18=Math.imul($mul17,$30);
      var $31=$row;
      var $add19=((($mul18)+($31))|0);
      var $32=$N_addr;
      var $add20=((($add19)+($32))|0);
      var $33=$temp;
      var $arrayidx21=(($33+($add20<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=1,HEAP32[(($arrayidx21)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx21)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 11; break;
    case 11: 
      var $34=$row;
      var $inc23=((($34)+(1))|0);
      $row=$inc23;
      label = 5; break;
    case 12: 
      $k=0;
      $k=0;
      label = 13; break;
    case 13: 
      var $35=$k;
      var $36=$N_addr;
      var $cmp26=(($35)|(0)) < (($36)|(0));
      if ($cmp26) { label = 14; break; } else { label = 48; break; }
    case 14: 
      var $37=$k;
      var $add28=((($37)+(1))|0);
      var $38=$N_addr;
      var $cmp29=(($add28)|(0)) < (($38)|(0));
      if ($cmp29) { label = 15; break; } else { label = 28; break; }
    case 15: 
      var $39=$k;
      $max=$39;
      var $40=$k;
      var $add31=((($40)+(1))|0);
      $row=$add31;
      label = 16; break;
    case 16: 
      var $41=$row;
      var $42=$N_addr;
      var $cmp33=(($41)|(0)) < (($42)|(0));
      if ($cmp33) { label = 17; break; } else { label = 21; break; }
    case 17: 
      var $43=$row;
      var $mul35=($43<<1);
      var $44=$N_addr;
      var $mul36=Math.imul($mul35,$44);
      var $45=$k;
      var $add37=((($mul36)+($45))|0);
      var $46=$temp;
      var $arrayidx38=(($46+($add37<<3))|0);
      var $47=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx38)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx38)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $call39=Math.abs($47);
      var $48=$max;
      var $mul40=($48<<1);
      var $49=$N_addr;
      var $mul41=Math.imul($mul40,$49);
      var $50=$k;
      var $add42=((($mul41)+($50))|0);
      var $51=$temp;
      var $arrayidx43=(($51+($add42<<3))|0);
      var $52=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx43)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx43)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $call44=Math.abs($52);
      var $cmp45=$call39 > $call44;
      if ($cmp45) { label = 18; break; } else { label = 19; break; }
    case 18: 
      var $53=$row;
      $max=$53;
      label = 19; break;
    case 19: 
      label = 20; break;
    case 20: 
      var $54=$row;
      var $inc49=((($54)+(1))|0);
      $row=$inc49;
      label = 16; break;
    case 21: 
      var $55=$max;
      var $56=$k;
      var $cmp51=(($55)|(0))!=(($56)|(0));
      if ($cmp51) { label = 22; break; } else { label = 27; break; }
    case 22: 
      var $57=$k;
      $col=$57;
      label = 23; break;
    case 23: 
      var $58=$col;
      var $59=$N_addr;
      var $mul54=($59<<1);
      var $cmp55=(($58)|(0)) < (($mul54)|(0));
      if ($cmp55) { label = 24; break; } else { label = 26; break; }
    case 24: 
      var $60=$k;
      var $mul57=($60<<1);
      var $61=$N_addr;
      var $mul58=Math.imul($mul57,$61);
      var $62=$col;
      var $add59=((($mul58)+($62))|0);
      var $63=$temp;
      var $arrayidx60=(($63+($add59<<3))|0);
      var $64=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx60)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx60)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $ftemp=$64;
      var $65=$max;
      var $mul61=($65<<1);
      var $66=$N_addr;
      var $mul62=Math.imul($mul61,$66);
      var $67=$col;
      var $add63=((($mul62)+($67))|0);
      var $68=$temp;
      var $arrayidx64=(($68+($add63<<3))|0);
      var $69=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx64)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx64)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $70=$k;
      var $mul65=($70<<1);
      var $71=$N_addr;
      var $mul66=Math.imul($mul65,$71);
      var $72=$col;
      var $add67=((($mul66)+($72))|0);
      var $73=$temp;
      var $arrayidx68=(($73+($add67<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$69,HEAP32[(($arrayidx68)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx68)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      var $74=$ftemp;
      var $75=$max;
      var $mul69=($75<<1);
      var $76=$N_addr;
      var $mul70=Math.imul($mul69,$76);
      var $77=$col;
      var $add71=((($mul70)+($77))|0);
      var $78=$temp;
      var $arrayidx72=(($78+($add71<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$74,HEAP32[(($arrayidx72)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx72)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 25; break;
    case 25: 
      var $79=$col;
      var $inc74=((($79)+(1))|0);
      $col=$inc74;
      label = 23; break;
    case 26: 
      label = 27; break;
    case 27: 
      label = 28; break;
    case 28: 
      var $80=$k;
      var $mul78=($80<<1);
      var $81=$N_addr;
      var $mul79=Math.imul($mul78,$81);
      var $82=$k;
      var $add80=((($mul79)+($82))|0);
      var $83=$temp;
      var $arrayidx81=(($83+($add80<<3))|0);
      var $84=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx81)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx81)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $ftemp=$84;
      var $85=$ftemp;
      var $cmp82=$85 == 0;
      if ($cmp82) { label = 29; break; } else { label = 32; break; }
    case 29: 
      var $86=$temp;
      var $isnull=(($86)|(0))==0;
      if ($isnull) { label = 31; break; } else { label = 30; break; }
    case 30: 
      var $87=$86;
      __ZdaPv($87);
      label = 31; break;
    case 31: 
      $retval=0;
      label = 59; break;
    case 32: 
      var $88=$k;
      $col=$88;
      label = 33; break;
    case 33: 
      var $89=$col;
      var $90=$N_addr;
      var $mul86=($90<<1);
      var $cmp87=(($89)|(0)) < (($mul86)|(0));
      if ($cmp87) { label = 34; break; } else { label = 36; break; }
    case 34: 
      var $91=$ftemp;
      var $92=$k;
      var $mul89=($92<<1);
      var $93=$N_addr;
      var $mul90=Math.imul($mul89,$93);
      var $94=$col;
      var $add91=((($mul90)+($94))|0);
      var $95=$temp;
      var $arrayidx92=(($95+($add91<<3))|0);
      var $96=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx92)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx92)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $div=($96)/($91);
      (HEAPF64[(tempDoublePtr)>>3]=$div,HEAP32[(($arrayidx92)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx92)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 35; break;
    case 35: 
      var $97=$col;
      var $inc94=((($97)+(1))|0);
      $col=$inc94;
      label = 33; break;
    case 36: 
      $row=0;
      label = 37; break;
    case 37: 
      var $98=$row;
      var $99=$N_addr;
      var $cmp97=(($98)|(0)) < (($99)|(0));
      if ($cmp97) { label = 38; break; } else { label = 46; break; }
    case 38: 
      var $100=$row;
      var $101=$k;
      var $cmp99=(($100)|(0))!=(($101)|(0));
      if ($cmp99) { label = 39; break; } else { label = 44; break; }
    case 39: 
      var $102=$row;
      var $mul101=($102<<1);
      var $103=$N_addr;
      var $mul102=Math.imul($mul101,$103);
      var $104=$k;
      var $add103=((($mul102)+($104))|0);
      var $105=$temp;
      var $arrayidx104=(($105+($add103<<3))|0);
      var $106=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx104)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx104)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      $ftemp=$106;
      var $107=$k;
      $col=$107;
      label = 40; break;
    case 40: 
      var $108=$col;
      var $109=$N_addr;
      var $mul106=($109<<1);
      var $cmp107=(($108)|(0)) < (($mul106)|(0));
      if ($cmp107) { label = 41; break; } else { label = 43; break; }
    case 41: 
      var $110=$ftemp;
      var $111=$k;
      var $mul109=($111<<1);
      var $112=$N_addr;
      var $mul110=Math.imul($mul109,$112);
      var $113=$col;
      var $add111=((($mul110)+($113))|0);
      var $114=$temp;
      var $arrayidx112=(($114+($add111<<3))|0);
      var $115=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx112)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx112)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul113=($110)*($115);
      var $116=$row;
      var $mul114=($116<<1);
      var $117=$N_addr;
      var $mul115=Math.imul($mul114,$117);
      var $118=$col;
      var $add116=((($mul115)+($118))|0);
      var $119=$temp;
      var $arrayidx117=(($119+($add116<<3))|0);
      var $120=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx117)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx117)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub=($120)-($mul113);
      (HEAPF64[(tempDoublePtr)>>3]=$sub,HEAP32[(($arrayidx117)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx117)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 42; break;
    case 42: 
      var $121=$col;
      var $inc119=((($121)+(1))|0);
      $col=$inc119;
      label = 40; break;
    case 43: 
      label = 44; break;
    case 44: 
      label = 45; break;
    case 45: 
      var $122=$row;
      var $inc123=((($122)+(1))|0);
      $row=$inc123;
      label = 37; break;
    case 46: 
      label = 47; break;
    case 47: 
      var $123=$k;
      var $inc126=((($123)+(1))|0);
      $k=$inc126;
      label = 13; break;
    case 48: 
      $row=0;
      label = 49; break;
    case 49: 
      var $124=$row;
      var $125=$N_addr;
      var $cmp129=(($124)|(0)) < (($125)|(0));
      if ($cmp129) { label = 50; break; } else { label = 56; break; }
    case 50: 
      $col=0;
      label = 51; break;
    case 51: 
      var $126=$col;
      var $127=$N_addr;
      var $cmp132=(($126)|(0)) < (($127)|(0));
      if ($cmp132) { label = 52; break; } else { label = 54; break; }
    case 52: 
      var $128=$row;
      var $mul134=($128<<1);
      var $129=$N_addr;
      var $mul135=Math.imul($mul134,$129);
      var $130=$col;
      var $add136=((($mul135)+($130))|0);
      var $131=$N_addr;
      var $add137=((($add136)+($131))|0);
      var $132=$temp;
      var $arrayidx138=(($132+($add137<<3))|0);
      var $133=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx138)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx138)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $134=$row;
      var $135=$N_addr;
      var $mul139=Math.imul($134,$135);
      var $136=$col;
      var $add140=((($mul139)+($136))|0);
      var $137=$output_addr;
      var $arrayidx141=(($137+($add140<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$133,HEAP32[(($arrayidx141)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx141)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 53; break;
    case 53: 
      var $138=$col;
      var $inc143=((($138)+(1))|0);
      $col=$inc143;
      label = 51; break;
    case 54: 
      label = 55; break;
    case 55: 
      var $139=$row;
      var $inc146=((($139)+(1))|0);
      $row=$inc146;
      label = 49; break;
    case 56: 
      var $140=$temp;
      var $isnull148=(($140)|(0))==0;
      if ($isnull148) { label = 58; break; } else { label = 57; break; }
    case 57: 
      var $141=$140;
      __ZdaPv($141);
      label = 58; break;
    case 58: 
      $retval=1;
      label = 59; break;
    case 59: 
      var $142=$retval;
      STACKTOP = __stackBase__;
      return $142;
    default: assert(0, "bad label: " + label);
  }

}


function __ZN17VizGeorefSpline2D14serialize_sizeEv($this) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $this_addr;
      var $i_size;
      var $v_size;
      var $d_size;
      var $alloc_size;
      var $p_num;
      var $is_aa;
      var $a_num;
      $this_addr=$this;
      var $this1=$this_addr;
      $i_size=4;
      $v_size=4;
      $d_size=8;
      var $0=$i_size;
      var $mul=((($0)*(5))&-1);
      var $1=$v_size;
      var $add=((($mul)+($1))|0);
      var $2=$d_size;
      var $mul2=((($2)*(5))&-1);
      var $add3=((($add)+($mul2))|0);
      $alloc_size=$add3;
      var $_max_nof_points=(($this1+12)|0);
      var $3=HEAP32[(($_max_nof_points)>>2)];
      var $add4=((($3)+(3))|0);
      $p_num=$add4;
      $is_aa=0;
      var $4=$alloc_size;
      var $5=$i_size;
      var $mul5=($5<<1);
      var $6=$d_size;
      var $mul6=((($6)*(7))&-1);
      var $add7=((($mul5)+($mul6))|0);
      var $7=$p_num;
      var $mul8=Math.imul($add7,$7);
      var $add9=((($4)+($mul8))|0);
      $alloc_size=$add9;
      var $_nof_eqs=(($this1+16)|0);
      var $8=HEAP32[(($_nof_eqs)>>2)];
      var $_nof_eqs10=(($this1+16)|0);
      var $9=HEAP32[(($_nof_eqs10)>>2)];
      var $mul11=Math.imul($8,$9);
      $a_num=$mul11;
      var $_AA=(($this1+96)|0);
      var $10=HEAP32[(($_AA)>>2)];
      var $tobool=(($10)|(0))!=0;
      if ($tobool) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $11=$alloc_size;
      var $12=$d_size;
      var $13=$a_num;
      var $mul12=Math.imul($12,$13);
      var $mul13=($mul12<<1);
      var $add14=((($11)+($mul13))|0);
      $alloc_size=$add14;
      label = 4; break;
    case 4: 
      var $14=$alloc_size;

      return $14;
    default: assert(0, "bad label: " + label);
  }

}
Module["__ZN17VizGeorefSpline2D14serialize_sizeEv"] = __ZN17VizGeorefSpline2D14serialize_sizeEv;

function __ZN17VizGeorefSpline2D9get_pointEddPd($this, $Px, $Py, $vars) {
  var label = 0;
  var __stackBase__  = STACKTOP; assert(STACKTOP|0 % 4 == 0); assert(STACKTOP < STACK_MAX);
  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $this_addr;
      var $Px_addr;
      var $Py_addr;
      var $vars_addr;
      var $v;
      var $r;
      var $tmp;
      var $Pu;
      var $fact;
      var $leftP;
      var $rightP;
      var $found;
      $this_addr=$this;
      $Px_addr=$Px;
      $Py_addr=$Py;
      $vars_addr=$vars;
      var $this1=$this_addr;
      $leftP=0;
      $rightP=0;
      $found=0;
      var $type=(($this1)|0);
      var $0=HEAP32[(($type)>>2)];
      if ((($0)|(0))==0) {
        label = 3; break;
      }
      else if ((($0)|(0))==1) {
        label = 8; break;
      }
      else if ((($0)|(0))==2) {
        label = 13; break;
      }
      else if ((($0)|(0))==3) {
        label = 18; break;
      }
      else if ((($0)|(0))==4) {
        label = 38; break;
      }
      else if ((($0)|(0))==5) {
        label = 51; break;
      }
      else if ((($0)|(0))==6) {
        label = 56; break;
      }
      else {
      label = 61; break;
      }
      
    case 3: 
      $v=0;
      label = 4; break;
    case 4: 
      var $1=$v;
      var $_nof_vars=(($this1+4)|0);
      var $2=HEAP32[(($_nof_vars)>>2)];
      var $cmp=(($1)|(0)) < (($2)|(0));
      if ($cmp) { label = 5; break; } else { label = 7; break; }
    case 5: 
      var $3=$v;
      var $4=$vars_addr;
      var $arrayidx=(($4+($3<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($arrayidx)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 6; break;
    case 6: 
      var $5=$v;
      var $inc=((($5)+(1))|0);
      $v=$inc;
      label = 4; break;
    case 7: 
      label = 62; break;
    case 8: 
      $v=0;
      label = 9; break;
    case 9: 
      var $6=$v;
      var $_nof_vars9=(($this1+4)|0);
      var $7=HEAP32[(($_nof_vars9)>>2)];
      var $cmp10=(($6)|(0)) < (($7)|(0));
      if ($cmp10) { label = 10; break; } else { label = 12; break; }
    case 10: 
      var $8=$v;
      var $rhs=(($this1+68)|0);
      var $arrayidx12=(($rhs+($8<<2))|0);
      var $9=HEAP32[(($arrayidx12)>>2)];
      var $arrayidx13=(($9+24)|0);
      var $10=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx13)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx13)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $11=$v;
      var $12=$vars_addr;
      var $arrayidx14=(($12+($11<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$10,HEAP32[(($arrayidx14)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx14)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 11; break;
    case 11: 
      var $13=$v;
      var $inc16=((($13)+(1))|0);
      $v=$inc16;
      label = 9; break;
    case 12: 
      label = 62; break;
    case 13: 
      var $_dx=(($this1+44)|0);
      var $14=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $15=$Px_addr;
      var $x=(($this1+60)|0);
      var $16=HEAP32[(($x)>>2)];
      var $arrayidx19=(($16)|0);
      var $17=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx19)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx19)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub=($15)-($17);
      var $mul=($14)*($sub);
      var $_dy=(($this1+52)|0);
      var $18=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $19=$Py_addr;
      var $y=(($this1+64)|0);
      var $20=HEAP32[(($y)>>2)];
      var $arrayidx20=(($20)|0);
      var $21=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx20)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx20)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub21=($19)-($21);
      var $mul22=($18)*($sub21);
      var $add=($mul)+($mul22);
      $fact=$add;
      $v=0;
      label = 14; break;
    case 14: 
      var $22=$v;
      var $_nof_vars24=(($this1+4)|0);
      var $23=HEAP32[(($_nof_vars24)>>2)];
      var $cmp25=(($22)|(0)) < (($23)|(0));
      if ($cmp25) { label = 15; break; } else { label = 17; break; }
    case 15: 
      var $24=$fact;
      var $sub27=(1)-($24);
      var $25=$v;
      var $rhs28=(($this1+68)|0);
      var $arrayidx29=(($rhs28+($25<<2))|0);
      var $26=HEAP32[(($arrayidx29)>>2)];
      var $arrayidx30=(($26+24)|0);
      var $27=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx30)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx30)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul31=($sub27)*($27);
      var $28=$fact;
      var $29=$v;
      var $rhs32=(($this1+68)|0);
      var $arrayidx33=(($rhs32+($29<<2))|0);
      var $30=HEAP32[(($arrayidx33)>>2)];
      var $arrayidx34=(($30+32)|0);
      var $31=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx34)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx34)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul35=($28)*($31);
      var $add36=($mul31)+($mul35);
      var $32=$v;
      var $33=$vars_addr;
      var $arrayidx37=(($33+($32<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$add36,HEAP32[(($arrayidx37)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx37)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 16; break;
    case 16: 
      var $34=$v;
      var $inc39=((($34)+(1))|0);
      $v=$inc39;
      label = 14; break;
    case 17: 
      label = 62; break;
    case 18: 
      var $_dx42=(($this1+44)|0);
      var $35=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dx42)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dx42)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $36=$Px_addr;
      var $x43=(($this1+60)|0);
      var $37=HEAP32[(($x43)>>2)];
      var $arrayidx44=(($37)|0);
      var $38=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx44)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx44)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub45=($36)-($38);
      var $mul46=($35)*($sub45);
      var $_dy47=(($this1+52)|0);
      var $39=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($_dy47)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($_dy47)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $40=$Py_addr;
      var $y48=(($this1+64)|0);
      var $41=HEAP32[(($y48)>>2)];
      var $arrayidx49=(($41)|0);
      var $42=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx49)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx49)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub50=($40)-($42);
      var $mul51=($39)*($sub50);
      var $add52=($mul46)+($mul51);
      $Pu=$add52;
      var $43=$Pu;
      var $index=(($this1+92)|0);
      var $44=HEAP32[(($index)>>2)];
      var $arrayidx53=(($44)|0);
      var $45=HEAP32[(($arrayidx53)>>2)];
      var $u=(($this1+84)|0);
      var $46=HEAP32[(($u)>>2)];
      var $arrayidx54=(($46+($45<<3))|0);
      var $47=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx54)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx54)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $cmp55=$43 <= $47;
      if ($cmp55) { label = 19; break; } else { label = 20; break; }
    case 19: 
      var $index56=(($this1+92)|0);
      var $48=HEAP32[(($index56)>>2)];
      var $arrayidx57=(($48)|0);
      var $49=HEAP32[(($arrayidx57)>>2)];
      $leftP=$49;
      var $index58=(($this1+92)|0);
      var $50=HEAP32[(($index58)>>2)];
      var $arrayidx59=(($50+4)|0);
      var $51=HEAP32[(($arrayidx59)>>2)];
      $rightP=$51;
      label = 33; break;
    case 20: 
      var $52=$Pu;
      var $_nof_points=(($this1+8)|0);
      var $53=HEAP32[(($_nof_points)>>2)];
      var $sub60=((($53)-(1))|0);
      var $index61=(($this1+92)|0);
      var $54=HEAP32[(($index61)>>2)];
      var $arrayidx62=(($54+($sub60<<2))|0);
      var $55=HEAP32[(($arrayidx62)>>2)];
      var $u63=(($this1+84)|0);
      var $56=HEAP32[(($u63)>>2)];
      var $arrayidx64=(($56+($55<<3))|0);
      var $57=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx64)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx64)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $cmp65=$52 >= $57;
      if ($cmp65) { label = 21; break; } else { label = 22; break; }
    case 21: 
      var $_nof_points67=(($this1+8)|0);
      var $58=HEAP32[(($_nof_points67)>>2)];
      var $sub68=((($58)-(2))|0);
      var $index69=(($this1+92)|0);
      var $59=HEAP32[(($index69)>>2)];
      var $arrayidx70=(($59+($sub68<<2))|0);
      var $60=HEAP32[(($arrayidx70)>>2)];
      $leftP=$60;
      var $_nof_points71=(($this1+8)|0);
      var $61=HEAP32[(($_nof_points71)>>2)];
      var $sub72=((($61)-(1))|0);
      var $index73=(($this1+92)|0);
      var $62=HEAP32[(($index73)>>2)];
      var $arrayidx74=(($62+($sub72<<2))|0);
      var $63=HEAP32[(($arrayidx74)>>2)];
      $rightP=$63;
      label = 32; break;
    case 22: 
      $r=1;
      label = 23; break;
    case 23: 
      var $64=$found;
      var $tobool=(($64)|(0))!=0;
      if ($tobool) { var $67 = 0;label = 25; break; } else { label = 24; break; }
    case 24: 
      var $65=$r;
      var $_nof_points77=(($this1+8)|0);
      var $66=HEAP32[(($_nof_points77)>>2)];
      var $cmp78=(($65)|(0)) < (($66)|(0));
      var $67 = $cmp78;label = 25; break;
    case 25: 
      var $67;
      if ($67) { label = 26; break; } else { label = 31; break; }
    case 26: 
      var $68=$r;
      var $sub80=((($68)-(1))|0);
      var $index81=(($this1+92)|0);
      var $69=HEAP32[(($index81)>>2)];
      var $arrayidx82=(($69+($sub80<<2))|0);
      var $70=HEAP32[(($arrayidx82)>>2)];
      $leftP=$70;
      var $71=$r;
      var $index83=(($this1+92)|0);
      var $72=HEAP32[(($index83)>>2)];
      var $arrayidx84=(($72+($71<<2))|0);
      var $73=HEAP32[(($arrayidx84)>>2)];
      $rightP=$73;
      var $74=$Pu;
      var $75=$leftP;
      var $u85=(($this1+84)|0);
      var $76=HEAP32[(($u85)>>2)];
      var $arrayidx86=(($76+($75<<3))|0);
      var $77=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx86)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx86)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $cmp87=$74 >= $77;
      if ($cmp87) { label = 27; break; } else { label = 29; break; }
    case 27: 
      var $78=$Pu;
      var $79=$rightP;
      var $u88=(($this1+84)|0);
      var $80=HEAP32[(($u88)>>2)];
      var $arrayidx89=(($80+($79<<3))|0);
      var $81=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx89)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx89)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $cmp90=$78 <= $81;
      if ($cmp90) { label = 28; break; } else { label = 29; break; }
    case 28: 
      $found=1;
      label = 29; break;
    case 29: 
      label = 30; break;
    case 30: 
      var $82=$r;
      var $inc93=((($82)+(1))|0);
      $r=$inc93;
      label = 23; break;
    case 31: 
      label = 32; break;
    case 32: 
      label = 33; break;
    case 33: 
      var $83=$Pu;
      var $84=$leftP;
      var $u97=(($this1+84)|0);
      var $85=HEAP32[(($u97)>>2)];
      var $arrayidx98=(($85+($84<<3))|0);
      var $86=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx98)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx98)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub99=($83)-($86);
      var $87=$rightP;
      var $u100=(($this1+84)|0);
      var $88=HEAP32[(($u100)>>2)];
      var $arrayidx101=(($88+($87<<3))|0);
      var $89=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx101)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx101)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $90=$leftP;
      var $u102=(($this1+84)|0);
      var $91=HEAP32[(($u102)>>2)];
      var $arrayidx103=(($91+($90<<3))|0);
      var $92=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx103)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx103)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $sub104=($89)-($92);
      var $div=($sub99)/($sub104);
      $fact=$div;
      $v=0;
      label = 34; break;
    case 34: 
      var $93=$v;
      var $_nof_vars106=(($this1+4)|0);
      var $94=HEAP32[(($_nof_vars106)>>2)];
      var $cmp107=(($93)|(0)) < (($94)|(0));
      if ($cmp107) { label = 35; break; } else { label = 37; break; }
    case 35: 
      var $95=$fact;
      var $sub109=(1)-($95);
      var $96=$leftP;
      var $add110=((($96)+(3))|0);
      var $97=$v;
      var $rhs111=(($this1+68)|0);
      var $arrayidx112=(($rhs111+($97<<2))|0);
      var $98=HEAP32[(($arrayidx112)>>2)];
      var $arrayidx113=(($98+($add110<<3))|0);
      var $99=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx113)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx113)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul114=($sub109)*($99);
      var $100=$fact;
      var $101=$rightP;
      var $add115=((($101)+(3))|0);
      var $102=$v;
      var $rhs116=(($this1+68)|0);
      var $arrayidx117=(($rhs116+($102<<2))|0);
      var $103=HEAP32[(($arrayidx117)>>2)];
      var $arrayidx118=(($103+($add115<<3))|0);
      var $104=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx118)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx118)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $mul119=($100)*($104);
      var $add120=($mul114)+($mul119);
      var $105=$v;
      var $106=$vars_addr;
      var $arrayidx121=(($106+($105<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$add120,HEAP32[(($arrayidx121)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx121)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 36; break;
    case 36: 
      var $107=$v;
      var $inc123=((($107)+(1))|0);
      $v=$inc123;
      label = 34; break;
    case 37: 
      label = 62; break;
    case 38: 
      $v=0;
      label = 39; break;
    case 39: 
      var $108=$v;
      var $_nof_vars127=(($this1+4)|0);
      var $109=HEAP32[(($_nof_vars127)>>2)];
      var $cmp128=(($108)|(0)) < (($109)|(0));
      if ($cmp128) { label = 40; break; } else { label = 42; break; }
    case 40: 
      var $110=$v;
      var $coef=(($this1+76)|0);
      var $arrayidx130=(($coef+($110<<2))|0);
      var $111=HEAP32[(($arrayidx130)>>2)];
      var $arrayidx131=(($111)|0);
      var $112=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx131)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx131)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $113=$v;
      var $coef132=(($this1+76)|0);
      var $arrayidx133=(($coef132+($113<<2))|0);
      var $114=HEAP32[(($arrayidx133)>>2)];
      var $arrayidx134=(($114+8)|0);
      var $115=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx134)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx134)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $116=$Px_addr;
      var $mul135=($115)*($116);
      var $add136=($112)+($mul135);
      var $117=$v;
      var $coef137=(($this1+76)|0);
      var $arrayidx138=(($coef137+($117<<2))|0);
      var $118=HEAP32[(($arrayidx138)>>2)];
      var $arrayidx139=(($118+16)|0);
      var $119=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx139)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx139)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $120=$Py_addr;
      var $mul140=($119)*($120);
      var $add141=($add136)+($mul140);
      var $121=$v;
      var $122=$vars_addr;
      var $arrayidx142=(($122+($121<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=$add141,HEAP32[(($arrayidx142)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx142)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 41; break;
    case 41: 
      var $123=$v;
      var $inc144=((($123)+(1))|0);
      $v=$inc144;
      label = 39; break;
    case 42: 
      $r=0;
      label = 43; break;
    case 43: 
      var $124=$r;
      var $_nof_points147=(($this1+8)|0);
      var $125=HEAP32[(($_nof_points147)>>2)];
      var $cmp148=(($124)|(0)) < (($125)|(0));
      if ($cmp148) { label = 44; break; } else { label = 50; break; }
    case 44: 
      var $126=$Px_addr;
      var $127=$Py_addr;
      var $128=$r;
      var $x150=(($this1+60)|0);
      var $129=HEAP32[(($x150)>>2)];
      var $arrayidx151=(($129+($128<<3))|0);
      var $130=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx151)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx151)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $131=$r;
      var $y152=(($this1+64)|0);
      var $132=HEAP32[(($y152)>>2)];
      var $arrayidx153=(($132+($131<<3))|0);
      var $133=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx153)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx153)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $call=__ZN17VizGeorefSpline2D9base_funcEdddd($this1, $126, $127, $130, $133);
      $tmp=$call;
      $v=0;
      label = 45; break;
    case 45: 
      var $134=$v;
      var $_nof_vars155=(($this1+4)|0);
      var $135=HEAP32[(($_nof_vars155)>>2)];
      var $cmp156=(($134)|(0)) < (($135)|(0));
      if ($cmp156) { label = 46; break; } else { label = 48; break; }
    case 46: 
      var $136=$r;
      var $add158=((($136)+(3))|0);
      var $137=$v;
      var $coef159=(($this1+76)|0);
      var $arrayidx160=(($coef159+($137<<2))|0);
      var $138=HEAP32[(($arrayidx160)>>2)];
      var $arrayidx161=(($138+($add158<<3))|0);
      var $139=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx161)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx161)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $140=$tmp;
      var $mul162=($139)*($140);
      var $141=$v;
      var $142=$vars_addr;
      var $arrayidx163=(($142+($141<<3))|0);
      var $143=(HEAP32[((tempDoublePtr)>>2)]=HEAP32[(($arrayidx163)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[((($arrayidx163)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      var $add164=($143)+($mul162);
      (HEAPF64[(tempDoublePtr)>>3]=$add164,HEAP32[(($arrayidx163)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx163)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 47; break;
    case 47: 
      var $144=$v;
      var $inc166=((($144)+(1))|0);
      $v=$inc166;
      label = 45; break;
    case 48: 
      label = 49; break;
    case 49: 
      var $145=$r;
      var $inc169=((($145)+(1))|0);
      $r=$inc169;
      label = 43; break;
    case 50: 
      label = 62; break;
    case 51: 
      var $146=HEAP32[((_stderr)>>2)];
      var $call172=_fprintf($146, ((5243060)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+3)>>2)<<2),assert(STACKTOP|0 < STACK_MAX|0),HEAP32[((tempInt)>>2)]=0,tempInt));
      var $147=HEAP32[((_stderr)>>2)];
      var $call173=_fprintf($147, ((5243000)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+3)>>2)<<2),assert(STACKTOP|0 < STACK_MAX|0),HEAP32[((tempInt)>>2)]=0,tempInt));
      $v=0;
      label = 52; break;
    case 52: 
      var $148=$v;
      var $_nof_vars175=(($this1+4)|0);
      var $149=HEAP32[(($_nof_vars175)>>2)];
      var $cmp176=(($148)|(0)) < (($149)|(0));
      if ($cmp176) { label = 53; break; } else { label = 55; break; }
    case 53: 
      var $150=$v;
      var $151=$vars_addr;
      var $arrayidx178=(($151+($150<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($arrayidx178)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx178)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 54; break;
    case 54: 
      var $152=$v;
      var $inc180=((($152)+(1))|0);
      $v=$inc180;
      label = 52; break;
    case 55: 
      $retval=0;
      label = 63; break;
    case 56: 
      var $153=HEAP32[((_stderr)>>2)];
      var $call183=_fprintf($153, ((5242956)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+3)>>2)<<2),assert(STACKTOP|0 < STACK_MAX|0),HEAP32[((tempInt)>>2)]=0,tempInt));
      var $154=HEAP32[((_stderr)>>2)];
      var $call184=_fprintf($154, ((5243000)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+3)>>2)<<2),assert(STACKTOP|0 < STACK_MAX|0),HEAP32[((tempInt)>>2)]=0,tempInt));
      $v=0;
      label = 57; break;
    case 57: 
      var $155=$v;
      var $_nof_vars186=(($this1+4)|0);
      var $156=HEAP32[(($_nof_vars186)>>2)];
      var $cmp187=(($155)|(0)) < (($156)|(0));
      if ($cmp187) { label = 58; break; } else { label = 60; break; }
    case 58: 
      var $157=$v;
      var $158=$vars_addr;
      var $arrayidx189=(($158+($157<<3))|0);
      (HEAPF64[(tempDoublePtr)>>3]=0,HEAP32[(($arrayidx189)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[((($arrayidx189)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]);
      label = 59; break;
    case 59: 
      var $159=$v;
      var $inc191=((($159)+(1))|0);
      $v=$inc191;
      label = 57; break;
    case 60: 
      $retval=0;
      label = 63; break;
    case 61: 
      $retval=0;
      label = 63; break;
    case 62: 
      $retval=1;
      label = 63; break;
    case 63: 
      var $160=$retval;
      STACKTOP = __stackBase__;
      return $160;
    default: assert(0, "bad label: " + label);
  }

}
Module["__ZN17VizGeorefSpline2D9get_pointEddPd"] = __ZN17VizGeorefSpline2D9get_pointEddPd;

function __ZN17VizGeorefSpline2D9serializeEPc($this, $serial) {
  var label = 0;
  var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 4)|0; assert(STACKTOP|0 % 4 == 0); assert(STACKTOP < STACK_MAX);
  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $this_addr;
      var $serial_addr;
      var $i_size;
      var $v_size;
      var $d_size;
      var $alloc_size;
      var $p_num;
      var $is_aa=__stackBase__;
      var $a_num;
      var $work;
      var $i;
      var $j;
      var $i50;
      $this_addr=$this;
      $serial_addr=$serial;
      var $this1=$this_addr;
      $i_size=4;
      $v_size=4;
      $d_size=8;
      var $call=__ZN17VizGeorefSpline2D14serialize_sizeEv($this1);
      $alloc_size=$call;
      var $_max_nof_points=(($this1+12)|0);
      var $0=HEAP32[(($_max_nof_points)>>2)];
      var $add=((($0)+(3))|0);
      $p_num=$add;
      HEAP32[(($is_aa)>>2)]=0;
      var $_nof_eqs=(($this1+16)|0);
      var $1=HEAP32[(($_nof_eqs)>>2)];
      var $_nof_eqs2=(($this1+16)|0);
      var $2=HEAP32[(($_nof_eqs2)>>2)];
      var $mul=Math.imul($1,$2);
      $a_num=$mul;
      var $_AA=(($this1+96)|0);
      var $3=HEAP32[(($_AA)>>2)];
      var $tobool=(($3)|(0))!=0;
      if ($tobool) { label = 3; break; } else { label = 4; break; }
    case 3: 
      HEAP32[(($is_aa)>>2)]=1;
      label = 4; break;
    case 4: 
      var $4=$serial_addr;
      $work=$4;
      var $5=$work;
      var $_nof_vars=(($this1+4)|0);
      var $6=$_nof_vars;
      var $7=$i_size;
      assert($7 % 1 === 0);_memcpy($5, $6, $7);
      var $8=$work;
      var $9=$i_size;
      var $add_ptr=(($8+$9)|0);
      var $_nof_points=(($this1+8)|0);
      var $10=$_nof_points;
      var $11=$i_size;
      assert($11 % 1 === 0);_memcpy($add_ptr, $10, $11);
      var $12=$work;
      var $13=$i_size;
      var $mul3=($13<<1);
      var $add_ptr4=(($12+$mul3)|0);
      var $_max_nof_points5=(($this1+12)|0);
      var $14=$_max_nof_points5;
      var $15=$i_size;
      assert($15 % 1 === 0);_memcpy($add_ptr4, $14, $15);
      var $16=$work;
      var $17=$i_size;
      var $mul6=((($17)*(3))&-1);
      var $add_ptr7=(($16+$mul6)|0);
      var $_nof_eqs8=(($this1+16)|0);
      var $18=$_nof_eqs8;
      var $19=$i_size;
      assert($19 % 1 === 0);_memcpy($add_ptr7, $18, $19);
      var $20=$work;
      var $21=$i_size;
      var $mul9=($21<<2);
      var $add_ptr10=(($20+$mul9)|0);
      var $22=$is_aa;
      var $23=$i_size;
      assert($23 % 1 === 0);_memcpy($add_ptr10, $22, $23);
      var $24=$work;
      var $25=$i_size;
      var $mul11=((($25)*(5))&-1);
      var $add_ptr12=(($24+$mul11)|0);
      $work=$add_ptr12;
      var $26=$work;
      var $type=(($this1)|0);
      var $27=$type;
      var $28=$v_size;
      assert($28 % 1 === 0);_memcpy($26, $27, $28);
      var $29=$work;
      var $30=$v_size;
      var $add_ptr13=(($29+$30)|0);
      $work=$add_ptr13;
      var $31=$work;
      var $_tx=(($this1+20)|0);
      var $32=$_tx;
      var $33=$d_size;
      assert($33 % 1 === 0);_memcpy($31, $32, $33);
      var $34=$work;
      var $35=$d_size;
      var $add_ptr14=(($34+$35)|0);
      var $_ty=(($this1+28)|0);
      var $36=$_ty;
      var $37=$d_size;
      assert($37 % 1 === 0);_memcpy($add_ptr14, $36, $37);
      var $38=$work;
      var $39=$d_size;
      var $mul15=($39<<1);
      var $add_ptr16=(($38+$mul15)|0);
      var $_ta=(($this1+36)|0);
      var $40=$_ta;
      var $41=$d_size;
      assert($41 % 1 === 0);_memcpy($add_ptr16, $40, $41);
      var $42=$work;
      var $43=$d_size;
      var $mul17=((($43)*(3))&-1);
      var $add_ptr18=(($42+$mul17)|0);
      var $_dx=(($this1+44)|0);
      var $44=$_dx;
      var $45=$d_size;
      assert($45 % 1 === 0);_memcpy($add_ptr18, $44, $45);
      var $46=$work;
      var $47=$d_size;
      var $mul19=($47<<2);
      var $add_ptr20=(($46+$mul19)|0);
      var $_dy=(($this1+52)|0);
      var $48=$_dy;
      var $49=$d_size;
      assert($49 % 1 === 0);_memcpy($add_ptr20, $48, $49);
      var $50=$work;
      var $51=$d_size;
      var $mul21=((($51)*(5))&-1);
      var $add_ptr22=(($50+$mul21)|0);
      $work=$add_ptr22;
      $i=0;
      label = 5; break;
    case 5: 
      var $52=$i;
      var $53=$p_num;
      var $cmp=(($52)|(0)) < (($53)|(0));
      if ($cmp) { label = 6; break; } else { label = 12; break; }
    case 6: 
      var $54=$work;
      var $55=$i;
      var $unused=(($this1+88)|0);
      var $56=HEAP32[(($unused)>>2)];
      var $arrayidx=(($56+($55<<2))|0);
      var $57=$arrayidx;
      var $58=$i_size;
      assert($58 % 1 === 0);_memcpy($54, $57, $58);
      var $59=$work;
      var $60=$i_size;
      var $add_ptr23=(($59+$60)|0);
      var $61=$i;
      var $index=(($this1+92)|0);
      var $62=HEAP32[(($index)>>2)];
      var $arrayidx24=(($62+($61<<2))|0);
      var $63=$arrayidx24;
      var $64=$i_size;
      assert($64 % 1 === 0);_memcpy($add_ptr23, $63, $64);
      var $65=$work;
      var $66=$i_size;
      var $mul25=($66<<1);
      var $add_ptr26=(($65+$mul25)|0);
      $work=$add_ptr26;
      var $67=$work;
      var $68=$i;
      var $x=(($this1+60)|0);
      var $69=HEAP32[(($x)>>2)];
      var $arrayidx27=(($69+($68<<3))|0);
      var $70=$arrayidx27;
      var $71=$d_size;
      assert($71 % 1 === 0);_memcpy($67, $70, $71);
      var $72=$work;
      var $73=$d_size;
      var $add_ptr28=(($72+$73)|0);
      var $74=$i;
      var $y=(($this1+64)|0);
      var $75=HEAP32[(($y)>>2)];
      var $arrayidx29=(($75+($74<<3))|0);
      var $76=$arrayidx29;
      var $77=$d_size;
      assert($77 % 1 === 0);_memcpy($add_ptr28, $76, $77);
      var $78=$work;
      var $79=$d_size;
      var $mul30=($79<<1);
      var $add_ptr31=(($78+$mul30)|0);
      var $80=$i;
      var $u=(($this1+84)|0);
      var $81=HEAP32[(($u)>>2)];
      var $arrayidx32=(($81+($80<<3))|0);
      var $82=$arrayidx32;
      var $83=$d_size;
      assert($83 % 1 === 0);_memcpy($add_ptr31, $82, $83);
      var $84=$work;
      var $85=$d_size;
      var $mul33=((($85)*(3))&-1);
      var $add_ptr34=(($84+$mul33)|0);
      $work=$add_ptr34;
      $j=0;
      label = 7; break;
    case 7: 
      var $86=$j;
      var $cmp36=(($86)|(0)) < 2;
      if ($cmp36) { label = 8; break; } else { label = 10; break; }
    case 8: 
      var $87=$work;
      var $88=$i;
      var $89=$j;
      var $rhs=(($this1+68)|0);
      var $arrayidx38=(($rhs+($89<<2))|0);
      var $90=HEAP32[(($arrayidx38)>>2)];
      var $arrayidx39=(($90+($88<<3))|0);
      var $91=$arrayidx39;
      var $92=$d_size;
      assert($92 % 1 === 0);_memcpy($87, $91, $92);
      var $93=$work;
      var $94=$d_size;
      var $add_ptr40=(($93+$94)|0);
      var $95=$i;
      var $96=$j;
      var $coef=(($this1+76)|0);
      var $arrayidx41=(($coef+($96<<2))|0);
      var $97=HEAP32[(($arrayidx41)>>2)];
      var $arrayidx42=(($97+($95<<3))|0);
      var $98=$arrayidx42;
      var $99=$d_size;
      assert($99 % 1 === 0);_memcpy($add_ptr40, $98, $99);
      var $100=$work;
      var $101=$d_size;
      var $mul43=($101<<1);
      var $add_ptr44=(($100+$mul43)|0);
      $work=$add_ptr44;
      label = 9; break;
    case 9: 
      var $102=$j;
      var $inc=((($102)+(1))|0);
      $j=$inc;
      label = 7; break;
    case 10: 
      label = 11; break;
    case 11: 
      var $103=$i;
      var $inc46=((($103)+(1))|0);
      $i=$inc46;
      label = 5; break;
    case 12: 
      var $104=HEAP32[(($is_aa)>>2)];
      var $tobool48=(($104)|(0))!=0;
      if ($tobool48) { label = 13; break; } else { label = 18; break; }
    case 13: 
      $i50=0;
      label = 14; break;
    case 14: 
      var $105=$i50;
      var $106=$a_num;
      var $cmp52=(($105)|(0)) < (($106)|(0));
      if ($cmp52) { label = 15; break; } else { label = 17; break; }
    case 15: 
      var $107=$work;
      var $108=$i50;
      var $_AA54=(($this1+96)|0);
      var $109=HEAP32[(($_AA54)>>2)];
      var $arrayidx55=(($109+($108<<3))|0);
      var $110=$arrayidx55;
      var $111=$d_size;
      assert($111 % 1 === 0);_memcpy($107, $110, $111);
      var $112=$work;
      var $113=$d_size;
      var $add_ptr56=(($112+$113)|0);
      var $114=$i50;
      var $_Ainv=(($this1+100)|0);
      var $115=HEAP32[(($_Ainv)>>2)];
      var $arrayidx57=(($115+($114<<3))|0);
      var $116=$arrayidx57;
      var $117=$d_size;
      assert($117 % 1 === 0);_memcpy($add_ptr56, $116, $117);
      var $118=$work;
      var $119=$d_size;
      var $mul58=($119<<1);
      var $add_ptr59=(($118+$mul58)|0);
      $work=$add_ptr59;
      label = 16; break;
    case 16: 
      var $120=$i50;
      var $inc61=((($120)+(1))|0);
      $i50=$inc61;
      label = 14; break;
    case 17: 
      label = 18; break;
    case 18: 
      var $121=$alloc_size;
      STACKTOP = __stackBase__;
      return $121;
    default: assert(0, "bad label: " + label);
  }

}
Module["__ZN17VizGeorefSpline2D9serializeEPc"] = __ZN17VizGeorefSpline2D9serializeEPc;

function __ZN17VizGeorefSpline2D11deserializeEPc($this, $serial) {
  var label = 0;
  var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 4)|0; assert(STACKTOP|0 % 4 == 0); assert(STACKTOP < STACK_MAX);
  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $this_addr;
      var $serial_addr;
      var $i_size;
      var $v_size;
      var $d_size;
      var $is_aa=__stackBase__;
      var $i;
      var $work;
      var $alloc_size;
      var $p_num;
      var $a_num;
      var $i60;
      var $i73;
      var $j;
      var $i121;
      $this_addr=$this;
      $serial_addr=$serial;
      var $this1=$this_addr;
      $i_size=4;
      $v_size=4;
      $d_size=8;
      var $_AA=(($this1+96)|0);
      var $0=HEAP32[(($_AA)>>2)];
      var $tobool=(($0)|(0))!=0;
      if ($tobool) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $_AA2=(($this1+96)|0);
      var $1=HEAP32[(($_AA2)>>2)];
      var $2=$1;
      _free($2);
      var $_AA3=(($this1+96)|0);
      HEAP32[(($_AA3)>>2)]=0;
      label = 4; break;
    case 4: 
      var $_Ainv=(($this1+100)|0);
      var $3=HEAP32[(($_Ainv)>>2)];
      var $tobool4=(($3)|(0))!=0;
      if ($tobool4) { label = 5; break; } else { label = 6; break; }
    case 5: 
      var $_Ainv6=(($this1+100)|0);
      var $4=HEAP32[(($_Ainv6)>>2)];
      var $5=$4;
      _free($5);
      var $_Ainv7=(($this1+100)|0);
      HEAP32[(($_Ainv7)>>2)]=0;
      label = 6; break;
    case 6: 
      var $x=(($this1+60)|0);
      var $6=HEAP32[(($x)>>2)];
      var $7=$6;
      _free($7);
      var $y=(($this1+64)|0);
      var $8=HEAP32[(($y)>>2)];
      var $9=$8;
      _free($9);
      var $u=(($this1+84)|0);
      var $10=HEAP32[(($u)>>2)];
      var $11=$10;
      _free($11);
      var $unused=(($this1+88)|0);
      var $12=HEAP32[(($unused)>>2)];
      var $13=$12;
      _free($13);
      var $index=(($this1+92)|0);
      var $14=HEAP32[(($index)>>2)];
      var $15=$14;
      _free($15);
      $i=0;
      label = 7; break;
    case 7: 
      var $16=$i;
      var $cmp=(($16)|(0)) < 2;
      if ($cmp) { label = 8; break; } else { label = 10; break; }
    case 8: 
      var $17=$i;
      var $rhs=(($this1+68)|0);
      var $arrayidx=(($rhs+($17<<2))|0);
      var $18=HEAP32[(($arrayidx)>>2)];
      var $19=$18;
      _free($19);
      var $20=$i;
      var $coef=(($this1+76)|0);
      var $arrayidx9=(($coef+($20<<2))|0);
      var $21=HEAP32[(($arrayidx9)>>2)];
      var $22=$21;
      _free($22);
      label = 9; break;
    case 9: 
      var $23=$i;
      var $inc=((($23)+(1))|0);
      $i=$inc;
      label = 7; break;
    case 10: 
      var $24=$serial_addr;
      $work=$24;
      var $_nof_vars=(($this1+4)|0);
      var $25=$_nof_vars;
      var $26=$work;
      var $27=$i_size;
      assert($27 % 1 === 0);_memcpy($25, $26, $27);
      var $_nof_points=(($this1+8)|0);
      var $28=$_nof_points;
      var $29=$work;
      var $30=$i_size;
      var $add_ptr=(($29+$30)|0);
      var $31=$i_size;
      assert($31 % 1 === 0);_memcpy($28, $add_ptr, $31);
      var $_max_nof_points=(($this1+12)|0);
      var $32=$_max_nof_points;
      var $33=$work;
      var $34=$i_size;
      var $mul=($34<<1);
      var $add_ptr10=(($33+$mul)|0);
      var $35=$i_size;
      assert($35 % 1 === 0);_memcpy($32, $add_ptr10, $35);
      var $_nof_eqs=(($this1+16)|0);
      var $36=$_nof_eqs;
      var $37=$work;
      var $38=$i_size;
      var $mul11=((($38)*(3))&-1);
      var $add_ptr12=(($37+$mul11)|0);
      var $39=$i_size;
      assert($39 % 1 === 0);_memcpy($36, $add_ptr12, $39);
      var $40=$is_aa;
      var $41=$work;
      var $42=$i_size;
      var $mul13=($42<<2);
      var $add_ptr14=(($41+$mul13)|0);
      var $43=$i_size;
      assert($43 % 1 === 0);_memcpy($40, $add_ptr14, $43);
      var $44=$work;
      var $45=$i_size;
      var $mul15=((($45)*(5))&-1);
      var $add_ptr16=(($44+$mul15)|0);
      $work=$add_ptr16;
      var $type=(($this1)|0);
      var $46=$type;
      var $47=$work;
      var $48=$v_size;
      assert($48 % 1 === 0);_memcpy($46, $47, $48);
      var $49=$work;
      var $50=$v_size;
      var $add_ptr17=(($49+$50)|0);
      $work=$add_ptr17;
      var $_tx=(($this1+20)|0);
      var $51=$_tx;
      var $52=$work;
      var $53=$d_size;
      assert($53 % 1 === 0);_memcpy($51, $52, $53);
      var $_ty=(($this1+28)|0);
      var $54=$_ty;
      var $55=$work;
      var $56=$d_size;
      var $add_ptr18=(($55+$56)|0);
      var $57=$d_size;
      assert($57 % 1 === 0);_memcpy($54, $add_ptr18, $57);
      var $_ta=(($this1+36)|0);
      var $58=$_ta;
      var $59=$work;
      var $60=$d_size;
      var $mul19=($60<<1);
      var $add_ptr20=(($59+$mul19)|0);
      var $61=$d_size;
      assert($61 % 1 === 0);_memcpy($58, $add_ptr20, $61);
      var $_dx=(($this1+44)|0);
      var $62=$_dx;
      var $63=$work;
      var $64=$d_size;
      var $mul21=((($64)*(3))&-1);
      var $add_ptr22=(($63+$mul21)|0);
      var $65=$d_size;
      assert($65 % 1 === 0);_memcpy($62, $add_ptr22, $65);
      var $_dy=(($this1+52)|0);
      var $66=$_dy;
      var $67=$work;
      var $68=$d_size;
      var $mul23=($68<<2);
      var $add_ptr24=(($67+$mul23)|0);
      var $69=$d_size;
      assert($69 % 1 === 0);_memcpy($66, $add_ptr24, $69);
      var $70=$work;
      var $71=$d_size;
      var $mul25=((($71)*(5))&-1);
      var $add_ptr26=(($70+$mul25)|0);
      $work=$add_ptr26;
      var $72=$i_size;
      var $mul27=((($72)*(5))&-1);
      var $73=$v_size;
      var $add=((($mul27)+($73))|0);
      var $74=$d_size;
      var $mul28=((($74)*(5))&-1);
      var $add29=((($add)+($mul28))|0);
      $alloc_size=$add29;
      var $_max_nof_points30=(($this1+12)|0);
      var $75=HEAP32[(($_max_nof_points30)>>2)];
      var $add31=((($75)+(3))|0);
      $p_num=$add31;
      var $76=$alloc_size;
      var $77=$i_size;
      var $mul32=($77<<1);
      var $78=$d_size;
      var $mul33=((($78)*(7))&-1);
      var $add34=((($mul32)+($mul33))|0);
      var $79=$p_num;
      var $mul35=Math.imul($add34,$79);
      var $add36=((($76)+($mul35))|0);
      $alloc_size=$add36;
      var $_nof_eqs37=(($this1+16)|0);
      var $80=HEAP32[(($_nof_eqs37)>>2)];
      var $_nof_eqs38=(($this1+16)|0);
      var $81=HEAP32[(($_nof_eqs38)>>2)];
      var $mul39=Math.imul($80,$81);
      $a_num=$mul39;
      var $82=HEAP32[(($is_aa)>>2)];
      var $tobool40=(($82)|(0))!=0;
      if ($tobool40) { label = 11; break; } else { label = 12; break; }
    case 11: 
      var $83=$alloc_size;
      var $84=$d_size;
      var $85=$a_num;
      var $mul42=Math.imul($84,$85);
      var $mul43=($mul42<<1);
      var $add44=((($83)+($mul43))|0);
      $alloc_size=$add44;
      label = 12; break;
    case 12: 
      var $86=$d_size;
      var $87=$p_num;
      var $mul46=Math.imul($86,$87);
      var $call=_malloc($mul46);
      var $88=$call;
      var $x47=(($this1+60)|0);
      HEAP32[(($x47)>>2)]=$88;
      var $89=$d_size;
      var $90=$p_num;
      var $mul48=Math.imul($89,$90);
      var $call49=_malloc($mul48);
      var $91=$call49;
      var $y50=(($this1+64)|0);
      HEAP32[(($y50)>>2)]=$91;
      var $92=$d_size;
      var $93=$p_num;
      var $mul51=Math.imul($92,$93);
      var $call52=_malloc($mul51);
      var $94=$call52;
      var $u53=(($this1+84)|0);
      HEAP32[(($u53)>>2)]=$94;
      var $95=$i_size;
      var $96=$p_num;
      var $mul54=Math.imul($95,$96);
      var $call55=_malloc($mul54);
      var $97=$call55;
      var $unused56=(($this1+88)|0);
      HEAP32[(($unused56)>>2)]=$97;
      var $98=$i_size;
      var $99=$p_num;
      var $mul57=Math.imul($98,$99);
      var $call58=_malloc($mul57);
      var $100=$call58;
      var $index59=(($this1+92)|0);
      HEAP32[(($index59)>>2)]=$100;
      $i60=0;
      label = 13; break;
    case 13: 
      var $101=$i60;
      var $cmp62=(($101)|(0)) < 2;
      if ($cmp62) { label = 14; break; } else { label = 16; break; }
    case 14: 
      var $102=$d_size;
      var $103=$p_num;
      var $call64=_calloc($102, $103);
      var $104=$call64;
      var $105=$i60;
      var $rhs65=(($this1+68)|0);
      var $arrayidx66=(($rhs65+($105<<2))|0);
      HEAP32[(($arrayidx66)>>2)]=$104;
      var $106=$d_size;
      var $107=$p_num;
      var $call67=_calloc($106, $107);
      var $108=$call67;
      var $109=$i60;
      var $coef68=(($this1+76)|0);
      var $arrayidx69=(($coef68+($109<<2))|0);
      HEAP32[(($arrayidx69)>>2)]=$108;
      label = 15; break;
    case 15: 
      var $110=$i60;
      var $inc71=((($110)+(1))|0);
      $i60=$inc71;
      label = 13; break;
    case 16: 
      $i73=0;
      label = 17; break;
    case 17: 
      var $111=$i73;
      var $112=$p_num;
      var $cmp75=(($111)|(0)) < (($112)|(0));
      if ($cmp75) { label = 18; break; } else { label = 24; break; }
    case 18: 
      var $113=$i73;
      var $unused77=(($this1+88)|0);
      var $114=HEAP32[(($unused77)>>2)];
      var $arrayidx78=(($114+($113<<2))|0);
      var $115=$arrayidx78;
      var $116=$work;
      var $117=$i_size;
      assert($117 % 1 === 0);_memcpy($115, $116, $117);
      var $118=$i73;
      var $index79=(($this1+92)|0);
      var $119=HEAP32[(($index79)>>2)];
      var $arrayidx80=(($119+($118<<2))|0);
      var $120=$arrayidx80;
      var $121=$work;
      var $122=$i_size;
      var $add_ptr81=(($121+$122)|0);
      var $123=$i_size;
      assert($123 % 1 === 0);_memcpy($120, $add_ptr81, $123);
      var $124=$work;
      var $125=$i_size;
      var $mul82=($125<<1);
      var $add_ptr83=(($124+$mul82)|0);
      $work=$add_ptr83;
      var $126=$i73;
      var $x84=(($this1+60)|0);
      var $127=HEAP32[(($x84)>>2)];
      var $arrayidx85=(($127+($126<<3))|0);
      var $128=$arrayidx85;
      var $129=$work;
      var $130=$d_size;
      assert($130 % 1 === 0);_memcpy($128, $129, $130);
      var $131=$i73;
      var $y86=(($this1+64)|0);
      var $132=HEAP32[(($y86)>>2)];
      var $arrayidx87=(($132+($131<<3))|0);
      var $133=$arrayidx87;
      var $134=$work;
      var $135=$d_size;
      var $add_ptr88=(($134+$135)|0);
      var $136=$d_size;
      assert($136 % 1 === 0);_memcpy($133, $add_ptr88, $136);
      var $137=$i73;
      var $u89=(($this1+84)|0);
      var $138=HEAP32[(($u89)>>2)];
      var $arrayidx90=(($138+($137<<3))|0);
      var $139=$arrayidx90;
      var $140=$work;
      var $141=$d_size;
      var $mul91=($141<<1);
      var $add_ptr92=(($140+$mul91)|0);
      var $142=$d_size;
      assert($142 % 1 === 0);_memcpy($139, $add_ptr92, $142);
      var $143=$work;
      var $144=$d_size;
      var $mul93=((($144)*(3))&-1);
      var $add_ptr94=(($143+$mul93)|0);
      $work=$add_ptr94;
      $j=0;
      label = 19; break;
    case 19: 
      var $145=$j;
      var $cmp96=(($145)|(0)) < 2;
      if ($cmp96) { label = 20; break; } else { label = 22; break; }
    case 20: 
      var $146=$i73;
      var $147=$j;
      var $rhs98=(($this1+68)|0);
      var $arrayidx99=(($rhs98+($147<<2))|0);
      var $148=HEAP32[(($arrayidx99)>>2)];
      var $arrayidx100=(($148+($146<<3))|0);
      var $149=$arrayidx100;
      var $150=$work;
      var $151=$d_size;
      assert($151 % 1 === 0);_memcpy($149, $150, $151);
      var $152=$i73;
      var $153=$j;
      var $coef101=(($this1+76)|0);
      var $arrayidx102=(($coef101+($153<<2))|0);
      var $154=HEAP32[(($arrayidx102)>>2)];
      var $arrayidx103=(($154+($152<<3))|0);
      var $155=$arrayidx103;
      var $156=$work;
      var $157=$d_size;
      var $add_ptr104=(($156+$157)|0);
      var $158=$d_size;
      assert($158 % 1 === 0);_memcpy($155, $add_ptr104, $158);
      var $159=$work;
      var $160=$d_size;
      var $mul105=($160<<1);
      var $add_ptr106=(($159+$mul105)|0);
      $work=$add_ptr106;
      label = 21; break;
    case 21: 
      var $161=$j;
      var $inc108=((($161)+(1))|0);
      $j=$inc108;
      label = 19; break;
    case 22: 
      label = 23; break;
    case 23: 
      var $162=$i73;
      var $inc111=((($162)+(1))|0);
      $i73=$inc111;
      label = 17; break;
    case 24: 
      var $163=HEAP32[(($is_aa)>>2)];
      var $tobool113=(($163)|(0))!=0;
      if ($tobool113) { label = 25; break; } else { label = 30; break; }
    case 25: 
      var $164=$d_size;
      var $165=$a_num;
      var $mul115=Math.imul($164,$165);
      var $call116=_malloc($mul115);
      var $166=$call116;
      var $_AA117=(($this1+96)|0);
      HEAP32[(($_AA117)>>2)]=$166;
      var $167=$d_size;
      var $168=$a_num;
      var $mul118=Math.imul($167,$168);
      var $call119=_malloc($mul118);
      var $169=$call119;
      var $_Ainv120=(($this1+100)|0);
      HEAP32[(($_Ainv120)>>2)]=$169;
      $i121=0;
      label = 26; break;
    case 26: 
      var $170=$i121;
      var $171=$a_num;
      var $cmp123=(($170)|(0)) < (($171)|(0));
      if ($cmp123) { label = 27; break; } else { label = 29; break; }
    case 27: 
      var $172=$i121;
      var $_AA125=(($this1+96)|0);
      var $173=HEAP32[(($_AA125)>>2)];
      var $arrayidx126=(($173+($172<<3))|0);
      var $174=$arrayidx126;
      var $175=$work;
      var $176=$d_size;
      assert($176 % 1 === 0);_memcpy($174, $175, $176);
      var $177=$i121;
      var $_Ainv127=(($this1+100)|0);
      var $178=HEAP32[(($_Ainv127)>>2)];
      var $arrayidx128=(($178+($177<<3))|0);
      var $179=$arrayidx128;
      var $180=$work;
      var $181=$d_size;
      var $add_ptr129=(($180+$181)|0);
      var $182=$d_size;
      assert($182 % 1 === 0);_memcpy($179, $add_ptr129, $182);
      var $183=$work;
      var $184=$d_size;
      var $mul130=($184<<1);
      var $add_ptr131=(($183+$mul130)|0);
      $work=$add_ptr131;
      label = 28; break;
    case 28: 
      var $185=$i121;
      var $inc133=((($185)+(1))|0);
      $i121=$inc133;
      label = 26; break;
    case 29: 
      label = 30; break;
    case 30: 
      var $186=$alloc_size;
      STACKTOP = __stackBase__;
      return $186;
    default: assert(0, "bad label: " + label);
  }

}
Module["__ZN17VizGeorefSpline2D11deserializeEPc"] = __ZN17VizGeorefSpline2D11deserializeEPc;

function _malloc($bytes) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $bytes_addr;
      var $mem;
      var $nb;
      var $idx;
      var $smallbits;
      var $b;
      var $p;
      var $F;
      var $b33;
      var $p34;
      var $r;
      var $rsize;
      var $i;
      var $leftbits;
      var $leastbit;
      var $Y;
      var $K;
      var $N;
      var $F68;
      var $DVS;
      var $DV;
      var $I;
      var $B;
      var $F104;
      var $rsize158;
      var $p160;
      var $r164;
      var $dvs;
      var $rsize186;
      var $p188;
      var $r189;
      $bytes_addr=$bytes;
      var $0=$bytes_addr;
      var $cmp=(($0)>>>(0)) <= 244;
      if ($cmp) { label = 3; break; } else { label = 42; break; }
    case 3: 
      var $1=$bytes_addr;
      var $cmp1=(($1)>>>(0)) < 11;
      if ($cmp1) { label = 4; break; } else { label = 5; break; }
    case 4: 
      var $cond = 16;label = 6; break;
    case 5: 
      var $2=$bytes_addr;
      var $add=((($2)+(4))|0);
      var $add2=((($add)+(7))|0);
      var $and=$add2 & -8;
      var $cond = $and;label = 6; break;
    case 6: 
      var $cond;
      $nb=$cond;
      var $3=$nb;
      var $shr=$3 >>> 3;
      $idx=$shr;
      var $4=HEAP32[((((5243104)|0))>>2)];
      var $5=$idx;
      var $shr3=$4 >>> (($5)>>>(0));
      $smallbits=$shr3;
      var $6=$smallbits;
      var $and4=$6 & 3;
      var $cmp5=(($and4)|(0))!=0;
      if ($cmp5) { label = 7; break; } else { label = 16; break; }
    case 7: 
      var $7=$smallbits;
      var $neg=$7 ^ -1;
      var $and7=$neg & 1;
      var $8=$idx;
      var $add8=((($8)+($and7))|0);
      $idx=$add8;
      var $9=$idx;
      var $shl=$9 << 1;
      var $arrayidx=((((5243144)|0)+($shl<<2))|0);
      var $10=$arrayidx;
      var $11=$10;
      $b=$11;
      var $12=$b;
      var $fd=(($12+8)|0);
      var $13=HEAP32[(($fd)>>2)];
      $p=$13;
      var $14=$p;
      var $fd9=(($14+8)|0);
      var $15=HEAP32[(($fd9)>>2)];
      $F=$15;
      var $16=$b;
      var $17=$F;
      var $cmp10=(($16)|(0))==(($17)|(0));
      if ($cmp10) { label = 8; break; } else { label = 9; break; }
    case 8: 
      var $18=$idx;
      var $shl12=1 << $18;
      var $neg13=$shl12 ^ -1;
      var $19=HEAP32[((((5243104)|0))>>2)];
      var $and14=$19 & $neg13;
      HEAP32[((((5243104)|0))>>2)]=$and14;
      label = 15; break;
    case 9: 
      var $20=$F;
      var $21=$20;
      var $22=HEAP32[((((5243120)|0))>>2)];
      var $cmp15=(($21)>>>(0)) >= (($22)>>>(0));
      if ($cmp15) { label = 10; break; } else { var $26 = 0;label = 11; break; }
    case 10: 
      var $23=$F;
      var $bk=(($23+12)|0);
      var $24=HEAP32[(($bk)>>2)];
      var $25=$p;
      var $cmp16=(($24)|(0))==(($25)|(0));
      var $26 = $cmp16;label = 11; break;
    case 11: 
      var $26;
      var $land_ext=(($26)&(1));
      var $expval=($land_ext);
      var $tobool=(($expval)|(0))!=0;
      if ($tobool) { label = 12; break; } else { label = 13; break; }
    case 12: 
      var $27=$b;
      var $28=$F;
      var $bk18=(($28+12)|0);
      HEAP32[(($bk18)>>2)]=$27;
      var $29=$F;
      var $30=$b;
      var $fd19=(($30+8)|0);
      HEAP32[(($fd19)>>2)]=$29;
      label = 14; break;
    case 13: 
      _abort();
      throw "Reached an unreachable!"
    case 14: 
      label = 15; break;
    case 15: 
      var $31=$idx;
      var $shl22=$31 << 3;
      var $or=$shl22 | 1;
      var $or23=$or | 2;
      var $32=$p;
      var $head=(($32+4)|0);
      HEAP32[(($head)>>2)]=$or23;
      var $33=$p;
      var $34=$33;
      var $35=$idx;
      var $shl24=$35 << 3;
      var $add_ptr=(($34+$shl24)|0);
      var $36=$add_ptr;
      var $head25=(($36+4)|0);
      var $37=HEAP32[(($head25)>>2)];
      var $or26=$37 | 1;
      HEAP32[(($head25)>>2)]=$or26;
      var $38=$p;
      var $39=$38;
      var $add_ptr27=(($39+8)|0);
      $mem=$add_ptr27;
      label = 58; break;
    case 16: 
      var $40=$nb;
      var $41=HEAP32[((((5243112)|0))>>2)];
      var $cmp29=(($40)>>>(0)) > (($41)>>>(0));
      if ($cmp29) { label = 17; break; } else { label = 40; break; }
    case 17: 
      var $42=$smallbits;
      var $cmp31=(($42)|(0))!=0;
      if ($cmp31) { label = 18; break; } else { label = 35; break; }
    case 18: 
      var $43=$smallbits;
      var $44=$idx;
      var $shl35=$43 << $44;
      var $45=$idx;
      var $shl36=1 << $45;
      var $shl37=$shl36 << 1;
      var $46=$idx;
      var $shl38=1 << $46;
      var $shl39=$shl38 << 1;
      var $sub=(((-$shl39))|0);
      var $or40=$shl37 | $sub;
      var $and41=$shl35 & $or40;
      $leftbits=$and41;
      var $47=$leftbits;
      var $48=$leftbits;
      var $sub42=(((-$48))|0);
      var $and43=$47 & $sub42;
      $leastbit=$and43;
      var $49=$leastbit;
      var $sub44=((($49)-(1))|0);
      $Y=$sub44;
      var $50=$Y;
      var $shr45=$50 >>> 12;
      var $and46=$shr45 & 16;
      $K=$and46;
      var $51=$K;
      $N=$51;
      var $52=$K;
      var $53=$Y;
      var $shr47=$53 >>> (($52)>>>(0));
      $Y=$shr47;
      var $54=$Y;
      var $shr48=$54 >>> 5;
      var $and49=$shr48 & 8;
      $K=$and49;
      var $55=$N;
      var $add50=((($55)+($and49))|0);
      $N=$add50;
      var $56=$K;
      var $57=$Y;
      var $shr51=$57 >>> (($56)>>>(0));
      $Y=$shr51;
      var $58=$Y;
      var $shr52=$58 >>> 2;
      var $and53=$shr52 & 4;
      $K=$and53;
      var $59=$N;
      var $add54=((($59)+($and53))|0);
      $N=$add54;
      var $60=$K;
      var $61=$Y;
      var $shr55=$61 >>> (($60)>>>(0));
      $Y=$shr55;
      var $62=$Y;
      var $shr56=$62 >>> 1;
      var $and57=$shr56 & 2;
      $K=$and57;
      var $63=$N;
      var $add58=((($63)+($and57))|0);
      $N=$add58;
      var $64=$K;
      var $65=$Y;
      var $shr59=$65 >>> (($64)>>>(0));
      $Y=$shr59;
      var $66=$Y;
      var $shr60=$66 >>> 1;
      var $and61=$shr60 & 1;
      $K=$and61;
      var $67=$N;
      var $add62=((($67)+($and61))|0);
      $N=$add62;
      var $68=$K;
      var $69=$Y;
      var $shr63=$69 >>> (($68)>>>(0));
      $Y=$shr63;
      var $70=$N;
      var $71=$Y;
      var $add64=((($70)+($71))|0);
      $i=$add64;
      var $72=$i;
      var $shl65=$72 << 1;
      var $arrayidx66=((((5243144)|0)+($shl65<<2))|0);
      var $73=$arrayidx66;
      var $74=$73;
      $b33=$74;
      var $75=$b33;
      var $fd67=(($75+8)|0);
      var $76=HEAP32[(($fd67)>>2)];
      $p34=$76;
      var $77=$p34;
      var $fd69=(($77+8)|0);
      var $78=HEAP32[(($fd69)>>2)];
      $F68=$78;
      var $79=$b33;
      var $80=$F68;
      var $cmp70=(($79)|(0))==(($80)|(0));
      if ($cmp70) { label = 19; break; } else { label = 20; break; }
    case 19: 
      var $81=$i;
      var $shl72=1 << $81;
      var $neg73=$shl72 ^ -1;
      var $82=HEAP32[((((5243104)|0))>>2)];
      var $and74=$82 & $neg73;
      HEAP32[((((5243104)|0))>>2)]=$and74;
      label = 26; break;
    case 20: 
      var $83=$F68;
      var $84=$83;
      var $85=HEAP32[((((5243120)|0))>>2)];
      var $cmp76=(($84)>>>(0)) >= (($85)>>>(0));
      if ($cmp76) { label = 21; break; } else { var $89 = 0;label = 22; break; }
    case 21: 
      var $86=$F68;
      var $bk78=(($86+12)|0);
      var $87=HEAP32[(($bk78)>>2)];
      var $88=$p34;
      var $cmp79=(($87)|(0))==(($88)|(0));
      var $89 = $cmp79;label = 22; break;
    case 22: 
      var $89;
      var $land_ext81=(($89)&(1));
      var $expval82=($land_ext81);
      var $tobool83=(($expval82)|(0))!=0;
      if ($tobool83) { label = 23; break; } else { label = 24; break; }
    case 23: 
      var $90=$b33;
      var $91=$F68;
      var $bk85=(($91+12)|0);
      HEAP32[(($bk85)>>2)]=$90;
      var $92=$F68;
      var $93=$b33;
      var $fd86=(($93+8)|0);
      HEAP32[(($fd86)>>2)]=$92;
      label = 25; break;
    case 24: 
      _abort();
      throw "Reached an unreachable!"
    case 25: 
      label = 26; break;
    case 26: 
      var $94=$i;
      var $shl90=$94 << 3;
      var $95=$nb;
      var $sub91=((($shl90)-($95))|0);
      $rsize=$sub91;
      var $96=$nb;
      var $or92=$96 | 1;
      var $or93=$or92 | 2;
      var $97=$p34;
      var $head94=(($97+4)|0);
      HEAP32[(($head94)>>2)]=$or93;
      var $98=$p34;
      var $99=$98;
      var $100=$nb;
      var $add_ptr95=(($99+$100)|0);
      var $101=$add_ptr95;
      $r=$101;
      var $102=$rsize;
      var $or96=$102 | 1;
      var $103=$r;
      var $head97=(($103+4)|0);
      HEAP32[(($head97)>>2)]=$or96;
      var $104=$rsize;
      var $105=$r;
      var $106=$105;
      var $107=$rsize;
      var $add_ptr98=(($106+$107)|0);
      var $108=$add_ptr98;
      var $prev_foot=(($108)|0);
      HEAP32[(($prev_foot)>>2)]=$104;
      var $109=HEAP32[((((5243112)|0))>>2)];
      $DVS=$109;
      var $110=$DVS;
      var $cmp99=(($110)|(0))!=0;
      if ($cmp99) { label = 27; break; } else { label = 34; break; }
    case 27: 
      var $111=HEAP32[((((5243124)|0))>>2)];
      $DV=$111;
      var $112=$DVS;
      var $shr101=$112 >>> 3;
      $I=$shr101;
      var $113=$I;
      var $shl102=$113 << 1;
      var $arrayidx103=((((5243144)|0)+($shl102<<2))|0);
      var $114=$arrayidx103;
      var $115=$114;
      $B=$115;
      var $116=$B;
      $F104=$116;
      var $117=HEAP32[((((5243104)|0))>>2)];
      var $118=$I;
      var $shl105=1 << $118;
      var $and106=$117 & $shl105;
      var $tobool107=(($and106)|(0))!=0;
      if ($tobool107) { label = 29; break; } else { label = 28; break; }
    case 28: 
      var $119=$I;
      var $shl109=1 << $119;
      var $120=HEAP32[((((5243104)|0))>>2)];
      var $or110=$120 | $shl109;
      HEAP32[((((5243104)|0))>>2)]=$or110;
      label = 33; break;
    case 29: 
      var $121=$B;
      var $fd112=(($121+8)|0);
      var $122=HEAP32[(($fd112)>>2)];
      var $123=$122;
      var $124=HEAP32[((((5243120)|0))>>2)];
      var $cmp113=(($123)>>>(0)) >= (($124)>>>(0));
      var $conv=(($cmp113)&(1));
      var $expval114=($conv);
      var $tobool115=(($expval114)|(0))!=0;
      if ($tobool115) { label = 30; break; } else { label = 31; break; }
    case 30: 
      var $125=$B;
      var $fd117=(($125+8)|0);
      var $126=HEAP32[(($fd117)>>2)];
      $F104=$126;
      label = 32; break;
    case 31: 
      _abort();
      throw "Reached an unreachable!"
    case 32: 
      label = 33; break;
    case 33: 
      var $127=$DV;
      var $128=$B;
      var $fd121=(($128+8)|0);
      HEAP32[(($fd121)>>2)]=$127;
      var $129=$DV;
      var $130=$F104;
      var $bk122=(($130+12)|0);
      HEAP32[(($bk122)>>2)]=$129;
      var $131=$F104;
      var $132=$DV;
      var $fd123=(($132+8)|0);
      HEAP32[(($fd123)>>2)]=$131;
      var $133=$B;
      var $134=$DV;
      var $bk124=(($134+12)|0);
      HEAP32[(($bk124)>>2)]=$133;
      label = 34; break;
    case 34: 
      var $135=$rsize;
      HEAP32[((((5243112)|0))>>2)]=$135;
      var $136=$r;
      HEAP32[((((5243124)|0))>>2)]=$136;
      var $137=$p34;
      var $138=$137;
      var $add_ptr126=(($138+8)|0);
      $mem=$add_ptr126;
      label = 58; break;
    case 35: 
      var $139=HEAP32[((((5243108)|0))>>2)];
      var $cmp128=(($139)|(0))!=0;
      if ($cmp128) { label = 36; break; } else { label = 38; break; }
    case 36: 
      var $140=$nb;
      var $call=_tmalloc_small(5243104, $140);
      $mem=$call;
      var $cmp130=(($call)|(0))!=0;
      if ($cmp130) { label = 37; break; } else { label = 38; break; }
    case 37: 
      label = 58; break;
    case 38: 
      label = 39; break;
    case 39: 
      label = 40; break;
    case 40: 
      label = 41; break;
    case 41: 
      label = 49; break;
    case 42: 
      var $141=$bytes_addr;
      var $cmp138=(($141)>>>(0)) >= 4294967232;
      if ($cmp138) { label = 43; break; } else { label = 44; break; }
    case 43: 
      $nb=-1;
      label = 48; break;
    case 44: 
      var $142=$bytes_addr;
      var $add142=((($142)+(4))|0);
      var $add143=((($add142)+(7))|0);
      var $and144=$add143 & -8;
      $nb=$and144;
      var $143=HEAP32[((((5243108)|0))>>2)];
      var $cmp145=(($143)|(0))!=0;
      if ($cmp145) { label = 45; break; } else { label = 47; break; }
    case 45: 
      var $144=$nb;
      var $call148=_tmalloc_large(5243104, $144);
      $mem=$call148;
      var $cmp149=(($call148)|(0))!=0;
      if ($cmp149) { label = 46; break; } else { label = 47; break; }
    case 46: 
      label = 58; break;
    case 47: 
      label = 48; break;
    case 48: 
      label = 49; break;
    case 49: 
      var $145=$nb;
      var $146=HEAP32[((((5243112)|0))>>2)];
      var $cmp155=(($145)>>>(0)) <= (($146)>>>(0));
      if ($cmp155) { label = 50; break; } else { label = 54; break; }
    case 50: 
      var $147=HEAP32[((((5243112)|0))>>2)];
      var $148=$nb;
      var $sub159=((($147)-($148))|0);
      $rsize158=$sub159;
      var $149=HEAP32[((((5243124)|0))>>2)];
      $p160=$149;
      var $150=$rsize158;
      var $cmp161=(($150)>>>(0)) >= 16;
      if ($cmp161) { label = 51; break; } else { label = 52; break; }
    case 51: 
      var $151=$p160;
      var $152=$151;
      var $153=$nb;
      var $add_ptr165=(($152+$153)|0);
      var $154=$add_ptr165;
      HEAP32[((((5243124)|0))>>2)]=$154;
      $r164=$154;
      var $155=$rsize158;
      HEAP32[((((5243112)|0))>>2)]=$155;
      var $156=$rsize158;
      var $or166=$156 | 1;
      var $157=$r164;
      var $head167=(($157+4)|0);
      HEAP32[(($head167)>>2)]=$or166;
      var $158=$rsize158;
      var $159=$r164;
      var $160=$159;
      var $161=$rsize158;
      var $add_ptr168=(($160+$161)|0);
      var $162=$add_ptr168;
      var $prev_foot169=(($162)|0);
      HEAP32[(($prev_foot169)>>2)]=$158;
      var $163=$nb;
      var $or170=$163 | 1;
      var $or171=$or170 | 2;
      var $164=$p160;
      var $head172=(($164+4)|0);
      HEAP32[(($head172)>>2)]=$or171;
      label = 53; break;
    case 52: 
      var $165=HEAP32[((((5243112)|0))>>2)];
      $dvs=$165;
      HEAP32[((((5243112)|0))>>2)]=0;
      HEAP32[((((5243124)|0))>>2)]=0;
      var $166=$dvs;
      var $or174=$166 | 1;
      var $or175=$or174 | 2;
      var $167=$p160;
      var $head176=(($167+4)|0);
      HEAP32[(($head176)>>2)]=$or175;
      var $168=$p160;
      var $169=$168;
      var $170=$dvs;
      var $add_ptr177=(($169+$170)|0);
      var $171=$add_ptr177;
      var $head178=(($171+4)|0);
      var $172=HEAP32[(($head178)>>2)];
      var $or179=$172 | 1;
      HEAP32[(($head178)>>2)]=$or179;
      label = 53; break;
    case 53: 
      var $173=$p160;
      var $174=$173;
      var $add_ptr181=(($174+8)|0);
      $mem=$add_ptr181;
      label = 58; break;
    case 54: 
      var $175=$nb;
      var $176=HEAP32[((((5243116)|0))>>2)];
      var $cmp183=(($175)>>>(0)) < (($176)>>>(0));
      if ($cmp183) { label = 55; break; } else { label = 56; break; }
    case 55: 
      var $177=$nb;
      var $178=HEAP32[((((5243116)|0))>>2)];
      var $sub187=((($178)-($177))|0);
      HEAP32[((((5243116)|0))>>2)]=$sub187;
      $rsize186=$sub187;
      var $179=HEAP32[((((5243128)|0))>>2)];
      $p188=$179;
      var $180=$p188;
      var $181=$180;
      var $182=$nb;
      var $add_ptr190=(($181+$182)|0);
      var $183=$add_ptr190;
      HEAP32[((((5243128)|0))>>2)]=$183;
      $r189=$183;
      var $184=$rsize186;
      var $or191=$184 | 1;
      var $185=$r189;
      var $head192=(($185+4)|0);
      HEAP32[(($head192)>>2)]=$or191;
      var $186=$nb;
      var $or193=$186 | 1;
      var $or194=$or193 | 2;
      var $187=$p188;
      var $head195=(($187+4)|0);
      HEAP32[(($head195)>>2)]=$or194;
      var $188=$p188;
      var $189=$188;
      var $add_ptr196=(($189+8)|0);
      $mem=$add_ptr196;
      label = 58; break;
    case 56: 
      label = 57; break;
    case 57: 
      var $190=$nb;
      var $call199=_sys_alloc(5243104, $190);
      $mem=$call199;
      label = 58; break;
    case 58: 
      var $191=$mem;

      return $191;
    default: assert(0, "bad label: " + label);
  }

}


function _tmalloc_small($m, $nb) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $nb_addr;
      var $t;
      var $v;
      var $rsize;
      var $i;
      var $leastbit;
      var $Y;
      var $K;
      var $N;
      var $trem;
      var $r;
      var $XP;
      var $R;
      var $F;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $DVS;
      var $DV;
      var $I;
      var $B;
      var $F197;
      $m_addr=$m;
      $nb_addr=$nb;
      var $0=$m_addr;
      var $treemap=(($0+4)|0);
      var $1=HEAP32[(($treemap)>>2)];
      var $2=$m_addr;
      var $treemap1=(($2+4)|0);
      var $3=HEAP32[(($treemap1)>>2)];
      var $sub=(((-$3))|0);
      var $and=$1 & $sub;
      $leastbit=$and;
      var $4=$leastbit;
      var $sub2=((($4)-(1))|0);
      $Y=$sub2;
      var $5=$Y;
      var $shr=$5 >>> 12;
      var $and3=$shr & 16;
      $K=$and3;
      var $6=$K;
      $N=$6;
      var $7=$K;
      var $8=$Y;
      var $shr4=$8 >>> (($7)>>>(0));
      $Y=$shr4;
      var $9=$Y;
      var $shr5=$9 >>> 5;
      var $and6=$shr5 & 8;
      $K=$and6;
      var $10=$N;
      var $add=((($10)+($and6))|0);
      $N=$add;
      var $11=$K;
      var $12=$Y;
      var $shr7=$12 >>> (($11)>>>(0));
      $Y=$shr7;
      var $13=$Y;
      var $shr8=$13 >>> 2;
      var $and9=$shr8 & 4;
      $K=$and9;
      var $14=$N;
      var $add10=((($14)+($and9))|0);
      $N=$add10;
      var $15=$K;
      var $16=$Y;
      var $shr11=$16 >>> (($15)>>>(0));
      $Y=$shr11;
      var $17=$Y;
      var $shr12=$17 >>> 1;
      var $and13=$shr12 & 2;
      $K=$and13;
      var $18=$N;
      var $add14=((($18)+($and13))|0);
      $N=$add14;
      var $19=$K;
      var $20=$Y;
      var $shr15=$20 >>> (($19)>>>(0));
      $Y=$shr15;
      var $21=$Y;
      var $shr16=$21 >>> 1;
      var $and17=$shr16 & 1;
      $K=$and17;
      var $22=$N;
      var $add18=((($22)+($and17))|0);
      $N=$add18;
      var $23=$K;
      var $24=$Y;
      var $shr19=$24 >>> (($23)>>>(0));
      $Y=$shr19;
      var $25=$N;
      var $26=$Y;
      var $add20=((($25)+($26))|0);
      $i=$add20;
      var $27=$i;
      var $28=$m_addr;
      var $treebins=(($28+304)|0);
      var $arrayidx=(($treebins+($27<<2))|0);
      var $29=HEAP32[(($arrayidx)>>2)];
      $t=$29;
      $v=$29;
      var $30=$t;
      var $head=(($30+4)|0);
      var $31=HEAP32[(($head)>>2)];
      var $and21=$31 & -8;
      var $32=$nb_addr;
      var $sub22=((($and21)-($32))|0);
      $rsize=$sub22;
      label = 3; break;
    case 3: 
      var $33=$t;
      var $child=(($33+16)|0);
      var $arrayidx23=(($child)|0);
      var $34=HEAP32[(($arrayidx23)>>2)];
      var $cmp=(($34)|(0))!=0;
      if ($cmp) { label = 4; break; } else { label = 5; break; }
    case 4: 
      var $35=$t;
      var $child24=(($35+16)|0);
      var $arrayidx25=(($child24)|0);
      var $36=HEAP32[(($arrayidx25)>>2)];
      var $cond = $36;label = 6; break;
    case 5: 
      var $37=$t;
      var $child26=(($37+16)|0);
      var $arrayidx27=(($child26+4)|0);
      var $38=HEAP32[(($arrayidx27)>>2)];
      var $cond = $38;label = 6; break;
    case 6: 
      var $cond;
      $t=$cond;
      var $cmp28=(($cond)|(0))!=0;
      if ($cmp28) { label = 7; break; } else { label = 10; break; }
    case 7: 
      var $39=$t;
      var $head29=(($39+4)|0);
      var $40=HEAP32[(($head29)>>2)];
      var $and30=$40 & -8;
      var $41=$nb_addr;
      var $sub31=((($and30)-($41))|0);
      $trem=$sub31;
      var $42=$trem;
      var $43=$rsize;
      var $cmp32=(($42)>>>(0)) < (($43)>>>(0));
      if ($cmp32) { label = 8; break; } else { label = 9; break; }
    case 8: 
      var $44=$trem;
      $rsize=$44;
      var $45=$t;
      $v=$45;
      label = 9; break;
    case 9: 
      label = 3; break;
    case 10: 
      var $46=$v;
      var $47=$46;
      var $48=$m_addr;
      var $least_addr=(($48+16)|0);
      var $49=HEAP32[(($least_addr)>>2)];
      var $cmp33=(($47)>>>(0)) >= (($49)>>>(0));
      var $conv=(($cmp33)&(1));
      var $expval=($conv);
      var $tobool=(($expval)|(0))!=0;
      if ($tobool) { label = 11; break; } else { label = 73; break; }
    case 11: 
      var $50=$v;
      var $51=$50;
      var $52=$nb_addr;
      var $add_ptr=(($51+$52)|0);
      var $53=$add_ptr;
      $r=$53;
      var $54=$v;
      var $55=$54;
      var $56=$r;
      var $57=$56;
      var $cmp35=(($55)>>>(0)) < (($57)>>>(0));
      var $conv36=(($cmp35)&(1));
      var $expval37=($conv36);
      var $tobool38=(($expval37)|(0))!=0;
      if ($tobool38) { label = 12; break; } else { label = 72; break; }
    case 12: 
      var $58=$v;
      var $parent=(($58+24)|0);
      var $59=HEAP32[(($parent)>>2)];
      $XP=$59;
      var $60=$v;
      var $bk=(($60+12)|0);
      var $61=HEAP32[(($bk)>>2)];
      var $62=$v;
      var $cmp40=(($61)|(0))!=(($62)|(0));
      if ($cmp40) { label = 13; break; } else { label = 20; break; }
    case 13: 
      var $63=$v;
      var $fd=(($63+8)|0);
      var $64=HEAP32[(($fd)>>2)];
      $F=$64;
      var $65=$v;
      var $bk43=(($65+12)|0);
      var $66=HEAP32[(($bk43)>>2)];
      $R=$66;
      var $67=$F;
      var $68=$67;
      var $69=$m_addr;
      var $least_addr44=(($69+16)|0);
      var $70=HEAP32[(($least_addr44)>>2)];
      var $cmp45=(($68)>>>(0)) >= (($70)>>>(0));
      if ($cmp45) { label = 14; break; } else { var $77 = 0;label = 16; break; }
    case 14: 
      var $71=$F;
      var $bk47=(($71+12)|0);
      var $72=HEAP32[(($bk47)>>2)];
      var $73=$v;
      var $cmp48=(($72)|(0))==(($73)|(0));
      if ($cmp48) { label = 15; break; } else { var $77 = 0;label = 16; break; }
    case 15: 
      var $74=$R;
      var $fd50=(($74+8)|0);
      var $75=HEAP32[(($fd50)>>2)];
      var $76=$v;
      var $cmp51=(($75)|(0))==(($76)|(0));
      var $77 = $cmp51;label = 16; break;
    case 16: 
      var $77;
      var $land_ext=(($77)&(1));
      var $expval53=($land_ext);
      var $tobool54=(($expval53)|(0))!=0;
      if ($tobool54) { label = 17; break; } else { label = 18; break; }
    case 17: 
      var $78=$R;
      var $79=$F;
      var $bk56=(($79+12)|0);
      HEAP32[(($bk56)>>2)]=$78;
      var $80=$F;
      var $81=$R;
      var $fd57=(($81+8)|0);
      HEAP32[(($fd57)>>2)]=$80;
      label = 19; break;
    case 18: 
      _abort();
      throw "Reached an unreachable!"
    case 19: 
      label = 32; break;
    case 20: 
      var $82=$v;
      var $child60=(($82+16)|0);
      var $arrayidx61=(($child60+4)|0);
      $RP=$arrayidx61;
      var $83=HEAP32[(($arrayidx61)>>2)];
      $R=$83;
      var $cmp62=(($83)|(0))!=0;
      if ($cmp62) { label = 22; break; } else { label = 21; break; }
    case 21: 
      var $84=$v;
      var $child64=(($84+16)|0);
      var $arrayidx65=(($child64)|0);
      $RP=$arrayidx65;
      var $85=HEAP32[(($arrayidx65)>>2)];
      $R=$85;
      var $cmp66=(($85)|(0))!=0;
      if ($cmp66) { label = 22; break; } else { label = 31; break; }
    case 22: 
      label = 23; break;
    case 23: 
      var $86=$R;
      var $child70=(($86+16)|0);
      var $arrayidx71=(($child70+4)|0);
      $CP=$arrayidx71;
      var $87=HEAP32[(($arrayidx71)>>2)];
      var $cmp72=(($87)|(0))!=0;
      if ($cmp72) { var $90 = 1;label = 25; break; } else { label = 24; break; }
    case 24: 
      var $88=$R;
      var $child74=(($88+16)|0);
      var $arrayidx75=(($child74)|0);
      $CP=$arrayidx75;
      var $89=HEAP32[(($arrayidx75)>>2)];
      var $cmp76=(($89)|(0))!=0;
      var $90 = $cmp76;label = 25; break;
    case 25: 
      var $90;
      if ($90) { label = 26; break; } else { label = 27; break; }
    case 26: 
      var $91=$CP;
      $RP=$91;
      var $92=HEAP32[(($91)>>2)];
      $R=$92;
      label = 23; break;
    case 27: 
      var $93=$RP;
      var $94=$93;
      var $95=$m_addr;
      var $least_addr80=(($95+16)|0);
      var $96=HEAP32[(($least_addr80)>>2)];
      var $cmp81=(($94)>>>(0)) >= (($96)>>>(0));
      var $conv82=(($cmp81)&(1));
      var $expval83=($conv82);
      var $tobool84=(($expval83)|(0))!=0;
      if ($tobool84) { label = 28; break; } else { label = 29; break; }
    case 28: 
      var $97=$RP;
      HEAP32[(($97)>>2)]=0;
      label = 30; break;
    case 29: 
      _abort();
      throw "Reached an unreachable!"
    case 30: 
      label = 31; break;
    case 31: 
      label = 32; break;
    case 32: 
      var $98=$XP;
      var $cmp90=(($98)|(0))!=0;
      if ($cmp90) { label = 33; break; } else { label = 60; break; }
    case 33: 
      var $99=$v;
      var $index=(($99+28)|0);
      var $100=HEAP32[(($index)>>2)];
      var $101=$m_addr;
      var $treebins93=(($101+304)|0);
      var $arrayidx94=(($treebins93+($100<<2))|0);
      $H=$arrayidx94;
      var $102=$v;
      var $103=$H;
      var $104=HEAP32[(($103)>>2)];
      var $cmp95=(($102)|(0))==(($104)|(0));
      if ($cmp95) { label = 34; break; } else { label = 37; break; }
    case 34: 
      var $105=$R;
      var $106=$H;
      HEAP32[(($106)>>2)]=$105;
      var $cmp98=(($105)|(0))==0;
      if ($cmp98) { label = 35; break; } else { label = 36; break; }
    case 35: 
      var $107=$v;
      var $index101=(($107+28)|0);
      var $108=HEAP32[(($index101)>>2)];
      var $shl=1 << $108;
      var $neg=$shl ^ -1;
      var $109=$m_addr;
      var $treemap102=(($109+4)|0);
      var $110=HEAP32[(($treemap102)>>2)];
      var $and103=$110 & $neg;
      HEAP32[(($treemap102)>>2)]=$and103;
      label = 36; break;
    case 36: 
      label = 44; break;
    case 37: 
      var $111=$XP;
      var $112=$111;
      var $113=$m_addr;
      var $least_addr106=(($113+16)|0);
      var $114=HEAP32[(($least_addr106)>>2)];
      var $cmp107=(($112)>>>(0)) >= (($114)>>>(0));
      var $conv108=(($cmp107)&(1));
      var $expval109=($conv108);
      var $tobool110=(($expval109)|(0))!=0;
      if ($tobool110) { label = 38; break; } else { label = 42; break; }
    case 38: 
      var $115=$XP;
      var $child112=(($115+16)|0);
      var $arrayidx113=(($child112)|0);
      var $116=HEAP32[(($arrayidx113)>>2)];
      var $117=$v;
      var $cmp114=(($116)|(0))==(($117)|(0));
      if ($cmp114) { label = 39; break; } else { label = 40; break; }
    case 39: 
      var $118=$R;
      var $119=$XP;
      var $child117=(($119+16)|0);
      var $arrayidx118=(($child117)|0);
      HEAP32[(($arrayidx118)>>2)]=$118;
      label = 41; break;
    case 40: 
      var $120=$R;
      var $121=$XP;
      var $child120=(($121+16)|0);
      var $arrayidx121=(($child120+4)|0);
      HEAP32[(($arrayidx121)>>2)]=$120;
      label = 41; break;
    case 41: 
      label = 43; break;
    case 42: 
      _abort();
      throw "Reached an unreachable!"
    case 43: 
      label = 44; break;
    case 44: 
      var $122=$R;
      var $cmp126=(($122)|(0))!=0;
      if ($cmp126) { label = 45; break; } else { label = 59; break; }
    case 45: 
      var $123=$R;
      var $124=$123;
      var $125=$m_addr;
      var $least_addr129=(($125+16)|0);
      var $126=HEAP32[(($least_addr129)>>2)];
      var $cmp130=(($124)>>>(0)) >= (($126)>>>(0));
      var $conv131=(($cmp130)&(1));
      var $expval132=($conv131);
      var $tobool133=(($expval132)|(0))!=0;
      if ($tobool133) { label = 46; break; } else { label = 57; break; }
    case 46: 
      var $127=$XP;
      var $128=$R;
      var $parent135=(($128+24)|0);
      HEAP32[(($parent135)>>2)]=$127;
      var $129=$v;
      var $child136=(($129+16)|0);
      var $arrayidx137=(($child136)|0);
      var $130=HEAP32[(($arrayidx137)>>2)];
      $C0=$130;
      var $cmp138=(($130)|(0))!=0;
      if ($cmp138) { label = 47; break; } else { label = 51; break; }
    case 47: 
      var $131=$C0;
      var $132=$131;
      var $133=$m_addr;
      var $least_addr141=(($133+16)|0);
      var $134=HEAP32[(($least_addr141)>>2)];
      var $cmp142=(($132)>>>(0)) >= (($134)>>>(0));
      var $conv143=(($cmp142)&(1));
      var $expval144=($conv143);
      var $tobool145=(($expval144)|(0))!=0;
      if ($tobool145) { label = 48; break; } else { label = 49; break; }
    case 48: 
      var $135=$C0;
      var $136=$R;
      var $child147=(($136+16)|0);
      var $arrayidx148=(($child147)|0);
      HEAP32[(($arrayidx148)>>2)]=$135;
      var $137=$R;
      var $138=$C0;
      var $parent149=(($138+24)|0);
      HEAP32[(($parent149)>>2)]=$137;
      label = 50; break;
    case 49: 
      _abort();
      throw "Reached an unreachable!"
    case 50: 
      label = 51; break;
    case 51: 
      var $139=$v;
      var $child153=(($139+16)|0);
      var $arrayidx154=(($child153+4)|0);
      var $140=HEAP32[(($arrayidx154)>>2)];
      $C1=$140;
      var $cmp155=(($140)|(0))!=0;
      if ($cmp155) { label = 52; break; } else { label = 56; break; }
    case 52: 
      var $141=$C1;
      var $142=$141;
      var $143=$m_addr;
      var $least_addr158=(($143+16)|0);
      var $144=HEAP32[(($least_addr158)>>2)];
      var $cmp159=(($142)>>>(0)) >= (($144)>>>(0));
      var $conv160=(($cmp159)&(1));
      var $expval161=($conv160);
      var $tobool162=(($expval161)|(0))!=0;
      if ($tobool162) { label = 53; break; } else { label = 54; break; }
    case 53: 
      var $145=$C1;
      var $146=$R;
      var $child164=(($146+16)|0);
      var $arrayidx165=(($child164+4)|0);
      HEAP32[(($arrayidx165)>>2)]=$145;
      var $147=$R;
      var $148=$C1;
      var $parent166=(($148+24)|0);
      HEAP32[(($parent166)>>2)]=$147;
      label = 55; break;
    case 54: 
      _abort();
      throw "Reached an unreachable!"
    case 55: 
      label = 56; break;
    case 56: 
      label = 58; break;
    case 57: 
      _abort();
      throw "Reached an unreachable!"
    case 58: 
      label = 59; break;
    case 59: 
      label = 60; break;
    case 60: 
      var $149=$rsize;
      var $cmp174=(($149)>>>(0)) < 16;
      if ($cmp174) { label = 61; break; } else { label = 62; break; }
    case 61: 
      var $150=$rsize;
      var $151=$nb_addr;
      var $add177=((($150)+($151))|0);
      var $or=$add177 | 1;
      var $or178=$or | 2;
      var $152=$v;
      var $head179=(($152+4)|0);
      HEAP32[(($head179)>>2)]=$or178;
      var $153=$v;
      var $154=$153;
      var $155=$rsize;
      var $156=$nb_addr;
      var $add180=((($155)+($156))|0);
      var $add_ptr181=(($154+$add180)|0);
      var $157=$add_ptr181;
      var $head182=(($157+4)|0);
      var $158=HEAP32[(($head182)>>2)];
      var $or183=$158 | 1;
      HEAP32[(($head182)>>2)]=$or183;
      label = 71; break;
    case 62: 
      var $159=$nb_addr;
      var $or185=$159 | 1;
      var $or186=$or185 | 2;
      var $160=$v;
      var $head187=(($160+4)|0);
      HEAP32[(($head187)>>2)]=$or186;
      var $161=$rsize;
      var $or188=$161 | 1;
      var $162=$r;
      var $head189=(($162+4)|0);
      HEAP32[(($head189)>>2)]=$or188;
      var $163=$rsize;
      var $164=$r;
      var $165=$164;
      var $166=$rsize;
      var $add_ptr190=(($165+$166)|0);
      var $167=$add_ptr190;
      var $prev_foot=(($167)|0);
      HEAP32[(($prev_foot)>>2)]=$163;
      var $168=$m_addr;
      var $dvsize=(($168+8)|0);
      var $169=HEAP32[(($dvsize)>>2)];
      $DVS=$169;
      var $170=$DVS;
      var $cmp191=(($170)|(0))!=0;
      if ($cmp191) { label = 63; break; } else { label = 70; break; }
    case 63: 
      var $171=$m_addr;
      var $dv=(($171+20)|0);
      var $172=HEAP32[(($dv)>>2)];
      $DV=$172;
      var $173=$DVS;
      var $shr194=$173 >>> 3;
      $I=$shr194;
      var $174=$I;
      var $shl195=$174 << 1;
      var $175=$m_addr;
      var $smallbins=(($175+40)|0);
      var $arrayidx196=(($smallbins+($shl195<<2))|0);
      var $176=$arrayidx196;
      var $177=$176;
      $B=$177;
      var $178=$B;
      $F197=$178;
      var $179=$m_addr;
      var $smallmap=(($179)|0);
      var $180=HEAP32[(($smallmap)>>2)];
      var $181=$I;
      var $shl198=1 << $181;
      var $and199=$180 & $shl198;
      var $tobool200=(($and199)|(0))!=0;
      if ($tobool200) { label = 65; break; } else { label = 64; break; }
    case 64: 
      var $182=$I;
      var $shl202=1 << $182;
      var $183=$m_addr;
      var $smallmap203=(($183)|0);
      var $184=HEAP32[(($smallmap203)>>2)];
      var $or204=$184 | $shl202;
      HEAP32[(($smallmap203)>>2)]=$or204;
      label = 69; break;
    case 65: 
      var $185=$B;
      var $fd206=(($185+8)|0);
      var $186=HEAP32[(($fd206)>>2)];
      var $187=$186;
      var $188=$m_addr;
      var $least_addr207=(($188+16)|0);
      var $189=HEAP32[(($least_addr207)>>2)];
      var $cmp208=(($187)>>>(0)) >= (($189)>>>(0));
      var $conv209=(($cmp208)&(1));
      var $expval210=($conv209);
      var $tobool211=(($expval210)|(0))!=0;
      if ($tobool211) { label = 66; break; } else { label = 67; break; }
    case 66: 
      var $190=$B;
      var $fd213=(($190+8)|0);
      var $191=HEAP32[(($fd213)>>2)];
      $F197=$191;
      label = 68; break;
    case 67: 
      _abort();
      throw "Reached an unreachable!"
    case 68: 
      label = 69; break;
    case 69: 
      var $192=$DV;
      var $193=$B;
      var $fd217=(($193+8)|0);
      HEAP32[(($fd217)>>2)]=$192;
      var $194=$DV;
      var $195=$F197;
      var $bk218=(($195+12)|0);
      HEAP32[(($bk218)>>2)]=$194;
      var $196=$F197;
      var $197=$DV;
      var $fd219=(($197+8)|0);
      HEAP32[(($fd219)>>2)]=$196;
      var $198=$B;
      var $199=$DV;
      var $bk220=(($199+12)|0);
      HEAP32[(($bk220)>>2)]=$198;
      label = 70; break;
    case 70: 
      var $200=$rsize;
      var $201=$m_addr;
      var $dvsize222=(($201+8)|0);
      HEAP32[(($dvsize222)>>2)]=$200;
      var $202=$r;
      var $203=$m_addr;
      var $dv223=(($203+20)|0);
      HEAP32[(($dv223)>>2)]=$202;
      label = 71; break;
    case 71: 
      var $204=$v;
      var $205=$204;
      var $add_ptr225=(($205+8)|0);

      return $add_ptr225;
    case 72: 
      label = 73; break;
    case 73: 
      _abort();
      throw "Reached an unreachable!"
    default: assert(0, "bad label: " + label);
  }

}


function _tmalloc_large($m, $nb) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $m_addr;
      var $nb_addr;
      var $v;
      var $rsize;
      var $t;
      var $idx;
      var $X;
      var $Y;
      var $N;
      var $K;
      var $sizebits;
      var $rst;
      var $rt;
      var $trem;
      var $leftbits;
      var $i;
      var $leastbit;
      var $Y68;
      var $K70;
      var $N73;
      var $trem97;
      var $r;
      var $XP;
      var $R;
      var $F;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $I;
      var $B;
      var $F289;
      var $TP;
      var $H314;
      var $I315;
      var $X316;
      var $Y326;
      var $N327;
      var $K331;
      var $T;
      var $K372;
      var $C;
      var $F411;
      $m_addr=$m;
      $nb_addr=$nb;
      $v=0;
      var $0=$nb_addr;
      var $sub=(((-$0))|0);
      $rsize=$sub;
      var $1=$nb_addr;
      var $shr=$1 >>> 8;
      $X=$shr;
      var $2=$X;
      var $cmp=(($2)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      $idx=0;
      label = 8; break;
    case 4: 
      var $3=$X;
      var $cmp1=(($3)>>>(0)) > 65535;
      if ($cmp1) { label = 5; break; } else { label = 6; break; }
    case 5: 
      $idx=31;
      label = 7; break;
    case 6: 
      var $4=$X;
      $Y=$4;
      var $5=$Y;
      var $sub4=((($5)-(256))|0);
      var $shr5=$sub4 >>> 16;
      var $and=$shr5 & 8;
      $N=$and;
      var $6=$N;
      var $7=$Y;
      var $shl=$7 << $6;
      $Y=$shl;
      var $sub6=((($shl)-(4096))|0);
      var $shr7=$sub6 >>> 16;
      var $and8=$shr7 & 4;
      $K=$and8;
      var $8=$K;
      var $9=$N;
      var $add=((($9)+($8))|0);
      $N=$add;
      var $10=$K;
      var $11=$Y;
      var $shl9=$11 << $10;
      $Y=$shl9;
      var $sub10=((($shl9)-(16384))|0);
      var $shr11=$sub10 >>> 16;
      var $and12=$shr11 & 2;
      $K=$and12;
      var $12=$N;
      var $add13=((($12)+($and12))|0);
      $N=$add13;
      var $13=$N;
      var $sub14=(((14)-($13))|0);
      var $14=$K;
      var $15=$Y;
      var $shl15=$15 << $14;
      $Y=$shl15;
      var $shr16=$shl15 >>> 15;
      var $add17=((($sub14)+($shr16))|0);
      $K=$add17;
      var $16=$K;
      var $shl18=$16 << 1;
      var $17=$nb_addr;
      var $18=$K;
      var $add19=((($18)+(7))|0);
      var $shr20=$17 >>> (($add19)>>>(0));
      var $and21=$shr20 & 1;
      var $add22=((($shl18)+($and21))|0);
      $idx=$add22;
      label = 7; break;
    case 7: 
      label = 8; break;
    case 8: 
      var $19=$idx;
      var $20=$m_addr;
      var $treebins=(($20+304)|0);
      var $arrayidx=(($treebins+($19<<2))|0);
      var $21=HEAP32[(($arrayidx)>>2)];
      $t=$21;
      var $cmp24=(($21)|(0))!=0;
      if ($cmp24) { label = 9; break; } else { label = 24; break; }
    case 9: 
      var $22=$nb_addr;
      var $23=$idx;
      var $cmp26=(($23)|(0))==31;
      if ($cmp26) { label = 10; break; } else { label = 11; break; }
    case 10: 
      var $cond = 0;label = 12; break;
    case 11: 
      var $24=$idx;
      var $shr27=$24 >>> 1;
      var $add28=((($shr27)+(8))|0);
      var $sub29=((($add28)-(2))|0);
      var $sub30=(((31)-($sub29))|0);
      var $cond = $sub30;label = 12; break;
    case 12: 
      var $cond;
      var $shl31=$22 << $cond;
      $sizebits=$shl31;
      $rst=0;
      label = 13; break;
    case 13: 
      var $25=$t;
      var $head=(($25+4)|0);
      var $26=HEAP32[(($head)>>2)];
      var $and32=$26 & -8;
      var $27=$nb_addr;
      var $sub33=((($and32)-($27))|0);
      $trem=$sub33;
      var $28=$trem;
      var $29=$rsize;
      var $cmp34=(($28)>>>(0)) < (($29)>>>(0));
      if ($cmp34) { label = 14; break; } else { label = 17; break; }
    case 14: 
      var $30=$t;
      $v=$30;
      var $31=$trem;
      $rsize=$31;
      var $cmp36=(($31)|(0))==0;
      if ($cmp36) { label = 15; break; } else { label = 16; break; }
    case 15: 
      label = 23; break;
    case 16: 
      label = 17; break;
    case 17: 
      var $32=$t;
      var $child=(($32+16)|0);
      var $arrayidx40=(($child+4)|0);
      var $33=HEAP32[(($arrayidx40)>>2)];
      $rt=$33;
      var $34=$sizebits;
      var $shr41=$34 >>> 31;
      var $and42=$shr41 & 1;
      var $35=$t;
      var $child43=(($35+16)|0);
      var $arrayidx44=(($child43+($and42<<2))|0);
      var $36=HEAP32[(($arrayidx44)>>2)];
      $t=$36;
      var $37=$rt;
      var $cmp45=(($37)|(0))!=0;
      if ($cmp45) { label = 18; break; } else { label = 20; break; }
    case 18: 
      var $38=$rt;
      var $39=$t;
      var $cmp46=(($38)|(0))!=(($39)|(0));
      if ($cmp46) { label = 19; break; } else { label = 20; break; }
    case 19: 
      var $40=$rt;
      $rst=$40;
      label = 20; break;
    case 20: 
      var $41=$t;
      var $cmp49=(($41)|(0))==0;
      if ($cmp49) { label = 21; break; } else { label = 22; break; }
    case 21: 
      var $42=$rst;
      $t=$42;
      label = 23; break;
    case 22: 
      var $43=$sizebits;
      var $shl52=$43 << 1;
      $sizebits=$shl52;
      label = 13; break;
    case 23: 
      label = 24; break;
    case 24: 
      var $44=$t;
      var $cmp54=(($44)|(0))==0;
      if ($cmp54) { label = 25; break; } else { label = 29; break; }
    case 25: 
      var $45=$v;
      var $cmp56=(($45)|(0))==0;
      if ($cmp56) { label = 26; break; } else { label = 29; break; }
    case 26: 
      var $46=$idx;
      var $shl58=1 << $46;
      var $shl59=$shl58 << 1;
      var $47=$idx;
      var $shl60=1 << $47;
      var $shl61=$shl60 << 1;
      var $sub62=(((-$shl61))|0);
      var $or=$shl59 | $sub62;
      var $48=$m_addr;
      var $treemap=(($48+4)|0);
      var $49=HEAP32[(($treemap)>>2)];
      var $and63=$or & $49;
      $leftbits=$and63;
      var $50=$leftbits;
      var $cmp64=(($50)|(0))!=0;
      if ($cmp64) { label = 27; break; } else { label = 28; break; }
    case 27: 
      var $51=$leftbits;
      var $52=$leftbits;
      var $sub66=(((-$52))|0);
      var $and67=$51 & $sub66;
      $leastbit=$and67;
      var $53=$leastbit;
      var $sub69=((($53)-(1))|0);
      $Y68=$sub69;
      var $54=$Y68;
      var $shr71=$54 >>> 12;
      var $and72=$shr71 & 16;
      $K70=$and72;
      var $55=$K70;
      $N73=$55;
      var $56=$K70;
      var $57=$Y68;
      var $shr74=$57 >>> (($56)>>>(0));
      $Y68=$shr74;
      var $58=$Y68;
      var $shr75=$58 >>> 5;
      var $and76=$shr75 & 8;
      $K70=$and76;
      var $59=$N73;
      var $add77=((($59)+($and76))|0);
      $N73=$add77;
      var $60=$K70;
      var $61=$Y68;
      var $shr78=$61 >>> (($60)>>>(0));
      $Y68=$shr78;
      var $62=$Y68;
      var $shr79=$62 >>> 2;
      var $and80=$shr79 & 4;
      $K70=$and80;
      var $63=$N73;
      var $add81=((($63)+($and80))|0);
      $N73=$add81;
      var $64=$K70;
      var $65=$Y68;
      var $shr82=$65 >>> (($64)>>>(0));
      $Y68=$shr82;
      var $66=$Y68;
      var $shr83=$66 >>> 1;
      var $and84=$shr83 & 2;
      $K70=$and84;
      var $67=$N73;
      var $add85=((($67)+($and84))|0);
      $N73=$add85;
      var $68=$K70;
      var $69=$Y68;
      var $shr86=$69 >>> (($68)>>>(0));
      $Y68=$shr86;
      var $70=$Y68;
      var $shr87=$70 >>> 1;
      var $and88=$shr87 & 1;
      $K70=$and88;
      var $71=$N73;
      var $add89=((($71)+($and88))|0);
      $N73=$add89;
      var $72=$K70;
      var $73=$Y68;
      var $shr90=$73 >>> (($72)>>>(0));
      $Y68=$shr90;
      var $74=$N73;
      var $75=$Y68;
      var $add91=((($74)+($75))|0);
      $i=$add91;
      var $76=$i;
      var $77=$m_addr;
      var $treebins92=(($77+304)|0);
      var $arrayidx93=(($treebins92+($76<<2))|0);
      var $78=HEAP32[(($arrayidx93)>>2)];
      $t=$78;
      label = 28; break;
    case 28: 
      label = 29; break;
    case 29: 
      label = 30; break;
    case 30: 
      var $79=$t;
      var $cmp96=(($79)|(0))!=0;
      if ($cmp96) { label = 31; break; } else { label = 37; break; }
    case 31: 
      var $80=$t;
      var $head98=(($80+4)|0);
      var $81=HEAP32[(($head98)>>2)];
      var $and99=$81 & -8;
      var $82=$nb_addr;
      var $sub100=((($and99)-($82))|0);
      $trem97=$sub100;
      var $83=$trem97;
      var $84=$rsize;
      var $cmp101=(($83)>>>(0)) < (($84)>>>(0));
      if ($cmp101) { label = 32; break; } else { label = 33; break; }
    case 32: 
      var $85=$trem97;
      $rsize=$85;
      var $86=$t;
      $v=$86;
      label = 33; break;
    case 33: 
      var $87=$t;
      var $child104=(($87+16)|0);
      var $arrayidx105=(($child104)|0);
      var $88=HEAP32[(($arrayidx105)>>2)];
      var $cmp106=(($88)|(0))!=0;
      if ($cmp106) { label = 34; break; } else { label = 35; break; }
    case 34: 
      var $89=$t;
      var $child108=(($89+16)|0);
      var $arrayidx109=(($child108)|0);
      var $90=HEAP32[(($arrayidx109)>>2)];
      var $cond114 = $90;label = 36; break;
    case 35: 
      var $91=$t;
      var $child111=(($91+16)|0);
      var $arrayidx112=(($child111+4)|0);
      var $92=HEAP32[(($arrayidx112)>>2)];
      var $cond114 = $92;label = 36; break;
    case 36: 
      var $cond114;
      $t=$cond114;
      label = 30; break;
    case 37: 
      var $93=$v;
      var $cmp115=(($93)|(0))!=0;
      if ($cmp115) { label = 38; break; } else { label = 130; break; }
    case 38: 
      var $94=$rsize;
      var $95=$m_addr;
      var $dvsize=(($95+8)|0);
      var $96=HEAP32[(($dvsize)>>2)];
      var $97=$nb_addr;
      var $sub117=((($96)-($97))|0);
      var $cmp118=(($94)>>>(0)) < (($sub117)>>>(0));
      if ($cmp118) { label = 39; break; } else { label = 130; break; }
    case 39: 
      var $98=$v;
      var $99=$98;
      var $100=$m_addr;
      var $least_addr=(($100+16)|0);
      var $101=HEAP32[(($least_addr)>>2)];
      var $cmp120=(($99)>>>(0)) >= (($101)>>>(0));
      var $conv=(($cmp120)&(1));
      var $expval=($conv);
      var $tobool=(($expval)|(0))!=0;
      if ($tobool) { label = 40; break; } else { label = 129; break; }
    case 40: 
      var $102=$v;
      var $103=$102;
      var $104=$nb_addr;
      var $add_ptr=(($103+$104)|0);
      var $105=$add_ptr;
      $r=$105;
      var $106=$v;
      var $107=$106;
      var $108=$r;
      var $109=$108;
      var $cmp122=(($107)>>>(0)) < (($109)>>>(0));
      var $conv123=(($cmp122)&(1));
      var $expval124=($conv123);
      var $tobool125=(($expval124)|(0))!=0;
      if ($tobool125) { label = 41; break; } else { label = 128; break; }
    case 41: 
      var $110=$v;
      var $parent=(($110+24)|0);
      var $111=HEAP32[(($parent)>>2)];
      $XP=$111;
      var $112=$v;
      var $bk=(($112+12)|0);
      var $113=HEAP32[(($bk)>>2)];
      var $114=$v;
      var $cmp127=(($113)|(0))!=(($114)|(0));
      if ($cmp127) { label = 42; break; } else { label = 49; break; }
    case 42: 
      var $115=$v;
      var $fd=(($115+8)|0);
      var $116=HEAP32[(($fd)>>2)];
      $F=$116;
      var $117=$v;
      var $bk130=(($117+12)|0);
      var $118=HEAP32[(($bk130)>>2)];
      $R=$118;
      var $119=$F;
      var $120=$119;
      var $121=$m_addr;
      var $least_addr131=(($121+16)|0);
      var $122=HEAP32[(($least_addr131)>>2)];
      var $cmp132=(($120)>>>(0)) >= (($122)>>>(0));
      if ($cmp132) { label = 43; break; } else { var $129 = 0;label = 45; break; }
    case 43: 
      var $123=$F;
      var $bk135=(($123+12)|0);
      var $124=HEAP32[(($bk135)>>2)];
      var $125=$v;
      var $cmp136=(($124)|(0))==(($125)|(0));
      if ($cmp136) { label = 44; break; } else { var $129 = 0;label = 45; break; }
    case 44: 
      var $126=$R;
      var $fd138=(($126+8)|0);
      var $127=HEAP32[(($fd138)>>2)];
      var $128=$v;
      var $cmp139=(($127)|(0))==(($128)|(0));
      var $129 = $cmp139;label = 45; break;
    case 45: 
      var $129;
      var $land_ext=(($129)&(1));
      var $expval141=($land_ext);
      var $tobool142=(($expval141)|(0))!=0;
      if ($tobool142) { label = 46; break; } else { label = 47; break; }
    case 46: 
      var $130=$R;
      var $131=$F;
      var $bk144=(($131+12)|0);
      HEAP32[(($bk144)>>2)]=$130;
      var $132=$F;
      var $133=$R;
      var $fd145=(($133+8)|0);
      HEAP32[(($fd145)>>2)]=$132;
      label = 48; break;
    case 47: 
      _abort();
      throw "Reached an unreachable!"
    case 48: 
      label = 61; break;
    case 49: 
      var $134=$v;
      var $child149=(($134+16)|0);
      var $arrayidx150=(($child149+4)|0);
      $RP=$arrayidx150;
      var $135=HEAP32[(($arrayidx150)>>2)];
      $R=$135;
      var $cmp151=(($135)|(0))!=0;
      if ($cmp151) { label = 51; break; } else { label = 50; break; }
    case 50: 
      var $136=$v;
      var $child153=(($136+16)|0);
      var $arrayidx154=(($child153)|0);
      $RP=$arrayidx154;
      var $137=HEAP32[(($arrayidx154)>>2)];
      $R=$137;
      var $cmp155=(($137)|(0))!=0;
      if ($cmp155) { label = 51; break; } else { label = 60; break; }
    case 51: 
      label = 52; break;
    case 52: 
      var $138=$R;
      var $child159=(($138+16)|0);
      var $arrayidx160=(($child159+4)|0);
      $CP=$arrayidx160;
      var $139=HEAP32[(($arrayidx160)>>2)];
      var $cmp161=(($139)|(0))!=0;
      if ($cmp161) { var $142 = 1;label = 54; break; } else { label = 53; break; }
    case 53: 
      var $140=$R;
      var $child163=(($140+16)|0);
      var $arrayidx164=(($child163)|0);
      $CP=$arrayidx164;
      var $141=HEAP32[(($arrayidx164)>>2)];
      var $cmp165=(($141)|(0))!=0;
      var $142 = $cmp165;label = 54; break;
    case 54: 
      var $142;
      if ($142) { label = 55; break; } else { label = 56; break; }
    case 55: 
      var $143=$CP;
      $RP=$143;
      var $144=HEAP32[(($143)>>2)];
      $R=$144;
      label = 52; break;
    case 56: 
      var $145=$RP;
      var $146=$145;
      var $147=$m_addr;
      var $least_addr169=(($147+16)|0);
      var $148=HEAP32[(($least_addr169)>>2)];
      var $cmp170=(($146)>>>(0)) >= (($148)>>>(0));
      var $conv171=(($cmp170)&(1));
      var $expval172=($conv171);
      var $tobool173=(($expval172)|(0))!=0;
      if ($tobool173) { label = 57; break; } else { label = 58; break; }
    case 57: 
      var $149=$RP;
      HEAP32[(($149)>>2)]=0;
      label = 59; break;
    case 58: 
      _abort();
      throw "Reached an unreachable!"
    case 59: 
      label = 60; break;
    case 60: 
      label = 61; break;
    case 61: 
      var $150=$XP;
      var $cmp179=(($150)|(0))!=0;
      if ($cmp179) { label = 62; break; } else { label = 89; break; }
    case 62: 
      var $151=$v;
      var $index=(($151+28)|0);
      var $152=HEAP32[(($index)>>2)];
      var $153=$m_addr;
      var $treebins182=(($153+304)|0);
      var $arrayidx183=(($treebins182+($152<<2))|0);
      $H=$arrayidx183;
      var $154=$v;
      var $155=$H;
      var $156=HEAP32[(($155)>>2)];
      var $cmp184=(($154)|(0))==(($156)|(0));
      if ($cmp184) { label = 63; break; } else { label = 66; break; }
    case 63: 
      var $157=$R;
      var $158=$H;
      HEAP32[(($158)>>2)]=$157;
      var $cmp187=(($157)|(0))==0;
      if ($cmp187) { label = 64; break; } else { label = 65; break; }
    case 64: 
      var $159=$v;
      var $index190=(($159+28)|0);
      var $160=HEAP32[(($index190)>>2)];
      var $shl191=1 << $160;
      var $neg=$shl191 ^ -1;
      var $161=$m_addr;
      var $treemap192=(($161+4)|0);
      var $162=HEAP32[(($treemap192)>>2)];
      var $and193=$162 & $neg;
      HEAP32[(($treemap192)>>2)]=$and193;
      label = 65; break;
    case 65: 
      label = 73; break;
    case 66: 
      var $163=$XP;
      var $164=$163;
      var $165=$m_addr;
      var $least_addr196=(($165+16)|0);
      var $166=HEAP32[(($least_addr196)>>2)];
      var $cmp197=(($164)>>>(0)) >= (($166)>>>(0));
      var $conv198=(($cmp197)&(1));
      var $expval199=($conv198);
      var $tobool200=(($expval199)|(0))!=0;
      if ($tobool200) { label = 67; break; } else { label = 71; break; }
    case 67: 
      var $167=$XP;
      var $child202=(($167+16)|0);
      var $arrayidx203=(($child202)|0);
      var $168=HEAP32[(($arrayidx203)>>2)];
      var $169=$v;
      var $cmp204=(($168)|(0))==(($169)|(0));
      if ($cmp204) { label = 68; break; } else { label = 69; break; }
    case 68: 
      var $170=$R;
      var $171=$XP;
      var $child207=(($171+16)|0);
      var $arrayidx208=(($child207)|0);
      HEAP32[(($arrayidx208)>>2)]=$170;
      label = 70; break;
    case 69: 
      var $172=$R;
      var $173=$XP;
      var $child210=(($173+16)|0);
      var $arrayidx211=(($child210+4)|0);
      HEAP32[(($arrayidx211)>>2)]=$172;
      label = 70; break;
    case 70: 
      label = 72; break;
    case 71: 
      _abort();
      throw "Reached an unreachable!"
    case 72: 
      label = 73; break;
    case 73: 
      var $174=$R;
      var $cmp216=(($174)|(0))!=0;
      if ($cmp216) { label = 74; break; } else { label = 88; break; }
    case 74: 
      var $175=$R;
      var $176=$175;
      var $177=$m_addr;
      var $least_addr219=(($177+16)|0);
      var $178=HEAP32[(($least_addr219)>>2)];
      var $cmp220=(($176)>>>(0)) >= (($178)>>>(0));
      var $conv221=(($cmp220)&(1));
      var $expval222=($conv221);
      var $tobool223=(($expval222)|(0))!=0;
      if ($tobool223) { label = 75; break; } else { label = 86; break; }
    case 75: 
      var $179=$XP;
      var $180=$R;
      var $parent225=(($180+24)|0);
      HEAP32[(($parent225)>>2)]=$179;
      var $181=$v;
      var $child226=(($181+16)|0);
      var $arrayidx227=(($child226)|0);
      var $182=HEAP32[(($arrayidx227)>>2)];
      $C0=$182;
      var $cmp228=(($182)|(0))!=0;
      if ($cmp228) { label = 76; break; } else { label = 80; break; }
    case 76: 
      var $183=$C0;
      var $184=$183;
      var $185=$m_addr;
      var $least_addr231=(($185+16)|0);
      var $186=HEAP32[(($least_addr231)>>2)];
      var $cmp232=(($184)>>>(0)) >= (($186)>>>(0));
      var $conv233=(($cmp232)&(1));
      var $expval234=($conv233);
      var $tobool235=(($expval234)|(0))!=0;
      if ($tobool235) { label = 77; break; } else { label = 78; break; }
    case 77: 
      var $187=$C0;
      var $188=$R;
      var $child237=(($188+16)|0);
      var $arrayidx238=(($child237)|0);
      HEAP32[(($arrayidx238)>>2)]=$187;
      var $189=$R;
      var $190=$C0;
      var $parent239=(($190+24)|0);
      HEAP32[(($parent239)>>2)]=$189;
      label = 79; break;
    case 78: 
      _abort();
      throw "Reached an unreachable!"
    case 79: 
      label = 80; break;
    case 80: 
      var $191=$v;
      var $child243=(($191+16)|0);
      var $arrayidx244=(($child243+4)|0);
      var $192=HEAP32[(($arrayidx244)>>2)];
      $C1=$192;
      var $cmp245=(($192)|(0))!=0;
      if ($cmp245) { label = 81; break; } else { label = 85; break; }
    case 81: 
      var $193=$C1;
      var $194=$193;
      var $195=$m_addr;
      var $least_addr248=(($195+16)|0);
      var $196=HEAP32[(($least_addr248)>>2)];
      var $cmp249=(($194)>>>(0)) >= (($196)>>>(0));
      var $conv250=(($cmp249)&(1));
      var $expval251=($conv250);
      var $tobool252=(($expval251)|(0))!=0;
      if ($tobool252) { label = 82; break; } else { label = 83; break; }
    case 82: 
      var $197=$C1;
      var $198=$R;
      var $child254=(($198+16)|0);
      var $arrayidx255=(($child254+4)|0);
      HEAP32[(($arrayidx255)>>2)]=$197;
      var $199=$R;
      var $200=$C1;
      var $parent256=(($200+24)|0);
      HEAP32[(($parent256)>>2)]=$199;
      label = 84; break;
    case 83: 
      _abort();
      throw "Reached an unreachable!"
    case 84: 
      label = 85; break;
    case 85: 
      label = 87; break;
    case 86: 
      _abort();
      throw "Reached an unreachable!"
    case 87: 
      label = 88; break;
    case 88: 
      label = 89; break;
    case 89: 
      var $201=$rsize;
      var $cmp264=(($201)>>>(0)) < 16;
      if ($cmp264) { label = 90; break; } else { label = 91; break; }
    case 90: 
      var $202=$rsize;
      var $203=$nb_addr;
      var $add267=((($202)+($203))|0);
      var $or268=$add267 | 1;
      var $or269=$or268 | 2;
      var $204=$v;
      var $head270=(($204+4)|0);
      HEAP32[(($head270)>>2)]=$or269;
      var $205=$v;
      var $206=$205;
      var $207=$rsize;
      var $208=$nb_addr;
      var $add271=((($207)+($208))|0);
      var $add_ptr272=(($206+$add271)|0);
      var $209=$add_ptr272;
      var $head273=(($209+4)|0);
      var $210=HEAP32[(($head273)>>2)];
      var $or274=$210 | 1;
      HEAP32[(($head273)>>2)]=$or274;
      label = 127; break;
    case 91: 
      var $211=$nb_addr;
      var $or276=$211 | 1;
      var $or277=$or276 | 2;
      var $212=$v;
      var $head278=(($212+4)|0);
      HEAP32[(($head278)>>2)]=$or277;
      var $213=$rsize;
      var $or279=$213 | 1;
      var $214=$r;
      var $head280=(($214+4)|0);
      HEAP32[(($head280)>>2)]=$or279;
      var $215=$rsize;
      var $216=$r;
      var $217=$216;
      var $218=$rsize;
      var $add_ptr281=(($217+$218)|0);
      var $219=$add_ptr281;
      var $prev_foot=(($219)|0);
      HEAP32[(($prev_foot)>>2)]=$215;
      var $220=$rsize;
      var $shr282=$220 >>> 3;
      var $cmp283=(($shr282)>>>(0)) < 32;
      if ($cmp283) { label = 92; break; } else { label = 99; break; }
    case 92: 
      var $221=$rsize;
      var $shr286=$221 >>> 3;
      $I=$shr286;
      var $222=$I;
      var $shl287=$222 << 1;
      var $223=$m_addr;
      var $smallbins=(($223+40)|0);
      var $arrayidx288=(($smallbins+($shl287<<2))|0);
      var $224=$arrayidx288;
      var $225=$224;
      $B=$225;
      var $226=$B;
      $F289=$226;
      var $227=$m_addr;
      var $smallmap=(($227)|0);
      var $228=HEAP32[(($smallmap)>>2)];
      var $229=$I;
      var $shl290=1 << $229;
      var $and291=$228 & $shl290;
      var $tobool292=(($and291)|(0))!=0;
      if ($tobool292) { label = 94; break; } else { label = 93; break; }
    case 93: 
      var $230=$I;
      var $shl294=1 << $230;
      var $231=$m_addr;
      var $smallmap295=(($231)|0);
      var $232=HEAP32[(($smallmap295)>>2)];
      var $or296=$232 | $shl294;
      HEAP32[(($smallmap295)>>2)]=$or296;
      label = 98; break;
    case 94: 
      var $233=$B;
      var $fd298=(($233+8)|0);
      var $234=HEAP32[(($fd298)>>2)];
      var $235=$234;
      var $236=$m_addr;
      var $least_addr299=(($236+16)|0);
      var $237=HEAP32[(($least_addr299)>>2)];
      var $cmp300=(($235)>>>(0)) >= (($237)>>>(0));
      var $conv301=(($cmp300)&(1));
      var $expval302=($conv301);
      var $tobool303=(($expval302)|(0))!=0;
      if ($tobool303) { label = 95; break; } else { label = 96; break; }
    case 95: 
      var $238=$B;
      var $fd305=(($238+8)|0);
      var $239=HEAP32[(($fd305)>>2)];
      $F289=$239;
      label = 97; break;
    case 96: 
      _abort();
      throw "Reached an unreachable!"
    case 97: 
      label = 98; break;
    case 98: 
      var $240=$r;
      var $241=$B;
      var $fd309=(($241+8)|0);
      HEAP32[(($fd309)>>2)]=$240;
      var $242=$r;
      var $243=$F289;
      var $bk310=(($243+12)|0);
      HEAP32[(($bk310)>>2)]=$242;
      var $244=$F289;
      var $245=$r;
      var $fd311=(($245+8)|0);
      HEAP32[(($fd311)>>2)]=$244;
      var $246=$B;
      var $247=$r;
      var $bk312=(($247+12)|0);
      HEAP32[(($bk312)>>2)]=$246;
      label = 126; break;
    case 99: 
      var $248=$r;
      var $249=$248;
      $TP=$249;
      var $250=$rsize;
      var $shr317=$250 >>> 8;
      $X316=$shr317;
      var $251=$X316;
      var $cmp318=(($251)|(0))==0;
      if ($cmp318) { label = 100; break; } else { label = 101; break; }
    case 100: 
      $I315=0;
      label = 105; break;
    case 101: 
      var $252=$X316;
      var $cmp322=(($252)>>>(0)) > 65535;
      if ($cmp322) { label = 102; break; } else { label = 103; break; }
    case 102: 
      $I315=31;
      label = 104; break;
    case 103: 
      var $253=$X316;
      $Y326=$253;
      var $254=$Y326;
      var $sub328=((($254)-(256))|0);
      var $shr329=$sub328 >>> 16;
      var $and330=$shr329 & 8;
      $N327=$and330;
      var $255=$N327;
      var $256=$Y326;
      var $shl332=$256 << $255;
      $Y326=$shl332;
      var $sub333=((($shl332)-(4096))|0);
      var $shr334=$sub333 >>> 16;
      var $and335=$shr334 & 4;
      $K331=$and335;
      var $257=$K331;
      var $258=$N327;
      var $add336=((($258)+($257))|0);
      $N327=$add336;
      var $259=$K331;
      var $260=$Y326;
      var $shl337=$260 << $259;
      $Y326=$shl337;
      var $sub338=((($shl337)-(16384))|0);
      var $shr339=$sub338 >>> 16;
      var $and340=$shr339 & 2;
      $K331=$and340;
      var $261=$N327;
      var $add341=((($261)+($and340))|0);
      $N327=$add341;
      var $262=$N327;
      var $sub342=(((14)-($262))|0);
      var $263=$K331;
      var $264=$Y326;
      var $shl343=$264 << $263;
      $Y326=$shl343;
      var $shr344=$shl343 >>> 15;
      var $add345=((($sub342)+($shr344))|0);
      $K331=$add345;
      var $265=$K331;
      var $shl346=$265 << 1;
      var $266=$rsize;
      var $267=$K331;
      var $add347=((($267)+(7))|0);
      var $shr348=$266 >>> (($add347)>>>(0));
      var $and349=$shr348 & 1;
      var $add350=((($shl346)+($and349))|0);
      $I315=$add350;
      label = 104; break;
    case 104: 
      label = 105; break;
    case 105: 
      var $268=$I315;
      var $269=$m_addr;
      var $treebins353=(($269+304)|0);
      var $arrayidx354=(($treebins353+($268<<2))|0);
      $H314=$arrayidx354;
      var $270=$I315;
      var $271=$TP;
      var $index355=(($271+28)|0);
      HEAP32[(($index355)>>2)]=$270;
      var $272=$TP;
      var $child356=(($272+16)|0);
      var $arrayidx357=(($child356+4)|0);
      HEAP32[(($arrayidx357)>>2)]=0;
      var $273=$TP;
      var $child358=(($273+16)|0);
      var $arrayidx359=(($child358)|0);
      HEAP32[(($arrayidx359)>>2)]=0;
      var $274=$m_addr;
      var $treemap360=(($274+4)|0);
      var $275=HEAP32[(($treemap360)>>2)];
      var $276=$I315;
      var $shl361=1 << $276;
      var $and362=$275 & $shl361;
      var $tobool363=(($and362)|(0))!=0;
      if ($tobool363) { label = 107; break; } else { label = 106; break; }
    case 106: 
      var $277=$I315;
      var $shl365=1 << $277;
      var $278=$m_addr;
      var $treemap366=(($278+4)|0);
      var $279=HEAP32[(($treemap366)>>2)];
      var $or367=$279 | $shl365;
      HEAP32[(($treemap366)>>2)]=$or367;
      var $280=$TP;
      var $281=$H314;
      HEAP32[(($281)>>2)]=$280;
      var $282=$H314;
      var $283=$282;
      var $284=$TP;
      var $parent368=(($284+24)|0);
      HEAP32[(($parent368)>>2)]=$283;
      var $285=$TP;
      var $286=$TP;
      var $bk369=(($286+12)|0);
      HEAP32[(($bk369)>>2)]=$285;
      var $287=$TP;
      var $fd370=(($287+8)|0);
      HEAP32[(($fd370)>>2)]=$285;
      label = 125; break;
    case 107: 
      var $288=$H314;
      var $289=HEAP32[(($288)>>2)];
      $T=$289;
      var $290=$rsize;
      var $291=$I315;
      var $cmp373=(($291)|(0))==31;
      if ($cmp373) { label = 108; break; } else { label = 109; break; }
    case 108: 
      var $cond382 = 0;label = 110; break;
    case 109: 
      var $292=$I315;
      var $shr377=$292 >>> 1;
      var $add378=((($shr377)+(8))|0);
      var $sub379=((($add378)-(2))|0);
      var $sub380=(((31)-($sub379))|0);
      var $cond382 = $sub380;label = 110; break;
    case 110: 
      var $cond382;
      var $shl383=$290 << $cond382;
      $K372=$shl383;
      label = 111; break;
    case 111: 
      var $293=$T;
      var $head385=(($293+4)|0);
      var $294=HEAP32[(($head385)>>2)];
      var $and386=$294 & -8;
      var $295=$rsize;
      var $cmp387=(($and386)|(0))!=(($295)|(0));
      if ($cmp387) { label = 112; break; } else { label = 118; break; }
    case 112: 
      var $296=$K372;
      var $shr390=$296 >>> 31;
      var $and391=$shr390 & 1;
      var $297=$T;
      var $child392=(($297+16)|0);
      var $arrayidx393=(($child392+($and391<<2))|0);
      $C=$arrayidx393;
      var $298=$K372;
      var $shl394=$298 << 1;
      $K372=$shl394;
      var $299=$C;
      var $300=HEAP32[(($299)>>2)];
      var $cmp395=(($300)|(0))!=0;
      if ($cmp395) { label = 113; break; } else { label = 114; break; }
    case 113: 
      var $301=$C;
      var $302=HEAP32[(($301)>>2)];
      $T=$302;
      label = 117; break;
    case 114: 
      var $303=$C;
      var $304=$303;
      var $305=$m_addr;
      var $least_addr399=(($305+16)|0);
      var $306=HEAP32[(($least_addr399)>>2)];
      var $cmp400=(($304)>>>(0)) >= (($306)>>>(0));
      var $conv401=(($cmp400)&(1));
      var $expval402=($conv401);
      var $tobool403=(($expval402)|(0))!=0;
      if ($tobool403) { label = 115; break; } else { label = 116; break; }
    case 115: 
      var $307=$TP;
      var $308=$C;
      HEAP32[(($308)>>2)]=$307;
      var $309=$T;
      var $310=$TP;
      var $parent405=(($310+24)|0);
      HEAP32[(($parent405)>>2)]=$309;
      var $311=$TP;
      var $312=$TP;
      var $bk406=(($312+12)|0);
      HEAP32[(($bk406)>>2)]=$311;
      var $313=$TP;
      var $fd407=(($313+8)|0);
      HEAP32[(($fd407)>>2)]=$311;
      label = 124; break;
    case 116: 
      _abort();
      throw "Reached an unreachable!"
    case 117: 
      label = 123; break;
    case 118: 
      var $314=$T;
      var $fd412=(($314+8)|0);
      var $315=HEAP32[(($fd412)>>2)];
      $F411=$315;
      var $316=$T;
      var $317=$316;
      var $318=$m_addr;
      var $least_addr413=(($318+16)|0);
      var $319=HEAP32[(($least_addr413)>>2)];
      var $cmp414=(($317)>>>(0)) >= (($319)>>>(0));
      if ($cmp414) { label = 119; break; } else { var $324 = 0;label = 120; break; }
    case 119: 
      var $320=$F411;
      var $321=$320;
      var $322=$m_addr;
      var $least_addr417=(($322+16)|0);
      var $323=HEAP32[(($least_addr417)>>2)];
      var $cmp418=(($321)>>>(0)) >= (($323)>>>(0));
      var $324 = $cmp418;label = 120; break;
    case 120: 
      var $324;
      var $land_ext421=(($324)&(1));
      var $expval422=($land_ext421);
      var $tobool423=(($expval422)|(0))!=0;
      if ($tobool423) { label = 121; break; } else { label = 122; break; }
    case 121: 
      var $325=$TP;
      var $326=$F411;
      var $bk425=(($326+12)|0);
      HEAP32[(($bk425)>>2)]=$325;
      var $327=$T;
      var $fd426=(($327+8)|0);
      HEAP32[(($fd426)>>2)]=$325;
      var $328=$F411;
      var $329=$TP;
      var $fd427=(($329+8)|0);
      HEAP32[(($fd427)>>2)]=$328;
      var $330=$T;
      var $331=$TP;
      var $bk428=(($331+12)|0);
      HEAP32[(($bk428)>>2)]=$330;
      var $332=$TP;
      var $parent429=(($332+24)|0);
      HEAP32[(($parent429)>>2)]=0;
      label = 124; break;
    case 122: 
      _abort();
      throw "Reached an unreachable!"
    case 123: 
      label = 111; break;
    case 124: 
      label = 125; break;
    case 125: 
      label = 126; break;
    case 126: 
      label = 127; break;
    case 127: 
      var $333=$v;
      var $334=$333;
      var $add_ptr436=(($334+8)|0);
      $retval=$add_ptr436;
      label = 131; break;
    case 128: 
      label = 129; break;
    case 129: 
      _abort();
      throw "Reached an unreachable!"
    case 130: 
      $retval=0;
      label = 131; break;
    case 131: 
      var $335=$retval;

      return $335;
    default: assert(0, "bad label: " + label);
  }

}


function _sys_alloc($m, $nb) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $m_addr;
      var $nb_addr;
      var $tbase;
      var $tsize;
      var $mmap_flag;
      var $asize;
      var $mem;
      var $fp;
      var $br;
      var $ssize;
      var $ss;
      var $base;
      var $fp37;
      var $esize;
      var $end;
      var $br126;
      var $end127;
      var $ssize136;
      var $mn;
      var $sp;
      var $oldbase;
      var $rsize;
      var $p;
      var $r;
      $m_addr=$m;
      $nb_addr=$nb;
      $tbase=-1;
      $tsize=0;
      $mmap_flag=0;
      var $0=HEAP32[((((5242880)|0))>>2)];
      var $cmp=(($0)|(0))!=0;
      if ($cmp) { var $1 = 1;label = 4; break; } else { label = 3; break; }
    case 3: 
      var $call=_init_mparams();
      var $tobool=(($call)|(0))!=0;
      var $1 = $tobool;label = 4; break;
    case 4: 
      var $1;
      var $lor_ext=(($1)&(1));
      var $2=$m_addr;
      var $mflags=(($2+444)|0);
      var $3=HEAP32[(($mflags)>>2)];
      var $and=$3 & 0;
      var $tobool1=(($and)|(0))!=0;
      if ($tobool1) { label = 5; break; } else { label = 10; break; }
    case 5: 
      var $4=$nb_addr;
      var $5=HEAP32[((((5242892)|0))>>2)];
      var $cmp2=(($4)>>>(0)) >= (($5)>>>(0));
      if ($cmp2) { label = 6; break; } else { label = 10; break; }
    case 6: 
      var $6=$m_addr;
      var $topsize=(($6+12)|0);
      var $7=HEAP32[(($topsize)>>2)];
      var $cmp4=(($7)|(0))!=0;
      if ($cmp4) { label = 7; break; } else { label = 10; break; }
    case 7: 
      var $8=$m_addr;
      var $9=$nb_addr;
      var $call5=_mmap_alloc($8, $9);
      $mem=$call5;
      var $10=$mem;
      var $cmp6=(($10)|(0))!=0;
      if ($cmp6) { label = 8; break; } else { label = 9; break; }
    case 8: 
      var $11=$mem;
      $retval=$11;
      label = 104; break;
    case 9: 
      label = 10; break;
    case 10: 
      var $12=$nb_addr;
      var $add=((($12)+(48))|0);
      var $13=HEAP32[((((5242888)|0))>>2)];
      var $sub=((($13)-(1))|0);
      var $add9=((($add)+($sub))|0);
      var $14=HEAP32[((((5242888)|0))>>2)];
      var $sub10=((($14)-(1))|0);
      var $neg=$sub10 ^ -1;
      var $and11=$add9 & $neg;
      $asize=$and11;
      var $15=$asize;
      var $16=$nb_addr;
      var $cmp12=(($15)>>>(0)) <= (($16)>>>(0));
      if ($cmp12) { label = 11; break; } else { label = 12; break; }
    case 11: 
      $retval=0;
      label = 104; break;
    case 12: 
      var $17=$m_addr;
      var $footprint_limit=(($17+440)|0);
      var $18=HEAP32[(($footprint_limit)>>2)];
      var $cmp15=(($18)|(0))!=0;
      if ($cmp15) { label = 13; break; } else { label = 17; break; }
    case 13: 
      var $19=$m_addr;
      var $footprint=(($19+432)|0);
      var $20=HEAP32[(($footprint)>>2)];
      var $21=$asize;
      var $add17=((($20)+($21))|0);
      $fp=$add17;
      var $22=$fp;
      var $23=$m_addr;
      var $footprint18=(($23+432)|0);
      var $24=HEAP32[(($footprint18)>>2)];
      var $cmp19=(($22)>>>(0)) <= (($24)>>>(0));
      if ($cmp19) { label = 15; break; } else { label = 14; break; }
    case 14: 
      var $25=$fp;
      var $26=$m_addr;
      var $footprint_limit20=(($26+440)|0);
      var $27=HEAP32[(($footprint_limit20)>>2)];
      var $cmp21=(($25)>>>(0)) > (($27)>>>(0));
      if ($cmp21) { label = 15; break; } else { label = 16; break; }
    case 15: 
      $retval=0;
      label = 104; break;
    case 16: 
      label = 17; break;
    case 17: 
      var $28=$m_addr;
      var $mflags25=(($28+444)|0);
      var $29=HEAP32[(($mflags25)>>2)];
      var $and26=$29 & 4;
      var $tobool27=(($and26)|(0))!=0;
      if ($tobool27) { label = 54; break; } else { label = 18; break; }
    case 18: 
      $br=-1;
      var $30=$asize;
      $ssize=$30;
      var $31=$m_addr;
      var $top=(($31+24)|0);
      var $32=HEAP32[(($top)>>2)];
      var $cmp29=(($32)|(0))==0;
      if ($cmp29) { label = 19; break; } else { label = 20; break; }
    case 19: 
      var $cond = 0;label = 21; break;
    case 20: 
      var $33=$m_addr;
      var $34=$m_addr;
      var $top30=(($34+24)|0);
      var $35=HEAP32[(($top30)>>2)];
      var $36=$35;
      var $call31=_segment_holding($33, $36);
      var $cond = $call31;label = 21; break;
    case 21: 
      var $cond;
      $ss=$cond;
      var $37=$ss;
      var $cmp32=(($37)|(0))==0;
      if ($cmp32) { label = 22; break; } else { label = 34; break; }
    case 22: 
      var $call34=_sbrk(0);
      $base=$call34;
      var $38=$base;
      var $cmp35=(($38)|(0))!=-1;
      if ($cmp35) { label = 23; break; } else { label = 33; break; }
    case 23: 
      var $39=$base;
      var $40=$39;
      var $41=HEAP32[((((5242884)|0))>>2)];
      var $sub38=((($41)-(1))|0);
      var $and39=$40 & $sub38;
      var $cmp40=(($and39)|(0))==0;
      if ($cmp40) { label = 25; break; } else { label = 24; break; }
    case 24: 
      var $42=$base;
      var $43=$42;
      var $44=HEAP32[((((5242884)|0))>>2)];
      var $sub42=((($44)-(1))|0);
      var $add43=((($43)+($sub42))|0);
      var $45=HEAP32[((((5242884)|0))>>2)];
      var $sub44=((($45)-(1))|0);
      var $neg45=$sub44 ^ -1;
      var $and46=$add43 & $neg45;
      var $46=$base;
      var $47=$46;
      var $sub47=((($and46)-($47))|0);
      var $48=$ssize;
      var $add48=((($48)+($sub47))|0);
      $ssize=$add48;
      label = 25; break;
    case 25: 
      var $49=$m_addr;
      var $footprint50=(($49+432)|0);
      var $50=HEAP32[(($footprint50)>>2)];
      var $51=$ssize;
      var $add51=((($50)+($51))|0);
      $fp37=$add51;
      var $52=$ssize;
      var $53=$nb_addr;
      var $cmp52=(($52)>>>(0)) > (($53)>>>(0));
      if ($cmp52) { label = 26; break; } else { label = 32; break; }
    case 26: 
      var $54=$ssize;
      var $cmp54=(($54)>>>(0)) < 2147483647;
      if ($cmp54) { label = 27; break; } else { label = 32; break; }
    case 27: 
      var $55=$m_addr;
      var $footprint_limit56=(($55+440)|0);
      var $56=HEAP32[(($footprint_limit56)>>2)];
      var $cmp57=(($56)|(0))==0;
      if ($cmp57) { label = 30; break; } else { label = 28; break; }
    case 28: 
      var $57=$fp37;
      var $58=$m_addr;
      var $footprint59=(($58+432)|0);
      var $59=HEAP32[(($footprint59)>>2)];
      var $cmp60=(($57)>>>(0)) > (($59)>>>(0));
      if ($cmp60) { label = 29; break; } else { label = 32; break; }
    case 29: 
      var $60=$fp37;
      var $61=$m_addr;
      var $footprint_limit62=(($61+440)|0);
      var $62=HEAP32[(($footprint_limit62)>>2)];
      var $cmp63=(($60)>>>(0)) <= (($62)>>>(0));
      if ($cmp63) { label = 30; break; } else { label = 32; break; }
    case 30: 
      var $63=$ssize;
      var $call65=_sbrk($63);
      $br=$call65;
      var $64=$base;
      var $cmp66=(($call65)|(0))==(($64)|(0));
      if ($cmp66) { label = 31; break; } else { label = 32; break; }
    case 31: 
      var $65=$base;
      $tbase=$65;
      var $66=$ssize;
      $tsize=$66;
      label = 32; break;
    case 32: 
      label = 33; break;
    case 33: 
      label = 38; break;
    case 34: 
      var $67=$nb_addr;
      var $68=$m_addr;
      var $topsize70=(($68+12)|0);
      var $69=HEAP32[(($topsize70)>>2)];
      var $sub71=((($67)-($69))|0);
      var $add72=((($sub71)+(48))|0);
      var $70=HEAP32[((((5242888)|0))>>2)];
      var $sub73=((($70)-(1))|0);
      var $add74=((($add72)+($sub73))|0);
      var $71=HEAP32[((((5242888)|0))>>2)];
      var $sub75=((($71)-(1))|0);
      var $neg76=$sub75 ^ -1;
      var $and77=$add74 & $neg76;
      $ssize=$and77;
      var $72=$ssize;
      var $cmp78=(($72)>>>(0)) < 2147483647;
      if ($cmp78) { label = 35; break; } else { label = 37; break; }
    case 35: 
      var $73=$ssize;
      var $call80=_sbrk($73);
      $br=$call80;
      var $74=$ss;
      var $base81=(($74)|0);
      var $75=HEAP32[(($base81)>>2)];
      var $76=$ss;
      var $size=(($76+4)|0);
      var $77=HEAP32[(($size)>>2)];
      var $add_ptr=(($75+$77)|0);
      var $cmp82=(($call80)|(0))==(($add_ptr)|(0));
      if ($cmp82) { label = 36; break; } else { label = 37; break; }
    case 36: 
      var $78=$br;
      $tbase=$78;
      var $79=$ssize;
      $tsize=$79;
      label = 37; break;
    case 37: 
      label = 38; break;
    case 38: 
      var $80=$tbase;
      var $cmp86=(($80)|(0))==-1;
      if ($cmp86) { label = 39; break; } else { label = 53; break; }
    case 39: 
      var $81=$br;
      var $cmp88=(($81)|(0))!=-1;
      if ($cmp88) { label = 40; break; } else { label = 49; break; }
    case 40: 
      var $82=$ssize;
      var $cmp90=(($82)>>>(0)) < 2147483647;
      if ($cmp90) { label = 41; break; } else { label = 48; break; }
    case 41: 
      var $83=$ssize;
      var $84=$nb_addr;
      var $add92=((($84)+(48))|0);
      var $cmp93=(($83)>>>(0)) < (($add92)>>>(0));
      if ($cmp93) { label = 42; break; } else { label = 48; break; }
    case 42: 
      var $85=$nb_addr;
      var $add95=((($85)+(48))|0);
      var $86=$ssize;
      var $sub96=((($add95)-($86))|0);
      var $87=HEAP32[((((5242888)|0))>>2)];
      var $sub97=((($87)-(1))|0);
      var $add98=((($sub96)+($sub97))|0);
      var $88=HEAP32[((((5242888)|0))>>2)];
      var $sub99=((($88)-(1))|0);
      var $neg100=$sub99 ^ -1;
      var $and101=$add98 & $neg100;
      $esize=$and101;
      var $89=$esize;
      var $cmp102=(($89)>>>(0)) < 2147483647;
      if ($cmp102) { label = 43; break; } else { label = 47; break; }
    case 43: 
      var $90=$esize;
      var $call104=_sbrk($90);
      $end=$call104;
      var $91=$end;
      var $cmp105=(($91)|(0))!=-1;
      if ($cmp105) { label = 44; break; } else { label = 45; break; }
    case 44: 
      var $92=$esize;
      var $93=$ssize;
      var $add107=((($93)+($92))|0);
      $ssize=$add107;
      label = 46; break;
    case 45: 
      var $94=$ssize;
      var $sub109=(((-$94))|0);
      var $call110=_sbrk($sub109);
      $br=-1;
      label = 46; break;
    case 46: 
      label = 47; break;
    case 47: 
      label = 48; break;
    case 48: 
      label = 49; break;
    case 49: 
      var $95=$br;
      var $cmp115=(($95)|(0))!=-1;
      if ($cmp115) { label = 50; break; } else { label = 51; break; }
    case 50: 
      var $96=$br;
      $tbase=$96;
      var $97=$ssize;
      $tsize=$97;
      label = 52; break;
    case 51: 
      var $98=$m_addr;
      var $mflags118=(($98+444)|0);
      var $99=HEAP32[(($mflags118)>>2)];
      var $or=$99 | 4;
      HEAP32[(($mflags118)>>2)]=$or;
      label = 52; break;
    case 52: 
      label = 53; break;
    case 53: 
      label = 54; break;
    case 54: 
      var $100=$tbase;
      var $cmp122=(($100)|(0))==-1;
      if ($cmp122) { label = 55; break; } else { label = 64; break; }
    case 55: 
      var $101=$asize;
      var $cmp124=(($101)>>>(0)) < 2147483647;
      if ($cmp124) { label = 56; break; } else { label = 63; break; }
    case 56: 
      $br126=-1;
      $end127=-1;
      var $102=$asize;
      var $call128=_sbrk($102);
      $br126=$call128;
      var $call129=_sbrk(0);
      $end127=$call129;
      var $103=$br126;
      var $cmp130=(($103)|(0))!=-1;
      if ($cmp130) { label = 57; break; } else { label = 62; break; }
    case 57: 
      var $104=$end127;
      var $cmp132=(($104)|(0))!=-1;
      if ($cmp132) { label = 58; break; } else { label = 62; break; }
    case 58: 
      var $105=$br126;
      var $106=$end127;
      var $cmp134=(($105)>>>(0)) < (($106)>>>(0));
      if ($cmp134) { label = 59; break; } else { label = 62; break; }
    case 59: 
      var $107=$end127;
      var $108=$br126;
      var $sub_ptr_lhs_cast=$107;
      var $sub_ptr_rhs_cast=$108;
      var $sub_ptr_sub=((($sub_ptr_lhs_cast)-($sub_ptr_rhs_cast))|0);
      $ssize136=$sub_ptr_sub;
      var $109=$ssize136;
      var $110=$nb_addr;
      var $add137=((($110)+(40))|0);
      var $cmp138=(($109)>>>(0)) > (($add137)>>>(0));
      if ($cmp138) { label = 60; break; } else { label = 61; break; }
    case 60: 
      var $111=$br126;
      $tbase=$111;
      var $112=$ssize136;
      $tsize=$112;
      label = 61; break;
    case 61: 
      label = 62; break;
    case 62: 
      label = 63; break;
    case 63: 
      label = 64; break;
    case 64: 
      var $113=$tbase;
      var $cmp144=(($113)|(0))!=-1;
      if ($cmp144) { label = 65; break; } else { label = 103; break; }
    case 65: 
      var $114=$tsize;
      var $115=$m_addr;
      var $footprint146=(($115+432)|0);
      var $116=HEAP32[(($footprint146)>>2)];
      var $add147=((($116)+($114))|0);
      HEAP32[(($footprint146)>>2)]=$add147;
      var $117=$m_addr;
      var $max_footprint=(($117+436)|0);
      var $118=HEAP32[(($max_footprint)>>2)];
      var $cmp148=(($add147)>>>(0)) > (($118)>>>(0));
      if ($cmp148) { label = 66; break; } else { label = 67; break; }
    case 66: 
      var $119=$m_addr;
      var $footprint150=(($119+432)|0);
      var $120=HEAP32[(($footprint150)>>2)];
      var $121=$m_addr;
      var $max_footprint151=(($121+436)|0);
      HEAP32[(($max_footprint151)>>2)]=$120;
      label = 67; break;
    case 67: 
      var $122=$m_addr;
      var $top153=(($122+24)|0);
      var $123=HEAP32[(($top153)>>2)];
      var $cmp154=(($123)|(0))!=0;
      if ($cmp154) { label = 75; break; } else { label = 68; break; }
    case 68: 
      var $124=$m_addr;
      var $least_addr=(($124+16)|0);
      var $125=HEAP32[(($least_addr)>>2)];
      var $cmp156=(($125)|(0))==0;
      if ($cmp156) { label = 70; break; } else { label = 69; break; }
    case 69: 
      var $126=$tbase;
      var $127=$m_addr;
      var $least_addr158=(($127+16)|0);
      var $128=HEAP32[(($least_addr158)>>2)];
      var $cmp159=(($126)>>>(0)) < (($128)>>>(0));
      if ($cmp159) { label = 70; break; } else { label = 71; break; }
    case 70: 
      var $129=$tbase;
      var $130=$m_addr;
      var $least_addr161=(($130+16)|0);
      HEAP32[(($least_addr161)>>2)]=$129;
      label = 71; break;
    case 71: 
      var $131=$tbase;
      var $132=$m_addr;
      var $seg=(($132+448)|0);
      var $base163=(($seg)|0);
      HEAP32[(($base163)>>2)]=$131;
      var $133=$tsize;
      var $134=$m_addr;
      var $seg164=(($134+448)|0);
      var $size165=(($seg164+4)|0);
      HEAP32[(($size165)>>2)]=$133;
      var $135=$mmap_flag;
      var $136=$m_addr;
      var $seg166=(($136+448)|0);
      var $sflags=(($seg166+12)|0);
      HEAP32[(($sflags)>>2)]=$135;
      var $137=HEAP32[((((5242880)|0))>>2)];
      var $138=$m_addr;
      var $magic=(($138+36)|0);
      HEAP32[(($magic)>>2)]=$137;
      var $139=$m_addr;
      var $release_checks=(($139+32)|0);
      HEAP32[(($release_checks)>>2)]=-1;
      var $140=$m_addr;
      _init_bins($140);
      var $141=$m_addr;
      var $cmp167=(($141)|(0))==5243104;
      if ($cmp167) { label = 72; break; } else { label = 73; break; }
    case 72: 
      var $142=$m_addr;
      var $143=$tbase;
      var $144=$143;
      var $145=$tsize;
      var $sub169=((($145)-(40))|0);
      _init_top($142, $144, $sub169);
      label = 74; break;
    case 73: 
      var $146=$m_addr;
      var $147=$146;
      var $add_ptr171=((($147)-(8))|0);
      var $148=$add_ptr171;
      var $149=$148;
      var $150=$m_addr;
      var $151=$150;
      var $add_ptr172=((($151)-(8))|0);
      var $152=$add_ptr172;
      var $head=(($152+4)|0);
      var $153=HEAP32[(($head)>>2)];
      var $and173=$153 & -8;
      var $add_ptr174=(($149+$and173)|0);
      var $154=$add_ptr174;
      $mn=$154;
      var $155=$m_addr;
      var $156=$mn;
      var $157=$tbase;
      var $158=$tsize;
      var $add_ptr175=(($157+$158)|0);
      var $159=$mn;
      var $160=$159;
      var $sub_ptr_lhs_cast176=$add_ptr175;
      var $sub_ptr_rhs_cast177=$160;
      var $sub_ptr_sub178=((($sub_ptr_lhs_cast176)-($sub_ptr_rhs_cast177))|0);
      var $sub179=((($sub_ptr_sub178)-(40))|0);
      _init_top($155, $156, $sub179);
      label = 74; break;
    case 74: 
      label = 100; break;
    case 75: 
      var $161=$m_addr;
      var $seg182=(($161+448)|0);
      $sp=$seg182;
      label = 76; break;
    case 76: 
      var $162=$sp;
      var $cmp183=(($162)|(0))!=0;
      if ($cmp183) { label = 77; break; } else { var $168 = 0;label = 78; break; }
    case 77: 
      var $163=$tbase;
      var $164=$sp;
      var $base184=(($164)|0);
      var $165=HEAP32[(($base184)>>2)];
      var $166=$sp;
      var $size185=(($166+4)|0);
      var $167=HEAP32[(($size185)>>2)];
      var $add_ptr186=(($165+$167)|0);
      var $cmp187=(($163)|(0))!=(($add_ptr186)|(0));
      var $168 = $cmp187;label = 78; break;
    case 78: 
      var $168;
      if ($168) { label = 79; break; } else { label = 80; break; }
    case 79: 
      var $169=$sp;
      var $next=(($169+8)|0);
      var $170=HEAP32[(($next)>>2)];
      $sp=$170;
      label = 76; break;
    case 80: 
      var $171=$sp;
      var $cmp188=(($171)|(0))!=0;
      if ($cmp188) { label = 81; break; } else { label = 86; break; }
    case 81: 
      var $172=$sp;
      var $sflags190=(($172+12)|0);
      var $173=HEAP32[(($sflags190)>>2)];
      var $and191=$173 & 8;
      var $tobool192=(($and191)|(0))!=0;
      if ($tobool192) { label = 86; break; } else { label = 82; break; }
    case 82: 
      var $174=$sp;
      var $sflags194=(($174+12)|0);
      var $175=HEAP32[(($sflags194)>>2)];
      var $and195=$175 & 0;
      var $176=$mmap_flag;
      var $cmp196=(($and195)|(0))==(($176)|(0));
      if ($cmp196) { label = 83; break; } else { label = 86; break; }
    case 83: 
      var $177=$m_addr;
      var $top198=(($177+24)|0);
      var $178=HEAP32[(($top198)>>2)];
      var $179=$178;
      var $180=$sp;
      var $base199=(($180)|0);
      var $181=HEAP32[(($base199)>>2)];
      var $cmp200=(($179)>>>(0)) >= (($181)>>>(0));
      if ($cmp200) { label = 84; break; } else { label = 86; break; }
    case 84: 
      var $182=$m_addr;
      var $top202=(($182+24)|0);
      var $183=HEAP32[(($top202)>>2)];
      var $184=$183;
      var $185=$sp;
      var $base203=(($185)|0);
      var $186=HEAP32[(($base203)>>2)];
      var $187=$sp;
      var $size204=(($187+4)|0);
      var $188=HEAP32[(($size204)>>2)];
      var $add_ptr205=(($186+$188)|0);
      var $cmp206=(($184)>>>(0)) < (($add_ptr205)>>>(0));
      if ($cmp206) { label = 85; break; } else { label = 86; break; }
    case 85: 
      var $189=$tsize;
      var $190=$sp;
      var $size208=(($190+4)|0);
      var $191=HEAP32[(($size208)>>2)];
      var $add209=((($191)+($189))|0);
      HEAP32[(($size208)>>2)]=$add209;
      var $192=$m_addr;
      var $193=$m_addr;
      var $top210=(($193+24)|0);
      var $194=HEAP32[(($top210)>>2)];
      var $195=$m_addr;
      var $topsize211=(($195+12)|0);
      var $196=HEAP32[(($topsize211)>>2)];
      var $197=$tsize;
      var $add212=((($196)+($197))|0);
      _init_top($192, $194, $add212);
      label = 99; break;
    case 86: 
      var $198=$tbase;
      var $199=$m_addr;
      var $least_addr214=(($199+16)|0);
      var $200=HEAP32[(($least_addr214)>>2)];
      var $cmp215=(($198)>>>(0)) < (($200)>>>(0));
      if ($cmp215) { label = 87; break; } else { label = 88; break; }
    case 87: 
      var $201=$tbase;
      var $202=$m_addr;
      var $least_addr217=(($202+16)|0);
      HEAP32[(($least_addr217)>>2)]=$201;
      label = 88; break;
    case 88: 
      var $203=$m_addr;
      var $seg219=(($203+448)|0);
      $sp=$seg219;
      label = 89; break;
    case 89: 
      var $204=$sp;
      var $cmp221=(($204)|(0))!=0;
      if ($cmp221) { label = 90; break; } else { var $209 = 0;label = 91; break; }
    case 90: 
      var $205=$sp;
      var $base223=(($205)|0);
      var $206=HEAP32[(($base223)>>2)];
      var $207=$tbase;
      var $208=$tsize;
      var $add_ptr224=(($207+$208)|0);
      var $cmp225=(($206)|(0))!=(($add_ptr224)|(0));
      var $209 = $cmp225;label = 91; break;
    case 91: 
      var $209;
      if ($209) { label = 92; break; } else { label = 93; break; }
    case 92: 
      var $210=$sp;
      var $next228=(($210+8)|0);
      var $211=HEAP32[(($next228)>>2)];
      $sp=$211;
      label = 89; break;
    case 93: 
      var $212=$sp;
      var $cmp230=(($212)|(0))!=0;
      if ($cmp230) { label = 94; break; } else { label = 97; break; }
    case 94: 
      var $213=$sp;
      var $sflags232=(($213+12)|0);
      var $214=HEAP32[(($sflags232)>>2)];
      var $and233=$214 & 8;
      var $tobool234=(($and233)|(0))!=0;
      if ($tobool234) { label = 97; break; } else { label = 95; break; }
    case 95: 
      var $215=$sp;
      var $sflags236=(($215+12)|0);
      var $216=HEAP32[(($sflags236)>>2)];
      var $and237=$216 & 0;
      var $217=$mmap_flag;
      var $cmp238=(($and237)|(0))==(($217)|(0));
      if ($cmp238) { label = 96; break; } else { label = 97; break; }
    case 96: 
      var $218=$sp;
      var $base240=(($218)|0);
      var $219=HEAP32[(($base240)>>2)];
      $oldbase=$219;
      var $220=$tbase;
      var $221=$sp;
      var $base241=(($221)|0);
      HEAP32[(($base241)>>2)]=$220;
      var $222=$tsize;
      var $223=$sp;
      var $size242=(($223+4)|0);
      var $224=HEAP32[(($size242)>>2)];
      var $add243=((($224)+($222))|0);
      HEAP32[(($size242)>>2)]=$add243;
      var $225=$m_addr;
      var $226=$tbase;
      var $227=$oldbase;
      var $228=$nb_addr;
      var $call244=_prepend_alloc($225, $226, $227, $228);
      $retval=$call244;
      label = 104; break;
    case 97: 
      var $229=$m_addr;
      var $230=$tbase;
      var $231=$tsize;
      var $232=$mmap_flag;
      _add_segment($229, $230, $231, $232);
      label = 98; break;
    case 98: 
      label = 99; break;
    case 99: 
      label = 100; break;
    case 100: 
      var $233=$nb_addr;
      var $234=$m_addr;
      var $topsize249=(($234+12)|0);
      var $235=HEAP32[(($topsize249)>>2)];
      var $cmp250=(($233)>>>(0)) < (($235)>>>(0));
      if ($cmp250) { label = 101; break; } else { label = 102; break; }
    case 101: 
      var $236=$nb_addr;
      var $237=$m_addr;
      var $topsize252=(($237+12)|0);
      var $238=HEAP32[(($topsize252)>>2)];
      var $sub253=((($238)-($236))|0);
      HEAP32[(($topsize252)>>2)]=$sub253;
      $rsize=$sub253;
      var $239=$m_addr;
      var $top254=(($239+24)|0);
      var $240=HEAP32[(($top254)>>2)];
      $p=$240;
      var $241=$p;
      var $242=$241;
      var $243=$nb_addr;
      var $add_ptr255=(($242+$243)|0);
      var $244=$add_ptr255;
      var $245=$m_addr;
      var $top256=(($245+24)|0);
      HEAP32[(($top256)>>2)]=$244;
      $r=$244;
      var $246=$rsize;
      var $or257=$246 | 1;
      var $247=$r;
      var $head258=(($247+4)|0);
      HEAP32[(($head258)>>2)]=$or257;
      var $248=$nb_addr;
      var $or259=$248 | 1;
      var $or260=$or259 | 2;
      var $249=$p;
      var $head261=(($249+4)|0);
      HEAP32[(($head261)>>2)]=$or260;
      var $250=$p;
      var $251=$250;
      var $add_ptr262=(($251+8)|0);
      $retval=$add_ptr262;
      label = 104; break;
    case 102: 
      label = 103; break;
    case 103: 
      var $call265=___errno_location();
      HEAP32[(($call265)>>2)]=12;
      $retval=0;
      label = 104; break;
    case 104: 
      var $252=$retval;

      return $252;
    default: assert(0, "bad label: " + label);
  }

}


function _free($mem) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $mem_addr;
      var $p;
      var $psize;
      var $next;
      var $prevsize;
      var $prev;
      var $F;
      var $B;
      var $I;
      var $TP;
      var $XP;
      var $R;
      var $F77;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $tsize;
      var $dsize;
      var $nsize;
      var $F271;
      var $B273;
      var $I275;
      var $TP328;
      var $XP329;
      var $R331;
      var $F336;
      var $RP359;
      var $CP370;
      var $H397;
      var $C0439;
      var $C1440;
      var $I501;
      var $B503;
      var $F506;
      var $tp;
      var $H529;
      var $I530;
      var $X;
      var $Y;
      var $N;
      var $K;
      var $T;
      var $K579;
      var $C;
      var $F612;
      $mem_addr=$mem;
      var $0=$mem_addr;
      var $cmp=(($0)|(0))!=0;
      if ($cmp) { label = 3; break; } else { label = 215; break; }
    case 3: 
      var $1=$mem_addr;
      var $add_ptr=((($1)-(8))|0);
      var $2=$add_ptr;
      $p=$2;
      var $3=$p;
      var $4=$3;
      var $5=HEAP32[((((5243120)|0))>>2)];
      var $cmp1=(($4)>>>(0)) >= (($5)>>>(0));
      if ($cmp1) { label = 4; break; } else { var $8 = 0;label = 5; break; }
    case 4: 
      var $6=$p;
      var $head=(($6+4)|0);
      var $7=HEAP32[(($head)>>2)];
      var $and=$7 & 3;
      var $cmp2=(($and)|(0))!=1;
      var $8 = $cmp2;label = 5; break;
    case 5: 
      var $8;
      var $land_ext=(($8)&(1));
      var $expval=($land_ext);
      var $tobool=(($expval)|(0))!=0;
      if ($tobool) { label = 6; break; } else { label = 212; break; }
    case 6: 
      var $9=$p;
      var $head4=(($9+4)|0);
      var $10=HEAP32[(($head4)>>2)];
      var $and5=$10 & -8;
      $psize=$and5;
      var $11=$p;
      var $12=$11;
      var $13=$psize;
      var $add_ptr6=(($12+$13)|0);
      var $14=$add_ptr6;
      $next=$14;
      var $15=$p;
      var $head7=(($15+4)|0);
      var $16=HEAP32[(($head7)>>2)];
      var $and8=$16 & 1;
      var $tobool9=(($and8)|(0))!=0;
      if ($tobool9) { label = 87; break; } else { label = 7; break; }
    case 7: 
      var $17=$p;
      var $prev_foot=(($17)|0);
      var $18=HEAP32[(($prev_foot)>>2)];
      $prevsize=$18;
      var $19=$p;
      var $head11=(($19+4)|0);
      var $20=HEAP32[(($head11)>>2)];
      var $and12=$20 & 3;
      var $cmp13=(($and12)|(0))==0;
      if ($cmp13) { label = 8; break; } else { label = 9; break; }
    case 8: 
      var $21=$prevsize;
      var $add=((($21)+(16))|0);
      var $22=$psize;
      var $add15=((($22)+($add))|0);
      $psize=$add15;
      label = 214; break;
    case 9: 
      var $23=$p;
      var $24=$23;
      var $25=$prevsize;
      var $idx_neg=(((-$25))|0);
      var $add_ptr16=(($24+$idx_neg)|0);
      var $26=$add_ptr16;
      $prev=$26;
      var $27=$prevsize;
      var $28=$psize;
      var $add17=((($28)+($27))|0);
      $psize=$add17;
      var $29=$prev;
      $p=$29;
      var $30=$prev;
      var $31=$30;
      var $32=HEAP32[((((5243120)|0))>>2)];
      var $cmp18=(($31)>>>(0)) >= (($32)>>>(0));
      var $conv=(($cmp18)&(1));
      var $expval19=($conv);
      var $tobool20=(($expval19)|(0))!=0;
      if ($tobool20) { label = 10; break; } else { label = 84; break; }
    case 10: 
      var $33=$p;
      var $34=HEAP32[((((5243124)|0))>>2)];
      var $cmp22=(($33)|(0))!=(($34)|(0));
      if ($cmp22) { label = 11; break; } else { label = 80; break; }
    case 11: 
      var $35=$prevsize;
      var $shr=$35 >>> 3;
      var $cmp25=(($shr)>>>(0)) < 32;
      if ($cmp25) { label = 12; break; } else { label = 30; break; }
    case 12: 
      var $36=$p;
      var $fd=(($36+8)|0);
      var $37=HEAP32[(($fd)>>2)];
      $F=$37;
      var $38=$p;
      var $bk=(($38+12)|0);
      var $39=HEAP32[(($bk)>>2)];
      $B=$39;
      var $40=$prevsize;
      var $shr28=$40 >>> 3;
      $I=$shr28;
      var $41=$F;
      var $42=$I;
      var $shl=$42 << 1;
      var $arrayidx=((((5243144)|0)+($shl<<2))|0);
      var $43=$arrayidx;
      var $44=$43;
      var $cmp29=(($41)|(0))==(($44)|(0));
      if ($cmp29) { var $52 = 1;label = 16; break; } else { label = 13; break; }
    case 13: 
      var $45=$F;
      var $46=$45;
      var $47=HEAP32[((((5243120)|0))>>2)];
      var $cmp31=(($46)>>>(0)) >= (($47)>>>(0));
      if ($cmp31) { label = 14; break; } else { var $51 = 0;label = 15; break; }
    case 14: 
      var $48=$F;
      var $bk34=(($48+12)|0);
      var $49=HEAP32[(($bk34)>>2)];
      var $50=$p;
      var $cmp35=(($49)|(0))==(($50)|(0));
      var $51 = $cmp35;label = 15; break;
    case 15: 
      var $51;
      var $52 = $51;label = 16; break;
    case 16: 
      var $52;
      var $lor_ext=(($52)&(1));
      var $expval39=($lor_ext);
      var $tobool40=(($expval39)|(0))!=0;
      if ($tobool40) { label = 17; break; } else { label = 28; break; }
    case 17: 
      var $53=$B;
      var $54=$F;
      var $cmp42=(($53)|(0))==(($54)|(0));
      if ($cmp42) { label = 18; break; } else { label = 19; break; }
    case 18: 
      var $55=$I;
      var $shl45=1 << $55;
      var $neg=$shl45 ^ -1;
      var $56=HEAP32[((((5243104)|0))>>2)];
      var $and46=$56 & $neg;
      HEAP32[((((5243104)|0))>>2)]=$and46;
      label = 27; break;
    case 19: 
      var $57=$B;
      var $58=$I;
      var $shl48=$58 << 1;
      var $arrayidx49=((((5243144)|0)+($shl48<<2))|0);
      var $59=$arrayidx49;
      var $60=$59;
      var $cmp50=(($57)|(0))==(($60)|(0));
      if ($cmp50) { var $68 = 1;label = 23; break; } else { label = 20; break; }
    case 20: 
      var $61=$B;
      var $62=$61;
      var $63=HEAP32[((((5243120)|0))>>2)];
      var $cmp53=(($62)>>>(0)) >= (($63)>>>(0));
      if ($cmp53) { label = 21; break; } else { var $67 = 0;label = 22; break; }
    case 21: 
      var $64=$B;
      var $fd56=(($64+8)|0);
      var $65=HEAP32[(($fd56)>>2)];
      var $66=$p;
      var $cmp57=(($65)|(0))==(($66)|(0));
      var $67 = $cmp57;label = 22; break;
    case 22: 
      var $67;
      var $68 = $67;label = 23; break;
    case 23: 
      var $68;
      var $lor_ext62=(($68)&(1));
      var $expval63=($lor_ext62);
      var $tobool64=(($expval63)|(0))!=0;
      if ($tobool64) { label = 24; break; } else { label = 25; break; }
    case 24: 
      var $69=$B;
      var $70=$F;
      var $bk66=(($70+12)|0);
      HEAP32[(($bk66)>>2)]=$69;
      var $71=$F;
      var $72=$B;
      var $fd67=(($72+8)|0);
      HEAP32[(($fd67)>>2)]=$71;
      label = 26; break;
    case 25: 
      _abort();
      throw "Reached an unreachable!"
    case 26: 
      label = 27; break;
    case 27: 
      label = 29; break;
    case 28: 
      _abort();
      throw "Reached an unreachable!"
    case 29: 
      label = 79; break;
    case 30: 
      var $73=$p;
      var $74=$73;
      $TP=$74;
      var $75=$TP;
      var $parent=(($75+24)|0);
      var $76=HEAP32[(($parent)>>2)];
      $XP=$76;
      var $77=$TP;
      var $bk73=(($77+12)|0);
      var $78=HEAP32[(($bk73)>>2)];
      var $79=$TP;
      var $cmp74=(($78)|(0))!=(($79)|(0));
      if ($cmp74) { label = 31; break; } else { label = 38; break; }
    case 31: 
      var $80=$TP;
      var $fd78=(($80+8)|0);
      var $81=HEAP32[(($fd78)>>2)];
      $F77=$81;
      var $82=$TP;
      var $bk79=(($82+12)|0);
      var $83=HEAP32[(($bk79)>>2)];
      $R=$83;
      var $84=$F77;
      var $85=$84;
      var $86=HEAP32[((((5243120)|0))>>2)];
      var $cmp80=(($85)>>>(0)) >= (($86)>>>(0));
      if ($cmp80) { label = 32; break; } else { var $93 = 0;label = 34; break; }
    case 32: 
      var $87=$F77;
      var $bk82=(($87+12)|0);
      var $88=HEAP32[(($bk82)>>2)];
      var $89=$TP;
      var $cmp83=(($88)|(0))==(($89)|(0));
      if ($cmp83) { label = 33; break; } else { var $93 = 0;label = 34; break; }
    case 33: 
      var $90=$R;
      var $fd86=(($90+8)|0);
      var $91=HEAP32[(($fd86)>>2)];
      var $92=$TP;
      var $cmp87=(($91)|(0))==(($92)|(0));
      var $93 = $cmp87;label = 34; break;
    case 34: 
      var $93;
      var $land_ext90=(($93)&(1));
      var $expval91=($land_ext90);
      var $tobool92=(($expval91)|(0))!=0;
      if ($tobool92) { label = 35; break; } else { label = 36; break; }
    case 35: 
      var $94=$R;
      var $95=$F77;
      var $bk94=(($95+12)|0);
      HEAP32[(($bk94)>>2)]=$94;
      var $96=$F77;
      var $97=$R;
      var $fd95=(($97+8)|0);
      HEAP32[(($fd95)>>2)]=$96;
      label = 37; break;
    case 36: 
      _abort();
      throw "Reached an unreachable!"
    case 37: 
      label = 50; break;
    case 38: 
      var $98=$TP;
      var $child=(($98+16)|0);
      var $arrayidx99=(($child+4)|0);
      $RP=$arrayidx99;
      var $99=HEAP32[(($arrayidx99)>>2)];
      $R=$99;
      var $cmp100=(($99)|(0))!=0;
      if ($cmp100) { label = 40; break; } else { label = 39; break; }
    case 39: 
      var $100=$TP;
      var $child102=(($100+16)|0);
      var $arrayidx103=(($child102)|0);
      $RP=$arrayidx103;
      var $101=HEAP32[(($arrayidx103)>>2)];
      $R=$101;
      var $cmp104=(($101)|(0))!=0;
      if ($cmp104) { label = 40; break; } else { label = 49; break; }
    case 40: 
      label = 41; break;
    case 41: 
      var $102=$R;
      var $child107=(($102+16)|0);
      var $arrayidx108=(($child107+4)|0);
      $CP=$arrayidx108;
      var $103=HEAP32[(($arrayidx108)>>2)];
      var $cmp109=(($103)|(0))!=0;
      if ($cmp109) { var $106 = 1;label = 43; break; } else { label = 42; break; }
    case 42: 
      var $104=$R;
      var $child112=(($104+16)|0);
      var $arrayidx113=(($child112)|0);
      $CP=$arrayidx113;
      var $105=HEAP32[(($arrayidx113)>>2)];
      var $cmp114=(($105)|(0))!=0;
      var $106 = $cmp114;label = 43; break;
    case 43: 
      var $106;
      if ($106) { label = 44; break; } else { label = 45; break; }
    case 44: 
      var $107=$CP;
      $RP=$107;
      var $108=HEAP32[(($107)>>2)];
      $R=$108;
      label = 41; break;
    case 45: 
      var $109=$RP;
      var $110=$109;
      var $111=HEAP32[((((5243120)|0))>>2)];
      var $cmp118=(($110)>>>(0)) >= (($111)>>>(0));
      var $conv119=(($cmp118)&(1));
      var $expval120=($conv119);
      var $tobool121=(($expval120)|(0))!=0;
      if ($tobool121) { label = 46; break; } else { label = 47; break; }
    case 46: 
      var $112=$RP;
      HEAP32[(($112)>>2)]=0;
      label = 48; break;
    case 47: 
      _abort();
      throw "Reached an unreachable!"
    case 48: 
      label = 49; break;
    case 49: 
      label = 50; break;
    case 50: 
      var $113=$XP;
      var $cmp127=(($113)|(0))!=0;
      if ($cmp127) { label = 51; break; } else { label = 78; break; }
    case 51: 
      var $114=$TP;
      var $index=(($114+28)|0);
      var $115=HEAP32[(($index)>>2)];
      var $arrayidx130=((((5243408)|0)+($115<<2))|0);
      $H=$arrayidx130;
      var $116=$TP;
      var $117=$H;
      var $118=HEAP32[(($117)>>2)];
      var $cmp131=(($116)|(0))==(($118)|(0));
      if ($cmp131) { label = 52; break; } else { label = 55; break; }
    case 52: 
      var $119=$R;
      var $120=$H;
      HEAP32[(($120)>>2)]=$119;
      var $cmp134=(($119)|(0))==0;
      if ($cmp134) { label = 53; break; } else { label = 54; break; }
    case 53: 
      var $121=$TP;
      var $index137=(($121+28)|0);
      var $122=HEAP32[(($index137)>>2)];
      var $shl138=1 << $122;
      var $neg139=$shl138 ^ -1;
      var $123=HEAP32[((((5243108)|0))>>2)];
      var $and140=$123 & $neg139;
      HEAP32[((((5243108)|0))>>2)]=$and140;
      label = 54; break;
    case 54: 
      label = 62; break;
    case 55: 
      var $124=$XP;
      var $125=$124;
      var $126=HEAP32[((((5243120)|0))>>2)];
      var $cmp143=(($125)>>>(0)) >= (($126)>>>(0));
      var $conv144=(($cmp143)&(1));
      var $expval145=($conv144);
      var $tobool146=(($expval145)|(0))!=0;
      if ($tobool146) { label = 56; break; } else { label = 60; break; }
    case 56: 
      var $127=$XP;
      var $child148=(($127+16)|0);
      var $arrayidx149=(($child148)|0);
      var $128=HEAP32[(($arrayidx149)>>2)];
      var $129=$TP;
      var $cmp150=(($128)|(0))==(($129)|(0));
      if ($cmp150) { label = 57; break; } else { label = 58; break; }
    case 57: 
      var $130=$R;
      var $131=$XP;
      var $child153=(($131+16)|0);
      var $arrayidx154=(($child153)|0);
      HEAP32[(($arrayidx154)>>2)]=$130;
      label = 59; break;
    case 58: 
      var $132=$R;
      var $133=$XP;
      var $child156=(($133+16)|0);
      var $arrayidx157=(($child156+4)|0);
      HEAP32[(($arrayidx157)>>2)]=$132;
      label = 59; break;
    case 59: 
      label = 61; break;
    case 60: 
      _abort();
      throw "Reached an unreachable!"
    case 61: 
      label = 62; break;
    case 62: 
      var $134=$R;
      var $cmp162=(($134)|(0))!=0;
      if ($cmp162) { label = 63; break; } else { label = 77; break; }
    case 63: 
      var $135=$R;
      var $136=$135;
      var $137=HEAP32[((((5243120)|0))>>2)];
      var $cmp165=(($136)>>>(0)) >= (($137)>>>(0));
      var $conv166=(($cmp165)&(1));
      var $expval167=($conv166);
      var $tobool168=(($expval167)|(0))!=0;
      if ($tobool168) { label = 64; break; } else { label = 75; break; }
    case 64: 
      var $138=$XP;
      var $139=$R;
      var $parent170=(($139+24)|0);
      HEAP32[(($parent170)>>2)]=$138;
      var $140=$TP;
      var $child171=(($140+16)|0);
      var $arrayidx172=(($child171)|0);
      var $141=HEAP32[(($arrayidx172)>>2)];
      $C0=$141;
      var $cmp173=(($141)|(0))!=0;
      if ($cmp173) { label = 65; break; } else { label = 69; break; }
    case 65: 
      var $142=$C0;
      var $143=$142;
      var $144=HEAP32[((((5243120)|0))>>2)];
      var $cmp176=(($143)>>>(0)) >= (($144)>>>(0));
      var $conv177=(($cmp176)&(1));
      var $expval178=($conv177);
      var $tobool179=(($expval178)|(0))!=0;
      if ($tobool179) { label = 66; break; } else { label = 67; break; }
    case 66: 
      var $145=$C0;
      var $146=$R;
      var $child181=(($146+16)|0);
      var $arrayidx182=(($child181)|0);
      HEAP32[(($arrayidx182)>>2)]=$145;
      var $147=$R;
      var $148=$C0;
      var $parent183=(($148+24)|0);
      HEAP32[(($parent183)>>2)]=$147;
      label = 68; break;
    case 67: 
      _abort();
      throw "Reached an unreachable!"
    case 68: 
      label = 69; break;
    case 69: 
      var $149=$TP;
      var $child187=(($149+16)|0);
      var $arrayidx188=(($child187+4)|0);
      var $150=HEAP32[(($arrayidx188)>>2)];
      $C1=$150;
      var $cmp189=(($150)|(0))!=0;
      if ($cmp189) { label = 70; break; } else { label = 74; break; }
    case 70: 
      var $151=$C1;
      var $152=$151;
      var $153=HEAP32[((((5243120)|0))>>2)];
      var $cmp192=(($152)>>>(0)) >= (($153)>>>(0));
      var $conv193=(($cmp192)&(1));
      var $expval194=($conv193);
      var $tobool195=(($expval194)|(0))!=0;
      if ($tobool195) { label = 71; break; } else { label = 72; break; }
    case 71: 
      var $154=$C1;
      var $155=$R;
      var $child197=(($155+16)|0);
      var $arrayidx198=(($child197+4)|0);
      HEAP32[(($arrayidx198)>>2)]=$154;
      var $156=$R;
      var $157=$C1;
      var $parent199=(($157+24)|0);
      HEAP32[(($parent199)>>2)]=$156;
      label = 73; break;
    case 72: 
      _abort();
      throw "Reached an unreachable!"
    case 73: 
      label = 74; break;
    case 74: 
      label = 76; break;
    case 75: 
      _abort();
      throw "Reached an unreachable!"
    case 76: 
      label = 77; break;
    case 77: 
      label = 78; break;
    case 78: 
      label = 79; break;
    case 79: 
      label = 83; break;
    case 80: 
      var $158=$next;
      var $head209=(($158+4)|0);
      var $159=HEAP32[(($head209)>>2)];
      var $and210=$159 & 3;
      var $cmp211=(($and210)|(0))==3;
      if ($cmp211) { label = 81; break; } else { label = 82; break; }
    case 81: 
      var $160=$psize;
      HEAP32[((((5243112)|0))>>2)]=$160;
      var $161=$next;
      var $head214=(($161+4)|0);
      var $162=HEAP32[(($head214)>>2)];
      var $and215=$162 & -2;
      HEAP32[(($head214)>>2)]=$and215;
      var $163=$psize;
      var $or=$163 | 1;
      var $164=$p;
      var $head216=(($164+4)|0);
      HEAP32[(($head216)>>2)]=$or;
      var $165=$psize;
      var $166=$p;
      var $167=$166;
      var $168=$psize;
      var $add_ptr217=(($167+$168)|0);
      var $169=$add_ptr217;
      var $prev_foot218=(($169)|0);
      HEAP32[(($prev_foot218)>>2)]=$165;
      label = 214; break;
    case 82: 
      label = 83; break;
    case 83: 
      label = 85; break;
    case 84: 
      label = 213; break;
    case 85: 
      label = 86; break;
    case 86: 
      label = 87; break;
    case 87: 
      var $170=$p;
      var $171=$170;
      var $172=$next;
      var $173=$172;
      var $cmp225=(($171)>>>(0)) < (($173)>>>(0));
      if ($cmp225) { label = 88; break; } else { var $176 = 0;label = 89; break; }
    case 88: 
      var $174=$next;
      var $head228=(($174+4)|0);
      var $175=HEAP32[(($head228)>>2)];
      var $and229=$175 & 1;
      var $tobool230=(($and229)|(0))!=0;
      var $176 = $tobool230;label = 89; break;
    case 89: 
      var $176;
      var $land_ext232=(($176)&(1));
      var $expval233=($land_ext232);
      var $tobool234=(($expval233)|(0))!=0;
      if ($tobool234) { label = 90; break; } else { label = 211; break; }
    case 90: 
      var $177=$next;
      var $head236=(($177+4)|0);
      var $178=HEAP32[(($head236)>>2)];
      var $and237=$178 & 2;
      var $tobool238=(($and237)|(0))!=0;
      if ($tobool238) { label = 172; break; } else { label = 91; break; }
    case 91: 
      var $179=$next;
      var $180=HEAP32[((((5243128)|0))>>2)];
      var $cmp240=(($179)|(0))==(($180)|(0));
      if ($cmp240) { label = 92; break; } else { label = 97; break; }
    case 92: 
      var $181=$psize;
      var $182=HEAP32[((((5243116)|0))>>2)];
      var $add243=((($182)+($181))|0);
      HEAP32[((((5243116)|0))>>2)]=$add243;
      $tsize=$add243;
      var $183=$p;
      HEAP32[((((5243128)|0))>>2)]=$183;
      var $184=$tsize;
      var $or244=$184 | 1;
      var $185=$p;
      var $head245=(($185+4)|0);
      HEAP32[(($head245)>>2)]=$or244;
      var $186=$p;
      var $187=HEAP32[((((5243124)|0))>>2)];
      var $cmp246=(($186)|(0))==(($187)|(0));
      if ($cmp246) { label = 93; break; } else { label = 94; break; }
    case 93: 
      HEAP32[((((5243124)|0))>>2)]=0;
      HEAP32[((((5243112)|0))>>2)]=0;
      label = 94; break;
    case 94: 
      var $188=$tsize;
      var $189=HEAP32[((((5243132)|0))>>2)];
      var $cmp250=(($188)>>>(0)) > (($189)>>>(0));
      if ($cmp250) { label = 95; break; } else { label = 96; break; }
    case 95: 
      var $call=_sys_trim(5243104, 0);
      label = 96; break;
    case 96: 
      label = 214; break;
    case 97: 
      var $190=$next;
      var $191=HEAP32[((((5243124)|0))>>2)];
      var $cmp255=(($190)|(0))==(($191)|(0));
      if ($cmp255) { label = 98; break; } else { label = 99; break; }
    case 98: 
      var $192=$psize;
      var $193=HEAP32[((((5243112)|0))>>2)];
      var $add258=((($193)+($192))|0);
      HEAP32[((((5243112)|0))>>2)]=$add258;
      $dsize=$add258;
      var $194=$p;
      HEAP32[((((5243124)|0))>>2)]=$194;
      var $195=$dsize;
      var $or259=$195 | 1;
      var $196=$p;
      var $head260=(($196+4)|0);
      HEAP32[(($head260)>>2)]=$or259;
      var $197=$dsize;
      var $198=$p;
      var $199=$198;
      var $200=$dsize;
      var $add_ptr261=(($199+$200)|0);
      var $201=$add_ptr261;
      var $prev_foot262=(($201)|0);
      HEAP32[(($prev_foot262)>>2)]=$197;
      label = 214; break;
    case 99: 
      var $202=$next;
      var $head264=(($202+4)|0);
      var $203=HEAP32[(($head264)>>2)];
      var $and265=$203 & -8;
      $nsize=$and265;
      var $204=$nsize;
      var $205=$psize;
      var $add266=((($205)+($204))|0);
      $psize=$add266;
      var $206=$nsize;
      var $shr267=$206 >>> 3;
      var $cmp268=(($shr267)>>>(0)) < 32;
      if ($cmp268) { label = 100; break; } else { label = 118; break; }
    case 100: 
      var $207=$next;
      var $fd272=(($207+8)|0);
      var $208=HEAP32[(($fd272)>>2)];
      $F271=$208;
      var $209=$next;
      var $bk274=(($209+12)|0);
      var $210=HEAP32[(($bk274)>>2)];
      $B273=$210;
      var $211=$nsize;
      var $shr276=$211 >>> 3;
      $I275=$shr276;
      var $212=$F271;
      var $213=$I275;
      var $shl277=$213 << 1;
      var $arrayidx278=((((5243144)|0)+($shl277<<2))|0);
      var $214=$arrayidx278;
      var $215=$214;
      var $cmp279=(($212)|(0))==(($215)|(0));
      if ($cmp279) { var $223 = 1;label = 104; break; } else { label = 101; break; }
    case 101: 
      var $216=$F271;
      var $217=$216;
      var $218=HEAP32[((((5243120)|0))>>2)];
      var $cmp282=(($217)>>>(0)) >= (($218)>>>(0));
      if ($cmp282) { label = 102; break; } else { var $222 = 0;label = 103; break; }
    case 102: 
      var $219=$F271;
      var $bk285=(($219+12)|0);
      var $220=HEAP32[(($bk285)>>2)];
      var $221=$next;
      var $cmp286=(($220)|(0))==(($221)|(0));
      var $222 = $cmp286;label = 103; break;
    case 103: 
      var $222;
      var $223 = $222;label = 104; break;
    case 104: 
      var $223;
      var $lor_ext291=(($223)&(1));
      var $expval292=($lor_ext291);
      var $tobool293=(($expval292)|(0))!=0;
      if ($tobool293) { label = 105; break; } else { label = 116; break; }
    case 105: 
      var $224=$B273;
      var $225=$F271;
      var $cmp295=(($224)|(0))==(($225)|(0));
      if ($cmp295) { label = 106; break; } else { label = 107; break; }
    case 106: 
      var $226=$I275;
      var $shl298=1 << $226;
      var $neg299=$shl298 ^ -1;
      var $227=HEAP32[((((5243104)|0))>>2)];
      var $and300=$227 & $neg299;
      HEAP32[((((5243104)|0))>>2)]=$and300;
      label = 115; break;
    case 107: 
      var $228=$B273;
      var $229=$I275;
      var $shl302=$229 << 1;
      var $arrayidx303=((((5243144)|0)+($shl302<<2))|0);
      var $230=$arrayidx303;
      var $231=$230;
      var $cmp304=(($228)|(0))==(($231)|(0));
      if ($cmp304) { var $239 = 1;label = 111; break; } else { label = 108; break; }
    case 108: 
      var $232=$B273;
      var $233=$232;
      var $234=HEAP32[((((5243120)|0))>>2)];
      var $cmp307=(($233)>>>(0)) >= (($234)>>>(0));
      if ($cmp307) { label = 109; break; } else { var $238 = 0;label = 110; break; }
    case 109: 
      var $235=$B273;
      var $fd310=(($235+8)|0);
      var $236=HEAP32[(($fd310)>>2)];
      var $237=$next;
      var $cmp311=(($236)|(0))==(($237)|(0));
      var $238 = $cmp311;label = 110; break;
    case 110: 
      var $238;
      var $239 = $238;label = 111; break;
    case 111: 
      var $239;
      var $lor_ext316=(($239)&(1));
      var $expval317=($lor_ext316);
      var $tobool318=(($expval317)|(0))!=0;
      if ($tobool318) { label = 112; break; } else { label = 113; break; }
    case 112: 
      var $240=$B273;
      var $241=$F271;
      var $bk320=(($241+12)|0);
      HEAP32[(($bk320)>>2)]=$240;
      var $242=$F271;
      var $243=$B273;
      var $fd321=(($243+8)|0);
      HEAP32[(($fd321)>>2)]=$242;
      label = 114; break;
    case 113: 
      _abort();
      throw "Reached an unreachable!"
    case 114: 
      label = 115; break;
    case 115: 
      label = 117; break;
    case 116: 
      _abort();
      throw "Reached an unreachable!"
    case 117: 
      label = 167; break;
    case 118: 
      var $244=$next;
      var $245=$244;
      $TP328=$245;
      var $246=$TP328;
      var $parent330=(($246+24)|0);
      var $247=HEAP32[(($parent330)>>2)];
      $XP329=$247;
      var $248=$TP328;
      var $bk332=(($248+12)|0);
      var $249=HEAP32[(($bk332)>>2)];
      var $250=$TP328;
      var $cmp333=(($249)|(0))!=(($250)|(0));
      if ($cmp333) { label = 119; break; } else { label = 126; break; }
    case 119: 
      var $251=$TP328;
      var $fd337=(($251+8)|0);
      var $252=HEAP32[(($fd337)>>2)];
      $F336=$252;
      var $253=$TP328;
      var $bk338=(($253+12)|0);
      var $254=HEAP32[(($bk338)>>2)];
      $R331=$254;
      var $255=$F336;
      var $256=$255;
      var $257=HEAP32[((((5243120)|0))>>2)];
      var $cmp339=(($256)>>>(0)) >= (($257)>>>(0));
      if ($cmp339) { label = 120; break; } else { var $264 = 0;label = 122; break; }
    case 120: 
      var $258=$F336;
      var $bk342=(($258+12)|0);
      var $259=HEAP32[(($bk342)>>2)];
      var $260=$TP328;
      var $cmp343=(($259)|(0))==(($260)|(0));
      if ($cmp343) { label = 121; break; } else { var $264 = 0;label = 122; break; }
    case 121: 
      var $261=$R331;
      var $fd346=(($261+8)|0);
      var $262=HEAP32[(($fd346)>>2)];
      var $263=$TP328;
      var $cmp347=(($262)|(0))==(($263)|(0));
      var $264 = $cmp347;label = 122; break;
    case 122: 
      var $264;
      var $land_ext350=(($264)&(1));
      var $expval351=($land_ext350);
      var $tobool352=(($expval351)|(0))!=0;
      if ($tobool352) { label = 123; break; } else { label = 124; break; }
    case 123: 
      var $265=$R331;
      var $266=$F336;
      var $bk354=(($266+12)|0);
      HEAP32[(($bk354)>>2)]=$265;
      var $267=$F336;
      var $268=$R331;
      var $fd355=(($268+8)|0);
      HEAP32[(($fd355)>>2)]=$267;
      label = 125; break;
    case 124: 
      _abort();
      throw "Reached an unreachable!"
    case 125: 
      label = 138; break;
    case 126: 
      var $269=$TP328;
      var $child360=(($269+16)|0);
      var $arrayidx361=(($child360+4)|0);
      $RP359=$arrayidx361;
      var $270=HEAP32[(($arrayidx361)>>2)];
      $R331=$270;
      var $cmp362=(($270)|(0))!=0;
      if ($cmp362) { label = 128; break; } else { label = 127; break; }
    case 127: 
      var $271=$TP328;
      var $child365=(($271+16)|0);
      var $arrayidx366=(($child365)|0);
      $RP359=$arrayidx366;
      var $272=HEAP32[(($arrayidx366)>>2)];
      $R331=$272;
      var $cmp367=(($272)|(0))!=0;
      if ($cmp367) { label = 128; break; } else { label = 137; break; }
    case 128: 
      label = 129; break;
    case 129: 
      var $273=$R331;
      var $child372=(($273+16)|0);
      var $arrayidx373=(($child372+4)|0);
      $CP370=$arrayidx373;
      var $274=HEAP32[(($arrayidx373)>>2)];
      var $cmp374=(($274)|(0))!=0;
      if ($cmp374) { var $277 = 1;label = 131; break; } else { label = 130; break; }
    case 130: 
      var $275=$R331;
      var $child377=(($275+16)|0);
      var $arrayidx378=(($child377)|0);
      $CP370=$arrayidx378;
      var $276=HEAP32[(($arrayidx378)>>2)];
      var $cmp379=(($276)|(0))!=0;
      var $277 = $cmp379;label = 131; break;
    case 131: 
      var $277;
      if ($277) { label = 132; break; } else { label = 133; break; }
    case 132: 
      var $278=$CP370;
      $RP359=$278;
      var $279=HEAP32[(($278)>>2)];
      $R331=$279;
      label = 129; break;
    case 133: 
      var $280=$RP359;
      var $281=$280;
      var $282=HEAP32[((((5243120)|0))>>2)];
      var $cmp385=(($281)>>>(0)) >= (($282)>>>(0));
      var $conv386=(($cmp385)&(1));
      var $expval387=($conv386);
      var $tobool388=(($expval387)|(0))!=0;
      if ($tobool388) { label = 134; break; } else { label = 135; break; }
    case 134: 
      var $283=$RP359;
      HEAP32[(($283)>>2)]=0;
      label = 136; break;
    case 135: 
      _abort();
      throw "Reached an unreachable!"
    case 136: 
      label = 137; break;
    case 137: 
      label = 138; break;
    case 138: 
      var $284=$XP329;
      var $cmp394=(($284)|(0))!=0;
      if ($cmp394) { label = 139; break; } else { label = 166; break; }
    case 139: 
      var $285=$TP328;
      var $index398=(($285+28)|0);
      var $286=HEAP32[(($index398)>>2)];
      var $arrayidx399=((((5243408)|0)+($286<<2))|0);
      $H397=$arrayidx399;
      var $287=$TP328;
      var $288=$H397;
      var $289=HEAP32[(($288)>>2)];
      var $cmp400=(($287)|(0))==(($289)|(0));
      if ($cmp400) { label = 140; break; } else { label = 143; break; }
    case 140: 
      var $290=$R331;
      var $291=$H397;
      HEAP32[(($291)>>2)]=$290;
      var $cmp403=(($290)|(0))==0;
      if ($cmp403) { label = 141; break; } else { label = 142; break; }
    case 141: 
      var $292=$TP328;
      var $index406=(($292+28)|0);
      var $293=HEAP32[(($index406)>>2)];
      var $shl407=1 << $293;
      var $neg408=$shl407 ^ -1;
      var $294=HEAP32[((((5243108)|0))>>2)];
      var $and409=$294 & $neg408;
      HEAP32[((((5243108)|0))>>2)]=$and409;
      label = 142; break;
    case 142: 
      label = 150; break;
    case 143: 
      var $295=$XP329;
      var $296=$295;
      var $297=HEAP32[((((5243120)|0))>>2)];
      var $cmp412=(($296)>>>(0)) >= (($297)>>>(0));
      var $conv413=(($cmp412)&(1));
      var $expval414=($conv413);
      var $tobool415=(($expval414)|(0))!=0;
      if ($tobool415) { label = 144; break; } else { label = 148; break; }
    case 144: 
      var $298=$XP329;
      var $child417=(($298+16)|0);
      var $arrayidx418=(($child417)|0);
      var $299=HEAP32[(($arrayidx418)>>2)];
      var $300=$TP328;
      var $cmp419=(($299)|(0))==(($300)|(0));
      if ($cmp419) { label = 145; break; } else { label = 146; break; }
    case 145: 
      var $301=$R331;
      var $302=$XP329;
      var $child422=(($302+16)|0);
      var $arrayidx423=(($child422)|0);
      HEAP32[(($arrayidx423)>>2)]=$301;
      label = 147; break;
    case 146: 
      var $303=$R331;
      var $304=$XP329;
      var $child425=(($304+16)|0);
      var $arrayidx426=(($child425+4)|0);
      HEAP32[(($arrayidx426)>>2)]=$303;
      label = 147; break;
    case 147: 
      label = 149; break;
    case 148: 
      _abort();
      throw "Reached an unreachable!"
    case 149: 
      label = 150; break;
    case 150: 
      var $305=$R331;
      var $cmp431=(($305)|(0))!=0;
      if ($cmp431) { label = 151; break; } else { label = 165; break; }
    case 151: 
      var $306=$R331;
      var $307=$306;
      var $308=HEAP32[((((5243120)|0))>>2)];
      var $cmp434=(($307)>>>(0)) >= (($308)>>>(0));
      var $conv435=(($cmp434)&(1));
      var $expval436=($conv435);
      var $tobool437=(($expval436)|(0))!=0;
      if ($tobool437) { label = 152; break; } else { label = 163; break; }
    case 152: 
      var $309=$XP329;
      var $310=$R331;
      var $parent441=(($310+24)|0);
      HEAP32[(($parent441)>>2)]=$309;
      var $311=$TP328;
      var $child442=(($311+16)|0);
      var $arrayidx443=(($child442)|0);
      var $312=HEAP32[(($arrayidx443)>>2)];
      $C0439=$312;
      var $cmp444=(($312)|(0))!=0;
      if ($cmp444) { label = 153; break; } else { label = 157; break; }
    case 153: 
      var $313=$C0439;
      var $314=$313;
      var $315=HEAP32[((((5243120)|0))>>2)];
      var $cmp447=(($314)>>>(0)) >= (($315)>>>(0));
      var $conv448=(($cmp447)&(1));
      var $expval449=($conv448);
      var $tobool450=(($expval449)|(0))!=0;
      if ($tobool450) { label = 154; break; } else { label = 155; break; }
    case 154: 
      var $316=$C0439;
      var $317=$R331;
      var $child452=(($317+16)|0);
      var $arrayidx453=(($child452)|0);
      HEAP32[(($arrayidx453)>>2)]=$316;
      var $318=$R331;
      var $319=$C0439;
      var $parent454=(($319+24)|0);
      HEAP32[(($parent454)>>2)]=$318;
      label = 156; break;
    case 155: 
      _abort();
      throw "Reached an unreachable!"
    case 156: 
      label = 157; break;
    case 157: 
      var $320=$TP328;
      var $child458=(($320+16)|0);
      var $arrayidx459=(($child458+4)|0);
      var $321=HEAP32[(($arrayidx459)>>2)];
      $C1440=$321;
      var $cmp460=(($321)|(0))!=0;
      if ($cmp460) { label = 158; break; } else { label = 162; break; }
    case 158: 
      var $322=$C1440;
      var $323=$322;
      var $324=HEAP32[((((5243120)|0))>>2)];
      var $cmp463=(($323)>>>(0)) >= (($324)>>>(0));
      var $conv464=(($cmp463)&(1));
      var $expval465=($conv464);
      var $tobool466=(($expval465)|(0))!=0;
      if ($tobool466) { label = 159; break; } else { label = 160; break; }
    case 159: 
      var $325=$C1440;
      var $326=$R331;
      var $child468=(($326+16)|0);
      var $arrayidx469=(($child468+4)|0);
      HEAP32[(($arrayidx469)>>2)]=$325;
      var $327=$R331;
      var $328=$C1440;
      var $parent470=(($328+24)|0);
      HEAP32[(($parent470)>>2)]=$327;
      label = 161; break;
    case 160: 
      _abort();
      throw "Reached an unreachable!"
    case 161: 
      label = 162; break;
    case 162: 
      label = 164; break;
    case 163: 
      _abort();
      throw "Reached an unreachable!"
    case 164: 
      label = 165; break;
    case 165: 
      label = 166; break;
    case 166: 
      label = 167; break;
    case 167: 
      var $329=$psize;
      var $or479=$329 | 1;
      var $330=$p;
      var $head480=(($330+4)|0);
      HEAP32[(($head480)>>2)]=$or479;
      var $331=$psize;
      var $332=$p;
      var $333=$332;
      var $334=$psize;
      var $add_ptr481=(($333+$334)|0);
      var $335=$add_ptr481;
      var $prev_foot482=(($335)|0);
      HEAP32[(($prev_foot482)>>2)]=$331;
      var $336=$p;
      var $337=HEAP32[((((5243124)|0))>>2)];
      var $cmp483=(($336)|(0))==(($337)|(0));
      if ($cmp483) { label = 168; break; } else { label = 169; break; }
    case 168: 
      var $338=$psize;
      HEAP32[((((5243112)|0))>>2)]=$338;
      label = 214; break;
    case 169: 
      label = 170; break;
    case 170: 
      label = 171; break;
    case 171: 
      label = 173; break;
    case 172: 
      var $339=$next;
      var $head490=(($339+4)|0);
      var $340=HEAP32[(($head490)>>2)];
      var $and491=$340 & -2;
      HEAP32[(($head490)>>2)]=$and491;
      var $341=$psize;
      var $or492=$341 | 1;
      var $342=$p;
      var $head493=(($342+4)|0);
      HEAP32[(($head493)>>2)]=$or492;
      var $343=$psize;
      var $344=$p;
      var $345=$344;
      var $346=$psize;
      var $add_ptr494=(($345+$346)|0);
      var $347=$add_ptr494;
      var $prev_foot495=(($347)|0);
      HEAP32[(($prev_foot495)>>2)]=$343;
      label = 173; break;
    case 173: 
      var $348=$psize;
      var $shr497=$348 >>> 3;
      var $cmp498=(($shr497)>>>(0)) < 32;
      if ($cmp498) { label = 174; break; } else { label = 181; break; }
    case 174: 
      var $349=$psize;
      var $shr502=$349 >>> 3;
      $I501=$shr502;
      var $350=$I501;
      var $shl504=$350 << 1;
      var $arrayidx505=((((5243144)|0)+($shl504<<2))|0);
      var $351=$arrayidx505;
      var $352=$351;
      $B503=$352;
      var $353=$B503;
      $F506=$353;
      var $354=HEAP32[((((5243104)|0))>>2)];
      var $355=$I501;
      var $shl507=1 << $355;
      var $and508=$354 & $shl507;
      var $tobool509=(($and508)|(0))!=0;
      if ($tobool509) { label = 176; break; } else { label = 175; break; }
    case 175: 
      var $356=$I501;
      var $shl511=1 << $356;
      var $357=HEAP32[((((5243104)|0))>>2)];
      var $or512=$357 | $shl511;
      HEAP32[((((5243104)|0))>>2)]=$or512;
      label = 180; break;
    case 176: 
      var $358=$B503;
      var $fd514=(($358+8)|0);
      var $359=HEAP32[(($fd514)>>2)];
      var $360=$359;
      var $361=HEAP32[((((5243120)|0))>>2)];
      var $cmp515=(($360)>>>(0)) >= (($361)>>>(0));
      var $conv516=(($cmp515)&(1));
      var $expval517=($conv516);
      var $tobool518=(($expval517)|(0))!=0;
      if ($tobool518) { label = 177; break; } else { label = 178; break; }
    case 177: 
      var $362=$B503;
      var $fd520=(($362+8)|0);
      var $363=HEAP32[(($fd520)>>2)];
      $F506=$363;
      label = 179; break;
    case 178: 
      _abort();
      throw "Reached an unreachable!"
    case 179: 
      label = 180; break;
    case 180: 
      var $364=$p;
      var $365=$B503;
      var $fd524=(($365+8)|0);
      HEAP32[(($fd524)>>2)]=$364;
      var $366=$p;
      var $367=$F506;
      var $bk525=(($367+12)|0);
      HEAP32[(($bk525)>>2)]=$366;
      var $368=$F506;
      var $369=$p;
      var $fd526=(($369+8)|0);
      HEAP32[(($fd526)>>2)]=$368;
      var $370=$B503;
      var $371=$p;
      var $bk527=(($371+12)|0);
      HEAP32[(($bk527)>>2)]=$370;
      label = 210; break;
    case 181: 
      var $372=$p;
      var $373=$372;
      $tp=$373;
      var $374=$psize;
      var $shr531=$374 >>> 8;
      $X=$shr531;
      var $375=$X;
      var $cmp532=(($375)|(0))==0;
      if ($cmp532) { label = 182; break; } else { label = 183; break; }
    case 182: 
      $I530=0;
      label = 187; break;
    case 183: 
      var $376=$X;
      var $cmp536=(($376)>>>(0)) > 65535;
      if ($cmp536) { label = 184; break; } else { label = 185; break; }
    case 184: 
      $I530=31;
      label = 186; break;
    case 185: 
      var $377=$X;
      $Y=$377;
      var $378=$Y;
      var $sub=((($378)-(256))|0);
      var $shr540=$sub >>> 16;
      var $and541=$shr540 & 8;
      $N=$and541;
      var $379=$N;
      var $380=$Y;
      var $shl542=$380 << $379;
      $Y=$shl542;
      var $sub543=((($shl542)-(4096))|0);
      var $shr544=$sub543 >>> 16;
      var $and545=$shr544 & 4;
      $K=$and545;
      var $381=$K;
      var $382=$N;
      var $add546=((($382)+($381))|0);
      $N=$add546;
      var $383=$K;
      var $384=$Y;
      var $shl547=$384 << $383;
      $Y=$shl547;
      var $sub548=((($shl547)-(16384))|0);
      var $shr549=$sub548 >>> 16;
      var $and550=$shr549 & 2;
      $K=$and550;
      var $385=$N;
      var $add551=((($385)+($and550))|0);
      $N=$add551;
      var $386=$N;
      var $sub552=(((14)-($386))|0);
      var $387=$K;
      var $388=$Y;
      var $shl553=$388 << $387;
      $Y=$shl553;
      var $shr554=$shl553 >>> 15;
      var $add555=((($sub552)+($shr554))|0);
      $K=$add555;
      var $389=$K;
      var $shl556=$389 << 1;
      var $390=$psize;
      var $391=$K;
      var $add557=((($391)+(7))|0);
      var $shr558=$390 >>> (($add557)>>>(0));
      var $and559=$shr558 & 1;
      var $add560=((($shl556)+($and559))|0);
      $I530=$add560;
      label = 186; break;
    case 186: 
      label = 187; break;
    case 187: 
      var $392=$I530;
      var $arrayidx563=((((5243408)|0)+($392<<2))|0);
      $H529=$arrayidx563;
      var $393=$I530;
      var $394=$tp;
      var $index564=(($394+28)|0);
      HEAP32[(($index564)>>2)]=$393;
      var $395=$tp;
      var $child565=(($395+16)|0);
      var $arrayidx566=(($child565+4)|0);
      HEAP32[(($arrayidx566)>>2)]=0;
      var $396=$tp;
      var $child567=(($396+16)|0);
      var $arrayidx568=(($child567)|0);
      HEAP32[(($arrayidx568)>>2)]=0;
      var $397=HEAP32[((((5243108)|0))>>2)];
      var $398=$I530;
      var $shl569=1 << $398;
      var $and570=$397 & $shl569;
      var $tobool571=(($and570)|(0))!=0;
      if ($tobool571) { label = 189; break; } else { label = 188; break; }
    case 188: 
      var $399=$I530;
      var $shl573=1 << $399;
      var $400=HEAP32[((((5243108)|0))>>2)];
      var $or574=$400 | $shl573;
      HEAP32[((((5243108)|0))>>2)]=$or574;
      var $401=$tp;
      var $402=$H529;
      HEAP32[(($402)>>2)]=$401;
      var $403=$H529;
      var $404=$403;
      var $405=$tp;
      var $parent575=(($405+24)|0);
      HEAP32[(($parent575)>>2)]=$404;
      var $406=$tp;
      var $407=$tp;
      var $bk576=(($407+12)|0);
      HEAP32[(($bk576)>>2)]=$406;
      var $408=$tp;
      var $fd577=(($408+8)|0);
      HEAP32[(($fd577)>>2)]=$406;
      label = 207; break;
    case 189: 
      var $409=$H529;
      var $410=HEAP32[(($409)>>2)];
      $T=$410;
      var $411=$psize;
      var $412=$I530;
      var $cmp580=(($412)|(0))==31;
      if ($cmp580) { label = 190; break; } else { label = 191; break; }
    case 190: 
      var $cond = 0;label = 192; break;
    case 191: 
      var $413=$I530;
      var $shr582=$413 >>> 1;
      var $add583=((($shr582)+(8))|0);
      var $sub584=((($add583)-(2))|0);
      var $sub585=(((31)-($sub584))|0);
      var $cond = $sub585;label = 192; break;
    case 192: 
      var $cond;
      var $shl586=$411 << $cond;
      $K579=$shl586;
      label = 193; break;
    case 193: 
      var $414=$T;
      var $head587=(($414+4)|0);
      var $415=HEAP32[(($head587)>>2)];
      var $and588=$415 & -8;
      var $416=$psize;
      var $cmp589=(($and588)|(0))!=(($416)|(0));
      if ($cmp589) { label = 194; break; } else { label = 200; break; }
    case 194: 
      var $417=$K579;
      var $shr592=$417 >>> 31;
      var $and593=$shr592 & 1;
      var $418=$T;
      var $child594=(($418+16)|0);
      var $arrayidx595=(($child594+($and593<<2))|0);
      $C=$arrayidx595;
      var $419=$K579;
      var $shl596=$419 << 1;
      $K579=$shl596;
      var $420=$C;
      var $421=HEAP32[(($420)>>2)];
      var $cmp597=(($421)|(0))!=0;
      if ($cmp597) { label = 195; break; } else { label = 196; break; }
    case 195: 
      var $422=$C;
      var $423=HEAP32[(($422)>>2)];
      $T=$423;
      label = 199; break;
    case 196: 
      var $424=$C;
      var $425=$424;
      var $426=HEAP32[((((5243120)|0))>>2)];
      var $cmp601=(($425)>>>(0)) >= (($426)>>>(0));
      var $conv602=(($cmp601)&(1));
      var $expval603=($conv602);
      var $tobool604=(($expval603)|(0))!=0;
      if ($tobool604) { label = 197; break; } else { label = 198; break; }
    case 197: 
      var $427=$tp;
      var $428=$C;
      HEAP32[(($428)>>2)]=$427;
      var $429=$T;
      var $430=$tp;
      var $parent606=(($430+24)|0);
      HEAP32[(($parent606)>>2)]=$429;
      var $431=$tp;
      var $432=$tp;
      var $bk607=(($432+12)|0);
      HEAP32[(($bk607)>>2)]=$431;
      var $433=$tp;
      var $fd608=(($433+8)|0);
      HEAP32[(($fd608)>>2)]=$431;
      label = 206; break;
    case 198: 
      _abort();
      throw "Reached an unreachable!"
    case 199: 
      label = 205; break;
    case 200: 
      var $434=$T;
      var $fd613=(($434+8)|0);
      var $435=HEAP32[(($fd613)>>2)];
      $F612=$435;
      var $436=$T;
      var $437=$436;
      var $438=HEAP32[((((5243120)|0))>>2)];
      var $cmp614=(($437)>>>(0)) >= (($438)>>>(0));
      if ($cmp614) { label = 201; break; } else { var $442 = 0;label = 202; break; }
    case 201: 
      var $439=$F612;
      var $440=$439;
      var $441=HEAP32[((((5243120)|0))>>2)];
      var $cmp617=(($440)>>>(0)) >= (($441)>>>(0));
      var $442 = $cmp617;label = 202; break;
    case 202: 
      var $442;
      var $land_ext620=(($442)&(1));
      var $expval621=($land_ext620);
      var $tobool622=(($expval621)|(0))!=0;
      if ($tobool622) { label = 203; break; } else { label = 204; break; }
    case 203: 
      var $443=$tp;
      var $444=$F612;
      var $bk624=(($444+12)|0);
      HEAP32[(($bk624)>>2)]=$443;
      var $445=$T;
      var $fd625=(($445+8)|0);
      HEAP32[(($fd625)>>2)]=$443;
      var $446=$F612;
      var $447=$tp;
      var $fd626=(($447+8)|0);
      HEAP32[(($fd626)>>2)]=$446;
      var $448=$T;
      var $449=$tp;
      var $bk627=(($449+12)|0);
      HEAP32[(($bk627)>>2)]=$448;
      var $450=$tp;
      var $parent628=(($450+24)|0);
      HEAP32[(($parent628)>>2)]=0;
      label = 206; break;
    case 204: 
      _abort();
      throw "Reached an unreachable!"
    case 205: 
      label = 193; break;
    case 206: 
      label = 207; break;
    case 207: 
      var $451=HEAP32[((((5243136)|0))>>2)];
      var $dec=((($451)-(1))|0);
      HEAP32[((((5243136)|0))>>2)]=$dec;
      var $cmp632=(($dec)|(0))==0;
      if ($cmp632) { label = 208; break; } else { label = 209; break; }
    case 208: 
      var $call635=_release_unused_segments(5243104);
      label = 209; break;
    case 209: 
      label = 210; break;
    case 210: 
      label = 214; break;
    case 211: 
      label = 212; break;
    case 212: 
      label = 213; break;
    case 213: 
      _abort();
      throw "Reached an unreachable!"
    case 214: 
      label = 215; break;
    case 215: 

      return;
    default: assert(0, "bad label: " + label);
  }

}


function _sys_trim($m, $pad) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $pad_addr;
      var $released;
      var $unit;
      var $extra;
      var $sp;
      var $old_br;
      var $rel_br;
      var $new_br;
      $m_addr=$m;
      $pad_addr=$pad;
      $released=0;
      var $0=HEAP32[((((5242880)|0))>>2)];
      var $cmp=(($0)|(0))!=0;
      if ($cmp) { var $1 = 1;label = 4; break; } else { label = 3; break; }
    case 3: 
      var $call=_init_mparams();
      var $tobool=(($call)|(0))!=0;
      var $1 = $tobool;label = 4; break;
    case 4: 
      var $1;
      var $lor_ext=(($1)&(1));
      var $2=$pad_addr;
      var $cmp1=(($2)>>>(0)) < 4294967232;
      if ($cmp1) { label = 5; break; } else { label = 26; break; }
    case 5: 
      var $3=$m_addr;
      var $top=(($3+24)|0);
      var $4=HEAP32[(($top)>>2)];
      var $cmp2=(($4)|(0))!=0;
      if ($cmp2) { label = 6; break; } else { label = 26; break; }
    case 6: 
      var $5=$pad_addr;
      var $add=((($5)+(40))|0);
      $pad_addr=$add;
      var $6=$m_addr;
      var $topsize=(($6+12)|0);
      var $7=HEAP32[(($topsize)>>2)];
      var $8=$pad_addr;
      var $cmp3=(($7)>>>(0)) > (($8)>>>(0));
      if ($cmp3) { label = 7; break; } else { label = 22; break; }
    case 7: 
      var $9=HEAP32[((((5242888)|0))>>2)];
      $unit=$9;
      var $10=$m_addr;
      var $topsize5=(($10+12)|0);
      var $11=HEAP32[(($topsize5)>>2)];
      var $12=$pad_addr;
      var $sub=((($11)-($12))|0);
      var $13=$unit;
      var $sub6=((($13)-(1))|0);
      var $add7=((($sub)+($sub6))|0);
      var $14=$unit;
      var $div=Math.floor(((($add7)>>>(0)))/((($14)>>>(0))));
      var $sub8=((($div)-(1))|0);
      var $15=$unit;
      var $mul=Math.imul($sub8,$15);
      $extra=$mul;
      var $16=$m_addr;
      var $17=$m_addr;
      var $top9=(($17+24)|0);
      var $18=HEAP32[(($top9)>>2)];
      var $19=$18;
      var $call10=_segment_holding($16, $19);
      $sp=$call10;
      var $20=$sp;
      var $sflags=(($20+12)|0);
      var $21=HEAP32[(($sflags)>>2)];
      var $and=$21 & 8;
      var $tobool11=(($and)|(0))!=0;
      if ($tobool11) { label = 19; break; } else { label = 8; break; }
    case 8: 
      var $22=$sp;
      var $sflags13=(($22+12)|0);
      var $23=HEAP32[(($sflags13)>>2)];
      var $and14=$23 & 0;
      var $tobool15=(($and14)|(0))!=0;
      if ($tobool15) { label = 9; break; } else { label = 10; break; }
    case 9: 
      label = 18; break;
    case 10: 
      var $24=$extra;
      var $cmp17=(($24)>>>(0)) >= 2147483647;
      if ($cmp17) { label = 11; break; } else { label = 12; break; }
    case 11: 
      var $25=$unit;
      var $sub19=(((-2147483648)-($25))|0);
      $extra=$sub19;
      label = 12; break;
    case 12: 
      var $call20=_sbrk(0);
      $old_br=$call20;
      var $26=$old_br;
      var $27=$sp;
      var $base=(($27)|0);
      var $28=HEAP32[(($base)>>2)];
      var $29=$sp;
      var $size=(($29+4)|0);
      var $30=HEAP32[(($size)>>2)];
      var $add_ptr=(($28+$30)|0);
      var $cmp21=(($26)|(0))==(($add_ptr)|(0));
      if ($cmp21) { label = 13; break; } else { label = 17; break; }
    case 13: 
      var $31=$extra;
      var $sub23=(((-$31))|0);
      var $call24=_sbrk($sub23);
      $rel_br=$call24;
      var $call25=_sbrk(0);
      $new_br=$call25;
      var $32=$rel_br;
      var $cmp26=(($32)|(0))!=-1;
      if ($cmp26) { label = 14; break; } else { label = 16; break; }
    case 14: 
      var $33=$new_br;
      var $34=$old_br;
      var $cmp28=(($33)>>>(0)) < (($34)>>>(0));
      if ($cmp28) { label = 15; break; } else { label = 16; break; }
    case 15: 
      var $35=$old_br;
      var $36=$new_br;
      var $sub_ptr_lhs_cast=$35;
      var $sub_ptr_rhs_cast=$36;
      var $sub_ptr_sub=((($sub_ptr_lhs_cast)-($sub_ptr_rhs_cast))|0);
      $released=$sub_ptr_sub;
      label = 16; break;
    case 16: 
      label = 17; break;
    case 17: 
      label = 18; break;
    case 18: 
      label = 19; break;
    case 19: 
      var $37=$released;
      var $cmp34=(($37)|(0))!=0;
      if ($cmp34) { label = 20; break; } else { label = 21; break; }
    case 20: 
      var $38=$released;
      var $39=$sp;
      var $size36=(($39+4)|0);
      var $40=HEAP32[(($size36)>>2)];
      var $sub37=((($40)-($38))|0);
      HEAP32[(($size36)>>2)]=$sub37;
      var $41=$released;
      var $42=$m_addr;
      var $footprint=(($42+432)|0);
      var $43=HEAP32[(($footprint)>>2)];
      var $sub38=((($43)-($41))|0);
      HEAP32[(($footprint)>>2)]=$sub38;
      var $44=$m_addr;
      var $45=$m_addr;
      var $top39=(($45+24)|0);
      var $46=HEAP32[(($top39)>>2)];
      var $47=$m_addr;
      var $topsize40=(($47+12)|0);
      var $48=HEAP32[(($topsize40)>>2)];
      var $49=$released;
      var $sub41=((($48)-($49))|0);
      _init_top($44, $46, $sub41);
      label = 21; break;
    case 21: 
      label = 22; break;
    case 22: 
      var $50=$released;
      var $cmp44=(($50)|(0))==0;
      if ($cmp44) { label = 23; break; } else { label = 25; break; }
    case 23: 
      var $51=$m_addr;
      var $topsize46=(($51+12)|0);
      var $52=HEAP32[(($topsize46)>>2)];
      var $53=$m_addr;
      var $trim_check=(($53+28)|0);
      var $54=HEAP32[(($trim_check)>>2)];
      var $cmp47=(($52)>>>(0)) > (($54)>>>(0));
      if ($cmp47) { label = 24; break; } else { label = 25; break; }
    case 24: 
      var $55=$m_addr;
      var $trim_check49=(($55+28)|0);
      HEAP32[(($trim_check49)>>2)]=-1;
      label = 25; break;
    case 25: 
      label = 26; break;
    case 26: 
      var $56=$released;
      var $cmp52=(($56)|(0))!=0;
      var $cond=$cmp52 ? 1 : 0;

      return $cond;
    default: assert(0, "bad label: " + label);
  }

}


function _calloc($n_elements, $elem_size) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $n_elements_addr;
      var $elem_size_addr;
      var $mem;
      var $req;
      $n_elements_addr=$n_elements;
      $elem_size_addr=$elem_size;
      $req=0;
      var $0=$n_elements_addr;
      var $cmp=(($0)|(0))!=0;
      if ($cmp) { label = 3; break; } else { label = 7; break; }
    case 3: 
      var $1=$n_elements_addr;
      var $2=$elem_size_addr;
      var $mul=Math.imul($1,$2);
      $req=$mul;
      var $3=$n_elements_addr;
      var $4=$elem_size_addr;
      var $or=$3 | $4;
      var $and=$or & -65536;
      var $tobool=(($and)|(0))!=0;
      if ($tobool) { label = 4; break; } else { label = 6; break; }
    case 4: 
      var $5=$req;
      var $6=$n_elements_addr;
      var $div=Math.floor(((($5)>>>(0)))/((($6)>>>(0))));
      var $7=$elem_size_addr;
      var $cmp1=(($div)|(0))!=(($7)|(0));
      if ($cmp1) { label = 5; break; } else { label = 6; break; }
    case 5: 
      $req=-1;
      label = 6; break;
    case 6: 
      label = 7; break;
    case 7: 
      var $8=$req;
      var $call=_malloc($8);
      $mem=$call;
      var $9=$mem;
      var $cmp4=(($9)|(0))!=0;
      if ($cmp4) { label = 8; break; } else { label = 10; break; }
    case 8: 
      var $10=$mem;
      var $add_ptr=((($10)-(8))|0);
      var $11=$add_ptr;
      var $head=(($11+4)|0);
      var $12=HEAP32[(($head)>>2)];
      var $and6=$12 & 3;
      var $cmp7=(($and6)|(0))==0;
      if ($cmp7) { label = 10; break; } else { label = 9; break; }
    case 9: 
      var $13=$mem;
      var $14=$req;
      _memset($13, 0, $14);
      label = 10; break;
    case 10: 
      var $15=$mem;

      return $15;
    default: assert(0, "bad label: " + label);
  }

}
Module["_calloc"] = _calloc;

function _release_unused_segments($m) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $released;
      var $nsegs;
      var $pred;
      var $sp;
      var $base;
      var $size;
      var $next3;
      var $p;
      var $psize;
      var $tp;
      var $XP;
      var $R;
      var $F;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $H147;
      var $I;
      var $X;
      var $Y;
      var $N;
      var $K;
      var $T;
      var $K197;
      var $C;
      var $F235;
      $m_addr=$m;
      $released=0;
      $nsegs=0;
      var $0=$m_addr;
      var $seg=(($0+448)|0);
      $pred=$seg;
      var $1=$pred;
      var $next=(($1+8)|0);
      var $2=HEAP32[(($next)>>2)];
      $sp=$2;
      label = 3; break;
    case 3: 
      var $3=$sp;
      var $cmp=(($3)|(0))!=0;
      if ($cmp) { label = 4; break; } else { label = 91; break; }
    case 4: 
      var $4=$sp;
      var $base1=(($4)|0);
      var $5=HEAP32[(($base1)>>2)];
      $base=$5;
      var $6=$sp;
      var $size2=(($6+4)|0);
      var $7=HEAP32[(($size2)>>2)];
      $size=$7;
      var $8=$sp;
      var $next4=(($8+8)|0);
      var $9=HEAP32[(($next4)>>2)];
      $next3=$9;
      var $10=$nsegs;
      var $inc=((($10)+(1))|0);
      $nsegs=$inc;
      var $11=$sp;
      var $sflags=(($11+12)|0);
      var $12=HEAP32[(($sflags)>>2)];
      var $and=$12 & 0;
      var $tobool=(($and)|(0))!=0;
      if ($tobool) { label = 5; break; } else { label = 90; break; }
    case 5: 
      var $13=$sp;
      var $sflags5=(($13+12)|0);
      var $14=HEAP32[(($sflags5)>>2)];
      var $and6=$14 & 8;
      var $tobool7=(($and6)|(0))!=0;
      if ($tobool7) { label = 90; break; } else { label = 6; break; }
    case 6: 
      var $15=$base;
      var $16=$base;
      var $add_ptr=(($16+8)|0);
      var $17=$add_ptr;
      var $and8=$17 & 7;
      var $cmp9=(($and8)|(0))==0;
      if ($cmp9) { label = 7; break; } else { label = 8; break; }
    case 7: 
      var $cond = 0;label = 9; break;
    case 8: 
      var $18=$base;
      var $add_ptr10=(($18+8)|0);
      var $19=$add_ptr10;
      var $and11=$19 & 7;
      var $sub=(((8)-($and11))|0);
      var $and12=$sub & 7;
      var $cond = $and12;label = 9; break;
    case 9: 
      var $cond;
      var $add_ptr13=(($15+$cond)|0);
      var $20=$add_ptr13;
      $p=$20;
      var $21=$p;
      var $head=(($21+4)|0);
      var $22=HEAP32[(($head)>>2)];
      var $and14=$22 & -8;
      $psize=$and14;
      var $23=$p;
      var $head15=(($23+4)|0);
      var $24=HEAP32[(($head15)>>2)];
      var $and16=$24 & 3;
      var $cmp17=(($and16)|(0))!=1;
      if ($cmp17) { label = 89; break; } else { label = 10; break; }
    case 10: 
      var $25=$p;
      var $26=$25;
      var $27=$psize;
      var $add_ptr19=(($26+$27)|0);
      var $28=$base;
      var $29=$size;
      var $add_ptr20=(($28+$29)|0);
      var $add_ptr21=((($add_ptr20)-(40))|0);
      var $cmp22=(($add_ptr19)>>>(0)) >= (($add_ptr21)>>>(0));
      if ($cmp22) { label = 11; break; } else { label = 89; break; }
    case 11: 
      var $30=$p;
      var $31=$30;
      $tp=$31;
      var $32=$p;
      var $33=$m_addr;
      var $dv=(($33+20)|0);
      var $34=HEAP32[(($dv)>>2)];
      var $cmp24=(($32)|(0))==(($34)|(0));
      if ($cmp24) { label = 12; break; } else { label = 13; break; }
    case 12: 
      var $35=$m_addr;
      var $dv26=(($35+20)|0);
      HEAP32[(($dv26)>>2)]=0;
      var $36=$m_addr;
      var $dvsize=(($36+8)|0);
      HEAP32[(($dvsize)>>2)]=0;
      label = 62; break;
    case 13: 
      var $37=$tp;
      var $parent=(($37+24)|0);
      var $38=HEAP32[(($parent)>>2)];
      $XP=$38;
      var $39=$tp;
      var $bk=(($39+12)|0);
      var $40=HEAP32[(($bk)>>2)];
      var $41=$tp;
      var $cmp27=(($40)|(0))!=(($41)|(0));
      if ($cmp27) { label = 14; break; } else { label = 21; break; }
    case 14: 
      var $42=$tp;
      var $fd=(($42+8)|0);
      var $43=HEAP32[(($fd)>>2)];
      $F=$43;
      var $44=$tp;
      var $bk29=(($44+12)|0);
      var $45=HEAP32[(($bk29)>>2)];
      $R=$45;
      var $46=$F;
      var $47=$46;
      var $48=$m_addr;
      var $least_addr=(($48+16)|0);
      var $49=HEAP32[(($least_addr)>>2)];
      var $cmp30=(($47)>>>(0)) >= (($49)>>>(0));
      if ($cmp30) { label = 15; break; } else { var $56 = 0;label = 17; break; }
    case 15: 
      var $50=$F;
      var $bk32=(($50+12)|0);
      var $51=HEAP32[(($bk32)>>2)];
      var $52=$tp;
      var $cmp33=(($51)|(0))==(($52)|(0));
      if ($cmp33) { label = 16; break; } else { var $56 = 0;label = 17; break; }
    case 16: 
      var $53=$R;
      var $fd34=(($53+8)|0);
      var $54=HEAP32[(($fd34)>>2)];
      var $55=$tp;
      var $cmp35=(($54)|(0))==(($55)|(0));
      var $56 = $cmp35;label = 17; break;
    case 17: 
      var $56;
      var $land_ext=(($56)&(1));
      var $expval=($land_ext);
      var $tobool36=(($expval)|(0))!=0;
      if ($tobool36) { label = 18; break; } else { label = 19; break; }
    case 18: 
      var $57=$R;
      var $58=$F;
      var $bk38=(($58+12)|0);
      HEAP32[(($bk38)>>2)]=$57;
      var $59=$F;
      var $60=$R;
      var $fd39=(($60+8)|0);
      HEAP32[(($fd39)>>2)]=$59;
      label = 20; break;
    case 19: 
      _abort();
      throw "Reached an unreachable!"
    case 20: 
      label = 33; break;
    case 21: 
      var $61=$tp;
      var $child=(($61+16)|0);
      var $arrayidx=(($child+4)|0);
      $RP=$arrayidx;
      var $62=HEAP32[(($arrayidx)>>2)];
      $R=$62;
      var $cmp42=(($62)|(0))!=0;
      if ($cmp42) { label = 23; break; } else { label = 22; break; }
    case 22: 
      var $63=$tp;
      var $child43=(($63+16)|0);
      var $arrayidx44=(($child43)|0);
      $RP=$arrayidx44;
      var $64=HEAP32[(($arrayidx44)>>2)];
      $R=$64;
      var $cmp45=(($64)|(0))!=0;
      if ($cmp45) { label = 23; break; } else { label = 32; break; }
    case 23: 
      label = 24; break;
    case 24: 
      var $65=$R;
      var $child48=(($65+16)|0);
      var $arrayidx49=(($child48+4)|0);
      $CP=$arrayidx49;
      var $66=HEAP32[(($arrayidx49)>>2)];
      var $cmp50=(($66)|(0))!=0;
      if ($cmp50) { var $69 = 1;label = 26; break; } else { label = 25; break; }
    case 25: 
      var $67=$R;
      var $child51=(($67+16)|0);
      var $arrayidx52=(($child51)|0);
      $CP=$arrayidx52;
      var $68=HEAP32[(($arrayidx52)>>2)];
      var $cmp53=(($68)|(0))!=0;
      var $69 = $cmp53;label = 26; break;
    case 26: 
      var $69;
      if ($69) { label = 27; break; } else { label = 28; break; }
    case 27: 
      var $70=$CP;
      $RP=$70;
      var $71=HEAP32[(($70)>>2)];
      $R=$71;
      label = 24; break;
    case 28: 
      var $72=$RP;
      var $73=$72;
      var $74=$m_addr;
      var $least_addr55=(($74+16)|0);
      var $75=HEAP32[(($least_addr55)>>2)];
      var $cmp56=(($73)>>>(0)) >= (($75)>>>(0));
      var $conv=(($cmp56)&(1));
      var $expval57=($conv);
      var $tobool58=(($expval57)|(0))!=0;
      if ($tobool58) { label = 29; break; } else { label = 30; break; }
    case 29: 
      var $76=$RP;
      HEAP32[(($76)>>2)]=0;
      label = 31; break;
    case 30: 
      _abort();
      throw "Reached an unreachable!"
    case 31: 
      label = 32; break;
    case 32: 
      label = 33; break;
    case 33: 
      var $77=$XP;
      var $cmp64=(($77)|(0))!=0;
      if ($cmp64) { label = 34; break; } else { label = 61; break; }
    case 34: 
      var $78=$tp;
      var $index=(($78+28)|0);
      var $79=HEAP32[(($index)>>2)];
      var $80=$m_addr;
      var $treebins=(($80+304)|0);
      var $arrayidx67=(($treebins+($79<<2))|0);
      $H=$arrayidx67;
      var $81=$tp;
      var $82=$H;
      var $83=HEAP32[(($82)>>2)];
      var $cmp68=(($81)|(0))==(($83)|(0));
      if ($cmp68) { label = 35; break; } else { label = 38; break; }
    case 35: 
      var $84=$R;
      var $85=$H;
      HEAP32[(($85)>>2)]=$84;
      var $cmp71=(($84)|(0))==0;
      if ($cmp71) { label = 36; break; } else { label = 37; break; }
    case 36: 
      var $86=$tp;
      var $index74=(($86+28)|0);
      var $87=HEAP32[(($index74)>>2)];
      var $shl=1 << $87;
      var $neg=$shl ^ -1;
      var $88=$m_addr;
      var $treemap=(($88+4)|0);
      var $89=HEAP32[(($treemap)>>2)];
      var $and75=$89 & $neg;
      HEAP32[(($treemap)>>2)]=$and75;
      label = 37; break;
    case 37: 
      label = 45; break;
    case 38: 
      var $90=$XP;
      var $91=$90;
      var $92=$m_addr;
      var $least_addr78=(($92+16)|0);
      var $93=HEAP32[(($least_addr78)>>2)];
      var $cmp79=(($91)>>>(0)) >= (($93)>>>(0));
      var $conv80=(($cmp79)&(1));
      var $expval81=($conv80);
      var $tobool82=(($expval81)|(0))!=0;
      if ($tobool82) { label = 39; break; } else { label = 43; break; }
    case 39: 
      var $94=$XP;
      var $child84=(($94+16)|0);
      var $arrayidx85=(($child84)|0);
      var $95=HEAP32[(($arrayidx85)>>2)];
      var $96=$tp;
      var $cmp86=(($95)|(0))==(($96)|(0));
      if ($cmp86) { label = 40; break; } else { label = 41; break; }
    case 40: 
      var $97=$R;
      var $98=$XP;
      var $child89=(($98+16)|0);
      var $arrayidx90=(($child89)|0);
      HEAP32[(($arrayidx90)>>2)]=$97;
      label = 42; break;
    case 41: 
      var $99=$R;
      var $100=$XP;
      var $child92=(($100+16)|0);
      var $arrayidx93=(($child92+4)|0);
      HEAP32[(($arrayidx93)>>2)]=$99;
      label = 42; break;
    case 42: 
      label = 44; break;
    case 43: 
      _abort();
      throw "Reached an unreachable!"
    case 44: 
      label = 45; break;
    case 45: 
      var $101=$R;
      var $cmp98=(($101)|(0))!=0;
      if ($cmp98) { label = 46; break; } else { label = 60; break; }
    case 46: 
      var $102=$R;
      var $103=$102;
      var $104=$m_addr;
      var $least_addr101=(($104+16)|0);
      var $105=HEAP32[(($least_addr101)>>2)];
      var $cmp102=(($103)>>>(0)) >= (($105)>>>(0));
      var $conv103=(($cmp102)&(1));
      var $expval104=($conv103);
      var $tobool105=(($expval104)|(0))!=0;
      if ($tobool105) { label = 47; break; } else { label = 58; break; }
    case 47: 
      var $106=$XP;
      var $107=$R;
      var $parent107=(($107+24)|0);
      HEAP32[(($parent107)>>2)]=$106;
      var $108=$tp;
      var $child108=(($108+16)|0);
      var $arrayidx109=(($child108)|0);
      var $109=HEAP32[(($arrayidx109)>>2)];
      $C0=$109;
      var $cmp110=(($109)|(0))!=0;
      if ($cmp110) { label = 48; break; } else { label = 52; break; }
    case 48: 
      var $110=$C0;
      var $111=$110;
      var $112=$m_addr;
      var $least_addr113=(($112+16)|0);
      var $113=HEAP32[(($least_addr113)>>2)];
      var $cmp114=(($111)>>>(0)) >= (($113)>>>(0));
      var $conv115=(($cmp114)&(1));
      var $expval116=($conv115);
      var $tobool117=(($expval116)|(0))!=0;
      if ($tobool117) { label = 49; break; } else { label = 50; break; }
    case 49: 
      var $114=$C0;
      var $115=$R;
      var $child119=(($115+16)|0);
      var $arrayidx120=(($child119)|0);
      HEAP32[(($arrayidx120)>>2)]=$114;
      var $116=$R;
      var $117=$C0;
      var $parent121=(($117+24)|0);
      HEAP32[(($parent121)>>2)]=$116;
      label = 51; break;
    case 50: 
      _abort();
      throw "Reached an unreachable!"
    case 51: 
      label = 52; break;
    case 52: 
      var $118=$tp;
      var $child125=(($118+16)|0);
      var $arrayidx126=(($child125+4)|0);
      var $119=HEAP32[(($arrayidx126)>>2)];
      $C1=$119;
      var $cmp127=(($119)|(0))!=0;
      if ($cmp127) { label = 53; break; } else { label = 57; break; }
    case 53: 
      var $120=$C1;
      var $121=$120;
      var $122=$m_addr;
      var $least_addr130=(($122+16)|0);
      var $123=HEAP32[(($least_addr130)>>2)];
      var $cmp131=(($121)>>>(0)) >= (($123)>>>(0));
      var $conv132=(($cmp131)&(1));
      var $expval133=($conv132);
      var $tobool134=(($expval133)|(0))!=0;
      if ($tobool134) { label = 54; break; } else { label = 55; break; }
    case 54: 
      var $124=$C1;
      var $125=$R;
      var $child136=(($125+16)|0);
      var $arrayidx137=(($child136+4)|0);
      HEAP32[(($arrayidx137)>>2)]=$124;
      var $126=$R;
      var $127=$C1;
      var $parent138=(($127+24)|0);
      HEAP32[(($parent138)>>2)]=$126;
      label = 56; break;
    case 55: 
      _abort();
      throw "Reached an unreachable!"
    case 56: 
      label = 57; break;
    case 57: 
      label = 59; break;
    case 58: 
      _abort();
      throw "Reached an unreachable!"
    case 59: 
      label = 60; break;
    case 60: 
      label = 61; break;
    case 61: 
      label = 62; break;
    case 62: 
      var $128=$psize;
      var $shr=$128 >>> 8;
      $X=$shr;
      var $129=$X;
      var $cmp148=(($129)|(0))==0;
      if ($cmp148) { label = 63; break; } else { label = 64; break; }
    case 63: 
      $I=0;
      label = 68; break;
    case 64: 
      var $130=$X;
      var $cmp152=(($130)>>>(0)) > 65535;
      if ($cmp152) { label = 65; break; } else { label = 66; break; }
    case 65: 
      $I=31;
      label = 67; break;
    case 66: 
      var $131=$X;
      $Y=$131;
      var $132=$Y;
      var $sub156=((($132)-(256))|0);
      var $shr157=$sub156 >>> 16;
      var $and158=$shr157 & 8;
      $N=$and158;
      var $133=$N;
      var $134=$Y;
      var $shl159=$134 << $133;
      $Y=$shl159;
      var $sub160=((($shl159)-(4096))|0);
      var $shr161=$sub160 >>> 16;
      var $and162=$shr161 & 4;
      $K=$and162;
      var $135=$K;
      var $136=$N;
      var $add=((($136)+($135))|0);
      $N=$add;
      var $137=$K;
      var $138=$Y;
      var $shl163=$138 << $137;
      $Y=$shl163;
      var $sub164=((($shl163)-(16384))|0);
      var $shr165=$sub164 >>> 16;
      var $and166=$shr165 & 2;
      $K=$and166;
      var $139=$N;
      var $add167=((($139)+($and166))|0);
      $N=$add167;
      var $140=$N;
      var $sub168=(((14)-($140))|0);
      var $141=$K;
      var $142=$Y;
      var $shl169=$142 << $141;
      $Y=$shl169;
      var $shr170=$shl169 >>> 15;
      var $add171=((($sub168)+($shr170))|0);
      $K=$add171;
      var $143=$K;
      var $shl172=$143 << 1;
      var $144=$psize;
      var $145=$K;
      var $add173=((($145)+(7))|0);
      var $shr174=$144 >>> (($add173)>>>(0));
      var $and175=$shr174 & 1;
      var $add176=((($shl172)+($and175))|0);
      $I=$add176;
      label = 67; break;
    case 67: 
      label = 68; break;
    case 68: 
      var $146=$I;
      var $147=$m_addr;
      var $treebins179=(($147+304)|0);
      var $arrayidx180=(($treebins179+($146<<2))|0);
      $H147=$arrayidx180;
      var $148=$I;
      var $149=$tp;
      var $index181=(($149+28)|0);
      HEAP32[(($index181)>>2)]=$148;
      var $150=$tp;
      var $child182=(($150+16)|0);
      var $arrayidx183=(($child182+4)|0);
      HEAP32[(($arrayidx183)>>2)]=0;
      var $151=$tp;
      var $child184=(($151+16)|0);
      var $arrayidx185=(($child184)|0);
      HEAP32[(($arrayidx185)>>2)]=0;
      var $152=$m_addr;
      var $treemap186=(($152+4)|0);
      var $153=HEAP32[(($treemap186)>>2)];
      var $154=$I;
      var $shl187=1 << $154;
      var $and188=$153 & $shl187;
      var $tobool189=(($and188)|(0))!=0;
      if ($tobool189) { label = 70; break; } else { label = 69; break; }
    case 69: 
      var $155=$I;
      var $shl191=1 << $155;
      var $156=$m_addr;
      var $treemap192=(($156+4)|0);
      var $157=HEAP32[(($treemap192)>>2)];
      var $or=$157 | $shl191;
      HEAP32[(($treemap192)>>2)]=$or;
      var $158=$tp;
      var $159=$H147;
      HEAP32[(($159)>>2)]=$158;
      var $160=$H147;
      var $161=$160;
      var $162=$tp;
      var $parent193=(($162+24)|0);
      HEAP32[(($parent193)>>2)]=$161;
      var $163=$tp;
      var $164=$tp;
      var $bk194=(($164+12)|0);
      HEAP32[(($bk194)>>2)]=$163;
      var $165=$tp;
      var $fd195=(($165+8)|0);
      HEAP32[(($fd195)>>2)]=$163;
      label = 88; break;
    case 70: 
      var $166=$H147;
      var $167=HEAP32[(($166)>>2)];
      $T=$167;
      var $168=$psize;
      var $169=$I;
      var $cmp198=(($169)|(0))==31;
      if ($cmp198) { label = 71; break; } else { label = 72; break; }
    case 71: 
      var $cond207 = 0;label = 73; break;
    case 72: 
      var $170=$I;
      var $shr202=$170 >>> 1;
      var $add203=((($shr202)+(8))|0);
      var $sub204=((($add203)-(2))|0);
      var $sub205=(((31)-($sub204))|0);
      var $cond207 = $sub205;label = 73; break;
    case 73: 
      var $cond207;
      var $shl208=$168 << $cond207;
      $K197=$shl208;
      label = 74; break;
    case 74: 
      var $171=$T;
      var $head209=(($171+4)|0);
      var $172=HEAP32[(($head209)>>2)];
      var $and210=$172 & -8;
      var $173=$psize;
      var $cmp211=(($and210)|(0))!=(($173)|(0));
      if ($cmp211) { label = 75; break; } else { label = 81; break; }
    case 75: 
      var $174=$K197;
      var $shr214=$174 >>> 31;
      var $and215=$shr214 & 1;
      var $175=$T;
      var $child216=(($175+16)|0);
      var $arrayidx217=(($child216+($and215<<2))|0);
      $C=$arrayidx217;
      var $176=$K197;
      var $shl218=$176 << 1;
      $K197=$shl218;
      var $177=$C;
      var $178=HEAP32[(($177)>>2)];
      var $cmp219=(($178)|(0))!=0;
      if ($cmp219) { label = 76; break; } else { label = 77; break; }
    case 76: 
      var $179=$C;
      var $180=HEAP32[(($179)>>2)];
      $T=$180;
      label = 80; break;
    case 77: 
      var $181=$C;
      var $182=$181;
      var $183=$m_addr;
      var $least_addr223=(($183+16)|0);
      var $184=HEAP32[(($least_addr223)>>2)];
      var $cmp224=(($182)>>>(0)) >= (($184)>>>(0));
      var $conv225=(($cmp224)&(1));
      var $expval226=($conv225);
      var $tobool227=(($expval226)|(0))!=0;
      if ($tobool227) { label = 78; break; } else { label = 79; break; }
    case 78: 
      var $185=$tp;
      var $186=$C;
      HEAP32[(($186)>>2)]=$185;
      var $187=$T;
      var $188=$tp;
      var $parent229=(($188+24)|0);
      HEAP32[(($parent229)>>2)]=$187;
      var $189=$tp;
      var $190=$tp;
      var $bk230=(($190+12)|0);
      HEAP32[(($bk230)>>2)]=$189;
      var $191=$tp;
      var $fd231=(($191+8)|0);
      HEAP32[(($fd231)>>2)]=$189;
      label = 87; break;
    case 79: 
      _abort();
      throw "Reached an unreachable!"
    case 80: 
      label = 86; break;
    case 81: 
      var $192=$T;
      var $fd236=(($192+8)|0);
      var $193=HEAP32[(($fd236)>>2)];
      $F235=$193;
      var $194=$T;
      var $195=$194;
      var $196=$m_addr;
      var $least_addr237=(($196+16)|0);
      var $197=HEAP32[(($least_addr237)>>2)];
      var $cmp238=(($195)>>>(0)) >= (($197)>>>(0));
      if ($cmp238) { label = 82; break; } else { var $202 = 0;label = 83; break; }
    case 82: 
      var $198=$F235;
      var $199=$198;
      var $200=$m_addr;
      var $least_addr241=(($200+16)|0);
      var $201=HEAP32[(($least_addr241)>>2)];
      var $cmp242=(($199)>>>(0)) >= (($201)>>>(0));
      var $202 = $cmp242;label = 83; break;
    case 83: 
      var $202;
      var $land_ext245=(($202)&(1));
      var $expval246=($land_ext245);
      var $tobool247=(($expval246)|(0))!=0;
      if ($tobool247) { label = 84; break; } else { label = 85; break; }
    case 84: 
      var $203=$tp;
      var $204=$F235;
      var $bk249=(($204+12)|0);
      HEAP32[(($bk249)>>2)]=$203;
      var $205=$T;
      var $fd250=(($205+8)|0);
      HEAP32[(($fd250)>>2)]=$203;
      var $206=$F235;
      var $207=$tp;
      var $fd251=(($207+8)|0);
      HEAP32[(($fd251)>>2)]=$206;
      var $208=$T;
      var $209=$tp;
      var $bk252=(($209+12)|0);
      HEAP32[(($bk252)>>2)]=$208;
      var $210=$tp;
      var $parent253=(($210+24)|0);
      HEAP32[(($parent253)>>2)]=0;
      label = 87; break;
    case 85: 
      _abort();
      throw "Reached an unreachable!"
    case 86: 
      label = 74; break;
    case 87: 
      label = 88; break;
    case 88: 
      label = 89; break;
    case 89: 
      label = 90; break;
    case 90: 
      var $211=$sp;
      $pred=$211;
      var $212=$next3;
      $sp=$212;
      label = 3; break;
    case 91: 
      var $213=$nsegs;
      var $cmp260=(($213)>>>(0)) > 4294967295;
      if ($cmp260) { label = 92; break; } else { label = 93; break; }
    case 92: 
      var $214=$nsegs;
      var $cond265 = $214;label = 94; break;
    case 93: 
      var $cond265 = -1;label = 94; break;
    case 94: 
      var $cond265;
      var $215=$m_addr;
      var $release_checks=(($215+32)|0);
      HEAP32[(($release_checks)>>2)]=$cond265;
      var $216=$released;

      return $216;
    default: assert(0, "bad label: " + label);
  }

}


function _realloc($oldmem, $bytes) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $oldmem_addr;
      var $bytes_addr;
      var $mem;
      var $nb;
      var $oldp;
      var $m;
      var $newp;
      var $oc;
      $oldmem_addr=$oldmem;
      $bytes_addr=$bytes;
      $mem=0;
      var $0=$oldmem_addr;
      var $cmp=(($0)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $1=$bytes_addr;
      var $call=_malloc($1);
      $mem=$call;
      label = 19; break;
    case 4: 
      var $2=$bytes_addr;
      var $cmp1=(($2)>>>(0)) >= 4294967232;
      if ($cmp1) { label = 5; break; } else { label = 6; break; }
    case 5: 
      var $call3=___errno_location();
      HEAP32[(($call3)>>2)]=12;
      label = 18; break;
    case 6: 
      var $3=$bytes_addr;
      var $cmp5=(($3)>>>(0)) < 11;
      if ($cmp5) { label = 7; break; } else { label = 8; break; }
    case 7: 
      var $cond = 16;label = 9; break;
    case 8: 
      var $4=$bytes_addr;
      var $add=((($4)+(4))|0);
      var $add6=((($add)+(7))|0);
      var $and=$add6 & -8;
      var $cond = $and;label = 9; break;
    case 9: 
      var $cond;
      $nb=$cond;
      var $5=$oldmem_addr;
      var $add_ptr=((($5)-(8))|0);
      var $6=$add_ptr;
      $oldp=$6;
      $m=5243104;
      var $7=$m;
      var $8=$oldp;
      var $9=$nb;
      var $call7=_try_realloc_chunk($7, $8, $9, 1);
      $newp=$call7;
      var $10=$newp;
      var $cmp8=(($10)|(0))!=0;
      if ($cmp8) { label = 10; break; } else { label = 11; break; }
    case 10: 
      var $11=$newp;
      var $12=$11;
      var $add_ptr10=(($12+8)|0);
      $mem=$add_ptr10;
      label = 17; break;
    case 11: 
      var $13=$bytes_addr;
      var $call12=_malloc($13);
      $mem=$call12;
      var $14=$mem;
      var $cmp13=(($14)|(0))!=0;
      if ($cmp13) { label = 12; break; } else { label = 16; break; }
    case 12: 
      var $15=$oldp;
      var $head=(($15+4)|0);
      var $16=HEAP32[(($head)>>2)];
      var $and15=$16 & -8;
      var $17=$oldp;
      var $head16=(($17+4)|0);
      var $18=HEAP32[(($head16)>>2)];
      var $and17=$18 & 3;
      var $cmp18=(($and17)|(0))==0;
      var $cond19=$cmp18 ? 8 : 4;
      var $sub=((($and15)-($cond19))|0);
      $oc=$sub;
      var $19=$mem;
      var $20=$oldmem_addr;
      var $21=$oc;
      var $22=$bytes_addr;
      var $cmp20=(($21)>>>(0)) < (($22)>>>(0));
      if ($cmp20) { label = 13; break; } else { label = 14; break; }
    case 13: 
      var $23=$oc;
      var $cond24 = $23;label = 15; break;
    case 14: 
      var $24=$bytes_addr;
      var $cond24 = $24;label = 15; break;
    case 15: 
      var $cond24;
      assert($cond24 % 1 === 0);_memcpy($19, $20, $cond24);
      var $25=$oldmem_addr;
      _free($25);
      label = 16; break;
    case 16: 
      label = 17; break;
    case 17: 
      label = 18; break;
    case 18: 
      label = 19; break;
    case 19: 
      var $26=$mem;

      return $26;
    default: assert(0, "bad label: " + label);
  }

}
Module["_realloc"] = _realloc;

function _try_realloc_chunk($m, $p, $nb, $can_move) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $p_addr;
      var $nb_addr;
      var $can_move_addr;
      var $newp;
      var $oldsize;
      var $next;
      var $rsize;
      var $r;
      var $newsize;
      var $newtopsize;
      var $newtop;
      var $dvs;
      var $dsize;
      var $r65;
      var $n;
      var $newsize84;
      var $nextsize;
      var $rsize108;
      var $F;
      var $B;
      var $I;
      var $TP;
      var $XP;
      var $R;
      var $F158;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $newsize291;
      var $r302;
      $m_addr=$m;
      $p_addr=$p;
      $nb_addr=$nb;
      $can_move_addr=$can_move;
      $newp=0;
      var $0=$p_addr;
      var $head=(($0+4)|0);
      var $1=HEAP32[(($head)>>2)];
      var $and=$1 & -8;
      $oldsize=$and;
      var $2=$p_addr;
      var $3=$2;
      var $4=$oldsize;
      var $add_ptr=(($3+$4)|0);
      var $5=$add_ptr;
      $next=$5;
      var $6=$p_addr;
      var $7=$6;
      var $8=$m_addr;
      var $least_addr=(($8+16)|0);
      var $9=HEAP32[(($least_addr)>>2)];
      var $cmp=(($7)>>>(0)) >= (($9)>>>(0));
      if ($cmp) { label = 3; break; } else { var $18 = 0;label = 6; break; }
    case 3: 
      var $10=$p_addr;
      var $head1=(($10+4)|0);
      var $11=HEAP32[(($head1)>>2)];
      var $and2=$11 & 3;
      var $cmp3=(($and2)|(0))!=1;
      if ($cmp3) { label = 4; break; } else { var $18 = 0;label = 6; break; }
    case 4: 
      var $12=$p_addr;
      var $13=$12;
      var $14=$next;
      var $15=$14;
      var $cmp5=(($13)>>>(0)) < (($15)>>>(0));
      if ($cmp5) { label = 5; break; } else { var $18 = 0;label = 6; break; }
    case 5: 
      var $16=$next;
      var $head6=(($16+4)|0);
      var $17=HEAP32[(($head6)>>2)];
      var $and7=$17 & 1;
      var $tobool=(($and7)|(0))!=0;
      var $18 = $tobool;label = 6; break;
    case 6: 
      var $18;
      var $land_ext=(($18)&(1));
      var $expval=($land_ext);
      var $tobool8=(($expval)|(0))!=0;
      if ($tobool8) { label = 7; break; } else { label = 104; break; }
    case 7: 
      var $19=$p_addr;
      var $head9=(($19+4)|0);
      var $20=HEAP32[(($head9)>>2)];
      var $and10=$20 & 3;
      var $cmp11=(($and10)|(0))==0;
      if ($cmp11) { label = 8; break; } else { label = 9; break; }
    case 8: 
      var $21=$m_addr;
      var $22=$p_addr;
      var $23=$nb_addr;
      var $24=$can_move_addr;
      var $call=_mmap_resize($21, $22, $23, $24);
      $newp=$call;
      label = 103; break;
    case 9: 
      var $25=$oldsize;
      var $26=$nb_addr;
      var $cmp13=(($25)>>>(0)) >= (($26)>>>(0));
      if ($cmp13) { label = 10; break; } else { label = 13; break; }
    case 10: 
      var $27=$oldsize;
      var $28=$nb_addr;
      var $sub=((($27)-($28))|0);
      $rsize=$sub;
      var $29=$rsize;
      var $cmp15=(($29)>>>(0)) >= 16;
      if ($cmp15) { label = 11; break; } else { label = 12; break; }
    case 11: 
      var $30=$p_addr;
      var $31=$30;
      var $32=$nb_addr;
      var $add_ptr17=(($31+$32)|0);
      var $33=$add_ptr17;
      $r=$33;
      var $34=$p_addr;
      var $head18=(($34+4)|0);
      var $35=HEAP32[(($head18)>>2)];
      var $and19=$35 & 1;
      var $36=$nb_addr;
      var $or=$and19 | $36;
      var $or20=$or | 2;
      var $37=$p_addr;
      var $head21=(($37+4)|0);
      HEAP32[(($head21)>>2)]=$or20;
      var $38=$p_addr;
      var $39=$38;
      var $40=$nb_addr;
      var $add_ptr22=(($39+$40)|0);
      var $41=$add_ptr22;
      var $head23=(($41+4)|0);
      var $42=HEAP32[(($head23)>>2)];
      var $or24=$42 | 1;
      HEAP32[(($head23)>>2)]=$or24;
      var $43=$r;
      var $head25=(($43+4)|0);
      var $44=HEAP32[(($head25)>>2)];
      var $and26=$44 & 1;
      var $45=$rsize;
      var $or27=$and26 | $45;
      var $or28=$or27 | 2;
      var $46=$r;
      var $head29=(($46+4)|0);
      HEAP32[(($head29)>>2)]=$or28;
      var $47=$r;
      var $48=$47;
      var $49=$rsize;
      var $add_ptr30=(($48+$49)|0);
      var $50=$add_ptr30;
      var $head31=(($50+4)|0);
      var $51=HEAP32[(($head31)>>2)];
      var $or32=$51 | 1;
      HEAP32[(($head31)>>2)]=$or32;
      var $52=$m_addr;
      var $53=$r;
      var $54=$rsize;
      _dispose_chunk($52, $53, $54);
      label = 12; break;
    case 12: 
      var $55=$p_addr;
      $newp=$55;
      label = 102; break;
    case 13: 
      var $56=$next;
      var $57=$m_addr;
      var $top=(($57+24)|0);
      var $58=HEAP32[(($top)>>2)];
      var $cmp34=(($56)|(0))==(($58)|(0));
      if ($cmp34) { label = 14; break; } else { label = 17; break; }
    case 14: 
      var $59=$oldsize;
      var $60=$m_addr;
      var $topsize=(($60+12)|0);
      var $61=HEAP32[(($topsize)>>2)];
      var $add=((($59)+($61))|0);
      var $62=$nb_addr;
      var $cmp36=(($add)>>>(0)) > (($62)>>>(0));
      if ($cmp36) { label = 15; break; } else { label = 16; break; }
    case 15: 
      var $63=$oldsize;
      var $64=$m_addr;
      var $topsize38=(($64+12)|0);
      var $65=HEAP32[(($topsize38)>>2)];
      var $add39=((($63)+($65))|0);
      $newsize=$add39;
      var $66=$newsize;
      var $67=$nb_addr;
      var $sub40=((($66)-($67))|0);
      $newtopsize=$sub40;
      var $68=$p_addr;
      var $69=$68;
      var $70=$nb_addr;
      var $add_ptr41=(($69+$70)|0);
      var $71=$add_ptr41;
      $newtop=$71;
      var $72=$p_addr;
      var $head42=(($72+4)|0);
      var $73=HEAP32[(($head42)>>2)];
      var $and43=$73 & 1;
      var $74=$nb_addr;
      var $or44=$and43 | $74;
      var $or45=$or44 | 2;
      var $75=$p_addr;
      var $head46=(($75+4)|0);
      HEAP32[(($head46)>>2)]=$or45;
      var $76=$p_addr;
      var $77=$76;
      var $78=$nb_addr;
      var $add_ptr47=(($77+$78)|0);
      var $79=$add_ptr47;
      var $head48=(($79+4)|0);
      var $80=HEAP32[(($head48)>>2)];
      var $or49=$80 | 1;
      HEAP32[(($head48)>>2)]=$or49;
      var $81=$newtopsize;
      var $or50=$81 | 1;
      var $82=$newtop;
      var $head51=(($82+4)|0);
      HEAP32[(($head51)>>2)]=$or50;
      var $83=$newtop;
      var $84=$m_addr;
      var $top52=(($84+24)|0);
      HEAP32[(($top52)>>2)]=$83;
      var $85=$newtopsize;
      var $86=$m_addr;
      var $topsize53=(($86+12)|0);
      HEAP32[(($topsize53)>>2)]=$85;
      var $87=$p_addr;
      $newp=$87;
      label = 16; break;
    case 16: 
      label = 101; break;
    case 17: 
      var $88=$next;
      var $89=$m_addr;
      var $dv=(($89+20)|0);
      var $90=HEAP32[(($dv)>>2)];
      var $cmp56=(($88)|(0))==(($90)|(0));
      if ($cmp56) { label = 18; break; } else { label = 24; break; }
    case 18: 
      var $91=$m_addr;
      var $dvsize=(($91+8)|0);
      var $92=HEAP32[(($dvsize)>>2)];
      $dvs=$92;
      var $93=$oldsize;
      var $94=$dvs;
      var $add58=((($93)+($94))|0);
      var $95=$nb_addr;
      var $cmp59=(($add58)>>>(0)) >= (($95)>>>(0));
      if ($cmp59) { label = 19; break; } else { label = 23; break; }
    case 19: 
      var $96=$oldsize;
      var $97=$dvs;
      var $add61=((($96)+($97))|0);
      var $98=$nb_addr;
      var $sub62=((($add61)-($98))|0);
      $dsize=$sub62;
      var $99=$dsize;
      var $cmp63=(($99)>>>(0)) >= 16;
      if ($cmp63) { label = 20; break; } else { label = 21; break; }
    case 20: 
      var $100=$p_addr;
      var $101=$100;
      var $102=$nb_addr;
      var $add_ptr66=(($101+$102)|0);
      var $103=$add_ptr66;
      $r65=$103;
      var $104=$r65;
      var $105=$104;
      var $106=$dsize;
      var $add_ptr67=(($105+$106)|0);
      var $107=$add_ptr67;
      $n=$107;
      var $108=$p_addr;
      var $head68=(($108+4)|0);
      var $109=HEAP32[(($head68)>>2)];
      var $and69=$109 & 1;
      var $110=$nb_addr;
      var $or70=$and69 | $110;
      var $or71=$or70 | 2;
      var $111=$p_addr;
      var $head72=(($111+4)|0);
      HEAP32[(($head72)>>2)]=$or71;
      var $112=$p_addr;
      var $113=$112;
      var $114=$nb_addr;
      var $add_ptr73=(($113+$114)|0);
      var $115=$add_ptr73;
      var $head74=(($115+4)|0);
      var $116=HEAP32[(($head74)>>2)];
      var $or75=$116 | 1;
      HEAP32[(($head74)>>2)]=$or75;
      var $117=$dsize;
      var $or76=$117 | 1;
      var $118=$r65;
      var $head77=(($118+4)|0);
      HEAP32[(($head77)>>2)]=$or76;
      var $119=$dsize;
      var $120=$r65;
      var $121=$120;
      var $122=$dsize;
      var $add_ptr78=(($121+$122)|0);
      var $123=$add_ptr78;
      var $prev_foot=(($123)|0);
      HEAP32[(($prev_foot)>>2)]=$119;
      var $124=$n;
      var $head79=(($124+4)|0);
      var $125=HEAP32[(($head79)>>2)];
      var $and80=$125 & -2;
      HEAP32[(($head79)>>2)]=$and80;
      var $126=$dsize;
      var $127=$m_addr;
      var $dvsize81=(($127+8)|0);
      HEAP32[(($dvsize81)>>2)]=$126;
      var $128=$r65;
      var $129=$m_addr;
      var $dv82=(($129+20)|0);
      HEAP32[(($dv82)>>2)]=$128;
      label = 22; break;
    case 21: 
      var $130=$oldsize;
      var $131=$dvs;
      var $add85=((($130)+($131))|0);
      $newsize84=$add85;
      var $132=$p_addr;
      var $head86=(($132+4)|0);
      var $133=HEAP32[(($head86)>>2)];
      var $and87=$133 & 1;
      var $134=$newsize84;
      var $or88=$and87 | $134;
      var $or89=$or88 | 2;
      var $135=$p_addr;
      var $head90=(($135+4)|0);
      HEAP32[(($head90)>>2)]=$or89;
      var $136=$p_addr;
      var $137=$136;
      var $138=$newsize84;
      var $add_ptr91=(($137+$138)|0);
      var $139=$add_ptr91;
      var $head92=(($139+4)|0);
      var $140=HEAP32[(($head92)>>2)];
      var $or93=$140 | 1;
      HEAP32[(($head92)>>2)]=$or93;
      var $141=$m_addr;
      var $dvsize94=(($141+8)|0);
      HEAP32[(($dvsize94)>>2)]=0;
      var $142=$m_addr;
      var $dv95=(($142+20)|0);
      HEAP32[(($dv95)>>2)]=0;
      label = 22; break;
    case 22: 
      var $143=$p_addr;
      $newp=$143;
      label = 23; break;
    case 23: 
      label = 100; break;
    case 24: 
      var $144=$next;
      var $head99=(($144+4)|0);
      var $145=HEAP32[(($head99)>>2)];
      var $and100=$145 & 2;
      var $tobool101=(($and100)|(0))!=0;
      if ($tobool101) { label = 99; break; } else { label = 25; break; }
    case 25: 
      var $146=$next;
      var $head103=(($146+4)|0);
      var $147=HEAP32[(($head103)>>2)];
      var $and104=$147 & -8;
      $nextsize=$and104;
      var $148=$oldsize;
      var $149=$nextsize;
      var $add105=((($148)+($149))|0);
      var $150=$nb_addr;
      var $cmp106=(($add105)>>>(0)) >= (($150)>>>(0));
      if ($cmp106) { label = 26; break; } else { label = 98; break; }
    case 26: 
      var $151=$oldsize;
      var $152=$nextsize;
      var $add109=((($151)+($152))|0);
      var $153=$nb_addr;
      var $sub110=((($add109)-($153))|0);
      $rsize108=$sub110;
      var $154=$nextsize;
      var $shr=$154 >>> 3;
      var $cmp111=(($shr)>>>(0)) < 32;
      if ($cmp111) { label = 27; break; } else { label = 45; break; }
    case 27: 
      var $155=$next;
      var $fd=(($155+8)|0);
      var $156=HEAP32[(($fd)>>2)];
      $F=$156;
      var $157=$next;
      var $bk=(($157+12)|0);
      var $158=HEAP32[(($bk)>>2)];
      $B=$158;
      var $159=$nextsize;
      var $shr113=$159 >>> 3;
      $I=$shr113;
      var $160=$F;
      var $161=$I;
      var $shl=$161 << 1;
      var $162=$m_addr;
      var $smallbins=(($162+40)|0);
      var $arrayidx=(($smallbins+($shl<<2))|0);
      var $163=$arrayidx;
      var $164=$163;
      var $cmp114=(($160)|(0))==(($164)|(0));
      if ($cmp114) { var $173 = 1;label = 31; break; } else { label = 28; break; }
    case 28: 
      var $165=$F;
      var $166=$165;
      var $167=$m_addr;
      var $least_addr115=(($167+16)|0);
      var $168=HEAP32[(($least_addr115)>>2)];
      var $cmp116=(($166)>>>(0)) >= (($168)>>>(0));
      if ($cmp116) { label = 29; break; } else { var $172 = 0;label = 30; break; }
    case 29: 
      var $169=$F;
      var $bk118=(($169+12)|0);
      var $170=HEAP32[(($bk118)>>2)];
      var $171=$next;
      var $cmp119=(($170)|(0))==(($171)|(0));
      var $172 = $cmp119;label = 30; break;
    case 30: 
      var $172;
      var $173 = $172;label = 31; break;
    case 31: 
      var $173;
      var $lor_ext=(($173)&(1));
      var $expval122=($lor_ext);
      var $tobool123=(($expval122)|(0))!=0;
      if ($tobool123) { label = 32; break; } else { label = 43; break; }
    case 32: 
      var $174=$B;
      var $175=$F;
      var $cmp125=(($174)|(0))==(($175)|(0));
      if ($cmp125) { label = 33; break; } else { label = 34; break; }
    case 33: 
      var $176=$I;
      var $shl127=1 << $176;
      var $neg=$shl127 ^ -1;
      var $177=$m_addr;
      var $smallmap=(($177)|0);
      var $178=HEAP32[(($smallmap)>>2)];
      var $and128=$178 & $neg;
      HEAP32[(($smallmap)>>2)]=$and128;
      label = 42; break;
    case 34: 
      var $179=$B;
      var $180=$I;
      var $shl130=$180 << 1;
      var $181=$m_addr;
      var $smallbins131=(($181+40)|0);
      var $arrayidx132=(($smallbins131+($shl130<<2))|0);
      var $182=$arrayidx132;
      var $183=$182;
      var $cmp133=(($179)|(0))==(($183)|(0));
      if ($cmp133) { var $192 = 1;label = 38; break; } else { label = 35; break; }
    case 35: 
      var $184=$B;
      var $185=$184;
      var $186=$m_addr;
      var $least_addr135=(($186+16)|0);
      var $187=HEAP32[(($least_addr135)>>2)];
      var $cmp136=(($185)>>>(0)) >= (($187)>>>(0));
      if ($cmp136) { label = 36; break; } else { var $191 = 0;label = 37; break; }
    case 36: 
      var $188=$B;
      var $fd138=(($188+8)|0);
      var $189=HEAP32[(($fd138)>>2)];
      var $190=$next;
      var $cmp139=(($189)|(0))==(($190)|(0));
      var $191 = $cmp139;label = 37; break;
    case 37: 
      var $191;
      var $192 = $191;label = 38; break;
    case 38: 
      var $192;
      var $lor_ext143=(($192)&(1));
      var $expval144=($lor_ext143);
      var $tobool145=(($expval144)|(0))!=0;
      if ($tobool145) { label = 39; break; } else { label = 40; break; }
    case 39: 
      var $193=$B;
      var $194=$F;
      var $bk147=(($194+12)|0);
      HEAP32[(($bk147)>>2)]=$193;
      var $195=$F;
      var $196=$B;
      var $fd148=(($196+8)|0);
      HEAP32[(($fd148)>>2)]=$195;
      label = 41; break;
    case 40: 
      _abort();
      throw "Reached an unreachable!"
    case 41: 
      label = 42; break;
    case 42: 
      label = 44; break;
    case 43: 
      _abort();
      throw "Reached an unreachable!"
    case 44: 
      label = 94; break;
    case 45: 
      var $197=$next;
      var $198=$197;
      $TP=$198;
      var $199=$TP;
      var $parent=(($199+24)|0);
      var $200=HEAP32[(($parent)>>2)];
      $XP=$200;
      var $201=$TP;
      var $bk155=(($201+12)|0);
      var $202=HEAP32[(($bk155)>>2)];
      var $203=$TP;
      var $cmp156=(($202)|(0))!=(($203)|(0));
      if ($cmp156) { label = 46; break; } else { label = 53; break; }
    case 46: 
      var $204=$TP;
      var $fd159=(($204+8)|0);
      var $205=HEAP32[(($fd159)>>2)];
      $F158=$205;
      var $206=$TP;
      var $bk160=(($206+12)|0);
      var $207=HEAP32[(($bk160)>>2)];
      $R=$207;
      var $208=$F158;
      var $209=$208;
      var $210=$m_addr;
      var $least_addr161=(($210+16)|0);
      var $211=HEAP32[(($least_addr161)>>2)];
      var $cmp162=(($209)>>>(0)) >= (($211)>>>(0));
      if ($cmp162) { label = 47; break; } else { var $218 = 0;label = 49; break; }
    case 47: 
      var $212=$F158;
      var $bk164=(($212+12)|0);
      var $213=HEAP32[(($bk164)>>2)];
      var $214=$TP;
      var $cmp165=(($213)|(0))==(($214)|(0));
      if ($cmp165) { label = 48; break; } else { var $218 = 0;label = 49; break; }
    case 48: 
      var $215=$R;
      var $fd167=(($215+8)|0);
      var $216=HEAP32[(($fd167)>>2)];
      var $217=$TP;
      var $cmp168=(($216)|(0))==(($217)|(0));
      var $218 = $cmp168;label = 49; break;
    case 49: 
      var $218;
      var $land_ext170=(($218)&(1));
      var $expval171=($land_ext170);
      var $tobool172=(($expval171)|(0))!=0;
      if ($tobool172) { label = 50; break; } else { label = 51; break; }
    case 50: 
      var $219=$R;
      var $220=$F158;
      var $bk174=(($220+12)|0);
      HEAP32[(($bk174)>>2)]=$219;
      var $221=$F158;
      var $222=$R;
      var $fd175=(($222+8)|0);
      HEAP32[(($fd175)>>2)]=$221;
      label = 52; break;
    case 51: 
      _abort();
      throw "Reached an unreachable!"
    case 52: 
      label = 65; break;
    case 53: 
      var $223=$TP;
      var $child=(($223+16)|0);
      var $arrayidx179=(($child+4)|0);
      $RP=$arrayidx179;
      var $224=HEAP32[(($arrayidx179)>>2)];
      $R=$224;
      var $cmp180=(($224)|(0))!=0;
      if ($cmp180) { label = 55; break; } else { label = 54; break; }
    case 54: 
      var $225=$TP;
      var $child181=(($225+16)|0);
      var $arrayidx182=(($child181)|0);
      $RP=$arrayidx182;
      var $226=HEAP32[(($arrayidx182)>>2)];
      $R=$226;
      var $cmp183=(($226)|(0))!=0;
      if ($cmp183) { label = 55; break; } else { label = 64; break; }
    case 55: 
      label = 56; break;
    case 56: 
      var $227=$R;
      var $child185=(($227+16)|0);
      var $arrayidx186=(($child185+4)|0);
      $CP=$arrayidx186;
      var $228=HEAP32[(($arrayidx186)>>2)];
      var $cmp187=(($228)|(0))!=0;
      if ($cmp187) { var $231 = 1;label = 58; break; } else { label = 57; break; }
    case 57: 
      var $229=$R;
      var $child189=(($229+16)|0);
      var $arrayidx190=(($child189)|0);
      $CP=$arrayidx190;
      var $230=HEAP32[(($arrayidx190)>>2)];
      var $cmp191=(($230)|(0))!=0;
      var $231 = $cmp191;label = 58; break;
    case 58: 
      var $231;
      if ($231) { label = 59; break; } else { label = 60; break; }
    case 59: 
      var $232=$CP;
      $RP=$232;
      var $233=HEAP32[(($232)>>2)];
      $R=$233;
      label = 56; break;
    case 60: 
      var $234=$RP;
      var $235=$234;
      var $236=$m_addr;
      var $least_addr194=(($236+16)|0);
      var $237=HEAP32[(($least_addr194)>>2)];
      var $cmp195=(($235)>>>(0)) >= (($237)>>>(0));
      var $conv=(($cmp195)&(1));
      var $expval196=($conv);
      var $tobool197=(($expval196)|(0))!=0;
      if ($tobool197) { label = 61; break; } else { label = 62; break; }
    case 61: 
      var $238=$RP;
      HEAP32[(($238)>>2)]=0;
      label = 63; break;
    case 62: 
      _abort();
      throw "Reached an unreachable!"
    case 63: 
      label = 64; break;
    case 64: 
      label = 65; break;
    case 65: 
      var $239=$XP;
      var $cmp203=(($239)|(0))!=0;
      if ($cmp203) { label = 66; break; } else { label = 93; break; }
    case 66: 
      var $240=$TP;
      var $index=(($240+28)|0);
      var $241=HEAP32[(($index)>>2)];
      var $242=$m_addr;
      var $treebins=(($242+304)|0);
      var $arrayidx206=(($treebins+($241<<2))|0);
      $H=$arrayidx206;
      var $243=$TP;
      var $244=$H;
      var $245=HEAP32[(($244)>>2)];
      var $cmp207=(($243)|(0))==(($245)|(0));
      if ($cmp207) { label = 67; break; } else { label = 70; break; }
    case 67: 
      var $246=$R;
      var $247=$H;
      HEAP32[(($247)>>2)]=$246;
      var $cmp210=(($246)|(0))==0;
      if ($cmp210) { label = 68; break; } else { label = 69; break; }
    case 68: 
      var $248=$TP;
      var $index213=(($248+28)|0);
      var $249=HEAP32[(($index213)>>2)];
      var $shl214=1 << $249;
      var $neg215=$shl214 ^ -1;
      var $250=$m_addr;
      var $treemap=(($250+4)|0);
      var $251=HEAP32[(($treemap)>>2)];
      var $and216=$251 & $neg215;
      HEAP32[(($treemap)>>2)]=$and216;
      label = 69; break;
    case 69: 
      label = 77; break;
    case 70: 
      var $252=$XP;
      var $253=$252;
      var $254=$m_addr;
      var $least_addr219=(($254+16)|0);
      var $255=HEAP32[(($least_addr219)>>2)];
      var $cmp220=(($253)>>>(0)) >= (($255)>>>(0));
      var $conv221=(($cmp220)&(1));
      var $expval222=($conv221);
      var $tobool223=(($expval222)|(0))!=0;
      if ($tobool223) { label = 71; break; } else { label = 75; break; }
    case 71: 
      var $256=$XP;
      var $child225=(($256+16)|0);
      var $arrayidx226=(($child225)|0);
      var $257=HEAP32[(($arrayidx226)>>2)];
      var $258=$TP;
      var $cmp227=(($257)|(0))==(($258)|(0));
      if ($cmp227) { label = 72; break; } else { label = 73; break; }
    case 72: 
      var $259=$R;
      var $260=$XP;
      var $child230=(($260+16)|0);
      var $arrayidx231=(($child230)|0);
      HEAP32[(($arrayidx231)>>2)]=$259;
      label = 74; break;
    case 73: 
      var $261=$R;
      var $262=$XP;
      var $child233=(($262+16)|0);
      var $arrayidx234=(($child233+4)|0);
      HEAP32[(($arrayidx234)>>2)]=$261;
      label = 74; break;
    case 74: 
      label = 76; break;
    case 75: 
      _abort();
      throw "Reached an unreachable!"
    case 76: 
      label = 77; break;
    case 77: 
      var $263=$R;
      var $cmp239=(($263)|(0))!=0;
      if ($cmp239) { label = 78; break; } else { label = 92; break; }
    case 78: 
      var $264=$R;
      var $265=$264;
      var $266=$m_addr;
      var $least_addr242=(($266+16)|0);
      var $267=HEAP32[(($least_addr242)>>2)];
      var $cmp243=(($265)>>>(0)) >= (($267)>>>(0));
      var $conv244=(($cmp243)&(1));
      var $expval245=($conv244);
      var $tobool246=(($expval245)|(0))!=0;
      if ($tobool246) { label = 79; break; } else { label = 90; break; }
    case 79: 
      var $268=$XP;
      var $269=$R;
      var $parent248=(($269+24)|0);
      HEAP32[(($parent248)>>2)]=$268;
      var $270=$TP;
      var $child249=(($270+16)|0);
      var $arrayidx250=(($child249)|0);
      var $271=HEAP32[(($arrayidx250)>>2)];
      $C0=$271;
      var $cmp251=(($271)|(0))!=0;
      if ($cmp251) { label = 80; break; } else { label = 84; break; }
    case 80: 
      var $272=$C0;
      var $273=$272;
      var $274=$m_addr;
      var $least_addr254=(($274+16)|0);
      var $275=HEAP32[(($least_addr254)>>2)];
      var $cmp255=(($273)>>>(0)) >= (($275)>>>(0));
      var $conv256=(($cmp255)&(1));
      var $expval257=($conv256);
      var $tobool258=(($expval257)|(0))!=0;
      if ($tobool258) { label = 81; break; } else { label = 82; break; }
    case 81: 
      var $276=$C0;
      var $277=$R;
      var $child260=(($277+16)|0);
      var $arrayidx261=(($child260)|0);
      HEAP32[(($arrayidx261)>>2)]=$276;
      var $278=$R;
      var $279=$C0;
      var $parent262=(($279+24)|0);
      HEAP32[(($parent262)>>2)]=$278;
      label = 83; break;
    case 82: 
      _abort();
      throw "Reached an unreachable!"
    case 83: 
      label = 84; break;
    case 84: 
      var $280=$TP;
      var $child266=(($280+16)|0);
      var $arrayidx267=(($child266+4)|0);
      var $281=HEAP32[(($arrayidx267)>>2)];
      $C1=$281;
      var $cmp268=(($281)|(0))!=0;
      if ($cmp268) { label = 85; break; } else { label = 89; break; }
    case 85: 
      var $282=$C1;
      var $283=$282;
      var $284=$m_addr;
      var $least_addr271=(($284+16)|0);
      var $285=HEAP32[(($least_addr271)>>2)];
      var $cmp272=(($283)>>>(0)) >= (($285)>>>(0));
      var $conv273=(($cmp272)&(1));
      var $expval274=($conv273);
      var $tobool275=(($expval274)|(0))!=0;
      if ($tobool275) { label = 86; break; } else { label = 87; break; }
    case 86: 
      var $286=$C1;
      var $287=$R;
      var $child277=(($287+16)|0);
      var $arrayidx278=(($child277+4)|0);
      HEAP32[(($arrayidx278)>>2)]=$286;
      var $288=$R;
      var $289=$C1;
      var $parent279=(($289+24)|0);
      HEAP32[(($parent279)>>2)]=$288;
      label = 88; break;
    case 87: 
      _abort();
      throw "Reached an unreachable!"
    case 88: 
      label = 89; break;
    case 89: 
      label = 91; break;
    case 90: 
      _abort();
      throw "Reached an unreachable!"
    case 91: 
      label = 92; break;
    case 92: 
      label = 93; break;
    case 93: 
      label = 94; break;
    case 94: 
      var $290=$rsize108;
      var $cmp288=(($290)>>>(0)) < 16;
      if ($cmp288) { label = 95; break; } else { label = 96; break; }
    case 95: 
      var $291=$oldsize;
      var $292=$nextsize;
      var $add292=((($291)+($292))|0);
      $newsize291=$add292;
      var $293=$p_addr;
      var $head293=(($293+4)|0);
      var $294=HEAP32[(($head293)>>2)];
      var $and294=$294 & 1;
      var $295=$newsize291;
      var $or295=$and294 | $295;
      var $or296=$or295 | 2;
      var $296=$p_addr;
      var $head297=(($296+4)|0);
      HEAP32[(($head297)>>2)]=$or296;
      var $297=$p_addr;
      var $298=$297;
      var $299=$newsize291;
      var $add_ptr298=(($298+$299)|0);
      var $300=$add_ptr298;
      var $head299=(($300+4)|0);
      var $301=HEAP32[(($head299)>>2)];
      var $or300=$301 | 1;
      HEAP32[(($head299)>>2)]=$or300;
      label = 97; break;
    case 96: 
      var $302=$p_addr;
      var $303=$302;
      var $304=$nb_addr;
      var $add_ptr303=(($303+$304)|0);
      var $305=$add_ptr303;
      $r302=$305;
      var $306=$p_addr;
      var $head304=(($306+4)|0);
      var $307=HEAP32[(($head304)>>2)];
      var $and305=$307 & 1;
      var $308=$nb_addr;
      var $or306=$and305 | $308;
      var $or307=$or306 | 2;
      var $309=$p_addr;
      var $head308=(($309+4)|0);
      HEAP32[(($head308)>>2)]=$or307;
      var $310=$p_addr;
      var $311=$310;
      var $312=$nb_addr;
      var $add_ptr309=(($311+$312)|0);
      var $313=$add_ptr309;
      var $head310=(($313+4)|0);
      var $314=HEAP32[(($head310)>>2)];
      var $or311=$314 | 1;
      HEAP32[(($head310)>>2)]=$or311;
      var $315=$r302;
      var $head312=(($315+4)|0);
      var $316=HEAP32[(($head312)>>2)];
      var $and313=$316 & 1;
      var $317=$rsize108;
      var $or314=$and313 | $317;
      var $or315=$or314 | 2;
      var $318=$r302;
      var $head316=(($318+4)|0);
      HEAP32[(($head316)>>2)]=$or315;
      var $319=$r302;
      var $320=$319;
      var $321=$rsize108;
      var $add_ptr317=(($320+$321)|0);
      var $322=$add_ptr317;
      var $head318=(($322+4)|0);
      var $323=HEAP32[(($head318)>>2)];
      var $or319=$323 | 1;
      HEAP32[(($head318)>>2)]=$or319;
      var $324=$m_addr;
      var $325=$r302;
      var $326=$rsize108;
      _dispose_chunk($324, $325, $326);
      label = 97; break;
    case 97: 
      var $327=$p_addr;
      $newp=$327;
      label = 98; break;
    case 98: 
      label = 99; break;
    case 99: 
      label = 100; break;
    case 100: 
      label = 101; break;
    case 101: 
      label = 102; break;
    case 102: 
      label = 103; break;
    case 103: 
      label = 105; break;
    case 104: 
      _abort();
      throw "Reached an unreachable!"
    case 105: 
      var $328=$newp;

      return $328;
    default: assert(0, "bad label: " + label);
  }

}


function _init_mparams() {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $magic;
      var $psize;
      var $gsize;
      var $0=HEAP32[((((5242880)|0))>>2)];
      var $cmp=(($0)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 7; break; }
    case 3: 
      var $call=_sysconf(8);
      $psize=$call;
      var $1=$psize;
      $gsize=$1;
      var $2=$gsize;
      var $3=$gsize;
      var $sub=((($3)-(1))|0);
      var $and=$2 & $sub;
      var $cmp1=(($and)|(0))!=0;
      if ($cmp1) { label = 5; break; } else { label = 4; break; }
    case 4: 
      var $4=$psize;
      var $5=$psize;
      var $sub2=((($5)-(1))|0);
      var $and3=$4 & $sub2;
      var $cmp4=(($and3)|(0))!=0;
      if ($cmp4) { label = 5; break; } else { label = 6; break; }
    case 5: 
      _abort();
      throw "Reached an unreachable!"
    case 6: 
      var $6=$gsize;
      HEAP32[((((5242888)|0))>>2)]=$6;
      var $7=$psize;
      HEAP32[((((5242884)|0))>>2)]=$7;
      HEAP32[((((5242892)|0))>>2)]=-1;
      HEAP32[((((5242896)|0))>>2)]=2097152;
      HEAP32[((((5242900)|0))>>2)]=0;
      var $8=HEAP32[((((5242900)|0))>>2)];
      HEAP32[((((5243548)|0))>>2)]=$8;
      var $call6=_time(0);
      var $xor=$call6 ^ 1431655765;
      $magic=$xor;
      var $9=$magic;
      var $or=$9 | 8;
      $magic=$or;
      var $10=$magic;
      var $and7=$10 & -8;
      $magic=$and7;
      var $11=$magic;
      HEAP32[((((5242880)|0))>>2)]=$11;
      label = 7; break;
    case 7: 

      return 1;
    default: assert(0, "bad label: " + label);
  }

}


function _dispose_chunk($m, $p, $psize) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $p_addr;
      var $psize_addr;
      var $next;
      var $prev;
      var $prevsize;
      var $F;
      var $B;
      var $I;
      var $TP;
      var $XP;
      var $R;
      var $F64;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $tsize;
      var $dsize;
      var $nsize;
      var $F260;
      var $B262;
      var $I264;
      var $TP322;
      var $XP323;
      var $R325;
      var $F330;
      var $RP354;
      var $CP365;
      var $H393;
      var $C0439;
      var $C1440;
      var $I505;
      var $B507;
      var $F511;
      var $TP537;
      var $H538;
      var $I539;
      var $X;
      var $Y;
      var $N;
      var $K;
      var $T;
      var $K591;
      var $C;
      var $F625;
      $m_addr=$m;
      $p_addr=$p;
      $psize_addr=$psize;
      var $0=$p_addr;
      var $1=$0;
      var $2=$psize_addr;
      var $add_ptr=(($1+$2)|0);
      var $3=$add_ptr;
      $next=$3;
      var $4=$p_addr;
      var $head=(($4+4)|0);
      var $5=HEAP32[(($head)>>2)];
      var $and=$5 & 1;
      var $tobool=(($and)|(0))!=0;
      if ($tobool) { label = 82; break; } else { label = 3; break; }
    case 3: 
      var $6=$p_addr;
      var $prev_foot=(($6)|0);
      var $7=HEAP32[(($prev_foot)>>2)];
      $prevsize=$7;
      var $8=$p_addr;
      var $head1=(($8+4)|0);
      var $9=HEAP32[(($head1)>>2)];
      var $and2=$9 & 3;
      var $cmp=(($and2)|(0))==0;
      if ($cmp) { label = 4; break; } else { label = 5; break; }
    case 4: 
      var $10=$prevsize;
      var $add=((($10)+(16))|0);
      var $11=$psize_addr;
      var $add4=((($11)+($add))|0);
      $psize_addr=$add4;
      label = 201; break;
    case 5: 
      var $12=$p_addr;
      var $13=$12;
      var $14=$prevsize;
      var $idx_neg=(((-$14))|0);
      var $add_ptr5=(($13+$idx_neg)|0);
      var $15=$add_ptr5;
      $prev=$15;
      var $16=$prevsize;
      var $17=$psize_addr;
      var $add6=((($17)+($16))|0);
      $psize_addr=$add6;
      var $18=$prev;
      $p_addr=$18;
      var $19=$prev;
      var $20=$19;
      var $21=$m_addr;
      var $least_addr=(($21+16)|0);
      var $22=HEAP32[(($least_addr)>>2)];
      var $cmp7=(($20)>>>(0)) >= (($22)>>>(0));
      var $conv=(($cmp7)&(1));
      var $expval=($conv);
      var $tobool8=(($expval)|(0))!=0;
      if ($tobool8) { label = 6; break; } else { label = 80; break; }
    case 6: 
      var $23=$p_addr;
      var $24=$m_addr;
      var $dv=(($24+20)|0);
      var $25=HEAP32[(($dv)>>2)];
      var $cmp10=(($23)|(0))!=(($25)|(0));
      if ($cmp10) { label = 7; break; } else { label = 76; break; }
    case 7: 
      var $26=$prevsize;
      var $shr=$26 >>> 3;
      var $cmp13=(($shr)>>>(0)) < 32;
      if ($cmp13) { label = 8; break; } else { label = 26; break; }
    case 8: 
      var $27=$p_addr;
      var $fd=(($27+8)|0);
      var $28=HEAP32[(($fd)>>2)];
      $F=$28;
      var $29=$p_addr;
      var $bk=(($29+12)|0);
      var $30=HEAP32[(($bk)>>2)];
      $B=$30;
      var $31=$prevsize;
      var $shr16=$31 >>> 3;
      $I=$shr16;
      var $32=$F;
      var $33=$I;
      var $shl=$33 << 1;
      var $34=$m_addr;
      var $smallbins=(($34+40)|0);
      var $arrayidx=(($smallbins+($shl<<2))|0);
      var $35=$arrayidx;
      var $36=$35;
      var $cmp17=(($32)|(0))==(($36)|(0));
      if ($cmp17) { var $45 = 1;label = 12; break; } else { label = 9; break; }
    case 9: 
      var $37=$F;
      var $38=$37;
      var $39=$m_addr;
      var $least_addr19=(($39+16)|0);
      var $40=HEAP32[(($least_addr19)>>2)];
      var $cmp20=(($38)>>>(0)) >= (($40)>>>(0));
      if ($cmp20) { label = 10; break; } else { var $44 = 0;label = 11; break; }
    case 10: 
      var $41=$F;
      var $bk22=(($41+12)|0);
      var $42=HEAP32[(($bk22)>>2)];
      var $43=$p_addr;
      var $cmp23=(($42)|(0))==(($43)|(0));
      var $44 = $cmp23;label = 11; break;
    case 11: 
      var $44;
      var $45 = $44;label = 12; break;
    case 12: 
      var $45;
      var $lor_ext=(($45)&(1));
      var $expval25=($lor_ext);
      var $tobool26=(($expval25)|(0))!=0;
      if ($tobool26) { label = 13; break; } else { label = 24; break; }
    case 13: 
      var $46=$B;
      var $47=$F;
      var $cmp28=(($46)|(0))==(($47)|(0));
      if ($cmp28) { label = 14; break; } else { label = 15; break; }
    case 14: 
      var $48=$I;
      var $shl31=1 << $48;
      var $neg=$shl31 ^ -1;
      var $49=$m_addr;
      var $smallmap=(($49)|0);
      var $50=HEAP32[(($smallmap)>>2)];
      var $and32=$50 & $neg;
      HEAP32[(($smallmap)>>2)]=$and32;
      label = 23; break;
    case 15: 
      var $51=$B;
      var $52=$I;
      var $shl33=$52 << 1;
      var $53=$m_addr;
      var $smallbins34=(($53+40)|0);
      var $arrayidx35=(($smallbins34+($shl33<<2))|0);
      var $54=$arrayidx35;
      var $55=$54;
      var $cmp36=(($51)|(0))==(($55)|(0));
      if ($cmp36) { var $64 = 1;label = 19; break; } else { label = 16; break; }
    case 16: 
      var $56=$B;
      var $57=$56;
      var $58=$m_addr;
      var $least_addr39=(($58+16)|0);
      var $59=HEAP32[(($least_addr39)>>2)];
      var $cmp40=(($57)>>>(0)) >= (($59)>>>(0));
      if ($cmp40) { label = 17; break; } else { var $63 = 0;label = 18; break; }
    case 17: 
      var $60=$B;
      var $fd43=(($60+8)|0);
      var $61=HEAP32[(($fd43)>>2)];
      var $62=$p_addr;
      var $cmp44=(($61)|(0))==(($62)|(0));
      var $63 = $cmp44;label = 18; break;
    case 18: 
      var $63;
      var $64 = $63;label = 19; break;
    case 19: 
      var $64;
      var $lor_ext48=(($64)&(1));
      var $expval49=($lor_ext48);
      var $tobool50=(($expval49)|(0))!=0;
      if ($tobool50) { label = 20; break; } else { label = 21; break; }
    case 20: 
      var $65=$B;
      var $66=$F;
      var $bk52=(($66+12)|0);
      HEAP32[(($bk52)>>2)]=$65;
      var $67=$F;
      var $68=$B;
      var $fd53=(($68+8)|0);
      HEAP32[(($fd53)>>2)]=$67;
      label = 22; break;
    case 21: 
      _abort();
      throw "Reached an unreachable!"
    case 22: 
      label = 23; break;
    case 23: 
      label = 25; break;
    case 24: 
      _abort();
      throw "Reached an unreachable!"
    case 25: 
      label = 75; break;
    case 26: 
      var $69=$p_addr;
      var $70=$69;
      $TP=$70;
      var $71=$TP;
      var $parent=(($71+24)|0);
      var $72=HEAP32[(($parent)>>2)];
      $XP=$72;
      var $73=$TP;
      var $bk60=(($73+12)|0);
      var $74=HEAP32[(($bk60)>>2)];
      var $75=$TP;
      var $cmp61=(($74)|(0))!=(($75)|(0));
      if ($cmp61) { label = 27; break; } else { label = 34; break; }
    case 27: 
      var $76=$TP;
      var $fd65=(($76+8)|0);
      var $77=HEAP32[(($fd65)>>2)];
      $F64=$77;
      var $78=$TP;
      var $bk66=(($78+12)|0);
      var $79=HEAP32[(($bk66)>>2)];
      $R=$79;
      var $80=$F64;
      var $81=$80;
      var $82=$m_addr;
      var $least_addr67=(($82+16)|0);
      var $83=HEAP32[(($least_addr67)>>2)];
      var $cmp68=(($81)>>>(0)) >= (($83)>>>(0));
      if ($cmp68) { label = 28; break; } else { var $90 = 0;label = 30; break; }
    case 28: 
      var $84=$F64;
      var $bk70=(($84+12)|0);
      var $85=HEAP32[(($bk70)>>2)];
      var $86=$TP;
      var $cmp71=(($85)|(0))==(($86)|(0));
      if ($cmp71) { label = 29; break; } else { var $90 = 0;label = 30; break; }
    case 29: 
      var $87=$R;
      var $fd74=(($87+8)|0);
      var $88=HEAP32[(($fd74)>>2)];
      var $89=$TP;
      var $cmp75=(($88)|(0))==(($89)|(0));
      var $90 = $cmp75;label = 30; break;
    case 30: 
      var $90;
      var $land_ext=(($90)&(1));
      var $expval78=($land_ext);
      var $tobool79=(($expval78)|(0))!=0;
      if ($tobool79) { label = 31; break; } else { label = 32; break; }
    case 31: 
      var $91=$R;
      var $92=$F64;
      var $bk81=(($92+12)|0);
      HEAP32[(($bk81)>>2)]=$91;
      var $93=$F64;
      var $94=$R;
      var $fd82=(($94+8)|0);
      HEAP32[(($fd82)>>2)]=$93;
      label = 33; break;
    case 32: 
      _abort();
      throw "Reached an unreachable!"
    case 33: 
      label = 46; break;
    case 34: 
      var $95=$TP;
      var $child=(($95+16)|0);
      var $arrayidx86=(($child+4)|0);
      $RP=$arrayidx86;
      var $96=HEAP32[(($arrayidx86)>>2)];
      $R=$96;
      var $cmp87=(($96)|(0))!=0;
      if ($cmp87) { label = 36; break; } else { label = 35; break; }
    case 35: 
      var $97=$TP;
      var $child89=(($97+16)|0);
      var $arrayidx90=(($child89)|0);
      $RP=$arrayidx90;
      var $98=HEAP32[(($arrayidx90)>>2)];
      $R=$98;
      var $cmp91=(($98)|(0))!=0;
      if ($cmp91) { label = 36; break; } else { label = 45; break; }
    case 36: 
      label = 37; break;
    case 37: 
      var $99=$R;
      var $child94=(($99+16)|0);
      var $arrayidx95=(($child94+4)|0);
      $CP=$arrayidx95;
      var $100=HEAP32[(($arrayidx95)>>2)];
      var $cmp96=(($100)|(0))!=0;
      if ($cmp96) { var $103 = 1;label = 39; break; } else { label = 38; break; }
    case 38: 
      var $101=$R;
      var $child99=(($101+16)|0);
      var $arrayidx100=(($child99)|0);
      $CP=$arrayidx100;
      var $102=HEAP32[(($arrayidx100)>>2)];
      var $cmp101=(($102)|(0))!=0;
      var $103 = $cmp101;label = 39; break;
    case 39: 
      var $103;
      if ($103) { label = 40; break; } else { label = 41; break; }
    case 40: 
      var $104=$CP;
      $RP=$104;
      var $105=HEAP32[(($104)>>2)];
      $R=$105;
      label = 37; break;
    case 41: 
      var $106=$RP;
      var $107=$106;
      var $108=$m_addr;
      var $least_addr105=(($108+16)|0);
      var $109=HEAP32[(($least_addr105)>>2)];
      var $cmp106=(($107)>>>(0)) >= (($109)>>>(0));
      var $conv107=(($cmp106)&(1));
      var $expval108=($conv107);
      var $tobool109=(($expval108)|(0))!=0;
      if ($tobool109) { label = 42; break; } else { label = 43; break; }
    case 42: 
      var $110=$RP;
      HEAP32[(($110)>>2)]=0;
      label = 44; break;
    case 43: 
      _abort();
      throw "Reached an unreachable!"
    case 44: 
      label = 45; break;
    case 45: 
      label = 46; break;
    case 46: 
      var $111=$XP;
      var $cmp115=(($111)|(0))!=0;
      if ($cmp115) { label = 47; break; } else { label = 74; break; }
    case 47: 
      var $112=$TP;
      var $index=(($112+28)|0);
      var $113=HEAP32[(($index)>>2)];
      var $114=$m_addr;
      var $treebins=(($114+304)|0);
      var $arrayidx118=(($treebins+($113<<2))|0);
      $H=$arrayidx118;
      var $115=$TP;
      var $116=$H;
      var $117=HEAP32[(($116)>>2)];
      var $cmp119=(($115)|(0))==(($117)|(0));
      if ($cmp119) { label = 48; break; } else { label = 51; break; }
    case 48: 
      var $118=$R;
      var $119=$H;
      HEAP32[(($119)>>2)]=$118;
      var $cmp122=(($118)|(0))==0;
      if ($cmp122) { label = 49; break; } else { label = 50; break; }
    case 49: 
      var $120=$TP;
      var $index125=(($120+28)|0);
      var $121=HEAP32[(($index125)>>2)];
      var $shl126=1 << $121;
      var $neg127=$shl126 ^ -1;
      var $122=$m_addr;
      var $treemap=(($122+4)|0);
      var $123=HEAP32[(($treemap)>>2)];
      var $and128=$123 & $neg127;
      HEAP32[(($treemap)>>2)]=$and128;
      label = 50; break;
    case 50: 
      label = 58; break;
    case 51: 
      var $124=$XP;
      var $125=$124;
      var $126=$m_addr;
      var $least_addr131=(($126+16)|0);
      var $127=HEAP32[(($least_addr131)>>2)];
      var $cmp132=(($125)>>>(0)) >= (($127)>>>(0));
      var $conv133=(($cmp132)&(1));
      var $expval134=($conv133);
      var $tobool135=(($expval134)|(0))!=0;
      if ($tobool135) { label = 52; break; } else { label = 56; break; }
    case 52: 
      var $128=$XP;
      var $child137=(($128+16)|0);
      var $arrayidx138=(($child137)|0);
      var $129=HEAP32[(($arrayidx138)>>2)];
      var $130=$TP;
      var $cmp139=(($129)|(0))==(($130)|(0));
      if ($cmp139) { label = 53; break; } else { label = 54; break; }
    case 53: 
      var $131=$R;
      var $132=$XP;
      var $child142=(($132+16)|0);
      var $arrayidx143=(($child142)|0);
      HEAP32[(($arrayidx143)>>2)]=$131;
      label = 55; break;
    case 54: 
      var $133=$R;
      var $134=$XP;
      var $child145=(($134+16)|0);
      var $arrayidx146=(($child145+4)|0);
      HEAP32[(($arrayidx146)>>2)]=$133;
      label = 55; break;
    case 55: 
      label = 57; break;
    case 56: 
      _abort();
      throw "Reached an unreachable!"
    case 57: 
      label = 58; break;
    case 58: 
      var $135=$R;
      var $cmp151=(($135)|(0))!=0;
      if ($cmp151) { label = 59; break; } else { label = 73; break; }
    case 59: 
      var $136=$R;
      var $137=$136;
      var $138=$m_addr;
      var $least_addr154=(($138+16)|0);
      var $139=HEAP32[(($least_addr154)>>2)];
      var $cmp155=(($137)>>>(0)) >= (($139)>>>(0));
      var $conv156=(($cmp155)&(1));
      var $expval157=($conv156);
      var $tobool158=(($expval157)|(0))!=0;
      if ($tobool158) { label = 60; break; } else { label = 71; break; }
    case 60: 
      var $140=$XP;
      var $141=$R;
      var $parent160=(($141+24)|0);
      HEAP32[(($parent160)>>2)]=$140;
      var $142=$TP;
      var $child161=(($142+16)|0);
      var $arrayidx162=(($child161)|0);
      var $143=HEAP32[(($arrayidx162)>>2)];
      $C0=$143;
      var $cmp163=(($143)|(0))!=0;
      if ($cmp163) { label = 61; break; } else { label = 65; break; }
    case 61: 
      var $144=$C0;
      var $145=$144;
      var $146=$m_addr;
      var $least_addr166=(($146+16)|0);
      var $147=HEAP32[(($least_addr166)>>2)];
      var $cmp167=(($145)>>>(0)) >= (($147)>>>(0));
      var $conv168=(($cmp167)&(1));
      var $expval169=($conv168);
      var $tobool170=(($expval169)|(0))!=0;
      if ($tobool170) { label = 62; break; } else { label = 63; break; }
    case 62: 
      var $148=$C0;
      var $149=$R;
      var $child172=(($149+16)|0);
      var $arrayidx173=(($child172)|0);
      HEAP32[(($arrayidx173)>>2)]=$148;
      var $150=$R;
      var $151=$C0;
      var $parent174=(($151+24)|0);
      HEAP32[(($parent174)>>2)]=$150;
      label = 64; break;
    case 63: 
      _abort();
      throw "Reached an unreachable!"
    case 64: 
      label = 65; break;
    case 65: 
      var $152=$TP;
      var $child178=(($152+16)|0);
      var $arrayidx179=(($child178+4)|0);
      var $153=HEAP32[(($arrayidx179)>>2)];
      $C1=$153;
      var $cmp180=(($153)|(0))!=0;
      if ($cmp180) { label = 66; break; } else { label = 70; break; }
    case 66: 
      var $154=$C1;
      var $155=$154;
      var $156=$m_addr;
      var $least_addr183=(($156+16)|0);
      var $157=HEAP32[(($least_addr183)>>2)];
      var $cmp184=(($155)>>>(0)) >= (($157)>>>(0));
      var $conv185=(($cmp184)&(1));
      var $expval186=($conv185);
      var $tobool187=(($expval186)|(0))!=0;
      if ($tobool187) { label = 67; break; } else { label = 68; break; }
    case 67: 
      var $158=$C1;
      var $159=$R;
      var $child189=(($159+16)|0);
      var $arrayidx190=(($child189+4)|0);
      HEAP32[(($arrayidx190)>>2)]=$158;
      var $160=$R;
      var $161=$C1;
      var $parent191=(($161+24)|0);
      HEAP32[(($parent191)>>2)]=$160;
      label = 69; break;
    case 68: 
      _abort();
      throw "Reached an unreachable!"
    case 69: 
      label = 70; break;
    case 70: 
      label = 72; break;
    case 71: 
      _abort();
      throw "Reached an unreachable!"
    case 72: 
      label = 73; break;
    case 73: 
      label = 74; break;
    case 74: 
      label = 75; break;
    case 75: 
      label = 79; break;
    case 76: 
      var $162=$next;
      var $head201=(($162+4)|0);
      var $163=HEAP32[(($head201)>>2)];
      var $and202=$163 & 3;
      var $cmp203=(($and202)|(0))==3;
      if ($cmp203) { label = 77; break; } else { label = 78; break; }
    case 77: 
      var $164=$psize_addr;
      var $165=$m_addr;
      var $dvsize=(($165+8)|0);
      HEAP32[(($dvsize)>>2)]=$164;
      var $166=$next;
      var $head206=(($166+4)|0);
      var $167=HEAP32[(($head206)>>2)];
      var $and207=$167 & -2;
      HEAP32[(($head206)>>2)]=$and207;
      var $168=$psize_addr;
      var $or=$168 | 1;
      var $169=$p_addr;
      var $head208=(($169+4)|0);
      HEAP32[(($head208)>>2)]=$or;
      var $170=$psize_addr;
      var $171=$p_addr;
      var $172=$171;
      var $173=$psize_addr;
      var $add_ptr209=(($172+$173)|0);
      var $174=$add_ptr209;
      var $prev_foot210=(($174)|0);
      HEAP32[(($prev_foot210)>>2)]=$170;
      label = 201; break;
    case 78: 
      label = 79; break;
    case 79: 
      label = 81; break;
    case 80: 
      _abort();
      throw "Reached an unreachable!"
    case 81: 
      label = 82; break;
    case 82: 
      var $175=$next;
      var $176=$175;
      var $177=$m_addr;
      var $least_addr216=(($177+16)|0);
      var $178=HEAP32[(($least_addr216)>>2)];
      var $cmp217=(($176)>>>(0)) >= (($178)>>>(0));
      var $conv218=(($cmp217)&(1));
      var $expval219=($conv218);
      var $tobool220=(($expval219)|(0))!=0;
      if ($tobool220) { label = 83; break; } else { label = 200; break; }
    case 83: 
      var $179=$next;
      var $head222=(($179+4)|0);
      var $180=HEAP32[(($head222)>>2)];
      var $and223=$180 & 2;
      var $tobool224=(($and223)|(0))!=0;
      if ($tobool224) { label = 163; break; } else { label = 84; break; }
    case 84: 
      var $181=$next;
      var $182=$m_addr;
      var $top=(($182+24)|0);
      var $183=HEAP32[(($top)>>2)];
      var $cmp226=(($181)|(0))==(($183)|(0));
      if ($cmp226) { label = 85; break; } else { label = 88; break; }
    case 85: 
      var $184=$psize_addr;
      var $185=$m_addr;
      var $topsize=(($185+12)|0);
      var $186=HEAP32[(($topsize)>>2)];
      var $add229=((($186)+($184))|0);
      HEAP32[(($topsize)>>2)]=$add229;
      $tsize=$add229;
      var $187=$p_addr;
      var $188=$m_addr;
      var $top230=(($188+24)|0);
      HEAP32[(($top230)>>2)]=$187;
      var $189=$tsize;
      var $or231=$189 | 1;
      var $190=$p_addr;
      var $head232=(($190+4)|0);
      HEAP32[(($head232)>>2)]=$or231;
      var $191=$p_addr;
      var $192=$m_addr;
      var $dv233=(($192+20)|0);
      var $193=HEAP32[(($dv233)>>2)];
      var $cmp234=(($191)|(0))==(($193)|(0));
      if ($cmp234) { label = 86; break; } else { label = 87; break; }
    case 86: 
      var $194=$m_addr;
      var $dv237=(($194+20)|0);
      HEAP32[(($dv237)>>2)]=0;
      var $195=$m_addr;
      var $dvsize238=(($195+8)|0);
      HEAP32[(($dvsize238)>>2)]=0;
      label = 87; break;
    case 87: 
      label = 201; break;
    case 88: 
      var $196=$next;
      var $197=$m_addr;
      var $dv241=(($197+20)|0);
      var $198=HEAP32[(($dv241)>>2)];
      var $cmp242=(($196)|(0))==(($198)|(0));
      if ($cmp242) { label = 89; break; } else { label = 90; break; }
    case 89: 
      var $199=$psize_addr;
      var $200=$m_addr;
      var $dvsize245=(($200+8)|0);
      var $201=HEAP32[(($dvsize245)>>2)];
      var $add246=((($201)+($199))|0);
      HEAP32[(($dvsize245)>>2)]=$add246;
      $dsize=$add246;
      var $202=$p_addr;
      var $203=$m_addr;
      var $dv247=(($203+20)|0);
      HEAP32[(($dv247)>>2)]=$202;
      var $204=$dsize;
      var $or248=$204 | 1;
      var $205=$p_addr;
      var $head249=(($205+4)|0);
      HEAP32[(($head249)>>2)]=$or248;
      var $206=$dsize;
      var $207=$p_addr;
      var $208=$207;
      var $209=$dsize;
      var $add_ptr250=(($208+$209)|0);
      var $210=$add_ptr250;
      var $prev_foot251=(($210)|0);
      HEAP32[(($prev_foot251)>>2)]=$206;
      label = 201; break;
    case 90: 
      var $211=$next;
      var $head253=(($211+4)|0);
      var $212=HEAP32[(($head253)>>2)];
      var $and254=$212 & -8;
      $nsize=$and254;
      var $213=$nsize;
      var $214=$psize_addr;
      var $add255=((($214)+($213))|0);
      $psize_addr=$add255;
      var $215=$nsize;
      var $shr256=$215 >>> 3;
      var $cmp257=(($shr256)>>>(0)) < 32;
      if ($cmp257) { label = 91; break; } else { label = 109; break; }
    case 91: 
      var $216=$next;
      var $fd261=(($216+8)|0);
      var $217=HEAP32[(($fd261)>>2)];
      $F260=$217;
      var $218=$next;
      var $bk263=(($218+12)|0);
      var $219=HEAP32[(($bk263)>>2)];
      $B262=$219;
      var $220=$nsize;
      var $shr265=$220 >>> 3;
      $I264=$shr265;
      var $221=$F260;
      var $222=$I264;
      var $shl266=$222 << 1;
      var $223=$m_addr;
      var $smallbins267=(($223+40)|0);
      var $arrayidx268=(($smallbins267+($shl266<<2))|0);
      var $224=$arrayidx268;
      var $225=$224;
      var $cmp269=(($221)|(0))==(($225)|(0));
      if ($cmp269) { var $234 = 1;label = 95; break; } else { label = 92; break; }
    case 92: 
      var $226=$F260;
      var $227=$226;
      var $228=$m_addr;
      var $least_addr272=(($228+16)|0);
      var $229=HEAP32[(($least_addr272)>>2)];
      var $cmp273=(($227)>>>(0)) >= (($229)>>>(0));
      if ($cmp273) { label = 93; break; } else { var $233 = 0;label = 94; break; }
    case 93: 
      var $230=$F260;
      var $bk276=(($230+12)|0);
      var $231=HEAP32[(($bk276)>>2)];
      var $232=$next;
      var $cmp277=(($231)|(0))==(($232)|(0));
      var $233 = $cmp277;label = 94; break;
    case 94: 
      var $233;
      var $234 = $233;label = 95; break;
    case 95: 
      var $234;
      var $lor_ext282=(($234)&(1));
      var $expval283=($lor_ext282);
      var $tobool284=(($expval283)|(0))!=0;
      if ($tobool284) { label = 96; break; } else { label = 107; break; }
    case 96: 
      var $235=$B262;
      var $236=$F260;
      var $cmp286=(($235)|(0))==(($236)|(0));
      if ($cmp286) { label = 97; break; } else { label = 98; break; }
    case 97: 
      var $237=$I264;
      var $shl289=1 << $237;
      var $neg290=$shl289 ^ -1;
      var $238=$m_addr;
      var $smallmap291=(($238)|0);
      var $239=HEAP32[(($smallmap291)>>2)];
      var $and292=$239 & $neg290;
      HEAP32[(($smallmap291)>>2)]=$and292;
      label = 106; break;
    case 98: 
      var $240=$B262;
      var $241=$I264;
      var $shl294=$241 << 1;
      var $242=$m_addr;
      var $smallbins295=(($242+40)|0);
      var $arrayidx296=(($smallbins295+($shl294<<2))|0);
      var $243=$arrayidx296;
      var $244=$243;
      var $cmp297=(($240)|(0))==(($244)|(0));
      if ($cmp297) { var $253 = 1;label = 102; break; } else { label = 99; break; }
    case 99: 
      var $245=$B262;
      var $246=$245;
      var $247=$m_addr;
      var $least_addr300=(($247+16)|0);
      var $248=HEAP32[(($least_addr300)>>2)];
      var $cmp301=(($246)>>>(0)) >= (($248)>>>(0));
      if ($cmp301) { label = 100; break; } else { var $252 = 0;label = 101; break; }
    case 100: 
      var $249=$B262;
      var $fd304=(($249+8)|0);
      var $250=HEAP32[(($fd304)>>2)];
      var $251=$next;
      var $cmp305=(($250)|(0))==(($251)|(0));
      var $252 = $cmp305;label = 101; break;
    case 101: 
      var $252;
      var $253 = $252;label = 102; break;
    case 102: 
      var $253;
      var $lor_ext310=(($253)&(1));
      var $expval311=($lor_ext310);
      var $tobool312=(($expval311)|(0))!=0;
      if ($tobool312) { label = 103; break; } else { label = 104; break; }
    case 103: 
      var $254=$B262;
      var $255=$F260;
      var $bk314=(($255+12)|0);
      HEAP32[(($bk314)>>2)]=$254;
      var $256=$F260;
      var $257=$B262;
      var $fd315=(($257+8)|0);
      HEAP32[(($fd315)>>2)]=$256;
      label = 105; break;
    case 104: 
      _abort();
      throw "Reached an unreachable!"
    case 105: 
      label = 106; break;
    case 106: 
      label = 108; break;
    case 107: 
      _abort();
      throw "Reached an unreachable!"
    case 108: 
      label = 158; break;
    case 109: 
      var $258=$next;
      var $259=$258;
      $TP322=$259;
      var $260=$TP322;
      var $parent324=(($260+24)|0);
      var $261=HEAP32[(($parent324)>>2)];
      $XP323=$261;
      var $262=$TP322;
      var $bk326=(($262+12)|0);
      var $263=HEAP32[(($bk326)>>2)];
      var $264=$TP322;
      var $cmp327=(($263)|(0))!=(($264)|(0));
      if ($cmp327) { label = 110; break; } else { label = 117; break; }
    case 110: 
      var $265=$TP322;
      var $fd331=(($265+8)|0);
      var $266=HEAP32[(($fd331)>>2)];
      $F330=$266;
      var $267=$TP322;
      var $bk332=(($267+12)|0);
      var $268=HEAP32[(($bk332)>>2)];
      $R325=$268;
      var $269=$F330;
      var $270=$269;
      var $271=$m_addr;
      var $least_addr333=(($271+16)|0);
      var $272=HEAP32[(($least_addr333)>>2)];
      var $cmp334=(($270)>>>(0)) >= (($272)>>>(0));
      if ($cmp334) { label = 111; break; } else { var $279 = 0;label = 113; break; }
    case 111: 
      var $273=$F330;
      var $bk337=(($273+12)|0);
      var $274=HEAP32[(($bk337)>>2)];
      var $275=$TP322;
      var $cmp338=(($274)|(0))==(($275)|(0));
      if ($cmp338) { label = 112; break; } else { var $279 = 0;label = 113; break; }
    case 112: 
      var $276=$R325;
      var $fd341=(($276+8)|0);
      var $277=HEAP32[(($fd341)>>2)];
      var $278=$TP322;
      var $cmp342=(($277)|(0))==(($278)|(0));
      var $279 = $cmp342;label = 113; break;
    case 113: 
      var $279;
      var $land_ext345=(($279)&(1));
      var $expval346=($land_ext345);
      var $tobool347=(($expval346)|(0))!=0;
      if ($tobool347) { label = 114; break; } else { label = 115; break; }
    case 114: 
      var $280=$R325;
      var $281=$F330;
      var $bk349=(($281+12)|0);
      HEAP32[(($bk349)>>2)]=$280;
      var $282=$F330;
      var $283=$R325;
      var $fd350=(($283+8)|0);
      HEAP32[(($fd350)>>2)]=$282;
      label = 116; break;
    case 115: 
      _abort();
      throw "Reached an unreachable!"
    case 116: 
      label = 129; break;
    case 117: 
      var $284=$TP322;
      var $child355=(($284+16)|0);
      var $arrayidx356=(($child355+4)|0);
      $RP354=$arrayidx356;
      var $285=HEAP32[(($arrayidx356)>>2)];
      $R325=$285;
      var $cmp357=(($285)|(0))!=0;
      if ($cmp357) { label = 119; break; } else { label = 118; break; }
    case 118: 
      var $286=$TP322;
      var $child360=(($286+16)|0);
      var $arrayidx361=(($child360)|0);
      $RP354=$arrayidx361;
      var $287=HEAP32[(($arrayidx361)>>2)];
      $R325=$287;
      var $cmp362=(($287)|(0))!=0;
      if ($cmp362) { label = 119; break; } else { label = 128; break; }
    case 119: 
      label = 120; break;
    case 120: 
      var $288=$R325;
      var $child367=(($288+16)|0);
      var $arrayidx368=(($child367+4)|0);
      $CP365=$arrayidx368;
      var $289=HEAP32[(($arrayidx368)>>2)];
      var $cmp369=(($289)|(0))!=0;
      if ($cmp369) { var $292 = 1;label = 122; break; } else { label = 121; break; }
    case 121: 
      var $290=$R325;
      var $child372=(($290+16)|0);
      var $arrayidx373=(($child372)|0);
      $CP365=$arrayidx373;
      var $291=HEAP32[(($arrayidx373)>>2)];
      var $cmp374=(($291)|(0))!=0;
      var $292 = $cmp374;label = 122; break;
    case 122: 
      var $292;
      if ($292) { label = 123; break; } else { label = 124; break; }
    case 123: 
      var $293=$CP365;
      $RP354=$293;
      var $294=HEAP32[(($293)>>2)];
      $R325=$294;
      label = 120; break;
    case 124: 
      var $295=$RP354;
      var $296=$295;
      var $297=$m_addr;
      var $least_addr380=(($297+16)|0);
      var $298=HEAP32[(($least_addr380)>>2)];
      var $cmp381=(($296)>>>(0)) >= (($298)>>>(0));
      var $conv382=(($cmp381)&(1));
      var $expval383=($conv382);
      var $tobool384=(($expval383)|(0))!=0;
      if ($tobool384) { label = 125; break; } else { label = 126; break; }
    case 125: 
      var $299=$RP354;
      HEAP32[(($299)>>2)]=0;
      label = 127; break;
    case 126: 
      _abort();
      throw "Reached an unreachable!"
    case 127: 
      label = 128; break;
    case 128: 
      label = 129; break;
    case 129: 
      var $300=$XP323;
      var $cmp390=(($300)|(0))!=0;
      if ($cmp390) { label = 130; break; } else { label = 157; break; }
    case 130: 
      var $301=$TP322;
      var $index394=(($301+28)|0);
      var $302=HEAP32[(($index394)>>2)];
      var $303=$m_addr;
      var $treebins395=(($303+304)|0);
      var $arrayidx396=(($treebins395+($302<<2))|0);
      $H393=$arrayidx396;
      var $304=$TP322;
      var $305=$H393;
      var $306=HEAP32[(($305)>>2)];
      var $cmp397=(($304)|(0))==(($306)|(0));
      if ($cmp397) { label = 131; break; } else { label = 134; break; }
    case 131: 
      var $307=$R325;
      var $308=$H393;
      HEAP32[(($308)>>2)]=$307;
      var $cmp400=(($307)|(0))==0;
      if ($cmp400) { label = 132; break; } else { label = 133; break; }
    case 132: 
      var $309=$TP322;
      var $index403=(($309+28)|0);
      var $310=HEAP32[(($index403)>>2)];
      var $shl404=1 << $310;
      var $neg405=$shl404 ^ -1;
      var $311=$m_addr;
      var $treemap406=(($311+4)|0);
      var $312=HEAP32[(($treemap406)>>2)];
      var $and407=$312 & $neg405;
      HEAP32[(($treemap406)>>2)]=$and407;
      label = 133; break;
    case 133: 
      label = 141; break;
    case 134: 
      var $313=$XP323;
      var $314=$313;
      var $315=$m_addr;
      var $least_addr410=(($315+16)|0);
      var $316=HEAP32[(($least_addr410)>>2)];
      var $cmp411=(($314)>>>(0)) >= (($316)>>>(0));
      var $conv412=(($cmp411)&(1));
      var $expval413=($conv412);
      var $tobool414=(($expval413)|(0))!=0;
      if ($tobool414) { label = 135; break; } else { label = 139; break; }
    case 135: 
      var $317=$XP323;
      var $child416=(($317+16)|0);
      var $arrayidx417=(($child416)|0);
      var $318=HEAP32[(($arrayidx417)>>2)];
      var $319=$TP322;
      var $cmp418=(($318)|(0))==(($319)|(0));
      if ($cmp418) { label = 136; break; } else { label = 137; break; }
    case 136: 
      var $320=$R325;
      var $321=$XP323;
      var $child421=(($321+16)|0);
      var $arrayidx422=(($child421)|0);
      HEAP32[(($arrayidx422)>>2)]=$320;
      label = 138; break;
    case 137: 
      var $322=$R325;
      var $323=$XP323;
      var $child424=(($323+16)|0);
      var $arrayidx425=(($child424+4)|0);
      HEAP32[(($arrayidx425)>>2)]=$322;
      label = 138; break;
    case 138: 
      label = 140; break;
    case 139: 
      _abort();
      throw "Reached an unreachable!"
    case 140: 
      label = 141; break;
    case 141: 
      var $324=$R325;
      var $cmp430=(($324)|(0))!=0;
      if ($cmp430) { label = 142; break; } else { label = 156; break; }
    case 142: 
      var $325=$R325;
      var $326=$325;
      var $327=$m_addr;
      var $least_addr433=(($327+16)|0);
      var $328=HEAP32[(($least_addr433)>>2)];
      var $cmp434=(($326)>>>(0)) >= (($328)>>>(0));
      var $conv435=(($cmp434)&(1));
      var $expval436=($conv435);
      var $tobool437=(($expval436)|(0))!=0;
      if ($tobool437) { label = 143; break; } else { label = 154; break; }
    case 143: 
      var $329=$XP323;
      var $330=$R325;
      var $parent441=(($330+24)|0);
      HEAP32[(($parent441)>>2)]=$329;
      var $331=$TP322;
      var $child442=(($331+16)|0);
      var $arrayidx443=(($child442)|0);
      var $332=HEAP32[(($arrayidx443)>>2)];
      $C0439=$332;
      var $cmp444=(($332)|(0))!=0;
      if ($cmp444) { label = 144; break; } else { label = 148; break; }
    case 144: 
      var $333=$C0439;
      var $334=$333;
      var $335=$m_addr;
      var $least_addr447=(($335+16)|0);
      var $336=HEAP32[(($least_addr447)>>2)];
      var $cmp448=(($334)>>>(0)) >= (($336)>>>(0));
      var $conv449=(($cmp448)&(1));
      var $expval450=($conv449);
      var $tobool451=(($expval450)|(0))!=0;
      if ($tobool451) { label = 145; break; } else { label = 146; break; }
    case 145: 
      var $337=$C0439;
      var $338=$R325;
      var $child453=(($338+16)|0);
      var $arrayidx454=(($child453)|0);
      HEAP32[(($arrayidx454)>>2)]=$337;
      var $339=$R325;
      var $340=$C0439;
      var $parent455=(($340+24)|0);
      HEAP32[(($parent455)>>2)]=$339;
      label = 147; break;
    case 146: 
      _abort();
      throw "Reached an unreachable!"
    case 147: 
      label = 148; break;
    case 148: 
      var $341=$TP322;
      var $child459=(($341+16)|0);
      var $arrayidx460=(($child459+4)|0);
      var $342=HEAP32[(($arrayidx460)>>2)];
      $C1440=$342;
      var $cmp461=(($342)|(0))!=0;
      if ($cmp461) { label = 149; break; } else { label = 153; break; }
    case 149: 
      var $343=$C1440;
      var $344=$343;
      var $345=$m_addr;
      var $least_addr464=(($345+16)|0);
      var $346=HEAP32[(($least_addr464)>>2)];
      var $cmp465=(($344)>>>(0)) >= (($346)>>>(0));
      var $conv466=(($cmp465)&(1));
      var $expval467=($conv466);
      var $tobool468=(($expval467)|(0))!=0;
      if ($tobool468) { label = 150; break; } else { label = 151; break; }
    case 150: 
      var $347=$C1440;
      var $348=$R325;
      var $child470=(($348+16)|0);
      var $arrayidx471=(($child470+4)|0);
      HEAP32[(($arrayidx471)>>2)]=$347;
      var $349=$R325;
      var $350=$C1440;
      var $parent472=(($350+24)|0);
      HEAP32[(($parent472)>>2)]=$349;
      label = 152; break;
    case 151: 
      _abort();
      throw "Reached an unreachable!"
    case 152: 
      label = 153; break;
    case 153: 
      label = 155; break;
    case 154: 
      _abort();
      throw "Reached an unreachable!"
    case 155: 
      label = 156; break;
    case 156: 
      label = 157; break;
    case 157: 
      label = 158; break;
    case 158: 
      var $351=$psize_addr;
      var $or481=$351 | 1;
      var $352=$p_addr;
      var $head482=(($352+4)|0);
      HEAP32[(($head482)>>2)]=$or481;
      var $353=$psize_addr;
      var $354=$p_addr;
      var $355=$354;
      var $356=$psize_addr;
      var $add_ptr483=(($355+$356)|0);
      var $357=$add_ptr483;
      var $prev_foot484=(($357)|0);
      HEAP32[(($prev_foot484)>>2)]=$353;
      var $358=$p_addr;
      var $359=$m_addr;
      var $dv485=(($359+20)|0);
      var $360=HEAP32[(($dv485)>>2)];
      var $cmp486=(($358)|(0))==(($360)|(0));
      if ($cmp486) { label = 159; break; } else { label = 160; break; }
    case 159: 
      var $361=$psize_addr;
      var $362=$m_addr;
      var $dvsize489=(($362+8)|0);
      HEAP32[(($dvsize489)>>2)]=$361;
      label = 201; break;
    case 160: 
      label = 161; break;
    case 161: 
      label = 162; break;
    case 162: 
      label = 164; break;
    case 163: 
      var $363=$next;
      var $head494=(($363+4)|0);
      var $364=HEAP32[(($head494)>>2)];
      var $and495=$364 & -2;
      HEAP32[(($head494)>>2)]=$and495;
      var $365=$psize_addr;
      var $or496=$365 | 1;
      var $366=$p_addr;
      var $head497=(($366+4)|0);
      HEAP32[(($head497)>>2)]=$or496;
      var $367=$psize_addr;
      var $368=$p_addr;
      var $369=$368;
      var $370=$psize_addr;
      var $add_ptr498=(($369+$370)|0);
      var $371=$add_ptr498;
      var $prev_foot499=(($371)|0);
      HEAP32[(($prev_foot499)>>2)]=$367;
      label = 164; break;
    case 164: 
      var $372=$psize_addr;
      var $shr501=$372 >>> 3;
      var $cmp502=(($shr501)>>>(0)) < 32;
      if ($cmp502) { label = 165; break; } else { label = 172; break; }
    case 165: 
      var $373=$psize_addr;
      var $shr506=$373 >>> 3;
      $I505=$shr506;
      var $374=$I505;
      var $shl508=$374 << 1;
      var $375=$m_addr;
      var $smallbins509=(($375+40)|0);
      var $arrayidx510=(($smallbins509+($shl508<<2))|0);
      var $376=$arrayidx510;
      var $377=$376;
      $B507=$377;
      var $378=$B507;
      $F511=$378;
      var $379=$m_addr;
      var $smallmap512=(($379)|0);
      var $380=HEAP32[(($smallmap512)>>2)];
      var $381=$I505;
      var $shl513=1 << $381;
      var $and514=$380 & $shl513;
      var $tobool515=(($and514)|(0))!=0;
      if ($tobool515) { label = 167; break; } else { label = 166; break; }
    case 166: 
      var $382=$I505;
      var $shl517=1 << $382;
      var $383=$m_addr;
      var $smallmap518=(($383)|0);
      var $384=HEAP32[(($smallmap518)>>2)];
      var $or519=$384 | $shl517;
      HEAP32[(($smallmap518)>>2)]=$or519;
      label = 171; break;
    case 167: 
      var $385=$B507;
      var $fd521=(($385+8)|0);
      var $386=HEAP32[(($fd521)>>2)];
      var $387=$386;
      var $388=$m_addr;
      var $least_addr522=(($388+16)|0);
      var $389=HEAP32[(($least_addr522)>>2)];
      var $cmp523=(($387)>>>(0)) >= (($389)>>>(0));
      var $conv524=(($cmp523)&(1));
      var $expval525=($conv524);
      var $tobool526=(($expval525)|(0))!=0;
      if ($tobool526) { label = 168; break; } else { label = 169; break; }
    case 168: 
      var $390=$B507;
      var $fd528=(($390+8)|0);
      var $391=HEAP32[(($fd528)>>2)];
      $F511=$391;
      label = 170; break;
    case 169: 
      _abort();
      throw "Reached an unreachable!"
    case 170: 
      label = 171; break;
    case 171: 
      var $392=$p_addr;
      var $393=$B507;
      var $fd532=(($393+8)|0);
      HEAP32[(($fd532)>>2)]=$392;
      var $394=$p_addr;
      var $395=$F511;
      var $bk533=(($395+12)|0);
      HEAP32[(($bk533)>>2)]=$394;
      var $396=$F511;
      var $397=$p_addr;
      var $fd534=(($397+8)|0);
      HEAP32[(($fd534)>>2)]=$396;
      var $398=$B507;
      var $399=$p_addr;
      var $bk535=(($399+12)|0);
      HEAP32[(($bk535)>>2)]=$398;
      label = 199; break;
    case 172: 
      var $400=$p_addr;
      var $401=$400;
      $TP537=$401;
      var $402=$psize_addr;
      var $shr540=$402 >>> 8;
      $X=$shr540;
      var $403=$X;
      var $cmp541=(($403)|(0))==0;
      if ($cmp541) { label = 173; break; } else { label = 174; break; }
    case 173: 
      $I539=0;
      label = 178; break;
    case 174: 
      var $404=$X;
      var $cmp545=(($404)>>>(0)) > 65535;
      if ($cmp545) { label = 175; break; } else { label = 176; break; }
    case 175: 
      $I539=31;
      label = 177; break;
    case 176: 
      var $405=$X;
      $Y=$405;
      var $406=$Y;
      var $sub=((($406)-(256))|0);
      var $shr549=$sub >>> 16;
      var $and550=$shr549 & 8;
      $N=$and550;
      var $407=$N;
      var $408=$Y;
      var $shl551=$408 << $407;
      $Y=$shl551;
      var $sub552=((($shl551)-(4096))|0);
      var $shr553=$sub552 >>> 16;
      var $and554=$shr553 & 4;
      $K=$and554;
      var $409=$K;
      var $410=$N;
      var $add555=((($410)+($409))|0);
      $N=$add555;
      var $411=$K;
      var $412=$Y;
      var $shl556=$412 << $411;
      $Y=$shl556;
      var $sub557=((($shl556)-(16384))|0);
      var $shr558=$sub557 >>> 16;
      var $and559=$shr558 & 2;
      $K=$and559;
      var $413=$N;
      var $add560=((($413)+($and559))|0);
      $N=$add560;
      var $414=$N;
      var $sub561=(((14)-($414))|0);
      var $415=$K;
      var $416=$Y;
      var $shl562=$416 << $415;
      $Y=$shl562;
      var $shr563=$shl562 >>> 15;
      var $add564=((($sub561)+($shr563))|0);
      $K=$add564;
      var $417=$K;
      var $shl565=$417 << 1;
      var $418=$psize_addr;
      var $419=$K;
      var $add566=((($419)+(7))|0);
      var $shr567=$418 >>> (($add566)>>>(0));
      var $and568=$shr567 & 1;
      var $add569=((($shl565)+($and568))|0);
      $I539=$add569;
      label = 177; break;
    case 177: 
      label = 178; break;
    case 178: 
      var $420=$I539;
      var $421=$m_addr;
      var $treebins572=(($421+304)|0);
      var $arrayidx573=(($treebins572+($420<<2))|0);
      $H538=$arrayidx573;
      var $422=$I539;
      var $423=$TP537;
      var $index574=(($423+28)|0);
      HEAP32[(($index574)>>2)]=$422;
      var $424=$TP537;
      var $child575=(($424+16)|0);
      var $arrayidx576=(($child575+4)|0);
      HEAP32[(($arrayidx576)>>2)]=0;
      var $425=$TP537;
      var $child577=(($425+16)|0);
      var $arrayidx578=(($child577)|0);
      HEAP32[(($arrayidx578)>>2)]=0;
      var $426=$m_addr;
      var $treemap579=(($426+4)|0);
      var $427=HEAP32[(($treemap579)>>2)];
      var $428=$I539;
      var $shl580=1 << $428;
      var $and581=$427 & $shl580;
      var $tobool582=(($and581)|(0))!=0;
      if ($tobool582) { label = 180; break; } else { label = 179; break; }
    case 179: 
      var $429=$I539;
      var $shl584=1 << $429;
      var $430=$m_addr;
      var $treemap585=(($430+4)|0);
      var $431=HEAP32[(($treemap585)>>2)];
      var $or586=$431 | $shl584;
      HEAP32[(($treemap585)>>2)]=$or586;
      var $432=$TP537;
      var $433=$H538;
      HEAP32[(($433)>>2)]=$432;
      var $434=$H538;
      var $435=$434;
      var $436=$TP537;
      var $parent587=(($436+24)|0);
      HEAP32[(($parent587)>>2)]=$435;
      var $437=$TP537;
      var $438=$TP537;
      var $bk588=(($438+12)|0);
      HEAP32[(($bk588)>>2)]=$437;
      var $439=$TP537;
      var $fd589=(($439+8)|0);
      HEAP32[(($fd589)>>2)]=$437;
      label = 198; break;
    case 180: 
      var $440=$H538;
      var $441=HEAP32[(($440)>>2)];
      $T=$441;
      var $442=$psize_addr;
      var $443=$I539;
      var $cmp592=(($443)|(0))==31;
      if ($cmp592) { label = 181; break; } else { label = 182; break; }
    case 181: 
      var $cond = 0;label = 183; break;
    case 182: 
      var $444=$I539;
      var $shr594=$444 >>> 1;
      var $add595=((($shr594)+(8))|0);
      var $sub596=((($add595)-(2))|0);
      var $sub597=(((31)-($sub596))|0);
      var $cond = $sub597;label = 183; break;
    case 183: 
      var $cond;
      var $shl598=$442 << $cond;
      $K591=$shl598;
      label = 184; break;
    case 184: 
      var $445=$T;
      var $head599=(($445+4)|0);
      var $446=HEAP32[(($head599)>>2)];
      var $and600=$446 & -8;
      var $447=$psize_addr;
      var $cmp601=(($and600)|(0))!=(($447)|(0));
      if ($cmp601) { label = 185; break; } else { label = 191; break; }
    case 185: 
      var $448=$K591;
      var $shr604=$448 >>> 31;
      var $and605=$shr604 & 1;
      var $449=$T;
      var $child606=(($449+16)|0);
      var $arrayidx607=(($child606+($and605<<2))|0);
      $C=$arrayidx607;
      var $450=$K591;
      var $shl608=$450 << 1;
      $K591=$shl608;
      var $451=$C;
      var $452=HEAP32[(($451)>>2)];
      var $cmp609=(($452)|(0))!=0;
      if ($cmp609) { label = 186; break; } else { label = 187; break; }
    case 186: 
      var $453=$C;
      var $454=HEAP32[(($453)>>2)];
      $T=$454;
      label = 190; break;
    case 187: 
      var $455=$C;
      var $456=$455;
      var $457=$m_addr;
      var $least_addr613=(($457+16)|0);
      var $458=HEAP32[(($least_addr613)>>2)];
      var $cmp614=(($456)>>>(0)) >= (($458)>>>(0));
      var $conv615=(($cmp614)&(1));
      var $expval616=($conv615);
      var $tobool617=(($expval616)|(0))!=0;
      if ($tobool617) { label = 188; break; } else { label = 189; break; }
    case 188: 
      var $459=$TP537;
      var $460=$C;
      HEAP32[(($460)>>2)]=$459;
      var $461=$T;
      var $462=$TP537;
      var $parent619=(($462+24)|0);
      HEAP32[(($parent619)>>2)]=$461;
      var $463=$TP537;
      var $464=$TP537;
      var $bk620=(($464+12)|0);
      HEAP32[(($bk620)>>2)]=$463;
      var $465=$TP537;
      var $fd621=(($465+8)|0);
      HEAP32[(($fd621)>>2)]=$463;
      label = 197; break;
    case 189: 
      _abort();
      throw "Reached an unreachable!"
    case 190: 
      label = 196; break;
    case 191: 
      var $466=$T;
      var $fd626=(($466+8)|0);
      var $467=HEAP32[(($fd626)>>2)];
      $F625=$467;
      var $468=$T;
      var $469=$468;
      var $470=$m_addr;
      var $least_addr627=(($470+16)|0);
      var $471=HEAP32[(($least_addr627)>>2)];
      var $cmp628=(($469)>>>(0)) >= (($471)>>>(0));
      if ($cmp628) { label = 192; break; } else { var $476 = 0;label = 193; break; }
    case 192: 
      var $472=$F625;
      var $473=$472;
      var $474=$m_addr;
      var $least_addr631=(($474+16)|0);
      var $475=HEAP32[(($least_addr631)>>2)];
      var $cmp632=(($473)>>>(0)) >= (($475)>>>(0));
      var $476 = $cmp632;label = 193; break;
    case 193: 
      var $476;
      var $land_ext635=(($476)&(1));
      var $expval636=($land_ext635);
      var $tobool637=(($expval636)|(0))!=0;
      if ($tobool637) { label = 194; break; } else { label = 195; break; }
    case 194: 
      var $477=$TP537;
      var $478=$F625;
      var $bk639=(($478+12)|0);
      HEAP32[(($bk639)>>2)]=$477;
      var $479=$T;
      var $fd640=(($479+8)|0);
      HEAP32[(($fd640)>>2)]=$477;
      var $480=$F625;
      var $481=$TP537;
      var $fd641=(($481+8)|0);
      HEAP32[(($fd641)>>2)]=$480;
      var $482=$T;
      var $483=$TP537;
      var $bk642=(($483+12)|0);
      HEAP32[(($bk642)>>2)]=$482;
      var $484=$TP537;
      var $parent643=(($484+24)|0);
      HEAP32[(($parent643)>>2)]=0;
      label = 197; break;
    case 195: 
      _abort();
      throw "Reached an unreachable!"
    case 196: 
      label = 184; break;
    case 197: 
      label = 198; break;
    case 198: 
      label = 199; break;
    case 199: 
      label = 201; break;
    case 200: 
      _abort();
      throw "Reached an unreachable!"
    case 201: 

      return;
    default: assert(0, "bad label: " + label);
  }

}


function _mmap_resize($m, $oldp, $nb, $flags) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $m_addr;
      var $oldp_addr;
      var $nb_addr;
      var $flags_addr;
      var $oldsize;
      var $offset;
      var $oldmmsize;
      var $newmmsize;
      var $cp;
      var $newp;
      var $psize;
      $m_addr=$m;
      $oldp_addr=$oldp;
      $nb_addr=$nb;
      $flags_addr=$flags;
      var $0=$oldp_addr;
      var $head=(($0+4)|0);
      var $1=HEAP32[(($head)>>2)];
      var $and=$1 & -8;
      $oldsize=$and;
      var $2=$flags_addr;
      var $3=$nb_addr;
      var $shr=$3 >>> 3;
      var $cmp=(($shr)>>>(0)) < 32;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      $retval=0;
      label = 15; break;
    case 4: 
      var $4=$oldsize;
      var $5=$nb_addr;
      var $add=((($5)+(4))|0);
      var $cmp1=(($4)>>>(0)) >= (($add)>>>(0));
      if ($cmp1) { label = 5; break; } else { label = 7; break; }
    case 5: 
      var $6=$oldsize;
      var $7=$nb_addr;
      var $sub=((($6)-($7))|0);
      var $8=HEAP32[((((5242888)|0))>>2)];
      var $shl=$8 << 1;
      var $cmp2=(($sub)>>>(0)) <= (($shl)>>>(0));
      if ($cmp2) { label = 6; break; } else { label = 7; break; }
    case 6: 
      var $9=$oldp_addr;
      $retval=$9;
      label = 15; break;
    case 7: 
      var $10=$oldp_addr;
      var $prev_foot=(($10)|0);
      var $11=HEAP32[(($prev_foot)>>2)];
      $offset=$11;
      var $12=$oldsize;
      var $13=$offset;
      var $add4=((($12)+($13))|0);
      var $add5=((($add4)+(16))|0);
      $oldmmsize=$add5;
      var $14=$nb_addr;
      var $add6=((($14)+(24))|0);
      var $add7=((($add6)+(7))|0);
      var $15=HEAP32[((((5242884)|0))>>2)];
      var $sub8=((($15)-(1))|0);
      var $add9=((($add7)+($sub8))|0);
      var $16=HEAP32[((((5242884)|0))>>2)];
      var $sub10=((($16)-(1))|0);
      var $neg=$sub10 ^ -1;
      var $and11=$add9 & $neg;
      $newmmsize=$and11;
      $cp=-1;
      var $17=$cp;
      var $cmp12=(($17)|(0))!=-1;
      if ($cmp12) { label = 8; break; } else { label = 13; break; }
    case 8: 
      var $18=$cp;
      var $19=$offset;
      var $add_ptr=(($18+$19)|0);
      var $20=$add_ptr;
      $newp=$20;
      var $21=$newmmsize;
      var $22=$offset;
      var $sub14=((($21)-($22))|0);
      var $sub15=((($sub14)-(16))|0);
      $psize=$sub15;
      var $23=$psize;
      var $24=$newp;
      var $head16=(($24+4)|0);
      HEAP32[(($head16)>>2)]=$23;
      var $25=$newp;
      var $26=$25;
      var $27=$psize;
      var $add_ptr17=(($26+$27)|0);
      var $28=$add_ptr17;
      var $head18=(($28+4)|0);
      HEAP32[(($head18)>>2)]=7;
      var $29=$newp;
      var $30=$29;
      var $31=$psize;
      var $add19=((($31)+(4))|0);
      var $add_ptr20=(($30+$add19)|0);
      var $32=$add_ptr20;
      var $head21=(($32+4)|0);
      HEAP32[(($head21)>>2)]=0;
      var $33=$cp;
      var $34=$m_addr;
      var $least_addr=(($34+16)|0);
      var $35=HEAP32[(($least_addr)>>2)];
      var $cmp22=(($33)>>>(0)) < (($35)>>>(0));
      if ($cmp22) { label = 9; break; } else { label = 10; break; }
    case 9: 
      var $36=$cp;
      var $37=$m_addr;
      var $least_addr24=(($37+16)|0);
      HEAP32[(($least_addr24)>>2)]=$36;
      label = 10; break;
    case 10: 
      var $38=$newmmsize;
      var $39=$oldmmsize;
      var $sub26=((($38)-($39))|0);
      var $40=$m_addr;
      var $footprint=(($40+432)|0);
      var $41=HEAP32[(($footprint)>>2)];
      var $add27=((($41)+($sub26))|0);
      HEAP32[(($footprint)>>2)]=$add27;
      var $42=$m_addr;
      var $max_footprint=(($42+436)|0);
      var $43=HEAP32[(($max_footprint)>>2)];
      var $cmp28=(($add27)>>>(0)) > (($43)>>>(0));
      if ($cmp28) { label = 11; break; } else { label = 12; break; }
    case 11: 
      var $44=$m_addr;
      var $footprint30=(($44+432)|0);
      var $45=HEAP32[(($footprint30)>>2)];
      var $46=$m_addr;
      var $max_footprint31=(($46+436)|0);
      HEAP32[(($max_footprint31)>>2)]=$45;
      label = 12; break;
    case 12: 
      var $47=$newp;
      $retval=$47;
      label = 15; break;
    case 13: 
      label = 14; break;
    case 14: 
      $retval=0;
      label = 15; break;
    case 15: 
      var $48=$retval;

      return $48;
    default: assert(0, "bad label: " + label);
  }

}


function _segment_holding($m, $addr) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $m_addr;
      var $addr_addr;
      var $sp;
      $m_addr=$m;
      $addr_addr=$addr;
      var $0=$m_addr;
      var $seg=(($0+448)|0);
      $sp=$seg;
      label = 3; break;
    case 3: 
      var $1=$addr_addr;
      var $2=$sp;
      var $base=(($2)|0);
      var $3=HEAP32[(($base)>>2)];
      var $cmp=(($1)>>>(0)) >= (($3)>>>(0));
      if ($cmp) { label = 4; break; } else { label = 6; break; }
    case 4: 
      var $4=$addr_addr;
      var $5=$sp;
      var $base1=(($5)|0);
      var $6=HEAP32[(($base1)>>2)];
      var $7=$sp;
      var $size=(($7+4)|0);
      var $8=HEAP32[(($size)>>2)];
      var $add_ptr=(($6+$8)|0);
      var $cmp2=(($4)>>>(0)) < (($add_ptr)>>>(0));
      if ($cmp2) { label = 5; break; } else { label = 6; break; }
    case 5: 
      var $9=$sp;
      $retval=$9;
      label = 9; break;
    case 6: 
      var $10=$sp;
      var $next=(($10+8)|0);
      var $11=HEAP32[(($next)>>2)];
      $sp=$11;
      var $cmp3=(($11)|(0))==0;
      if ($cmp3) { label = 7; break; } else { label = 8; break; }
    case 7: 
      $retval=0;
      label = 9; break;
    case 8: 
      label = 3; break;
    case 9: 
      var $12=$retval;

      return $12;
    default: assert(0, "bad label: " + label);
  }

}


function _init_top($m, $p, $psize) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $p_addr;
      var $psize_addr;
      var $offset;
      $m_addr=$m;
      $p_addr=$p;
      $psize_addr=$psize;
      var $0=$p_addr;
      var $1=$0;
      var $add_ptr=(($1+8)|0);
      var $2=$add_ptr;
      var $and=$2 & 7;
      var $cmp=(($and)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $cond = 0;label = 5; break;
    case 4: 
      var $3=$p_addr;
      var $4=$3;
      var $add_ptr1=(($4+8)|0);
      var $5=$add_ptr1;
      var $and2=$5 & 7;
      var $sub=(((8)-($and2))|0);
      var $and3=$sub & 7;
      var $cond = $and3;label = 5; break;
    case 5: 
      var $cond;
      $offset=$cond;
      var $6=$p_addr;
      var $7=$6;
      var $8=$offset;
      var $add_ptr4=(($7+$8)|0);
      var $9=$add_ptr4;
      $p_addr=$9;
      var $10=$offset;
      var $11=$psize_addr;
      var $sub5=((($11)-($10))|0);
      $psize_addr=$sub5;
      var $12=$p_addr;
      var $13=$m_addr;
      var $top=(($13+24)|0);
      HEAP32[(($top)>>2)]=$12;
      var $14=$psize_addr;
      var $15=$m_addr;
      var $topsize=(($15+12)|0);
      HEAP32[(($topsize)>>2)]=$14;
      var $16=$psize_addr;
      var $or=$16 | 1;
      var $17=$p_addr;
      var $head=(($17+4)|0);
      HEAP32[(($head)>>2)]=$or;
      var $18=$p_addr;
      var $19=$18;
      var $20=$psize_addr;
      var $add_ptr6=(($19+$20)|0);
      var $21=$add_ptr6;
      var $head7=(($21+4)|0);
      HEAP32[(($head7)>>2)]=40;
      var $22=HEAP32[((((5242896)|0))>>2)];
      var $23=$m_addr;
      var $trim_check=(($23+28)|0);
      HEAP32[(($trim_check)>>2)]=$22;

      return;
    default: assert(0, "bad label: " + label);
  }

}


function _mmap_alloc($m, $nb) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $retval;
      var $m_addr;
      var $nb_addr;
      var $mmsize;
      var $fp;
      var $mm;
      var $offset;
      var $psize;
      var $p;
      $m_addr=$m;
      $nb_addr=$nb;
      var $0=$nb_addr;
      var $add=((($0)+(24))|0);
      var $add1=((($add)+(7))|0);
      var $1=HEAP32[((((5242884)|0))>>2)];
      var $sub=((($1)-(1))|0);
      var $add2=((($add1)+($sub))|0);
      var $2=HEAP32[((((5242884)|0))>>2)];
      var $sub3=((($2)-(1))|0);
      var $neg=$sub3 ^ -1;
      var $and=$add2 & $neg;
      $mmsize=$and;
      var $3=$m_addr;
      var $footprint_limit=(($3+440)|0);
      var $4=HEAP32[(($footprint_limit)>>2)];
      var $cmp=(($4)|(0))!=0;
      if ($cmp) { label = 3; break; } else { label = 7; break; }
    case 3: 
      var $5=$m_addr;
      var $footprint=(($5+432)|0);
      var $6=HEAP32[(($footprint)>>2)];
      var $7=$mmsize;
      var $add4=((($6)+($7))|0);
      $fp=$add4;
      var $8=$fp;
      var $9=$m_addr;
      var $footprint5=(($9+432)|0);
      var $10=HEAP32[(($footprint5)>>2)];
      var $cmp6=(($8)>>>(0)) <= (($10)>>>(0));
      if ($cmp6) { label = 5; break; } else { label = 4; break; }
    case 4: 
      var $11=$fp;
      var $12=$m_addr;
      var $footprint_limit7=(($12+440)|0);
      var $13=HEAP32[(($footprint_limit7)>>2)];
      var $cmp8=(($11)>>>(0)) > (($13)>>>(0));
      if ($cmp8) { label = 5; break; } else { label = 6; break; }
    case 5: 
      $retval=0;
      label = 20; break;
    case 6: 
      label = 7; break;
    case 7: 
      var $14=$mmsize;
      var $15=$nb_addr;
      var $cmp11=(($14)>>>(0)) > (($15)>>>(0));
      if ($cmp11) { label = 8; break; } else { label = 19; break; }
    case 8: 
      $mm=-1;
      var $16=$mm;
      var $cmp13=(($16)|(0))!=-1;
      if ($cmp13) { label = 9; break; } else { label = 18; break; }
    case 9: 
      var $17=$mm;
      var $add_ptr=(($17+8)|0);
      var $18=$add_ptr;
      var $and15=$18 & 7;
      var $cmp16=(($and15)|(0))==0;
      if ($cmp16) { label = 10; break; } else { label = 11; break; }
    case 10: 
      var $cond = 0;label = 12; break;
    case 11: 
      var $19=$mm;
      var $add_ptr17=(($19+8)|0);
      var $20=$add_ptr17;
      var $and18=$20 & 7;
      var $sub19=(((8)-($and18))|0);
      var $and20=$sub19 & 7;
      var $cond = $and20;label = 12; break;
    case 12: 
      var $cond;
      $offset=$cond;
      var $21=$mmsize;
      var $22=$offset;
      var $sub21=((($21)-($22))|0);
      var $sub22=((($sub21)-(16))|0);
      $psize=$sub22;
      var $23=$mm;
      var $24=$offset;
      var $add_ptr23=(($23+$24)|0);
      var $25=$add_ptr23;
      $p=$25;
      var $26=$offset;
      var $27=$p;
      var $prev_foot=(($27)|0);
      HEAP32[(($prev_foot)>>2)]=$26;
      var $28=$psize;
      var $29=$p;
      var $head=(($29+4)|0);
      HEAP32[(($head)>>2)]=$28;
      var $30=$p;
      var $31=$30;
      var $32=$psize;
      var $add_ptr24=(($31+$32)|0);
      var $33=$add_ptr24;
      var $head25=(($33+4)|0);
      HEAP32[(($head25)>>2)]=7;
      var $34=$p;
      var $35=$34;
      var $36=$psize;
      var $add26=((($36)+(4))|0);
      var $add_ptr27=(($35+$add26)|0);
      var $37=$add_ptr27;
      var $head28=(($37+4)|0);
      HEAP32[(($head28)>>2)]=0;
      var $38=$m_addr;
      var $least_addr=(($38+16)|0);
      var $39=HEAP32[(($least_addr)>>2)];
      var $cmp29=(($39)|(0))==0;
      if ($cmp29) { label = 14; break; } else { label = 13; break; }
    case 13: 
      var $40=$mm;
      var $41=$m_addr;
      var $least_addr31=(($41+16)|0);
      var $42=HEAP32[(($least_addr31)>>2)];
      var $cmp32=(($40)>>>(0)) < (($42)>>>(0));
      if ($cmp32) { label = 14; break; } else { label = 15; break; }
    case 14: 
      var $43=$mm;
      var $44=$m_addr;
      var $least_addr34=(($44+16)|0);
      HEAP32[(($least_addr34)>>2)]=$43;
      label = 15; break;
    case 15: 
      var $45=$mmsize;
      var $46=$m_addr;
      var $footprint36=(($46+432)|0);
      var $47=HEAP32[(($footprint36)>>2)];
      var $add37=((($47)+($45))|0);
      HEAP32[(($footprint36)>>2)]=$add37;
      var $48=$m_addr;
      var $max_footprint=(($48+436)|0);
      var $49=HEAP32[(($max_footprint)>>2)];
      var $cmp38=(($add37)>>>(0)) > (($49)>>>(0));
      if ($cmp38) { label = 16; break; } else { label = 17; break; }
    case 16: 
      var $50=$m_addr;
      var $footprint40=(($50+432)|0);
      var $51=HEAP32[(($footprint40)>>2)];
      var $52=$m_addr;
      var $max_footprint41=(($52+436)|0);
      HEAP32[(($max_footprint41)>>2)]=$51;
      label = 17; break;
    case 17: 
      var $53=$p;
      var $54=$53;
      var $add_ptr43=(($54+8)|0);
      $retval=$add_ptr43;
      label = 20; break;
    case 18: 
      label = 19; break;
    case 19: 
      $retval=0;
      label = 20; break;
    case 20: 
      var $55=$retval;

      return $55;
    default: assert(0, "bad label: " + label);
  }

}


function _init_bins($m) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $i;
      var $bin;
      $m_addr=$m;
      $i=0;
      label = 3; break;
    case 3: 
      var $0=$i;
      var $cmp=(($0)>>>(0)) < 32;
      if ($cmp) { label = 4; break; } else { label = 6; break; }
    case 4: 
      var $1=$i;
      var $shl=$1 << 1;
      var $2=$m_addr;
      var $smallbins=(($2+40)|0);
      var $arrayidx=(($smallbins+($shl<<2))|0);
      var $3=$arrayidx;
      var $4=$3;
      $bin=$4;
      var $5=$bin;
      var $6=$bin;
      var $bk=(($6+12)|0);
      HEAP32[(($bk)>>2)]=$5;
      var $7=$bin;
      var $fd=(($7+8)|0);
      HEAP32[(($fd)>>2)]=$5;
      label = 5; break;
    case 5: 
      var $8=$i;
      var $inc=((($8)+(1))|0);
      $i=$inc;
      label = 3; break;
    case 6: 

      return;
    default: assert(0, "bad label: " + label);
  }

}


function _prepend_alloc($m, $newbase, $oldbase, $nb) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $newbase_addr;
      var $oldbase_addr;
      var $nb_addr;
      var $p;
      var $oldfirst;
      var $psize;
      var $q;
      var $qsize;
      var $tsize;
      var $dsize;
      var $nsize;
      var $F;
      var $B;
      var $I;
      var $TP;
      var $XP;
      var $R;
      var $F77;
      var $RP;
      var $CP;
      var $H;
      var $C0;
      var $C1;
      var $I218;
      var $B220;
      var $F224;
      var $TP250;
      var $H251;
      var $I252;
      var $X;
      var $Y;
      var $N;
      var $K;
      var $T;
      var $K305;
      var $C;
      var $F343;
      $m_addr=$m;
      $newbase_addr=$newbase;
      $oldbase_addr=$oldbase;
      $nb_addr=$nb;
      var $0=$newbase_addr;
      var $1=$newbase_addr;
      var $add_ptr=(($1+8)|0);
      var $2=$add_ptr;
      var $and=$2 & 7;
      var $cmp=(($and)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $cond = 0;label = 5; break;
    case 4: 
      var $3=$newbase_addr;
      var $add_ptr1=(($3+8)|0);
      var $4=$add_ptr1;
      var $and2=$4 & 7;
      var $sub=(((8)-($and2))|0);
      var $and3=$sub & 7;
      var $cond = $and3;label = 5; break;
    case 5: 
      var $cond;
      var $add_ptr4=(($0+$cond)|0);
      var $5=$add_ptr4;
      $p=$5;
      var $6=$oldbase_addr;
      var $7=$oldbase_addr;
      var $add_ptr5=(($7+8)|0);
      var $8=$add_ptr5;
      var $and6=$8 & 7;
      var $cmp7=(($and6)|(0))==0;
      if ($cmp7) { label = 6; break; } else { label = 7; break; }
    case 6: 
      var $cond15 = 0;label = 8; break;
    case 7: 
      var $9=$oldbase_addr;
      var $add_ptr10=(($9+8)|0);
      var $10=$add_ptr10;
      var $and11=$10 & 7;
      var $sub12=(((8)-($and11))|0);
      var $and13=$sub12 & 7;
      var $cond15 = $and13;label = 8; break;
    case 8: 
      var $cond15;
      var $add_ptr16=(($6+$cond15)|0);
      var $11=$add_ptr16;
      $oldfirst=$11;
      var $12=$oldfirst;
      var $13=$12;
      var $14=$p;
      var $15=$14;
      var $sub_ptr_lhs_cast=$13;
      var $sub_ptr_rhs_cast=$15;
      var $sub_ptr_sub=((($sub_ptr_lhs_cast)-($sub_ptr_rhs_cast))|0);
      $psize=$sub_ptr_sub;
      var $16=$p;
      var $17=$16;
      var $18=$nb_addr;
      var $add_ptr17=(($17+$18)|0);
      var $19=$add_ptr17;
      $q=$19;
      var $20=$psize;
      var $21=$nb_addr;
      var $sub18=((($20)-($21))|0);
      $qsize=$sub18;
      var $22=$nb_addr;
      var $or=$22 | 1;
      var $or19=$or | 2;
      var $23=$p;
      var $head=(($23+4)|0);
      HEAP32[(($head)>>2)]=$or19;
      var $24=$oldfirst;
      var $25=$m_addr;
      var $top=(($25+24)|0);
      var $26=HEAP32[(($top)>>2)];
      var $cmp20=(($24)|(0))==(($26)|(0));
      if ($cmp20) { label = 9; break; } else { label = 10; break; }
    case 9: 
      var $27=$qsize;
      var $28=$m_addr;
      var $topsize=(($28+12)|0);
      var $29=HEAP32[(($topsize)>>2)];
      var $add=((($29)+($27))|0);
      HEAP32[(($topsize)>>2)]=$add;
      $tsize=$add;
      var $30=$q;
      var $31=$m_addr;
      var $top21=(($31+24)|0);
      HEAP32[(($top21)>>2)]=$30;
      var $32=$tsize;
      var $or22=$32 | 1;
      var $33=$q;
      var $head23=(($33+4)|0);
      HEAP32[(($head23)>>2)]=$or22;
      label = 119; break;
    case 10: 
      var $34=$oldfirst;
      var $35=$m_addr;
      var $dv=(($35+20)|0);
      var $36=HEAP32[(($dv)>>2)];
      var $cmp24=(($34)|(0))==(($36)|(0));
      if ($cmp24) { label = 11; break; } else { label = 12; break; }
    case 11: 
      var $37=$qsize;
      var $38=$m_addr;
      var $dvsize=(($38+8)|0);
      var $39=HEAP32[(($dvsize)>>2)];
      var $add26=((($39)+($37))|0);
      HEAP32[(($dvsize)>>2)]=$add26;
      $dsize=$add26;
      var $40=$q;
      var $41=$m_addr;
      var $dv27=(($41+20)|0);
      HEAP32[(($dv27)>>2)]=$40;
      var $42=$dsize;
      var $or28=$42 | 1;
      var $43=$q;
      var $head29=(($43+4)|0);
      HEAP32[(($head29)>>2)]=$or28;
      var $44=$dsize;
      var $45=$q;
      var $46=$45;
      var $47=$dsize;
      var $add_ptr30=(($46+$47)|0);
      var $48=$add_ptr30;
      var $prev_foot=(($48)|0);
      HEAP32[(($prev_foot)>>2)]=$44;
      label = 118; break;
    case 12: 
      var $49=$oldfirst;
      var $head32=(($49+4)|0);
      var $50=HEAP32[(($head32)>>2)];
      var $and33=$50 & 3;
      var $cmp34=(($and33)|(0))!=1;
      if ($cmp34) { label = 82; break; } else { label = 13; break; }
    case 13: 
      var $51=$oldfirst;
      var $head36=(($51+4)|0);
      var $52=HEAP32[(($head36)>>2)];
      var $and37=$52 & -8;
      $nsize=$and37;
      var $53=$nsize;
      var $shr=$53 >>> 3;
      var $cmp38=(($shr)>>>(0)) < 32;
      if ($cmp38) { label = 14; break; } else { label = 32; break; }
    case 14: 
      var $54=$oldfirst;
      var $fd=(($54+8)|0);
      var $55=HEAP32[(($fd)>>2)];
      $F=$55;
      var $56=$oldfirst;
      var $bk=(($56+12)|0);
      var $57=HEAP32[(($bk)>>2)];
      $B=$57;
      var $58=$nsize;
      var $shr40=$58 >>> 3;
      $I=$shr40;
      var $59=$F;
      var $60=$I;
      var $shl=$60 << 1;
      var $61=$m_addr;
      var $smallbins=(($61+40)|0);
      var $arrayidx=(($smallbins+($shl<<2))|0);
      var $62=$arrayidx;
      var $63=$62;
      var $cmp41=(($59)|(0))==(($63)|(0));
      if ($cmp41) { var $72 = 1;label = 18; break; } else { label = 15; break; }
    case 15: 
      var $64=$F;
      var $65=$64;
      var $66=$m_addr;
      var $least_addr=(($66+16)|0);
      var $67=HEAP32[(($least_addr)>>2)];
      var $cmp42=(($65)>>>(0)) >= (($67)>>>(0));
      if ($cmp42) { label = 16; break; } else { var $71 = 0;label = 17; break; }
    case 16: 
      var $68=$F;
      var $bk43=(($68+12)|0);
      var $69=HEAP32[(($bk43)>>2)];
      var $70=$oldfirst;
      var $cmp44=(($69)|(0))==(($70)|(0));
      var $71 = $cmp44;label = 17; break;
    case 17: 
      var $71;
      var $72 = $71;label = 18; break;
    case 18: 
      var $72;
      var $lor_ext=(($72)&(1));
      var $expval=($lor_ext);
      var $tobool=(($expval)|(0))!=0;
      if ($tobool) { label = 19; break; } else { label = 30; break; }
    case 19: 
      var $73=$B;
      var $74=$F;
      var $cmp46=(($73)|(0))==(($74)|(0));
      if ($cmp46) { label = 20; break; } else { label = 21; break; }
    case 20: 
      var $75=$I;
      var $shl48=1 << $75;
      var $neg=$shl48 ^ -1;
      var $76=$m_addr;
      var $smallmap=(($76)|0);
      var $77=HEAP32[(($smallmap)>>2)];
      var $and49=$77 & $neg;
      HEAP32[(($smallmap)>>2)]=$and49;
      label = 29; break;
    case 21: 
      var $78=$B;
      var $79=$I;
      var $shl51=$79 << 1;
      var $80=$m_addr;
      var $smallbins52=(($80+40)|0);
      var $arrayidx53=(($smallbins52+($shl51<<2))|0);
      var $81=$arrayidx53;
      var $82=$81;
      var $cmp54=(($78)|(0))==(($82)|(0));
      if ($cmp54) { var $91 = 1;label = 25; break; } else { label = 22; break; }
    case 22: 
      var $83=$B;
      var $84=$83;
      var $85=$m_addr;
      var $least_addr56=(($85+16)|0);
      var $86=HEAP32[(($least_addr56)>>2)];
      var $cmp57=(($84)>>>(0)) >= (($86)>>>(0));
      if ($cmp57) { label = 23; break; } else { var $90 = 0;label = 24; break; }
    case 23: 
      var $87=$B;
      var $fd59=(($87+8)|0);
      var $88=HEAP32[(($fd59)>>2)];
      var $89=$oldfirst;
      var $cmp60=(($88)|(0))==(($89)|(0));
      var $90 = $cmp60;label = 24; break;
    case 24: 
      var $90;
      var $91 = $90;label = 25; break;
    case 25: 
      var $91;
      var $lor_ext63=(($91)&(1));
      var $expval64=($lor_ext63);
      var $tobool65=(($expval64)|(0))!=0;
      if ($tobool65) { label = 26; break; } else { label = 27; break; }
    case 26: 
      var $92=$B;
      var $93=$F;
      var $bk67=(($93+12)|0);
      HEAP32[(($bk67)>>2)]=$92;
      var $94=$F;
      var $95=$B;
      var $fd68=(($95+8)|0);
      HEAP32[(($fd68)>>2)]=$94;
      label = 28; break;
    case 27: 
      _abort();
      throw "Reached an unreachable!"
    case 28: 
      label = 29; break;
    case 29: 
      label = 31; break;
    case 30: 
      _abort();
      throw "Reached an unreachable!"
    case 31: 
      label = 81; break;
    case 32: 
      var $96=$oldfirst;
      var $97=$96;
      $TP=$97;
      var $98=$TP;
      var $parent=(($98+24)|0);
      var $99=HEAP32[(($parent)>>2)];
      $XP=$99;
      var $100=$TP;
      var $bk74=(($100+12)|0);
      var $101=HEAP32[(($bk74)>>2)];
      var $102=$TP;
      var $cmp75=(($101)|(0))!=(($102)|(0));
      if ($cmp75) { label = 33; break; } else { label = 40; break; }
    case 33: 
      var $103=$TP;
      var $fd78=(($103+8)|0);
      var $104=HEAP32[(($fd78)>>2)];
      $F77=$104;
      var $105=$TP;
      var $bk79=(($105+12)|0);
      var $106=HEAP32[(($bk79)>>2)];
      $R=$106;
      var $107=$F77;
      var $108=$107;
      var $109=$m_addr;
      var $least_addr80=(($109+16)|0);
      var $110=HEAP32[(($least_addr80)>>2)];
      var $cmp81=(($108)>>>(0)) >= (($110)>>>(0));
      if ($cmp81) { label = 34; break; } else { var $117 = 0;label = 36; break; }
    case 34: 
      var $111=$F77;
      var $bk82=(($111+12)|0);
      var $112=HEAP32[(($bk82)>>2)];
      var $113=$TP;
      var $cmp83=(($112)|(0))==(($113)|(0));
      if ($cmp83) { label = 35; break; } else { var $117 = 0;label = 36; break; }
    case 35: 
      var $114=$R;
      var $fd85=(($114+8)|0);
      var $115=HEAP32[(($fd85)>>2)];
      var $116=$TP;
      var $cmp86=(($115)|(0))==(($116)|(0));
      var $117 = $cmp86;label = 36; break;
    case 36: 
      var $117;
      var $land_ext=(($117)&(1));
      var $expval88=($land_ext);
      var $tobool89=(($expval88)|(0))!=0;
      if ($tobool89) { label = 37; break; } else { label = 38; break; }
    case 37: 
      var $118=$R;
      var $119=$F77;
      var $bk91=(($119+12)|0);
      HEAP32[(($bk91)>>2)]=$118;
      var $120=$F77;
      var $121=$R;
      var $fd92=(($121+8)|0);
      HEAP32[(($fd92)>>2)]=$120;
      label = 39; break;
    case 38: 
      _abort();
      throw "Reached an unreachable!"
    case 39: 
      label = 52; break;
    case 40: 
      var $122=$TP;
      var $child=(($122+16)|0);
      var $arrayidx96=(($child+4)|0);
      $RP=$arrayidx96;
      var $123=HEAP32[(($arrayidx96)>>2)];
      $R=$123;
      var $cmp97=(($123)|(0))!=0;
      if ($cmp97) { label = 42; break; } else { label = 41; break; }
    case 41: 
      var $124=$TP;
      var $child98=(($124+16)|0);
      var $arrayidx99=(($child98)|0);
      $RP=$arrayidx99;
      var $125=HEAP32[(($arrayidx99)>>2)];
      $R=$125;
      var $cmp100=(($125)|(0))!=0;
      if ($cmp100) { label = 42; break; } else { label = 51; break; }
    case 42: 
      label = 43; break;
    case 43: 
      var $126=$R;
      var $child102=(($126+16)|0);
      var $arrayidx103=(($child102+4)|0);
      $CP=$arrayidx103;
      var $127=HEAP32[(($arrayidx103)>>2)];
      var $cmp104=(($127)|(0))!=0;
      if ($cmp104) { var $130 = 1;label = 45; break; } else { label = 44; break; }
    case 44: 
      var $128=$R;
      var $child106=(($128+16)|0);
      var $arrayidx107=(($child106)|0);
      $CP=$arrayidx107;
      var $129=HEAP32[(($arrayidx107)>>2)];
      var $cmp108=(($129)|(0))!=0;
      var $130 = $cmp108;label = 45; break;
    case 45: 
      var $130;
      if ($130) { label = 46; break; } else { label = 47; break; }
    case 46: 
      var $131=$CP;
      $RP=$131;
      var $132=HEAP32[(($131)>>2)];
      $R=$132;
      label = 43; break;
    case 47: 
      var $133=$RP;
      var $134=$133;
      var $135=$m_addr;
      var $least_addr111=(($135+16)|0);
      var $136=HEAP32[(($least_addr111)>>2)];
      var $cmp112=(($134)>>>(0)) >= (($136)>>>(0));
      var $conv=(($cmp112)&(1));
      var $expval113=($conv);
      var $tobool114=(($expval113)|(0))!=0;
      if ($tobool114) { label = 48; break; } else { label = 49; break; }
    case 48: 
      var $137=$RP;
      HEAP32[(($137)>>2)]=0;
      label = 50; break;
    case 49: 
      _abort();
      throw "Reached an unreachable!"
    case 50: 
      label = 51; break;
    case 51: 
      label = 52; break;
    case 52: 
      var $138=$XP;
      var $cmp120=(($138)|(0))!=0;
      if ($cmp120) { label = 53; break; } else { label = 80; break; }
    case 53: 
      var $139=$TP;
      var $index=(($139+28)|0);
      var $140=HEAP32[(($index)>>2)];
      var $141=$m_addr;
      var $treebins=(($141+304)|0);
      var $arrayidx123=(($treebins+($140<<2))|0);
      $H=$arrayidx123;
      var $142=$TP;
      var $143=$H;
      var $144=HEAP32[(($143)>>2)];
      var $cmp124=(($142)|(0))==(($144)|(0));
      if ($cmp124) { label = 54; break; } else { label = 57; break; }
    case 54: 
      var $145=$R;
      var $146=$H;
      HEAP32[(($146)>>2)]=$145;
      var $cmp127=(($145)|(0))==0;
      if ($cmp127) { label = 55; break; } else { label = 56; break; }
    case 55: 
      var $147=$TP;
      var $index130=(($147+28)|0);
      var $148=HEAP32[(($index130)>>2)];
      var $shl131=1 << $148;
      var $neg132=$shl131 ^ -1;
      var $149=$m_addr;
      var $treemap=(($149+4)|0);
      var $150=HEAP32[(($treemap)>>2)];
      var $and133=$150 & $neg132;
      HEAP32[(($treemap)>>2)]=$and133;
      label = 56; break;
    case 56: 
      label = 64; break;
    case 57: 
      var $151=$XP;
      var $152=$151;
      var $153=$m_addr;
      var $least_addr136=(($153+16)|0);
      var $154=HEAP32[(($least_addr136)>>2)];
      var $cmp137=(($152)>>>(0)) >= (($154)>>>(0));
      var $conv138=(($cmp137)&(1));
      var $expval139=($conv138);
      var $tobool140=(($expval139)|(0))!=0;
      if ($tobool140) { label = 58; break; } else { label = 62; break; }
    case 58: 
      var $155=$XP;
      var $child142=(($155+16)|0);
      var $arrayidx143=(($child142)|0);
      var $156=HEAP32[(($arrayidx143)>>2)];
      var $157=$TP;
      var $cmp144=(($156)|(0))==(($157)|(0));
      if ($cmp144) { label = 59; break; } else { label = 60; break; }
    case 59: 
      var $158=$R;
      var $159=$XP;
      var $child147=(($159+16)|0);
      var $arrayidx148=(($child147)|0);
      HEAP32[(($arrayidx148)>>2)]=$158;
      label = 61; break;
    case 60: 
      var $160=$R;
      var $161=$XP;
      var $child150=(($161+16)|0);
      var $arrayidx151=(($child150+4)|0);
      HEAP32[(($arrayidx151)>>2)]=$160;
      label = 61; break;
    case 61: 
      label = 63; break;
    case 62: 
      _abort();
      throw "Reached an unreachable!"
    case 63: 
      label = 64; break;
    case 64: 
      var $162=$R;
      var $cmp156=(($162)|(0))!=0;
      if ($cmp156) { label = 65; break; } else { label = 79; break; }
    case 65: 
      var $163=$R;
      var $164=$163;
      var $165=$m_addr;
      var $least_addr159=(($165+16)|0);
      var $166=HEAP32[(($least_addr159)>>2)];
      var $cmp160=(($164)>>>(0)) >= (($166)>>>(0));
      var $conv161=(($cmp160)&(1));
      var $expval162=($conv161);
      var $tobool163=(($expval162)|(0))!=0;
      if ($tobool163) { label = 66; break; } else { label = 77; break; }
    case 66: 
      var $167=$XP;
      var $168=$R;
      var $parent165=(($168+24)|0);
      HEAP32[(($parent165)>>2)]=$167;
      var $169=$TP;
      var $child166=(($169+16)|0);
      var $arrayidx167=(($child166)|0);
      var $170=HEAP32[(($arrayidx167)>>2)];
      $C0=$170;
      var $cmp168=(($170)|(0))!=0;
      if ($cmp168) { label = 67; break; } else { label = 71; break; }
    case 67: 
      var $171=$C0;
      var $172=$171;
      var $173=$m_addr;
      var $least_addr171=(($173+16)|0);
      var $174=HEAP32[(($least_addr171)>>2)];
      var $cmp172=(($172)>>>(0)) >= (($174)>>>(0));
      var $conv173=(($cmp172)&(1));
      var $expval174=($conv173);
      var $tobool175=(($expval174)|(0))!=0;
      if ($tobool175) { label = 68; break; } else { label = 69; break; }
    case 68: 
      var $175=$C0;
      var $176=$R;
      var $child177=(($176+16)|0);
      var $arrayidx178=(($child177)|0);
      HEAP32[(($arrayidx178)>>2)]=$175;
      var $177=$R;
      var $178=$C0;
      var $parent179=(($178+24)|0);
      HEAP32[(($parent179)>>2)]=$177;
      label = 70; break;
    case 69: 
      _abort();
      throw "Reached an unreachable!"
    case 70: 
      label = 71; break;
    case 71: 
      var $179=$TP;
      var $child183=(($179+16)|0);
      var $arrayidx184=(($child183+4)|0);
      var $180=HEAP32[(($arrayidx184)>>2)];
      $C1=$180;
      var $cmp185=(($180)|(0))!=0;
      if ($cmp185) { label = 72; break; } else { label = 76; break; }
    case 72: 
      var $181=$C1;
      var $182=$181;
      var $183=$m_addr;
      var $least_addr188=(($183+16)|0);
      var $184=HEAP32[(($least_addr188)>>2)];
      var $cmp189=(($182)>>>(0)) >= (($184)>>>(0));
      var $conv190=(($cmp189)&(1));
      var $expval191=($conv190);
      var $tobool192=(($expval191)|(0))!=0;
      if ($tobool192) { label = 73; break; } else { label = 74; break; }
    case 73: 
      var $185=$C1;
      var $186=$R;
      var $child194=(($186+16)|0);
      var $arrayidx195=(($child194+4)|0);
      HEAP32[(($arrayidx195)>>2)]=$185;
      var $187=$R;
      var $188=$C1;
      var $parent196=(($188+24)|0);
      HEAP32[(($parent196)>>2)]=$187;
      label = 75; break;
    case 74: 
      _abort();
      throw "Reached an unreachable!"
    case 75: 
      label = 76; break;
    case 76: 
      label = 78; break;
    case 77: 
      _abort();
      throw "Reached an unreachable!"
    case 78: 
      label = 79; break;
    case 79: 
      label = 80; break;
    case 80: 
      label = 81; break;
    case 81: 
      var $189=$oldfirst;
      var $190=$189;
      var $191=$nsize;
      var $add_ptr205=(($190+$191)|0);
      var $192=$add_ptr205;
      $oldfirst=$192;
      var $193=$nsize;
      var $194=$qsize;
      var $add206=((($194)+($193))|0);
      $qsize=$add206;
      label = 82; break;
    case 82: 
      var $195=$oldfirst;
      var $head208=(($195+4)|0);
      var $196=HEAP32[(($head208)>>2)];
      var $and209=$196 & -2;
      HEAP32[(($head208)>>2)]=$and209;
      var $197=$qsize;
      var $or210=$197 | 1;
      var $198=$q;
      var $head211=(($198+4)|0);
      HEAP32[(($head211)>>2)]=$or210;
      var $199=$qsize;
      var $200=$q;
      var $201=$200;
      var $202=$qsize;
      var $add_ptr212=(($201+$202)|0);
      var $203=$add_ptr212;
      var $prev_foot213=(($203)|0);
      HEAP32[(($prev_foot213)>>2)]=$199;
      var $204=$qsize;
      var $shr214=$204 >>> 3;
      var $cmp215=(($shr214)>>>(0)) < 32;
      if ($cmp215) { label = 83; break; } else { label = 90; break; }
    case 83: 
      var $205=$qsize;
      var $shr219=$205 >>> 3;
      $I218=$shr219;
      var $206=$I218;
      var $shl221=$206 << 1;
      var $207=$m_addr;
      var $smallbins222=(($207+40)|0);
      var $arrayidx223=(($smallbins222+($shl221<<2))|0);
      var $208=$arrayidx223;
      var $209=$208;
      $B220=$209;
      var $210=$B220;
      $F224=$210;
      var $211=$m_addr;
      var $smallmap225=(($211)|0);
      var $212=HEAP32[(($smallmap225)>>2)];
      var $213=$I218;
      var $shl226=1 << $213;
      var $and227=$212 & $shl226;
      var $tobool228=(($and227)|(0))!=0;
      if ($tobool228) { label = 85; break; } else { label = 84; break; }
    case 84: 
      var $214=$I218;
      var $shl230=1 << $214;
      var $215=$m_addr;
      var $smallmap231=(($215)|0);
      var $216=HEAP32[(($smallmap231)>>2)];
      var $or232=$216 | $shl230;
      HEAP32[(($smallmap231)>>2)]=$or232;
      label = 89; break;
    case 85: 
      var $217=$B220;
      var $fd234=(($217+8)|0);
      var $218=HEAP32[(($fd234)>>2)];
      var $219=$218;
      var $220=$m_addr;
      var $least_addr235=(($220+16)|0);
      var $221=HEAP32[(($least_addr235)>>2)];
      var $cmp236=(($219)>>>(0)) >= (($221)>>>(0));
      var $conv237=(($cmp236)&(1));
      var $expval238=($conv237);
      var $tobool239=(($expval238)|(0))!=0;
      if ($tobool239) { label = 86; break; } else { label = 87; break; }
    case 86: 
      var $222=$B220;
      var $fd241=(($222+8)|0);
      var $223=HEAP32[(($fd241)>>2)];
      $F224=$223;
      label = 88; break;
    case 87: 
      _abort();
      throw "Reached an unreachable!"
    case 88: 
      label = 89; break;
    case 89: 
      var $224=$q;
      var $225=$B220;
      var $fd245=(($225+8)|0);
      HEAP32[(($fd245)>>2)]=$224;
      var $226=$q;
      var $227=$F224;
      var $bk246=(($227+12)|0);
      HEAP32[(($bk246)>>2)]=$226;
      var $228=$F224;
      var $229=$q;
      var $fd247=(($229+8)|0);
      HEAP32[(($fd247)>>2)]=$228;
      var $230=$B220;
      var $231=$q;
      var $bk248=(($231+12)|0);
      HEAP32[(($bk248)>>2)]=$230;
      label = 117; break;
    case 90: 
      var $232=$q;
      var $233=$232;
      $TP250=$233;
      var $234=$qsize;
      var $shr253=$234 >>> 8;
      $X=$shr253;
      var $235=$X;
      var $cmp254=(($235)|(0))==0;
      if ($cmp254) { label = 91; break; } else { label = 92; break; }
    case 91: 
      $I252=0;
      label = 96; break;
    case 92: 
      var $236=$X;
      var $cmp258=(($236)>>>(0)) > 65535;
      if ($cmp258) { label = 93; break; } else { label = 94; break; }
    case 93: 
      $I252=31;
      label = 95; break;
    case 94: 
      var $237=$X;
      $Y=$237;
      var $238=$Y;
      var $sub262=((($238)-(256))|0);
      var $shr263=$sub262 >>> 16;
      var $and264=$shr263 & 8;
      $N=$and264;
      var $239=$N;
      var $240=$Y;
      var $shl265=$240 << $239;
      $Y=$shl265;
      var $sub266=((($shl265)-(4096))|0);
      var $shr267=$sub266 >>> 16;
      var $and268=$shr267 & 4;
      $K=$and268;
      var $241=$K;
      var $242=$N;
      var $add269=((($242)+($241))|0);
      $N=$add269;
      var $243=$K;
      var $244=$Y;
      var $shl270=$244 << $243;
      $Y=$shl270;
      var $sub271=((($shl270)-(16384))|0);
      var $shr272=$sub271 >>> 16;
      var $and273=$shr272 & 2;
      $K=$and273;
      var $245=$N;
      var $add274=((($245)+($and273))|0);
      $N=$add274;
      var $246=$N;
      var $sub275=(((14)-($246))|0);
      var $247=$K;
      var $248=$Y;
      var $shl276=$248 << $247;
      $Y=$shl276;
      var $shr277=$shl276 >>> 15;
      var $add278=((($sub275)+($shr277))|0);
      $K=$add278;
      var $249=$K;
      var $shl279=$249 << 1;
      var $250=$qsize;
      var $251=$K;
      var $add280=((($251)+(7))|0);
      var $shr281=$250 >>> (($add280)>>>(0));
      var $and282=$shr281 & 1;
      var $add283=((($shl279)+($and282))|0);
      $I252=$add283;
      label = 95; break;
    case 95: 
      label = 96; break;
    case 96: 
      var $252=$I252;
      var $253=$m_addr;
      var $treebins286=(($253+304)|0);
      var $arrayidx287=(($treebins286+($252<<2))|0);
      $H251=$arrayidx287;
      var $254=$I252;
      var $255=$TP250;
      var $index288=(($255+28)|0);
      HEAP32[(($index288)>>2)]=$254;
      var $256=$TP250;
      var $child289=(($256+16)|0);
      var $arrayidx290=(($child289+4)|0);
      HEAP32[(($arrayidx290)>>2)]=0;
      var $257=$TP250;
      var $child291=(($257+16)|0);
      var $arrayidx292=(($child291)|0);
      HEAP32[(($arrayidx292)>>2)]=0;
      var $258=$m_addr;
      var $treemap293=(($258+4)|0);
      var $259=HEAP32[(($treemap293)>>2)];
      var $260=$I252;
      var $shl294=1 << $260;
      var $and295=$259 & $shl294;
      var $tobool296=(($and295)|(0))!=0;
      if ($tobool296) { label = 98; break; } else { label = 97; break; }
    case 97: 
      var $261=$I252;
      var $shl298=1 << $261;
      var $262=$m_addr;
      var $treemap299=(($262+4)|0);
      var $263=HEAP32[(($treemap299)>>2)];
      var $or300=$263 | $shl298;
      HEAP32[(($treemap299)>>2)]=$or300;
      var $264=$TP250;
      var $265=$H251;
      HEAP32[(($265)>>2)]=$264;
      var $266=$H251;
      var $267=$266;
      var $268=$TP250;
      var $parent301=(($268+24)|0);
      HEAP32[(($parent301)>>2)]=$267;
      var $269=$TP250;
      var $270=$TP250;
      var $bk302=(($270+12)|0);
      HEAP32[(($bk302)>>2)]=$269;
      var $271=$TP250;
      var $fd303=(($271+8)|0);
      HEAP32[(($fd303)>>2)]=$269;
      label = 116; break;
    case 98: 
      var $272=$H251;
      var $273=HEAP32[(($272)>>2)];
      $T=$273;
      var $274=$qsize;
      var $275=$I252;
      var $cmp306=(($275)|(0))==31;
      if ($cmp306) { label = 99; break; } else { label = 100; break; }
    case 99: 
      var $cond315 = 0;label = 101; break;
    case 100: 
      var $276=$I252;
      var $shr310=$276 >>> 1;
      var $add311=((($shr310)+(8))|0);
      var $sub312=((($add311)-(2))|0);
      var $sub313=(((31)-($sub312))|0);
      var $cond315 = $sub313;label = 101; break;
    case 101: 
      var $cond315;
      var $shl316=$274 << $cond315;
      $K305=$shl316;
      label = 102; break;
    case 102: 
      var $277=$T;
      var $head317=(($277+4)|0);
      var $278=HEAP32[(($head317)>>2)];
      var $and318=$278 & -8;
      var $279=$qsize;
      var $cmp319=(($and318)|(0))!=(($279)|(0));
      if ($cmp319) { label = 103; break; } else { label = 109; break; }
    case 103: 
      var $280=$K305;
      var $shr322=$280 >>> 31;
      var $and323=$shr322 & 1;
      var $281=$T;
      var $child324=(($281+16)|0);
      var $arrayidx325=(($child324+($and323<<2))|0);
      $C=$arrayidx325;
      var $282=$K305;
      var $shl326=$282 << 1;
      $K305=$shl326;
      var $283=$C;
      var $284=HEAP32[(($283)>>2)];
      var $cmp327=(($284)|(0))!=0;
      if ($cmp327) { label = 104; break; } else { label = 105; break; }
    case 104: 
      var $285=$C;
      var $286=HEAP32[(($285)>>2)];
      $T=$286;
      label = 108; break;
    case 105: 
      var $287=$C;
      var $288=$287;
      var $289=$m_addr;
      var $least_addr331=(($289+16)|0);
      var $290=HEAP32[(($least_addr331)>>2)];
      var $cmp332=(($288)>>>(0)) >= (($290)>>>(0));
      var $conv333=(($cmp332)&(1));
      var $expval334=($conv333);
      var $tobool335=(($expval334)|(0))!=0;
      if ($tobool335) { label = 106; break; } else { label = 107; break; }
    case 106: 
      var $291=$TP250;
      var $292=$C;
      HEAP32[(($292)>>2)]=$291;
      var $293=$T;
      var $294=$TP250;
      var $parent337=(($294+24)|0);
      HEAP32[(($parent337)>>2)]=$293;
      var $295=$TP250;
      var $296=$TP250;
      var $bk338=(($296+12)|0);
      HEAP32[(($bk338)>>2)]=$295;
      var $297=$TP250;
      var $fd339=(($297+8)|0);
      HEAP32[(($fd339)>>2)]=$295;
      label = 115; break;
    case 107: 
      _abort();
      throw "Reached an unreachable!"
    case 108: 
      label = 114; break;
    case 109: 
      var $298=$T;
      var $fd344=(($298+8)|0);
      var $299=HEAP32[(($fd344)>>2)];
      $F343=$299;
      var $300=$T;
      var $301=$300;
      var $302=$m_addr;
      var $least_addr345=(($302+16)|0);
      var $303=HEAP32[(($least_addr345)>>2)];
      var $cmp346=(($301)>>>(0)) >= (($303)>>>(0));
      if ($cmp346) { label = 110; break; } else { var $308 = 0;label = 111; break; }
    case 110: 
      var $304=$F343;
      var $305=$304;
      var $306=$m_addr;
      var $least_addr349=(($306+16)|0);
      var $307=HEAP32[(($least_addr349)>>2)];
      var $cmp350=(($305)>>>(0)) >= (($307)>>>(0));
      var $308 = $cmp350;label = 111; break;
    case 111: 
      var $308;
      var $land_ext353=(($308)&(1));
      var $expval354=($land_ext353);
      var $tobool355=(($expval354)|(0))!=0;
      if ($tobool355) { label = 112; break; } else { label = 113; break; }
    case 112: 
      var $309=$TP250;
      var $310=$F343;
      var $bk357=(($310+12)|0);
      HEAP32[(($bk357)>>2)]=$309;
      var $311=$T;
      var $fd358=(($311+8)|0);
      HEAP32[(($fd358)>>2)]=$309;
      var $312=$F343;
      var $313=$TP250;
      var $fd359=(($313+8)|0);
      HEAP32[(($fd359)>>2)]=$312;
      var $314=$T;
      var $315=$TP250;
      var $bk360=(($315+12)|0);
      HEAP32[(($bk360)>>2)]=$314;
      var $316=$TP250;
      var $parent361=(($316+24)|0);
      HEAP32[(($parent361)>>2)]=0;
      label = 115; break;
    case 113: 
      _abort();
      throw "Reached an unreachable!"
    case 114: 
      label = 102; break;
    case 115: 
      label = 116; break;
    case 116: 
      label = 117; break;
    case 117: 
      label = 118; break;
    case 118: 
      label = 119; break;
    case 119: 
      var $317=$p;
      var $318=$317;
      var $add_ptr368=(($318+8)|0);

      return $add_ptr368;
    default: assert(0, "bad label: " + label);
  }

}


function __ZNKSt9bad_alloc4whatEv($this) {
  var label = 0;


  var $this_addr;
  $this_addr=$this;
  var $this1=$this_addr;

  return ((5243044)|0);
}


function __ZSt15get_new_handlerv() {
  var label = 0;


  var $0=(tempValue=HEAP32[((5243628)>>2)],HEAP32[((5243628)>>2)]=tempValue+0,tempValue);
  var $1=$0;

  return $1;
}


function __ZNSt9bad_allocC2Ev($this) {
  var label = 0;


  var $this_addr_i;
  var $this_addr;
  $this_addr=$this;
  var $this1=$this_addr;
  var $0=$this1;
  $this_addr_i=$0;
  var $this1_i=$this_addr_i;
  var $1=$this1_i;
  HEAP32[(($1)>>2)]=((__ZTVSt9exception+8)|0);
  var $2=$this1;
  HEAP32[(($2)>>2)]=((5243584)|0);

  return;
}


function __ZNSt9bad_allocC1Ev($this) {
  var label = 0;


  var $this_addr;
  $this_addr=$this;
  var $this1=$this_addr;
  __ZNSt9bad_allocC2Ev($this1);

  return;
}


function __ZNSt9bad_allocD1Ev($this) {
  var label = 0;


  var $this_addr;
  $this_addr=$this;
  var $this1=$this_addr;
  __ZNSt9bad_allocD2Ev($this1);

  return;
}


function __ZdlPv($ptr) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $ptr_addr;
      $ptr_addr=$ptr;
      var $0=$ptr_addr;
      var $tobool=(($0)|(0))!=0;
      if ($tobool) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $1=$ptr_addr;
      _free($1);
      label = 4; break;
    case 4: 

      return;
    default: assert(0, "bad label: " + label);
  }

}


function __ZdaPv($ptr) {
  var label = 0;


  var $ptr_addr;
  $ptr_addr=$ptr;
  var $0=$ptr_addr;
  __ZdlPv($0);

  return;
}


function __ZNSt9bad_allocD0Ev($this) {
  var label = 0;


  var $this_addr;
  $this_addr=$this;
  var $this1=$this_addr;
  __ZNSt9bad_allocD1Ev($this1);
  var $0=$this1;
  __ZdlPv($0);

  return;
}


function __ZNSt9bad_allocD2Ev($this) {
  var label = 0;


  var $this_addr;
  $this_addr=$this;
  var $this1=$this_addr;
  var $0=$this1;


  return;
}


function _add_segment($m, $tbase, $tsize, $mmapped) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $m_addr;
      var $tbase_addr;
      var $tsize_addr;
      var $mmapped_addr;
      var $old_top;
      var $oldsp;
      var $old_end;
      var $ssize;
      var $rawsp;
      var $offset;
      var $asp;
      var $csp;
      var $sp;
      var $ss;
      var $tnext;
      var $p;
      var $nfences;
      var $nextp;
      var $q;
      var $psize;
      var $tn;
      var $I;
      var $B;
      var $F;
      var $TP;
      var $H;
      var $I57;
      var $X;
      var $Y;
      var $N;
      var $K;
      var $T;
      var $K105;
      var $C;
      var $F144;
      $m_addr=$m;
      $tbase_addr=$tbase;
      $tsize_addr=$tsize;
      $mmapped_addr=$mmapped;
      var $0=$m_addr;
      var $top=(($0+24)|0);
      var $1=HEAP32[(($top)>>2)];
      var $2=$1;
      $old_top=$2;
      var $3=$m_addr;
      var $4=$old_top;
      var $call=_segment_holding($3, $4);
      $oldsp=$call;
      var $5=$oldsp;
      var $base=(($5)|0);
      var $6=HEAP32[(($base)>>2)];
      var $7=$oldsp;
      var $size=(($7+4)|0);
      var $8=HEAP32[(($size)>>2)];
      var $add_ptr=(($6+$8)|0);
      $old_end=$add_ptr;
      $ssize=24;
      var $9=$old_end;
      var $10=$ssize;
      var $add=((($10)+(16))|0);
      var $add1=((($add)+(7))|0);
      var $idx_neg=(((-$add1))|0);
      var $add_ptr2=(($9+$idx_neg)|0);
      $rawsp=$add_ptr2;
      var $11=$rawsp;
      var $add_ptr3=(($11+8)|0);
      var $12=$add_ptr3;
      var $and=$12 & 7;
      var $cmp=(($and)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      var $cond = 0;label = 5; break;
    case 4: 
      var $13=$rawsp;
      var $add_ptr4=(($13+8)|0);
      var $14=$add_ptr4;
      var $and5=$14 & 7;
      var $sub=(((8)-($and5))|0);
      var $and6=$sub & 7;
      var $cond = $and6;label = 5; break;
    case 5: 
      var $cond;
      $offset=$cond;
      var $15=$rawsp;
      var $16=$offset;
      var $add_ptr7=(($15+$16)|0);
      $asp=$add_ptr7;
      var $17=$asp;
      var $18=$old_top;
      var $add_ptr8=(($18+16)|0);
      var $cmp9=(($17)>>>(0)) < (($add_ptr8)>>>(0));
      if ($cmp9) { label = 6; break; } else { label = 7; break; }
    case 6: 
      var $19=$old_top;
      var $cond13 = $19;label = 8; break;
    case 7: 
      var $20=$asp;
      var $cond13 = $20;label = 8; break;
    case 8: 
      var $cond13;
      $csp=$cond13;
      var $21=$csp;
      var $22=$21;
      $sp=$22;
      var $23=$sp;
      var $24=$23;
      var $add_ptr14=(($24+8)|0);
      var $25=$add_ptr14;
      $ss=$25;
      var $26=$sp;
      var $27=$26;
      var $28=$ssize;
      var $add_ptr15=(($27+$28)|0);
      var $29=$add_ptr15;
      $tnext=$29;
      var $30=$tnext;
      $p=$30;
      $nfences=0;
      var $31=$m_addr;
      var $32=$tbase_addr;
      var $33=$32;
      var $34=$tsize_addr;
      var $sub16=((($34)-(40))|0);
      _init_top($31, $33, $sub16);
      var $35=$ssize;
      var $or=$35 | 1;
      var $or17=$or | 2;
      var $36=$sp;
      var $head=(($36+4)|0);
      HEAP32[(($head)>>2)]=$or17;
      var $37=$ss;
      var $38=$m_addr;
      var $seg=(($38+448)|0);
      var $39=$37;
      var $40=$seg;
      assert(16 % 1 === 0);HEAP32[(($39)>>2)]=HEAP32[(($40)>>2)];HEAP32[((($39)+(4))>>2)]=HEAP32[((($40)+(4))>>2)];HEAP32[((($39)+(8))>>2)]=HEAP32[((($40)+(8))>>2)];HEAP32[((($39)+(12))>>2)]=HEAP32[((($40)+(12))>>2)];
      var $41=$tbase_addr;
      var $42=$m_addr;
      var $seg18=(($42+448)|0);
      var $base19=(($seg18)|0);
      HEAP32[(($base19)>>2)]=$41;
      var $43=$tsize_addr;
      var $44=$m_addr;
      var $seg20=(($44+448)|0);
      var $size21=(($seg20+4)|0);
      HEAP32[(($size21)>>2)]=$43;
      var $45=$mmapped_addr;
      var $46=$m_addr;
      var $seg22=(($46+448)|0);
      var $sflags=(($seg22+12)|0);
      HEAP32[(($sflags)>>2)]=$45;
      var $47=$ss;
      var $48=$m_addr;
      var $seg23=(($48+448)|0);
      var $next=(($seg23+8)|0);
      HEAP32[(($next)>>2)]=$47;
      label = 9; break;
    case 9: 
      var $49=$p;
      var $50=$49;
      var $add_ptr24=(($50+4)|0);
      var $51=$add_ptr24;
      $nextp=$51;
      var $52=$p;
      var $head25=(($52+4)|0);
      HEAP32[(($head25)>>2)]=7;
      var $53=$nfences;
      var $inc=((($53)+(1))|0);
      $nfences=$inc;
      var $54=$nextp;
      var $head26=(($54+4)|0);
      var $55=$head26;
      var $56=$old_end;
      var $cmp27=(($55)>>>(0)) < (($56)>>>(0));
      if ($cmp27) { label = 10; break; } else { label = 11; break; }
    case 10: 
      var $57=$nextp;
      $p=$57;
      label = 12; break;
    case 11: 
      label = 13; break;
    case 12: 
      label = 9; break;
    case 13: 
      var $58=$csp;
      var $59=$old_top;
      var $cmp28=(($58)|(0))!=(($59)|(0));
      if ($cmp28) { label = 14; break; } else { label = 50; break; }
    case 14: 
      var $60=$old_top;
      var $61=$60;
      $q=$61;
      var $62=$csp;
      var $63=$old_top;
      var $sub_ptr_lhs_cast=$62;
      var $sub_ptr_rhs_cast=$63;
      var $sub_ptr_sub=((($sub_ptr_lhs_cast)-($sub_ptr_rhs_cast))|0);
      $psize=$sub_ptr_sub;
      var $64=$q;
      var $65=$64;
      var $66=$psize;
      var $add_ptr30=(($65+$66)|0);
      var $67=$add_ptr30;
      $tn=$67;
      var $68=$tn;
      var $head31=(($68+4)|0);
      var $69=HEAP32[(($head31)>>2)];
      var $and32=$69 & -2;
      HEAP32[(($head31)>>2)]=$and32;
      var $70=$psize;
      var $or33=$70 | 1;
      var $71=$q;
      var $head34=(($71+4)|0);
      HEAP32[(($head34)>>2)]=$or33;
      var $72=$psize;
      var $73=$q;
      var $74=$73;
      var $75=$psize;
      var $add_ptr35=(($74+$75)|0);
      var $76=$add_ptr35;
      var $prev_foot=(($76)|0);
      HEAP32[(($prev_foot)>>2)]=$72;
      var $77=$psize;
      var $shr=$77 >>> 3;
      var $cmp36=(($shr)>>>(0)) < 32;
      if ($cmp36) { label = 15; break; } else { label = 22; break; }
    case 15: 
      var $78=$psize;
      var $shr38=$78 >>> 3;
      $I=$shr38;
      var $79=$I;
      var $shl=$79 << 1;
      var $80=$m_addr;
      var $smallbins=(($80+40)|0);
      var $arrayidx=(($smallbins+($shl<<2))|0);
      var $81=$arrayidx;
      var $82=$81;
      $B=$82;
      var $83=$B;
      $F=$83;
      var $84=$m_addr;
      var $smallmap=(($84)|0);
      var $85=HEAP32[(($smallmap)>>2)];
      var $86=$I;
      var $shl39=1 << $86;
      var $and40=$85 & $shl39;
      var $tobool=(($and40)|(0))!=0;
      if ($tobool) { label = 17; break; } else { label = 16; break; }
    case 16: 
      var $87=$I;
      var $shl42=1 << $87;
      var $88=$m_addr;
      var $smallmap43=(($88)|0);
      var $89=HEAP32[(($smallmap43)>>2)];
      var $or44=$89 | $shl42;
      HEAP32[(($smallmap43)>>2)]=$or44;
      label = 21; break;
    case 17: 
      var $90=$B;
      var $fd=(($90+8)|0);
      var $91=HEAP32[(($fd)>>2)];
      var $92=$91;
      var $93=$m_addr;
      var $least_addr=(($93+16)|0);
      var $94=HEAP32[(($least_addr)>>2)];
      var $cmp46=(($92)>>>(0)) >= (($94)>>>(0));
      var $conv=(($cmp46)&(1));
      var $expval=($conv);
      var $tobool47=(($expval)|(0))!=0;
      if ($tobool47) { label = 18; break; } else { label = 19; break; }
    case 18: 
      var $95=$B;
      var $fd49=(($95+8)|0);
      var $96=HEAP32[(($fd49)>>2)];
      $F=$96;
      label = 20; break;
    case 19: 
      _abort();
      throw "Reached an unreachable!"
    case 20: 
      label = 21; break;
    case 21: 
      var $97=$q;
      var $98=$B;
      var $fd53=(($98+8)|0);
      HEAP32[(($fd53)>>2)]=$97;
      var $99=$q;
      var $100=$F;
      var $bk=(($100+12)|0);
      HEAP32[(($bk)>>2)]=$99;
      var $101=$F;
      var $102=$q;
      var $fd54=(($102+8)|0);
      HEAP32[(($fd54)>>2)]=$101;
      var $103=$B;
      var $104=$q;
      var $bk55=(($104+12)|0);
      HEAP32[(($bk55)>>2)]=$103;
      label = 49; break;
    case 22: 
      var $105=$q;
      var $106=$105;
      $TP=$106;
      var $107=$psize;
      var $shr58=$107 >>> 8;
      $X=$shr58;
      var $108=$X;
      var $cmp59=(($108)|(0))==0;
      if ($cmp59) { label = 23; break; } else { label = 24; break; }
    case 23: 
      $I57=0;
      label = 28; break;
    case 24: 
      var $109=$X;
      var $cmp63=(($109)>>>(0)) > 65535;
      if ($cmp63) { label = 25; break; } else { label = 26; break; }
    case 25: 
      $I57=31;
      label = 27; break;
    case 26: 
      var $110=$X;
      $Y=$110;
      var $111=$Y;
      var $sub67=((($111)-(256))|0);
      var $shr68=$sub67 >>> 16;
      var $and69=$shr68 & 8;
      $N=$and69;
      var $112=$N;
      var $113=$Y;
      var $shl70=$113 << $112;
      $Y=$shl70;
      var $sub71=((($shl70)-(4096))|0);
      var $shr72=$sub71 >>> 16;
      var $and73=$shr72 & 4;
      $K=$and73;
      var $114=$K;
      var $115=$N;
      var $add74=((($115)+($114))|0);
      $N=$add74;
      var $116=$K;
      var $117=$Y;
      var $shl75=$117 << $116;
      $Y=$shl75;
      var $sub76=((($shl75)-(16384))|0);
      var $shr77=$sub76 >>> 16;
      var $and78=$shr77 & 2;
      $K=$and78;
      var $118=$N;
      var $add79=((($118)+($and78))|0);
      $N=$add79;
      var $119=$N;
      var $sub80=(((14)-($119))|0);
      var $120=$K;
      var $121=$Y;
      var $shl81=$121 << $120;
      $Y=$shl81;
      var $shr82=$shl81 >>> 15;
      var $add83=((($sub80)+($shr82))|0);
      $K=$add83;
      var $122=$K;
      var $shl84=$122 << 1;
      var $123=$psize;
      var $124=$K;
      var $add85=((($124)+(7))|0);
      var $shr86=$123 >>> (($add85)>>>(0));
      var $and87=$shr86 & 1;
      var $add88=((($shl84)+($and87))|0);
      $I57=$add88;
      label = 27; break;
    case 27: 
      label = 28; break;
    case 28: 
      var $125=$I57;
      var $126=$m_addr;
      var $treebins=(($126+304)|0);
      var $arrayidx91=(($treebins+($125<<2))|0);
      $H=$arrayidx91;
      var $127=$I57;
      var $128=$TP;
      var $index=(($128+28)|0);
      HEAP32[(($index)>>2)]=$127;
      var $129=$TP;
      var $child=(($129+16)|0);
      var $arrayidx92=(($child+4)|0);
      HEAP32[(($arrayidx92)>>2)]=0;
      var $130=$TP;
      var $child93=(($130+16)|0);
      var $arrayidx94=(($child93)|0);
      HEAP32[(($arrayidx94)>>2)]=0;
      var $131=$m_addr;
      var $treemap=(($131+4)|0);
      var $132=HEAP32[(($treemap)>>2)];
      var $133=$I57;
      var $shl95=1 << $133;
      var $and96=$132 & $shl95;
      var $tobool97=(($and96)|(0))!=0;
      if ($tobool97) { label = 30; break; } else { label = 29; break; }
    case 29: 
      var $134=$I57;
      var $shl99=1 << $134;
      var $135=$m_addr;
      var $treemap100=(($135+4)|0);
      var $136=HEAP32[(($treemap100)>>2)];
      var $or101=$136 | $shl99;
      HEAP32[(($treemap100)>>2)]=$or101;
      var $137=$TP;
      var $138=$H;
      HEAP32[(($138)>>2)]=$137;
      var $139=$H;
      var $140=$139;
      var $141=$TP;
      var $parent=(($141+24)|0);
      HEAP32[(($parent)>>2)]=$140;
      var $142=$TP;
      var $143=$TP;
      var $bk102=(($143+12)|0);
      HEAP32[(($bk102)>>2)]=$142;
      var $144=$TP;
      var $fd103=(($144+8)|0);
      HEAP32[(($fd103)>>2)]=$142;
      label = 48; break;
    case 30: 
      var $145=$H;
      var $146=HEAP32[(($145)>>2)];
      $T=$146;
      var $147=$psize;
      var $148=$I57;
      var $cmp106=(($148)|(0))==31;
      if ($cmp106) { label = 31; break; } else { label = 32; break; }
    case 31: 
      var $cond115 = 0;label = 33; break;
    case 32: 
      var $149=$I57;
      var $shr110=$149 >>> 1;
      var $add111=((($shr110)+(8))|0);
      var $sub112=((($add111)-(2))|0);
      var $sub113=(((31)-($sub112))|0);
      var $cond115 = $sub113;label = 33; break;
    case 33: 
      var $cond115;
      var $shl116=$147 << $cond115;
      $K105=$shl116;
      label = 34; break;
    case 34: 
      var $150=$T;
      var $head118=(($150+4)|0);
      var $151=HEAP32[(($head118)>>2)];
      var $and119=$151 & -8;
      var $152=$psize;
      var $cmp120=(($and119)|(0))!=(($152)|(0));
      if ($cmp120) { label = 35; break; } else { label = 41; break; }
    case 35: 
      var $153=$K105;
      var $shr123=$153 >>> 31;
      var $and124=$shr123 & 1;
      var $154=$T;
      var $child125=(($154+16)|0);
      var $arrayidx126=(($child125+($and124<<2))|0);
      $C=$arrayidx126;
      var $155=$K105;
      var $shl127=$155 << 1;
      $K105=$shl127;
      var $156=$C;
      var $157=HEAP32[(($156)>>2)];
      var $cmp128=(($157)|(0))!=0;
      if ($cmp128) { label = 36; break; } else { label = 37; break; }
    case 36: 
      var $158=$C;
      var $159=HEAP32[(($158)>>2)];
      $T=$159;
      label = 40; break;
    case 37: 
      var $160=$C;
      var $161=$160;
      var $162=$m_addr;
      var $least_addr132=(($162+16)|0);
      var $163=HEAP32[(($least_addr132)>>2)];
      var $cmp133=(($161)>>>(0)) >= (($163)>>>(0));
      var $conv134=(($cmp133)&(1));
      var $expval135=($conv134);
      var $tobool136=(($expval135)|(0))!=0;
      if ($tobool136) { label = 38; break; } else { label = 39; break; }
    case 38: 
      var $164=$TP;
      var $165=$C;
      HEAP32[(($165)>>2)]=$164;
      var $166=$T;
      var $167=$TP;
      var $parent138=(($167+24)|0);
      HEAP32[(($parent138)>>2)]=$166;
      var $168=$TP;
      var $169=$TP;
      var $bk139=(($169+12)|0);
      HEAP32[(($bk139)>>2)]=$168;
      var $170=$TP;
      var $fd140=(($170+8)|0);
      HEAP32[(($fd140)>>2)]=$168;
      label = 47; break;
    case 39: 
      _abort();
      throw "Reached an unreachable!"
    case 40: 
      label = 46; break;
    case 41: 
      var $171=$T;
      var $fd145=(($171+8)|0);
      var $172=HEAP32[(($fd145)>>2)];
      $F144=$172;
      var $173=$T;
      var $174=$173;
      var $175=$m_addr;
      var $least_addr146=(($175+16)|0);
      var $176=HEAP32[(($least_addr146)>>2)];
      var $cmp147=(($174)>>>(0)) >= (($176)>>>(0));
      if ($cmp147) { label = 42; break; } else { var $181 = 0;label = 43; break; }
    case 42: 
      var $177=$F144;
      var $178=$177;
      var $179=$m_addr;
      var $least_addr149=(($179+16)|0);
      var $180=HEAP32[(($least_addr149)>>2)];
      var $cmp150=(($178)>>>(0)) >= (($180)>>>(0));
      var $181 = $cmp150;label = 43; break;
    case 43: 
      var $181;
      var $land_ext=(($181)&(1));
      var $expval152=($land_ext);
      var $tobool153=(($expval152)|(0))!=0;
      if ($tobool153) { label = 44; break; } else { label = 45; break; }
    case 44: 
      var $182=$TP;
      var $183=$F144;
      var $bk155=(($183+12)|0);
      HEAP32[(($bk155)>>2)]=$182;
      var $184=$T;
      var $fd156=(($184+8)|0);
      HEAP32[(($fd156)>>2)]=$182;
      var $185=$F144;
      var $186=$TP;
      var $fd157=(($186+8)|0);
      HEAP32[(($fd157)>>2)]=$185;
      var $187=$T;
      var $188=$TP;
      var $bk158=(($188+12)|0);
      HEAP32[(($bk158)>>2)]=$187;
      var $189=$TP;
      var $parent159=(($189+24)|0);
      HEAP32[(($parent159)>>2)]=0;
      label = 47; break;
    case 45: 
      _abort();
      throw "Reached an unreachable!"
    case 46: 
      label = 34; break;
    case 47: 
      label = 48; break;
    case 48: 
      label = 49; break;
    case 49: 
      label = 50; break;
    case 50: 

      return;
    default: assert(0, "bad label: " + label);
  }

}


function __Znwj($size) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $size_addr;
      var $p;
      var $nh;
      var $exn_slot;
      var $ehselector_slot;
      $size_addr=$size;
      var $0=$size_addr;
      var $cmp=(($0)|(0))==0;
      if ($cmp) { label = 3; break; } else { label = 4; break; }
    case 3: 
      $size_addr=1;
      label = 4; break;
    case 4: 
      label = 5; break;
    case 5: 
      var $1=$size_addr;
      var $call=_malloc($1);
      $p=$call;
      var $cmp1=(($call)|(0))==0;
      if ($cmp1) { label = 6; break; } else { label = 14; break; }
    case 6: 
      var $call2=__ZSt15get_new_handlerv();
      $nh=$call2;
      var $2=$nh;
      var $tobool=(($2)|(0))!=0;
      if ($tobool) { label = 7; break; } else { label = 12; break; }
    case 7: 
      var $3=$nh;
      (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$3]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label = 8; break; } else { label = 9; break; }
    case 8: 
      label = 13; break;
    case 9: 
      var $4$0 = ___cxa_find_matching_catch(HEAP32[((_llvm_eh_exception.buf)>>2)],HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)],[]); $4$1 = tempRet0;
      var $5=$4$0;
      $exn_slot=$5;
      var $6=$4$1;
      $ehselector_slot=$6;
      label = 10; break;
    case 10: 
      var $sel=$ehselector_slot;
      var $ehspec_fails=(($sel)|(0)) < 0;
      if ($ehspec_fails) { label = 11; break; } else { label = 15; break; }
    case 11: 
      var $exn=$exn_slot;
      ___cxa_call_unexpected($exn);
      throw "Reached an unreachable!"
    case 12: 
      var $exception=___cxa_allocate_exception(4);
      var $7=$exception;
      __ZNSt9bad_allocC1Ev($7);
      (function() { try { __THREW__ = 0; return ___cxa_throw($exception, 5243616, (4)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label = 16; break; } else { label = 9; break; }
    case 13: 
      label = 5; break;
    case 14: 
      var $8=$p;

      return $8;
    case 15: 
      var $exn5=$exn_slot;
      var $sel6=$ehselector_slot;
      var $lpad_val$0=$exn5;
      var $lpad_val$1=0;
      var $lpad_val7$0=$lpad_val$0;
      var $lpad_val7$1=$sel6;
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) { HEAP32[((_llvm_eh_exception.buf)>>2)]=$lpad_val7$0 } throw $lpad_val7$0;;
    case 16: 
      throw "Reached an unreachable!"
    default: assert(0, "bad label: " + label);
  }

}


function __Znaj($size) {
  var label = 0;

  label = 2; 
  while(1) switch(label) {
    case 2: 
      var $size_addr;
      var $exn_slot;
      var $ehselector_slot;
      $size_addr=$size;
      var $0=$size_addr;
      var $call = (function() { try { __THREW__ = 0; return __Znwj($0) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label = 3; break; } else { label = 4; break; }
    case 3: 

      return $call;
    case 4: 
      var $1$0 = ___cxa_find_matching_catch(HEAP32[((_llvm_eh_exception.buf)>>2)],HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)],[]); $1$1 = tempRet0;
      var $2=$1$0;
      $exn_slot=$2;
      var $3=$1$1;
      $ehselector_slot=$3;
      label = 5; break;
    case 5: 
      var $sel=$ehselector_slot;
      var $ehspec_fails=(($sel)|(0)) < 0;
      if ($ehspec_fails) { label = 6; break; } else { label = 7; break; }
    case 6: 
      var $exn=$exn_slot;
      ___cxa_call_unexpected($exn);
      throw "Reached an unreachable!"
    case 7: 
      var $exn1=$exn_slot;
      var $sel2=$ehselector_slot;
      var $lpad_val$0=$exn1;
      var $lpad_val$1=0;
      var $lpad_val3$0=$lpad_val$0;
      var $lpad_val3$1=$sel2;
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) { HEAP32[((_llvm_eh_exception.buf)>>2)]=$lpad_val3$0 } throw $lpad_val3$0;;
    default: assert(0, "bad label: " + label);
  }

}


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

Module.callMain = function callMain(args) {
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);


  var ret;

  ret = Module['_main'](argc, argv, 0);


  return ret;
}




function run(args) {
  args = args || Module['arguments'];

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }

  function doRun() {
    var ret = 0;
    calledRun = true;
    if (Module['_main']) {
      preMain();
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

initRuntime();

var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

if (shouldRunNow) {
  var ret = run();
}

// {{POST_RUN_ADDITIONS}}






  // {{MODULE_ADDITIONS}}



return ThinPlateSpline;
})();

var tps = new ThinPlateSpline();
tps.add_point([100,100], [200, 200]);
tps.add_point([200,200], [400, 400]);
tps.add_point([150,150], [320, 350]);
//tps.add_point(100,200,[205,412]);
tps.solve();
var ord = tps.transform([160,160]);
//console.log('honyo');
console.log(ord);
var rev = tps.transform(ord,true);
//console.log('honyo');
console.log(rev);

var serial = tps.serialize();

var tps2 = new ThinPlateSpline();

tps2.deserialize(serial);

var ord2 = tps2.transform([160,160]);
//console.log('honyo');
console.log(ord2);
var rev2 = tps2.transform(ord2,true);
//console.log('honyo');
console.log(rev2);


if (typeof importScripts === 'function') {
  /* Worker loader */
  var tps = new ThinPlateSpline();
  tps.isWorker = true;

  self.onmessage = function(event) {
    var payload = event.data;
    var method  = payload.method;
    var data    = payload.data;

    self.postMessage({'event':'echo','data':payload});

    switch (method){
      case 'push_points':
        tps.push_points(data);
        self.postMessage({'event':'solved'});
        break;
      case 'load_points':
        var xhr = new XMLHttpRequest();
        xhr.open('GET', data, true);

        xhr.onload = function(e) {
          if (this.status == 200) {
            var points = JSON.parse(this.response);
            tps.push_points(points);
            self.postMessage({'event':'solved'});
          } else {
            self.postMessage({'event':'cannotLoad'});
          }
        };
        xhr.send();
        break;
      case 'deserialize':
        //var serial = JSON.parse(data);
        tps.deserialize(data);
        self.postMessage({'event':'solved'});
        break;
      case 'load_serial':
        var xhr = new XMLHttpRequest();
        xhr.open('GET', data, true);

        xhr.onload = function(e) {
          if (this.status == 200) {
            var serial = JSON.parse(this.response);
            self.postMessage({'event':'serialized','serial':serial});
          } else {
            self.postMessage({'event':'cannotLoad'});
          }
        };
        xhr.send();
        break;
      case 'serialize':
        var serial = tps.serialize();
        self.postMessage({'event':'serialized','serial':serial});
        break;
      case 'transform':
        var coord = data.coord;
        var inv   = data.inv;
        var dst   = tps.transform(coord,inv);
        self.postMessage({'event':'transformed','inv':inv,'coord':dst});
        break;
      case 'echo':
        self.postMessage({'event':'echo'});
        break;
      case 'destruct':
        break;
    }
  };
}
