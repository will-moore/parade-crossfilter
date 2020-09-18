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
        this.state = { loading: false, hasNDX: false, groupBy: [] };
    }

    addGroupBy(colname) {

        let g = groupCrossfilterData(this.orig_data, this.columns, colname);
        this.orig_data = crossfilter(g.data);
        this.columns = g.columns;

        // Hack! to force all Children to re-render with new crossfilter(grouped)
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

    loadData(toLoad) {

        this.setState({ loading: true });

        // Need to wrap the await below in async function
        const fetchData = async () => {

            let { datasetsInfo, annData } = await loadDatasetsAndAnnotations(toLoad);

            if (toLoad.csvFiles && toLoad.csvFiles.length > 0) {
                // Load CSV files etc...
                let annId = toLoad.csvFiles[0];
                let url = window.OMEROWEB_INDEX + `webclient/annotation/${annId}`;
                // Load csv file, then process csv (and datasetInfo)
                fetchText(url, csvText => {
                    this.initCrossfilter(d3.csvParse(csvText), datasetsInfo, annData);
                });
            } else {
                this.initCrossfilter(undefined, datasetsInfo, annData);
            }
        };

        // Call async function, but don't wait on it
        fetchData();

    }

    render() {

        let context = {
            setDataToLoad: (toLoad) => { this.loadData(toLoad) },
            ndx: undefined,
            columns: [],
            addGroupBy: (groupBy) => { this.addGroupBy(groupBy) },
        }

        if (this.state.hasNDX) {
            context.ndx = this.orig_data;
            context.columns = this.columns;
        }

        return (
            <CXContext.Provider
                value={context}>
                <div ref={this.parent}>
                    {this.props.children}
                </div>
            </CXContext.Provider>
        );
    }
}
