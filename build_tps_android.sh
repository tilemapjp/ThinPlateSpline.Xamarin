#!/bin/bash
set -u
 
default_android_version=17
default_architecture=armeabi
default_ndk_root=/android-ndk-r10d
default_prefix=./android
 
export ANDROID_DEPLOYMENT_TARGET="${ANDROID_DEPLOYMENT_TARGET:-$default_android_version}"
DEFAULT_ARCHITECTURE="${DEFAULT_ARCHITECTURE:-$default_architecture}"
DEFAULT_PREFIX="${DEFAULT_PREFIX:-$default_prefix}"
NDK_ROOT="${NDK_ROOT:-$default_ndk_root}" 
 
usage ()
    {
cat >&2 << EOF
    Usage: ${0} [-h] [-p prefix] [-a arch] [-n ndk_root] [configure_args]
        -h  Print help message
        -p  Installation prefix (default: ./android...)
        -a  Architecture target for compilation (default: armeabi)
        -n  Android NDK root (default: /android-ndk-r9d)
 
    Any additional arguments are passed to configure.
 
    The following environment variables affect the build process:
 
        ANDROID_DEPLOYMENT_TARGET  (default: $default_android_version)
        DEFAULT_PREFIX  (default: $default_prefix)
        NDK_ROOT  (default: $default_ndk_root)
EOF
    }
 
prefix="${DEFAULT_PREFIX}"
 
while getopts ":hp:a:n:" opt; do
        case $opt in
        h  ) usage ; exit 0 ;;
        p  ) prefix="$OPTARG" ;;
        a  ) DEFAULT_ARCHITECTURE="$OPTARG" ;;
        n  ) NDK_ROOT="$OPTARG" ;;
        \? ) usage ; exit 2 ;;
        esac
done
shift $(( $OPTIND - 1 ))
 
archname="${DEFAULT_ARCHITECTURE}"
arch="${archname}"
archdir="${arch}"

case $arch in
 
        mips )
        extra_cflags=" "
        extra_ldflags=" "
        host="mipsel-linux-android"
        ;;
 
        x86 )
        extra_cflags=" "
        extra_ldflags=" "
        host="i686-linux-android"
        ;;

        armeabi )
        arch=arm
        extra_cflags="-mthumb"
        extra_ldflags=" "
        host="arm-linux-androideabi"
        ;;

        armeabi-v7a )
        arch=arm
        extra_cflags="-march=armv7-a -mfloat-abi=softfp"
        extra_ldflags="-Wl,--fix-cortex-a8"
        host="arm-linux-androideabi"
        ;;
 
        * )
        echo No valid architecture found!!!
        usage
        exit 2
 
esac

#create toolchain if necesary
toolchain=`pwd`/android-${ANDROID_DEPLOYMENT_TARGET}-toolchain-${arch}
if [ ! -e ${toolchain} ]
then
    echo toolchain missing, creating
    ${NDK_ROOT}/build/tools/make-standalone-toolchain.sh \
        --platform=android-${ANDROID_DEPLOYMENT_TARGET} \
        --install-dir=${toolchain} \
        --arch=${arch} --system=darwin-x86_64
fi
export PATH=${toolchain}/bin:$PATH
 
echo "building for host ${host}"

prefix="${prefix}/android-${ANDROID_DEPLOYMENT_TARGET}.sdk/${archdir}"
mkdir -p ${prefix}
 
echo
echo library will be exported to $prefix
 
#setup compiler flags
export CC="${toolchain}/bin/${host}-gcc"
export LIBS="-lsupc++ -lstdc++"
export CFLAGS="${extra_cflags} -DHAVE_LONG_LONG -pipe -Os -gdwarf-2"
export LDFLAGS="${extra_ldflags}"
export CXX="${toolchain}/bin/${host}-g++"
export CXXFLAGS="${CFLAGS}"
export CPP="${toolchain}/bin/${host}-cpp"
export CXXCPP="${CPP}"
 
echo CFLAGS ${CFLAGS}
 
${CXX}  ${CXXFLAGS} -shared -fPIC -o ${prefix}/libthinplatespline.so tps_c/thinplatespline.cpp 
