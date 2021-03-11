
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const FilteredCounter = () => {

    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    const [filteredCount, setFilteredCount] = React.useState([0, 0]);

    React.useEffect(() => {
        if (!ndx) {
            return;
        }
        // Initial load
        setFilteredCount([ndx.allFiltered().length, ndx.all().length]);

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setFilteredCount([ndx.allFiltered().length, ndx.all().length]);
        });

        // Specify how to clean up after this effect:
        return removeListener;
    }, [ndx]);

    return (
        <span>
            Filtering {filteredCount[0]} / {filteredCount[1]}
        </span>
    );
};

export default FilteredCounter;
