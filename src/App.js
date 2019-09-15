import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

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
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <span className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">OMERO.parade</span>
      </nav>

      <div className="container-fluid">
        <div className="row">
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            <div className="sidebar-sticky">
              <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                <span>Filters</span>
              </h6>
            </div>
          </nav>

          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
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
    </div>
  );
}

export default App;
