import React from "react";
import * as dc from "dc";

const ResetButton = ({chart, isFiltered}) => {
    return (
        <button type="button" className="btn btn-light btn-sm"
            style={{position: 'absolute', right: 0, opacity: (isFiltered ? 1 : 0)}}
            onClick={() => {
                chart.filterAll();
                dc.redrawAll();
            }}
        >
            reset
        </button>
    );
};

export default ResetButton;
