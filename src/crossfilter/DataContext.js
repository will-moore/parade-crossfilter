import React from "react";
// import "./dc.css";
import * as d3 from "d3";

import crossfilter from "crossfilter2";

export const CXContext = React.createContext("CXContext");


export class DataContext extends React.Component {
    constructor(props) {
        super(props);
        this.chars = [];
        this.state={loading:false,hasNDX:false};
    }

    initCrossfilter(data) {
        console.log('initCrossfilter...');
        // First get column names...
        let columns = [];
        let firstRow = data[0];
        for (var name in firstRow) {
            columns.push({name: name});
        }

        // Go through all rows in the table
        data.forEach(function (d) {
            // Coerce strings to number for named columns
            columns.forEach(col => {
                // ignore empty cells
                if (d[col.name].length === 0) return;
                // coerce to number
                if (col.type === 'number') {
                    d[col.name] = +d[col.name];
                } else if (col.type === undefined) {
                    // don't know type yet - check for number
                    let val = +d[col.name];
                    if (isNaN(val)) {
                        col.type = 'string';
                    } else {
                        col.type = 'number';
                        // update the value to use number
                        d[col.name] = val;
                    }
                }
            });
        });

        // Filter for unique Images
        let uniqueIds = new Set();
        data = data.filter(d => {
            if (uniqueIds.has(d.Image)) {
                return false;
            }
            uniqueIds.add(d.Image);
            return true;
        });

        // save columns and crossfilter for Context
        this.columns = columns;
        this.ndx = crossfilter(data);

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

        // Load CSV file...
        let url = window.OMEROWEB_INDEX + "webclient/annotation/12551";
        fetch(url, {mode: 'cors', credentials: 'include'})
        .then(rsp => rsp.body.getReader())
        .then(reader => {
            let self = this;
            reader.read().then(function processText({ done, value }) {
                if (done) {
                    self.initCrossfilter(d3.csvParse(self.chars.join("")));
                } else {
                    for (let i=0; i<value.length; i++) {
                        self.chars.push(String.fromCharCode(value[i]));
                    }
                  reader.read().then(processText);
                }
            });
        });
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
