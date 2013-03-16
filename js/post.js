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