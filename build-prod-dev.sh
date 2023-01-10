#!/usr/bin/env bash

 echo "Building the DHIS2 app"
 #yarn build
 echo "Preparing the install app files"
 if [ -d "./build" ]; then
   cd build
   # cp manifest.json manifest.webapp
   #rsync -ravz  static/images static
   echo "packaging the file as zip"
   zip -r dhis2-manage-data-for-datim-0.1.7.zip * -x "*.js.map" -x "*.css.map" -x "runtime*.js"
  
 else
   echo "Build failed"
 fi
