import React, { useState } from 'react';
// import { Router } from "@reach/router";
import CsvPage from './pages/CsvPage';
import ObjectPage from './pages/ObjectPage';
import Home from './pages/Home';
import { getUrlParameter } from './utils';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

    // If we have ?annotation=1 then load that e.g. CSV
    // Otherwise we can use ?project=1 to list CSVs on it
    // Then the ObjectPage will call setAnnId()
    let project = getUrlParameter('project');
    let screen = getUrlParameter('screen');
    let annotation = getUrlParameter('annotation');
    let initialData = {}
    if (annotation) {
        annotation = parseInt(annotation, 10)
        initialData.csvFiles = [annotation];
    }

    const [toLoad, setDataToLoad] = useState(initialData);

    return (
        <div className="App">

            { toLoad.csvFiles ? <CsvPage toLoad={toLoad} /> :
                 (project || screen) ?
                    <ObjectPage 
                        project={project}
                        screen={screen}
                        setDataToLoad={setDataToLoad} /> : 
                    <Home />
            }

        </div>
    );
}

export default App;
