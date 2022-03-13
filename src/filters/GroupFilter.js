import React from "react";
import * as dc from "dc";
import { CXContext } from "../crossfilter/DataContext";

const GroupFilter = props => {

    const context = React.useContext(CXContext);
    const ndx = context.ndx;
    const div = React.useRef(null);
    const { dimName } = props;

    const dimension = ndx.dimension(function (d) { return d[dimName]; });
    const group = dimension.group();
    const size = group.size();

    React.useEffect(() => {
        if (group.size() > 12) {
            // Too many items to show in bar chart. Don't create chart.
            return;
        }
        const chart = dc.rowChart(div.current);
        chart.dimension(dimension).group(group);
        chart.render();

        // Specify how to clean up after this effect:
        return () => {
            chart.dimension().dispose();
            dc.redrawAll();
        };
    }, [dimension, group]);

    const chartStyles = {
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        padding: 0,
        position: 'relative',
    }
    return (
        <div
            ref={div}
            style={chartStyles}
        >
            {/* placeholder text, replaced by chart IF we render it */}
            <div style={{ color: '#666' }}>Group size: {size}</div>

        </div>
    );
}

export default GroupFilter;
