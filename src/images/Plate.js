
import React, {useEffect, useState} from "react";
import Well from './Well';

const Plate = ({plate, filteredIds}) => {

    const[wells, setWells] = useState([]);

    useEffect(() => {
        // setLoading(true);
        let url = window.OMEROWEB_INDEX + `api/v0/m/plates/${ plate.id }/wells/`;
        fetch(url, {mode: 'cors', credentials: 'include'})
            .then(rsp => rsp.json())
            .then(data => {
                setWells(data.data);
            });
    }, []);

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

    console.log('max', maxRow, maxCol);

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
                                        <Well well={well} filteredIds={filteredIds} />
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
