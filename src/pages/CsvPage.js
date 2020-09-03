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

    const removeStyle = {
        position: "absolute",
        right: 3,
        top: 0,
        cursor: "pointer"
    };

    const [selectedIds, setSelectedIds] = React.useState([]);
    const [sortBy, setSortBy] = React.useState(undefined);
    const [sortReverse, setSortReverse] = React.useState(false);

    const [items, setItems] = React.useState([
        { i: 'p1', type: 'plot', x: 0, y: 0, w: 8, h: 8},
        { i: 'p2', type: 'images', x: 10, y: 0, w: 4, h: 8},
        { i: 'p3', type: 'table', x: 0, y: 7, w: 12, h: 8 },
    ]);

    function createItem(el) {
        const i = el.i;
        return (
            <div key={i} data-grid={el} style={cellStyle}>
                {panels[el.type]}
                <span
                    className="remove"
                    style={removeStyle}
                    onClick={() => { onRemoveItem(i) }}
                >X</span>
            </div>
        );
    }

    function onAddItem(panelType) {
        // move all panels down and add new panel at the top
        let height = 6;
        let l = items.map(panel => ({ ...panel, y: panel.y + height }));
        let max_id = l.reduce(
            (prev, panel) => Math.max(prev, parseInt(panel.i.replace('p', ''))), 0)
        // add new panel
        const newPanel = {
            i: "p" + (max_id + 1),
            type: panelType,
            x: 0,
            y: 0, // puts it at the top
            w: 8,
            h: height,
        };
        setItems([newPanel, ...l]);
    }

    function onRemoveItem(i) {
        setItems(items.filter(panel => panel.i !== i));
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

    return (
        <DataContext toLoad={toLoad}>

            <div style={{ display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%' }}>
                <Drawer />
                <main className="column" style={mainStyle}>

                    <button
                        style={{ position: 'absolute', zIndex: 10 }}
                        onClick={() => { onAddItem('plot') }}>
                        plot
                    </button>

                    <button
                        style={{ position: 'absolute', zIndex: 10, left: 100 }}
                        onClick={() => { onAddItem('screen') }}>
                        screen
                    </button>

                    <ReactGridLayout
                        draggableCancel=".draggableCancel"
                        className="layout"
                        cols={12} rowHeight={45} >

                        {
                            items.map(el => createItem(el))
                        }
                    </ReactGridLayout>

                </main>
            </div>
        </DataContext>
    );
}

export default CsvPage;
