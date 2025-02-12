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
  checkForNonFaucetAccount,
  consumeAvailableNotes,
  createAccount,
  createAccountInBackend,
  getBalance,
  getExistingAccountFromBackend,
  importNoteFiles,
  mintFaucetAccount,
  sleep,
  syncClient,
} from "../utils";
import SignupForm from "./SignupForm";
import Navbar from "./Navbar";

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
  const [activeFaucet, setActiveFaucet] = useState(""); // Dummy faucet address
  const [accountDetailsBackend, setAccountDetailsBackend] =
    useState<AccountDetails>({} as AccountDetails);
  const [account, setAccount] = useState<Account>();
  const [selectedAccountBalance, setSelectedAccountBalance] = useState("0");
  const [isAccountCreated, setIsAccountCreated] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<string>("0");
  const [showSignupForm, setShowSignupForm] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "importing" | "success" | "error"
  >("idle");
  const [showSend, setShowSend] = useState<boolean>(false);
  const [isFaucetCreationDisabled, setFaucetCreationDisabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGoBack = (): void => {
    setShowSignupForm(false);
};

  const handleSignupSubmit = async (
    email: string,
    companyName: string,
    password: string
  ) => {
    setShowSignupForm(false);
    setIsLoading(true);

    await sleep(1000);
    const _account = await createAccount();
    const _id = _account.id().to_string();
    const userType = activeTab === "Business" ? "employer" : "employee";

    try {
      const response = await createAccountInBackend(
        _id,
        userType,
        email,
        password,
        companyName
      );
      console.log("Account created:", response);
    } catch (error) {
      console.error("Error creating account:", error);
    }

    const _balance = await getBalance(_id);
    setAccountBalance(_balance || "0");
    setUserAccountId(_id);
    setUserType(userType);
    setIsLoading(false);
    setIsAccountCreated(true);
  };

  const handleCreateAccount = async (): Promise<void> => {
    setIsLoading(true);
    await sleep(1000);
    const _account = await createAccount();
    const _id = _account.id().to_string();
    const userType = activeTab === "Business" ? "employer" : "employee";
    try {
      // createAccountInBackend(_id,userType).then(response => {
      //   setAccountDetailsBackend(response.data);
      // });
      setUserType(userType);
      console.log("usersss", userType);
    } catch (error: any) {
      console.log(error);
    }
    const _balance = await getBalance(_id);
    setAccountBalance(_balance || "0");
    setUserName(_id);
    setUserAccountId(_id);
    setIsLoading(false);
    setIsAccountCreated(true);
  };
  const handleImportClick = (): void => {
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
      await sleep(100);
      const accountDetails = await checkForNonFaucetAccount();

      if (accountDetails.nonFaucetAccount) {
        const _id = accountDetails.nonFaucetAccount;
        if (accountDetails.faucetAccount)
          setActiveFaucet(accountDetails.faucetAccount);
        if (accountDetails?.profile)
          setUserType(accountDetails?.profile.userType);
        if (accountDetails?.profile?.name)
          setAccountDetailsBackend(accountDetails?.profile);

        if(accountDetails?.profile?.faucetAccounts.length > 0){
          setActiveFaucet(accountDetails?.profile?.faucetAccounts[0]);
          setFaucetCreationDisabled(true);
        }
        setIsAccountCreated(true);
        setUserAccountId(_id);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error fetching existing accounts:", error.message);
    }
  };

  const updateAccountBalance = async () => {
    if (userAccountId && activeFaucet !== "") {
      console.log("activeFaucet", activeFaucet);
      const _balance = await getBalance(userAccountId, activeFaucet);
      setAccountBalance(_balance || "0");
    } else {
      const _balance = await getBalance(
        userAccountId,
        "0x1f2573c25f7712a0000051dd99ccd1"
      );
      setAccountBalance(_balance || "0");
    }
  };

  const exportAccount = () => {};

  useEffect(() => {
    getExistingAccounts();
  }, []);

  useEffect(() => {
    updateAccountBalance();
  }, [accountBalance, activeFaucet, userAccountId]);

  useEffect(() => {
    checkForFaucetAccount(setActiveFaucet);
  }, [activeFaucet]);

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 p-4">
    <>
      {/* {isLoading && <LoadingScreen />} */}
      {/* {!isLoading && !isAccountCreated && (
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
            // handleCreateAccount={() => setShowSignupForm(true)}
            handleImportAccount={handleImportClick}
          />
        </div>
      )} */}

      {isAccountCreated && (
        <div className="fixed top-0 left-0 w-full bg-white z-50">
          <Navbar
            companyName={accountDetailsBackend?.name}
            totalRecipients={0}
          />
        </div>
      )}

      {isLoading && <LoadingScreen />}
      {!isLoading && !isAccountCreated && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#D9BBFF] p-4">
          {showSignupForm ? (
            <SignupForm
              onSubmit={handleSignupSubmit}
              onBack={handleGoBack}
              selectedTab={activeTab}
            />
          ) : (
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
                handleCreateAccount={() => setShowSignupForm(true)}
                handleImportAccount={handleImportClick}
              />
            </>
          )}
        </div>
      )}

      {isAccountCreated && !isLoading && (
        <div className="flex flex-col mt-[88px] lg:mt-[40px] min-h-screen lg:flex-row justify-center items-center gap-6 p-8 bg-white">
          <AccountCard
            username={userName}
            balance={accountBalance}
            privateKey="0xdhb3rg3g8rfgffgeuyfbefbfhbfrebijbhfssbu4gf74gsbjd"
            walletAddress={userAccountId}
            onImportClick={handleImportClick}
            onSendClick={handleSendClick}
            activeFauct={activeFaucet}
            setActiveFaucet={setActiveFaucet}
            updateAccountBalance={updateAccountBalance}
            userType={userType}
            isFaucetCreationDisabled={isFaucetCreationDisabled}
          />

          {selectedFile ? (
            <ImportFileCard
              selectedFile={selectedFile}
              importStatus={importStatus}
              // handleImportFile={handleImportFile}
              resetImport={resetImport}
            />
          ) : showSend ? (
            <Send
              onClose={handleCloseSend}
              balance={accountBalance}
              userAccountId={userAccountId}
              activeFaucet={activeFaucet}
              updateAccountBalance={updateAccountBalance}
              userType={userType}
            />
          ) : (
            <History
              userAccountId={userAccountId}
              updateAccountBalance={updateAccountBalance}
            />
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
