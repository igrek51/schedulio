import React, { useEffect } from "react";
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import { CallbackHell } from '../schedule/CallbackHell';
import CreateScheduleDialog from './CreateScheduleDialog';


function NewScheduleView() {

    const clickNewSchedule = () => {
        CallbackHell.createScheduleClickOpen()
    };

    useEffect(() => {
        clickNewSchedule()
    }, []);

    return (
        <div className="mt-3">
            <Container maxWidth="lg" disableGutters>

                <h2 className="ml-2">Schedulio</h2>

                <div>Schedulio lets you plan your periodic events continuously.</div>

                <div className="mt-3">
                    <Button variant="contained" color="primary" onClick={clickNewSchedule}>
                        <AddIcon fontSize="small" /> New Schedule
                    </Button>
                </div>

                <CreateScheduleDialog/>

            </Container>
        </div>
    );
}

export default NewScheduleView;
