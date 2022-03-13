import React from 'react';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';

function LoadingPercent({ loadingPercent }) {

    return (
        <Modal show={true}>
            <Modal.Header>
                <Modal.Title>Loading table data...</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ProgressBar now={loadingPercent} label={`${parseInt(loadingPercent)}%`} />
            </Modal.Body>
        </Modal>
    )
}

export default LoadingPercent;
