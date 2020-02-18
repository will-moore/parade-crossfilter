import React from "react";
// import "./dc.css";
import * as d3 from "d3";
import {fetchText} from "./FetchData";

import crossfilter from "crossfilter2";

export const CXContext = React.createContext("CXContext");


export class DataContext extends React.Component {
    constructor(props) {
        super(props);
        this.chars = [];
        this.state={loading:false,hasNDX:false};
        // toLoad.csvFiles = [annId]
        this.toLoad = props.toLoad;
        console.log("DataContext csvFiles", this.toLoad.csvFiles);
    }

    initCrossfilter(data) {
        console.log('initCrossfilter...');
        // We can get column names from first row of data
        let firstRow = data[0];

        // keys (column names) may contain whitespace.
        let columns = Object.keys(firstRow).map(name => {
            return {name: name.trim(),
                    origName: name,
                    type: undefined}
        });

        // Go through all rows in the table
        // Read from data (using original col names)
        // and create parsedData with new col names (no whitespace)
        let parsedData = data.map(function (d, index) {
            // Coerce strings to number for named columns
            let empty = true;
            columns.forEach(col => {
                // ignore empty cells
                if (d[col.origName].length === 0) return;
                empty = false;
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
            if (!empty) {
                d.reactKey = index;
                return d;
            }
        }).filter(Boolean);

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
        fetchText(url, (csvText => {
            this.initCrossfilter(d3.csvParse(csvText));
        }));
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
