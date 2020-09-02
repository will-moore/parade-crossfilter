import React from 'react';
import Drawer from '../Drawer.js'
import SimpleTable from '../table/SimpleTable';
import PlotContainer from '../plots/PlotContainer';
import Screen from '../screen/Screen';
import Images from '../images/Images';
import { DataContext } from '../crossfilter/DataContext';

import RGL, { WidthProvider } from "react-grid-layout";
const ReactGridLayout = WidthProvider(RGL);

function CsvPage({ toLoad, screen }) {

    const mainStyle = {
        flex: '1 1 auto',
        paddingLeft: 15,
        paddingRight: 15,
        display: 'flex',
        flexDirection: 'column',
        width: '200',
        overflow: 'auto',
        background: 'rgb(240, 240, 240)',
        position: 'relative',
    }

    const cellStyle = {
        border: 'solid rgb(240, 240, 240) 1px',
        background: 'white',
        borderRadius: '6px',
        padding: 15,
    }

    const [selectedIds, setSelectedIds] = React.useState([]);
    const [sortBy, setSortBy] = React.useState(undefined);
    const [sortReverse, setSortReverse] = React.useState(false);

    const [layout, setLayout] = React.useState([
        { i: 'p1', type: 'plot', x: 0, y: 0, w: 8, h: 8, minW: 4 },
        { i: 'p2', type: 'images', x: 10, y: 0, w: 4, h: 8, minW: 4 },
        { i: 'p3', type: 'table', x: 0, y: 7, w: 12, h: 8 },
        // { i: 'screen', x: 0, y: 5, w: screenH, h: screenH }
    ]);

    const handleAddPanel = (panelType) => {
        console.log('add...', layout);
        // move table down
        let row = 0;
        let height = 2;
        let l = layout.map(panel => {
            panel = { ...panel };
            if (panel.type === 'table') {
                row = panel.y;
                panel.y = row + height;
            }
            return panel;
        });
        let max_id = l.reduce(
            (prev, panel) => Math.max(prev, parseInt(panel.i.replace('p', ''))), 0)
        // add new panel
        console.log('max', max_id)
        l.push({
            i: 'p' + (max_id + 1),
            type: panelType,
            x: 0, y: row, w: 8, h: height
        });

        setLayout(l);
    }

    const screenComponent = (
        <Screen
            screenId={screen}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
        />
    )

    const plot = (
        <PlotContainer
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
        />
    )
    const images = (
        <Images
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            sortBy={sortBy}
            sortReverse={sortReverse}
        />
    )
    const table = (
        <SimpleTable
            setSelectedIds={setSelectedIds}
            selectedIds={selectedIds}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortReverse={sortReverse}
            setSortReverse={setSortReverse}
        />
    )
    const panels = {
        'plot': plot,
        'images': images,
        'table': table,
        'screen': screenComponent,
    }

    function createElement(el) {

        console.log('create', el);
        return (
            <div
                key={el.i}
                data-grid={el}
                style={cellStyle}
            >
                {panels[el.type]}
            </div>
        )
    }

    return (
        <DataContext toLoad={toLoad}>

            <div style={{ display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%' }}>
                <Drawer />
                <main className="column" style={mainStyle}>

                    <button
                        style={{ position: 'absolute', zIndex: 10 }}
                        onClick={() => { handleAddPanel('plot') }}>
                        plot
                    </button>

                    <button
                        style={{ position: 'absolute', zIndex: 10, left: 100 }}
                        onClick={() => { handleAddPanel('screen') }}>
                        screen
                    </button>

                    <ReactGridLayout
                        draggableCancel=".draggableCancel"
                        className="layout"
                        layout={layout} cols={12} rowHeight={45} >

                        {
                            layout.map(el => createElement(el))
                        }
                    </ReactGridLayout>

                </main>
            </div>
        </DataContext>
    );
}

export default CsvPage;
