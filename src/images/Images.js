
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import { FixedSizeGrid as Grid } from 'react-window';
import ImageViewer from './ImageViewer';
import RoiViewer from './RoiViewer';
import sizeMe from 'react-sizeme'


// size props come from sizeMe() HOC below
const Images = ({ sortBy, sortReverse, size }) => {

    const context = React.useContext(CXContext);
    const [crossFilterData, setData] = React.useState([]);
    const selectedIds = context.selectedIds;
    const setSelectedIds = context.setSelectedIds;
    const ndx = context.ndx;
    const columns = context.columns;
    let thumbSize = 192;

    console.log('render Images - context')

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

    const THUMB_TYPES = ["Shape", "shape", "ROI", "Roi", "roi", "Image", "image"];

    const getThumbType = (row) => THUMB_TYPES.find(type => row[type]);

    const imgSrc = (row, thumbType) => {
        let objId = row[thumbType];
        return (thumbType.toLowerCase() === 'shape') ? `${window.OMEROWEB_INDEX}webgateway/render_shape_thumbnail/${objId}/?color=ff0` :
            (thumbType.toLowerCase() === 'roi') ? `${window.OMEROWEB_INDEX}webgateway/render_roi_thumbnail/${objId}/` :
                (thumbType.toLowerCase() === 'image') ? `${window.OMEROWEB_INDEX}webclient/render_thumbnail/${objId}/` :
                    undefined
    }

    const getTitle = (row) => {
        return columns.map(col => col.name)
            .filter(k => ("" + row[k]).length > 0)
            .map(k => `${k}: ${row[k]}`)
            .join("   ");
    }

    // If ONLY 1 row (Well, Image, ROI) selected - show ImageViewer or RoiViewer
    if (selectedIds.length === 1) {
        let rowID = selectedIds[0];
        let selectedRows = filteredData.filter(row => row._rowID === rowID);
        if (selectedRows.length === 1) {
            if (Number.isInteger(selectedRows[0].ROI) || Number.isInteger(selectedRows[0].Roi)) {
                return <RoiViewer rowData={selectedRows[0]} />
            } else {
                return (
                    <ImageViewer rowData={selectedRows[0]} />
                )
            }
        }
    }

    // Otherwise show thumbnails...
    const width = size.width;
    const colCount = parseInt(Math.round(width / thumbSize));
    // adjust thumbSize to fit columns
    thumbSize = width / colCount;
    // Known dimensions of roi-thumbnails
    const roiThumbAspect = 250 / 166;
    const thumbHeight = thumbSize / roiThumbAspect;
    let imgStyle = {
        padding: 2,
        maxWidth: '100%',
    }
    imgStyle.height = thumbHeight;

    const Cell = ({ columnIndex, rowIndex, style }) => {
        let row = filteredData[(rowIndex * colCount) + columnIndex];
        if (!row) return (<span></span>)
        const thumbType = getThumbType(row);
        return (
            <div style={{ ...style }}>
                { thumbType ?
                <div>
                    <div style={{position: 'absolute', margin:5, color:'white'}}>{thumbType}:{row[thumbType]}</div>
                    <img
                        title={getTitle(row)}
                        onClick={() => setSelectedIds([row._rowID])}
                        alt={""}
                        style={imgStyle}
                        src={imgSrc(row, thumbType)} />
                </div>
                :
                <span title="No shape, roi or image in row">?</span>
                }
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <h6 className="text-muted px-3" style={{ 'paddingTop': '0.7rem' }}>
                {filteredData.length}
                {selectedIds.length > 0 ? ' selected' : ' rows'}
            </h6>
            <div style={{ width: '100%', position: 'absolute', top: 40 }}>
                <Grid
                    height={size.height - 40}
                    columnCount={colCount}
                    columnWidth={thumbSize}
                    rowCount={Math.ceil(filteredData.length / colCount)}
                    rowHeight={thumbHeight}
                    width={width}
                >
                    {Cell}
                </Grid>
            </div>
        </div>
    );
};

// Wrap component in sizeMe so we get 'size' props
export default sizeMe({ monitorHeight: true })(Images);
