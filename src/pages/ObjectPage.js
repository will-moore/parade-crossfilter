import React, {useEffect, useState} from 'react';
import {filesizeformat} from '../utils';

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: '1fr',
    gridColumnGap: 0,
    gridRowGap: 0,
}

function ObjectPage({project, screen, setDataToLoad}) {

    // let dtype = 'project';
    const [loading, setLoading] = useState(false);
    const [fileAnns, setFileAnns] = useState([]);
    const [selectedAnn, selectFileAnn] = useState(undefined);
    const [datasets, setDatasets] = useState(undefined);
    const [mapAnns, setMapAnns] = useState(undefined);

    useEffect(() => {
        setLoading(true);
        let url = window.OMEROWEB_INDEX + `webclient/api/annotations/?type=file`;
        if (project) {
            url += `&project=${ project }`
        } else if (screen) {
            url += `&screen=${ screen }`
        }
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                setLoading(false);
                let csvFiles = data.annotations
                    .filter(ann => ann.file && (ann.file.name.endsWith(".csv")));
                setFileAnns(csvFiles);
            });
    }, []);

    const handleClick = (event) => {
        let fid = parseInt(event.target.value);
        if (selectedAnn === fid) {
            // toggle checkbox off
            fid = undefined;
        }
        selectFileAnn(fid);
    }

    const handleDatasets = (event) => {
        // toggle datasets
        if (datasets) {
            setDatasets(undefined);
        } else {
            // pass in the project ID
            setDatasets(project);
        }
    }

    const handleMapAnns = (event) => {
        if (mapAnns) {
            setMapAnns(undefined);
        } else {
            // pass in the screen, project ID etc
            if (screen) {
                setMapAnns('screen-' + screen);
            } else if (project) {
                setMapAnns('project-' + project);
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        let dataToLoad = {};
        if (selectedAnn) {
            dataToLoad.csvFiles = [selectedAnn];
        }
        dataToLoad.datasets = datasets;
        dataToLoad.mapAnns = mapAnns;
        setDataToLoad(dataToLoad);
    }

    return (
        <div className="App" style={{padding: '80px 150px'}}>
            
            <h1>
                { project && "Project" }
                { screen && "Screen" }
            </h1>

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
                                    checked={selectedAnn === ann.id} />
                                {ann.id}: {ann.file.name} ({filesizeformat(ann.file.size)})
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
                    <h3>Key-Value Pairs</h3>
                    <label>
                        <input name="mapAnns" type="checkbox" onChange={handleMapAnns} />
                        Load Key-Value Pairs
                    </label>

                    <h3>Datasets</h3>
                    <label>
                        <input name="datasets" type="checkbox" onChange={handleDatasets} />
                        Load Datasets
                    </label>
                </div>
                <div>
                    <h3>Map Annotations</h3>
                </div>
            </div>
        </div>
    );
}

export default ObjectPage;
