import React from "react";
import Plot from './Plot';
import { CXContext } from "../crossfilter/DataContext";

const BoxPlot = ({height, xAxis, yAxis}) => {

    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    const [plotData, setData] = React.useState([]);

    React.useEffect(() => {
        const getXYPoints = (rows) => {

            // Need to get all categories in xAxis...
            let bins = {};
            rows.forEach(row => {
                let binName = row[xAxis];
                if (!bins[binName]) {
                    bins[binName] = [];
                }
                bins[binName].push(row[yAxis]);
            });
            let binNames = Object.keys(bins);
            binNames.sort();

            let plotData = binNames.map(name => {
                return {
                    y : bins[name],
                    type: 'box',
                    name: name,
                }
            });
            setData(plotData);
        }

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
    }, [xAxis, yAxis, ndx]);


    if (plotData.length === 0) {
        return(<div>No data</div>)
    }

    return (
        <Plot
            style={{width: "100%", height: height}}
            config={{responsive: true, displayModeBar: true}}
            data={plotData}
            layout={{
                autosize: true,
                showlegend: false,
                xaxis: {
                    title: {},
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
        />
    );
};

export default BoxPlot;
