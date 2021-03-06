import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import GroupFilter from './GroupFilter';
import * as dc from "dc";

const TextFilter = ({dimName}) => {

    const context = React.useContext(CXContext);
    const [text, setText] = React.useState("");
    const [dimension, setDimension] = React.useState(null);
    const ndx = context.ndx;

    React.useEffect(() => {
        var d = ndx.dimension(function(d) {return d[dimName];});
        setDimension(d);

        // Specify how to clean up after this effect:
        return () => {
            d.dispose();
            dc.redrawAll();
        };
    }, [dimName, ndx]);

    const handleChange = (event) => {
        let text = event.target.value;
        setText(text);
        dimension.filter(value => {
            return value.indexOf(text) > -1;
        });
        dc.redrawAll();
    }

    return (
        <React.Fragment>
        <input
            type="text"
            placeholder={`Filter by ${dimName}`}
            className="form-control"
            value={text}
            onChange={handleChange} />
        
            <GroupFilter dimName={dimName} />
        </React.Fragment>

    );
};

export default TextFilter;
