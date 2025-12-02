
import '../public/style.css';

import { coordinator, makeClient, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV, count, Query } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

import { scatterPlot, histogram, barChart, regressionPlot } from "./plots.js";
import { thumbnailClient } from "./thumbnails.js";
import { rightPanel } from "./rightpanel.js";

const wasm = new DuckDBWASMConnector({ log: false });
coordinator().databaseConnector(wasm);

const $range = Selection.crossfilter();
const $click = Selection.intersect();
const $combined = Selection.intersect();

function recompute() {
  const p1 = $range.predicate();
  const p2 = $click.predicate();
  $combined.setPredicate(p1 ? (p2 ? p1.and(p2) : p1) : (p2 || null));
}
$range.addEventListener("change", recompute);
$click.addEventListener("change", recompute);



const defaultSource = `https://raw.githubusercontent.com/will-moore/ome2024-ngff-challenge/refs/heads/biofile_finder_csvs/samples/idr0010_images_bff.csv`;

// Use ?query parameter "source" to get Table URL...
const params = new URLSearchParams(window.location.search);
const TABLE_URL = params.get("source") || defaultSource;

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
document.getElementById("addPlotDialog").togglePopover();


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
const selectedImagesParam = thumbnailClient("thumbnails", $range, TABLE_NAME);
rightPanel(selectedImagesParam, "sidebar", TABLE_NAME);


// Create a "client" to display filtered count/total count...
// (and setup the column select elements)
const coord = coordinator();
makeClient({
  coordinator: coord,
  $range,
  prepare: async () => {

    // We setup the <select> elements with column names...
    coord.query("describe " + TABLE_NAME).then((data) => {
      let col_info = data.toArray();
      console.log("col_info", col_info);
      let number_col_names = col_info.filter(d => d.column_type === "BIGINT").map(d => d.column_name);
      let string_col_names = col_info.filter(d => d.column_type === "VARCHAR").map(d => d.column_name);
      populateSelectElement("xaxis", number_col_names);
      populateSelectElement("yaxis", number_col_names);
      populateSelectElement("regXaxis", number_col_names);
      populateSelectElement("regYaxis", number_col_names);
      populateSelectElement("histogramAxis", number_col_names);
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
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">×</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    scatterPlot(TABLE_NAME, $range, xaxis, yaxis, PLOT_W, PLOT_H, plotId)
  );
}

document.getElementById("addHistogram").onclick = () => {
  let xaxis = document.getElementById("histogramAxis").value;
  let panel = document.createElement("div");
  let plotId = `histogram-${Date.now()}`;
  panel.className = "panel";
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">×</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    histogram(TABLE_NAME, $range, xaxis, PLOT_W, PLOT_H, plotId)
  );
}

document.getElementById("addBarChart").onclick = () => {
  let yaxis = document.getElementById("stringCols").value;
  let panel = document.createElement("div");
  let plotId = `bar-chart-${Date.now()}`;
  panel.className = "panel";
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">×</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    barChart(TABLE_NAME, $range, $click, yaxis, PLOT_W, PLOT_H, plotId)
  );
}

document.getElementById("addRegressionPlot").onclick = () => {
  let xaxis = document.getElementById("regXaxis").value;
  let yaxis = document.getElementById("regYaxis").value;
  let panel = document.createElement("div");
  let plotId = `regression-plot-${Date.now()}`;
  panel.className = "panel";
  panel.innerHTML = `<button id="${plotId}" class="remove" style="position:absolute;right:5px;top:5px;z-index:10;">×</button>`;
  document.getElementById("plots").appendChild(panel);
  panel.append(
    regressionPlot(TABLE_NAME, $range, xaxis, yaxis, PLOT_W, PLOT_H, plotId)
  );
}

document.getElementById("plots").onclick = (event) => {
  if (event.target.className === "remove") {
    console.log("remove panel selection.clauses", $range.clauses);
    let plotId = event.target.id;
    let toRemove = $range.clauses.filter(c => {
      return c.source.mark.plot.attributes.style.id === plotId;
    })
    console.log("toRemove", toRemove);
    if (toRemove.length > 0) {
      $range.reset(toRemove);
      console.log("new selection", $range.clauses);
    }
    // TODO: remove plot from UI...
    event.target.parentElement.remove();
  }
}

// Add the table immediately...
document.getElementById("table").replaceChildren(
  // as: selection - filters on mouseover, not click
  vg.table({from: TABLE_NAME, filterBy: $range, height: 300, width: 2000})
);
