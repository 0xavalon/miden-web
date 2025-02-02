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
  Felt,
  NoteFilter,
  NoteFilterTypes,
  NoteAssets,
  NoteExecutionHint,
  NoteRecipient,
  NoteInputs,
  NoteExecutionMode,
  TransactionFilter,
  NoteMetadata,
  TransactionRequest,
  OutputNote,
  OutputNotesArray,
} from "@demox-labs/miden-sdk";

import { standard_p2id_scripts } from "./srcipts/p2id";
import axios from "axios";

const webClient = new WebClient();
const API_URL = `http://localhost:5001`;

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
  await webClient.create_client();
};

export const getAccountsFromDb = async () => {
  await sleep(100);
  const _accounts = await webClient.get_accounts();
  return _accounts;
};

export const checkForFaucetAccount = async () => {
  const _allAccounts = await getAccountsFromDb();
  let _faucetAccount = null;
  for (const account of _allAccounts) {
    const _id = account.id().to_string();
    const _accountDetails = await getAccountDetails(AccountId.from_hex(_id));

    if (_accountDetails?.is_faucet()) {
      return _accountDetails;
    }
  }

  if (_faucetAccount) {
    return _faucetAccount;
  }
  return null;
};


export const createNewFaucetAccount = async () => {
  const faucetId = await webClient.new_faucet(AccountStorageMode.private(), false, "TOK", 6, BigInt(1000000000));
  return faucetId;
};

export const mintFaucteAccount = async (accountId: string, faucetId: string, amount: any) => {
  let _accountId = _getAccountId(accountId);
  let _faucetId = _getAccountId(faucetId);
  await sleep(10000);
  await webClient.new_mint_transaction(_accountId, _faucetId, NoteType.private(), BigInt(amount));
};

export const getBalance = async (
  accountId: string,
  faucetAccountId: string = "0x29b86f9443ad907a"
) => {
  let _accountId = _getAccountId(accountId);
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
  console.log(item.outputNotes.notes());

  const outputNotes = item.outputNotes.notes().map((note: any) => {
    return note.id().to_string();
  });
  
  let outputNotesData =  await _exportNotesArray(outputNotes);
  console.log('output note data', outputNotesData);

  for (let i = 0; i < outputNotesData.length; i++) {
    exportNote(
      new Uint8Array(outputNotesData[i].noteData),
      `${outputNotesData[i].noteId}.mno`
    );
  }

}

