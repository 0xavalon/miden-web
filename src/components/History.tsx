import { useEffect, useState } from "react";
import { WebClient } from "../../node_modules/@demox-labs/miden-sdk/dist/index";
import {
  sleep,
  getAccountsFromDb,
  getBalance,
  getAccountHistory,
} from "../utils/index";

interface HistoryItem {
  id: number;
  title: string;
  recipients: number;
  amount: string;
}

const historyData: HistoryItem[] = [];

const History = () => {
  const [activeTab, setActiveTab] = useState<string>("Business");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState("");
  const [userAccountId, setUserAccountId] = useState("");
  const [account, setAccount] = useState("");
  const [selectedAccountBalance, setSelectedAccountBalance] = useState("0");
  const [isAccountCreated, setIsAccountCreated] = useState<boolean>(false);

  const getHistories = async () => {
    const histories = await getAccountHistory(userAccountId);
    historyData.push(...histories);
  };

  const getUserAccount = async () => {
    try {
      setIsLoading(true);
      await sleep(1000);
      const accounts = await getAccountsFromDb();

      if (accounts.length > 0) {
        const _id = accounts[0].id().to_string();
        const _balance = await getBalance(_id);
        setIsAccountCreated(true);
        setAccount(accounts[0]);
        setUserName(_id);
        setSelectedAccountBalance(_balance);
        setUserAccountId(_id);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching existing accounts:", error.message);
    }
  };

  useEffect(() => {
    getUserAccount();
    getHistories();
  }, []);

  return (
    <div className="p-6 px-8 py-10 flex flex-col bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] w-[433px] min-h-[430px]">
      <h2 className="text-[#191711] text-2xl font-bold font-inter leading-8 mb-4">
        History
      </h2>
      <ul className="flex flex-col gap-6 max-h-[296px]  overflow-scroll pr-5">
        {historyData.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-[#d9bbff] rounded-full flex items-center justify-center text-[#49404d] text-2xl font-bold font-inter leading-6">
                M
              </div>
              <div className="ml-3">
                <p className="text-[#151515] text-base font-semibold font-inter leading-6">
                  {item.title}
                </p>
                <p className="text-[#75808a] text-sm font-medium font-inter leading-[21px]">
                  To {item.recipients} recipients
                </p>
              </div>
            </div>
            <div className="text-[#151515] text-base font-semibold font-inter leading-6">
              {item.amount}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
