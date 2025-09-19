import {
  coordinator as defaultCoordinator,
  makeClient,
} from "@uwdata/mosaic-core";
import { Query } from "@uwdata/mosaic-sql";
import { Param } from "@uwdata/mosaic-core";

import * as omezarr from "https://cdn.jsdelivr.net/npm/ome-zarr.js@latest/+esm";

const selectedImages = Param.array([]);

export function thumbnailClient(elementId, selection, table_name) {

  // Store the current set of table rows from the last query...
  let queryRows = [];

  // Setup toggle between table and thumbnail view...
  document.getElementById("tableView").onclick = () => {
    document.getElementById("table").classList.remove("hide");
    document.getElementById("thumbnails").classList.add("hide");
  };
  document.getElementById("thumbnailView").onclick = () => {
    document.getElementById("table").classList.add("hide");
    document.getElementById("thumbnails").classList.remove("hide");
    renderThumbnails();
  };

  // listen to clicks on thumbnails container...
  document.getElementById(elementId).onclick = (event) => {
    let target = event.target;
    console.log("clicked", target);
    if (target.tagName === "IMG") {
      let url = target.id;
      if (selectedImages.value.includes(url)) {
        selectedImages.update(selectedImages.value.filter((d) => d !== url));
        target.classList.remove("selected");
      } else {
        selectedImages.update([...selectedImages.value, url]);
        target.classList.add("selected");
      }
      console.log("selectedImages", selectedImages.value);
    }
  };

  function renderThumbnails() {
    if (document.getElementById("thumbnails").classList.contains("hide")) {
      console.log("thumbnails hide, not rendering");
      return;
    }
    let rows = queryRows.slice(0, 100); // limit to first 100 for now...
    let html = rows.map(row => `<div class="thumb spinner"><img id="${row["File Path"]}" alt="thumbnail" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" /></div >`).join('');
    document.getElementById(elementId).innerHTML = html;

    rows.forEach(row => {
      const target = document.getElementById(row["File Path"]);
      console.log("objserver.observe target", target);
      if (target) {
        observer.observe(target);
      }
    })
  }

  // wrap renderThumbnails in a debounce so we don't call it too often...
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  renderThumbnails = debounce(renderThumbnails, 1000);

  // Setup intersection observer to lazy load thumbnails
  // when they scroll into view...
  const options = {
    root: document.querySelector("#thumbnails"),
    rootMargin: "0px",
    scrollMargin: "0px",
    threshold: 0.1,
  };
  const intersectionCallback = (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        let elem = entry.target;
        let url = elem.id;
        let src = await omezarr.renderThumbnail(url);
        elem.src = src;
        elem.parentElement.classList.remove("spinner");
        observer.unobserve(elem);
      }
    });
  };
  const observer = new IntersectionObserver(intersectionCallback, options);


  // Mosaic client to listen to filter changes and update thumbnails...
  const coordinator = defaultCoordinator();
  makeClient({
    coordinator,
    selection,
    prepare: async () => {
      let urls = await coordinator.query(
        Query.from(table_name).select("File Path")
      );
      console.log("urls", urls.toArray());
    },
    query: (predicate) => {
      return Query.from(table_name).select("File Path").where(predicate);
    },
    queryResult: (data) => {
      document.getElementById("thumbnails").innerHTML = "Loading...";
      queryRows = data.toArray();
      renderThumbnails();
    },
    queryPending: () => {
      // Clear selected images when a new query is pending...
      selectedImages.update([]);
    },
    queryError: () => {
      // There is an error running the query.
    },
  });

  return selectedImages;
}
