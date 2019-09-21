import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Drawer from './Drawer.js'
import DataTable from './table/DataTable';

import {DataContext} from './crossfilter/DataContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

    const mainStyle = {
        flex: '1 1 auto',
        paddingLeft: 15,
        paddingRight: 15,
        display: 'flex',
        flexDirection: 'column',
        border: 'solid green 2px',
        width: '200',
    }

    return (
        <div className="App">
            <DataContext>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <span className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">OMERO.parade</span>
        </nav>

        <div className="container-fluid">
            <div className="row" style={{display: 'flex', flexWrap: 'nowrap'}}>
                <Drawer />
                <main role="main" className="column" style={mainStyle}>
                    <div style={{background: 'rebeccapurple', height: '50%'}}>
                        <h2>Plot</h2>
                    </div>
                    <div style={{background: 'blue', height: '50%', overflow: 'auto'}}>
                        <DataTable />
                    </div>
                </main>
            </div>
        </div>
        </DataContext>
        </div>
    );
}

export default App;
