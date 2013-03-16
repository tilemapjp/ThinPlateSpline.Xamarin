# Edit for your paths
EMSCRIPTEN=~/Dev/emscripten
EMCC=$(EMSCRIPTEN)/emcc -O2
# -s INLINING_LIMIT=0

all: thinplatespline.js

thinplatespline.js: thinplatespline.cpp
	$(EMCC) $(CFLAGS) thinplatespline.cpp --pre-js ../js/pre.js --post-js ../js/post.js -o ../js/thinplatespline.js -s EXPORTED_FUNCTIONS="['__ZN17VizGeorefSpline2DC1Ei','__ZN17VizGeorefSpline2D9add_pointEddPKd','__ZN17VizGeorefSpline2D5solveEv','__ZN17VizGeorefSpline2D9get_pointEddPd','__ZN17VizGeorefSpline2D14serialize_sizeEv','__ZN17VizGeorefSpline2D9serializeEPc','__ZN17VizGeorefSpline2D11deserializeEPc']"
#	-s LINKABLE=1
# --typed-arrays 0 
clean:
	rm ../js/thinplatespline.js
