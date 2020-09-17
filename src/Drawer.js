import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Filters from './filters/Filters';
import GroupBy from './grouping/GroupBy';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function Drawer() {

  const drawerWidth = 320;

  const toolbarStyle = {
    zIndex: 110,
    padding: '0',
    boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, .1)',
    display: 'block',
    flex: `0 0 50px`,
    backgroundColor: '#4f545a',
  }

  const [drawerOpen, setDrawerOpen] = useState(true);

  const drawerStyle = {
    zIndex: 100,
    padding: '0',
    // boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, .1)',
    display: 'block',
    flexGrow: 0,
    flexShrink: 0,
    width: drawerOpen ? drawerWidth : 0,
    transition: 'width 0.5s ease-in-out',
    backgroundColor: '#4f545a',
    color: 'white',
  }

  const expandButtonStyle = {
    transform: drawerOpen ? 'rotate(0deg)' : 'rotate(180deg)',
  }

  const handleClickExpand = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <React.Fragment>
      <nav style={drawerStyle}>
        <GroupBy />
        <Filters />
      </nav>

      <nav style={toolbarStyle}>
        <div className="sidebar-sticky" style={{ padding: 7 }}>
          <button onClick={handleClickExpand} type="button" className="btn btn-light" style={expandButtonStyle}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
      </nav>
    </React.Fragment>
  );
}

export default Drawer;
