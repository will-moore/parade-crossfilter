import React from "react";
import * as dc from "dc";
import "dc/dc.css";
import { CXContext } from "../crossfilter/DataContext";

const tableFunc = (divRef, ndx, columns) => {
    let colNames = columns.map(c => c.name);
    const table = dc.dataTable(divRef);
    const dimension = ndx.dimension(d=> d.Count);
    table.dimension(dimension)
    .columns(colNames);

    return table;
}

const DataTable = props => {
    /*
    We render the dc chart using an effect. We want to pass the chart as a prop after the dc call,
    but there is nothing by default to trigger a re-render and the prop, by default would be undefined.
    To solve this, we hold a state key and increment it after the effect ran. 
    By passing the key to the parent div, we get a rerender once the chart is defined. 
    */
    const context = React.useContext(CXContext);
    const ndx = context.ndx;
    const columns = context.columns;
    const table = React.useRef(null);
    React.useEffect(() => {
        const newChart = tableFunc(table.current, ndx, columns); // chartfunction takes the ref and does something with it
        newChart.render();

        // Specify how to clean up after this effect:
        return () => {
            newChart.dimension().dispose();
            dc.redrawAll();
        };
    }, []);

    return (
        <table ref={table} className="table table-striped table-sm"></table>
    );
};

export default DataTable;
