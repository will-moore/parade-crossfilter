
import React, {useState} from 'react';
import Histogram from './Histogram';

const Filter = ({dimName, dimType, removeFilter}) => {

    const [subheading, setSubheading] = useState('');

    const handleRemoveFilter = () => {
        removeFilter(dimName);
    }

    return (
        <div
            className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <strong className="mr-auto">{dimName}</strong>
                <small className="text-muted">{subheading}</small>
                <button type="button" className="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close"
                    onClick={handleRemoveFilter}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div className="toast-body">
                { (dimType === 'number') ? 
                    <Histogram dimName={dimName} setSubheading={setSubheading} />
                    : <div> TextFilter </div>
                }
            </div>
        </div>
    )
}

export default Filter;
