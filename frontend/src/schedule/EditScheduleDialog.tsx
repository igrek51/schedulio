import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { ScheduleService, ScheduleOptions } from "./ScheduleService";
import { ToastService } from "./ToastService";
import { CallbackHell } from "./CallbackHell";


function valueOrEmpty(str: string): string | null {
    if (!str || str.trim().length === 0) {
        return null;
    }
    return str;
}

export default function EditScheduleDialog(props: any) {

    const [open, setOpen] = React.useState(false);
    const [eventName, setEventName] = React.useState('');
    const [optionsValue, setOptionsValue] = React.useState('');
    const [optionMinGuests, setOptionMinGuests] = React.useState('');
    const [optionMinDuration, setOptionMinDuration] = React.useState('');
    const [optionDefaultStartTime, setOptionDefaultStartTime] = React.useState('');
    const [optionDefaultEndTime, setOptionDefaultEndTime] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
        setEventName(ScheduleService.title);
        setOptionsValue(ScheduleService.scheduleOptionsJson || '');

        const minGuestsVal = ScheduleService.scheduleOptions?.min_guests;
        setOptionMinGuests('' + (minGuestsVal || ''));
        setOptionMinDuration(ScheduleService.scheduleOptions?.min_duration || '');
        setOptionDefaultStartTime(ScheduleService.scheduleOptions?.default_start_time || '');
        setOptionDefaultEndTime(ScheduleService.scheduleOptions?.default_end_time || '');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const sendScheduleUpdate = () => {
        let minGuestsInt: number | null = null
        const minGuestsV = valueOrEmpty(optionMinGuests)
        if (minGuestsV != null) {
            minGuestsInt = Number(minGuestsV)
            if (isNaN(minGuestsInt)) {
                ToastService.toastError('Minimum Guests must be a number')
                return
            }
        }

        const options: ScheduleOptions = {
            min_guests: minGuestsInt,
            min_duration: valueOrEmpty(optionMinDuration),
            default_start_time: valueOrEmpty(optionDefaultStartTime),
            default_end_time: valueOrEmpty(optionDefaultEndTime),
        }
        const optionsJson = JSON.stringify(options);
        ScheduleService.updateSchedule(eventName, optionsJson)
        ScheduleService.scheduleOptions = options
    }


    const confirmSaving = () => {
        if (eventName.length === 0) {
            ToastService.toastError('Event Name is required')
        } else {
            sendScheduleUpdate()
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

    const [advancedOn, setAdvanced] = React.useState(false);
    const handleChangeAdvanced = () => {
        setAdvanced((prev) => !prev);
    };
    const [advancedJsonOn, setAdvancedJson] = React.useState(false);

    CallbackHell.editScheduleClickOpen = handleClickOpen

    return (
        <div>
            <Dialog 
                fullWidth
                open={open} onClose={handleClose}>
                <DialogTitle>Edit Schedule</DialogTitle>
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


                    <FormControlLabel
                        control={<Switch checked={advancedOn} onChange={handleChangeAdvanced} />}
                        label="Advanced options"
                    />
                    <Collapse in={advancedOn}>

                        <DialogContentText>
                            Minimum number of guests (optional), eg. "4":
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Minimum guests"
                            fullWidth
                            variant="outlined"
                            value={optionMinGuests} onChange={(e: any) => { setOptionMinGuests(e.target.value) }}
                        />

                        <DialogContentText>
                            Minimum event duration (optional), eg. "2h30m":
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Minimum duration"
                            fullWidth
                            variant="outlined"
                            value={optionMinDuration} onChange={(e: any) => { setOptionMinDuration(e.target.value) }}
                        />

                        <DialogContentText>
                            Default event start time (optional), eg. "19:00":
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Default start time"
                            fullWidth
                            variant="outlined"
                            value={optionDefaultStartTime} onChange={(e: any) => { setOptionDefaultStartTime(e.target.value) }}
                        />

                        <DialogContentText>
                            Default event end time (optional), eg. "23:00":
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Default end time"
                            fullWidth
                            variant="outlined"
                            value={optionDefaultEndTime} onChange={(e: any) => { setOptionDefaultEndTime(e.target.value) }}
                        />
                        
                        <Collapse in={advancedJsonOn}>
                        <DialogContentText>
                            Other options (optional settings in JSON format):
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
                        </Collapse>

                    </Collapse>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={confirmSaving} type="submit">Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}