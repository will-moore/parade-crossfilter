import React from 'react';
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
        width: '200',
        overflow: 'auto',
    }

    return (
        <div className="App">
            <DataContext>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <span className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">OMERO.parade</span>
            </nav>

            <div style={{display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%'}}>
                <Drawer />
                <main role="main" className="column" style={mainStyle}>
                    <div style={{background: '', flex: '1 1 auto'}}>
                        <h2>Plot</h2>
                    </div>
                    <div style={{overflow: 'auto', flexGrow: 0, flexShrink: 0, height: 250}}>
                        <DataTable />
                    </div>
                </main>
            </div>
            </DataContext>
        </div>
    );
}

export default App;
