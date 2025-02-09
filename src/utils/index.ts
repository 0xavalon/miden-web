import { Buffer } from "buffer";
import {
  AccountId,
  AccountStorageMode,
  WebClient,
  FeltArray,
  FungibleAsset,
  NoteType,
  NoteTag,
  Note,
  NoteFilter,
  NoteFilterTypes,
  NoteAssets,
  NoteExecutionHint,
  NoteRecipient,
  NoteInputs,
  NoteExecutionMode,
  TransactionFilter,
  NoteMetadata,
  OutputNote,
  OutputNotesArray,
  TransactionRequestBuilder,
  Word,
  NoteScript,
} from "@demox-labs/miden-sdk";

import axios from "axios";

const webClient = new WebClient();
const nodeEndpoint = "http://localhost:57291";
const API_URL = `http://localhost:5001`;
let activeFaucet = "0xee1a629024782da00000150b382c06";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const _getAccountId = (accountId: any) => {
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
  return _accountId;
};

export const createClient = async () => {
  await sleep(100);
  await webClient.create_client(nodeEndpoint);
};

export const getAccountsFromDb = async () => {
  await sleep(100);
  const _accounts = await webClient.get_accounts();
  return _accounts;
};

export const checkForFaucetAccount = async (
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>
) => {
  const _allAccounts = await getAccountsFromDb();
  let _faucetAccount = activeFaucet;
  for (const account of _allAccounts) {
    const _id = account.id().to_string();
    const _accountDetails = await getAccountDetails(AccountId.from_hex(_id));

    if (_accountDetails?.is_faucet()) {
      setActiveFaucet(_id);
      return _id;
    }
  }

  if (_faucetAccount) {
    return _faucetAccount;
  }
  return activeFaucet;
};

export const checkForNonFaucetAccount = async () => {
  const _allAccounts = await getAccountsFromDb();
  const accounts: {nonFaucetAccount: string, faucetAccount: string} = {
    nonFaucetAccount: "",
    faucetAccount: activeFaucet
  };

  console.log('all accounts', _allAccounts, accounts);

  for (const account of _allAccounts) {
    const _id = account.id().to_string();
    const _accountDetails = await getAccountDetails(AccountId.from_hex(_id));

    if (!_accountDetails?.is_faucet()) {
      accounts.nonFaucetAccount = _id;
      const _faucetId = await checkForFaucetAccount(() => {});
      if(_faucetId) {
        accounts.faucetAccount = _faucetId;
      }
    }
  }

  return accounts;
};

export const createNewFaucetAccount = async (
  setActiveFaucet: React.Dispatch<React.SetStateAction<string>>
) => {
  await syncClient();
  const faucetId = await webClient.new_faucet(
    AccountStorageMode.private(),
    false,
    "MIDEN",
    6,
    BigInt(1_000_000_000)
  );
  const faucetIdHex = faucetId.id().to_string();
  setActiveFaucet(faucetIdHex);
  await webClient.fetch_and_cache_account_auth_by_pub_key(
    AccountId.from_hex(faucetIdHex)
  );
  const accountDetails = await webClient.get_account(
    AccountId.from_hex(faucetIdHex)
  );
  return accountDetails;
};

export const mintFaucetAccount = async (
  accountId: string,
  faucetId: string,
  amount: any,
) => {
  try {
    if(!accountId || faucetId === '') return;
    console.log('==============', accountId, faucetId, amount);
    await syncClient();

    console.log('minting asset');
    await webClient.fetch_and_cache_account_auth_by_pub_key(AccountId.from_hex(accountId));
    await webClient.fetch_and_cache_account_auth_by_pub_key(AccountId.from_hex(faucetId));
    await webClient.new_mint_transaction(
      AccountId.from_hex(accountId),
      AccountId.from_hex(faucetId),
      NoteType.private(),
      BigInt(amount)
    );
    await syncClient();

    try {
      const mintedNotes = await webClient.get_consumable_notes(AccountId.from_hex(accountId));
      const mintedNoteIds = mintedNotes.map((n) =>
        n.input_note_record().id().to_string()
      );
      console.log("Minted note IDs:", mintedNoteIds);

      console.log("Consuming minted notes...");
      await webClient.new_consume_transaction(AccountId.from_hex(accountId), mintedNoteIds);
      await syncClient();
      console.log("Notes consumed.");
      return true;
    } catch (error) {
      console.log("errror", error);
    }
  } catch (error) {
    console.log("error in minting asset", error);
    return false;
  }
  return false;
};

export const getBalance = async (
  accountId: string,
  faucetAccountId: string = activeFaucet
) => {
  if(!accountId || faucetAccountId === '' ) return;
  faucetAccountId = activeFaucet;
  let _accountId = AccountId.from_hex(accountId);
  const faucetAccount = AccountId.from_hex(faucetAccountId);
  let _account = await getAccountDetails(_accountId);
  let _balance = _account?.vault().get_balance(faucetAccount);
  return _balance?.toString();
};

