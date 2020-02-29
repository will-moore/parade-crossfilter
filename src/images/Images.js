
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';

const imgStyle = {
    padding: 2,
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
}

const Images = ({filteredIds, sortBy, sortReverse}) => {

    const context = React.useContext(CXContext);
    const [crossFilterData, setData] = React.useState([]);
    const ndx = context.ndx;
    React.useEffect(() => {

        // Initial load
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
    if (filteredIds.length > 0) {
        filteredData = crossFilterData.filter(row => filteredIds.indexOf(row._rowID) > -1);
    }

    if (sortBy) {
        let rev = (sortReverse ? -1 : 1);
        filteredData.sort((a, b) => {
            return a[sortBy] > b[sortBy] ? rev : -rev;
        })
    }

    const imgSrc = (row) => (
        row.Shape ? `${ window.OMEROWEB_INDEX }webgateway/render_shape_thumbnail/${ row.Shape }/?color=ff0` :
        row.Image ? `${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ row.Image }/` :
        ''
    )

    const Cell = ({ columnIndex, rowIndex, style }) => (
        <div style={{...style}}>
            <img
                style={imgStyle}
                src={imgSrc(filteredData[(rowIndex * 2) + columnIndex])} />
        </div>
    )

    return (
        <div>
            <Grid
                height={500}
                columnCount={2}
                columnWidth={250}
                rowCount={parseInt(filteredData.length/2)}
                rowHeight={170}
                width={510}
            >
                {Cell}
            </Grid>
        </div>
    );
};

export default Images;
