import React from "react";
import sizeMe from 'react-sizeme'
// import ScatterPlot from "./ScatterPlot";
import ScatterPlot from "./ScatterPlot";
import BoxPlot from "./BoxPlot";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { CXContext } from "../crossfilter/DataContext";

const labelStyle = {marginLeft: 10, marginRight: 5};

// size props come from sizeMe() HOC below
const PlotContainer = ({size, selectedIds, setSelectedIds}) => {

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
        <div style={{height: '100%', padding: 5}}>
            <div style={{paddingTop: 5, position: 'absolute', zIndex:10}}>
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
            <div style={{width: 'calc(100% - 10px)', position: 'absolute', top: 49, zIndex:1}}>
            {
                xAxis.type === 'number' ? (
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
