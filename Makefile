# Edit for your paths
EMSCRIPTEN=~/emscripten
EMCC=$(EMSCRIPTEN)/emcc -O2 
#JS_COMPILER = java -Xmx512M -jar lib/google-compiler/compiler.jar --charset UTF-8

all: thinplatespline.js

thinplatespline.js: tps/thinplatespline.cpp js/pre.js js/post.js
	$(EMCC) $(CFLAGS) tps/thinplatespline.cpp --pre-js js/pre.js --post-js js/post.js -o js/thinplatespline.js -s EXPORTED_FUNCTIONS="['__ZN17VizGeorefSpline2DD2Ev','__ZN17VizGeorefSpline2DC2Ei','__ZN17VizGeorefSpline2D9add_pointEddPKd','__ZN17VizGeorefSpline2D5solveEv','__ZN17VizGeorefSpline2D9get_pointEddPd','__ZN17VizGeorefSpline2D14serialize_sizeEv','__ZN17VizGeorefSpline2D9serializeEPc','__ZN17VizGeorefSpline2D11deserializeEPc']"

#min.js: js/thinplatespline.js
#	rm -f js/thinplatespline.min.js
#	$(JS_COMPILER) --js js/thinplatespline.js >> js/thinplatespline.min.js

clean:
	rm js/thinplatespline.js
