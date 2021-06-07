import React from "react";
import sizeMe from 'react-sizeme'
import ScatterPlot from "./ScatterPlot";
import ColumnPicker from "./ColumnPicker";
import { CXContext } from "../crossfilter/DataContext";

const labelStyle = { marginLeft: 10, marginRight: 5 };

// size props come from sizeMe() HOC below
const PlotContainer = ({ size, cumulativePlot }) => {

    const context = React.useContext(CXContext);
    const selectedIds = context.selectedIds;
    const setSelectedIds = context.setSelectedIds;
    const numberCols = context.columns.filter(col => col.type === 'number');

    console.log('render PlotContainer - context')

    // Start by plotting the first 2 dimensions we have
    const [yAxis, setYAxis] = React.useState(numberCols[0]);

    let initialXcol;
    let xColNames;
    let yColNames = numberCols.map(col => col.name);
    if (numberCols.length > 1) {
        xColNames = numberCols.map(col => col.name);
        initialXcol = numberCols[1];
    }
    const [xAxis, setXAxis] = React.useState(initialXcol);
    const [groupBy, setGroupBy] = React.useState(undefined);

    if (!initialXcol) {
        return (<div>"Need at least 2 number columns for Scatter Plot"</div>)
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

    return (
        <div style={{ height: '100%' }}>
            <div style={{ paddingTop: 5, position: 'absolute', zIndex: 10, fontSize: '90%' }}>
                {/* Don't show Y axis chooser for cumulative Plot */}
                {!cumulativePlot && (
                    <ColumnPicker
                        label={'Y'}
                        options={yColNames}
                        value={yAxis.name}
                        handleSelectChange={handleChangeY}
                    />
                )}
                <ColumnPicker
                    label={'X'}
                    options={xColNames}
                    value={xAxis.name}
                    handleSelectChange={handleChangeX}
                />
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
            <div style={{ width: 'calc(100% - 10px)', position: 'absolute', top: 59, zIndex: 11 }}
                className="draggableCancel"
            >
                <ScatterPlot
                    height={size.height - 60}
                    xAxis={xAxis.name}
                    yAxis={yAxis.name}
                    groupBy={groupBy}
                    cumulativePlot={cumulativePlot}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
            </div>
        </div>
    )
}

// Wrap component in sizeMe so we get 'size' props
export default sizeMe({ monitorHeight: true })(PlotContainer);
