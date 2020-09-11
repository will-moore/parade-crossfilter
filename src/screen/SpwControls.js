
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const SpwControls = ({ setShowFields, heatmap, setHeatmap }) => {

    const style = {
        position: 'absolute',
        width: 350,
        top: 0, right: 0,
    }

    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    const numCols = context.columns.filter(c => c.type === 'number');

    const handleShowFields = (event) => {
        setShowFields(event.target.checked);
    }

    const handleChange = (event) => {
        setHeatmap(event.target.value);
    }

    let heatmapRange = '';
    if (heatmap !== '--') {
        // get min and max values for 'heatmap' column
        let dim = ndx.dimension(function (d) { return d[heatmap]; });
        if (dim.bottom(1).length > 0) {
            heatmapRange = parseInt(dim.bottom(1)[0][heatmap])
                + ' - ' + parseInt(dim.top(1)[0][heatmap]);
        }
    }

    return (
        <div style={style}>
            <label>
                Fields:
                <input type="checkbox" onChange={handleShowFields} ></input>

                Heatmap:
                <select value={heatmap} onChange={handleChange}
                    style={{ margin: 5 }}>
                    <option value="--">Heatmap</option>
                    {numCols.map(col => (
                        <option value={col.name} key={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>
                {heatmapRange}

            </label>
        </div>
    )
}

export default SpwControls;
