
import React from 'react';
import Form from 'react-bootstrap/Form';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Dropdown from 'react-bootstrap/Dropdown';
import { CXContext } from "../crossfilter/DataContext";

if (!window.OME) {
    window.OME = {};
}

function getScript(scriptUrl) {
    // if (scriptUrl[0] === '/') {
    //     scriptUrl = scriptUrl.slice(1);
    // }
    console.log('getScript()', scriptUrl);
    // in running in dev environment, need to use full URL
    // e.g. http://localhost:4080/...
    if (window.OMEROWEB_INDEX.includes("localhost")) {
        scriptUrl = window.OMEROWEB_INDEX + scriptUrl.slice(1);
    } else {
        // e.g. OMEROWEB_INDEX = '/omero/' and scriptUrl
        scriptUrl = scriptUrl.replace(window.OMEROWEB_INDEX, "/");
    };
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);
}

const getOpenWithLinkParams = function (ids, type) {

    var selectedObjs = ids.map(id => { return { id, type } });

    return window.OME.open_with_options.map(v => {
        var enabled = false;
        if (typeof v.isEnabled === "function") {
            enabled = v.isEnabled(selectedObjs);
        } else if (typeof v.supported_objects === "object" && v.supported_objects.length > 0) {
            enabled = v.supported_objects.reduce(function (prev, supported) {
                // enabled if plugin supports 'images' or 'image'
                return prev || supported === 'images' || supported === 'image';
            }, false);
        }
        if (!enabled) return "";

        // Ignore open_with -> iviewer or webgateway viewer
        if (v.url.indexOf('iviewer_url') === 0 ||
            v.url.indexOf('webgateway_url') === 0) return "";

        var label = v.label || v.id;

        // Get the link via url provider...
        var the_url;
        try {
            the_url = v.getUrl(selectedObjs, v.url);
        }
        catch (err) { }
        var url = the_url || v.url + '?' + selectedObjs.map(o => `${o.type}=${o.id}`).join('&');

        return ({ text: label, url: url });
    }).filter(l => l);
}


window.OME.open_with_options = [
    // Always include Open-with webclient...
    {
        id: 'webclient',
        url: window.OMEROWEB_INDEX + 'webclient/',
        supported_objects: ["images"],
        getUrl: function (selectedObjs, url) {
            console.log("getUrl", selectedObjs, url);
            let imgIds = selectedObjs.map(obj => obj.id);
            return url + '?show=image-' + imgIds.join('|image-');
        }
    }
];

function OpenWith() {

    const context = React.useContext(CXContext);
    const selectedIds = context.selectedIds;
    const ndx = context.ndx;
    const exportedPlotIds = context.exportedPlotIds;

    const [exportPlots, setExportPlots] = React.useState(false);

    const handleExportPlots = () => {
        setExportPlots(!exportPlots);
    }

    React.useEffect(() => {
        // Run once on mount...
        let url = window.OMEROWEB_INDEX + `webgateway/open_with/`;
        fetch(url, { mode: 'cors', credentials: 'include' })
            .then(rsp => rsp.json())
            .then(data => {
                console.log('open_with', data, this);
                window.OME.open_with_options = window.OME.open_with_options.concat(data.open_with_options);
                // Try to load scripts if specified:
                window.OME.open_with_options.forEach(ow => {
                    if (ow.script_url) {
                        getScript(ow.script_url);
                    }
                });
            });
    }, []);

    // Get Dataset IDs, Image IDs, ROI IDs
    if (ndx === undefined) {
        return <span>...</span>
    }

    const selectedRows = ndx.all().filter(row => selectedIds.includes(row._rowID));

    function getIDs(name) {
        // find rows that have e.g. "Image" and return the value of "Image"
        const ids = selectedRows.filter(row => row[name])
            .map(row => row[name]);
        return [...new Set(ids)];
    }


    // let datasetIDs = getIDs('Dataset');
    let imageIDs = getIDs('Image')

    if (exportPlots) {
        imageIDs = imageIDs.concat(exportedPlotIds);
    }
    // let roiIDs = getIDs('ROI')
    // let shapeIDs = getIDs('Shape')

    // List of [{ text: label, url: url }]
    const urls = (imageIDs.length > 0) ? getOpenWithLinkParams(imageIDs, 'image') : [];

    return (
        <React.Fragment>
            <Form inline className="ml-auto navbar-nav pr-md-4">
                {exportedPlotIds.length > 0 &&
                    <Form.Check onClick={handleExportPlots} className="nav-link" type="checkbox" label={`Open ${exportedPlotIds.length} Plots`} />
                }
            </Form>
            <Dropdown as={NavItem} className="navbar-nav pr-md-4">
                <Dropdown.Toggle as={NavLink}>
                    Open {imageIDs.length} Image{imageIDs.length === 1 ? "" : "s"} with...</Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        urls.map(url => (
                            <Dropdown.Item key={url.text} target="_blank" href={url.url}>{url.text}</Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        </React.Fragment>
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
