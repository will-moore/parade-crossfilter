
import crossfilter from "crossfilter2";

export function getUrlParameter(name) {
    let params = (new URL(document.location)).searchParams;
    return params.get(name);
};


export function groupCrossfilterData(data, columns, groupBy) {
    // create a new crossfilter from ALL data, then group...
    let dsDim = crossfilter(data.all()).dimension(r => r[groupBy]);
    let dsGrouping = dsDim.group();
    // We only want to group 'number' columns
    // columns = columns.filter(c => c.type === 'number');
    dsGrouping.reduce(
        // ADDs rows to the group
        function (prev, row) {
            columns.forEach(c => {
                if (c.type === 'number') {
                    prev[c.name].sum = prev[c.name].sum + row[c.name];
                    prev[c.name].max = Math.max(row[c.name], prev[c.name].max);
                    prev[c.name].min = Math.min(row[c.name], prev[c.name].min);
                } else {
                    if (prev[c.name].text === undefined) {
                        // init the value
                        prev[c.name].text = row[c.name];
                    } else if (prev[c.name].text !== row[c.name]) {
                        // any mismatch in text - revert to '-'
                        prev[c.name].text = '-'
                    }
                }
            });
            prev.paradeRowCount = prev.paradeRowCount + 1;
            return prev;
        },
        // REMOVES rows - Don't expect this to be used
        function (prev, row) {
            columns.forEach(c => {
                prev[c.name].sum = prev[c.name].sum - row[c.name];
            });
            prev.paradeRowCount = prev.paradeRowCount - 1;
            return prev;
        },
        // INIT the group
        function () {
            // We want to count total rows (to calcuate averages)
            let init = { paradeRowCount: 0 };
            // And for each column, we want sum, min and max
            columns.forEach(c => {
                init[c.name] = {
                    sum: 0,
                    max: -Infinity,
                    min: Infinity,
                    text: undefined,
                };
            });
            return init;
        }
    )

    let newColName = "Rows per " + groupBy;

    // Convert grouped data back to new 'table' (rows of objects)
    let minMaxRangeCols = {};
    let mismatchTextCols = {};
    let groupedTable = dsGrouping.all().map((group, idx) => {
        let row = { '_rowID': idx };
        row[groupBy] = group.key;
        // Add new column, e.g. 'Rows per Image': 10
        row[newColName] = group.value.paradeRowCount;
        columns.forEach(c => {
            if (c.type === 'number') {
                // Add average value
                row[c.name] = group.value[c.name].sum / group.value.paradeRowCount;
                // Add min/max values - note which columns have min-max range
                let min = group.value[c.name].min;
                let max = group.value[c.name].max;
                row[`min ${c.name}`] = min;
                row[`max ${c.name}`] = max;
                row[`range ${c.name}`] = max - min;
                if (min !== max) {
                    minMaxRangeCols[c.name] = true;
                }
            } else {
                row[c.name] = group.value[c.name].text;
                if (row[c.name] === '-') {
                    mismatchTextCols[c.name] = true;
                }
            }
        });
        return row;
    });

    // Remove any ID columns that have been averaged
    // E.g. group ROIs by Image - ROI column will contain average ROI IDs which makes no sense
    // BUT we don't want to remove e.g. Well ID column
    const idNames = ['Screen', 'Plate', 'Well', 'Project', 'Dataset', 'Image', 'ROI', 'Shape'];
    let toRemove = idNames.filter(name => minMaxRangeCols[name]);
    // remove min/max data for any columns where min==max
    columns.forEach(col => {
        if (!minMaxRangeCols[col.name]) {
            toRemove.push(`min ${col.name}`);
            toRemove.push(`max ${col.name}`);
        }
    });
    // remove any text columns which are '-'
    toRemove = toRemove.concat(Object.keys(mismatchTextCols));

    // remove data
    groupedTable = groupedTable.map(row => {
        toRemove.forEach(name => {
            delete row[name];
        });
        return row;
    });

    // Filter unwanted columns
    columns = columns.filter(c => !toRemove.includes(c.name));
    // Add min/max columns
    let newColumns = [];
    columns.forEach(col => {
        // Keep the column itself, plus min/max as adjacent columns
        newColumns.push(col);
        if (minMaxRangeCols[col.name]) {
            newColumns.push({ name: `min ${col.name}`, type: 'number' });
            newColumns.push({ name: `max ${col.name}`, type: 'number' });
            newColumns.push({ name: `range ${col.name}`, type: 'number' });
        }
    });

    // Add new column
    newColumns.splice(1, 0, { name: newColName, type: 'number' });

    return { columns: newColumns, data: groupedTable }
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
        return { ...imgData[iid] };
    });

    // Various rows might have different keys (column names)
    // coming from Map Annotations...
    // Compile column names from keys of ALL rows
    let colnamesSet = rows.reduce((prev, row) => {
        Object.keys(row).forEach(c => { prev.add(c) });
        return prev;
    }, new Set());

    // Set to list
    let colnames = [...colnamesSet.values()];

    return parseData(rows, colnames);
}


