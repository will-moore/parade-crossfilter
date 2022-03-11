
let cors_headers = { mode: 'cors', credentials: 'include' };

export async function initCorsHeaders(url) {
    // IF we're using a server that is different from our host,
    // It might by public (e.g. IDR) and we don't want to include credentials
    // because this causes CORS to fail with:
    // 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.

    // Try to ping without credentials... e.g. http://idr.openmicroscopy.org/webclient/keepalive_ping/
    let baseUrl = window.OMEROWEB_INDEX;
    try {
        // if absolute URL, update baseUrl
        const u = new URL(url);
        baseUrl = `${u.protocol}//${u.host}/`
    } catch (e) { }

    // Fetch without headers - If OK then we don't need headers.
    await fetch(`${baseUrl}webclient/keepalive_ping/`)
        .then(response => response.text())
        .then(text => {
            if (text === "OK") {
                cors_headers = {}
            }
        })
        .catch(err => {
            console.log("Error keepalive")
        });
}

export async function loadCsvByChunks(url, callback, progressCallback) {
    // pre-flight lookup of total row count:
    // /json/?limit=0
    // Then use ?&limit=41&offset=0&header=true  for first chunk

    const jsonUrl = url.replace("csv", "json") + "?limit=0";

    const { meta } = await fetchJson(jsonUrl);
    const { totalCount } = meta;

    const limit = 50;

    let offset = 0;
    let text = "";

    function nextChunk() {
        if (offset > totalCount) {
            console.log("DONE!", text.length);
            callback(text);
        } else {
            let chunkUrl = url + `?offset=${offset}&limit=${limit}&header=${offset === 0}`
            progressCallback(100 * offset / totalCount);
            fetchText(chunkUrl, (chunkText) => {
                text = text + chunkText;
                console.log("text...", text.length, (100 * offset / totalCount), "%");
                offset += limit;
                nextChunk();
            });
        }
    }

    nextChunk();
}

export function fetchText(url, callback) {
    fetch(url, cors_headers)
        .then(rsp => rsp.body.getReader())
        .then(reader => {
            readText(reader, callback);
        });
}

export function readText(reader, callback) {
    let chars = [];
    reader.read()
        .then(function processText({ done, value }) {
            if (done) {
                callback(chars.join(""));
            } else {
                for (let i = 0; i < value.length; i++) {
                    chars.push(String.fromCharCode(value[i]));
                }
                reader.read().then(processText);
            }
        }
        );
}

export async function fetchJson(url) {
    return await fetch(url, cors_headers)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.log("Failed to fetch:", url);
        });
}

export async function fetchChildAnnotations(objId, type) {
    // E.g. for objId of 'project-1', load annotations on Images
    // or 'screen-1' load annotations on Wells
    // type = 'map' or 'tag' etc.
    let id = objId.split('-')[1];
    let dtype = objId.split('-')[0];
    let childType = (dtype === 'project') ? 'images' : 'wells';
    let u = window.OMEROWEB_INDEX + `parade_crossfilter/annotations/${dtype}/${id}/${childType}/?type=${type}`;
    let anns = await fetchJson(u);
    return anns;
}

export async function loadDatasetsAndAnnotations(toLoad) {

    // If loading Datastes info, wait....
    let datasetsInfo;
    if (toLoad.datasets) {
        let projectId = toLoad.datasets;
        let u = window.OMEROWEB_INDEX + `parade_crossfilter/datasets/${projectId}/`;
        let jsonData = await fetchJson(u);
        datasetsInfo = jsonData.data;
    }

    let annData = {};
    if (toLoad.mapAnns) {
        let objId = toLoad.mapAnns; // 'project-1'
        let jsonData = await fetchChildAnnotations(objId, 'map');
        annData.maps = jsonData.annotations;
    }

    if (toLoad.tags) {
        let objId = toLoad.tags; // 'project-1'
        let jsonData = await fetchChildAnnotations(objId, 'tag');
        annData.tags = jsonData.annotations;
    }

    return { datasetsInfo, annData }
}

