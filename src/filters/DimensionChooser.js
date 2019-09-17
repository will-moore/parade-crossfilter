import React from 'react';

import { CXContext } from "../crossfilter/DataContext";

const DimensionChooser = props => {

    const context = React.useContext(CXContext);

    const handleChange = (event) => {
        let name = event.target.value;
        let column = context.columns.find(c => c.name === name);
        props.addFilter(column);
    }

    return (
        <select value={"--"} onChange={handleChange}
            style={{margin: 10, width: 'calc(100% - 20px)'}}>
            <option value="--">Add Filter</option>
            {context.columns.map(col => (
                <option value={col.name} key={col.name}>
                    {col.name}
                </option>
            ))}
        </select>
    )
}

export default DimensionChooser;
