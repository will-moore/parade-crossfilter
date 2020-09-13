
export function fetchText(url, callback) {
    fetch(url, { mode: 'cors', credentials: 'include' })
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
    return await fetch(url, { mode: 'cors', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            console.log('fetchJson', data);
            return data;
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
    console.log('fetch anns', anns);
    return anns;
}

