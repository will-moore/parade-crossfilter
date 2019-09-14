// css, images and fonts
require('./../css/app.css');
require('./../css/images/ome-icon-opacity.png');

// deps
import $ from "jquery";

/* IMPORTANT:
 * we have to set the public path here to include any potential prefix
 * has to happen before the bootstrap!
 */
let prefix = typeof window.URI_PREFIX === 'string' || "";
__webpack_public_path__ = prefix + '/static/webpack_example/';

// main code
let $projects = $('#projects');
let projectRequestUrl = window.PARAMS.WEB_API + "m/projects?limit=10";
let successHandler = (response) => {
    if (response && Array.isArray(response.data)) {
        if (response.data.length === 0) $projects.html("Empty Project List");
        else {
            let html =
                '<table><thead><tr><td>Id</td><td>Name</td><td>Desc</td></tr></thead>';
            html += '<tbody>';
                for (let d in response.data) {
                    html += '<tr>';
                    let proj = response.data[d];
                    html += '<td>' +
                        (typeof proj['@id'] === 'number' ? proj['@id'] : '') + '</td>';
                    html += '<td>' +
                        (typeof proj.Name === 'string' ? proj.Name : '') + '</td>';
                    html += '<td>' +
                        (typeof proj.Description === 'string' ? proj.Description : '') + '</td>';
                    html += '</tr>';
                }
            html += '</tbody></table>';
            $projects.html(html);
        }
    } else $projects.html("No response");
    console.info(response);
};
let errorHandler = (error) => {
    $projects.html("failed to retrieve the project list.");
    console.error(error);
};

$.ajax({
    url : projectRequestUrl,
    success : successHandler,
    error : errorHandler
});
