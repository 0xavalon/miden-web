import { useState, useRef, useEffect } from "react";

import { Icons } from "./icons";
import CopyToClipboard from "./CopyToClipboard";

import bg from "../assets/images/purple-bg.png";
import FindAvailableFaucet from "./FindAvailableFaucet";
import { createNewFaucetAccount, mintFaucetAccount } from "../utils";

interface AccountCardProps {
  username: string;
  balance: string;
  privateKey: string;
  walletAddress: string;
  onImportClick: () => void;
  onSendClick: () => void;
  activeFauct: string;
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>;
  updateAccountBalance: () => Promise<void>;
  userType: string;
  isFaucetCreationDisabled: boolean;
  setFauctCreationDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const AccountCard = ({
  username,
  balance,
  privateKey,
  walletAddress,
  onImportClick,
  onSendClick,
  activeFauct,
  setActiveFaucet,
  updateAccountBalance,
  userType,
  isFaucetCreationDisabled,
  setFauctCreationDisabled,
}: AccountCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMintingButton, setShowMinitingButton] = useState(true);
  const [faucetCreationString, setFaucetCreationString] =
    useState("Deploy Faucet");
  const [mintFaucetString, setMintFaucetString] = useState("10000 Faucet");
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

  const handleAddFaucetBalance = async () => {
    setShowMinitingButton(false);
    setMintFaucetString("Minting...");
    const isAdded = await mintFaucetAccount(walletAddress, activeFauct, 10000);
    if (isAdded) {
      updateAccountBalance();
      setMintFaucetString("Minted");
    } else {
      console.log("Failed to add new faucet balance");
      setMintFaucetString("Failed");
    }
    setShowMinitingButton(true);
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
          <Icons.wallet className="pr-1" />
          <CopyToClipboard
            textToCopy={walletAddress}
            textClassName="text-[#151515] text-base font-semibold leading-6"
          />
        </div>
        <div className="relative" ref={tooltipRef}>
          {/* <button
            onClick={handleDownload}
            className="bg-[#0b3ceb] px-6 py-4 rounded-[64px]"
          >
            <span className="text-white text-base font-semibold font-inter leading-6">
              Export Acc
            </span>
          </button> */}

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
        {activeFauct && (
          <div className="flex items-center mt-2">
            <CopyToClipboard
              textToCopy={activeFauct}
              displayText={activeFauct}
              className="mt-2"
              textClassName="text font-semibold leading-[16px] text-[#151515] opacity-60"
            />

            {/* <GenerateNewFaucet
            className="mt-2 ml-2 text-[#151515] opacity-60 text font-semibold"
            setActiveFaucet={setActiveFaucet}
          /> */}

            <FindAvailableFaucet
              className="mt-2 ml-2 text-[#151515] opacity-60 text font-semibold"
              setActiveFaucet={setActiveFaucet}
              updateAccountBalance={updateAccountBalance}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 mt-6 px-8 pb-8">
        <div className="flex justify-between ">
          <button
            onClick={onImportClick}
            className="flex items-center justify-center w-[174px] px-3 py-2 bg-white border rounded-full shadow"
          >
            <Icons.import />
            <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
              Import Notes
            </span>
          </button>
          <button
            onClick={onSendClick}
            className={`flex items-center justify-center w-[174px] px-3 py-2 bg-white border rounded-full shadow ${
              activeFauct && Number(balance)
                ? ""
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!activeFauct || Number(balance) === 0}
          >
            <Icons.send />
            <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
              Send
            </span>
          </button>
        </div>
        {userType === "employer" && (
          <div className="flex justify-between ">
            <button
              onClick={() => {
                setFaucetCreationString("Creating...");
                setFauctCreationDisabled(true);
                setShowMinitingButton(false);
                createNewFaucetAccount(setActiveFaucet, walletAddress).then(
                  () => {
                    setFaucetCreationString("Deployed");
                  }
                );
                setShowMinitingButton(true);
              }}
              className={`flex items-center justify-center w-[174px] px-3 py-2 bg-white border rounded-full shadow ${
                isFaucetCreationDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isFaucetCreationDisabled}
            >
              <Icons.deployFaucet />
              <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
                {faucetCreationString}
              </span>
            </button>
            <button
              onClick={handleAddFaucetBalance}
              className={`flex items-center justify-center w-[174px] px-3 py-2 bg-white border rounded-full shadow ${
                !showMintingButton ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!showMintingButton}
            >
              <Icons.plus />
              <span className="text-[#151515] text-base font-semibold font-inter leading-normal ml-2">
                {mintFaucetString}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountCard;
