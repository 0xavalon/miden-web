import { createNewFaucetAccount } from "../utils";
import { Icons } from "./icons";

interface GenerateNewFaucetProps {
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

const GenerateNewFaucet = ({
  setActiveFaucet,
  className
}: GenerateNewFaucetProps) => {

  return (
    <div className={`flex items-center ${className}`}>
      <Icons.addCustomAsset
            // onClick={() => createNewFaucetAccount(setActiveFaucet)}
            size={20}
          />
    </div>
  );
};

export default GenerateNewFaucet;
