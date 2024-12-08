// LoadingScreen.tsx
import React from "react";
import logo from "../assets/images/teamwork.png"; // Make sure this path is correct

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#D9BBFF] bg-opacity-50 flex justify-center items-center z-50">
      <div className="text-center">
        <img src={logo} alt="Logo" className="mb-4 w-24 h-24 mx-auto" />
        <h2 className="text-white text-lg font-semibold">
          Creating your account...
        </h2>
      </div>
    </div>
  );
};

export default LoadingScreen;
