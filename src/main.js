
import { coordinator, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

// import { makeClient } from "@uwdata/mosaic-core";
// import { count, Query } from "@uwdata/mosaic-sql";

import { scatterPlot, histogram } from "./plots.js";

const wasm = new DuckDBWASMConnector({ log: false });
coordinator().databaseConnector(wasm);

let selection = Selection.intersect();

const TABLE_URL = `https://raw.githubusercontent.com/will-moore/ome2024-ngff-challenge/refs/heads/biofile_finder_csvs/samples/idr0010_images_bff.csv`;
// const TABLE_URL = `${window.location}idr0010.csv`

// Hardcoded column names for now...
const NUM_COLS = ["Cell Count", "53BP1 foci", "Foci Per Cell", "Foci Per Cell (Normalized)"];
const STR_COLS = ["Plate Name", "Term Source 2 Accession"]


const TABLE_NAME = "my_table";
const PLOT_W = 500;
const PLOT_H = 300;

await vg.coordinator().exec([
  // NB: your URL must be like "http://localhost:5173/"
  // loadCSV(TABLE_NAME, `${window.location}omero_table.csv`)
  loadCSV(TABLE_NAME, TABLE_URL)
]);

// Once we've loaded the table, hide loading message and show controls...
document.getElementById("loading").style.display = "none";
document.getElementById("plots").classList.remove("hidden");
document.getElementById("table").classList.remove("hidden");
document.getElementById("controls").classList.remove("hidden");

// Trying to get table columns, but this returns empty array...
// wasm.query("DESCRIBE my_table").then(res => console.log("describe my_table", res));

// When picking X and Y axes, we need to clear selection
function populateSelectElement(id, values) {
  let select = document.getElementById(id);
  values.forEach(v => {
    let option = document.createElement("option");
    option.value = v;
    option.text = v;
    select.appendChild(option);
  });
}

populateSelectElement("xaxis", NUM_COLS);
populateSelectElement("yaxis", NUM_COLS);

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
//     });

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

document.getElementById("addPlot").onclick = () => {
  let xaxis = document.getElementById("xaxis").value;
  let yaxis = document.getElementById("yaxis").value;
  let panel = document.createElement("div");
  panel.className = "panel";
  document.getElementById("plots").appendChild(panel);
  panel.append(
    scatterPlot(TABLE_NAME, selection, xaxis, yaxis, PLOT_W, PLOT_H)
  );
}

document.getElementById("addHistogram").onclick = () => {
  let xaxis = document.getElementById("xaxis").value;
  let panel = document.createElement("div");
  panel.className = "panel";
  document.getElementById("plots").appendChild(panel);
  panel.append(
    histogram(TABLE_NAME, selection, xaxis, PLOT_W, PLOT_H)
  );
}

// Add the table immediately...
document.getElementById("table").replaceChildren(
  // as: selection - filters on mouseover, not click
  vg.table({from: TABLE_NAME, filterBy: selection, height: 300, width: 2000})
);
