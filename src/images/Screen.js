
import React, {useEffect, useState} from "react";
import Plate from "./Plate";

const Screen = ({screenId, filteredIds, selectedIds}) => {

    const[plates, setPlates] = useState([]);

    useEffect(() => {
        let url = window.OMEROWEB_INDEX + `api/v0/m/screens/${ screenId }/plates/`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                let plates = data.data.map(p => {return {id: p['@id'], Name: p.Name}});
                setPlates(plates);
            });
    }, []);

    return (
        <div>
            { plates.length === 0 ? "Loading plates..." : `${ plates.length } plates:`}
            {
                plates.map(p =>
                    <Plate
                        key={p.id}
                        plate={p}
                        filteredIds={filteredIds}
                    />)
            }
        </div>
    );
};

export default Screen;
