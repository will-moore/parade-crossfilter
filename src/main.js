
import { coordinator, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

// import { makeClient, MosaicClient } from "@uwdata/mosaic-core";
// import { count, Query } from "@uwdata/mosaic-sql";

const wasm = new DuckDBWASMConnector({ log: false });
coordinator().databaseConnector(wasm);

let selection = Selection.intersect();

await vg.coordinator().exec([
  loadCSV("my_table", `${window.location}omero_table.csv`)
  // loadCSV("my_table", `https://raw.githubusercontent.com/will-moore/ome2024-ngff-challenge/refs/heads/biofile_finder_csvs/samples/idr0010_images_bff.csv`)
]);

// Trying to get table columns, but this returns empty array...
wasm.query("DESCRIBE my_table").then(res => console.log("describe my_table", res));

// When picking X and Y axes, we need to clear selection
document.getElementById("xaxis").addEventListener("change", updatePlot);
document.getElementById("yaxis").addEventListener("change", updatePlot);

// class MyClient extends MosaicClient {

//   async prepare(p) {
//     console.log("prepare", p);
//     // Preparation work before the client starts.
//     // Here we get the total number of rows in the table.
//     let result = await coordinator().query(
//       Query.from("my_table").select({ count: count() })
//     );
//     this.totalCount = result.get(0).count;
//     console.log("totalCount", this.totalCount);
//   }

//   async fieldInfo(info) {
//     // Return information about the fields in the table.
//     console.log("fieldInfo", info);
//   }
// }

// let client = new MyClient(selection);

// let client = makeClient({
//       coordinator,
//       selection,
//       prepare: async () => {
//         // Preparation work before the client starts.
//         // Here we get the total number of rows in the table.
//         let result = await coordinator.query(
//           Query.from("my_table").select({ count: count() })
//         );
//         totalCount = result.get(0).count;
//         console.log("totalCount", totalCount);
//       },

//       fieldInfo: async (info) => {
//         // Return information about the fields in the table.
//         console.log("fieldInfo", info);
//       }
    // });

// function clearSelection(plotId) {
//   console.log("selection", selection);
//   if (!selection._value) return;
//   const values = selection._value.filter(s => {
//     console.log(s.source.mark.plot.attributes.style);
//     return s.source.mark.plot.attributes.style.id === plotId;
//   })
//   console.log('clearSelection source', values, values.length, values[0]);
//   if (values.length > 0) {
//     selection = selection.remove(values[0].source);
//   }
// }

// Dynamic plot uses selected X and Y axes
function updatePlot() {
  // clearSelection("plot");

  let xaxis = document.getElementById("xaxis").value;
  let yaxis = document.getElementById("yaxis").value;
  // xaxis = "53BP1 foci"
  // yaxis = "Cell Count"
  document.getElementById("plot").replaceChildren(
    vg.plot(
      vg.dot(
        vg.from("my_table", { filterBy: selection }),
        {x: xaxis, y: yaxis, tip: true, fill: "steelblue", fillOpacity: 0.8, r: 2}
      ),
      vg.intervalXY({ as: selection }),
      vg.xyDomain(vg.Fixed),
      vg.width(500),
      vg.height(300),
      vg.style({"id": "plot"})
    )
  )
}
updatePlot();

let xbin = document.getElementById("xaxis").value;
// Another plot - static axes
// document.getElementById("plot2").replaceChildren(
//   vg.plot(
//     vg.dot(
//       vg.from("my_table", { filterBy: selection }),
//       {x: "Cell Count", y: "53BP1 foci", tip: true, fill: "darkorange", fillOpacity: 0.8, r: 2}
//     ),
//     vg.intervalX({ as: selection }),
//     vg.xyDomain(vg.Fixed),
//     vg.width(500),
//     vg.height(300)
//   )
// )

document.getElementById("plot2").replaceChildren(
  vg.plot(
    vg.rectY(
      vg.from("my_table", {filterBy: selection}),
      {
        x: vg.bin(xbin),
        y: vg.count(),
        fill: "darkorange",
        insetLeft: 0.5,
        insetRight: 0.5
      }
    ),
    vg.intervalX({as: selection}),
    vg.xDomain(vg.Fixed),
    vg.xLabel(xbin),
    vg.xLabelAnchor("center"),
    // vg.yTickFormat("s"),
    vg.width(500),
    vg.height(300)
  )
)

document.getElementById("table").replaceChildren(
  // as: selection - filters on mouseover, not click
  vg.table({from: "my_table", filterBy: selection, height: 300, width: 1000})
);
