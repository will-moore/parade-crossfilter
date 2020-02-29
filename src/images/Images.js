
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const imgStyle = {
    margin: 3,
}

const Images = ({filteredIds}) => {

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
    if (filteredIds.length > 0) {
        filteredData = crossFilterData.filter(row => filteredIds.indexOf(row._rowID) > -1);
    }

    const imgSrc = (row) => (
        row.Shape ? `${ window.OMEROWEB_INDEX }webgateway/render_shape_thumbnail/${ row.Shape }/?color=ff0` :
        row.Image ? `${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ row.Image }/` :
        ''
    )

    return (
        <div>
            <div>{filteredData.length} images</div>
            {
                filteredData.slice(0, 50).map(d => (
                    <img
                        key={d._rowID}
                        style={imgStyle}
                        src={imgSrc(d)} />
                ))
            }
        </div>
    );
};

export default Images;
