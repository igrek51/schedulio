import { ToastContainer, toast } from 'react-toastify';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import ScheduleGrid from './ScheduleGrid';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GridService from './GridService';
import {ScheduleTitleView} from './ScheduleTitleView';
import { HoursField } from './HoursField';
import './grid.css';


function ScheduleView() {
    const notify = () => toast.info('Info!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    const titleRef = React.createRef<ScheduleTitleView>();
    const scheduleGridRef = React.createRef<ScheduleGrid>();
    const hoursFieldRef = React.createRef<HoursField>();
    
    const { scheduleId } = useParams();
    GridService.scheduleId = scheduleId!;

    console.log('ScheduleView rendering');

    const onTitleLoad = (title: string) => {
        titleRef.current!.setState({title: title});
    };

    useEffect(() => {
        GridService.scheduleGridRef = scheduleGridRef;
        GridService.hotRef = scheduleGridRef.current!.hotTableRef;

        GridService.fetchData(onTitleLoad);
    }, []);

    return (
        <div className="App mt-3">
            <ToastContainer />
            <Container maxWidth="lg">

                <ScheduleTitleView ref={titleRef}/>

                Mark your availability for the upcoming days.

                <div className="mt-3 mb-3">
                    <ButtonGroup>
                        <Tooltip title="Vote for &quot;Available&quot; in selected days" arrow>
                            <Button variant="contained" color="success" onClick={() => { GridService.setSelectedCells('ok'); }}>
                                OK
                            </Button>
                        </Tooltip>
                        <Tooltip title="Vote for &quot;Maybe&quot; (empty cell) in selected days" arrow>
                            <Button variant="outlined" onClick={() => { GridService.setSelectedCells(''); }}>
                                Maybe
                            </Button>
                        </Tooltip>
                        <Tooltip title="Vote for &quot;I can't&quot; in selected days" arrow>
                            <Button variant="contained" color="error" onClick={() => { GridService.setSelectedCells('no'); }}>
                                No
                            </Button>
                        </Tooltip>
                    </ButtonGroup>

                    <span className="ms-2"></span>
                    <HoursField ref={hoursFieldRef}/>
                </div>

            </Container>
        </div>
    );
}

export default ScheduleView;
