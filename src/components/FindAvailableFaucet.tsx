import { checkForFaucetAccount, createNewFaucetAccount } from "../utils";
import { Icons } from "./icons";

interface FindAvailalbeFaucetsProps {
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  updateAccountBalance: () => Promise<void>;
}

const addFaucetAndUpdateBalance = async (
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>,
  updateAccountBalance: () => Promise<void>
) => {
  await checkForFaucetAccount(setActiveFaucet);
  await updateAccountBalance();
};

const FindAvailableFaucet = ({
  setActiveFaucet,
  className,
  updateAccountBalance,
}: FindAvailalbeFaucetsProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Icons.findAvailableAsset
        onClick={() => {
          addFaucetAndUpdateBalance(setActiveFaucet, updateAccountBalance);
        }}
        size={20}
      />
    </div>
  );
};

export default FindAvailableFaucet;