export const getAccountId = (accountId: string) => {
  const _account = AccountId.from_hex(accountId);
  return _account;
};

export const downloadNotesFromHash = async (item: any) => {
  const outputNotes = item.outputNotes.notes().map((note: any) => {
    return note.id().to_string();
  });

  let outputNotesData = await _exportNotesArray(outputNotes);
  console.log("output note data", outputNotesData);

  for (let i = 0; i < outputNotesData.length; i++) {
    exportNote(
      new Uint8Array(outputNotesData[i].noteData),
      `${outputNotesData[i].noteId}.mno`
    );
  }
};

export const downloadNotesFromBackend = async (item: any) => {
  exportNote(
    item.noteData,
    `${item.ownerId ? item.ownerId : item.noteId}_${item.amount}.mno`
  );
};

export const importNoteFiles = async (file: File): Promise<void> => {
  if (file) {
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer; // Assert type
        const byteArray = new Uint8Array(arrayBuffer);

        try {
          await sleep(100);
          await webClient.import_note(byteArray); // Assuming `webClient` is correctly typed
          console.log("Note successfully imported!");
        } catch (error) {
          console.error("Error importing note:", error);
        }
      }
    };

    reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
  }
};

export const getAccountHistory = async () => {
  const historyList: {
    id: any;
    title: string;
    hash: string;
    type: "Send" | "Receive";
    recipients: any;
    amount: string;
    outputNotes?: OutputNotesArray;
  }[] = [];
  const sendHistories = await webClient.get_transactions(
    TransactionFilter.all()
  );
  const inputNote = await webClient.get_input_notes(
    new NoteFilter(NoteFilterTypes.Consumed)
  );
  inputNote.map((history: any, index: any) => {
    try {
      let id = index;
      let hash = history.consumer_transaction_id();
      let title = `${hash.slice(0, 3)}...${hash.slice(-3)}`;
      let amount = history.details().assets().assets()[0].amount().toString();
      let recipients = 1;
      // let recipients = history.metadata().sender().to_string();

      historyList.push({
        id,
        hash,
        type: "Receive",
        title,
        amount,
        recipients,
      });
    } catch (error) {
      console.log(error);
    }
  });

  sendHistories.map((history: any, index: any) => {
    let totalAmount = 0;
    const outputNotes = history.output_notes();
    const totalNotes = outputNotes.num_notes();
    const type = "Send";
    const hash = history.id().to_hex();
    for (let i = 0; i < totalNotes; i++) {
      const amount = outputNotes.notes()[i].assets().assets()[0].amount(); // assuming single asset
      totalAmount += Number(amount);
    }
    if (Number(totalNotes) > 0) {
      historyList.push({
        id: index,
        type: type,
        title: `${hash.slice(0, 3)}...${hash.slice(-3)}`,
        hash: hash,
        recipients: totalNotes,
        amount: totalAmount.toString(),
        outputNotes: outputNotes,
      });
    }
  });
  return historyList;
};

export const syncClient = async () => {
  try {
    console.log("Attempting to sync the client ...", new Date());
    await sleep(20000);
    await webClient.create_client(nodeEndpoint);
    await webClient.sync_state();
    console.log("syncing done ...", new Date());
  } catch (error: any) {
    console.log("Error syncing accounts: ", error);
  }
};

export const consumeAvailableNotes = async (targetAccount: string) => {
  //temp1[0].input_note_record().details().assets().assets()[0].faucet_id().to_string() => Faucet Id
  await webClient.create_client(nodeEndpoint);
  await webClient.fetch_and_cache_account_auth_by_pub_key(
    AccountId.from_hex(targetAccount)
  );
  const notes = await webClient.get_consumable_notes(
    AccountId.from_hex(targetAccount)
  );
  console.log(notes);
  console.log(
    `consuming notes for account id: ${targetAccount}, Notes Found: ${notes.length}`
  );

  if (notes.length) {
    await sleep(100);
    let notelist = [];
    for (let i = 0; i < notes.length; i++) {
      const noteId = notes[i].input_note_record().id().to_string();
      const isConsumed = notes[i].input_note_record().is_consumed();
      console.log(noteId, " ", isConsumed, notes[i].input_note_record());
      notelist.push(noteId);
    }

    console.log("Note List: ", notelist, AccountId.from_hex(targetAccount));

    try {
      sleep(100);
      const txResult = await webClient.new_consume_transaction(
        AccountId.from_hex(targetAccount),
        notelist
      );
      console.log("Tx Result: ", txResult);
      // mark each note as consumed
      // for (let i = 0; i < notes.length; i++) {
        // const noteId = notes[i].input_note_record().id().to_string();
        // markNoteAsConsumed(noteId, targetAccount);
      // }
    } catch (error: any) {
      console.log("error cosuming notes", error);
    }
  } else {
    console.log("No notes found for this user.");
  }
};

