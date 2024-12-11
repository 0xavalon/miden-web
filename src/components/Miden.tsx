import { useEffect, useState } from "react";
import { AccountHeader } from "@demox-labs/miden-sdk";
import {
  createAccount,
  createClient,
  getAccounts,
  recoverSecretKey,
} from "../utils";

export default function Miden() {
  const [accounts, setAccounts] = useState<AccountHeader[]>([]);
  const [recoverAccountId, setRecoverAccountId] = useState("");

  const fetchAccounts = async () => {
    const _accounts = await getAccounts();
    console.log(_accounts);
    setAccounts(_accounts);
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

  return (
    <div>
      <button onClick={fetchAccounts}>fetch account</button>
      <button onClick={createAccount}>create account</button>

      <div>
        <input
          type="text"
          value={recoverAccountId}
          placeholder="Enter Account ID"
          onChange={(e) => setRecoverAccountId(e.target.value)}
        />
        <button onClick={retrieveSecretKey}>Retrieve Secret Key</button>
      </div>
      {/* {accounts?.map((account) =>{
        const id = account.id().to_string();
        const hash = account.hash().to_hex();
        return (
          <div key={id}>
            <div>id: {id}</div>
            <div>hash: {hash}</div>
          </div>
        );
      })} */}
    </div>
  );
}
