import { useEffect } from "react";
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import { CallbackHell } from '../schedule/CallbackHell';
import CreateScheduleDialog from './CreateScheduleDialog';
import { HistoryService, isHistoryEmpty } from "../schedule/HistoryService";
import { HistoryComponent } from "./HistoryComponent";


function NewScheduleView() {

    const clickNewSchedule = () => {
        CallbackHell.createScheduleClickOpen()
    };

    const history = HistoryService.readHistory();

    document.title = `Schedulio`;

    useEffect(() => {
        if (isHistoryEmpty(history)) {
            clickNewSchedule()
        }
    }, [history]);

    return (
        <div className="mt-3">
            <Container maxWidth="lg" disableGutters>

                <h2 className="ml-2">Schedulio</h2>

                <div>Schedulio lets you plan your periodic events continuously.</div>

                <div className="mt-3">
                    <Button variant="contained" color="primary" onClick={clickNewSchedule}>
                        <AddIcon fontSize="small" /> New Schedule
                    </Button>
                    <CreateScheduleDialog/>
                </div>

                <HistoryComponent/>

            </Container>
        </div>
    );
}

export default NewScheduleView;
