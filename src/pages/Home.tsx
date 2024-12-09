import React from "react";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 p-4">
      {/* Tabs */}
      <div className="flex bg-white rounded-full shadow-md p-1 w-[420px]">
        <NavLink
          to="/business"
          className={({ isActive }) =>
            `w-1/2 px-6 py-2 rounded-full ${
              isActive ? "bg-[#fffaa1]" : "bg-transparent"
            } font-medium text-gray-700`
          }
        >
          Business
        </NavLink>
        <NavLink
          to="/employee"
          className={({ isActive }) =>
            `w-1/2 px-6 py-2 rounded-full ${
              isActive ? "bg-[#fffaa1]" : "bg-transparent"
            } font-medium text-gray-700`
          }
        >
          Employee
        </NavLink>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold text-[#191711]">
          Select a Tab to View Details
        </h1>
      </div>
    </div>
  );
};

export default Home;
