import React from "react";
import { getShapeBbox } from '../utils';

const ImagePlane = ({imgData, roiData}) => {

    const imgId = imgData.id;

    const [bigImageViewportSize, setBigImageViewportSize] = React.useState(300);
    const [centre, setCentre] = React.useState({x:0, y:0});

    React.useEffect(() => {
        // On load, calculate initial viewport...

        let src;
        // If Big image...and we have an ROI, render that region
        if (imgData.tiles) {
            let size;
            if (roiData) {
                // Render region around shape
                let bbox = getShapeBbox(roiData);
                size = Math.max(bbox.width, bbox.height);
                size = Math.max(size * 3, bigImageViewportSize);  // show at least this region
                let x = bbox.x + (bbox.width/2);
                let y = bbox.y + (bbox.height/2);
                setBigImageViewportSize(size);
                setCentre({x, y});
            } else {
                // Big image fully zoomed out
                size = Math.max(imgData.size.width, imgData.size.height);
                setBigImageViewportSize(size);
                setCentre({x: imgData.size.width/2, y: imgData.size.height/2});
            }
        }
    }, [imgData, roiData]);

    const handleZoomClick = (event) => {
        if (event.target.value == '+') {
            // zoom in...
            setBigImageViewportSize(bigImageViewportSize / 2);
        } else {
            // zoom out...
            setBigImageViewportSize(bigImageViewportSize * 2);
        }
    }

    let src;
    // If Big image, render region
    if (imgData.tiles) {
        let size = bigImageViewportSize;
        let x = centre.x - (size/2);
        let y = centre.y - (size/2);
        src = window.OMEROWEB_INDEX + `figure/render_scaled_region/${ imgId }/0/0/?region=${x},${y},${size},${size}`;
    } else {
        // Regular image...
        src = window.OMEROWEB_INDEX + `webclient/render_image/${ imgId }/`;
    }

    return (
        <div>
        <img
            style={{width: 250, height: 250}}
            src={src}
        />
        {
            imgData.tiles && (
                <span>
                    <button value="-" onClick={handleZoomClick}>-</button>
                    <button value="+" onClick={handleZoomClick}>+</button>
                </span>
            )
        }
        </div>
    );
};

export default ImagePlane;
