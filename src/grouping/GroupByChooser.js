import React from 'react';

import { CXContext } from "../crossfilter/DataContext";

const GroupByChooser = () => {

    const context = React.useContext(CXContext);

    const handleChange = (event) => {
        let name = event.target.value;
        context.addGroupBy(name);
    }

    let numberColumns = context.columns.filter(col => col.type === 'number');

    return (
        <select value={"--"} onChange={handleChange}
            style={{margin: 10, width: 'calc(100% - 20px)'}}>
            <option value="--">Add Group-by</option>
            {numberColumns.map(col => (
                <option value={col.name} key={col.name}>
                    {col.name}
                </option>
            ))}
        </select>
    )
}

export default GroupByChooser;
