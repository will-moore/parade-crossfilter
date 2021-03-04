
import React from "react";
import Plot from 'react-plotly.js';
import * as Plotly from 'plotly.js';

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const PlotlyPlot = ({ data, layout, config, onSelected, style }) => {
    // This whole component wraps the Plotly <Plot> simply to prevent
    // loss of the current x and y ranges on re-render...

    // We want to preserve layout.xaxis.range and layout.yaxis.range
    const [xRange, setXRange] = React.useState(undefined);
    const [yRange, setYRange] = React.useState(undefined);
    // BUT, we need to clear them from state when X or Y axis changes...
    // So, we remember the axis labels in state...
    const [xLabel, setXLabel] = React.useState(layout.xaxis.title.text);
    const [yLabel, setYLabel] = React.useState(layout.yaxis.title.text);

    // When layout prop changes, check to see if X or Y axis label has changed...
    React.useEffect(() => {
        let newX = layout.xaxis.title.text;
        let newY = layout.yaxis.title.text;
        if (xLabel !== newX || yLabel !== newY) {
            // if so, clear the range (and remember the )
            setXRange(undefined);
            setYRange(undefined);
            setXLabel(newX);
            setYLabel(newY);
        }
    }, [layout, xLabel, yLabel]);

    // combine x and y range with layout from props
    let xaxis = { ...layout.xaxis, range: xRange }
    let yaxis = { ...layout.yaxis, range: yRange }
    const layoutWithRanges = { ...layout, xaxis: xaxis, yaxis: yaxis }

    const handlSaveToOmero = () => {
        // NB: This uses the hidden 'graph' div below
        // can add 'width' and 'height' to layout for higher resolution
        // default size is 'width':700, 'height':450
        Plotly.plot('graph', data, layoutWithRanges).then((gd) => {
            return Plotly.toImage(gd);
        }).then((dataURI) => {
            const csrftoken = getCookie("csrftoken");
            const saveUrl = `${window.OMEROWEB_INDEX}parade_crossfilter/save_image/`;
            fetch(saveUrl, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ data: dataURI }),
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            }).then(res => console.log(
                res.json()
            ));
        });
    }

    // When user pans, zooms etc. update the saved X and Y ranges
    const handleUpdate = (figure, b) => {
        setXRange(figure.layout.xaxis.range);
        setYRange(figure.layout.yaxis.range);
    }

    return (
        <div>
            <button onClick={handlSaveToOmero} >Save</button>
            <Plot
                data={data}
                config={config}
                layout={layoutWithRanges}
                onUpdate={handleUpdate}
                onSelected={onSelected}
                useResizeHandler={true}
                style={style}
            />
            <div id="graph" style={{ display: "none" }}></div>
        </div>
    );
};

export default PlotlyPlot;
