import React from "react";

const Well = ({wellSample, rows}) => {

    // Set() of image IDs
    // let imgIds = filteredIds.Image;

    let imgId = wellSample['Image']['@id'];

    // If we have any crossfilter rows for this Well?
    let showWell = rows && rows.length > 0;

    let loadThumbs = false;

    let style = {
        opacity: showWell ? 1 : 0.1,
        width: 15,
        height: 15,
        background: 'black',
        float: 'left',
        margin: 1,
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
