
import React, { useState } from 'react';
import CsvPage from './CsvPage';
import ChooseData from '../dialogs/ChooseData';
import { getUrlParameter } from '../utils';
import { CXContext } from "../crossfilter/DataContext";

export default () => {

    const context = React.useContext(CXContext);

    let project = getUrlParameter('project');
    let screen = getUrlParameter('screen');

    return (
        <React.Fragment>
            <ChooseData
                screen={screen}
                project={project}
                setDataToLoad={context.setDataToLoad}
            />

            { context.ndx ?
                <CsvPage
                    screen={screen}
                />

                : <div>Welcome to OMERO.parade</div>}

        </React.Fragment>
    )
}
