import React, {useState, useEffect} from 'react';

import './App.css';

function App() {

  const [projectsCount, setProjectsCount] = useState(undefined);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let projectsUrl = window.OMEROWEB_INDEX + "api/v0/m/projects/";
    fetch(projectsUrl, {mode: 'cors', credentials: 'include'})
    .then(rsp => rsp.json())
    .then(data => {

      let projectCount = data.meta.totalCount;
      setProjectsCount(projectCount);
      setProjects(data.data);
    })
  }, []);

  return (
    <div className="App">
      <h1>Welcome to OMERO</h1>
        <p>
            {projectsCount === undefined ? "Loading..." : (
              `Total: ${projectsCount} projects`
            )}
        </p>

        <ul>
          {
            projects.map(p => (
              <li key={p['@id']}>
                {p.Name} (ID: {p['@id']})
              </li>
            ))
          }
        </ul>
    </div>
  );
}

export default App;
