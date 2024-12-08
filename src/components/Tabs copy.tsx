import React, { useState } from "react";
import teamwork from "../assets/images/teamwork.png";

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Business");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100">
      {/* Tabs */}
      <div className="flex bg-white rounded-full shadow-md p-1">
        <button
          className={`px-6 py-2 rounded-full ${
            activeTab === "Business" ? "bg-yellow-300" : "bg-transparent"
          } font-medium text-gray-700`}
          onClick={() => setActiveTab("Business")}
        >
          Business
        </button>
        <button
          className={`px-6 py-2 rounded-full ${
            activeTab === "Employee" ? "bg-yellow-300" : "bg-transparent"
          } font-medium text-gray-700`}
          onClick={() => setActiveTab("Employee")}
        >
          Employee
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        {activeTab === "Business" ? (
          <>
            <div className="flex justify-center">
              {/* Image */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                {/* Example image placeholder */}
                <img src={teamwork} alt="Business illustration" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mt-4">
              Create a business account
            </h1>
            <p className="text-gray-500 mt-2">
              Create an account to enable bulk fund disbursement
            </p>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600">
              Create account
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              {/* Image */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                {/* Example image placeholder */}
                <img src={teamwork} alt="Employee illustration" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mt-4">
              Create an employee account
            </h1>
            <p className="text-gray-500 mt-2">
              Create an account to manage your personal tasks
            </p>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600">
              Create account
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Tabs;
