import {BrowserRouter, Routes, Route} from "react-router-dom";
import ScheduleView from './ScheduleView';


function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
          {/* <Route path="/" element={<ScheduleView/>}/> */}
          <Route path="/schedule/:scheduleId" element={<ScheduleView/>}/>
          <Route path="/s/:scheduleId" element={<ScheduleView/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
