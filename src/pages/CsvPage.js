import React from 'react';
import Drawer from '../Drawer.js'
import SimpleTable from '../table/SimpleTable';
import PlotContainer from '../plots/PlotContainer';
import Images from '../images/Images';
import {DataContext} from '../crossfilter/DataContext';

function CsvPage(props) {

    const mainStyle = {
        flex: '1 1 auto',
        paddingLeft: 15,
        paddingRight: 15,
        display: 'flex',
        flexDirection: 'column',
        width: '200',
        overflow: 'auto',
    }


    let annId = props.annId;
    console.log('ann', annId);

    // path="csv/:annId" 
    // {dtype, objectId, annId}

    return (
        <DataContext annId={annId}>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <span className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">OMERO.parade</span>
            </nav>

            <div style={{display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%'}}>
                <Drawer />
                <main className="column" style={mainStyle}>
                    <div style={{background: '', flex: '1 1 auto', display: 'flex', flexDirection: 'row',}}>
                        <div style={{ flex: '1 1 50%'}} >
                            <PlotContainer />
                        </div>
                        <div style={{ flex: '1 1 50%', overflow: 'auto'}} >
                            {/* <Images/> */}
                        </div>
                    </div>
                    <div style={{overflow: 'auto', flexGrow: 0, flexShrink: 0, height: 250}}>
                        <SimpleTable />
                    </div>
                </main>
            </div>
        </DataContext>
    );
}

export default CsvPage;
