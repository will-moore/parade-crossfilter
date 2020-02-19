import React, {useEffect, useState} from 'react';

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: '1fr',
    gridColumnGap: 0,
    gridRowGap: 0,
}

function ProjectPage({project, setDataToLoad}) {

    let dtype = 'project';
    const [loading, setLoading] = useState(false);
    const [fileAnns, setFileAnns] = useState([]);
    const [selectedAnn, selectFileAnn] = useState([]);
    const [datasets, setDatasets] = useState(false);

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

    const handleDatasets = (event) => {
        // toggle datasets
        if (datasets) {
            setDatasets(undefined);
        } else {
            // pass in the project ID
            setDatasets(project);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        let dataToLoad = {};
        dataToLoad.csvFiles = [selectedAnn];
        dataToLoad.datasets = datasets;
        setDataToLoad(dataToLoad);
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
                                {ann.id}: {ann.file.name}
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
                    <label>
                        <input name="tags" type="checkbox" />
                        Load Tags
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

export default ProjectPage;
