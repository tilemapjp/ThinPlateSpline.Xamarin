# Edit for your paths
EMSCRIPTEN?=~/emscripten
# -s SAFE_DYNCALLS=1 -O0 -g2 -s ASSERTIONS=1 -s ALIASING_FUNCTION_POINTERS=0
EMCC?=$(EMSCRIPTEN)/emcc -O2
EMCONFIG?=$(EMSCRIPTEN)/emconfigure
EMMAKE?=$(EMSCRIPTEN)/emmake
PROJ4_VERSION?=4.8.0
PROJ4_SRCDIR?=c_src/proj-$(PROJ4_VERSION)/
#JS_COMPILER = java -Xmx512M -jar lib/google-compiler/compiler.jar --charset UTF-8
#ifeq ($(MINIMIZE),false)
MINIMIZE=
#else
#MINIMIZE=--closure 1
#endif

all: tps.js

tps.js: tps_c/thinplatespline.cpp js/tps/pre.js js/tps/post.js
	$(EMCC) $(MINIMIZE) $(CFLAGS) -s TOTAL_STACK=10000000 tps_c/thinplatespline.cpp --pre-js js/tps/pre.js --post-js js/tps/post.js -o js/tps.js -s EXPORTED_FUNCTIONS="['__ZN17VizGeorefSpline2DD2Ev','__ZN17VizGeorefSpline2DC2Ei','__ZN17VizGeorefSpline2D15get_object_sizeEv','__ZN17VizGeorefSpline2D9add_pointEddPKd','__ZN17VizGeorefSpline2D5solveEv','__ZN17VizGeorefSpline2D9get_pointEddPd','__ZN17VizGeorefSpline2D14serialize_sizeEv','__ZN17VizGeorefSpline2D9serializeEPc','__ZN17VizGeorefSpline2D11deserializeEPc']"

#min.js: js/thinplatespline.js
#	rm -f js/thinplatespline.min.js
#	$(JS_COMPILER) --js js/thinplatespline.js >> js/thinplatespline.min.js

$(PROJ4_SRCDIR)src/.libs/libproj.dylib: 
	cd $(PROJ4_SRCDIR);$(EMCONFIG) ./configure;$(EMMAKE) make

proj: $(PROJ4_SRCDIR)src/.libs/libproj.dylib
	$(EMCC) $(MINIMIZE) $(CFLAGS) $(PROJ4_SRCDIR)src/.libs/libproj.a --pre-js js/emproj/pre.js --post-js js/emproj/post.js -o js/emproj.js -s EXPORTED_FUNCTIONS="['_strlen','_free','_strncpy','_pj_init_plus','_memset','_malloc','_pj_transform','_memcpy', '_strcpy']"
	sed -e s/--\.342/+.342/ js/emproj.js > js/emproj.js_sed1
	sed -e s/\+\(\+,\+2\.0\)\;\+\(\)\;\+\(\)\;\+\(\+,\+2\.0\)\;\+\(\+,\+2\.0\)\;\+\(\)\;\+\(\)\;\+\(\)\;// js/emproj.js_sed1 > js/emproj.js_sed2
	rm js/emproj.js_sed1
	mv js/emproj.js_sed2 js/emproj.js

proj_clean:
	cd $(PROJ4_SRCDIR);make distclean

clean:
	rm js/tps.js
