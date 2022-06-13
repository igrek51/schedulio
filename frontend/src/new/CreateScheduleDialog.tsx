import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ScheduleService, ScheduleOptions } from "../schedule/ScheduleService";
import { ToastService } from "../schedule/ToastService";
import { CallbackHell } from "../schedule/CallbackHell";
import { useNavigate } from "react-router-dom";


export default function CreateScheduleDialog(props: any) {

    const [open, setOpen] = React.useState(false);
    const [eventName, setEventName] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
        setEventName('');
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
            const options: ScheduleOptions = {
                min_guests: null,
                min_duration: null,
                default_start_time: null,
                default_end_time: null,
            }
            const optionsJson = JSON.stringify(options);
            ScheduleService.createSchedule(eventName, optionsJson, onSuccessfulCreate)
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
                        autoFocus
                        margin="dense"
                        id="inputEventName"
                        label="Event name"
                        fullWidth
                        variant="outlined"
                        value={eventName} onChange={_handleEventNameChange}
                        onKeyDown={handleKeyDown} 
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