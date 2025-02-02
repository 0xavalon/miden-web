import { useState, useRef, useEffect } from "react";

// components
import { Icons } from "./icons";
import CopyToClipboard from "./CopyToClipboard";

// images
import bg from "../assets/images/purple-bg.png";

interface AccountCardProps {
  username: string;
  balance: string;
  privateKey: string;
  walletAddress: string;
  onImportClick: () => void;
  onSendClick: () => void;
  walletId: string;
}

const AccountCard = ({
  username,
  balance,
  privateKey,
  walletAddress,
  onImportClick,
  onSendClick,
  walletId,
}: AccountCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

  const toggleTooltip = () => setShowTooltip((prev) => !prev);

  const handleDownload = () => {
    try {
      const fileContent = JSON.stringify(
        {
          username,
          balance,
          privateKey,
          walletAddress,
        },
        null,
        2 // Indentation for readability
      );
      _createNDownloadFile(fileContent);
    } catch (error: any) {
      console.log(error?.message);
    }
  };

  const _createNDownloadFile = (fileContent: any) => {
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = `${username}_backup.mac`; // File name
    console.log("downloading...", downloadRef.current);

    // Append the anchor to the document body
    document.body.appendChild(tempLink);
    tempLink.click(); // Trigger download
    document.body.removeChild(tempLink); // Remove the anchor from the DOM

    URL.revokeObjectURL(url); // Clean up the URL object
  };

  // Close the tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div
      className="flex flex-col justify-between w-[433px] h-[430px] rounded-[32px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="bg-yellow-200 p-4 rounded-full flex items-center">
          <CopyToClipboard
            textToCopy={username}
            textClassName="text-[#151515] text-base font-semibold leading-6"
          />
        </div>
        <div className="relative" ref={tooltipRef}>
          <button
            onClick={handleDownload}
            className="bg-[#0b3ceb] px-6 py-4 rounded-[64px]"
          >
            <span className="text-white text-base font-semibold font-inter leading-6">
              Export Acc
            </span>
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute top-[-100%] right-0 -left-[364.4px] bg-white shadow-lg rounded-lg p-4 w-[806px] border">
              <div className="flex flex-row gap-8">
                <div className="flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Private key</p>
                  <p className="text-black text-xs font-mono truncate">
                    {privateKey}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Wallet address</p>
                  <p className="text-black text-xs font-mono truncate">
                    {walletAddress}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 text-left px-8">
        <p className="text-[#151515] text-base font-semibold font-inter leading-6">
          Account balance
        </p>
        <h1 className="mt-4 text-4xl font-bold text-black">{balance} Miden</h1>
        <div className="flex items-center mt-2">
          <CopyToClipboard
            textToCopy="0x29b86f9443ad907a"
            displayText="0x29b86f9443ad907a"
            className="mt-2"
            textClassName="text-xl font-semibold leading-[16px] text-[#151515] opacity-60"
          />
        </div>
      </div>
      <div className="flex justify-between gap-4 mt-6 px-8 pb-8">
        <button
          onClick={onImportClick}
          className="flex items-center justify-center w-[174px] px-4 py-4 bg-white border rounded-full shadow"
        >
          <Icons.import />
          <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
            Import Notes
          </span>
        </button>
        <button
          onClick={onSendClick}
          className="flex items-center justify-center w-[174px] px-4 py-4 bg-white border rounded-full shadow"
        >
          <Icons.send />
          <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
            Send
          </span>
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
