import React, { useState } from 'react';
// import { Router } from "@reach/router";
import CsvPage from './pages/CsvPage';
import ProjectPage from './pages/ProjectPage';
// import Home from './pages/Home';
import { getUrlParameter } from './utils';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

    const [annId, setAnnId] = useState(undefined);

    let project = getUrlParameter('project')

    return (
        <div className="App">
            
            {/* <Router> */}
                {/* <Home path="/" /> */}
            { annId ? <CsvPage annId={annId} /> :
                <ProjectPage 
                    project={project}
                    setAnnId={setAnnId} /> }
            {/* </Router> */}

        </div>
    );
}

export default App;
