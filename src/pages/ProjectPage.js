import React, {useEffect, useState} from 'react';
import { Link } from "@reach/router"

function ProjectPage({dtype, projectId}) {

    const [loading, setLoading] = useState(false);
    const [fileAnns, setFileAnns] = useState([]);

    useEffect(() => {
        setLoading(true);
        let url = window.OMEROWEB_INDEX + `webclient/api/annotations/?type=file&${ dtype }=${ projectId }`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                console.log(data);
                setLoading(false);
                setFileAnns(data.annotations);
            });
    }, []);


    return (
        <div className="App">
            
            <h1>{ dtype }</h1>

            {loading ? 'Loading...' : (
                <ul>{
                fileAnns.map(ann => (
                    <li key={ann.id}>
                        {/* relative link to project/:id/csv/:id */}
                        <Link to={`csv/${ ann.id }`}>
                            {ann.file.name}
                        </Link>
                    </li>
                ))
                }</ul>
            )}
        </div>
    );
}

export default ProjectPage;
