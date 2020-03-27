import React from 'react';
import Drawer from '../Drawer.js'
import SimpleTable from '../table/SimpleTable';
import PlotContainer from '../plots/PlotContainer';
import Images from '../images/Images';
import {DataContext} from '../crossfilter/DataContext';
import Header from './Header';
import Screen from '../screen/Screen';

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

    const [selectedIds, setSelectedIds] = React.useState([]);
    const [sortBy, setSortBy] = React.useState(undefined);
    const [sortReverse, setSortReverse] = React.useState(false);

    return (
        <DataContext toLoad={toLoad}>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <Header />
            </nav>

            <div style={{display: 'flex', flexWrap: 'nowrap', position: 'absolute', top: 48, height: 'calc(100% - 48px)', bottom: 0, width: '100%'}}>
                <Drawer />
                <main className="column" style={mainStyle}>
                    <div style={{height: 300, background: '', flex: '1 1 auto', display: 'flex', flexDirection: 'row',}}>
                        <div style={{ flex: '1 1 50%'}} >
                            {screen &&
                                <Screen
                                    screenId={screen}
                                    selectedIds={selectedIds}
                                    setSelectedIds={setSelectedIds}
                                />
                            }
                            <PlotContainer
                                setSelectedIds={setSelectedIds}
                            />
                            }
                        </div>
                        <div style={{ flex: '1 1 50%', overflow: 'auto'}} >
                            <Images
                                selectedIds={selectedIds}
                                sortBy={sortBy}
                                sortReverse={sortReverse} />
                        </div>
                    </div>
                    <div style={{overflow: 'auto', flexGrow: 0, flexShrink: 0, height: 310}}>
                        <SimpleTable
                            setSelectedIds={setSelectedIds} 
                            selectedIds={selectedIds}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            sortReverse={sortReverse}
                            setSortReverse={setSortReverse} />
                    </div>
                </main>
            </div>
        </DataContext>
    );
}

export default CsvPage;
