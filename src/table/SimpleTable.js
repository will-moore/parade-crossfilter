
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';

const SimpleTable = ({setSelectdIds, selectedIds}) => {

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
    let filteredData = crossFilterData;
    if (selectedIds.length > 0) {
        console.log('filtering table rows...', selectedIds);
        filteredData = crossFilterData.filter(row => selectedIds.indexOf(row._rowID) > -1);
    }

    const Header = ({ columnIndex, rowIndex, style }) => (
        <div style={style}>
            {colNames[columnIndex]}
        </div>
    );

    const Cell = ({ columnIndex, rowIndex, style }) => (
        <div style={{...style, overflow: 'hidden'}} title={filteredData[rowIndex][colNames[columnIndex]]}>
            {filteredData[rowIndex][colNames[columnIndex]]}
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
