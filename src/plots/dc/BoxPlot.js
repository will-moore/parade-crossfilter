import React from "react";
import * as dc from "dc";
import * as d3 from "d3";
import { CXContext } from "../crossfilter/DataContext";

const scatterPlotFunction = (divRef, ndx, xAxis, yAxis) => {

    var x = ndx.dimension(function(d) {return d[xAxis] });
    // var max_value = x.top(1)[0][xAxis];
    // var min_value = x.bottom(1)[0][xAxis];

    // var scatterDim = ndx.dimension(function(d) {return [d[xAxis], d[yAxis]];});
    // var sumGroup = scatterDim.group()
    var yGroup = x.group().reduce(
        function(p,v) {
          // keep array sorted for efficiency
          p.splice(d3.bisectLeft(p, v[yAxis]), 0, v[yAxis]);
          return p;
        },
        function(p,v) {
          p.splice(d3.bisectLeft(p, v[yAxis]), 1);
          return p;
        },
        function() {
          return [];
        }
    );

    return dc.boxPlot(divRef)
        .width(500)
        .height(250)
        .margins({top:10,bottom:30,right:20,left:50})
        .dimension(x)
        .group(yGroup)
        .xAxisLabel(xAxis)
        .yAxisLabel(yAxis)
        .elasticY(true);
}


const BoxPlot = props => {
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
    boxSizing:'border-box',
    padding: 10,
  }
  return (
    <div
      ref={div}
      style={chartStyles}
    >
    </div>
  );
};

export default BoxPlot;
