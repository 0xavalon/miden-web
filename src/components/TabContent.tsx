// images
import teamwork from "../assets/images/teamwork.png";

interface TabContentProps {
  title: string;
  description: string;
  handleCreateAccount: () => void;
  handleImportAccount: () => void;
}

export default function TabContent({
  title,
  description,
  handleCreateAccount,
  handleImportAccount,
}: TabContentProps) {
  return (
    <div className="mt-3 p-6 bg-white rounded-lg shadow-md max-w-md text-center w-[420px] h-[514px]">
      <div className="flex justify-center">
        <div className="w-[175px] h-[175px] rounded-full flex items-center justify-center">
          <img src={teamwork} alt="illustration" />
        </div>
      </div>
      <h1 className="mt-6 text-[#191711] text-2xl font-bold font-inter leading-8">
        {title}
      </h1>
      <p className="mt-3 opacity-60 text-center text-[#191711] text-base font-medium font-inter leading-[30px]">
        {description}
      </p>
      <button
        onClick={handleImportAccount}
        disabled={true}
        className="mt-8 w-full px-6 py-3 bg-[#0b3ceb] text-white rounded-full shadow hover:bg-[#0b3ceb]/90 opacity-50 cursor-not-allowed"
      >
        Import account
      </button>
      <button
        onClick={handleCreateAccount}
        className="mt-4 w-full px-6 py-3 bg-[#0b3ceb] text-white rounded-full shadow hover:bg-[#0b3ceb]/90"
      >
        Create account
      </button>
    </div>
  );
}
