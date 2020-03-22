import React from "react";
import WellSample from "./WellSample";

const Well = ({well, showFields, rows, heatmap, heatmapMin, heatmapMax}) => {
    // well - api json for Well
    // showFields? - Do we show individual fields for the Well
    // rows - crossfilter rows that match this Well ID

    const getHeatmapColor = (rows) => {
        if (rows.length === 0 || heatmap === '--') return 'rgba(1,1,1,1)';
        let vals = rows.map(r => r[heatmap]).filter(v => !isNaN(v));
        let sum = vals.reduce((prev, val) => prev + val, 0);
        let avg = sum / vals.length;

        let fraction = (avg - heatmapMin) / (heatmapMax - heatmapMin);
        var red = 0,
            green = 0,
            blue = 0,
            alpha = 1;
        if (fraction > 0.5) {
            red = parseInt(256 * (fraction - 0.5) * 2);
        }
        if (fraction < 0.5) {
            green = parseInt((0.5 - fraction) * 2 * 256);
        }
        return "rgba(" + [red, green, blue, alpha].join(",") + ")";
    }

    // heatmap
    // if NOT showing seperate Fields, we need average value for heatmap
    if (!showFields) {
        return (
            <WellSample
                wellSample={well['WellSamples'][0]}
                rows={rows}
                color={getHeatmapColor(rows)}
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
                            color={getHeatmapColor(fields[ws['Image']['@id']] || [])}
                        />
                    ))
                }
            </React.Fragment>
        )
    }
}

export default Well;
