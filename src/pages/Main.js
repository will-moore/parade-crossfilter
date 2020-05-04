
import React, {useState} from 'react';
import CsvPage from './CsvPage';
import ChooseData from '../dialogs/ChooseData';
import { getUrlParameter } from '../utils';

export default () => {

    const [toLoad, setDataToLoad] = useState();

    let project = getUrlParameter('project');
    let screen = getUrlParameter('screen');

    return (
    <React.Fragment>
        <ChooseData
            screen={screen}
            project={project}
            setDataToLoad={setDataToLoad}
        />

        { toLoad ?
            <CsvPage
                toLoad={toLoad}
                screen={screen}
            />
        
        : <div>Welcome to OMERO.parade</div>}

    </React.Fragment>
)}
