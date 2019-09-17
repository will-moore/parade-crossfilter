import React from "react";
import * as dc from "dc";
import {scaleLinear } from "d3";
import { ChartTemplate } from "./ChartTemplate";

const histogramFunc = (divRef, ndx, dimName) => {

    var x = ndx.dimension(function(d) {return d[dimName];});
    var max_value = x.top(1)[0][dimName];
    var min_value = x.bottom(1)[0][dimName];

    var value_range = max_value-min_value;
    // create histogram: group values to `number_of_bins` bins
    var number_of_bins = 20;
    var bin_width = value_range/number_of_bins;
    var x_grouped = x.group(d => Math.floor(d/bin_width)*bin_width);
    // generate chart
    var histogram = dc.barChart(divRef);
    histogram.dimension(x)
        .group(x_grouped)
        .x(scaleLinear().domain([min_value,max_value]))
        .xUnits(function(){return number_of_bins})
        .centerBar(true)
        .elasticY(true)
        .xAxis();

    return histogram;
}

const Histogram = props => (
    <ChartTemplate
        chartFunction={histogramFunc}
        title={props.dimName}
        dimName={props.dimName}
        removeChart={props.removeChart}
    />
)

export default Histogram;
