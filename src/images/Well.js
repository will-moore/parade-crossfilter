import React from "react";

const Well = ({well, filteredIds}) => {

    // Set() of image IDs
    let imgIds = filteredIds.Image;

    let imgId = well['WellSamples'][0]['Image']['@id'];

    let showWell = imgIds.has(imgId);

    // load thumbnails if showing < 100 Images
    let loadThumbs = (imgIds.size <= 100 && showWell);

    let style = {
        opacity: showWell ? 1 : 0.1,
        width: 15,
        height: 15,
    }

    return (
        <img style={style} src={loadThumbs ? `${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ imgId }/` : ''} />
    )
}

export default Well;
