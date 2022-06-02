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

export default function NewGuestView() {

    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
        setName('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const confirmAdding = () => {
        GridService.addNewGuest(name);
        handleClose();
    };

    const _handleTextFieldChange = (e: any) => {
        setName(e.target.value);
    };

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
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        fullWidth
                        variant="standard"
                        value={name} onChange={_handleTextFieldChange}
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