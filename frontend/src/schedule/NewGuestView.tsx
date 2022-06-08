import React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ButtonGroup from '@mui/material/ButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import { ScheduleService } from "./ScheduleService";
import { ToastService } from "./ToastService";
import { CallbackHell } from "./CallbackHell";

export default function NewGuestView(props: any) {

    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const inputReference = React.useRef<any>(null);

    const handleClickOpen = () => {
        props.scheduleGridRef.current!.disableConstantFocus()
        setOpen(true);
        setName('');
    };

    const handleClose = () => {
        setOpen(false);
        props.scheduleGridRef.current!.enableConstantFocus()
    };

    const confirmAdding = () => {
        if (name.length === 0) {
            ToastService.toastError('Name was not given');
        } else {
            ScheduleService.addNewGuest(name);
        }
        handleClose();
    };

    const _handleTextFieldChange = (e: any) => {
        setName(e.target.value);
    };

    const handleKeyUp = (e: any) => {
        if (e.key === 'Enter' && open) {
            confirmAdding();
        }
    }

    CallbackHell.newGuestViewClickOpen = handleClickOpen

    return (
        <div>
            <ButtonGroup>
                <Tooltip title="Add yourself to the table" arrow placement="top">
                    <Button variant="contained" color="primary" onClick={handleClickOpen}>
                        <AddIcon fontSize="small" /> Add Guest
                    </Button>
                </Tooltip>
            </ButtonGroup>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add new guest</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter your name:
                    </DialogContentText>
                    <TextField
                        ref={inputReference}
                        autoFocus
                        margin="dense"
                        id="inputGuestName"
                        label="Name"
                        fullWidth
                        variant="outlined"
                        value={name} onChange={_handleTextFieldChange}
                        onKeyUp={handleKeyUp}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={confirmAdding}>Add</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}