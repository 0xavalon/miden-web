import React, { useState } from "react";
import teamwork from "../assets/images/teamwork.png"; // Make sure this path is correct
import bg from "../assets/images/purple-bg.png";
import LoadingScreen from "./LoadingScreen"; // Import the LoadingScreen component
import { Icons } from "./icons";

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Business");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [isAccountCreated, setIsAccountCreated] = useState(false); // Track if the account is created

  // State to track the selected button
  const [selectedButton, setSelectedButton] = useState<string>("Payment_2024");

  // Function to handle button selection
  const handleButtonClick = (buttonName: string): void => {
    setSelectedButton(buttonName);
  };

  const handleCreateAccount = () => {
    setIsLoading(true); // Start loading
    setTimeout(() => {
      setIsLoading(false); // Stop loading
      setIsAccountCreated(true); // Set account created state
    }, 3000); // Simulate a loading delay of 3 seconds
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100">
      {/* Show the LoadingScreen when isLoading is true */}
      {isLoading && <LoadingScreen />}

      {/* Show the content after loading */}
      {!isLoading && !isAccountCreated && (
        <>
          {/* Tabs */}
          <div className="flex bg-white rounded-full shadow-md p-1 w-[420px]">
            <button
              className={`w-1/2 px-6 py-2 rounded-full ${
                activeTab === "Business" ? "bg-[#fffaa1]" : "bg-transparent"
              } font-medium text-gray-700`}
              onClick={() => setActiveTab("Business")}
            >
              Business
            </button>
            <button
              className={`w-1/2 px-6 py-2 rounded-full ${
                activeTab === "Employee" ? "bg-[#fffaa1]" : "bg-transparent"
              } font-medium text-gray-700`}
              onClick={() => setActiveTab("Employee")}
            >
              Employee
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-3 p-6 bg-white rounded-lg shadow-md max-w-md text-center w-[420px] h-[447px]">
            {activeTab === "Business" ? (
              <>
                <div className="flex justify-center">
                  {/* Image */}
                  <div className="w-[175px] h-[175px] rounded-full flex items-center justify-center">
                    <img src={teamwork} alt="Business illustration" />
                  </div>
                </div>
                <h1 className="mt-6 text-[#191711] text-2xl font-bold font-inter leading-8">
                  Create a business account
                </h1>
                <p className="mt-3  opacity-60 text-center text-[#191711] text-base font-medium font-inter leading-[30px]">
                  Create an account to enable bulk fund disbursement
                </p>
                <button
                  onClick={handleCreateAccount}
                  className="mt-8 w-full px-6 py-3 bg-[#0b3ceb] text-white rounded-full shadow hover:bg-[#0b3ceb]/90"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  {/* Image */}
                  <div className="w-[175px] h-[175px] rounded-full flex items-center justify-center">
                    <img src={teamwork} alt="Employee illustration" />
                  </div>
                </div>
                <h1 className="mt-6 text-[#191711] text-2xl font-bold font-inter leading-8">
                  Create an employee account
                </h1>
                <p className="mt-3  opacity-60 text-center text-[#191711] text-base font-medium font-inter leading-[30px]">
                  Create an account to manage your personal tasks
                </p>
                <button
                  onClick={handleCreateAccount}
                  className="mt-8 w-full px-6 py-3 bg-[#0b3ceb] text-white rounded-full shadow hover:bg-[#0b3ceb]/90"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Show the confirmation screen after account creation */}
      {isAccountCreated && !isLoading && (
        <div className="flex flex-row justify-center items-start gap-6 p-8 bg-white">
          {/* Account Info Card */}
          <div
            className="flex flex-col justify-between p-8 w-[433px] h-[430px] rounded-[32px]"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover", // Makes the background cover the container
              backgroundPosition: "center", // Centers the image
            }}
          >
            <div className="flex items-center justify-between">
              {/* Account Name */}
              <div className="bg-yellow-200 p-4 rounded-full">
                <span className="text-[#151515] text-base font-semibold font-inter leading-6">
                  eclipse231232
                </span>
              </div>
              {/* Key Button */}
              <button className="bg-[#0b3ceb] px-6 py-4 rounded-[64px]">
                <span className="text-white text-base font-semibold font-inter leading-6">
                  Key
                </span>
              </button>
            </div>
            <div className="mt-6 text-left">
              {/* Account Balance */}
              <p className="text-[#151515] text-base font-semibold font-['Inter'] leading-6">
                Account balance
              </p>
              <h1 className="mt-4 text-4xl font-bold text-black">0 Miden</h1>
            </div>
            <div className="flex justify-space-between gap-4 mt-6">
              {/* Import Button */}
              <button className="flex items-center justify-center w-[174px] px-4 py-4 bg-white border rounded-full shadow">
                <Icons.import />
                <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
                  Import
                </span>
              </button>
              {/* Send Button */}
              <button className="flex items-center justify-center w-[174px] px-4 py-4 bg-white border rounded-full shadow">
                <Icons.send />
                <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
                  Send
                </span>
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="px-8 py-10 flex flex-col bg-white rounded-[32px]  shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] w-[433px] h-[430px]">
            {/* This card title and content will be dynamic */}
            {/* Top-left heading */}
            <div className="w-full">
              <h1 className="text-[#191711] text-2xl font-bold font-[inter leading-[32px]">
                History
              </h1>
            </div>
            {/* Centered content */}
            <div className="flex items-center justify-center h-full -mt-6">
              <p className="text-[#191711] text-2xl font-bold font-inter leading-[32px]">
                Nothing to show
              </p>
            </div>
          </div>

          <div className="px-8 py-10 flex flex-col bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] w-[433px] h-[430px]">
            {/* Top section */}
            <div className="flex justify-between items-center">
              {/* Heading */}
              <h1 className="text-[#191711] text-2xl font-bold font-inter leading-[32px]">
                Import
              </h1>
              {/* Close button */}
              <button className="text-gray-700 text-xl font-bold">×</button>
            </div>

            {/* Center content */}
            <div className="flex-grow flex flex-col items-center justify-center">
              <div className="flex flex-col justify-center items-center w-[369px] h-[191px] bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)]">
                {/* File Name */}
                <button
                  onClick={() => handleButtonClick("Payment_2024")}
                  className={`p-4 w-[146px] text-[#151515] text-base font-semibold font-inter leading-normal ${
                    selectedButton === "Payment_2024"
                      ? "rounded-[64px] bg-[#FFFAA1]"
                      : "bg-transparent"
                  }`}
                >
                  Payment_2024
                </button>
                {/* File Extension */}
                <button
                  onClick={() => handleButtonClick(".mno")}
                  className={`p-4 w-[146px] rounded-[64px] text-[#151515] text-base font-semibold font-inter leading-normal ${
                    selectedButton === ".mno"
                      ? "rounded-[64px] bg-[#FFFAA1]"
                      : "bg-transparent"
                  }`}
                >
                  .mno
                </button>
              </div>
            </div>

            {/* Bottom section */}
            <div className="flex justify-center mt-6">
              <button className="w-full px-6 py-3 bg-[#0b3ceb] text-white font-inter font-bold rounded-[48px] shadow-lg hover:bg-[#0b3ceb]/90">
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabs;
