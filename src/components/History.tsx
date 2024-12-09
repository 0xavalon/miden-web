interface HistoryItem {
  id: number;
  title: string;
  recipients: number;
  amount: string;
}

const historyData: HistoryItem[] = [
  { id: 1, title: "December123", recipients: 5, amount: "6,000 Miden" },
  { id: 2, title: "December123", recipients: 5, amount: "6,000 Miden" },
  { id: 3, title: "December123", recipients: 5, amount: "6,000 Miden" },
  { id: 4, title: "December123", recipients: 5, amount: "6,000 Miden" },
];

const History = () => {
  return (
    <div className="p-6 px-8 py-10 flex flex-col bg-white rounded-[32px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] w-[433px] min-h-[430px]">
      <h2 className="text-[#191711] text-2xl font-bold font-inter leading-8 mb-4">
        History
      </h2>
      <ul className="flex flex-col gap-6">
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
