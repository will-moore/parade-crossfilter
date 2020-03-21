import React from "react";
import WellSample from "./WellSample";

const Well = ({well, showFields, rows}) => {
    // well - api json for Well
    // showFields? - Do we show individual fields for the Well
    // rows - crossfilter rows that match this Well ID


    if (!showFields) {
        return (
            <WellSample
                wellSample={well['WellSamples'][0]}
                rows={rows}
            />
        )
    } else {
        // need to group rows by Image ID
        let fields = {};
        if (rows) {
            for (let r=0; r<rows.length; r++) {
                let row=rows[r];
                if (!fields[row.Image]) {
                    fields[row.Image] = [];
                }
                fields[row.Image].push(row);
            }
        }

        return (
            <React.Fragment>
                {
                    well['WellSamples'].map(ws => (
                        <WellSample
                            key={ws['Image']['@id']}
                            wellSample={ws}
                            rows={fields[ws['Image']['@id']] || []}
                        />
                    ))
                }
            </React.Fragment>
        )
    }
}

export default Well;
