import * as vg from "@uwdata/vgplot";

export function scatterPlot(
  table_name,
  selection,
  numberColNames,
  width,
  height,
  plotId
) {
  // https://github.com/uwdata/mosaic/discussions/374
  const numberCols = numberColNames.map(d => ({label: d, value: vg.column(d)}));
  const $x = vg.Param.value(numberCols[0]);
  const $y = vg.Param.value(numberCols[1]);
  return vg.vconcat(
    vg.hconcat(
      vg.menu({ label: "X-axis", as: $x, options: numberCols }),
      vg.menu({ label: "Y-axis", as: $y, options: numberCols }),
    ),
    vg.plot(
      vg.dot(vg.from(table_name, { filterBy: selection }), {
        x: vg.sql`${$x}`,
        y: vg.sql`${$y}`,
        tip: true,
        fill: "steelblue",
        fillOpacity: 0.8,
        r: 2,
      }),
      vg.intervalXY({ as: selection }),
      // vg.xyDomain(vg.Fixed),
      vg.width(width),
      vg.height(height),
      vg.style({ id: plotId }),
    )
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
