
export function fetchText(url, callback) {
    fetch(url, {mode: 'cors', credentials: 'include'})
        .then(rsp => rsp.body.getReader())
        .then(reader => {
            let chars = [];
            reader.read().then(function processText({ done, value }) {
                if (done) {
                    callback(chars.join(""));
                } else {
                    for (let i=0; i<value.length; i++) {
                        chars.push(String.fromCharCode(value[i]));
                    }
                    reader.read().then(processText);
                }
            });
        });
    }

