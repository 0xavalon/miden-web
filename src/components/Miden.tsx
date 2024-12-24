import { useEffect, useState } from "react";
import { AccountHeader } from "@demox-labs/miden-sdk";
import { createAccount, createClient, recoverSecretKey } from "../utils";

export default function Miden() {
  const [accounts, setAccounts] = useState<AccountHeader[]>([]);
  const [recoverAccountId, setRecoverAccountId] = useState("");

  const fetchAccounts = async () => {
    // const _accounts = await getAccounts();
    // console.log(_accounts);
    // setAccounts(_accounts);
  };

  useEffect(() => {
    const fetchData = async () => {
      await createClient();
      fetchAccounts();
    };

    fetchData();
  }, []);

  const retrieveSecretKey = async () => {
    console.log(`Recover account id: ${recoverAccountId}`);
    const keys = await recoverSecretKey(recoverAccountId);
    console.log("keys", keys);
    // console.log(encodeFeltArrayToHex(recoverAccountId))
    // console.log(encodeToBase64(recoverAccountId))
  };

  return <div></div>;
}
