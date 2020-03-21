import React from "react";

const Well = ({well, rows}) => {

    // Set() of image IDs
    // let imgIds = filteredIds.Image;

    let imgId = well['WellSamples'][0]['Image']['@id'];

    let showWell = (true);  // imgIds.has(imgId);

    // load thumbnails if showing < 100 Images
    let loadThumbs = false;  // (imgIds.size <= 100 && showWell);

    let style = {
        opacity: showWell ? 1 : 0.1,
        width: 15,
        height: 15,
        background: 'black',
    }

    if (loadThumbs) {
      return (
        <img
            style={style}
            src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ imgId }/`}
            alt="Well Thumbnail"
        />
      )
    } else {
        return <div style={style} />
    }
}

export default Well;
