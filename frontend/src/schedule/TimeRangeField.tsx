import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import React from "react";
import {ScheduleService} from './ScheduleService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BootstrapTooltip } from './Tooltip';

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
        ScheduleService.voteOkHours(value);
    }

    render() {
        return (
            <div className="d-inline-block">
                <BootstrapTooltip title="Specify your availability hours in 'HH-HH' format, 'HH:MM - HH:MM' or 'HH+'" arrow placement="top">
                    <TextField className="s-availability-input" label="Availability Hours" variant="outlined" size="small" 
                        value={this.state.hoursValue} onChange={this._handleTextFieldChange.bind(this)}
                        />
                </BootstrapTooltip>
                <ButtonGroup>
                    <BootstrapTooltip title="Set given availability hours in selected days" arrow placement="top">
                        <Button variant="contained" color="warning" onClick={this.setAvailabilityHours}>
                            <AccessTimeIcon fontSize="small"/> &nbsp;
                        </Button>
                    </BootstrapTooltip>
                </ButtonGroup>
            </div>
        )
    }
}
