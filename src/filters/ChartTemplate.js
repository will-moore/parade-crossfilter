import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import * as dc from "dc";

const ResetButton = props => {
    const style = {
        padding: 4,
        display: 'inline',
        cursor: 'pointer',
        float:'right',
    }
    return (
        <button
        {...style}
        onClick={() => {
            props.chart.filterAll();
            dc.redrawAll();
        }}
        >
        reset
        </button>
        );
    };

const FilterTitle = props => {
    const [filter, setFilter] = React.useState(null);

    if (props.chart) {
        props.chart.on('filtered', function(chart, filter){
            if (filter && filter.filterType === "RangedFilter") {
                setFilter(filter);
            }
        });
    }

    return (
        <label>
            <span style={{'marginRight': 10}}>{props.title}</span>
            <span>{filter ? `${filter['0'].toFixed(2)} - ${filter['1'].toFixed(2)}` : ''}</span>
        </label>
    )
}

export const ChartTemplate = props => {
    /*
    We render the dc chart using an effect. We want to pass the chart as a prop after the dc call,
    but there is nothing by default to trigger a re-render and the prop, by default would be undefined.
    To solve this, we hold a state key and increment it after the effect ran. 
    By passing the key to the parent div, we get a rerender once the chart is defined. 
    */
    const context = React.useContext(CXContext);
    const [chart, updateChart] = React.useState(null);
    const ndx = context.ndx;
    const div = React.useRef(null);
    const {dimName, chartFunction} = props;
    React.useEffect(() => {
        const newChart = chartFunction(div.current, ndx, dimName); // chartfunction takes the ref and does something with it
        
        newChart.render();
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
        padding: 10,
    }
    const btnStyle = {float:'right', marginLeft: 5};
    return (
        <div
            ref={div}
            style={chartStyles}
            >
        
            <button onClick={() => props.removeChart(props.title)}
                style={btnStyle}>X</button>
            <ResetButton chart={chart} /> 
            <FilterTitle title={props.title} chart={chart} /> 
        </div>
    );
};