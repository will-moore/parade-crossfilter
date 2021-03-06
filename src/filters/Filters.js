import React from 'react';
import DimensionChooser from './DimensionChooser';
import Filter from './Filter';
import FilteredCounter from './FilteredCounter';

const Filters = () => {
    console.log('render Filters')

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

        <div>
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                <span>Filters</span>
                <FilteredCounter />
            </h6>
            <DimensionChooser addFilter={addFilter} />

            <div style={{ padding: 10 }}>

                {filters.map(filter => {
                    return (
                        <Filter key={filter.name}
                            removeFilter={removeFilter}
                            dimType={filter.type}
                            dimName={filter.name}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default Filters
