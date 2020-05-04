
import React, {useState} from 'react';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
import ChooseData from '../dialogs/ChooseData';
import { getUrlParameter } from '../utils';

export default () => {

    const [toLoad, setDataToLoad] = useState();

    let project = getUrlParameter('project');
    let screen = getUrlParameter('screen');

    return (
    <div style={{display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%'}}>

        <ChooseData
            screen={screen}
            project={project}
            setDataToLoad={setDataToLoad}
        />

        { toLoad ? <div>Loading...</div> : <div>Welcome to OMERO.parade</div>}

    </div>
)}
