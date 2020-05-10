import React from 'react';
import { SizeMe } from 'react-sizeme';
import Drawer from '../Drawer.js'
import SimpleTable from '../table/SimpleTable';
import PlotContainer from '../plots/PlotContainer';
import Images from '../images/Images';
import {DataContext} from '../crossfilter/DataContext';
import Header from './Header';
import Screen from '../screen/Screen';

import RGL, { WidthProvider } from "react-grid-layout";
const ReactGridLayout = WidthProvider(RGL);

function CsvPage({toLoad, screen}) {

    const mainStyle = {
        flex: '1 1 auto',
        paddingLeft: 15,
        paddingRight: 15,
        display: 'flex',
        flexDirection: 'column',
        width: '200',
        overflow: 'auto',
    }

    const cellStyle = {
        border: 'solid #ccc 1px',
    }

    const [selectedIds, setSelectedIds] = React.useState([]);
    const [sortBy, setSortBy] = React.useState(undefined);
    const [sortReverse, setSortReverse] = React.useState(false);

    const layout = [
        {i: 'a', x: 0, y: 0, w: 6, h: 7},
        {i: 'b', x: 6, y: 0, w: 6, h: 6, minW: 4, maxW: 6},
        {i: 'c', x: 0, y: 7, w: 12, h: 4}
      ];

    return (
        <DataContext toLoad={toLoad}>

            <div style={{display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%'}}>
                <Drawer />
                <main className="column" style={mainStyle}>

      <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={45} >
        <div
            key="a"
            style={cellStyle}>
            <PlotContainer
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
            />
        </div>
        <div key="b" style={cellStyle}>
            <SizeMe monitorHeight>{({ size }) => <div style={{height: '100%', background: 'yellow' }}>WIDTH {size.width}px, HEIGHT {size.height}px</div>}</SizeMe>
        </div>
        
      </ReactGridLayout>


                
                    
                </main>
            </div>
        </DataContext>
    );
}

export default CsvPage;
