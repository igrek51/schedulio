import React, { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { useParams } from "react-router-dom";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Grid from '@mui/material/Grid';

import { BestMatch, GridService } from './GridService';
import {ScheduleTitleView} from './ScheduleTitleView';
import { TimeRangeField } from './TimeRangeField';
import BestMatchView from './BestMatchView';
import ScheduleGrid from './ScheduleGrid';
import NewGuestView from './NewGuestView';
import './grid.css';
import { activateBootstrapTooltips } from './grid.js';


function ScheduleView() {
    console.log('rendering ScheduleView...');

    const titleRef = React.createRef<ScheduleTitleView>();
    const scheduleGridRef = React.createRef<ScheduleGrid>();
    const hoursFieldRef = React.createRef<TimeRangeField>();
    const bestMatchRef = React.createRef<BestMatchView>();
    
    const { scheduleId } = useParams();
    GridService.scheduleId = scheduleId!;

    const onTitleLoad = (title: string) => {
        titleRef.current!.setState({title: title});
    };

    const onBestMatchLoad = (bestMatch: BestMatch) => {
        bestMatchRef.current!.setBestMatch(bestMatch);
    }

    useEffect(() => {
        GridService.scheduleGridRef = scheduleGridRef;
        GridService.hotRef = scheduleGridRef.current!.hotTableRef;

        GridService.fetchData(onTitleLoad, onBestMatchLoad);

        activateBootstrapTooltips()
    }, []);

    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(menuAnchorEl);
    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const menuEditSchedule = () => {
        handleMenuClose()
    }

    const menuDeleteSchedule = () => {
        handleMenuClose()
    }

    const addGuestContainer = {
        handleClickOpen() {}
    }

    const menuAddGuest = () => {
        handleMenuClose()
        addGuestContainer.handleClickOpen()
    }

    return (
        <div className="mt-3">
            <ToastContainer />
            <Container maxWidth="lg" disableGutters>

                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    >

                <ScheduleTitleView ref={titleRef}/>

                <div className="d-inline-block ms-2 mt-2">
                    <IconButton
                        aria-label="more"
                        id="basic-menu-button"
                        aria-controls={openMenu ? 'basic-menu' : undefined}
                        aria-expanded={openMenu ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleMenuClick}
                        >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        MenuListProps={{
                            'aria-labelledby': 'basic-menu-button',
                        }}
                        anchorEl={menuAnchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        >
                        <MenuItem onClick={menuEditSchedule}>Edit Schedule</MenuItem>
                        <MenuItem onClick={menuDeleteSchedule}>Delete Schedule</MenuItem>
                        <MenuItem onClick={menuAddGuest}>Add Guest</MenuItem>
                    </Menu>
                </div>

                </Grid>

                <div className="ms-1">
                    Select cells and mark your availability.
                </div>

                <div className="mb-3">
                    <div className="d-inline-block mx-1 mt-2">
                        <ButtonGroup>
                            <Tooltip title="Vote for &quot;OK&quot; if you're available in selected days" arrow>
                                <Button variant="contained" color="success" onClick={() => { GridService.setSelectedCells('ok'); }}>
                                    <CheckIcon fontSize="small"/> OK
                                </Button>
                            </Tooltip>
                            <Tooltip title="Vote for &quot;Maybe&quot; (default answer) in selected days" arrow>
                                <Button variant="outlined" onClick={() => { GridService.setSelectedCells('maybe'); }}>
                                    <QuestionMarkIcon fontSize="small"/> Maybe
                                </Button>
                            </Tooltip>
                            <Tooltip title="Vote for &quot;No&quot; in selected days" arrow>
                                <Button variant="contained" color="error" onClick={() => { GridService.setSelectedCells('no'); }}>
                                    <CloseIcon fontSize="small"/> No
                                </Button>
                            </Tooltip>
                        </ButtonGroup>
                    </div>

                    <div className="d-inline-block mx-1 mt-3">
                        <TimeRangeField ref={hoursFieldRef}/>
                    </div>

                    <div className="d-inline-block ms-2 mt-2">
                        <NewGuestView addGuestContainer={addGuestContainer} scheduleGridRef={scheduleGridRef}/>
                    </div>
                </div>

                <div className="grid-container">
                    <ScheduleGrid ref={scheduleGridRef} hoursFieldRef={hoursFieldRef}/>
                </div>

                <div className="mt-4 mb-5">
                    <h4 data-toggle="tooltip" data-placement="left" title="Best match with the most confirmed participants">
                        <StarBorderIcon fontSize="large"/> Best match
                    </h4>
                    <BestMatchView ref={bestMatchRef}/>
                </div>

            </Container>
        </div>
    );
}

export default ScheduleView;
