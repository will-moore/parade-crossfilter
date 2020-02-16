
import React from "react";
import { CXContext } from "../crossfilter/DataContext";

const Images = ({dtype, objectId}) => {

    const context = React.useContext(CXContext);
    const colNames = context.columns.map(c => c.name);
    const [filteredData, setData] = React.useState([]);
    const ndx = context.ndx;
    React.useEffect(() => {

        var removeListener = ndx.onChange((event) => {
            // Listen for filtering changes and re-render
            setData(ndx.allFiltered());
        });

        // Specify how to clean up after this effect:
        return () => {
            removeListener();
        };
    }, []);

    const getKey = (row) => {
        return context.columns.map(col => row[col]).join("");
    }

    const getImageId = (row) => {
        if (row.Image) return row.Image;
        if (row.image_id) return row.image_id;
    }

    console.log(filteredData.length);

    // src={`${ window.OMEROWEB_INDEX }webclient/render_thumbnail/${ d.image_id }/`} />

    return (
        <table>
            <tbody>
                <tr>
                    {
                        colNames.map(col => (
                            <th key={col} >{col}</th>
                        ))
                    }
                </tr>
                { filteredData.map(row => (
                    <tr key={row.shape_id + row.channel + row.min + row.max}>
                        {
                            colNames.map(col => (
                                <td key={col} >{row[col]}</td>
                            ))
                        }
                    </tr>
                )) }
            </tbody>
        </table>
    );
};

export default Images;
