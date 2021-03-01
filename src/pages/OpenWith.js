
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Dropdown from 'react-bootstrap/Dropdown';
import { CXContext } from "../crossfilter/DataContext";

if (!window.OME) {
    window.OME = {};
}

function getScript(scriptUrl) {
    if (scriptUrl[0] === '/') {
        scriptUrl = scriptUrl.slice(1);
    }
    scriptUrl = window.OMEROWEB_INDEX + scriptUrl;
    const script = document.createElement('script');
    script.src = scriptUrl;
    console.log('scriptUrl', scriptUrl, script);
    // script.onload = callback;

    document.body.appendChild(script);
}

const getOpenWithLinkParams = function (ids, type) {

    var selectedObjs = ids.map(id => { return { id, type } });
    console.log('selectedObjs', selectedObjs);
    var image_id = selectedObjs[0].id;

    return window.OME.open_with_options.map(v => {
        console.log('v', v);
        var enabled = false;
        if (typeof v.isEnabled === "function") {
            enabled = v.isEnabled(selectedObjs);
        } else if (typeof v.supported_objects === "object" && v.supported_objects.length > 0) {
            enabled = v.supported_objects.reduce(function (prev, supported) {
                // enabled if plugin supports 'images' or 'image'
                return prev || supported === 'images' || supported === 'image';
            }, false);
        }
        if (!enabled) return;

        // Ignore open_with -> iviewer or webgateway viewer
        if (v.url.indexOf('iviewer_url') === 0 ||
            v.url.indexOf('webgateway_url') == 0) return;

        var label = v.label || v.id;

        // Get the link via url provider...
        var the_url;
        try {
            the_url = v.getUrl(selectedObjs, v.url);
        }
        catch (err) { }
        var url = the_url || v.url + '?image=' + image_id;

        return ({ text: label, url: url });
    }).filter(l => l);
}

const OpenWithMenuItem = ({ name, ids }) => (
    <Dropdown.Item>
        Open {ids.length} {name}{ids.length > 1 ? "s" : ""} with
    </Dropdown.Item>
)

window.OME.open_with_options = [];

function OpenWith() {

    const context = React.useContext(CXContext);
    const selectedIds = context.selectedIds;
    const ndx = context.ndx;


    React.useEffect(() => {
        // Run once on mount...
        let url = window.OMEROWEB_INDEX + `webgateway/open_with/`;
        fetch(url, { mode: 'cors', credentials: 'include' })
            .then(rsp => rsp.json())
            .then(data => {
                console.log('open_with', data, this);
                window.OME.open_with_options = data.open_with_options;
                // Try to load scripts if specified:
                window.OME.open_with_options.forEach(ow => {
                    if (ow.script_url) {
                        getScript(ow.script_url);
                    }
                });
            });
    }, []);

    // Get Dataset IDs, Image IDs, ROI IDs
    if (ndx == undefined) {
        return <span>...</span>
    }

    const selectedRows = ndx.all().filter(row => selectedIds.includes(row._rowID));

    function getIDs(name) {
        // find rows that have e.g. "Image" and return the value of "Image"
        const ids = selectedRows.filter(row => row[name])
            .map(row => row[name]);
        return [...new Set(ids)];
    }


    let datasetIDs = getIDs('Dataset');
    let imageIDs = getIDs('Image')
    let roiIDs = getIDs('ROI')
    let shapeIDs = getIDs('Shape')

    console.log('imageIDs', imageIDs);


    // List of [{ text: label, url: url }]
    const urls = (imageIDs.length > 0) ? getOpenWithLinkParams(imageIDs, 'image') : [];
    console.log('urls', urls);

    return (
        <Dropdown as={NavItem} className="ml-auto navbar-nav pr-md-4">
            <Dropdown.Toggle as={NavLink}>Open {selectedIds.length} with...</Dropdown.Toggle>
            <Dropdown.Menu>
                {
                    urls.map(url => (
                        <Dropdown.Item key={url.text} target="_blank" href={url.url}>{url.text}</Dropdown.Item>
                    ))
                }
            </Dropdown.Menu>
        </Dropdown>
    );
}

// Create functions on a global OME namespace that the open-with functions
// we load with getScript() can call.
window.OME.setOpenWithEnabledHandler = function (label, fn) {
    // look for label in OPEN_WITH
    console.log('setOpenWithEnabledHandler...', label, fn);
    window.OME.open_with_options.forEach(function (ow) {
        if (ow.label === label) {
            ow.isEnabled = function () {
                // wrap fn with try/catch, since error here will break jsTree menu
                var args = Array.from(arguments);
                var enabled = false;
                try {
                    enabled = fn.apply(this, args);
                } catch (e) {
                    // Give user a clue as to what went wrong
                    console.log("Open with " + label + ": " + e);
                }
                return enabled;
            }
        }
    });
};

window.OME.setOpenWithUrlProvider = function (id, fn) {
    // look for label in OPEN_WITH
    console.log('setOpenWithUrlProvider', id)
    window.OME.open_with_options.forEach(function (ow) {
        if (ow.id === id) {
            console.log('setting getUrl')
            ow.getUrl = fn;
        }
    });
};

export default OpenWith;
