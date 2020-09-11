import React from "react";
import sizeMe from 'react-sizeme'
import BoxPlot from "./BoxPlot";
import { CXContext } from "../crossfilter/DataContext";

const labelStyle = { marginLeft: 10, marginRight: 5 };

// size props come from sizeMe() HOC below
const BoxPlotContainer = ({ size, selectedIds, setSelectedIds }) => {

    const context = React.useContext(CXContext);
    const numberCols = context.columns.filter(col => col.type === 'number');
    const stringCols = context.columns.filter(col => col.type !== 'number');

    // Start by plotting the first 2 dimensions we have
    const [yAxis, setYAxis] = React.useState(numberCols[0]);
    const [xAxis, setXAxis] = React.useState(stringCols[0]);

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

    return (
        <div style={{ height: '100%' }}>
            <div style={{ paddingTop: 5, position: 'absolute', zIndex: 10, fontSize: '90%' }}>
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
                    {stringCols.map(col => (
                        <option value={col.name} key={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>

            </div>
            <div style={{ width: 'calc(100% - 10px)', position: 'absolute', top: 49, zIndex: 1 }}
                className="draggableCancel"
            >

                <BoxPlot
                    height={size.height - 60}
                    xAxis={xAxis.name}
                    yAxis={yAxis.name}
                    setSelectedIds={setSelectedIds}
                />
            </div>
        </div>
    )
}

// Wrap component in sizeMe so we get 'size' props
export default sizeMe({ monitorHeight: true })(BoxPlotContainer);