export const createNote = async (
  sender: string,
  receiver: string,
  amountToSend: string,
  assetId: string = activeFaucet
) => {
  try {
    await webClient.fetch_and_cache_account_auth_by_pub_key(
      AccountId.from_hex(sender)
    ); // Need to understand more what this does.
    const faucetAccount = AccountId.from_hex(assetId);
    if (faucetAccount.is_faucet()) {
      try {
        const transaction = await webClient.new_send_transaction(
          AccountId.from_hex(sender),
          AccountId.from_hex(receiver),
          AccountId.from_hex(assetId),
          NoteType.private(),
          BigInt(amountToSend.toString())
        );
        const noteId = transaction.created_notes().get_note(0).id().to_string();
        let result = await webClient.export_note(noteId, "Full");
        await syncClient();
        return result;
      } catch (error: any) {
        console.log("Error creating the transaction note.", error);
      }
    } else {
      console.log("Not a valid faucet");
    }
  } catch (error) {
    console.error("Error creating or submitting notes:", error);
    throw error;
  }
};

export const createMultipleNotes = async (
  sender: any, // Sender account ID
  recipients: { username: string; amount: number }[], // List of recipients with account ID and amount
  assetId: any = activeFaucet // Default faucet ID
) => {
  try {
    const senderAccount = AccountId.from_hex(sender);
    const faucetAccount = AccountId.from_hex(assetId);
    
    await webClient.fetch_and_cache_account_auth_by_pub_key(senderAccount);

    let outputNotesArray = new OutputNotesArray();

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const targetAccount = AccountId.from_hex(recipient.username);

      const noteAssets = new NoteAssets([
        new FungibleAsset(faucetAccount, BigInt(recipient.amount)),
      ]);

      const noteMetadata = new NoteMetadata(
        senderAccount,
        NoteType.public(),
        NoteTag.from_account_id(targetAccount, NoteExecutionMode.new_local()),
        NoteExecutionHint.none(),
        undefined
      );

      // Generate a unique serial number per note
      const serialNum = Word.new_from_u64s(
        new BigUint64Array([
          BigInt(i * 4 + 1),
          BigInt(i * 4 + 2),
          BigInt(i * 4 + 3),
          BigInt(i * 4 + 4),
        ])
      );

      const noteInputs = new NoteInputs(
        new FeltArray([
          targetAccount.suffix(), // Switch prefix & suffix order
          targetAccount.prefix(),
        ])
      );

      const noteRecipient = new NoteRecipient(serialNum, NoteScript.p2id(), noteInputs);
      const note = new Note(noteAssets, noteMetadata, noteRecipient);

      outputNotesArray.append(OutputNote.full(note));
    }

    const transactionRequest = new TransactionRequestBuilder()
      .with_own_output_notes(outputNotesArray) // Pass all notes at once
      .build();

    await webClient.fetch_and_cache_account_auth_by_pub_key(senderAccount);
    const transactionResult = await webClient.new_transaction(senderAccount, transactionRequest);

    try {
      await webClient.submit_transaction(transactionResult);
      await syncClient();
    } catch (error) {
      console.log("Error in multi-note submission", error);
    }

    const outputNotes = transactionResult
      .created_notes()
      .notes()
      .map((note) => note.id().to_string());

    console.log("output note ids ==>", outputNotes);
    return await _exportNotesArray(outputNotes);
  } catch (error) {
    console.error("Error creating multiple notes:", error);
    throw error;
  }
};

const _exportNotesArray = async (outputNotes: string[]) => {
  const noteDataLists = [];
  for (const noteId of outputNotes) {
    try {
      const noteData = await webClient.export_note(noteId, "Full");
      if (noteData) noteDataLists.push({ noteId, noteData });
    } catch (error) {
      console.error(`Failed to fetch noteData for noteId: ${noteId}`, error);
      // noteDataLists.push({ noteId });
    }
  }
  return noteDataLists;
};

/**
 * Download the note as a file
 * @param byteArray
 * @param fileName
 */
export const exportNote = (byteArray: any, fileName: string) => {
  const blob = new Blob([byteArray], { type: "application/octet-stream" });
  // Generate a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName; // Set the file name with .mno extension
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log(`${fileName} downloaded successfully.`);
  // Revoke the object URL to free up resources
  URL.revokeObjectURL(url);
};

