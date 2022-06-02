import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React from "react";
import {GridService} from './GridService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export class TimeRangeField extends React.Component<any, any> {
    state = {hoursValue: '18-24'};

    constructor(props: any) {
        super(props);
        this.setAvailabilityHours = this.setAvailabilityHours.bind(this);
    }

    _handleTextFieldChange(e: any) {
        this.setState({
            hoursValue: e.target.value,
        });
    }

    setAvailabilityHours() {
        const value = this.state.hoursValue
        GridService.voteOkHours(value);
    }

    render() {
        return (
            <span>
                <Tooltip title="Type hours in 'HH-HH' format, 'HH:MM - HH:MM' or 'HH+'" arrow>
                    <TextField label="Availability Hours" variant="outlined" size="small" 
                        value={this.state.hoursValue} onChange={this._handleTextFieldChange.bind(this)}
                        />
                </Tooltip>
                <ButtonGroup>
                    <Tooltip title="Specify availability hours in selected days" arrow>
                        <Button variant="contained" color="warning" onClick={this.setAvailabilityHours}>
                            <AccessTimeIcon fontSize="small"/> Time range
                        </Button>
                    </Tooltip>
                </ButtonGroup>
            </span>
        )
    }
}
