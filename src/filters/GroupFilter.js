import React from "react";
import * as dc from "dc";
import { CXContext } from "../crossfilter/DataContext";

const rowChartFunc = (divRef, ndx, dimName) => {
    const chart = dc.rowChart(divRef)
    const dimension = ndx.dimension(function(d) {return d[dimName];});
    const group = dimension.group()
    chart.dimension(dimension)
        .group(group)

    return chart
}

const GroupFilter = props => {

    const context = React.useContext(CXContext);
    // const [chart, updateChart] = React.useState(null);
    // const [isFiltered, setFiltered] = React.useState(false);
    const ndx = context.ndx;
    const div = React.useRef(null);
    const {dimName} = props;
    React.useEffect(() => {
        const newChart = rowChartFunc(div.current, ndx, dimName); // chartfunction takes the ref and does something with it

        newChart.render();

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

        </div>
    );
}

export default GroupFilter;
