
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const imgStyle = {
    margin: 3,
}

// Different CSV formats store Image ID in different column names
const getImageId = (row) => {
    if (row.image_id) return row.image_id;
    if (row.Image) return row.Image;
}

const Images = ({selectedIds}) => {

    const context = React.useContext(CXContext);
    const [crossFilterData, setData] = React.useState([]);
    const ndx = context.ndx;
    React.useEffect(() => {

        // Initial load
        setData(ndx.allFiltered());

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, []);

    // If some rows are selected, filter to only show them:
    let filteredData = crossFilterData;
    if (selectedIds.length > 0) {
        console.log('filtering table rows...', selectedIds);
        filteredData = crossFilterData.filter(row => selectedIds.indexOf(row._rowID) > -1);
    }

    return (
        <div>
            <div>{filteredData.length} images</div>
            {
                filteredData.slice(0, 50).map(d => (
                    <img
                        key={d._rowID}
                        style={imgStyle}
                        src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ getImageId(d) }/`} />
                ))
            }
        </div>
    );
};

export default Images;
