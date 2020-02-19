
export function fetchText(url, callback) {
    fetch(url, {mode: 'cors', credentials: 'include'})
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
                for (let i=0; i<value.length; i++) {
                    chars.push(String.fromCharCode(value[i]));
                }
                reader.read().then(processText);
            }
        }
    );
}

export async function fetchJson(url) {
    return await fetch(url, {mode: 'cors', credentials: 'include'})
        .then(response => response.json())
        .then(data => {
            return data;
        });
}

