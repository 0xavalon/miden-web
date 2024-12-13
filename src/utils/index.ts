import { Buffer } from "buffer";
import {
  AccountId,
  AccountStorageMode,
  WebClient,
  NoteType,
  TransactionRequest,
  AccountHeader,
} from "@demox-labs/miden-sdk";
import exp from "constants";

const webClient = new WebClient();

export const createClient = async () => {
  await webClient.create_client();
};

export const getAccountsFromDb = async () => {
  const _accounts = await webClient.get_accounts();
  return _accounts;
};

export const getBalance = async (accountId: any, faucetAccountId: AccountId = "0x29b86f9443ad907a") => {
  let _accountId;
  if (typeof accountId === "string") {
    if (!accountId) {
      console.error("accountId is undefined or empty.");
      return null; // Handle undefined or empty accountId
    }
    _accountId = AccountId.from_hex(accountId);
  } else {
    _accountId = accountId;
  }

  const faucetAccount = AccountId.from_hex(faucetAccountId);
  let _account = await getAccountDetails(_accountId);
  let _balance = _account.vault().get_balance(faucetAccount)
  return _balance.toString();
}

export const getAccountId = (accountId: any) => {
  const _account = AccountId.from_hex(accountId);
  return _account;
};

export const importNoteFiles = async (file: File): Promise<void> => {
  // const file = event.target.files?.[0]; // Check if a file is selected
  if (file) {
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer; // Assert type
        const byteArray = new Uint8Array(arrayBuffer);
        console.log(byteArray);

        try {
          await webClient.import_note(byteArray, true); // Assuming `webClient` is correctly typed
          console.log('Note successfully imported!');
        } catch (error) {
          console.error('Error importing note:', error);
        }
      }
    };

    reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
  }
};


export const importAccount = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
  const file = event.target.files?.[0]; // Ensure the file exists
  if (file) {
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer; // Type assertion
        const byteArray = new Uint8Array(arrayBuffer);
        console.log(byteArray);

        try {
          await webClient.import_account(byteArray); // Assuming `webClient` is typed correctly
          console.log('Account successfully imported!');
        } catch (error) {
          console.error('Error importing account:', error);
        }
      }
    };

    reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
  }
};


export const getAccountDetails = async (accountId: AccountId) => {
  try {
    const _accountDetails = await webClient.get_account(accountId);
    return _accountDetails;
  } catch(error) {
    console.log("error fetching account details", error.message);
  }
};

export const createAccount = async () => {
  console.log("creating new account ... ");
  let newAccount = await webClient.new_wallet(
    AccountStorageMode.private(),
    true
  );
  console.log('new account',newAccount);
  return newAccount;
};

export const _getKeys = async (accountId: AccountId) => {
  const result = await webClient.fetch_and_cache_account_auth_by_pub_key(
    accountId
  );
  const getAccountAuth = await webClient.get_account_auth(accountId);
  console.log("Auth", getAccountAuth);

  const _keys = {
    publicKey: result.get_rpo_falcon_512_public_key_as_word(),
    secretKey: result.get_rpo_falcon_512_secret_key_as_felts(),
  };

  // const recoverAccounts = await webClient.import_account(_keys.secretKey);
  // console.log("recover response: ", recoverAccounts);

  return _keys;
};

export const recoverSecretKey = async (recoverAccountId: string) => {
  console.log(`Recover account id: ${recoverAccountId}`);
  let accountId = AccountId.from_hex(recoverAccountId);
  const _accountDetails = await webClient.get_account(accountId);
  const keys = await _getKeys(_accountDetails.id());
  return keys;
};

export const createNotes = async (sender: string, target: string) => {
  // Setup note arguments
  //  const ownOutputNotes = [];
  //  const noteType = NoteType.private;
  //  let transactions = new TransactionRequest();
  //  let notes = transactions.with_own_output_notes(ownOutputNotes);
  //  return notes;
};

const encodeFeltArrayToHex = (feltArray: { __wbg_ptr: number }[]) => {
  // Convert each `__wbg_ptr` value to hex and pad to 8 characters
  return feltArray
    .map((item) => item.__wbg_ptr.toString(16).padStart(8, "0")) // Convert to hex and pad
    .join(""); // Concatenate all values into a single string
};

const decodeHexToFeltArray = (hexString: {
  match: (arg0: RegExp) => any[];
  map: (arg0: (chunk: any) => { __wbg_ptr: number }) => any;
}) => {
  // Split the hex string into chunks of 8 characters (32 bits each)
  const chunks = hexString.match(/.{1,8}/g);

  // Convert each chunk back to decimal and wrap in an object
  return chunks.map((chunk) => ({
    __wbg_ptr: parseInt(chunk, 16), // Convert back to integer
  }));
};

const encodeToBase64 = (feltArray: {
  map: (arg0: (item: any) => any) => Uint32Array;
}) => {
  // Create a Uint32Array from `__wbg_ptr` values
  const uintArray = new Uint32Array(feltArray.map((item) => item.__wbg_ptr));

  // Convert to a Buffer and then encode to Base64
  return Buffer.from(uintArray.buffer).toString("base64");
};

const decodeFromBase64 = (base64String: string) => {
  // Decode Base64 back to a Buffer
  const buffer = Buffer.from(base64String, "base64");

  // Create a Uint32Array from the buffer and map back to the Felt array
  const uintArray = new Uint32Array(buffer.buffer);
  return Array.from(uintArray).map((value) => ({ __wbg_ptr: value }));
};
