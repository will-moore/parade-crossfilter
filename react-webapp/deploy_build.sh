#!/bin/bash

#copy over html,css,js and templates
echo "Deploying built resources..."
mkdir -p react_webapp/templates/react_webapp/
mkdir -p react_webapp/static/react_webapp/

cp build/index.html react_webapp/templates/react_webapp/
cp -r build/static/* react_webapp/static/react_webapp
