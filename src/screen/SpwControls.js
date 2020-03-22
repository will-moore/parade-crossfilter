
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const SpwControls = ({setShowFields, heatmap, setHeatmap}) => {

    const style = {
        position: 'absolute',
        width: 300,
        top: 0, right: 0,
    }

    const context = React.useContext(CXContext);
    const numCols = context.columns.filter(c => c.type === 'number');

    const handleShowFields = (event) => {
        setShowFields(event.target.checked);
    }

    const handleChange = (event) => {
        setHeatmap(event.target.value);
    }

    return (
        <div style={style}>
            <label>
                Fields:
                <input type="checkbox" onChange={handleShowFields} ></input>

                Heatmap:
                <select value={heatmap} onChange={handleChange}
                    style={{margin: 5}}>
                    <option value="--">Heatmap</option>
                    {numCols.map(col => (
                        <option value={col.name} key={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>

            </label>
        </div>
    )
}

export default SpwControls;
