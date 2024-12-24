import { useEffect, useState } from "react";

// components
import Tabs from "./components/Tabs";
import LoadingScreen from "./components/LoadingScreen";

// utils
import { createClient } from "./utils";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      await createClient();
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="App">
      <Tabs />
    </div>
  );
}
