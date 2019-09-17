import React from 'react';
import DimensionChooser from './DimensionChooser';
import Histogram from './Histogram';

const Filters = () => {

    const [filters, setFilters] = React.useState([]);

    const addFilter = (column) => {
        // Don't add if already used
        if (filters.find(f => f.name === column.name)) return;
        setFilters(filters.concat(column));
    }
    const removeFilter = (name) => {
        // remove matching item
        setFilters(filters.filter(f => f.name !== name));
    }

    return (

        <div className="sidebar-sticky">
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                <span>Filters</span>
            </h6>
            <DimensionChooser addFilter={addFilter} />

            {filters.map(filter => {
                if (filter.type === 'number') {
                    return (
                        <div key={filter.name}>
                            <Histogram dimName={filter.name} removeChart={removeFilter}/>
                        </div>
                    )
                } else {
                    return <div key={filter.name}>
                        {filter.name}
                        {/* <TextFilter dimName={filter.name}
                            removeChart={removeFilter} />
                        <GroupFilter dimName={filter.name}
                            removeChart={removeFilter} /> */}
                    </div>
                }
            })}
        </div>
    )
}

export default Filters
