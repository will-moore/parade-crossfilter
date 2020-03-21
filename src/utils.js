
import crossfilter from "crossfilter2";

export function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


export function groupCrossfilterData(data, columns, groupBy) {
    // create a new crossfilter from ALL data, then group...
    let dsDim = crossfilter(data.all()).dimension(r => r[groupBy]);
    let dsGrouping = dsDim.group();
    // We only want to group 'number' columns
    columns = columns.filter(c => c.type === 'number');
    dsGrouping.reduce(
        function(prev, row) { // add
            columns.forEach(c => {
                prev[c.name] = prev[c.name] + row[c.name];
            });
            prev.count = prev.count + 1;
            return prev;
        },
        function(prev, row) { // remove - Don't expect this to be used
        columns.forEach(c => {
                if (c.type === 'number') {
                    prev[c.name] = prev[c.name] - row[c.name];
                }
            });
            prev.count = prev.count - 1;
            return prev;
        },
        function() { // init
            // for each columns, keep track of sum
            let init = {count: 0};
            columns.forEach(c => {
                init[c.name] = 0;
            });
            return init;
        }
    )

    let newColName = "Rows per " + groupBy;

    // Convert grouped data back to new 'table' (rows of objects)
    let groupedTable = dsGrouping.all().map((group, idx) => {
        let row = {'_rowID': idx};
        row[groupBy] = group.key;
        // Add new column, e.g. 'Rows per Image': 10
        row[newColName] = group.value.count;
        columns.forEach(c => {
            row[c.name] = group.value[c.name] / group.value.count;
        });
        return row;
    });

    columns.splice(1, 0, {name: newColName, type: 'number'});

    return {columns, data: groupedTable}
}


export function parseMapAnns(mapAnnsInfo) {
    // we want rows of {'Image': id, 'Key1': 'val', 'key2', 2} or
    // {'Well': id, 'Key1': 'val', 'key2', 2}
    // ONE row per image. Ignore duplicate keys for now...
    // First make dict of imageID: {k:v}
    let imgData = {};
    mapAnnsInfo.forEach(mapAnn => {
        let iid = mapAnn.link.parent.id;
        let dtype = mapAnn.link.parent.class.slice(0, -1);
        if (!imgData[iid]) {
            imgData[iid] = {};
        }
        mapAnn.values.forEach(kv => {
            imgData[iid][kv[0]] = kv[1];
        });
        // Add Image or Well column
        imgData[iid][dtype] = iid;
    });
    // For each Image or Well ID, we get a row
    let rows = Object.keys(imgData).map(iid => {
        return {...imgData[iid]};
    });

    // Various rows might have different keys (column names)
    // coming from Map Annotations...
    // Compile column names from keys of ALL rows
    let colnamesSet = rows.reduce((prev, row) => {
        Object.keys(row).forEach(c => {prev.add(c)});
        return prev;
    }, new Set());

    // Set to list
    let colnames = [];
    for (let name of colnamesSet.values()) {
        colnames.push(name);
    }

    return parseData(rows, colnames);
}


export function parseData(rows, colnames) {

    if (!colnames) {
        // Table: use first row for column names
        colnames = Object.keys(rows[0]);
    }

    // Process keys (column names):
    // Remove whitespace, image_id -> Image
    let columns = colnames.map(name => {
        let newName = name.trim();
        if (newName === 'image_id') {
            newName = 'Image';
        }
        if (newName === 'roi_id') {
            newName = 'ROI';
        }
        if (newName === 'shape_id') {
            newName = 'Shape';
        }
        if (newName === 'well_id') {
            newName = 'Well';
        }
        return {name: newName,
                origName: name,
                type: undefined,
                empty: true};
    });

    // Go through all rows in the table
    // Read from data (using original col names)
    // and create parsedData with new col names (no whitespace)
    let parsedData = rows.map(function (d, index) {
        // Coerce strings to number for named columns
        let rowEmpty = true;
        columns.forEach(col => {
            // ignore empty cells
            if (!d[col.origName] || d[col.origName].length === 0) return;
            rowEmpty = false;
            col.empty = false;
            let parsedValue = d[col.origName];
            // coerce to number
            if (col.type === 'number') {
                let numValue = +parsedValue;
                if (!isNaN(numValue)) {
                    parsedValue = numValue;
                }
            } else if (col.type === undefined) {
                // don't know type yet - check for number
                let val = +parsedValue;
                if (isNaN(val)) {
                    col.type = 'string';
                } else {
                    col.type = 'number';
                    // update the value to use number
                    parsedValue = val;
                }
            }
            // assign using new column name
            d[col.name] = parsedValue;
        });
        // Return nothing if empty - filtered out below
        if (!rowEmpty) {
            // Add unique ID for each row
            d._rowID = index;
            return d;
        }
        return false;
    }).filter(Boolean);

    // Now filter out any empty Columns
    columns = columns.filter(col => {
        return !col.empty;
    });

    return {columns, parsedData}
}

export function isInt(n){
    return typeof n== "number" && isFinite(n) && n%1===0;
}

export function filesizeformat(bytes, round) {
    /*
    Formats the value like a 'human-readable' file size (i.e. 13 KB, 4.1 MB,
    102 bytes, etc).*/

    if (round === undefined || !isInt(round)) round = 2;

    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < (1024*1024)) {
        return (bytes / 1024).toFixed(round) + ' KB';
    } else if (bytes < (1024*1024*1024)) {
        return (bytes / (1024*1024)).toFixed(round) + ' MB';
    } else if (bytes < (1024*1024*1024*1024)) {
        return (bytes / (1024*1024*1024)).toFixed(round) + ' GB';
    } else if (bytes < (1024*1024*1024*1024*1024)) {
        return (bytes / (1024*1024*1024*1024)).toFixed(round) + ' TB';
    } else {
        return (bytes / (1024*1024*1024*1024*1024)).toFixed(round) + ' PB';
    }

};

export function getShapeBbox(roi) {
    // Use first shape (only 1)
    // Only support Points for now...
    if (roi.shapes[0] && roi.shapes[0].Points) {
        let xy = roi.shapes[0].Points.split(" ").map(coord => coord.split(','));
        let xx = xy.map(coord => parseFloat(coord[0]));
        let yy = xy.map(coord => parseFloat(coord[1]));
        let xMin = xx.reduce((prev, x) => Math.min(prev, x));
        let xMax = xx.reduce((prev, x) => Math.max(prev, x));
        let yMin = yy.reduce((prev, y) => Math.min(prev, y));
        let yMax = yy.reduce((prev, y) => Math.max(prev, y));
        return {x:xMin, y:yMin, width:xMax-xMin, height: yMax-yMin}
    }
}
