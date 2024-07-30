import React from "react";
 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login"
import Signup from "./Components/Signup";
import Dashboardpage from "./Components/Dashboardpage" 
import Allhostelsdata from "./Components/Allhostelsdata";
function App() {
  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup/>}></Route>
 
        <Route path="/Dashboardpage" element={<Dashboardpage/>} />
        <Route path="/allhostelsdata" element={<Allhostelsdata/>} />
      
        

      </Routes>
    </Router>
  );
}
export default App;
 
