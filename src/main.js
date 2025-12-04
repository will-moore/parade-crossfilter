
import '../public/style.css';

import { coordinator, makeClient, Selection, DuckDBWASMConnector } from '@uwdata/mosaic-core';
import { loadCSV, count, Query } from '@uwdata/mosaic-sql';
import * as vg from '@uwdata/vgplot';

import { scatterPlot, histogram, barChart } from "./plots.js";
import { thumbnailClient } from "./thumbnails.js";
import { rightPanel } from "./rightpanel.js";

const wasm = new DuckDBWASMConnector({ log: false });
coordinator().databaseConnector(wasm);

const $range = Selection.crossfilter();
const $click = Selection.intersect();
const $range2 = Selection.single();
const $range3 = Selection.intersect({ include: $range });
// const $query = Selection.crossfilter({ include: [$range] }); //!

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
function escapeRe(s) {
  // escape all regex metacharacters
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Once we've loaded the table, hide loading message and show controls...
document.getElementById("loading").style.display = "none";
document.getElementById("content").classList.remove("hidden");
document.getElementById("controls").classList.remove("hidden");
document.getElementById("addPlotDialog").togglePopover();

// ---------- UI roots ----------
const controlsRow = document.createElement("div");
controlsRow.style.display = "flex";
controlsRow.style.gap = "8px";
controlsRow.style.alignItems = "center";

const label = document.createElement("label");
label.textContent = "Search column:";
label.setAttribute("for", "search-col");

const select = document.createElement("select");
select.id = "search-col";
select.style.padding = "4px";

// Where the vg.search control will be mounted
const searchMount = document.createElement("span");

// Populate dropdown from your discovered string columns
function populateOptions(cols) {
  select.innerHTML = "";
  cols.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

// Build (or rebuild) the search widget for a given column

function mountSearch(col, delayMs = 750) {
  // reset only the search selection
  $range.reset();
  searchMount.replaceChildren();
  if (!col) return;

  // visible vg.search control
  const ctl = vg.search({
    label: `Search in ${col}`,
    as: $range,           // <- dedicated search selection
    from: TABLE_NAME,
    column: col,
    type: "regexp",
    filterBy: $range      // optional: scope search within current crossfilter
  });
  searchMount.appendChild(ctl);

  // find the input (vg.search uses Shadow DOM)
  const root  = ctl.shadowRoot || ctl;
  const input = root.querySelector('input[type="search"], input');
  if (!input) return;

  let t, composing = false;

  const apply = () => {
    const raw = input.value.trim();
    const looksLikeRegex = /[\^\$\.\*\+\?\|\(\)\[\]\\]/.test(raw);
    const pattern = looksLikeRegex ? raw : (raw ? `^${escapeRe(raw)}$` : "");
    if (pattern !== raw) {
      input.value = pattern;
      // notify vg.search so it updates $query
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const debouncedApply = () => {
    clearTimeout(t);
    t = setTimeout(apply, delayMs);
  };

  // IME-friendly: wait until composition ends
  input.addEventListener("compositionstart", () => { composing = true; });
  input.addEventListener("compositionend",   () => { composing = false; apply(); });

  // debounce while typing
  input.addEventListener("input", () => { if (!composing) debouncedApply(); });

  // commit immediately on Enter or when leaving the field
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") apply(); });
  input.addEventListener("blur", apply);
}

// Wire dropdown change
select.addEventListener("change", e => mountSearch(e.target.value));

// Assemble controls
controlsRow.appendChild(label);
controlsRow.appendChild(select);
controlsRow.appendChild(searchMount);

// Attach to page (or wherever your controls live)
(document.getElementById("controls") || document.body).appendChild(controlsRow);

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
  selection: $range,
  prepare: async () => {
    // We setup the <select> elements with column names...
    coord.query("describe " + TABLE_NAME).then((data) => {
      let col_info = data.toArray();
      console.log("col_info", col_info);
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
      let number_col_names = col_info.filter(d => d.column_type === "BIGINT").map(d => d.column_name).sort(collator.compare);
      let string_col_names = col_info.filter(d => d.column_type === "VARCHAR").map(d => d.column_name).sort(collator.compare);
      console.log("string_col_names", string_col_names);
      populateSelectElement("xaxis", number_col_names);
      populateSelectElement("yaxis", number_col_names);
      populateSelectElement("histogramAxis", number_col_names);
      populateSelectElement("stringCols", string_col_names);

      populateOptions(string_col_names);
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
    scatterPlot(TABLE_NAME, $range, $range3, xaxis, yaxis, PLOT_W, PLOT_H, plotId)
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
    barChart(TABLE_NAME, $range, $click, $range2, yaxis, PLOT_W, PLOT_H, plotId)
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
