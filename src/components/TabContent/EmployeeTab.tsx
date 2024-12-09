// components/TabContent/EmployeeTab.tsx
import React from "react";
import teamwork from "../../assets/images/teamwork.png";

interface EmployeeTabProps {
  handleCreateAccount: () => void;
}

const EmployeeTab = ({ handleCreateAccount }: EmployeeTabProps) => {
  return (
    <div className="mt-3 p-6 bg-white rounded-lg shadow-md max-w-md text-center w-[420px] h-[447px]">
      <div className="flex justify-center">
        <div className="w-[175px] h-[175px] rounded-full flex items-center justify-center">
          <img src={teamwork} alt="Employee illustration" />
        </div>
      </div>
      <h1 className="mt-6 text-[#191711] text-2xl font-bold font-inter leading-8">
        Create an employee account
      </h1>
      <p className="mt-3 opacity-60 text-center text-[#191711] text-base font-medium font-inter leading-[30px]">
        Create an account to manage your personal tasks
      </p>
      <button
        onClick={handleCreateAccount}
        className="mt-8 w-full px-6 py-3 bg-[#0b3ceb] text-white rounded-full shadow hover:bg-[#0b3ceb]/90"
      >
        Create account
      </button>
    </div>
  );
};

export default EmployeeTab;
