import React from "react";

import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login"
import Dashboardpage from "./Components/Dashboardpage";

function App() {
  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboardpage" element={<Dashboardpage/>} />
      
        

      </Routes>
    </Router>
  );
}
export default App;

