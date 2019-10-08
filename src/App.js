import React from 'react';
import { Router } from "@reach/router";
import CsvPage from './pages/CsvPage';
import ProjectPage from './pages/ProjectPage';
import Home from './pages/Home';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

    return (
        <div className="App">
            
            <Router>
                <Home path="/" />
                <CsvPage path="csv/:annId" />
                <ProjectPage path="project/:projectId" />
            </Router>

        </div>
    );
}

export default App;
