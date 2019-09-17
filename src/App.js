import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Drawer from './Drawer.js'

import {DataContext} from './crossfilter/DataContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

  const mainStyle = {
    flex: '1 1 auto',
    paddingLeft: 15,
    paddingRight: 15,
  }

  const [projectsCount, setProjectsCount] = useState(undefined);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let projectsUrl = window.OMEROWEB_INDEX + "api/v0/m/projects/";
    fetch(projectsUrl, {mode: 'cors', credentials: 'include'})
    .then(rsp => rsp.json())
    .then(data => {
      if (data.meta) {
        let projectCount = data.meta.totalCount;
        setProjectsCount(projectCount);
        setProjects(data.data);
      } else {
        setProjectsCount(-1);
      }
    })
  }, []);

  return (
    <div className="App">
      <DataContext>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <span className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">OMERO.parade</span>
      </nav>

      <div className="container-fluid">
        <div className="row" style={{display: 'flex'}}>
          <Drawer />
          <main role="main" style={mainStyle}>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Dashboard</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle">
                  <span data-feather="calendar"></span>
                  This week
                </button>
              </div>
            </div>

            <p>
                    {projectsCount === undefined ? "Loading..." : (
                      `Total: ${projectsCount} projects`
                    )}
                </p>

                <Button>Test</Button>

                <ul>
                  {
                    projects.map(p => (
                      <li key={p['@id']}>
                        {p.Name} (ID: {p['@id']})
                      </li>
                    ))
                  }
                </ul>

            <h2>Table</h2>
            <div className="table-responsive">
              <table className="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Header</th>
                    <th>Header</th>
                    <th>Header</th>
                    <th>Header</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1,001</td>
                    <td>Lorem</td>
                    <td>ipsum</td>
                    <td>dolor</td>
                    <td>sit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
      </DataContext>
    </div>
  );
}

export default App;
