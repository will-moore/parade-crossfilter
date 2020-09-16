
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Dropdown from 'react-bootstrap/Dropdown';
import Header from './pages/Header';
import Main from './pages/Main';
import { getUrlParameter } from './utils';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-input-range/lib/css/index.css'

function App() {

    // If we have ?annotation=1 then load that e.g. CSV
    // Otherwise we can use ?project=1 to list CSVs on it
    // Then the ObjectPage will call setAnnId()
    // let project = getUrlParameter('project');
    // let screen = getUrlParameter('screen');
    let annotation = getUrlParameter('annotation');
    // let initialData = undefined;
    if (annotation) {
        annotation = parseInt(annotation, 10)
        // initialData = {csvFiles: [annotation]};
    }

    return (
        <div className="App">
            <Nav
                className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow"
            >
                <Header />

                <Dropdown as={NavItem} className="ml-auto navbar-nav pr-md-4">
                    <Dropdown.Toggle as={NavLink}>Click to see more…</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item>Hello there!</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav>
            <Main />
        </div >
    );
}

export default App;
