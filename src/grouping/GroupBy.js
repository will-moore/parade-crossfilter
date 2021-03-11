
import React from 'react';
import GroupByChooser from './GroupByChooser';

const GroupBy = () => {


    return (
        <React.Fragment>
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1">
                <span>Group By</span>
            </h6>

            <GroupByChooser />
        </React.Fragment>
    )
}

export default GroupBy
