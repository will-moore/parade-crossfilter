
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown} from '@fortawesome/free-solid-svg-icons';

const SimpleTable = ({setSelectdIds, selectedIds}) => {

    const context = React.useContext(CXContext);
    const colNames = context.columns.map(c => c.name);
    const [crossFilterData, setData] = React.useState([]);
    const [sortBy, setSortBy] = React.useState(undefined);
    const [sortReverse, setSortReverse] = React.useState(false);
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
    if (selectedIds.length > 0) {
        filteredData = crossFilterData.filter(row => selectedIds.indexOf(row._rowID) > -1);
    }

    console.log('sortBy', sortBy);
    if (sortBy) {
        let rev = (sortReverse ? -1 : 1);
        filteredData.sort((a, b) => {
            return a[sortBy] > b[sortBy] ? rev : -rev;
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

    const SortIcon = ({name, sortBy, sortReverse}) => (
        name !== sortBy ? <FontAwesomeIcon icon={faSort} /> :
            sortReverse ? <FontAwesomeIcon icon={faSortUp} /> :
                <FontAwesomeIcon icon={faSortDown} />
    )

    const Header = ({ columnIndex, rowIndex, style }) => (
        <div style={style} onClick={() => handleHeaderClick(columnIndex)}>
            {colNames[columnIndex]}
            <SortIcon name={colNames[columnIndex]} sortBy={sortBy} sortReverse={sortReverse} />
        </div>
    );

    const Cell = ({ columnIndex, rowIndex, style }) => (
        <div style={{...style}}
             className='table_cell'
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
    );

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
