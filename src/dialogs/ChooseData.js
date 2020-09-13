import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { filesizeformat } from '../utils';


function ChooseData({ project, screen, setDataToLoad }) {


    // dialog state
    const [show, setShow] = React.useState(true);
    const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);


    // let dtype = 'project';
    const [loading, setLoading] = useState(false);
    const [fileAnns, setFileAnns] = useState([]);
    const [selectedAnn, selectFileAnn] = useState(undefined);
    const [datasets, setDatasets] = useState(undefined);
    const [mapAnns, setMapAnns] = useState(undefined);
    const [tags, setTags] = useState(undefined);

    useEffect(() => {
        setLoading(true);
        let url = window.OMEROWEB_INDEX + `webclient/api/annotations/?type=file`;
        if (project) {
            url += `&project=${project}`
        } else if (screen) {
            url += `&screen=${screen}`
        }
        fetch(url, { mode: 'cors', credentials: 'include' })
            .then(rsp => rsp.json())
            .then(data => {
                setLoading(false);
                let csvFiles = data.annotations
                    .filter(ann => ann.file && (ann.file.name.endsWith(".csv")));
                setFileAnns(csvFiles);
            });
    }, [project, screen]);

    const handleChange = (event) => {
        let fid = parseInt(event.target.value);
        if (selectedAnn === fid) {
            // toggle checkbox off
            fid = undefined;
        }
        selectFileAnn(fid);
    }

    const handleDatasets = (event) => {
        // toggle datasets
        if (datasets) {
            setDatasets(undefined);
        } else {
            // pass in the project ID
            setDatasets(project);
        }
    }

    const handleTags = (event) => {
        // toggle tags
        if (tags) {
            setDatasets(undefined);
        } else {
            // pass in the screen, project ID etc
            if (screen) {
                setTags('screen-' + screen);
            } else if (project) {
                setTags('project-' + project);
            }
        }
    }

    const handleMapAnns = (event) => {
        if (mapAnns) {
            setMapAnns(undefined);
        } else {
            // pass in the screen, project ID etc
            if (screen) {
                setMapAnns('screen-' + screen);
            } else if (project) {
                setMapAnns('project-' + project);
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        let dataToLoad = {};
        if (selectedAnn) {
            dataToLoad.csvFiles = [selectedAnn];
        }
        dataToLoad.datasets = datasets;
        dataToLoad.mapAnns = mapAnns;
        dataToLoad.tags = tags;
        setDataToLoad(dataToLoad);
        setShow(false);
    }

    let helpMsg = (
        <p>Need ?project=id or ?screen=?id to load data</p>
    )

    return (

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Choose Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {(!project && !screen) ? helpMsg : (
                    <Form>
                        <p value="">
                            {loading ? "Loading..." :
                                `Choose a CSV file linked to ${project ? "Project" : "Screen"}:`}
                        </p>


                        <Form.Control as="select" multiple
                            onChange={handleChange}>
                            {fileAnns.map((ann) => (
                                <option
                                    key={ann.id}
                                    value={ann.id}
                                >
                                    {`${ann.id}: ${ann.file.name} (${filesizeformat(ann.file.size)})`}
                                </option>
                            ))}
                        </Form.Control>

                        <Form.Group controlId="mapAnnsCheckbox">
                            <Form.Check
                                type="checkbox"
                                name="mapAnns"
                                onChange={handleMapAnns}
                                label={"Load Key-Value Pairs"}
                            />
                        </Form.Group>

                        <Form.Group controlId="datasetsCheckbox">
                            <Form.Check
                                type="checkbox"
                                name="datasets"
                                onChange={handleDatasets}
                                label={"Load Datasets"}
                            />
                        </Form.Group>

                        <Form.Group controlId="tagsCheckbox">
                            <Form.Check
                                type="checkbox"
                                name="tags"
                                onChange={handleTags}
                                label={"Load Tags"}
                            />
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
          </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Load Data
          </Button>
            </Modal.Footer>
        </Modal>

    )
}

export default ChooseData;
