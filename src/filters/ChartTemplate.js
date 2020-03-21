import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import ResetButton from './ResetButton';
import * as dc from "dc";


export const ChartTemplate = props => {
    /*
    We render the dc chart using an effect. We want to pass the chart as a prop after the dc call,
    but there is nothing by default to trigger a re-render and the prop, by default would be undefined.
    To solve this, we hold a state key and increment it after the effect ran. 
    By passing the key to the parent div, we get a rerender once the chart is defined. 
    */
    const context = React.useContext(CXContext);
    const [chart, updateChart] = React.useState(null);
    const [isFiltered, setFiltered] = React.useState(false);
    const ndx = context.ndx;
    const div = React.useRef(null);
    const {dimName, chartFunction, setSubheading} = props;
    React.useEffect(() => {
        const newChart = chartFunction(div.current, ndx, dimName); // chartfunction takes the ref and does something with it

        newChart.render();

        newChart.on('filtered', function(chart, filter){
            setFiltered(filter != null);
            if (filter && filter.filterType === "RangedFilter") {
                let subheading = filter ? `${filter['0'].toFixed(2)} - ${filter['1'].toFixed(2)}` : '';
                setSubheading(subheading);
            }
        })

        updateChart(newChart);

        // Specify how to clean up after this effect:
        return () => {
            newChart.dimension().dispose();
            dc.redrawAll();
        };
    }, []);

    const chartStyles = {
        width:'100%',
        height:'auto',
        boxSizing:'border-box',
        padding: 0,
        position: 'relative',
    }
    return (
        <div
            ref={div}
            style={chartStyles}
            >

            <ResetButton
                isFiltered={isFiltered}
                chart={chart} />
        </div>
    );
};