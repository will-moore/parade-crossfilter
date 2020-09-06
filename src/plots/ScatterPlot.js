import React from "react";
import Plot from './Plot';
import { CXContext } from "../crossfilter/DataContext";

const ScatterPlot = ({height, xAxis, yAxis, groupBy, selectedIds, setSelectedIds}) => {

    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    function cumulative(values) {
        let rowCount = values.length;

        // values should be sorted
        let bins = histogram(values);

        let data = bins.reduce((prev, value, index) => {
            let total = 0;
            if (index > 1) {
                total = prev.y[index - 1]
            }
            prev.y.push(value + total);
            prev.x.push(index);
            return prev;
        }, {x: [], y: []});

        data.y = data.y.map(y => 100 * (y / rowCount));
        return data;
    }

    function histogram(values, stepSize = 1) {
        // values should be sorted
        return values.reduce((bins, value) => {
            let binIndex = Math.floor(value / stepSize);
            while (binIndex > bins.length) {
                bins.push(0);
            }
            bins[bins.length - 1] += 1;
            return bins;
        }, [0])
    }

    const [rows, setData] = React.useState([]);

        let plotData = [];
        if (groupBy) {
            // Group data, similar to BoxPlot.js
            let bins = {};
            rows.forEach(row => {
                let binName = row[groupBy];
                if (!bins[binName]) {
                    bins[binName] = [];
                }
                bins[binName].push({x: row[xAxis], y: row[yAxis], id: row._rowID});
            });
            let binNames = Object.keys(bins);
            binNames.sort();

            plotData = binNames.map(name => {
                let data = bins[name];
                // sort points by x axis (in case it's a line plot)
                data.sort((a, b) => a.x > b.x ? 1 : (a.x < b.x ? -1 : 0));
                let xVals = data.map(d => d.x);
                let yVals = data.map(d => d.y);
                if (true) {
                    const cumData = cumulative(xVals);
                    xVals = cumData.x;
                    yVals = cumData.y;
                }
                return {
                    x: xVals,
                    y: yVals,
                    customdata: data.map(d => d.id),
                    type: 'scattergl',
                    mode: 'lines+markers',
                    name: name,
                }
            });

        } else {
            // Since we can't plot 'selected' vv 'non-selected' (see https://github.com/plotly/plotly.js/issues/1848)
            // we group them into 2 "traces".
            let bins = {'selected': [], ' ': []}
            rows.forEach(row => {
                if (selectedIds.indexOf(row._rowID) > -1) {
                    bins.selected.push({x: row[xAxis], y: row[yAxis], id: row._rowID});
                } else {
                    bins[' '].push({x: row[xAxis], y: row[yAxis], id: row._rowID});
                }
            });

            plotData = [' ', 'selected'].map(name => {
                let data = bins[name];
                return {
                    x: data.map(d => d.x),
                    y: data.map(d => d.y),
                    customdata: data.map(d => d.id),
                    type: 'scattergl',
                    mode: 'markers',
                    name: name,
                    marker: {color: (name === 'selected' ? 'red': 'rgb(31, 119, 180)')}
                }
            });
        }

    const handleSelected = (event) => {
        // Unfortunately selection is LOST when this is re-rendered
        // See https://github.com/plotly/react-plotly.js/issues/147
        if (event && event.points) {
            let selected = event.points.map(p => p.customdata);
            setSelectedIds(selected);
        }
    }

    React.useEffect(() => {

        // initial render...
        setData(ndx.allFiltered());

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, [xAxis, yAxis, groupBy, ndx]);


    if (plotData.length === 0) {
        return(<div>No data</div>)
    }

    return (
        <Plot
            style={{width: "100%", height: height}}
            data={plotData}
            config={{responsive: true, displayModeBar: true}}
            layout={{
                autosize: true,
                showlegend: Boolean(groupBy),
                margin: {
                    l: 60,
                    r: 10,
                    b: 40,
                    t: 40,
                    pad: 4
                },
                xaxis: {
                    title: {
                        text: xAxis,
                        font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                        }
                    },
                    },
                    yaxis: {
                    title: {
                        text: yAxis,
                        font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                        }
                    }
                    }
            } }
            onSelected={handleSelected}
        />
    );
};

export default ScatterPlot;
