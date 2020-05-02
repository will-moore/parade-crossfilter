
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const Header = () => {

    // const context = React.useContext(CXContext);
    // const ndx = context.ndx;

    // const [filteredCount, setFilteredCount] = React.useState(0);
    // React.useEffect(() => {
    //     // Initial load
    //     setFilteredCount(ndx.allFiltered().length);

    //     var removeListener = ndx.onChange((event) => {
    //         // Listen for filtering changes and re-render
    //         setFilteredCount(ndx.allFiltered().length);
    //     });

    //     // Specify how to clean up after this effect:
    //     return () => {
    //         removeListener();
    //     };
    // }, [ndx]);

    return (
        <span className="navbar-brand col-sm-3 col-md-2 mr-0">
            OMERO.parade
            <span style={{marginLeft: 20}}>
                {/* Filtering {filteredCount} / {ndx.all().length } */}
            </span>
        </span>
    );
};

export default Header;
