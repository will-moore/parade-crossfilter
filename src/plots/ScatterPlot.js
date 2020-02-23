import React from "react";
import Plot from './Plot';
import { CXContext } from "../crossfilter/DataContext";

const ScatterPlot = ({xAxis, yAxis, setSelectdIds}) => {

    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    const [plotData, setData] = React.useState({});

    const getXYPoints = (rows) => {

        let xData = rows.map(r => r[xAxis])
        let yData = rows.map(r => r[yAxis])
        let ids = rows.map(r => r._rowID)

        setData({x: xData, y: yData, customdata: ids})
    }

    const handleSelected = (event) => {
        // Unfortunately selection is LOST when this is re-rendered
        // See https://github.com/plotly/react-plotly.js/issues/147
        if (event && event.points) {
            let selected = event.points.map(p => p.customdata);
            setSelectdIds(selected);
        }
    }

    React.useEffect(() => {

        // initial render...
        getXYPoints(ndx.allFiltered());

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            getXYPoints(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, [xAxis, yAxis]);


    if (!plotData.x || !plotData.y) {
        return(<div>No data</div>)
    }

    return (
        <div>
            <Plot
                data={[
                    {
                        x: plotData.x,
                        y: plotData.y,
                        customdata: plotData.customdata,
                        type: 'scatter',
                        mode: 'markers',
                        marker: {color: 'red'},
                    },
                    // {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                ]}
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