export function parseTagAnns(tagsJson) {
    // we want dict of {'imageID': ['list', 'of', 'tags']}
    let tagData = tagsJson.reduce((prev, tag) => {
        let pid = tag.link.parent.id;
        let text = tag.textValue;
        if (!prev[pid]) {
            // create array for an Image, or Well
            prev[pid] = [];
        }
        if (!prev[pid].includes(text)) {
            prev[pid].push(text);
        }
        return prev;
    }, {});

    return tagData;
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
        return {
            name: newName,
            origName: name,
            type: undefined,
            empty: true
        };
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

    return { columns, parsedData }
}


export function prepCrossfilterData(data, datasetsInfo, annData) {
    // Handle csv data, rows of dicts
    let columns = [];
    let parsedData = [];

    if (data) {
        let d = parseData(data);
        columns = d.columns;
        parsedData = d.parsedData;
    }

    // ** NB: for MapAnnotations and Tags, we use 'Image' key to add these
    // to the CSV data.
    // Need to handle Screen data using 'Well' key!

    if (annData.maps) {
        // OR, if we have map annotations, add a column for each Key
        let d = parseMapAnns(annData.maps);

        if (parsedData.length === 0) {
            // No existing data - just use MapAnns data
            parsedData = d.parsedData;
            columns = d.columns;
        } else {
            // Add MapAnns data to existing data
            columns = columns.concat(d.columns.filter(c => c.name !== 'Image'));
            // make {imgId:row} lookup...
            let rowById = d.parsedData.reduce((prev, row) => {
                prev[row.Image] = row;
                return prev;
            }, {});
            // add key-value dict to each row, matching by Image ID
            parsedData = parsedData.map(row => {
                let kvData = rowById[row.Image] || {};
                return { ...row, ...kvData };
            });
        }
    }
    if (annData.tags) {
        // if we have tags, get {imgId: ['list', 'of', 'tags']}
        let tagsById = parseTagAnns(annData.tags);
        if (columns.length === 0) {
            // No existing data - just use MapAnns data
            columns.push({ name: 'Image', type: 'number' })
            parsedData = Object.keys(tagsById).map(iid => {
                return { 'Image': iid, 'Tags': tagsById[iid] };
            });
        } else {
            // add key-value dict to each row, matching by Image ID
            parsedData = parsedData.map(row => {
                let tags = tagsById[row.Image] || [];
                return { ...row, 'Tags': tags };
            });
        }
        columns.push({ name: 'Tags', type: 'array' });
    }

    // If we have dict of {image: {id:1}, dataset:{name:'foo'}}
    // Use it to populate the table using existing image colum
    const colNames = columns.map(col => col.name);
    if (datasetsInfo && !colNames.includes("Dataset")) {
        let imgToDataset = {};
        datasetsInfo.forEach(link => {
            imgToDataset[link.image.id] = link.dataset;
        });

        columns.push({ name: 'Dataset', type: 'string' });

        // Add Dataset names to data
        parsedData = parsedData.map(row => {
            if (row.Image && imgToDataset[row.Image]) {
                return { ...row, 'Dataset': imgToDataset[row.Image].name }
            }
            return row
        });
    }
    return { columns, parsedData };
}


export function isInt(n) {
    return typeof n == "number" && isFinite(n) && n % 1 === 0;
}

export function filesizeformat(bytes, round) {
    /*
    Formats the value like a 'human-readable' file size (i.e. 13 KB, 4.1 MB,
    102 bytes, etc).*/

    if (round === undefined || !isInt(round)) round = 2;

    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < (1024 * 1024)) {
        return (bytes / 1024).toFixed(round) + ' KB';
    } else if (bytes < (1024 * 1024 * 1024)) {
        return (bytes / (1024 * 1024)).toFixed(round) + ' MB';
    } else if (bytes < (1024 * 1024 * 1024 * 1024)) {
        return (bytes / (1024 * 1024 * 1024)).toFixed(round) + ' GB';
    } else if (bytes < (1024 * 1024 * 1024 * 1024 * 1024)) {
        return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(round) + ' TB';
    } else {
        return (bytes / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(round) + ' PB';
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
        return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin }
    }
}


export function cumulative(values) {
    let rowCount = values.length;

    // values should be sorted
    let bins = histogram(values);

    let data = bins.reduce((prev, value, index) => {
        let total = 0;
        if (index > 1) {
            total = prev.y[index - 1]
        }
        prev.y.push(value + total);
        prev.x.push(index);
        return prev;
    }, { x: [], y: [] });

    data.y = data.y.map(y => 100 * (y / rowCount));
    return data;
}

function histogram(values, stepSize = 1) {
    // values should be sorted
    return values.reduce((bins, value) => {
        let binIndex = Math.floor(value / stepSize);
        while (binIndex > bins.length) {
            bins.push(0);
        }
        bins[bins.length - 1] += 1;
        return bins;
    }, [0])
}

export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
