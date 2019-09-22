import React from "react";
import ScatterPlot from "./ScatterPlot";
import BoxPlot from "./BoxPlot";
import { CXContext } from "../crossfilter/DataContext";

const PlotContainer = props => {

    const context = React.useContext(CXContext);
    const numberCols = context.columns.filter(col => col.type === 'number');
    const stringCols = context.columns.filter(col => col.type !== 'number');

    // Start by plotting the first 2 dimensions we have
    const [xAxis, setXAxis] = React.useState(numberCols[0])
    const [yAxis, setYAxis] = React.useState(numberCols[1])

    const handleChangeX = (event) => {
        let name = event.target.value;
        let col = context.columns.find(col => col.name === name);
        setXAxis(col);
    }
    const handleChangeY = (event) => {
        let name = event.target.value;
        let col = context.columns.find(col => col.name === name);
        setYAxis(col);
    }

    return (
        <div>
            {
                xAxis.type === 'number' ? (
                    <ScatterPlot
                        xAxis={xAxis.name}
                        yAxis={yAxis.name}
                    />) : (
                    <BoxPlot
                        xAxis={xAxis.name}
                        yAxis={yAxis.name}
                    />)
            }

            <div style={{'position': 'absolute', top: 10, right: 10}}>
                <label>Y axis:</label>
                <select onChange={handleChangeY} value={yAxis.name}>
                    {numberCols.map(col => (
                        <option value={col.name} key={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>
                <label>X axis:</label>
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
            </div>
        </div>
    )
}

export default PlotContainer;
