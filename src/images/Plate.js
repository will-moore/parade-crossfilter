
import React, {useEffect, useState} from "react";
import { CXContext } from "../crossfilter/DataContext";
import Well from './Well';

const Plate = ({plate, filteredIds}) => {

    const[wells, setWells] = useState([]);
    const [crossFilterData, setData] = React.useState([]);
    const context = React.useContext(CXContext);
    const ndx = context.ndx;

    React.useEffect(() => {
        console.log("Plate.js add listeners")
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
        console.log("Plate.js loading wells....")
        let url = window.OMEROWEB_INDEX + `api/v0/m/plates/${ plate.id }/wells/`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                console.log('wells', data);
                setWells(data.data);
            });
    }, [plate]);

    // Sort Wells into grid... (2D dict, instead of 2D array)
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
    for (let i=0; i<crossFilterData.length; i++) {
        let row = crossFilterData[i];
        let wellId = row.Well;
        if (wellId) {
            if (!wellData[wellId]){
                wellData[wellId] = [];
            }
            wellData[wellId].push(row);
        }
    }

    let grid = []; 
    for (let row = 0; row<=maxRow; row++) {
        let wells = [];
        for (let col=0; col<=maxCol; col++) {
            if (gridDict[row] && gridDict[row][col]) {
                wells.push(gridDict[row][col]);
            } else {
                wells.push({'@id': row});
            }
        }
        grid.push(wells);
    }

    return (
        <div>
            <div>{plate.Name} ({wells.length}) </div>

            <table className="plateGrid">
                <tbody>
                {
                    grid.map(row => (
                        <tr key={row[0]['@id']}>
                            {
                                row.map(well => (
                                    <td key={well['@id']}>
                                        <Well
                                            well={well}
                                            rows={wellData[well['@id']]} />
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
