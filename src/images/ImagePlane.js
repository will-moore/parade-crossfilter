import React from "react";

const ImagePlane = ({imgData, roiData}) => {

    const getShapeBbox = roi => {
        // Use first shape (only 1)
        if (roi.shapes[0] && roi.shapes[0].Points) {
            let xy = roi.shapes[0].Points.split(" ").map(coord => coord.split(','));
            let xx = xy.map(coord => parseFloat(coord[0]));
            let yy = xy.map(coord => parseFloat(coord[1]));
            let xMin = xx.reduce((prev, x) => Math.min(prev, x));
            let xMax = xx.reduce((prev, x) => Math.max(prev, x));
            let yMin = yy.reduce((prev, y) => Math.min(prev, y));
            let yMax = yy.reduce((prev, y) => Math.max(prev, y));
            return {x:xMin, y:yMin, width:xMax-xMin, height: yMax-yMin}
        }
    }

    const imgId = imgData.id;

    let src;
    // If Big image...and we have an ROI, render that region
    if (imgData.tiles) {
        if (roiData) {
            // Render region around shape
            let bbox = getShapeBbox(roiData);
            let size = Math.max(bbox.width, bbox.height);
            size = Math.max(size * 3, 300);  // show at least this region
            let x = bbox.x + (bbox.width/2) - (size/2);
            let y = bbox.y + (bbox.height/2) - (size/2);
            src = window.OMEROWEB_INDEX + `figure/render_scaled_region/${ imgId }/0/0/?region=${x},${y},${size},${size}`;
        } else {
            // Render whole image plane
            let w = imgData.size.width;
            let h = imgData.size.height;
            src = window.OMEROWEB_INDEX + `figure/render_scaled_region/${ imgId }/0/0/?region=0,0,${w},${h}`;
        }
    } else {
        // Regular image...
        src = window.OMEROWEB_INDEX + `webclient/render_image/${ imgId }/`;
    }

    return (
        <img
            style={{width: 250, height: 250}}
            src={src}
        />
    );
};

export default ImagePlane;
