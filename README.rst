ThinPlateSpline.js
===

MIT licensed JavaScript library to create Thin-Plate-Splines from control points.

Based on python Thin-Plate-Splines library,
https://github.com/olt/thinplatespline
And also it uses code from the GDAL Warp API, but there is no dependency to GDAL.

::

  var tps = new ThinPlateSpline();
  
  tps.push_points([
    [[100,100], [200, 200]],
    [[200,200], [400, 400]],
    [[150,150], [320, 350]]
  ]);
  
  tps.solve();
  
  //Forward transform
  var ord = tps.transform([160, 160], false);
  //ord => [336, 360]
  
  //Backward transform
  var rev = tps.transform(ord, true);
  //rev => [160, 160]
  
  //Solving thin-Plate-Spline from many points by scrach takes too many time.
  //So, there are object-serialization method to store solved instance.
  
  var serial = tps.serialize();
  
  var tps2 = new ThinPlateSpline();
  tps2.deserialize(serial);
  
  var ord2 = tps2.transform([160, 160], false);
  var rev2 = tps2.transform(ord2, true);
  //Same results with ord, rev
  
  //Rough comparison between Solving row points and Loading solved serial object  
  //Number of points: 328, in Chrome, from AWS EC2 via FTTH 
  +--------+--------------+------------------+----------------------+
  | Data   | Size of Data | Downloading time | Solving/Loading time |
  +--------+--------------+------------------+----------------------+
  | Points | 33KB         | 690ms            | 40s                  |
  +--------+--------------+------------------+----------------------+
  | Serial | 3.6MB        | 995ms            | a second             |
  +--------+--------------+------------------+----------------------+
  After spawn solved instance, transformation works very quickly.
  Serial data format is binary.
