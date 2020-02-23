import React from "react";
// import "./dc.css";
import * as d3 from "d3";
import {fetchText, fetchJson} from "./FetchData";

import crossfilter from "crossfilter2";

export const CXContext = React.createContext("CXContext");


export class DataContext extends React.Component {
    constructor(props) {
        super(props);
        this.chars = [];
        this.state={loading:false,hasNDX:false};
        // toLoad.csvFiles = [annId]
        this.toLoad = props.toLoad;
    }

    initCrossfilter(data, datasetsInfo) {
        console.log('initCrossfilter...');
        // We can get column names from first row of data
        let firstRow = data[0];

        // Process keys (column names):
        // Remove whitespace, image_id -> Image
        let columns = Object.keys(firstRow).map(name => {
            let newName = name.trim();
            if (newName === 'image_id') {
                newName = 'Image';
            }
            if (newName === 'roi_id') {
                newName = 'ROI';
            }
            if (newName === 'shape_id') {
                newName = 'Shape';
            }
            return {name: newName,
                    origName: name,
                    type: undefined,
                    empty: true}
        });

        // Go through all rows in the table
        // Read from data (using original col names)
        // and create parsedData with new col names (no whitespace)
        let parsedData = data.map(function (d, index) {
            // Coerce strings to number for named columns
            let rowEmpty = true;
            columns.forEach(col => {
                // ignore empty cells
                if (d[col.origName].length === 0) return;
                rowEmpty = false;
                col.empty = false;
                // coerce to number
                if (col.type === 'number') {
                    let numValue = +d[col.origName];
                    if (!isNaN(numValue)) {
                        d[col.name] = numValue;
                    }
                } else if (col.type === undefined) {
                    // don't know type yet - check for number
                    let val = +d[col.origName];
                    if (isNaN(val)) {
                        col.type = 'string';
                    } else {
                        col.type = 'number';
                        // update the value to use number
                        d[col.name] = val;
                    }
                }
            });
            // Return nothing if empty - filtered out below
            if (!rowEmpty) {
                // Add unique ID for each row
                d._rowID = index;
                return d;
            }
        }).filter(Boolean);

        // Now filter out any empty Columns
        columns = columns.filter(col => {
            return !col.empty;
        });


        // If we have dict of {image: {id:1}, dataset:{name:'foo'}}
        // Use it to populate the table using existing image colum
        if (datasetsInfo) {
            let imgToDataset = {};
            datasetsInfo.forEach(link => {
                imgToDataset[link.image.id] = link.dataset;
            });

            columns.push({name: 'Dataset', type: 'string'});

            // Add Dataset names to data
            parsedData = parsedData.map(row => {
                if (row.image_id && imgToDataset[row.Image]) {
                    return {...row, 'Dataset': imgToDataset[row.Image].name}
                }
                return row
            });
        }

        // Filter for unique Images
        // let uniqueIds = new Set();
        // data = data.filter(d => {
        //     if (uniqueIds.has(d.Image)) {
        //         return false;
        //     }
        //     uniqueIds.add(d.Image);
        //     return true;
        // });

        // save columns and crossfilter for Context
        this.columns = columns;
        this.ndx = crossfilter(parsedData);

        // Example how to get e.g. average Bounding Box values per Dataset
        // let dsDim = this.ndx.dimension(r => r.Dataset);
        // let dsGrouping = dsDim.group();
        // dsGrouping.reduce(
        //     function(p, v) { // add
        //         p.sum = p.sum + v.Bounding_Box;
        //         p.count = p.count + 1;
        //         p.avg = p.sum / p.count;
        //         return p;
        //     },
        //     function(p, v) { // remove
        //         p.sum = p.sum - v.Bounding_Box;
        //         p.count = p.count - 1;
        //         p.avg = p.sum / p.count;
        //         return p;
        //     },
        //     function() { // init
        //         return {sum: 0, count: 0, avg: 0};
        //     }
        // )
        // console.log('ds', dsGrouping.all());

        // setState to render...
        this.setState({loading:false, hasNDX:true});
    }

    componentDidMount(){
        if (this.state.hasNDX){
            return
        }
        if(this.state.loading){
            return
        }
        this.setState({loading:true});

        // Load CSV files etc...
        let annId = this.toLoad.csvFiles[0];
        let url = window.OMEROWEB_INDEX + `webclient/annotation/${ annId }`;

        // Need to wrap the await below in async function
        const fetchData = async () => {

            // If loading Datastes info, wait....
            let datasetsInfo;
            if (this.toLoad.datasets) {
                let projectId = this.toLoad.datasets;
                let u = window.OMEROWEB_INDEX + `parade_crossfilter/datasets/${ projectId }`;
                let jsonData = await fetchJson(u);
                datasetsInfo = jsonData.data;
            }

            // Load csv file, then process csv (and datasetInfo)
            fetchText(url, csvText => {
                this.initCrossfilter(d3.csvParse(csvText), datasetsInfo);
            });
        };
        fetchData();

    }

    render() {
        if(!this.state.hasNDX){
            return (<div>Loading...</div>);
        }
        return (
            <CXContext.Provider value={{ndx:this.ndx, columns: this.columns}}>
                <div ref={this.parent}>
                    {this.props.children}
                </div>
            </CXContext.Provider>
        );
    }
}
