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
    const [showScreen, setShowScreen] = React.useState(true);

    const handleShowScreen = () => {
        setShowScreen(!showScreen);
    }

    const plotH = showScreen ? 5 : 8;
    const tableH = showScreen ? 6 : 8;
    const imgsH = showScreen ? 10 : 8;
    const screenH = showScreen ? plotH : 0;
    const screenW = showScreen ? 8 : 0

    const layout = [
        { i: 'plot', x: 0, y: 0, w: 8, h: plotH, minW: 4 },
        { i: 'images', x: 10, y: 0, w: 4, h: imgsH, minW: 4 },
        { i: 'table', x: 0, y: 7, w: 12, h: tableH },
        { i: 'screen', x: 0, y: 5, w: screenH, h: screenH }
    ];

    let screenComponent = undefined;
    if (showScreen && screen) {
        screenComponent = (
                <Screen
                    screenId={screen}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
        )
    }

    const plot = (
        <PlotContainer
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
        />)
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

        return (
            <div
                key={el.i}
                data-grid={el}
                style={cellStyle}
                >
                {panels[el.i]}
            </div>
        )
    }

    return (
        <DataContext toLoad={toLoad}>

            <div style={{ display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%' }}>
                <Drawer />
                <main className="column" style={mainStyle}>

                    <button
                        style={{position: 'absolute', zIndex: 10}}
                        onClick={handleShowScreen}>
                        +
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
