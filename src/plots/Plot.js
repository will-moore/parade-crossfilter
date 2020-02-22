
import React from "react";
import Plot from 'react-plotly.js';

const PlotlyPlot = ({data, layout, onSelected}) => {
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
        if (xLabel != newX || yLabel != newY) {
            // if so, clear the range (and remember the )
            setXRange(undefined);
            setYRange(undefined);
            setXLabel(newX);
            setYLabel(newY);
        }
    }, [layout]);

    // combine x and y range with layout from props
    let xaxis = {...layout.xaxis, range: xRange}
    let yaxis = {...layout.yaxis, range: yRange}
    const layoutWithRanges = {...layout, xaxis:xaxis, yaxis:yaxis}

    // When user pans, zooms etc. update the saved X and Y ranges
    const handleUpdate = (figure) => {
        setXRange(figure.layout.xaxis.range);
        setYRange(figure.layout.yaxis.range);
    }

    return (
        <div>
            <Plot
                data={data}
                layout={layoutWithRanges}
                onUpdate={handleUpdate}
                onSelected={onSelected}
            />
        </div>
    );
};

export default PlotlyPlot;
