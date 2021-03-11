import React from "react";
import { fetchJson } from '../crossfilter/FetchData';

import InputRange from 'react-input-range';

const imgStyle = {
    position: 'absolute'
}

const RoiViewer = ({ rowData }) => {

    const [roiData, setRoiData] = React.useState(undefined)
    const [minT, setMinT] = React.useState(0)
    const [maxT, setMaxT] = React.useState(0)
    const [theT, setTheT] = React.useState(0)

    const [minZ, setMinZ] = React.useState(0)
    const [maxZ, setMaxZ] = React.useState(0)
    const [theZ, setTheZ] = React.useState(0)

    React.useEffect(() => {

        async function loadAsyn() {
            setRoiData(undefined);
            // Get ROI data if we have ROI...
            if (Number.isInteger(rowData.ROI)) {
                let url = window.OMEROWEB_INDEX + `api/v0/m/rois/${rowData.ROI}/`;
                let roiJson = await fetchJson(url);
                parseRoiData(roiJson.data);
            }
        }
        loadAsyn();
    }, [rowData]);

    function parseRoiData(data) {

        let theTs = data.shapes.map(shape => shape.TheT).filter(t => Number.isInteger(t));
        let theZs = data.shapes.map(shape => shape.TheZ).filter(z => Number.isInteger(z));

        setMinT(theTs.length > 0 ? Math.min(...theTs) : undefined);
        setMaxT(theTs.length > 0 ? Math.max(...theTs) : undefined);
        setTheT(Number.isInteger(rowData.t) ? rowData.t : Math.min(...theTs));

        setMinZ(theZs.length > 0 ? Math.min(...theZs) : undefined);
        setMaxZ(theZs.length > 0 ? Math.max(...theZs) : undefined);
        setTheZ(Number.isInteger(rowData.z) ? rowData.z : Math.min(...theZs));

        setRoiData(data.shapes);
    }

    function isVisible(shape, z, t) {
        if (!roiData || roiData.length === 1) {
            return true;
        }
        return ((shape.TheT === undefined || shape.TheT === t) &&
            (shape.TheZ === undefined || shape.TheZ === z))
    }

    return (
        <div>
            {<p>ROI: {rowData.ROI} </p>}
            {roiData ?
                (<div style={{ padding: 10 }}>

                    <div style={{ position: 'relative', height: 200 }}>
                        {/* Add thumb for every shapeID */}
                        {
                            roiData.map(shape => (
                                <img style={{ ...imgStyle, visibility: isVisible(shape, theZ, theT) ? 'visible' : 'hidden' }}
                                    key={shape['@id']}
                                    alt={`Shape ID:${shape['@id']}`}
                                    src={`${window.OMEROWEB_INDEX}webgateway/render_shape_thumbnail/${shape['@id']}/?color=ff0`}
                                />
                            ))
                        }
                    </div>

                    {minZ !== maxZ &&
                        <div className="draggableCancel">
                            <InputRange
                                formatLabel={value => `Z: ${value}`}
                                maxValue={maxZ}
                                minValue={minZ}
                                value={theZ}
                                onChange={value => setTheZ(value)} />
                        </div>
                    }
                    { minT !== maxT &&
                        <div className="draggableCancel">
                            <InputRange
                                formatLabel={value => `T: ${value}`}
                                maxValue={maxT}
                                minValue={minT}
                                value={theT}
                                onChange={value => setTheT(value)} />
                        </div>
                    }
                </div>
                ) : <div>Loading...</div>
            }
        </div>
    );
};

export default RoiViewer;
