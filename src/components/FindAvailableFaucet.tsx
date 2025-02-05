import { checkForFaucetAccount, createNewFaucetAccount } from "../utils";
import { Icons } from "./icons";

interface FindAvailalbeFaucetsProps {
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

const FindAvailableFaucet = ({
  setActiveFaucet,
  className
}: FindAvailalbeFaucetsProps) => {

  return (
    <div className={`flex items-center ${className}`}>
      <Icons.findAvailableAsset
            onClick={() => {checkForFaucetAccount(setActiveFaucet)}}
            size={20}
          />
    </div>
  );
};

export default FindAvailableFaucet;
