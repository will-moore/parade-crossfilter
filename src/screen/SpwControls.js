
import React from "react";
import { redraw } from "plotly.js";

const SpwControls = ({setShowFields}) => {

    const style = {
        position: 'absolute',
        width: 300,
        top: 0, right: 0,
    }

    const handleShowFields = (event) => {
        setShowFields(event.target.checked);
    }

    return (
        <div style={style}>
            <label>
                Fields:
                <input type="checkbox" onChange={handleShowFields} ></input>
            </label>
        </div>
    )
}

export default SpwControls;
