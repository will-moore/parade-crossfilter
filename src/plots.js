import * as vg from "@uwdata/vgplot";


export function scatterPlot(
  table_name,
  selection,
  range3,
  xaxis,
  yaxis,
  width,
  height,
  plotId
) {
  return vg.plot(
    vg.dot(vg.from(table_name, ), {
      x: xaxis,
      y: yaxis,
      tip: true,
      fill: "steelblue",
      fillOpacity: 0.8,
      r: 2,
    }),
    vg.highlight({by: range3, opacity: 0.1, fill: "grey", r: 3}),
    // vg.highlight({by: selection, opacity: 0.1, fill: "grey", r: 3}),
    // vg.intervalXY({ as: range3 }),
    vg.intervalXY({ as: selection }),
    vg.xyDomain(vg.Fixed),
    vg.width(width),
    vg.height(height),
    vg.style({ id: plotId }),
  );
}

export function histogram(table_name, selection, xaxis, width, height, plotId) {
  return vg.plot(
    vg.rectY(vg.from(table_name), {
      x: vg.bin(xaxis),
      y: vg.count(),
      fill: "#ccc",
      fillOpacity: 0.2,
      insetLeft: 0.5,
      insetRight: 0.5,
    }),
    vg.rectY(vg.from(table_name, { filterBy: selection }), {
      x: vg.bin(xaxis),
      y: vg.count(),
      fill: "darkorange",
      insetLeft: 0.5,
      insetRight: 0.5,
    }),
    vg.intervalX({ as: selection }),
    // vg.highlight({ by: selection, fill: "#ccc", fillOpacity: 0.2 }),
    vg.xDomain(vg.Fixed),
    vg.yDomain(vg.Fixed),
    vg.xLabel(xaxis),
    vg.xLabelAnchor("center"),
    vg.width(width),
    vg.height(height),
    vg.style({ id: plotId })
  );
}

export function barChart(table_name, selection, $click, selection2, yaxis, width, height, plotId) {

  return vg.plot(
     // This rule is just there to be able to click-expand the x-axis
     // It was tied to the highlight, but that's not clickable if the bar is too small
    //  vg.ruleY(
    //   vg.from(table_name),                    
    //   {
    //     y: yaxis,
    //     stroke: "black",
    //     strokeWidth: 250,                     
    //     strokeOpacity: 0.00001,                
    //     pointerEvents: "stroke"               
    //   }
    // ),
    // vg.toggleY({ as: selection2 }),
    vg.barX(
      vg.from(table_name, {filterBy: selection2}),
      {x: vg.count(), y: yaxis, fill: "#ccc", fillOpacity: 0.2}
    ),
    vg.panZoomX({ as: selection2}),
    vg.barX(
      vg.from(table_name, {filterBy: selection}),
      {
        x: vg.count(),
        y: yaxis,
        fill: "darkgreen",
        sort: {y: "-x", limit: 20}
      }
    ),
    // vg.toggleY({ as: selection2 }),
    vg.toggleY({ as: selection }),
    vg.toggleY({as: $click}),
    vg.highlight({by: $click, opacity: 0.1, fill: "grey", r: 3}),
    // vg.xDomain(vg.Fixed),
    // vg.yDomain(vg.Fixed),
    vg.xLabel("Count"),
    vg.yLabel(yaxis),
    vg.yLabelAnchor("top"),
    vg.marginTop(15),
    vg.width(width),
    vg.height(height),
    vg.style({ id: plotId })
  )
}
