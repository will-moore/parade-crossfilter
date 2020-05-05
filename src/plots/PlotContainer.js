import React from "react";
// import ScatterPlot from "./ScatterPlot";
import ScatterPlot from "./ScatterPlot";
import BoxPlot from "./BoxPlot";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { CXContext } from "../crossfilter/DataContext";

const labelStyle = {marginLeft: 10, marginRight: 5};

const PlotContainer = ({selectedIds, setSelectedIds}) => {

    const context = React.useContext(CXContext);
    const numberCols = context.columns.filter(col => col.type === 'number');
    const stringCols = context.columns.filter(col => col.type !== 'number');

    // Start by plotting the first 2 dimensions we have
    const [yAxis, setYAxis] = React.useState(numberCols[0]);
    let initialXcol = stringCols[0];
    if (numberCols.length > 1) {
        initialXcol = numberCols[1];
    }
    const [xAxis, setXAxis] = React.useState(initialXcol);
    const [groupBy, setGroupBy] = React.useState(undefined);

    if (numberCols.length === 0) {
        return (<div>No number columns: plot not available</div>)
    }

    const handleChangeX = (event) => {
        let name = event.target.value;
        let col = context.columns.find(col => col.name === name);
        setXAxis(col);
        setSelectedIds([]);
    }
    const handleChangeY = (event) => {
        let name = event.target.value;
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

    return (
        <div style={{ position: 'relative'}}>
            {
                xAxis.type === 'number' ? (
                    <ScatterPlot
                        xAxis={xAxis.name}
                        yAxis={yAxis.name}
                        groupBy={groupBy}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                    />) : (
                    <BoxPlot
                        xAxis={xAxis.name}
                        yAxis={yAxis.name}
                        setSelectedIds={setSelectedIds}
                    />)
            }

            <div style={{position: 'absolute', marginTop: 10, top: 0}}>
                <label style={labelStyle}>Y: </label>
                <select onChange={handleChangeY} value={yAxis.name}>
                    {numberCols.map(col => (
                        <option value={col.name} key={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>
                <label style={labelStyle}>X: </label>
                <select onChange={handleChangeX} value={xAxis.name}>
                    <optgroup label="Scatter Plot">
                        {numberCols.map(col => (
                            <option value={col.name} key={col.name}>
                                {col.name}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Box and whisker Plot">
                        {stringCols.map(col => (
                            <option value={col.name} key={col.name}>
                                {col.name}
                            </option>
                        ))}
                    </optgroup>
                </select>
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
            </div>
        </div>
    )
}

export default PlotContainer;
