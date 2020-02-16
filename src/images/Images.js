
import React from "react";
import { CXContext } from "../crossfilter/DataContext";
import Screen from "./Screen";

const Images = ({dtype, objectId}) => {

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
            {dtype === "screen" ?
                (<Screen
                    filteredObjs={filteredData}
                    dtype={dtype}
                    objectId={objectId}/>)
                :
                (<div>{dtype} {objectId}: {filteredData.length} images
                    {filteredData.length < 100 ? 
                        filteredData.map(d => (
                            <img key={d.reactKey} src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ d.image_id }/`} />
                        )) : <div>(too many to show)</div>
                    }
                </div>)}
        </div>
    );
};

export default Images;
