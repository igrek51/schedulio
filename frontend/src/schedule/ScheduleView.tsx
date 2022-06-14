import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import BoltIcon from '@mui/icons-material/Bolt';

import { ScheduleService } from './ScheduleService';
import {EventTitleView} from './EventTitleView';
import { TimeRangeField } from './TimeRangeField';
import BestMatchTable from './BestMatchTable';
import GridComponent from './GridComponent';
import NewGuestView from './NewGuestView';
import { CallbackHell } from "./CallbackHell";
import './grid.css';
import { activateBootstrapTooltips } from './grid.js';
import EditScheduleDialog from "./EditScheduleDialog";


function ScheduleView() {

    const titleRef = React.createRef<EventTitleView>();
    const scheduleGridRef = React.createRef<GridComponent>();
    const hoursFieldRef = React.createRef<TimeRangeField>();
    
    const { scheduleId } = useParams();
    ScheduleService.scheduleId = scheduleId!;

    const onTitleLoad = (title: string) => {
        titleRef.current!.setState({title: title});
        document.title = `Schedulio: ${title}`;
    };

    useEffect(() => {
        ScheduleService.scheduleGridRef = scheduleGridRef;
        ScheduleService.hotRef = scheduleGridRef.current!.hotTableRef;

        ScheduleService.fetchData(onTitleLoad);

        activateBootstrapTooltips()
    });

    CallbackHell.onTitleLoad = onTitleLoad

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
        CallbackHell.editScheduleClickOpen()
    }

    const navigate = useNavigate();
    const goToHomePage = () => {
        navigate(`/`)
    }

    const menuDeleteSchedule = () => {
        handleMenuClose()
        ScheduleService.deleteSchedule(goToHomePage)
    }

    const menuAddGuest = () => {
        handleMenuClose()
        CallbackHell.newGuestViewClickOpen()
    }

    const menuCreateSchedule = () => {
        handleMenuClose()
        goToHomePage()
    }

    return (
        <div className="mt-3">
            <Container maxWidth="lg" disableGutters>

                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    >
                    <EventTitleView ref={titleRef}/>

                    <div className="d-inline-block ml-2 mt-2">
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
                            <MenuItem onClick={menuAddGuest}>Add Guest</MenuItem>
                            <MenuItem onClick={menuEditSchedule}>Edit Schedule</MenuItem>
                            <MenuItem onClick={menuCreateSchedule}>Create New Schedule</MenuItem>
                            <MenuItem onClick={menuDeleteSchedule}>Delete Schedule</MenuItem>
                        </Menu>

                        <EditScheduleDialog/>
                    </div>
                </Grid>

                <div className="ml-1">
                    Select cells and mark your availability.
                </div>

                <div className="mb-2">
                    <div className="d-inline-block ml-1 mr-2 mt-2">
                        <NewGuestView scheduleGridRef={scheduleGridRef}/>
                    </div>

                    <div className="d-inline-block mx-1 mt-2">
                        <ButtonGroup>
                            <Tooltip title="Vote for &quot;OK&quot; if you're available in selected days" arrow placement="top">
                                <Button variant="contained" color="success" onClick={() => { ScheduleService.setSelectedCells('ok'); }}>
                                    <CheckIcon fontSize="small"/> OK
                                </Button>
                            </Tooltip>
                            <Tooltip title="Vote for &quot;Maybe&quot; (default answer) in selected days" arrow placement="top">
                                <Button variant="outlined" onClick={() => { ScheduleService.setSelectedCells('maybe'); }}>
                                    <QuestionMarkIcon fontSize="small"/> Maybe
                                </Button>
                            </Tooltip>
                            <Tooltip title="Vote for &quot;No&quot; in selected days" arrow placement="top">
                                <Button variant="contained" color="error" onClick={() => { ScheduleService.setSelectedCells('no'); }}>
                                    <CloseIcon fontSize="small"/> No
                                </Button>
                            </Tooltip>
                        </ButtonGroup>
                    </div>

                    <div className="d-inline-block ml-1 mt-2">
                        <TimeRangeField ref={hoursFieldRef}/>
                    </div>
                </div>

                <div>
                    <GridComponent ref={scheduleGridRef} hoursFieldRef={hoursFieldRef}/>
                </div>

                <div className="mt-4 mb-5">
                    <h4 data-toggle="tooltip" data-placement="left" title="A day with the most confirmed participants">
                        <StarBorderIcon fontSize="large"/> Best Match
                    </h4>
                    <BestMatchTable algorithm="most_participants"/>
                    
                    <h4 className="mt-3" data-toggle="tooltip" data-placement="left" title="A first day with the possible participants more than minimum threshold">
                        <BoltIcon fontSize="large"/> Soonest Possible Match
                    </h4>
                    <BestMatchTable algorithm="soonest_possible"/>
                </div>

            </Container>
        </div>
    );
}

export default ScheduleView;
