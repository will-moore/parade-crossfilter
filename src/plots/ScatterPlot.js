import React from "react";
import Plot from './Plot';
import { CXContext } from "../crossfilter/DataContext";

const ScatterPlot = ({xAxis, yAxis, groupBy, setFilteredIds}) => {

    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    const [plotData, setData] = React.useState([]);

    const setPlotData = (rows) => {

        // Don't try to plot too much data!
        if (rows.length > 20000) {
            setData([]);
            return;
        }
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
                return {
                    x: data.map(d => d.x),
                    y: data.map(d => d.y),
                    customdata: data.map(d => d.id),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: name,
                }
            });

        } else {
            // Simply plot all points together
            let xData = rows.map(r => r[xAxis])
            let yData = rows.map(r => r[yAxis])
            let ids = rows.map(r => r._rowID)
            plotData = [
                {
                    x: xData,
                    y: yData,
                    customdata: ids,
                    type: 'scatter',
                    mode: 'markers',
                    marker: {color: 'red'},
                },
            ]
        }
        setData(plotData);
    }

    const handleSelected = (event) => {
        // Unfortunately selection is LOST when this is re-rendered
        // See https://github.com/plotly/react-plotly.js/issues/147
        if (event && event.points) {
            let selected = event.points.map(p => p.customdata);
            setFilteredIds(selected);
        }
    }

    React.useEffect(() => {

        // initial render...
        setPlotData(ndx.allFiltered());

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setPlotData(ndx.allFiltered());
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
        <div>
            <Plot
                data={plotData}
                layout={{
                    width: 520,
                    height: 340, 
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
        </div>
    );
};

export default ScatterPlot;
