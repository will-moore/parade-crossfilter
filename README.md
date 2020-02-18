## OMERO webapp example

This is a prototype app, exploring the use of https://github.com/crossfilter/crossfilter in a new implementation of https://github.com/ome/omero-parade.

It uses [Create React App](https://github.com/facebook/create-react-app) 
with the cross-filter, https://dc-js.github.io/dc.js/ and React interaction
based on the blog post at https://www.lighttag.io/blog/react-dc-js/.

# Development

You can run this project in development mode or as an OMERO.web Django app.

The notes below are largely from `Create React App` but have been updated with
changes made to connect to OMERO in dev or production modes.

To get started:

    $ cd react-webapp
    $ npm install

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The app will try to connect to an OMERO.web server at http://localhost:4080
using an existing session.<br>
You will need to be logged-in to http://localhost:4080/webclient.<br>
To use a different server, edit `dev_omeroweb_index` in `public/index.html`.

### `npm run build`

Builds the app for production to the `build` folder and copies the
html and static files to the Django app in `react_webapp`.<br>

You will need to have the app configured in your OMERO.web install:

    $ omero config append omero.web.apps '"react_webapp"'

The app will be run as an OMERO.web app at e.g. http://localhost:4080/react_webapp/.
