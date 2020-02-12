import React, {useEffect, useState} from 'react';
import { Link } from "@reach/router"

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: '1fr',
    gridColumnGap: 0,
    gridRowGap: 0,
}

function ProjectPage({project, setAnnId}) {

    let dtype = 'project';
    const [loading, setLoading] = useState(false);
    const [fileAnns, setFileAnns] = useState([]);
    const [selectedAnn, selectFileAnn] = useState([]);

    useEffect(() => {
        setLoading(true);
        let url = window.OMEROWEB_INDEX + `webclient/api/annotations/?type=file&${ dtype }=${ project }`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                setLoading(false);
                let csvFiles = data.annotations
                    .filter(ann => ann.file && ann.file.name.endsWith(".csv"));
                setFileAnns(csvFiles);
            });
    }, []);

    const handleClick = (event) => {
        let fid = parseInt(event.target.value);
        if (selectedAnn == fid) {
            // toggle checkbox off
            fid = undefined;
        }
        selectFileAnn(fid);
    }

    const handleSubmit = (event) => {
        setAnnId(selectedAnn);
    }

    return (
        <div className="App">
            
            <h1>{ dtype }</h1>

            <div style={gridStyle}>
                <div>
                    <h3>CSV files</h3>
                {loading ? 'Loading...' : (
                    <form>{
                    fileAnns.map(ann => (
                        <div key={ann.id}>
                            <label>
                                <input
                                    type="radio"
                                    name="csv"
                                    value={ann.id}
                                    onChange={() => {}}  // kill warning
                                    onClick={handleClick}
                                    checked={selectedAnn == ann.id} />
                                {ann.file.name}
                            </label>
                        </div>
                    ))
                    }
                        <button onClick={handleSubmit} type="submit">
                            OK
                        </button>
                    </form>
                )}
                </div>
                <div>
                    <h3>Tags</h3>
                </div>
                <div>
                    <h3>Map Annotations</h3>
                </div>
            </div>
        </div>
    );
}

export default ProjectPage;
