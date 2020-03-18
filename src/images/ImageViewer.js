import React from "react";
import { fetchJson } from '../crossfilter/FetchData';
import ImagePlane from './ImagePlane';

const ImageViewer = ({rowData}) => {

    const [imgData, setImgData] = React.useState(undefined)
    const [roiData, setRoiData] = React.useState(undefined)
    const [wellData, setWellData] = React.useState(undefined)

    React.useEffect(() => {
        setImgData(undefined);

        async function loadAsyn() {
            // Get ROI data if we have ROI...
            if (Number.isInteger(rowData.ROI)) {
                let url = window.OMEROWEB_INDEX + `api/v0/m/rois/${ rowData.ROI }/`;
                let roiJson = await fetchJson(url);
                setRoiData(roiJson.data);
            }
            // Load Image Data...
            if (Number.isInteger(rowData.Image)) {
                let u = window.OMEROWEB_INDEX + `webclient/imgData/${ rowData.Image }/`;
                let jsonData = await fetchJson(u);
                setImgData(jsonData);
            // Otherwise load Well Data...
            } else if (Number.isInteger(rowData.Well)) {
                let u = window.OMEROWEB_INDEX + `api/v0/m/wells/${ rowData.Well }/`;
                let jsonData = await fetchJson(u);
                setWellData(jsonData);
            }
        }
        loadAsyn();
    }, [rowData]);

    return (
        <div>
            {imgData ?
                (<div>
                    <p>{imgData.meta.imageName}</p>
                    <ImagePlane imgData={imgData} roiData={roiData} />
                </div>) :
                wellData ? (
                    <div>
                        {
                            wellData.data.WellSamples.map(ws => (
                                <img src={window.OMEROWEB_INDEX + `webclient/render_image/${ ws.Image['@id'] }/0/0/`}
                                    style={{maxWidth: 250, margin: 5}}
                                />
                            ))
                        }
                    </div>
                ) : <div>Loading...</div>
            }
        </div>
    );
};

export default ImageViewer;
