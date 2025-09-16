
import { coordinator, makeClient, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV, count, Query } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

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

const coord = coordinator();

let client = makeClient({
  coordinator: coord,
  selection,
  prepare: async () => {
    // Preparation work before the client starts.
    // Here we get the total number of rows in the table.
    let result = await coord.query(
      Query.from(TABLE_NAME).select({ count: count() })
    );
    let totalCount = result.get(0).count;
    console.log("totalCount", totalCount);
    document.getElementById("totalCount").innerText = totalCount;
  },

  fieldInfo: async (info) => {
    // Return information about the fields in the table.
    // *** This doesn't seem to be called???
    console.log("fieldInfo", info);
  },
  query: (predicate) => {
    // Returns a query to retrieve the data.
    // The `predicate` is the selection's predicate for this client.
    // Here we use it to get the filtered count.
    console.log("query predicate", predicate);
    return Query.from(TABLE_NAME)
      .select({ count: count() })
      .where(predicate);
  },
  queryResult: (data) => {
    // The query result is available.
    console.log("queryResult data", data);
    let filteredCount = data.get(0).count;
    console.log("filteredCount", filteredCount);
    document.getElementById("filteredCount").innerText = filteredCount;
  },
  queryPending: () => {
    console.log("queryPending");
    // The query is pending.
  },
  queryError: () => {
    // There is an error running the query.
  },
});

console.log("client", client);
console.log("client", client.fieldInfo);


document.getElementById("addPlot").onclick = () => {
  let xaxis = document.getElementById("xaxis").value;
  let yaxis = document.getElementById("yaxis").value;
  let panel = document.createElement("div");
  let plotId = `scatter-plot-${Date.now()}`;
  panel.className = "panel";
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">X</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    scatterPlot(TABLE_NAME, selection, xaxis, yaxis, PLOT_W, PLOT_H, plotId)
  );
}

document.getElementById("addHistogram").onclick = () => {
  let xaxis = document.getElementById("xaxis").value;
  let panel = document.createElement("div");
  let plotId = `histogram-${Date.now()}`;
  panel.className = "panel";
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">X</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    histogram(TABLE_NAME, selection, xaxis, PLOT_W, PLOT_H, plotId)
  );
}

document.getElementById("plots").onclick = (event) => {
  if (event.target.className === "remove") {
    console.log("remove panel selection.clauses", selection.clauses);
    let plotId = event.target.id;
    let toRemove = selection.clauses.filter(c => {
      return c.source.mark.plot.attributes.style.id === plotId;
    })
    console.log("toRemove", toRemove);
    if (toRemove.length > 0) {
      selection.reset(toRemove);
      console.log("new selection", selection.clauses);
    }
    // TODO: remove plot from UI...
  }
}

// Add the table immediately...
document.getElementById("table").replaceChildren(
  // as: selection - filters on mouseover, not click
  vg.table({from: TABLE_NAME, filterBy: selection, height: 300, width: 2000})
);
