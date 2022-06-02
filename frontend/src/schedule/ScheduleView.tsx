import { ToastContainer } from 'react-toastify';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import ScheduleGrid from './ScheduleGrid';
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BestMatch, GridService } from './GridService';
import {ScheduleTitleView} from './ScheduleTitleView';
import { TimeRangeField } from './TimeRangeField';
import './grid.css';
import BestMatchView from './BestMatchView';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NewGuestView from './NewGuestView';
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

    return (
        <div className="mt-3">
            <ToastContainer />
            <Container maxWidth="lg" disableGutters>

                <ScheduleTitleView ref={titleRef}/>

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
                        <NewGuestView scheduleGridRef={scheduleGridRef}/>
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
