import React from "react";
// import "./dc.css";
import * as d3 from "d3";
import { fetchText, fetchJson, fetchChildAnnotations } from "./FetchData";
import { parseData, parseMapAnns, parseTagAnns, groupCrossfilterData } from "../utils";

import crossfilter from "crossfilter2";

export const CXContext = React.createContext("CXContext");


export class DataContext extends React.Component {
    constructor(props) {
        super(props);
        this.chars = [];
        this.state = { loading: false, hasNDX: false, groupBy: [] };
        // toLoad.csvFiles = [annId]
        this.toLoad = props.toLoad;
    }

    addGroupBy(colname) {
        // let groupBy = [...this.state.groupBy, colname];

        // let cfdata = this.orig_data;
        // let columns = this.columns;

        // let groupBy = this.state.groupBy;
        // if (groupBy) {
        //     groupBy.forEach(groupName => {
        let g = groupCrossfilterData(this.orig_data, this.columns, colname);
        this.orig_data = crossfilter(g.data);
        this.columns = g.columns;
        //     });
        // }

        // Hack! to orce all Children to re-render with new crossfilter(grouped)
        this.setState({ hasNDX: false, loading: true });
        setTimeout(() => {
            this.setState({ hasNDX: true, loading: false });
        }, 100);
    }

    initCrossfilter(data, datasetsInfo, annData) {
        // Handle csv data, rows of dicts
        let columns = [];
        let parsedData = [];

        if (data) {
            let d = parseData(data);
            columns = d.columns;
            parsedData = d.parsedData;
        }

        // ** NB: for MapAnnotations and Tags, we use 'Image' key to add these
        // to the CSV data.
        // Need to handle Screen data using 'Well' key!

        if (annData.maps) {
            // OR, if we have map annotations, add a column for each Key
            let d = parseMapAnns(annData.maps);
            columns = columns.concat(d.columns.filter(c => c.name !== 'Image'));
            // make {imgId:row} lookup...
            let rowById = d.parsedData.reduce((prev, row) => {
                prev[row.Image] = row;
                return prev;
            }, {});
            // add key-value dict to each row, matching by Image ID
            parsedData = parsedData.map(row => {
                let kvData = rowById[row.Image] || {};
                return { ...row, ...kvData };
            });
        }
        if (annData.tags) {
            // if we have tags, get {imgId: ['list', 'of', 'tags']}
            let tagsById = parseTagAnns(annData.tags);
            columns.push({ name: 'Tags', type: 'array' });
            // add key-value dict to each row, matching by Image ID
            parsedData = parsedData.map(row => {
                let tags = tagsById[row.Image] || [];
                return { ...row, 'Tags': tags };
            });
        }

        // If we have dict of {image: {id:1}, dataset:{name:'foo'}}
        // Use it to populate the table using existing image colum
        if (datasetsInfo) {
            let imgToDataset = {};
            datasetsInfo.forEach(link => {
                imgToDataset[link.image.id] = link.dataset;
            });

            columns.push({ name: 'Dataset', type: 'string' });

            // Add Dataset names to data
            parsedData = parsedData.map(row => {
                if (row.Image && imgToDataset[row.Image]) {
                    return { ...row, 'Dataset': imgToDataset[row.Image].name }
                }
                return row
            });
        }


        // save columns and crossfilter for Context
        this.orig_data = crossfilter(parsedData);
        this.columns = columns;
        this.ndx = this.orig_data;

        // setState to render...
        this.setState({ loading: false, hasNDX: true });
    }

    componentDidMount() {
        if (this.state.hasNDX) {
            return
        }
        if (this.state.loading) {
            return
        }
        this.setState({ loading: true });

        // Need to wrap the await below in async function
        const fetchData = async () => {

            // If loading Datastes info, wait....
            let datasetsInfo;
            if (this.toLoad.datasets) {
                let projectId = this.toLoad.datasets;
                let u = window.OMEROWEB_INDEX + `parade_crossfilter/datasets/${projectId}`;
                let jsonData = await fetchJson(u);
                datasetsInfo = jsonData.data;
            }

            let annData = {};
            if (this.toLoad.mapAnns) {
                let objId = this.toLoad.mapAnns; // 'project-1'
                let jsonData = await fetchChildAnnotations(objId, 'map');
                annData.maps = jsonData.annotations;
            }

            if (this.toLoad.tags) {
                let objId = this.toLoad.tags; // 'project-1'
                let jsonData = await fetchChildAnnotations(objId, 'tag');
                annData.tags = jsonData.annotations;
            }

            if (this.toLoad.csvFiles && this.toLoad.csvFiles.length > 0) {
                // Load CSV files etc...
                let annId = this.toLoad.csvFiles[0];
                let url = window.OMEROWEB_INDEX + `webclient/annotation/${annId}`;
                // Load csv file, then process csv (and datasetInfo)
                fetchText(url, csvText => {
                    this.initCrossfilter(d3.csvParse(csvText), datasetsInfo, annData);
                });
            } else {
                this.initCrossfilter(undefined, datasetsInfo, annData);
            }
        };
        if (this.toLoad) {
            fetchData();
        }

    }

    render() {
        if (!this.state.hasNDX) {
            return (<div>Loading...</div>);
        }

        let cfdata = this.orig_data;
        let columns = this.columns;

        return (
            <CXContext.Provider
                value={{
                    ndx: cfdata,
                    columns: columns,
                    addGroupBy: (groupBy) => { this.addGroupBy(groupBy) },
                }}>
                <div ref={this.parent}>
                    {this.props.children}
                </div>
            </CXContext.Provider>
        );
    }
}
