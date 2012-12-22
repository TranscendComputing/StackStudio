#!/bin/bash
# Build C9 app using Flex SDK
usage() {
  echo "USAGE: `basename $0` [ -v ]"
  echo ""
}

while getopts vah OPTION; do
  case ${OPTION} in
    v) VERBOSE=1;;
    h) usage
       exit 0;;
    \?) usage
        exit 2;;
  esac
done

# Default flex location if not set
FLEXSDK=${FLEXSDK:-/usr/local/flex_sdk}

[ $VERBOSE ] && echo "Using Flex at $FLEXSDK"

read -d '' FLEXLIBS <<"EOF"
-library-path+=../libs/FlexSpy.swc
-library-path+=../libs/JSON.swc
-library-path+=../libs/as3crypto.swc
-library-path+=../libs/as3httpclientlib-1_0_6.swc
-library-path+=../libs/corelib.swc
-library-path+=../libs/diagrammer.swc
-library-path+=../libs/flex-iframe-1.5.1.swc
-library-path+=../libs/flexlib.swc
-library-path+=../libs/flexunit-4.0.0.swc
-library-path+=../libs/flexunit-aircilistener-4.0.0.swc
-library-path+=../libs/flexunit-cilistener-4.0.0.swc
-library-path+=../libs/flexunit-flexcoverlistener-4.0.0.swc
-library-path+=../libs/flexunit-uilistener-4.0.0.swc
-library-path+=../libs/mobilecomponents.swc
-library-path+=../libs/papervision_phunky.swc
-library-path+=../libs/tweener.swc
-library-path+=../libs/visualizer.swc
-library-path+=../libs/visualizerMultitouch.swc
EOF

[ $VERBOSE ] && echo "$FLEXSDK/bin/mxmlc C9.mxml -library-path+=. $FLEXLIBS -theme=$FLEXSDK/frameworks/themes/Halo/halo.swc"

$FLEXSDK/bin/mxmlc C9.mxml -library-path+=. $FLEXLIBS -theme=$FLEXSDK/frameworks/themes/Halo/halo.swc

#-library-path+=maps_flex_1_7.swc
