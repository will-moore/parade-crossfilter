import React from 'react';
import Drawer from '../Drawer.js'
import SimpleTable from '../table/SimpleTable';
import PlotContainer from '../plots/PlotContainer';
import Images from '../images/Images';
import {DataContext} from '../crossfilter/DataContext';
import Header from './Header';

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


    const [filteredIds, setFilteredIds] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [sortBy, setSortBy] = React.useState(undefined);
    const [sortReverse, setSortReverse] = React.useState(false);

    // data to load.
    // data.csvFiles = [annId]
    let toLoad = props.toLoad;
    console.log('csvFiles', toLoad.csvFiles);

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
                            <PlotContainer setFilteredIds={setFilteredIds} />
                        </div>
                        <div style={{ flex: '1 1 50%', overflow: 'auto'}} >
                            <Images
                                filteredIds={filteredIds}
                                sortBy={sortBy}
                                sortReverse={sortReverse} />
                        </div>
                    </div>
                    <div style={{overflow: 'auto', flexGrow: 0, flexShrink: 0, height: 310}}>
                        <SimpleTable
                            filteredIds={filteredIds}
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
