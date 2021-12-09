
import React from 'react';
import Nav from 'react-bootstrap/Nav';

import { DataContext } from './crossfilter/DataContext';
import Header from './pages/Header';
import Main from './pages/Main';
import OpenWith from './pages/OpenWith';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-input-range/lib/css/index.css'

function App() {

    return (
        <div className="App">
            <DataContext>
                <Nav
                    className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow"
                >
                    <Header />
                    <OpenWith />
                </Nav>
                <Main />
            </DataContext>
        </div >
    );
}

export default App;
