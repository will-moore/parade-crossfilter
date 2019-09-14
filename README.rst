OMERO.web-apps-examples
=============

Examples of web apps for the following setups:

1. aurelia (aurelia as MVC, webpack packaging and babel transpiling)
2. backbone (grunt for building, no ecma2015 and higher)
3. minimal example (no JavaScript dependencies or build steps)
4. react (react.js, created using create-react-app)
5. webpack (jquery only, webpack packaging and babel transpiling)




Requirements
============

* OMERO 5.4.x or newer (incl. web).
* Node.js 6 or higher (incl. npm).



Build
============

For building look at the READMEs of the respective setup/folder.
To use one of them as a basis for your own web app just copy its contents
into your project root and add/modify/delete accordingly.

In particular the following folders/files need adjustments/renames:

- the django plugin directories (XXXX_example)
- the django plugin files __init__.py, app.py, version.py and views.py
- add/remove/modify the used/unused css, java script and images
- add any additional js dependencies to package.json



Further Info
============

For more documentation on how to create a django web app and development have a look at:

1. `CreateApp <https://docs.openmicroscopy.org/latest/omero/developers/Web/CreateApp.html>`_
2. `Deployment <https://docs.openmicroscopy.org/latest/omero/developers/Web/Deployment.html>`_

For further help/documentation on the frameworks used please consult their project sites:

- http://aurelia.io/
- http://backbonejs.org/, http://underscorejs.org/
- https://reactjs.org/
- https://gruntjs.com/
- https://webpack.js.org/
- https://babeljs.io/
