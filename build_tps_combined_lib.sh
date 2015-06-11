#!/bin/bash
PREFIX=`pwd`/install
rm -rf $PREFIX
mkdir -p $PREFIX
LOG=`pwd`/log
rm -rf $LOG
mkdir -p $LOG
IOS_DIST=`pwd`/ThinPlateSpline.iOS
AND_DIST=`pwd`/ThinPlateSpline.Android
 
if [ -e ${PREFIX} ]
then
	echo removing ${PREFIX}
	rm -rf ${PREFIX}
fi
if [ -e ${DIST} ]
then
    echo removing ${DIST}
    rm -rf ${DIST}
fi
 
mkdir -p ${PREFIX}
mkdir -p ${IOS_DIST}
mkdir -p ${AND_DIST}

#for swig

swig -c++ -csharp -namespace TilemapJP -dllimport thinplatespline swig/ThinPlateSpline.i
mv swig/*.cs ThinPlateSpline.Shared/.

#for iOS

export IPHONEOS_DEPLOYMENT_TARGET=7.1
 
for f in "armv7" "armv7s" "arm64"; do
echo Building iOS $f
./build_tps_ios.sh -p ${PREFIX} -a $f device 2>&1 | tee "${LOG}/iOS_${f}.txt"
done
 
echo Building iOS simulator
./build_tps_ios.sh -p ${PREFIX} simulator 2>&1 | tee "${LOG}/iOS_simulator.txt"
 
mkdir -p ${IOS_DIST}/lib
rm -f ${IOS_DIST}/lib/libthinplatespline.a
lipo \
${PREFIX}/i386/iphonesimulator${IPHONEOS_DEPLOYMENT_TARGET}.sdk/libthinplatespline.a \
${PREFIX}/armv7/iphoneos${IPHONEOS_DEPLOYMENT_TARGET}.sdk/libthinplatespline.a \
${PREFIX}/armv7s/iphoneos${IPHONEOS_DEPLOYMENT_TARGET}.sdk/libthinplatespline.a \
${PREFIX}/arm64/iphoneos${IPHONEOS_DEPLOYMENT_TARGET}.sdk/libthinplatespline.a \
-output ${IOS_DIST}/lib/libthinplatespline.a \
-create | tee $LOG/lipo.txt

#for Android

export ANDROID_DEPLOYMENT_TARGET=17

for f in "armeabi" "armeabi-v7a" "mips" "x86"; do
echo Building Android $f
./build_tps_android.sh -p ${PREFIX} -a $f 2>&1 | tee "${LOG}/Android_${f}.txt"
mkdir -p ${AND_DIST}/lib/${f} | tee $LOG/android-copy.txt
rm -f ${AND_DIST}/lib/${f}/libthinplatespline.so
cp -f ${PREFIX}/android-${ANDROID_DEPLOYMENT_TARGET}.sdk/${f}/libthinplatespline.so ${AND_DIST}/lib/${f}/libthinplatespline.so | tee $LOG/android-copy.txt
done
