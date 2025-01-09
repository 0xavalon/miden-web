import { useState } from "react";
import { CheckCheck, Copy } from "lucide-react";

interface CopyToClipboardProps {
  textToCopy: string;
  displayText?: string;
  className?: string;
  textClassName?: string;
}

const CopyToClipboard = ({
  textToCopy,
  displayText,
  className,
  textClassName,
}: CopyToClipboardProps) => {
  const [isCopy, setIsCopy] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopy(true);

    setTimeout(() => {
      setIsCopy(false);
    }, 500);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <p className={`font-manrope ${textClassName}`}>
        {displayText || textToCopy}
      </p>
      <button
        onClick={copyToClipboard}
        className="inline-flex items-center text-center font-manrope text-2xl font-semibold leading-[16px] text-[#151515] opacity-60 pl-3"
      >
        {isCopy ? (
          <CheckCheck className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default CopyToClipboard;
