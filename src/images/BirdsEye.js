import React from "react";

const BirdsEye = ({imgData, size, x, y}) => {

    const imgId = imgData.id;

    let wh = imgData.size.width / imgData.size.height;
    let thumb_size = 192;
    let thumb_width = thumb_size;
    let thumb_height = thumb_size;
    if (wh > 1) {
        thumb_height = thumb_size / wh;
    } else {
        thumb_width = thumb_size * wh;
    }

    return (
        <div style={{width: thumb_width, height: thumb_height, position: 'relative', display:'inline-block'}} >
            <img
                style={{width: thumb_width, height: thumb_height, position: 'absolute', top: 0, left: 0}}
                src={window.OMEROWEB_INDEX + `webclient/render_thumbnail/${imgId}`}
            />
            <div
                style={{position: 'absolute',
                        border: 'solid yellow 1px',
                        left: thumb_width * x / imgData.size.width,
                        top: thumb_height * y / imgData.size.height,
                        width: size * thumb_width / imgData.size.width,
                        height: size * thumb_height / imgData.size.height,
                    }}>
            </div>
        </div>
    );
};

export default BirdsEye;
