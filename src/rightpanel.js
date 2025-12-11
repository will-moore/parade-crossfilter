import {coordinator as defaultCoordinator} from "@uwdata/mosaic-core";
import * as omezarr from "https://cdn.jsdelivr.net/npm/ome-zarr.js@latest/+esm";

const coordinator = defaultCoordinator();

export function rightPanel(selectedImagesParam, elementId, table_name) {
  selectedImagesParam.addEventListener("value", () => {
    console.log("rightPanel selectedImages changed", selectedImagesParam.value);
    const container = document.getElementById(elementId);
    if (selectedImagesParam.value.length === 0) {
      container.innerHTML = "No images selected";
      return;
    } else if (selectedImagesParam.value.length > 1) {
      container.innerHTML = `${selectedImagesParam.value.length} images selected`;
      return;
    }

    // NB: we *assume* the "File Path" column is unique.
    // TODO: add an ID column to the table and use that instead.
    let filePath = selectedImagesParam.value[0];
    let query = `select * from ${table_name} where "File Path" = '${filePath}'`;
    console.log("rightPanel query", query);
    coordinator.query(query).then((data) => {
      let rows = data.toArray();
      console.log("rightPanel query result", rows);

      let html = Object.entries(rows[0]).map(([key, value]) => {
        return `<div class="detail">
          <p><strong>${key}:</strong>
          ${value}</p>
        </div>`;
      }).join('');
      container.innerHTML = `
        <div id='details' style='height: 200px'>
        <img id="preview" alt="preview"
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        ${html}
        </div>`;

      omezarr.renderThumbnail(filePath, 350).then((src) => {
        document.getElementById("preview").src = src;
      });
    });
  });
}
