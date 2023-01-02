#!/usr/bin/env bash

 echo "Building the DHIS2 app"
 yarn build
 echo "Preparing the install app files"
 if [ -d "./build" ]; then
   cd build
   cp manifest.json manifest.webapp
   #rsync -ravz  static/images static
   echo "packaging the file as zip"
   zip -r dhis2-dhis2-import-gen-0.1.0.zip * -x "*.js.map" -x "*.css.map" -x "runtime*.js" -x "asset-manifest.json"
  
 else
   echo "Build failed"
 fi
