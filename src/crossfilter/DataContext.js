import React from "react";
// import "./dc.css";
import * as d3 from "d3";
import { fetchText, loadDatasetsAndAnnotations } from "./FetchData";
import { prepCrossfilterData, groupCrossfilterData, getCookie } from "../utils";

import crossfilter from "crossfilter2";

export const CXContext = React.createContext("CXContext");


export class DataContext extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            hasNDX: false,
            selectedIds: [],
            exportedPlotIds: [],
        };
        this.setSelectedIds = this.setSelectedIds.bind(this);
        this.setExportedPlotIds = this.setExportedPlotIds.bind(this);
        this.handleSavePlotImage = this.handleSavePlotImage.bind(this);
    }

    setExportedPlotIds(imageId) {
        let { exportedPlotIds } = this.state;
        this.setState({ ...this.state, exportedPlotIds: [...exportedPlotIds, imageId] });
    }

    setSelectedIds(rowIds) {
        this.setState({ ...this.state, selectedIds: rowIds });
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

            if ((toLoad.csvFiles && toLoad.csvFiles.length > 0) || toLoad.csv) {
                // Load CSV files etc...
                let url;
                if (toLoad.csv) {
                    url = toLoad.csv;
                } else {
                    let annId = toLoad.csvFiles[0];
                    url = window.OMEROWEB_INDEX + `webclient/annotation/${annId}`;
                }
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

    async handleSavePlotImage(dataURI) {
        console.log('context.handleSavePlotImage...')
        const csrftoken = getCookie("csrftoken");
        console.log('csrftoken', csrftoken)
        const saveUrl = `${window.OMEROWEB_INDEX}parade_crossfilter/save_image/`;
        await fetch(saveUrl, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({ data: dataURI }),
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
        }).then(res => res.json())
            .then(data => {
                console.log('data', data);
                const plotId = data.image_id;
                console.log('plotId', plotId);
                this.setExportedPlotIds(plotId);
            });
    }

    render() {

        console.log('DataContext.render()', this.state.selectedIds);

        let context = {
            setDataToLoad: (toLoad) => { this.loadData(toLoad) },
            ndx: undefined,
            columns: [],
            addGroupBy: (groupBy) => { this.addGroupBy(groupBy) },
            setSelectedIds: this.setSelectedIds,
            selectedIds: this.state.selectedIds,
            handleSavePlotImage: this.handleSavePlotImage,
            exportedPlotIds: this.state.exportedPlotIds,
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
