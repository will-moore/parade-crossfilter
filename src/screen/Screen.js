
import React, {useEffect, useState} from "react";
import Plate from "./Plate";
import SpwControls from "./SpwControls";

const Screen = ({screenId, selectedIds}) => {

    const [plates, setPlates] = useState([]);
    const [showFields, setShowFields] = useState(false);
    const [heatmap, setHeatmap] = React.useState('--');

    useEffect(() => {
        let url = window.OMEROWEB_INDEX + `api/v0/m/screens/${ screenId }/plates/`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                let plates = data.data.map(p => {return {id: p['@id'], Name: p.Name}});
                setPlates(plates);
            });
    }, [screenId]);

    return (
        <div style={{position: 'relative'}}>
            <SpwControls
                setShowFields={setShowFields}
                heatmap={heatmap}
                setHeatmap={setHeatmap}
            />
            { plates.length === 0 ? "Loading plates..." : `${ plates.length } plates:`}
            {
                plates.map(p =>
                    <Plate
                        key={p.id}
                        plate={p}
                        showFields={showFields}
                        heatmap={heatmap}
                        selectedIds={selectedIds}
                    />)
            }
        </div>
    );
};

export default Screen;
