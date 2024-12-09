// components/TabContent/BusinessTab.tsx
import React from "react";
import teamwork from "../../assets/images/teamwork.png";

interface BusinessTabProps {
  handleCreateAccount: () => void;
}

const BusinessTab = ({ handleCreateAccount }: BusinessTabProps) => {
  return (
    <div className="mt-3 p-6 bg-white rounded-lg shadow-md max-w-md text-center w-[420px] h-[447px]">
      <div className="flex justify-center">
        <div className="w-[175px] h-[175px] rounded-full flex items-center justify-center">
          <img src={teamwork} alt="Business illustration" />
        </div>
      </div>
      <h1 className="mt-6 text-[#191711] text-2xl font-bold font-inter leading-8">
        Create a business account
      </h1>
      <p className="mt-3 opacity-60 text-center text-[#191711] text-base font-medium font-inter leading-[30px]">
        Create an account to enable bulk fund disbursement
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

export default BusinessTab;
