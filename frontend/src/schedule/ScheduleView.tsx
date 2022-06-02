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


function ScheduleView() {

    const titleRef = React.createRef<ScheduleTitleView>();
    const scheduleGridRef = React.createRef<ScheduleGrid>();
    const hoursFieldRef = React.createRef<TimeRangeField>();
    const bestMatchRef = React.createRef<BestMatchView>();
    
    const { scheduleId } = useParams();
    GridService.scheduleId = scheduleId!;

    console.log('ScheduleView is rendering');

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
    }, []);

    return (
        <div className="mt-3">
            <ToastContainer />
            <Container maxWidth="lg" disableGutters>

                <ScheduleTitleView ref={titleRef}/>

                <div>
                    Select cells and mark your availability.
                </div>

                <div className="mb-3">
                    <div className="d-inline-block mx-1 mt-2">
                        <ButtonGroup>
                            <Tooltip title="Vote for &quot;Available&quot; in selected days" arrow>
                                <Button variant="contained" color="success" onClick={() => { GridService.setSelectedCells('ok'); }}>
                                    <CheckIcon fontSize="small"/> OK
                                </Button>
                            </Tooltip>
                            <Tooltip title="Vote for &quot;Maybe&quot; (empty, default answer) in selected days" arrow>
                                <Button variant="outlined" onClick={() => { GridService.setSelectedCells(''); }}>
                                    <QuestionMarkIcon fontSize="small"/> Maybe
                                </Button>
                            </Tooltip>
                            <Tooltip title="Vote for &quot;I can't&quot; in selected days" arrow>
                                <Button variant="contained" color="error" onClick={() => { GridService.setSelectedCells('no'); }}>
                                    <CloseIcon fontSize="small"/> No
                                </Button>
                            </Tooltip>
                        </ButtonGroup>
                    </div>

                    <div className="d-inline-block mx-1 mt-3">
                        <TimeRangeField ref={hoursFieldRef}/>
                    </div>

                    <div className="d-inline-block ms-3 mt-2">
                        <NewGuestView scheduleGridRef={scheduleGridRef}/>
                    </div>
                </div>

                <div className="grid-container">
                    <ScheduleGrid ref={scheduleGridRef} hoursFieldRef={hoursFieldRef}/>
                </div>

                <div className="mt-4 mb-5">
                    <h4><StarBorderIcon fontSize="large"/> Best match</h4>
                    <BestMatchView ref={bestMatchRef}/>
                </div>

            </Container>
        </div>
    );
}

export default ScheduleView;
