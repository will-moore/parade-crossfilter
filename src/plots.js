import * as vg from "@uwdata/vgplot";

export function scatterPlot(
  table_name,
  selection,
  xaxis,
  yaxis,
  width,
  height,
  plotId
) {
  return vg.plot(
    vg.dot(vg.from(table_name, { filterBy: selection }), {
      x: xaxis,
      y: yaxis,
      tip: true,
      fill: "steelblue",
      fillOpacity: 0.8,
      r: 2,
    }),
    vg.intervalXY({ as: selection }),
    vg.xyDomain(vg.Fixed),
    vg.width(width),
    vg.height(height),
    vg.style({ id: plotId }),
  );
}

export function histogram(table_name, selection, xaxis, width, height, plotId) {
  return vg.plot(
    vg.rectY(vg.from(table_name, { filterBy: selection }), {
      x: vg.bin(xaxis),
      y: vg.count(),
      fill: "darkorange",
      insetLeft: 0.5,
      insetRight: 0.5,
    }),
    vg.intervalX({ as: selection }),
    vg.xDomain(vg.Fixed),
    vg.xLabel(xaxis),
    vg.xLabelAnchor("center"),
    vg.width(width),
    vg.height(height),
    vg.style({ id: plotId })
  );
}
