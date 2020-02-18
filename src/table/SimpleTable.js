
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';

const Images = ({dtype, objectId}) => {

    const context = React.useContext(CXContext);
    const colNames = context.columns.map(c => c.name);
    const [filteredData, setData] = React.useState([]);
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

export default Images;
