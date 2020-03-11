import React from "react";
// import "./dc.css";
import * as d3 from "d3";
import {fetchText, fetchJson} from "./FetchData";
import {parseData} from "../utils";

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

    initCrossfilter(data, datasetsInfo, mapAnnsInfo) {
        console.log('initCrossfilter...');

        let columns = [];
        let parsedData = [];

        if (data) {
            let d = parseData(data);
            columns = d.columns;
            parsedData = d.parsedData;
        }

        // If we have map annotations, add a column for each Key
        if (mapAnnsInfo) {
            // we want rows of {'Image': id, 'Key1': 'val', 'key2', 2} or
            // {'Well': id, 'Key1': 'val', 'key2', 2}
            // ONE row per image. Ignore duplicate keys for now...
            // First make dict of imageID: {k:v}
            let imgData = {};
            mapAnnsInfo.forEach(mapAnn => {
                let iid = mapAnn.link.parent.id;
                let dtype = mapAnn.link.parent.class.slice(0, -1);
                if (!imgData[iid]) {
                    imgData[iid] = {};
                }
                mapAnn.values.forEach(kv => {
                    imgData[iid][kv[0]] = kv[1];
                });
                // Add Image or Well column
                imgData[iid][dtype] = iid;
            });
            // For each Image or Well ID, we get a row
            let rows = Object.keys(imgData).map(iid => {
                return {...imgData[iid]};
            });

            let d = parseData(rows);
            columns = d.columns;
            parsedData = d.parsedData;
        }

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

            let mapAnnsInfo;
            console.log('this.toLoad.mapAnns', this.toLoad.mapAnns)
            if (this.toLoad.mapAnns) {
                let objId = this.toLoad.mapAnns; // 'project-1'
                let id = objId.split('-')[1];
                let dtype = objId.split('-')[0];
                let childType = (dtype === 'project') ? 'images' : 'wells';
                let u = window.OMEROWEB_INDEX + `parade_crossfilter/annotations/${ dtype }/${ id }/${ childType }/?type=map`;
                let jsonData = await fetchJson(u);
                mapAnnsInfo = jsonData.annotations;
            }

            console.log('this.toLoad.csvFiles', this.toLoad.csvFiles);
            if (this.toLoad.csvFiles && this.toLoad.csvFiles.length > 0) {
                // Load CSV files etc...
                let annId = this.toLoad.csvFiles[0];
                let url = window.OMEROWEB_INDEX + `webclient/annotation/${ annId }`;
                // Load csv file, then process csv (and datasetInfo)
                fetchText(url, csvText => {
                    this.initCrossfilter(d3.csvParse(csvText), datasetsInfo, mapAnnsInfo);
                });
            } else {
                this.initCrossfilter(undefined, datasetsInfo, mapAnnsInfo);
            }
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
