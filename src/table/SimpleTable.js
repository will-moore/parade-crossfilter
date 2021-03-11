
import React from "react";
import sizeMe from 'react-sizeme'
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const headerStyle = {
    cursor: 'pointer',
}

const gridStyle = {
    width: 'calc(100%-10px)',
    height: '100%',
    paddingTop: 5,
    margin: 2,
    overflowX: 'auto'
}

const SimpleTable = ({
    sortBy, setSortBy,
    sortReverse, setSortReverse,
    size }) => {

    const context = React.useContext(CXContext);
    const colNames = context.columns.map(c => c.name);
    const [filteredData, setData] = React.useState([]);

    const ndx = context.ndx;
    const selectedIds = context.selectedIds;
    const setSelectedIds = context.setSelectedIds;

    React.useEffect(() => {

        // initial render...
        setData(ndx.allFiltered());

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, [ndx]);


    const gridRef = React.useRef(null);
    React.useEffect(() => {
        if (selectedIds.length > 0) {
            let rowIDs = filteredData.map(r => r._rowID);
            let selectedIndexes = selectedIds.map(id => rowIDs.indexOf(id));
            gridRef.current.scrollToItem({
                align: 'center',
                rowIndex: selectedIndexes[0],
            });
        }
    }, [selectedIds, sortBy, sortReverse, filteredData]);

    if (sortBy) {
        let rev = (sortReverse ? -1 : 1);
        filteredData.sort((a, b) => {
            let valA = a[sortBy] === undefined ? '' : a[sortBy];
            let valB = b[sortBy] === undefined ? '' : b[sortBy];
            if (valA === valB) return 0;
            let r = valA > valB ? rev : -rev;
            return r;
        })
    }

    const handleHeaderClick = (colIndex) => {
        if (sortBy === colNames[colIndex]) {
            setSortReverse(!sortReverse);
        } else {
            setSortReverse(false)
        }
        setSortBy(colNames[colIndex]);
    }

    const handleRowClick = (rowIndex) => {
        // Toggle selection - Only select single Row currently.
        if (isSelected(rowIndex)) {
            setSelectedIds([]);
        } else {
            let rowId = filteredData[rowIndex]._rowID;
            setSelectedIds([rowId]);
        }
    }

    const sortIcon = (name) => (
        name !== sortBy ? faSort :
            sortReverse ? faSortUp : faSortDown
    )

    const isSelected = (rowIndex) => (
        selectedIds.indexOf(filteredData[rowIndex]._rowID) > -1
    )

    const Header = ({ columnIndex, rowIndex, style }) => (
        <div style={{ ...style, ...headerStyle }} onClick={() => handleHeaderClick(columnIndex)}>
            {colNames[columnIndex]}
            <FontAwesomeIcon icon={sortIcon(colNames[columnIndex])} style={{ marginLeft: 3 }} />
        </div>
    );

    const Cell = ({ columnIndex, rowIndex, style }) => {
        let value = filteredData[rowIndex][colNames[columnIndex]];
        let displayVal = value;
        if (typeof value === 'object') {
            // This will be an Array
            value = value.sort();
            displayVal = value.join(', ');
        } else if (value !== undefined && value.toPrecision && !Number.isInteger(value)) {
            // If a number (not an Integer), format precision...
            displayVal = value.toPrecision(4);
        }
        return (
            <div style={{
                ...style,
                background: isSelected(rowIndex) ? '#b1b3f4' : 'white',
                padding: 5
            }}
                onClick={() => handleRowClick(rowIndex)}
                className="table_cell"
                title={value}
            >
                {displayVal}
                {colNames[columnIndex] === 'Image' &&
                    <img
                        alt="Thumbnail"
                        src={`${window.OMEROWEB_INDEX}webclient/render_thumbnail/${filteredData[rowIndex][colNames[columnIndex]]}/`}
                    />
                }
                {colNames[columnIndex] === 'Shape' &&
                    <img
                        alt="Shape Thumbnail"
                        src={`${window.OMEROWEB_INDEX}webgateway/render_shape_thumbnail/${filteredData[rowIndex][colNames[columnIndex]]}/?color=ff0`}
                    />
                }
            </div>
        )
    }

    const colWidth = 100;

    return (
        <div style={gridStyle}>
            <Grid
                height={35}
                columnCount={colNames.length}
                columnWidth={colWidth}
                rowCount={1}
                rowHeight={35}
                width={colNames.length * colWidth + 20}
            >
                {Header}
            </Grid>
            <Grid
                ref={gridRef}
                height={size.height - 50}
                columnCount={colNames.length}
                columnWidth={colWidth}
                rowCount={filteredData.length}
                rowHeight={35}
                width={colNames.length * colWidth + 20}
            >
                {Cell}
            </Grid>
        </div>
    );
};

// Wrap component in sizeMe so we get 'size' props
export default sizeMe({ monitorHeight: true })(SimpleTable);
