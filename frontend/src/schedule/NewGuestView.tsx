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
import { GridService } from "./GridService";
import { ToastService } from "./ToastService";

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
            GridService.addNewGuest(name);
        }
        handleClose();
    };

    const _handleTextFieldChange = (e: any) => {
        setName(e.target.value);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            confirmAdding();
        }
    }

    return (
        <div>
            <ButtonGroup>
                <Button variant="contained" color="primary" onClick={handleClickOpen}>
                    <AddIcon fontSize="small" /> New Guest
                </Button>
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
                        variant="standard"
                        value={name} onChange={_handleTextFieldChange}
                        onKeyDown={handleKeyDown} 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={confirmAdding} type="submit">Add</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}