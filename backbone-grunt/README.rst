BACKBONE SETUP (using grunt)
=============

This is a very minimal example for a web app using backbone/underscore setup.
It queries the projects on the server using the web api.


Build
============
To install the dependencies run
::

    $ npm install


To build and deploy the jst templates run

::

    $ grunt jst

To concat and deploy the java script run

::

    $ grunt concat

To automatically have both above tasks run whenever a source file changes use

    ::

        $ grunt watch

Install
============

Add this folder to the PYTHONPATH, then register the plugin as a web.app

::

    $ bin/omero config append omero.web.apps '"backbone_example"'
