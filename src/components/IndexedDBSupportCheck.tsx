import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

const IndexedDBSupportCheck = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      setIsSupported(false);
    } else {
      setIsSupported(true);
    }
  }, []);

  if (isSupported === null) return <LoadingScreen />;
  if (!isSupported)
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">IndexedDB Support Check</h1>

        <div className="p-4 mb-4 border border-red-300 bg-red-100 text-red-700 rounded-md">
          IndexedDB is not supported in your browser. Some features may not
          work.
        </div>
      </div>
    );

  return <>{children}</>;
};

export default IndexedDBSupportCheck;
