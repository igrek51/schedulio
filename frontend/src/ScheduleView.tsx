import { ToastContainer, toast } from 'react-toastify';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import ScheduleGrid from './ScheduleGrid';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {refreshAllVotes} from './rest';
import GridService from './GridService';
import {ScheduleTitleView} from './ScheduleTitleView';


function ScheduleView() {
    const notify = () => toast.info('Wow so easy!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    const titleRef = React.createRef<ScheduleTitleView>();
    const onTitleLoad = (title: string) => {
        titleRef.current!.setState({title: title});
    };
    
    const { scheduleId } = useParams();
    GridService.scheduleId = scheduleId!;

    console.log('ScheduleView rendering');

    useEffect(() => {
        GridService.fetchData(onTitleLoad);
    }, []);

    return (
        <div className="App">
            <ToastContainer />
            <div className="container mt-3">

                <ScheduleTitleView ref={titleRef}/>

                <ButtonGroup>
                    <Tooltip title="Vote for &quot;Available&quot; in selected days" arrow>
                        <Button variant="contained" color="success" onClick={notify}>
                            OK
                        </Button>
                    </Tooltip>
                    <Tooltip title="Vote for &quot;Maybe&quot; (empty cell) in selected days" arrow>
                        <Button variant="outlined">
                            Maybe
                        </Button>
                    </Tooltip>
                    <Tooltip title="Vote for &quot;I can't&quot; in selected days" arrow>
                        <Button variant="contained" color="error">
                            No
                        </Button>
                    </Tooltip>
                </ButtonGroup>

                <ButtonGroup>
                    <Tooltip title="Specify availability hours in selected days" arrow>
                        <Button variant="contained">Set hours:</Button>
                    </Tooltip>
                    <Tooltip title="Type hours in 'HH-HH' format or 'HH:MM - HH:MM'" arrow>
                        <TextField id="outlined-basic" label="Availability Hours" variant="outlined" defaultValue="18-24" size="small" />
                    </Tooltip>
                </ButtonGroup>

                <div className="btn-toolbar mt-3 mb-3">
                    <div className="btn-group">
                        <button type="button" className="btn btn-success" id="btn-answer-ok"
                            data-bs-toggle="tooltip" data-bs-placement="bottom" title="Vote for &quot;Available&quot; in selected days">OK</button>
                        <button type="button" className="btn btn-outline-secondary" id="btn-answer-maybe"
                            data-bs-toggle="tooltip" data-bs-placement="bottom" title="Vote for &quot;Maybe&quot; (empty cell) in selected days">Maybe</button>
                        <button type="button" className="btn btn-danger" id="btn-answer-no"
                            data-bs-toggle="tooltip" data-bs-placement="bottom" title="Vote for &quot;I can't&quot; in selected days">No</button>
                    </div>
                    <div className="btn-group ms-2">
                        <div className="input-group">
                            <button className="btn btn-warning" type="button" id="btn-answer-hours"
                                data-bs-toggle="tooltip" data-bs-placement="bottom" title="Specify availability hours in selected days">Set hours:</button>
                            <input type="text" className="form-control" placeholder="From hour - To hour" id="input-answer-hours" defaultValue="18-24"
                                data-bs-toggle="tooltip" data-bs-placement="bottom" title="Type hours in 'HH-HH' format or 'HH:MM - HH:MM'" />
                        </div>
                    </div>
                </div>

                <ScheduleGrid />

            </div>
        </div>
    );
}

export default ScheduleView;
