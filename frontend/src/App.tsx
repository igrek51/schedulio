import {BrowserRouter, Routes, Route} from "react-router-dom";
import ScheduleView from './ScheduleView';


function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
          <Route path="/" element={<ScheduleView/>}/>
          <Route path="/schedule/:id" element={<ScheduleView/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
