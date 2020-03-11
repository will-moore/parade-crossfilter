
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown} from '@fortawesome/free-solid-svg-icons';

const headerStyle={
    cursor: 'pointer',
}

const SimpleTable = ({filteredIds, selectedIds, setSelectedIds,
                      sortBy, setSortBy,
                      sortReverse, setSortReverse}) => {

    const context = React.useContext(CXContext);
    const colNames = context.columns.map(c => c.name);
    const [crossFilterData, setData] = React.useState([]);

    const ndx = context.ndx;

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
    }, []);

    // If some rows are selected, filter to only show them:
    let filteredData = [...crossFilterData];
    if (filteredIds.length > 0) {
        filteredData = crossFilterData.filter(row => filteredIds.indexOf(row._rowID) > -1);
    }

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
        name !== sortBy ? faSort:
            sortReverse ? faSortUp: faSortDown
    )

    const isSelected = (rowIndex) => (
        selectedIds.indexOf(filteredData[rowIndex]._rowID) > -1
    )

    const Header = ({ columnIndex, rowIndex, style }) => (
        <div style={{...style, ...headerStyle}} onClick={() => handleHeaderClick(columnIndex)}>
            {colNames[columnIndex]}
            <FontAwesomeIcon icon={sortIcon(colNames[columnIndex])} style={{marginLeft: 3}} />
        </div>
    );

    const Cell = ({ columnIndex, rowIndex, style }) => (
        <div style={{...style, background: isSelected(rowIndex) ? '#b1b3f4': 'white'}}
            onClick={() => handleRowClick(rowIndex)}
            className="table_cell"
            title={filteredData[rowIndex][colNames[columnIndex]]}>
            {filteredData[rowIndex][colNames[columnIndex]]}
            {colNames[columnIndex] === 'Image' &&
                <img
                    src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${filteredData[rowIndex][colNames[columnIndex]]}/`}
                />
            }
            {colNames[columnIndex] === 'Shape' &&
                <img
                    src={`${ window.OMEROWEB_INDEX }webgateway/render_shape_thumbnail/${filteredData[rowIndex][colNames[columnIndex]]}/?color=ff0`}
                />
            }
        </div>
    )

    const colWidth = 100;

    return (
        <div>
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
                height={250}
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

export default SimpleTable;
