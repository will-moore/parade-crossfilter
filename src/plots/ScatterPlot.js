import React from "react";
import * as dc from "dc";
import {scaleLinear } from "d3";
import { CXContext } from "../crossfilter/DataContext";

const scatterPlotFunction = (divRef, ndx, xAxis, yAxis) => {

    var x = ndx.dimension(function(d) {return d[xAxis] });
    var max_value = x.top(1)[0][xAxis];
    var min_value = x.bottom(1)[0][xAxis];

    var scatterDim = ndx.dimension(function(d) {return [d[xAxis], d[yAxis]];});
    var sumGroup = scatterDim.group()    

    // https://stackoverflow.com/questions/47994241/dc-js-scatter-plot-and-elasticy-behavior
    function remove_empty_bins(source_group) {
        return {
            all: function () {
                return source_group.all().filter(function(d) {
                    return Math.abs(d.value) > 0.00001; // if using floating-point numbers
                    // return d.value !== 0; // if integers only
                });
            }
        };
    }

    var scatter1 = dc.scatterPlot(divRef)
        .width(500)
        .height(250)
        .margins({top:10,bottom:30,right:20,left:50})
        .dimension(scatterDim)
        .group(remove_empty_bins(sumGroup))
        .symbolSize(5)
        .clipPadding(10)
        .xAxisLabel(xAxis)
        .yAxisLabel(yAxis)
        .excludedOpacity(0.5)
        .elasticY(true)
        .elasticX(true)
        .transitionDuration(0)
        .x(scaleLinear().domain([min_value,max_value]));
    return scatter1;
}


const ScatterPlot = props => {
    /*
    We render the dc chart using an effect. We want to pass the chart as a prop after the dc call,
    but there is nothing by default to trigger a re-render and the prop, by default would be undefined.
    To solve this, we hold a state key and increment it after the effect ran. 
    By passing the key to the parent div, we get a rerender once the chart is defined. 
    */
  const context = React.useContext(CXContext);
  const ndx = context.ndx;
  const div = React.useRef(null);
  React.useEffect(() => {
    const newChart = scatterPlotFunction(div.current, ndx, props.xAxis, props.yAxis); // chartfunction takes the ref and does something with it

    newChart.render();

    // Specify how to clean up after this effect:
    return () => {
      newChart.dimension().dispose();
      dc.redrawAll();
    };
  }, [props.xAxis, props.yAxis]);

  const chartStyles  = {
    width:'100%',
    height:'100%',
    boxsizing:'border-box',
    padding: 10,
  }
  return (
    <div
      ref={div}
      {...chartStyles}
    >
    </div>
  );
};

export default ScatterPlot;
