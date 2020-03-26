import React from "react";

const Well = ({wellSample, rows,
               heatmap, heatmapMin, heatmapMax,
               setSelectedIds}) => {

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
        float: 'left',
        margin: 1,
    }

    const handleClick = () => {
        setSelectedIds(rows.map(r => r._rowID));
    }

    const getHeatmapValue = (rows) => {
        if (rows.length === 0 || heatmap === '--') return 'rgba(1,1,1,1)';
        let vals = rows.map(r => r[heatmap]).filter(v => !isNaN(v));
        let sum = vals.reduce((prev, val) => prev + val, 0);
        let avg = sum / vals.length;
        return avg;
    }

    const getHeatmapColor = (value) => {
        let fraction = (value - heatmapMin) / (heatmapMax - heatmapMin);
        var red = 0,
            green = 0,
            blue = 0,
            alpha = 1;
        if (fraction > 0.5) {
            red = parseInt(256 * (fraction - 0.5) * 2);
        }
        if (fraction < 0.5) {
            green = parseInt((0.5 - fraction) * 2 * 256);
        }
        return "rgba(" + [red, green, blue, alpha].join(",") + ")";
    }

    const heatmapValue = getHeatmapValue(rows);
    const title = `${ heatmapValue } (${ rows.length } rows)`

    style.background = getHeatmapColor(heatmapValue);

    if (loadThumbs) {
      return (
        <img
            onClick={handleClick}
            title={title}
            style={style}
            src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ imgId }/`}
            alt={title}
        />
      )
    } else {
        return (<div
            onClick={handleClick}
            title={title}
            style={style}
        />)
    }
}

export default Well;
