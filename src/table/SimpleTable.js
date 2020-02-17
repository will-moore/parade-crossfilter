
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';

const Images = ({dtype, objectId}) => {

    const context = React.useContext(CXContext);
    const colNames = context.columns.map(c => c.name);
    const [filteredData, setData] = React.useState([]);
    const ndx = context.ndx;
    React.useEffect(() => {

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, []);

    const getImageId = (row) => {
        if (row.Image) return row.Image;
        if (row.image_id) return row.image_id;
    }

    const Header = ({ columnIndex, rowIndex, style }) => (
        <div style={style}>
            {colNames[columnIndex]}
        </div>
    );

    const Cell = ({ columnIndex, rowIndex, style }) => (
        <div style={{...style, overflow: 'hidden'}}>
            {filteredData[rowIndex][colNames[columnIndex]]}
        </div>
    );
       
    return (
        <div>
            <Grid
                height={35}
                columnCount={colNames.length}
                columnWidth={100}
                rowCount={1}
                rowHeight={35}
                width={900}
            >
                {Header}
            </Grid>
            <Grid
                height={250}
                columnCount={colNames.length}
                columnWidth={100}
                rowCount={filteredData.length}
                rowHeight={35}
                width={900}
            >
                {Cell}
            </Grid>
        </div>
    );
};

export default Images;
