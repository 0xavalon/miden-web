import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Business from "../pages/Business";
import Employee from "../pages/Employee";
import Home from "../pages/Home";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business" element={<Business />} />
        <Route path="/employee" element={<Employee />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
