import {BrowserRouter, Routes, Route} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import ScheduleView from './schedule/ScheduleView';
import NewScheduleView from './new/NewScheduleView';


function App() {
  return (
    <div>
      <ToastContainer />
      <BrowserRouter basename="/">
        <Routes>
            <Route path="/" element={<NewScheduleView/>}/>
            <Route path="/schedule/:scheduleId" element={<ScheduleView/>}/>
            <Route path="/s/:scheduleId" element={<ScheduleView/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
