import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ScheduleService } from "../schedule/ScheduleService";
import { ToastService } from "../schedule/ToastService";
import { CallbackHell } from "../schedule/CallbackHell";
import { useNavigate } from "react-router-dom";

export default function CreateScheduleDialog(props: any) {

    const [open, setOpen] = React.useState(false);
    const [eventName, setEventName] = React.useState('');
    const [optionsValue, setOptionsValue] = React.useState('');
    const inputReference = React.useRef<any>(null);

    const handleClickOpen = () => {
        setOpen(true);
        setEventName('');
        setOptionsValue('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const navigate = useNavigate();
    const onSuccessfulCreate = (pathId: string) => {
        navigate(`/s/${pathId}`);
    }

    const confirmSaving = () => {
        if (eventName.length === 0) {
            ToastService.toastError('Event Name is required')
        } else {
            ScheduleService.createSchedule(eventName, optionsValue, onSuccessfulCreate)
        }
        handleClose()
    };

    const _handleEventNameChange = (e: any) => {
        setEventName(e.target.value);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            confirmSaving();
        }
    }

    CallbackHell.createScheduleClickOpen = handleClickOpen

    return (
        <div>
            <Dialog 
                fullWidth
                open={open} onClose={handleClose}>
                <DialogTitle>Create Schedule</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Event name (required):
                    </DialogContentText>
                    <TextField
                        ref={inputReference}
                        autoFocus
                        margin="dense"
                        id="inputEventName"
                        label="Event name"
                        fullWidth
                        variant="outlined"
                        value={eventName} onChange={_handleEventNameChange}
                        onKeyDown={handleKeyDown} 
                    />

                    <DialogContentText>
                        Options (optional settings in JSON format):
                    </DialogContentText>
                    <TextField
                        id="textfield-schedule-options"
                        label="Options"
                        multiline
                        fullWidth
                        rows={5}
                        variant="outlined"
                        value={optionsValue} onChange={(e: any) => { setOptionsValue(e.target.value) }}
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={confirmSaving} type="submit">Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}