
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

const Images = () => {

    const context = React.useContext(CXContext);
    const [filteredData, setData] = React.useState([]);
    const ndx = context.ndx;
    React.useEffect(() => {

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, []);

    return (
        <div>
            <div>{filteredData.length} images</div>
            {
                filteredData.length < 100 ? 
                    filteredData.map(d => (
                        <img
                            key={d.reactKey}
                            style={imgStyle}
                            src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ getImageId(d) }/`} />
                    ))
                : <div>(too many to show)</div>
            }
        </div>
    );
};

export default Images;
