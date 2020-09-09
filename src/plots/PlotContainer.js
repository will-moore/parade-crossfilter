import React from "react";
import sizeMe from 'react-sizeme'
// import ScatterPlot from "./ScatterPlot";
import ScatterPlot from "./ScatterPlot";
import ColumnPicker from "./ColumnPicker";
import BoxPlot from "./BoxPlot";
import { CXContext } from "../crossfilter/DataContext";

const labelStyle = { marginLeft: 10, marginRight: 5 };

// size props come from sizeMe() HOC below
const PlotContainer = ({ plotType, size, selectedIds, setSelectedIds }) => {
    // plotType can be 'scatter_plot', 'box_whisker'
    console.log('plotType', plotType);

    const context = React.useContext(CXContext);
    const numberCols = context.columns.filter(col => col.type === 'number');
    const stringCols = context.columns.filter(col => col.type !== 'number');

    // Start by plotting the first 2 dimensions we have
    const [yAxis, setYAxis] = React.useState(numberCols[0]);

    let initialXcol;
    let xColNames;
    let yColNames = numberCols.map(col => col.name);
    if (plotType === 'scatter_plot') {
        if (numberCols.length > 1) {
            xColNames = numberCols.map(col => col.name);
            initialXcol = numberCols[1];
        // } else {
        //     return(<div>Need at least 2 number columns for Scatter Plot</div>)
        }
    } else if (plotType === 'box_whisker') {
        if (stringCols.length > 0) {
            xColNames = stringCols.map(col => col.name);
            initialXcol = stringCols[0];
        // } else {
        //     return (<div>Need at least 1 string column for Box & Whisker Plot</div>)
        }
    // } else {
    //     return (<div>Plot type: '{plotType}' not supported.</div>)
    }
    const [xAxis, setXAxis] = React.useState(initialXcol);
    const [groupBy, setGroupBy] = React.useState(undefined);

    if (!initialXcol) {
        let msg = "Plot typ"
        if (plotType === 'scatter_plot') {
            msg = "Need at least 2 number columns for Scatter Plot"
        } else if (plotType === 'box_whisker') {
            msg = "Need at least 1 string column for Box & Whisker Plot"
        }
        return (<div>{msg}</div>)
    }

    const handleChangeX = (name) => {
        let col = context.columns.find(col => col.name === name);
        setXAxis(col);
        setSelectedIds([]);
    }
    const handleChangeY = (name) => {
        let col = context.columns.find(col => col.name === name);
        setYAxis(col);
        setSelectedIds([]);
    }

    const handleChangeGroupBy = (event) => {
        let name = event.target.value;
        if (name === '-') {
            name = undefined;
        }
        setGroupBy(name);
    }

    console.log({ xColNames, numberCols })

    return (
        <div style={{ height: '100%' }}>
            <div style={{ paddingTop: 5, position: 'absolute', zIndex: 10, fontSize: '90%' }}>
                <ColumnPicker
                    label={'Y'}
                    options={yColNames}
                    value={yAxis.name}
                    handleSelectChange={handleChangeY}
                />
                <ColumnPicker
                    label={'X'}
                    options={xColNames}
                    value={xAxis.name}
                    handleSelectChange={handleChangeX}
                />
                {(plotType === 'scatter_plot') && (
                    <React.Fragment>
                    <label style={labelStyle}>Group by:</label>
                    <select onChange={handleChangeGroupBy}>
                        <option value="-">-</option>
                        {
                            context.columns.map(col => (
                                <option value={col.name} key={col.name}>
                                    {col.name}
                                </option>
                            ))
                        }
                    </select>
                    </React.Fragment>
                )}
            </div>
            <div style={{ width: 'calc(100% - 10px)', position: 'absolute', top: 49, zIndex: 1 }}
                className="draggableCancel"
            >
                {
                    plotType === 'scatter_plot' ? (
                        <ScatterPlot
                            height={size.height - 60}
                            xAxis={xAxis.name}
                            yAxis={yAxis.name}
                            groupBy={groupBy}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                        />) : (
                            <BoxPlot
                                height={size.height - 60}
                                xAxis={xAxis.name}
                                yAxis={yAxis.name}
                                setSelectedIds={setSelectedIds}
                            />)
                }
            </div>
        </div>
    )
}

// Wrap component in sizeMe so we get 'size' props
export default sizeMe({ monitorHeight: true })(PlotContainer);
