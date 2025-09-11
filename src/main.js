
import { coordinator, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

const wasm = new DuckDBWASMConnector({ log: false });
coordinator().databaseConnector(wasm);

const selection = Selection.intersect();

await vg.coordinator().exec([
  loadCSV("my_table", `${window.location}omero_table.csv`)
]);

// Trying to get table columns, but this returns empty array...
wasm.query("DESCRIBE my_table").then(res => console.log("describe my_table", res));

// When picking X and Y axes, we need to clear selection
document.getElementById("xaxis").addEventListener("change", updatePlot);
document.getElementById("yaxis").addEventListener("change", updatePlot);

// Dynamic plot uses selected X and Y axes
function updatePlot() {
  const xaxis = document.getElementById("xaxis").value;
  const yaxis = document.getElementById("yaxis").value;
  document.getElementById("plot").replaceChildren(
    vg.plot(
      vg.dot(
        vg.from("my_table", { filterBy: selection }),
        {x: xaxis, y: yaxis, tip: true, fill: "steelblue", fillOpacity: 0.8, r: 2}
      ),
      vg.intervalX({ as: selection }),
      vg.xyDomain(vg.Fixed),
      vg.width(500),
      vg.height(300)
    )
  )
}
updatePlot();

// Another plot - static axes
document.getElementById("plot2").replaceChildren(
  vg.plot(
    vg.dot(
      vg.from("my_table", { filterBy: selection }),
      {x: "Major_Axis_Length", y: "Longest_Extension", tip: true, fill: "darkorange", fillOpacity: 0.8, r: 2}
    ),
    vg.intervalX({ as: selection }),
    vg.xyDomain(vg.Fixed),
    vg.width(500),
    vg.height(300)
  )
)

document.getElementById("table").replaceChildren(
  // as: selection - filters on mouseover, not click
  vg.table({from: "my_table", filterBy: selection, height: 300, width: 1000})
);
