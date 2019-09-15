import React, {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function Drawer() {

  const drawerWidth = 320;

  const toolbarStyle = {
    zIndex: 100,
    padding: '48px 0 0',
    boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, .1)',
    display: 'block',
    flex: `0 0 50px`,
  }

  const [drawerOpen, setDrawerOpen] = useState(true);

  const drawerStyle = {
    zIndex: 100,
    padding: '48px 0 0',
    boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, .1)',
    display: 'block',
    flexGrow: 0,
    flexShrink: 0,
    width: drawerOpen ? drawerWidth : 0,
    transition: 'width 0.5s ease-in-out',
  }

  const expandButtonStyle = {
    transform: drawerOpen ? 'rotate(0deg)' : 'rotate(180deg)',
  }

  const handleClickExpand = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <React.Fragment>
      <nav className="bg-light" style={drawerStyle}>
        <div className="sidebar-sticky">
          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Filters</span>
          </h6>
        </div>
      </nav>

      <nav className="bg-light" style={toolbarStyle}>
        <div className="sidebar-sticky" style={{padding: 7}}>
          <button onClick={handleClickExpand} type="button" class="btn btn-light" style={expandButtonStyle}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
      </nav>
    </React.Fragment>
  );
}

export default Drawer;
