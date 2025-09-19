
import '../public/style.css';

import { coordinator, makeClient, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV, count, Query } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

import { scatterPlot, histogram, barChart } from "./plots.js";
import { thumbnailClient } from "./thumbnails.js";
import { rightPanel } from "./rightpanel.js";

const wasm = new DuckDBWASMConnector({ log: false });
coordinator().databaseConnector(wasm);

let selection = Selection.intersect();

const TABLE_URL = `https://raw.githubusercontent.com/will-moore/ome2024-ngff-challenge/refs/heads/biofile_finder_csvs/samples/idr0010_images_bff.csv`;
// const TABLE_URL = `${window.location}idr0010.csv`

// Hardcoded column names for now...
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
document.getElementById("content").classList.remove("hidden");
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

// Create the thumbnail client, which returns the selectedImages param for the right panel...
const selectedImagesParam = thumbnailClient("thumbnails", selection, TABLE_NAME);
rightPanel(selectedImagesParam, "sidebar", TABLE_NAME);


// Create a "client" to display filtered count/total count...
// (and setup the column select elements)
const coord = coordinator();
makeClient({
  coordinator: coord,
  selection,
  prepare: async () => {

    // We setup the <select> elements with column names...
    coord.query("describe " + TABLE_NAME).then((data) => {
      let col_info = data.toArray();
      console.log("col_info", col_info);
      let number_col_names = col_info.filter(d => d.column_type === "BIGINT").map(d => d.column_name);
      let string_col_names = col_info.filter(d => d.column_type === "VARCHAR").map(d => d.column_name);
      populateSelectElement("xaxis", number_col_names);
      populateSelectElement("yaxis", number_col_names);
      populateSelectElement("stringCols", string_col_names);
    });
    // Also get the total count of rows...
    let result = await coord.query(
      Query.from(TABLE_NAME).select({ count: count() })
    );
    let totalCount = result.get(0).count;
    document.getElementById("totalCount").innerText = totalCount;
  },
  query: (predicate) => {
    // Returns a query to retrieve the data.
    // The `predicate` is the selection's predicate for this client.
    // Here we use it to get the filtered count.
    return Query.from(TABLE_NAME)
      .select({ count: count() })
      .where(predicate);
  },
  queryResult: (data) => {
    // The query result is available. Show at top of UI.
    let filteredCount = data.get(0).count;
    document.getElementById("filteredCount").innerText = filteredCount;
  },
  queryPending: () => {
    // console.log("queryPending");
    // The query is pending.
  },
  queryError: () => {
    // There is an error running the query.
  },
});


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

document.getElementById("addBarChart").onclick = () => {
  let yaxis = document.getElementById("stringCols").value;
  let panel = document.createElement("div");
  let plotId = `bar-chart-${Date.now()}`;
  panel.className = "panel";
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">X</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    barChart(TABLE_NAME, selection, yaxis, PLOT_W, PLOT_H, plotId)
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
