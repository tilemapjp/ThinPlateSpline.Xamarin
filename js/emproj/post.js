
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