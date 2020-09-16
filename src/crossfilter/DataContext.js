import React from "react";
// import "./dc.css";
import * as d3 from "d3";
import { fetchText, loadDatasetsAndAnnotations } from "./FetchData";
import { prepCrossfilterData, groupCrossfilterData } from "../utils";

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

        // parse data to know column types etc and
        // cast strings to Numbers etc.
        let { columns, parsedData } = prepCrossfilterData(data, datasetsInfo, annData);

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

            let { datasetsInfo, annData } = await loadDatasetsAndAnnotations(this.toLoad);

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
