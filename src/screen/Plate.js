
import React, { useEffect, useState } from "react";
import { CXContext } from "../crossfilter/DataContext";
import Well from './Well';

const Plate = ({ plate, showFields, heatmap }) => {

    const [wells, setWells] = useState([]);
    const [crossFilterData, setData] = React.useState([]);
    const context = React.useContext(CXContext);
    const selectedIds = context.selectedIds;
    const setSelectedIds = context.setSelectedIds;
    const ndx = context.ndx;

    React.useEffect(() => {
        // Initial load
        setData(ndx.allFiltered());

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, [ndx]);

    useEffect(() => {
        let url = window.OMEROWEB_INDEX + `api/v0/m/plates/${plate.id}/wells/`;
        fetch(url, { mode: 'cors', credentials: 'include' })
            .then(rsp => rsp.json())
            .then(data => {
                setWells(data.data);
            });
    }, [plate]);

    // Sort Wells into grid... (2D dict, instead of array)
    let gridDict = {};
    let maxRow = -1
    let maxCol = -1;
    wells.forEach(well => {
        let row = well.Row;
        let col = well.Column;
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
        if (!gridDict[row]) {
            gridDict[row] = {};
        }
        gridDict[row][col] = well;
    });

    // Sort crossFilterData into {Well_ID: [rows]} so we can find
    // the row(s) we need for each Well
    let wellData = {};
    for (let i = 0; i < crossFilterData.length; i++) {
        let row = crossFilterData[i];
        let wellId = row.Well;
        if (wellId) {
            if (!wellData[wellId]) {
                wellData[wellId] = [];
            }
            wellData[wellId].push(row);
        }
    }

    let grid = [];
    for (let row = 0; row <= maxRow; row++) {
        let wells = [];
        for (let col = 0; col <= maxCol; col++) {
            if (gridDict[row] && gridDict[row][col]) {
                wells.push(gridDict[row][col]);
            } else {
                wells.push({ '@id': row });
            }
        }
        grid.push(wells);
    }

    const selected = function (wellId) {
        let rows = wellData[wellId];
        if (!rows) return false;
        let rowIds = rows.map(r => r._rowID);
        let selected = selectedIds.reduce((prev, id) => {
            return prev || rowIds.indexOf(id) > -1;
        }, false);
        return selected;
    }

    let heatmapMin;
    let heatmapMax;
    if (heatmap !== '--') {
        // get min and max values for 'heatmap' column
        let dim = ndx.dimension(function (d) { return d[heatmap]; });
        if (dim.bottom(1).length > 0) {
            heatmapMin = dim.bottom(1)[0][heatmap];
            heatmapMax = dim.top(1)[0][heatmap];
        }
    }

    return (
        <div>
            <div>{plate.Name} ({wells.length} Wells) </div>

            <table className="plateGrid">
                <tbody>
                    {
                        grid.map(row => (
                            <tr key={row[0]['@id']}>
                                {
                                    row.map(well => (
                                        <td key={well['@id']}
                                            style={{ background: selected(well['@id']) ? 'rgb(177, 179, 244)' : '' }}
                                        >
                                            <Well
                                                well={well}
                                                showFields={showFields}
                                                heatmap={heatmap}
                                                heatmapMin={heatmapMin}
                                                heatmapMax={heatmapMax}
                                                rows={wellData[well['@id']] || []}
                                                selectedIds={selectedIds}
                                                setSelectedIds={setSelectedIds}
                                            />
                                        </td>)
                                    )
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};

export default Plate;
