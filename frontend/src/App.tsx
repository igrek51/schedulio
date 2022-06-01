import {BrowserRouter, Routes, Route} from "react-router-dom";
import ScheduleView from './schedule/ScheduleView';
import NewScheduleView from './new/NewScheduleView';


function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
          <Route path="/" element={<NewScheduleView/>}/>
          <Route path="/schedule/:scheduleId" element={<ScheduleView/>}/>
          <Route path="/s/:scheduleId" element={<ScheduleView/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
