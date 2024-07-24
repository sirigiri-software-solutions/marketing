import React from "react";
 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login"
import Signup from "./Components/Signup";
 
function App() {
  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup/>}></Route>
 
      </Routes>
    </Router>
  );
}
export default App;
 