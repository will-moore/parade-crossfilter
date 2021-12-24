# OMERO parade-crossfilter

This is a prototype OMERO.web app, exploring the use of https://github.com/crossfilter/crossfilter in a new implementation of https://github.com/ome/omero-parade.

It uses [Create React App](https://github.com/facebook/create-react-app) 
with the cross-filter, [dc.js](https://dc-js.github.io/dc.js/) and React interaction
based on the blog post at https://www.lighttag.io/blog/react-dc-js/.

# Install

Install into your omero-web python environment:

    $ pip install parade-crossfilter

You will need to have the app configured in your OMERO.web install:

    $ omero config append omero.web.apps '"parade_crossfilter"'

Add to 'open_with' config:

    $ omero config append omero.web.open_with '["Parade", "parade_crossfilter_index", {"supported_objects": ["project", "screen"]}]'


<a href="https://www.youtube.com/watch?v=FyjGhZxx6es&feature=youtu.be">
    <img src="https://user-images.githubusercontent.com/900055/78835005-57765300-79e7-11ea-873d-a5a2f3a07638.png" width="650px">
</a>

## Questions to Answer

This prototype aims to investigate the scope and technical solutions for a
data-visualization app based on ```omero-parade```.

Limitations of the current ```omero-parade``` app include:

 - Data is tied to Images (in Dataset) or Wells (in Plate). Can't handle data linked to ROIS or to multiple Images in a Well.
 - Loads the same data from the server for filtering *again* for display.
 - Limited plots available (scatter plot only)

Particular questions:

 - Is crossfilter.js a suitable tool for filtering/grouping data? (A: mostly good)
 - What to use for Plots? (A: Plotly.js is looking pretty good)
 - How do we handle hierarchy of multiple Images per Well, or ROIs per Image?
 - How much data processing is possible, while still being usable / generic?
 - Is Parade primarily for **exploring** or **presenting** data (like figure)?


<img src="https://user-images.githubusercontent.com/900055/77835025-66d0e300-7141-11ea-9b4a-ba1fe5885e57.png" />

## Development

To install in dev mode, you need to checkout this repository, then:

    $ cd parade-crossfilter
    $ pip install -e .

To build the JS bundle, you'll need to have [Node](https://nodejs.org/) installed.
Then install the JavaScript dependencies and build:

    $ npm install
    $ npm run build

This builds the app for production to the `build` folder and copies the
html and static files to the Django app in `parade_crossfilter`.<br>
See OMERO config steps above.

You can run this project in development mode or as an OMERO.web Django app (below).

The notes below are largely from `Create React App` but have been updated with
changes made to connect to OMERO in dev or production modes.

To get started:

    $ cd parade-crossfilter
    $ npm install

In the project directory, you can run:

    $ npm start

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The app will try to connect to an OMERO.web server at http://localhost:4080
using an existing session, which requires CORS to be enabled.<br>
You will need to be logged-in to http://localhost:4080/webclient.<br>
To use a different server, edit `dev_omeroweb_index` in `public/index.html`.

## Release

 - Update version to release version in setup.py and package.json
 - Update CHANGELOG
 - Commit and tag

Run:

    $ rm -rf dist
    $ python setup.py sdist bdist_wheel

    # TODO: get github actions to do this!
    $ python -m twine upload dist/*
