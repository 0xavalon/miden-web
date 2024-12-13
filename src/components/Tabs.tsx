import { useState, useRef } from "react";
import LoadingScreen from "./LoadingScreen";
import TabContent from "./TabContent";
import TabButton from "./TabButton";
import AccountCard from "./AccountCard";
import ImportFileCard from "./ImportFileCard";
import Send from "./Send";
import History from "./History";
import { createAccount } from "../utils/index";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<string>("Business");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState("");
  const [userAccountId, setUserAccountId] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [isAccountCreated, setIsAccountCreated] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<
    "idle" | "importing" | "success" | "error"
  >("idle");
  const [showSend, setShowSend] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleCreateAccount = async (): Promise<void> => {
    setIsLoading(true);
    await sleep(1000);
    const _account = await createAccount();
    console.log("_account", _account);
    setIsLoading(false);
    setIsAccountCreated(true);
};
  const handleImportClick = (): void => {
    // Close Send view and open Import view
    setShowSend(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      setImportStatus("idle");
      setShowSend(false); // Ensure Send is closed
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportFile = (): void => {
    if (!selectedFile) return;

    setImportStatus("importing");
    setTimeout(() => {
      const isSuccess = Math.random() > 0.5;
      setImportStatus(isSuccess ? "success" : "error");
    }, 2000);
  };

  const resetImport = (): void => {
    setSelectedFile(null);
    setImportStatus("idle");
  };

  const handleSendClick = (): void => {
    // Close Import view and open Send view
    setSelectedFile(null);
    setImportStatus("idle");
    setShowSend(true);
  };

  const handleCloseSend = () => {
    setShowSend(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 p-4">
      {isLoading && <LoadingScreen />}
      {!isLoading && !isAccountCreated && (
        <>
          <div className="flex bg-white rounded-full shadow-md p-1 w-[420px]">
            <TabButton
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabName="Business"
            />
            <TabButton
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabName="Employee"
            />
          </div>

          <TabContent
            title={
              activeTab === "Business"
                ? "Create a business account"
                : "Create an employee account"
            }
            description={
              activeTab === "Business"
                ? "Create an account to enable bulk fund disbursement"
                : "Create an account to manage your personal tasks"
            }
            handleCreateAccount={handleCreateAccount}
          />
        </>
      )}

      {isAccountCreated && !isLoading && (
        <div className="flex flex-col lg:flex-row justify-center items-center gap-6 p-8 bg-white">
          <AccountCard
            username={userName}
            balance="0"
            privateKey="0xdhb3rg3g8rfgffgeuyfbefbfhbfrebijbhfssbu4gf74gsbjd"
            walletAddress="0xdhb3rg3g8rfgffgeuyfbefbfhbfrebijbhfssbu4gf74gsbjd"
            onImportClick={handleImportClick}
            onSendClick={handleSendClick}
          />

          {selectedFile ? (
            <ImportFileCard
              selectedFile={selectedFile}
              importStatus={importStatus}
              handleImportFile={handleImportFile}
              resetImport={resetImport}
            />
          ) : showSend ? (
            <Send onClose={handleCloseSend} />
          ) : (
            <History />
          )}

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default Tabs;
