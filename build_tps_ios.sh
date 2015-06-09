#!/bin/bash
set -u
 
default_iphoneos_version=7.1
default_architecture=armv7
default_prefix=./ios
 
export IPHONEOS_DEPLOYMENT_TARGET="${IPHONEOS_DEPLOYMENT_TARGET:-$default_iphoneos_version}"
DEFAULT_ARCHITECTURE="${DEFAULT_ARCHITECTURE:-$default_architecture}"
DEFAULT_PREFIX="${DEFAULT_PREFIX:-$default_prefix}"
 
 
usage ()
    {
cat >&2 << EOF
    Usage: ${0} [-h] [-p prefix] [-a arch] target [configure_args]
        -h  Print help message
        -p  Installation prefix (default: ./ios...)
        -a  Architecture target for compilation (default: armv7)
 
    The target must be "device" or "simulator".  Any additional arguments
    are passed to configure.
 
    The following environment variables affect the build process:
 
        IPHONEOS_DEPLOYMENT_TARGET  (default: $default_iphoneos_version)
        DEFAULT_PREFIX  (default: $default_prefix)
EOF
    }
 
prefix="${DEFAULT_PREFIX}"
 
while getopts ":hp:a:" opt; do
        case $opt in
        h  ) usage ; exit 0 ;;
        p  ) prefix="$OPTARG" ;;
        a  ) DEFAULT_ARCHITECTURE="$OPTARG" ;;
        \? ) usage ; exit 2 ;;
        esac
done
shift $(( $OPTIND - 1 ))
 
if (( $# < 1 )); then
    usage
    exit 2
fi
 
target=$1
shift
 
case $target in
 
        device )
        arch="${DEFAULT_ARCHITECTURE}"
        platform=iphoneos
        extra_cflags=" "
        ;;
 
        simulator )
        arch=i386
        platform=iphonesimulator
        extra_cflags="-D__IPHONE_OS_VERSION_MIN_REQUIRED=${IPHONEOS_DEPLOYMENT_TARGET%%.*}0000"
        ;;
 
        * )
        echo No target found!!!
        usage
        exit 2
 
esac
if [ $arch = "arm64" ]
    then
    host="arm-apple-darwin"
else
    host="${arch}-apple-darwin"
    extra_cflags="${extra_cflags} -DHAVE_LONG_LONG"
fi
 
echo "building for host ${host}"
 
platform_dir=`xcrun -find -sdk ${platform} --show-sdk-platform-path`
platform_sdk_dir=`xcrun -find -sdk ${platform} --show-sdk-path`
prefix="${prefix}/${arch}/${platform}${IPHONEOS_DEPLOYMENT_TARGET}.sdk"
mkdir -p ${prefix}
 
echo
echo library will be exported to $prefix
 
#setup compiler flags
export CC=`xcrun -find -sdk iphoneos gcc`
#export CFLAGS="-Wno-error=unused-command-line-argument-hard-error-in-future -Wno-error=implicit-function-declaration -arch ${arch} -pipe -Os -gdwarf-2 -isysroot ${platform_sdk_dir} ${extra_cflags}"
export CFLAGS="-Wno-error=implicit-function-declaration -arch ${arch} -pipe -Os -gdwarf-2 -isysroot ${platform_sdk_dir} ${extra_cflags}"
export LDFLAGS="-arch ${arch} -isysroot ${platform_sdk_dir}"
export CXX=`xcrun -find -sdk iphoneos g++`
export CXXFLAGS="${CFLAGS}"
export CPP=`xcrun -find -sdk iphoneos cpp`
export CXXCPP="${CPP}"
 
echo CFLAGS ${CFLAGS}
 
${CXX} ${CXXFLAGS} -c -fPIC -o ${prefix}/libthinplatespline.a tps_c/thinplatespline.cpp 
