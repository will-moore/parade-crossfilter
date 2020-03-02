import React from "react";
import { fetchJson } from '../crossfilter/FetchData';
import ImagePlane from './ImagePlane';

const ImageViewer = ({rowData}) => {

    const [imgData, setImgData] = React.useState(undefined)
    const [roiData, setRoiData] = React.useState(undefined)

    React.useEffect(() => {
        setImgData(undefined);

        async function loadAsyn() {
            // Get ROI data if we have ROI...
            if (rowData.ROI) {
                let url = window.OMEROWEB_INDEX + `api/v0/m/rois/${ rowData.ROI }/`;
                let roiJson = await fetchJson(url);
                setRoiData(roiJson.data);
            }
            // Load Image Data...
            let u = window.OMEROWEB_INDEX + `webclient/imgData/${ rowData.Image }/`;
            let jsonData = await fetchJson(u);
            setImgData(jsonData);
        }
        loadAsyn();
    }, [rowData]);

    return (
        <div>
            {!imgData ? <div>Loading...</div> :
                (<div>
                    <p>{imgData.meta.imageName}</p>
                    <ImagePlane imgData={imgData} roiData={roiData} />
                </div>)
            }
        </div>
    );
};

export default ImageViewer;
