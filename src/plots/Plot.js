
import React from "react";
import Plot from 'react-plotly.js';
import * as Plotly from 'plotly.js';
import Button from 'react-bootstrap/Button';


const PlotlyPlot = ({ data, layout, config, onSelected, style, saveImg }) => {
    // This whole component wraps the Plotly <Plot> simply to prevent
    // loss of the current x and y ranges on re-render...

    // We want to preserve layout.xaxis.range and layout.yaxis.range
    const [xRange, setXRange] = React.useState(undefined);
    const [yRange, setYRange] = React.useState(undefined);
    // BUT, we need to clear them from state when X or Y axis changes...
    // So, we remember the axis labels in state...
    const [xLabel, setXLabel] = React.useState(layout.xaxis.title.text);
    const [yLabel, setYLabel] = React.useState(layout.yaxis.title.text);
    const [savingPlot, setSavingPlot] = React.useState(false);

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
        setSavingPlot(true);
        Plotly.plot('graph', data, layoutWithRanges).then((gd) => {
            return Plotly.toImage(gd);
        }).then((dataURI) => {
            // Clear the graph element
            Plotly.purge('graph');
            return saveImg(dataURI);
        }).then(() => {
            setSavingPlot(false);
        });
    }

    // When user pans, zooms etc. update the saved X and Y ranges
    const handleUpdate = (figure, b) => {
        setXRange(figure.layout.xaxis.range);
        setYRange(figure.layout.yaxis.range);
    }

    return (
        <div>
            <Button
                variant="outline-secondary"
                size="sm"
                style={{ position: 'absolute', right: 0, top: -50 }}
                onClick={handlSaveToOmero}
                title="Save Plot as new Image in OMERO"
            >
                {savingPlot ? "Saving..." : "Save Plot"}
            </Button>
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
