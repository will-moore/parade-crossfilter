
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';
import ImageViewer from './ImageViewer';

const imgStyle = {
    padding: 2,
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
}

const Images = ({selectedIds, setSelectedIds, sortBy, sortReverse}) => {

    const context = React.useContext(CXContext);
    const [crossFilterData, setData] = React.useState([]);
    const ndx = context.ndx;
    const columns = context.columns;
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
    }, [ndx]);

    // If some rows are selected, filter to only show them:
    let filteredData = crossFilterData;
    if (selectedIds.length > 0) {
        filteredData = crossFilterData.filter(row => selectedIds.indexOf(row._rowID) > -1);
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

    const getTitle = (row) => {
        return columns.map(col => col.name)
            .filter(k => ("" + row[k]).length > 0)
            .map(k => `${ k }: ${ row[k] }`)
            .join("   ");
    }

    const Cell = ({ columnIndex, rowIndex, style }) => {
        let row = filteredData[(rowIndex * 2) + columnIndex];
        if (!row) return (<span></span>)
        return (
            <div style={{...style}}>
                <img
                    title={getTitle(row)}
                    onClick={() => setSelectedIds([row._rowID])}
                    alt={""}
                    style={imgStyle}
                    src={imgSrc(row)} />
            </div>
        )
    }

    // If ONLY 1 Image selected - show ImageViewer
    if (selectedIds.length === 1) {
        let rowID = selectedIds[0];
        let selectedRows = filteredData.filter(row => row._rowID === rowID);
        if (selectedRows.length === 1) {
            return (
                <ImageViewer rowData={selectedRows[0]} />
            )
        }
    }

    // Otherwise show thumbnails...
    return (
        <div>
            <h6 className="text-muted px-3" style={{'marginTop': '0.7rem'}}>
                { filteredData.length }
                {selectedIds.length > 0 ? ' selected' : ' rows'}
            </h6>
            <Grid
                height={500}
                columnCount={2}
                columnWidth={250}
                rowCount={Math.ceil(filteredData.length/2)}
                rowHeight={170}
                width={510}
            >
                {Cell}
            </Grid>
        </div>
    );
};

export default Images;
