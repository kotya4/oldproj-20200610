#!/bin/bash
identify -format ".%f { background: ASSET_PATH('assets/img/%f') center center no-repeat; width: %wpx; height: %hpx; }\n" "$(pwd)/*.svg"