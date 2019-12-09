
import React, {useEffect, useState} from "react";
import Plate from "./Plate";

const Screen = ({filteredObjs, dtype, objectId}) => {

    const[plates, setPlates] = useState([]);

    let filteredIds = {};
    filteredIds['Image'] = new Set();
    filteredObjs.forEach(obj => {
        filteredIds['Image'].add(obj.Image);
    });

    useEffect(() => {
        let url = window.OMEROWEB_INDEX + `api/v0/m/screens/${ objectId }/plates/`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                let plates = data.data.map(p => {return {id: p['@id'], Name: p.Name}});
                setPlates(plates);
            });
    }, []);

    return (
        <div>
            <div>{dtype} {objectId}: {filteredObjs.length} images</div>
            { plates.length === 0 ? "Loading plates..." : `${ plates.length } plates:`}
            {
                plates.map(p => <Plate key={p.id} plate={p} filteredIds={filteredIds} ></Plate>)
            }
        </div>
    );
};

export default Screen;
