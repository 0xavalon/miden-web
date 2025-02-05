import { useState, useRef, useEffect } from "react";
import { Account } from "@demox-labs/miden-sdk";

// components
import LoadingScreen from "./LoadingScreen";
import TabContent from "./TabContent";
import TabButton from "./TabButton";
import AccountCard from "./AccountCard";
import ImportFileCard from "./ImportFileCard";
import Send from "./Send";
import History from "./History";

// utils
import {
  checkForFaucetAccount,
  consumeAvailableNotes,
  createAccount,
  createCompanyAccountInBackend,
  getAccountId,
  getAccountsFromDb,
  getBalance,
  getExistingAccountFromBackend,
  importNoteFiles,
  sleep,
  syncClient,
} from "../utils";

interface AccountDetails {
  _id: string;
  name: string;
  email: string;
  userType: string;
  companyName?: string;
  notesCreated: number;
  canCreateMultipleNotes: boolean;
  createdAt: string;
}

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<string>("Business");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState("");
  const [userAccountId, setUserAccountId] = useState("");
  const [userType, setUserType] = useState("");
  const [faucet, setFaucet] = useState<Account | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetails>({} as AccountDetails);
  const [account, setAccount] = useState<Account>();
  const [selectedAccountBalance, setSelectedAccountBalance] = useState("0");
  const [isAccountCreated, setIsAccountCreated] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<string>("");
  const [importStatus, setImportStatus] = useState<
    "idle" | "importing" | "success" | "error"
  >("idle");
  const [showSend, setShowSend] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreateAccount = async (): Promise<void> => {
    setIsLoading(true);
    await sleep(1000);
    const _account = await createAccount();
    const _id = _account.id().to_string();
    const userType = activeTab === "Business" ? "employer" : "employee";
    try{
      const response = await createCompanyAccountInBackend(_id,userType);
      setAccountDetails(response);
      setUserType(response.userType);
    } catch (error: any) {
      console.log(error);
    }
    const _balance = await getBalance(_id);
    setAccountBalance(_balance || "");
    setSelectedAccountBalance(_balance || "");
    setAccount(_account);
    setUserName(_id);
    setUserAccountId(_id);
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
      handleImportFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportFile = async (file: File) => {
    if (!file) return;
    setImportStatus("importing");
    await _consumeAvailableNotes(file);
    setTimeout(() => {
      const isSuccess = Math.random() > 0.5;
      setImportStatus(isSuccess ? "success" : "error");
    }, 2000);
  };

  const _consumeAvailableNotes = async (file: File) => {
    await importNoteFiles(file);
    await sleep(3000); // Artificial wait, Need to understand more!
    await syncClient();
    await consumeAvailableNotes(userAccountId);
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

  const getExistingAccounts = async () => {
    try {
      setIsLoading(true);
      await sleep(1000);
      const accounts = await getAccountsFromDb();

      if (accounts.length > 0) {
        const _id = accounts[0].id().to_string();
        try {
          // const accountDetails = await getExistingAccountFromBackend(_id);
          setAccountDetails(accountDetails);
        } catch(error: any) {
          console.error("Error fetching account details:", error.message);
        }

        try {
          const _faucet = await checkForFaucetAccount();
          if(_faucet) {
            setFaucet(_faucet);
          }
        } catch (error) {
          console.error("Error creating new faucet account:", error);
        }

        const _balance = await getBalance(_id);
        setIsAccountCreated(true);
        setAccount(accounts[0] as unknown as Account);
        setUserName(_id);
        setSelectedAccountBalance(_balance || "");
        setUserAccountId(_id);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error fetching existing accounts:", error.message);
    }
  };

  const exportAccount = () => {};

  useEffect(() => {
    getExistingAccounts();
  }, [accountBalance]);

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 p-4">
    <>
      {isLoading && <LoadingScreen />}
      {!isLoading && !isAccountCreated && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#D9BBFF] p-4">
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
            handleImportAccount={handleImportClick}
          />
        </div>
      )}

      {isAccountCreated && !isLoading && (
        <div className="flex flex-col min-h-screen lg:flex-row justify-center items-center gap-6 p-8 bg-white">
          <AccountCard
            username={userName}
            balance={selectedAccountBalance}
            privateKey="0xdhb3rg3g8rfgffgeuyfbefbfhbfrebijbhfssbu4gf74gsbjd"
            walletAddress="0xdhb3rg3g8rfgffgeuyfbefbfhbfrebijbhfssbu4gf74gsbjd"
            onImportClick={handleImportClick}
            onSendClick={handleSendClick}
            walletId = {userAccountId}
          />

          {selectedFile ? (
            <ImportFileCard
              selectedFile={selectedFile}
              importStatus={importStatus}
              // handleImportFile={handleImportFile}
              resetImport={resetImport}
            />
          ) : showSend ? (
            <Send onClose={handleCloseSend} />
          ) : (
            <History />
          )}

          {/* <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          /> */}
        </div>
      )}
      {/* </div> */}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default Tabs;