export const importNoteFiles = async (file: File): Promise<void> => {
  // const file = event.target.files?.[0]; // Check if a file is selected
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

export const getAccountHistory = async (accountId: string) => {
  const historyList: {
    id: any;
    title: string;
    hash: string;
    type: "Send" | "Receive";
    recipients: any;
    amount: string;
    outputNotes?: OutputNotesArray;
  }[] = [];
  const sendHistories = await webClient.get_transactions(TransactionFilter.all());
  const inputNote = await webClient.get_input_notes(new NoteFilter(NoteFilterTypes.Consumed));
  inputNote.map((history: any, index:any) => {
    try{
      let id = index;
      let hash = history.consumer_transaction_id();
      let title = `${hash.slice(0, 3)}...${hash.slice(-3)}`;
      let amount = history.details().assets().assets()[0].amount().toString();
      let recipients = 1;
      // let recipients = history.metadata().sender().to_string();

      historyList.push({id, hash, type: "Receive", title, amount, recipients});
    } catch(error) {
      console.log(error);
    }
  })

  
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
    if(Number(totalNotes) > 0) {
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
    await webClient.sync_state();
    console.log("syncing done ...", new Date());
  } catch (error: any) {
      console.log("Error syncing accounts: ", error);
  }
};

export const consumeAvailableNotes = async (targetAccount: string) => {
  await webClient.fetch_and_cache_account_auth_by_pub_key(
    AccountId.from_hex(targetAccount)
  );
  const notes = await webClient.get_consumable_notes(
    AccountId.from_hex(targetAccount)
  );
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
    
    try{
      sleep(100);
      const txResult = await webClient.new_consume_transaction(
        AccountId.from_hex(targetAccount),
        notelist
      );
      console.log("Tx Result: ", txResult);
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
  assetId: string = "0x29b86f9443ad907a"
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
  assetId: any = "0x29b86f9443ad907a" // Default faucet ID
) => {
  try {
    const ownOutputNotes = new OutputNotesArray();
    const senderAccount = AccountId.from_hex(sender);
    const faucetAccount = AccountId.from_hex(assetId);

    await webClient.fetch_and_cache_account_auth_by_pub_key(
      AccountId.from_hex(sender)
    );

    let compiledNoteScript =
      await webClient.compile_note_script(standard_p2id_scripts);
  
    for (const recipient of recipients) {
      const noteAssets = new NoteAssets([
        new FungibleAsset(faucetAccount, BigInt(recipient.amount)),
      ]);

      const noteMetadata = new NoteMetadata(
        senderAccount,
        NoteType.public(),
        NoteTag.from_account_id(AccountId.from_hex(recipient.username), NoteExecutionMode.new_local()),
        NoteExecutionHint.none(),
        undefined
      );

      const noteInputs = new NoteInputs(new FeltArray([AccountId.from_hex(recipient.username).to_felt()]));
      const noteRecipient = new NoteRecipient(compiledNoteScript, noteInputs);
      const note = new Note(noteAssets, noteMetadata, noteRecipient);
      ownOutputNotes.append(OutputNote.full(note));
    }

    const transactionRequest = new TransactionRequest().with_own_output_notes(ownOutputNotes);

    await webClient.fetch_and_cache_account_auth_by_pub_key(senderAccount);
    const transactionResult = await webClient.new_transaction(senderAccount, transactionRequest);

    try {
      // await webClient.submit_transaction(transactionResult);
      // await syncClient();
    } catch (error) {
      console.log('Error in multi note submission',error);  
    }
    
    const outputNotes = transactionResult.created_notes().notes().map((note) => {
      return note.id().to_string();
    })

    console.log('output note ids ==>', outputNotes)
    const noteDataLists = await _exportNotesArray(outputNotes);
    return noteDataLists;

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
      if(noteData) noteDataLists.push({ noteId, noteData });
    } catch (error) {
      console.error(`Failed to fetch noteData for noteId: ${noteId}`, error);
      // noteDataLists.push({ noteId });
    }
  }
  return noteDataLists;
}

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
  console.log("new account", newAccount);
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
 * API SECTION FROM HERE
 */

function generateRandomString(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export const createCompanyAccountInBackend = async (accountId: string, userType: string, employerId: string="679f1ddb49e80051f944f1f7") => { 
  try {
    const randomSuffix = generateRandomString();
  
    if(userType === 'employer') {
      const email = `co_${randomSuffix}@example.com`;  // Dynamic email
      const username = `co_username_${randomSuffix}`;  // Dynamic username
      const payload = {
        name: "Company XYZ",
        email,
        password: "securepassword",
        userType: "employer",
        companyName: "Company XYZ Ltd.",
        username,
        walletId: accountId
      }

      const response = await axios.post(`${API_URL}/api/users/register`, payload);
      return response.data.data;
    } else if( userType === 'employee') {
      const email = `em_${randomSuffix}@example.com`;  // Dynamic email
      const username = `em_username_${randomSuffix}`;  // Dynamic username
      
      const response = await axios.post(`${API_URL}/api/users/register`, {
        name: "John Doe",
        email,
        password: "securepassword",
        userType: "employee",
        username,
        walletId: accountId,
        employerId: !employerId ? "679f1ddb49e80051f944f1f7" : employerId
    });

      return response.data.data;
    }
  } catch (error) {
    console.error("Error creating account in backend:", error);
    throw error;
  }
}

export const getExistingAccountFromBackend = async (accountId: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/profile-with-token`,{
      walletId: accountId
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching account in backend:", error);
    throw error;
  }
}



export const savePayrollNoteDataToBackend = (noteResults: { noteData: any; noteId: string,recipientId: string; filename: string; amount: any}[], sender: string, recipients: { username: string; amount: number }[]) => {
  const randomSuffix = generateRandomString();
  const payrollName = `payroll_${randomSuffix}-${Date.now()}`;
  const payments = noteResults.map((noteData, index) => {
    return {
      noteId: noteData.noteId,
      noteData: noteData.noteData,
      employeeId: noteData.recipientId,
      amount: noteData.amount
    }
  });

  const payload = { payrollName, payments };
  console.log("Payload", payload);
  axios.post(`${API_URL}/api/payroll`, payload)
    .then(response => {
      console.log("Payroll response", response.data);
    }
  ).catch(error => {
    console.error("Error creating payroll in backend:", error);
    throw error;
  });

}
