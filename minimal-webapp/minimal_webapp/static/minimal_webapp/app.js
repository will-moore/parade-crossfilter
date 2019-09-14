

// Construct the API projects URL
var projectsUrl = PARAMS.API_BASE_URL + 'm/projects/';

// Filter projects by Owner to only show 'your' projects
projectsUrl += '?owner=' + PARAMS.EXP_ID;

fetch(projectsUrl).then(rsp => rsp.json())
    .then(data => {
        console.log(data);

        let projectCount = data.meta.totalCount;
        let projects = data.data;

        // Render html...
        let html = '<div>Total: ' + projectCount + ' projects</div>';

        html += '<ul>';
        html += projects.map(p => {
            return '<li>' + p.Name + ' (ID: ' + p['@id'] + ')</li>';
        }).join("");
        html += '</ul>';

        document.getElementById('projects').innerHTML = html;
    });
