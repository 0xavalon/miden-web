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

const webClient = new WebClient();

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
}

export const createClient = async () => {
  await webClient.create_client();
};

export const getAccountsFromDb = async () => {
  const _accounts = await webClient.get_accounts();
  return _accounts;
};

export const getBalance = async (accountId: any, faucetAccountId: AccountId = "0x29b86f9443ad907a") => {
  let _accountId = _getAccountId(accountId);
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

export const getAccountHistory = async (accountId:string) => {
  const historyList: { id: any; title: string; recipients: any; amount: string; }[] = [];
  const histories = await webClient.get_transactions(TransactionFilter.all());
  histories.map((history: any, index: any) => {
    let totalAmount = 0;
    const outputNotes = history.output_notes(); 
    const totalNotes = outputNotes.num_notes();
    const hash = history.id().to_hex();
    for(let i=0; i<totalNotes; i++){
      const amount = outputNotes.notes()[i].assets().assets()[0].amount(); // assuming single asset
      totalAmount += Number(amount)
    }
    historyList.push({
      id: index,
      title: `${hash.slice(0, 3)}...${hash.slice(-3)}`,
      recipients: totalNotes,
      amount: totalAmount.toString()
    })
  })
  return historyList;
}

export const syncClient = async () => {
  try{
    console.log("Attempting to sync the client ...", new Date());
    await webClient.sync_state();
    console.log("syncing done ...", new Date())
  } catch (error: any) {
      console.log("Error syncing accounts: ", error.message);
  }
}

export const consumeAvailableNotes = async (targetAccount: string) => {
  await webClient.fetch_and_cache_account_auth_by_pub_key(AccountId.from_hex(targetAccount))
  const notes = await webClient.get_consumable_notes(AccountId.from_hex(targetAccount));
  console.log(`consuming notes for account id: ${targetAccount}, Notes Found: ${notes.length}`);

  if(notes.length) {
    await sleep(100);
    let notelist = [];
    for(let i=0; i<notes.length; i++) {
      const noteId = notes[i].input_note_record().id().to_string();
      const isConsumed = notes[i].input_note_record().is_consumed();
      console.log(noteId, ' ',isConsumed, notes[i].input_note_record())
      notelist.push(noteId);
    }
    console.log(notes, notelist[1]);
    
    try{
      sleep(100);
      const txResult = await webClient.new_consume_transaction(
        AccountId.from_hex(targetAccount),
        notelist
      );
      console.log('Tx Result: ',txResult);
    } catch (error: any){
      console.log("error cosuming notes", error);
    }
  } else {
    console.log('No notes found for this user.')
  }
}

export const createNote = async (sender: AccountId, receiver: AccountId, amountToSend: string, assetId:AccountId = "0x29b86f9443ad907a") => {
    try {
      const senderAccount =  _getAccountId(sender);
      await webClient.fetch_and_cache_account_auth_by_pub_key(senderAccount) // Need to understand more what this does.
      const faucetAccount = _getAccountId(assetId);
      const recipientAccount = _getAccountId(receiver);
      if(faucetAccount.is_faucet()) {
  
      try {
        const transaction = await webClient.new_send_transaction(
          senderAccount,
          recipientAccount,
          faucetAccount,
          NoteType.private(),
          BigInt(amountToSend.toString())
        );
        console.log('transaction result',transaction);
        return transaction;

      } catch (error: any) {
        console.log("Error creating the transaction note.", error)
      }
      } else {
        console.log("Not a valid faucet");
      }
      
    } catch (error) {
      console.error("Error creating or submitting notes:", error);
      throw error;
    }
}


export const createMultipleNotes = async (
  sender: any, // Sender account ID
  recipients: { username: string; amount: string }[], // List of recipients with account ID and amount
  assetId: any = "0x29b86f9443ad907a" // Default faucet ID
) => {
  try {
    const ownOutputNotes = new OutputNotesArray();
    await webClient.fetch_and_cache_account_auth_by_pub_key(AccountId.from_hex(sender));
    const minimalScript = `
        begin
          push.0 # Placeholder logic for the note script
        end
    `;

    const noteScript = await webClient.compile_note_script(minimalScript);
    for (const { username: receiver, amount } of recipients) {
      const recipientAccount = AccountId.from_hex(receiver);
      console.log("Recipient Account:", recipientAccount.to_string());

      const noteMetadata = new NoteMetadata(
        AccountId.from_hex(sender),
        NoteType.private(),
        NoteTag.from_account_id(AccountId.from_hex(sender), NoteExecutionMode.new_local()),
        NoteExecutionHint.none()
      );

      const noteAssets = new NoteAssets([
        new FungibleAsset(AccountId.from_hex(assetId), BigInt(amount.toString())),
      ]);

      const noteInputs = new NoteInputs(new FeltArray([recipientAccount.to_felt()]));
      const noteRecipient = new NoteRecipient(noteScript, noteInputs);

      const note = new Note(noteAssets, noteMetadata, noteRecipient);
      ownOutputNotes.append(OutputNote.full(note));

      console.log(`Created note for recipient: ${receiver} with amount: ${amount}`);
      await sleep(100);
    }

    await syncClient();

    const transactionRequest = new TransactionRequest().with_own_output_notes(ownOutputNotes);
    const txResult = await webClient.new_transaction(AccountId.from_hex(sender), transactionRequest);
    console.log("Transaction Result:", txResult);

    try {
      const result = await webClient.submit_transaction(txResult);
      console.log("Final Submission Result:", result);
    } catch(error: any) {
      console.log("error getting submitted result", error)
    }

    return txResult;
  } catch (error) {
    console.error("Error creating multiple notes:", error);
    throw error;
  }
}

const exportNote = (byteArray: any, fileName: string) => {
  const blob = new Blob([byteArray], {type: 'application/octet-stream'});
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
  } catch(error: any) {
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
