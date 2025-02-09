import { useEffect, useState } from "react";
import TabButton from "./TabButton";
import CopyToClipboard from "./CopyToClipboard";

import {
  getExistingAccountFromBackend,
  getHistoryFromBackend,
  downloadNotesFromBackend,
} from "../utils";
import { Icons } from "./icons";


interface HistoryItem {
  id: number;
  title: string;
  hash: string;
  noteId: string;
  noteData: Uint8Array,
  recipients: number;
  amount: string;
  ownerId: string;
  type: "Send" | "Receive";
}

type HistoryProps = {
  userAccountId: string;
};

const historyData: HistoryItem[] = [];


const History = ({userAccountId}: HistoryProps) => {
  const [activeTab, setActiveTab] = useState<string>("Send");

  const getHistories = async () => {
    if(!userAccountId) return;
    
    try{
      const {token} = await getExistingAccountFromBackend(userAccountId);
      const { data: _histories } = await getHistoryFromBackend(activeTab, token);
      const historyBackend: HistoryItem[] = [];
      _histories.forEach((item: any) => {
        historyBackend.push({
          id: item._id,
          title: item.title,
          noteId: item.noteId,
          noteData: item.noteData.data,
          hash: `${item._id.slice(0, 3)}...${item._id.slice(-3)}`,
          recipients: 1,
          amount: item.amount,
          ownerId: item.ownerId?.walletId,
          type: activeTab === 'Send' ? 'Send' : 'Receive'
        });
      });
      historyBackend.forEach((item) => {
        if (!historyData.some((history) => history.id === item.id)) {
          historyData.push(item);
        }
      });

    } catch (error) {
      console.error("Error fetching existing accounts:", error);
    }
  };

  const _downloadSpecificNotes = (item: any) => {
    downloadNotesFromBackend(item);
  }

  const filteredHistory = historyData.filter(
    (item) => item.type === activeTab
  );

  useEffect(() => {
    getHistories();
  }, [activeTab]);

  return (
    <div className="p-6 px-8 py-10 flex flex-col bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] w-[433px] min-h-[430px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#191711] text-2xl font-bold font-inter leading-8">
          History
        </h2>
        <div className="flex bg-white rounded-full border-2 border-[#F2F2F2] p-[2px]">
          <TabButton
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="Send"
          />
          <TabButton
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="Receive"
          />
        </div>
      </div>

      <ul className="flex flex-col gap-6 max-h-[296px]  overflow-scroll pr-5">
        {filteredHistory.map((item) => (
          <li
            key={item.hash + Date.now()}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-[#d9bbff] rounded-full flex items-center justify-center text-[#49404d] text-2xl font-bold font-inter leading-6">
                M
              </div>
              <div className="ml-3">
              <div className="w-full gap-3 flex flex-row items-center mt-2">
                <CopyToClipboard
                  textToCopy={item.hash}
                  displayText={item.title}
                  textClassName="text-[#151515] text-base font-semibold font-inter leading-6"
                />
                <button
                    onClick={() => {_downloadSpecificNotes(item)}}
                    className="text-[#151515] opacity-60"
                  >
                    <Icons.arrowDownToLine className="h-5 w-5" />
                  </button>
                  </div>
                <p className="text-[#75808a] text-sm font-medium font-inter leading-[21px]">
                  To {item.recipients} recipients
                </p>
              </div>
            </div>
            <div className="text-[#151515] text-base font-semibold font-inter leading-6">
              {item.amount} Miden
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
