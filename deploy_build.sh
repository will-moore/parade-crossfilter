#!/bin/bash

#copy over html,css,js and templates
echo "Deploying built resources..."
mkdir -p parade_crossfilter/templates/parade_crossfilter/
mkdir -p parade_crossfilter/static/parade_crossfilter/

cp build/index.html parade_crossfilter/templates/parade_crossfilter/
cp -r build/static/* parade_crossfilter/static/parade_crossfilter
