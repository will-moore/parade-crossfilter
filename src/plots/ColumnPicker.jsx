import React from 'react';

const labelStyle = { marginLeft: 10, marginRight: 5 };

const ColumnPicker = ({label, options, value, handleSelectChange}) => {

    const handleChange = (event) => {
        handleSelectChange(event.target.value);
    }

    return (
        <React.Fragment>
            <label style={labelStyle}>{label}: </label>
            <select onChange={handleChange} value={value}>
                {options.map(opt => (
                    <option value={opt} key={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </React.Fragment>
    )
}

export default ColumnPicker;