export const importAccount = async (
  event: React.ChangeEvent<HTMLInputElement>
): Promise<void> => {
  const file = event.target.files?.[0]; // Ensure the file exists
  if (file) {
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer; // Type assertion
        const byteArray = new Uint8Array(arrayBuffer);
        try {
          await webClient.import_account(byteArray); // Assuming `webClient` is typed correctly
          console.log("Account successfully imported!");
        } catch (error) {
          console.error("Error importing account:", error);
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
  } catch (error: any) {
    console.log("error fetching account details", error.message);
  }
};

export const createAccount = async () => {
  console.log("creating new account ... ");
  let newAccount = await webClient.new_wallet(
    AccountStorageMode.private(),
    true
  );
  return newAccount;
};

export const _getKeys = async (accountId: AccountId) => {
  const result = await webClient.fetch_and_cache_account_auth_by_pub_key(
    accountId
  );
  const getAccountAuth = await webClient.get_account_auth(accountId);
  console.log("Auth", getAccountAuth);

  const _keys = {
    // publicKey: result.get_rpo_falcon_512_public_key_as_word(),
    // secretKey: result.get_rpo_falcon_512_secret_key_as_felts(),
  };

  // const recoverAccounts = await webClient.import_account(_keys.secretKey);
  // console.log("recover response: ", recoverAccounts);

  return _keys;
};

export const recoverSecretKey = async (recoverAccountId: string) => {
  console.log(`Recover account id: ${recoverAccountId}`);
  let accountId = AccountId.from_hex(recoverAccountId);
  const _accountDetails = await webClient.get_account(accountId);
  // const keys = await _getKeys(_accountDetails.id());
  // return keys;
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

/***
 * ===================== API SECTION START FROM HERE =====================
 */

export function generateRandomString(length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export const createCompanyAccountInBackend = async (
  accountId: string,
  userType: string,
  employerId: string = "679f1ddb49e80051f944f1f7" // mongodb default user Id
) => {
  try {
    const randomSuffix = generateRandomString();

    if (userType === "employer") {
      const email = `co_${randomSuffix}@example.com`; // Dynamic email
      const username = `co_username_${randomSuffix}`; // Dynamic username
      const payload = {
        name: "Company XYZ",
        email,
        password: "securepassword",
        userType: "employer",
        companyName: "Company XYZ Ltd.",
        username,
        walletId: accountId,
      };

      const response = await axios.post(
        `${API_URL}/api/users/register`,
        payload
      );
      return response.data.data;
    } else if (userType === "employee") {
      const email = `em_${randomSuffix}@example.com`; // Dynamic email
      const username = `em_username_${randomSuffix}`; // Dynamic username

      const response = await axios.post(`${API_URL}/api/users/register`, {
        name: "John Doe",
        email,
        password: "securepassword",
        userType: "employee",
        username,
        walletId: accountId,
        employerId: !employerId ? "679f1ddb49e80051f944f1f7" : employerId,
      });

      return response.data.data;
    }
  } catch (error) {
    console.error("Error creating account in backend:", error);
    throw error;
  }
};

export const getExistingAccountFromBackend = async (accountId: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/users/profile-with-token`,
      {
        walletId: accountId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching account in backend:", error);
    throw error;
  }
};

export const savePayrollNoteDataToBackend = async (
  noteResults: {
    noteData: any;
    noteId: string;
    recipientId: string;
    filename: string;
    amount: any;
  }[],
  sender: string,
  recipients: { username: string; amount: number }[]
) => {
  try {
    const randomSuffix = generateRandomString();
    const payrollName = `payroll_${randomSuffix}-${Date.now()}`;
    const payments = noteResults.map((noteData) => {
      return {
        noteId: noteData.noteId,
        noteData: noteData.noteData,
        walletId: noteData.recipientId,
        amount: noteData.amount,
      };
    });

    const payload = {
      payrollName,
      payments,
      hash: `0x${generateRandomString()}1234`,
    };

    console.log("Payload to save payroll data to backend", payload);
    const token = await getExistingAccountFromBackend(sender);
    const response = await axios.post(`${API_URL}/api/payroll`, payload, {
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error saving payroll data to backend:", error);
  }
};

export const getHistoryFromBackend = async (
  historyType: string,
  authToken: string
) => {
  try {
    const _type = historyType === "Send" ? "sent" : "receive";

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${API_URL}/api/notes/tx/${_type}`,
      headers: {
        Authorization: "Bearer " + authToken,
      },
    };

    const response = await axios.request(config);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Error fetching history from backend");
    }
  } catch (error) {
    console.error("Error fetching history from backend:", error);
    throw error;
  }
};

export const markNoteAsConsumed = async (
  noteId: string,
  targetAccount: string
) => {
  try {
    const authToken = await getExistingAccountFromBackend(targetAccount);
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${API_URL}/api/notes/${noteId}/consume`,
      headers: {
        Authorization: "Bearer " + authToken,
      },
    };

    const response = await axios.request(config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching history from backend:", error);
    throw error;
  }
};
