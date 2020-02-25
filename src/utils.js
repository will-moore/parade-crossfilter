export function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


export function parseData(rows) {

    // We can get column names from first row of data
    let firstRow = rows[0];

    // Process keys (column names):
    // Remove whitespace, image_id -> Image
    let columns = Object.keys(firstRow).map(name => {
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
        return {name: newName,
                origName: name,
                type: undefined,
                empty: true}
    });

    // Go through all rows in the table
    // Read from data (using original col names)
    // and create parsedData with new col names (no whitespace)
    let parsedData = rows.map(function (d, index) {
        // Coerce strings to number for named columns
        let rowEmpty = true;
        columns.forEach(col => {
            // ignore empty cells
            if (d[col.origName].length === 0) return;
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
    }).filter(Boolean);

    // Now filter out any empty Columns
    columns = columns.filter(col => {
        return !col.empty;
    });

    return {columns, parsedData}
}
