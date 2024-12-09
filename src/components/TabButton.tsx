
interface TabButtonProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabName: string;
}

const TabButton = ({ activeTab, setActiveTab, tabName }: TabButtonProps) => {
  return (
    <button
      className={`w-1/2 px-6 py-2 rounded-full ${
        activeTab === tabName ? "bg-[#fffaa1]" : "bg-transparent"
      } font-medium text-gray-700`}
      onClick={() => setActiveTab(tabName)}
    >
      {tabName}
    </button>
  );
};

export default TabButton;
