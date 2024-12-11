import { Icons } from "./icons";
import teamwork from "../assets/images/teamwork.png";

interface ImportFileCardProps {
  selectedFile: string | null;
  importStatus: "idle" | "importing" | "success" | "error";
  handleImportFile: () => void;
  resetImport: () => void;
}

const ImportFileCard = ({
  selectedFile,
  importStatus,
  handleImportFile,
  resetImport,
}: ImportFileCardProps) => {
  return (
    <div className="px-8 py-10 flex flex-col bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] w-[433px] h-[430px]">
      <div className="flex justify-between items-center">
        <h1 className="text-[#191711] text-2xl font-bold font-inter leading-[32px]">
          Import
        </h1>
        {importStatus !== "importing" && (
          <button
            className="text-gray-700 text-xl font-bold"
            onClick={() => resetImport()}
          >
            <Icons.close />
          </button>
        )}
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        {importStatus === "idle" && (
          <div className="flex flex-col mt-6">
            <div className="flex flex-col justify-center items-center w-[369px] h-[191px] bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)]">
              <div className="p-4 text-[#151515] text-base font-semibold font-inter leading-normal">
                {selectedFile}
              </div>
            </div>
            <div className="flex justify-center mt-[54px]">
              <button
                className="w-full px-6 py-3 bg-[#0b3ceb] text-white font-inter font-bold rounded-[48px] shadow-lg hover:bg-[#0b3ceb]/90"
                onClick={handleImportFile}
                disabled={!selectedFile}
              >
                Import
              </button>
            </div>
          </div>
        )}
        {importStatus === "importing" && (
          <>
            <img src={teamwork} alt="Importing..." className="w-40 h-40" />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              Importing...
            </p>
          </>
        )}
        {importStatus === "success" && (
          <>
            <p className="my-[107px] text-[#151515] text-base font-semibold font-inter leading-6 rounded-[64px] bg-[#D6FFA1] p-4">
              Imported Successfully!
            </p>
            <button
              className=" w-full px-6 py-3 bg-[#0b3ceb] text-white font-inter font-bold rounded-[48px] shadow-lg hover:bg-[#0b3ceb]/90"
              onClick={resetImport}
            >
              Import More
            </button>
          </>
        )}
        {importStatus === "error" && (
          <>
            <p className="my-[107px] text-[#151515] text-base font-semibold font-inter leading-6 rounded-[64px] bg-[#FFA1A1] p-4">
              Failed to Import!
            </p>
            <button
              className=" w-full px-6 py-3 bg-[#0b3ceb] text-white font-inter font-bold rounded-[48px] shadow-lg hover:bg-[#0b3ceb]/90"
              onClick={resetImport}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportFileCard;
