WEBPACK SETUP (incl. BABEL - support of ECMA2015)
=============

This is a very minimal example for a web app using webpack setup.
It queries the projects on the server using the web api.
JQuery is used to send the ajax request and manipulate the html.


Build
============
To install the dependencies run
::

    $ npm install


To build and deploy a minified version run

::

    $ npm run prod

To build and deploy a debug version run

::

    $ npm run debug

Install
============

Add this folder to the PYTHONPATH, then register the plugin as a web.app

::

    $ bin/omero config append omero.web.apps '"webpack_example"'
