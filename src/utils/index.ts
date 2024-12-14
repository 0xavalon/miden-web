import { Buffer } from "buffer";
import {
  Account,
  AccountId,
  AccountStorageMode,
  WebClient,
  NoteType,
  TransactionRequest,
  NoteMetadata,
  FungibleAsset,
  NoteRecipient,
  Note,
  OutputNote,
  NoteAssets,
  OutputNotesArray,
  AccountHeader,
  NoteInputs,
  NoteFilter,
  NoteFilterTypes,
  FeltArray,
  NoteExecutionMode,
  // NoteDetailsArray,
  NoteTag,
  NoteExecutionHint,
  NoteScript,
} from "@demox-labs/miden-sdk";
import exp from "constants";

const webClient = new WebClient();

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const _getAccountId = (accountId: any) => {
  let _accountId: AccountId;
  if (typeof accountId === "string") {
    if (!accountId) {
      console.error("accountId is undefined or empty.");
      return null;
    }
    return AccountId.from_hex(accountId);
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

export const getNonFaucetFirstAccount = async () => {
  const _accounts = await webClient.get_accounts();

  for (const header of _accounts) {
    const accountId = AccountId.from_hex(header.id().to_string()); // Create fresh AccountId
    const account = await webClient.get_account(accountId); // Fetch full account details
    if(!account.is_faucet()) return account;
    await sleep(100);
  }
  return null;
}

export const getFirstFaucetAccount = async () => {
  const _accounts = await webClient.get_accounts();
  for (const header of _accounts) {
    const accountId = AccountId.from_hex(header.id().to_string()); // Create fresh AccountId
    const account = await webClient.get_account(accountId); // Fetch full account details
    if(account.is_faucet()) return account;
    await sleep(100);
  }

  return null;
}

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

export const syncClient = async () => {
  try{
    console.log("Attempting to sync the client ...", new Date());
    sleep(20000);
    await webClient.sync_state();
    console.log("syncing done ...", new Date())
  } catch (error) {
      console.log("Error syncing accounts: ", error.message);
  }
}

export const consumeAvailableNotes = async (targetAccount: any) => {
  const _accountId = _getAccountId(targetAccount);
  await webClient.fetch_and_cache_account_auth_by_pub_key(_accountId);
  let accountId2 = _getAccountId(targetAccount);
  const notes = await webClient.get_consumable_notes(accountId2);
  let accountId = _getAccountId(targetAccount);
  await webClient.fetch_and_cache_account_auth_by_pub_key(accountId);
  console.log(`consuming notes for account id: ${targetAccount}, Notes Found: ${notes.length}`);
  console.log('logging for account vanishes ... ',accountId, targetAccount);
  

  if(notes.length) {
    let notelist = [];
    for(let i=0; i<notes.length; i++) {
      const noteId = notes[i].input_note_record().id().to_string();
      const isConsumed = notes[i].input_note_record().is_consumed();
      console.log(noteId, ' ',isConsumed)
      notelist.push(noteId);
    }
    
    console.log(accountId, targetAccount);
    try{
      const txResult = await webClient.new_consume_transaction(
        accountId,
        notelist
      );
      console.log('consumption completed. Tx Result: ',txResult);
    } catch (error){
      console.log("error cosuming notes", error.message);
    }
  } else {
    console.log('No notes found for this user.')
  }
}


export const createNote = async (sender: any, receiver: any, amountToSend: string, assetId:any = "0x29b86f9443ad907a") => {
    try {
      const senderAccount =  _getAccountId(sender);
      await webClient.fetch_and_cache_account_auth_by_pub_key(senderAccount) // Need to understand more what this does.
      const faucetAccount = _getAccountId(assetId);
      const recipientAccount = _getAccountId(receiver);
      console.log(senderAccount, recipientAccount);
      if(faucetAccount.is_faucet()) {
  
      try {
        await sleep(100);
        console.log('starting the new transactions')
        const transaction = webClient.new_send_transaction(
          senderAccount,
          recipientAccount,
          faucetAccount,
          NoteType.private(),
          BigInt(amountToSend.toString())
        );
        await Promise.all([transaction])
        await sleep(100);
        await syncClient();
        console.log('transaction result',transaction);
        return transaction;

      } catch (error) {
        console.log("Error creating the transaction note.", error.message)
      }
      } else {
        console.log("Not a valid faucet");
      }
      
    } catch (error) {
      console.error("Error creating or submitting notes:", error);
      throw error;
    }
}

const getCustomNoteScript = (expectedNoteArg1: any, expectedNoteArg2: any, memAddress: any, memAddress2:any) => `
  use.miden::note
  use.miden::contracts::auth::basic->auth_tx
  use.miden::kernels::tx::memory

  begin
      # Push expected data from advice map into memory
      adv.push_mapval
      # => [NOTE_ARG_COMMITMENT]

      push.${memAddress}
      push.2
      exec.mem::pipe_preimage_to_memory
      # => [memAddress']

      # Validate first argument
      push.${memAddress}
      mem_loadw
      push.${expectedNoteArg1}
      assert_eqw

      # Validate second argument
      push.${memAddress2}
      mem_loadw
      push.${expectedNoteArg2}
      assert_eqw

      # Check note inputs
      push.0 exec.note::get_inputs
      eq.1 assert
      mem_load

      # Authorize transaction
      exec.auth_tx::auth_tx_rpo_falcon512
  end
`;

const customTransaction = async (assertedValue: string) => {
  const webClient = new WebClient();

  await webClient.create_client("http://localhost:57291", "http://localhost:50051");

  // Example of dynamic inputs
  const memAddress = "1000";
  const memAddress2 = "1001";
  const expectedNoteArg1 = "1234.5678";
  const expectedNoteArg2 = "8765.4321";

  // Generate the script dynamically
  const noteScript = getCustomNoteScript(expectedNoteArg1, expectedNoteArg2, memAddress, memAddress2);
  const compiledNoteScript = await webClient.compile_note_script(noteScript);

  console.log("Compiled Script:", compiledNoteScript.toString());

  // Now use this script in your NoteRecipient
  const noteRecipient = new NoteRecipient(compiledNoteScript, new NoteInputs(new FeltArray([walletAccount.id().to_felt()])));
  
  // Use the rest of your logic from the `customTransaction` method
};




export const createMultipleNotes = async (sender: any, receiver: any, amountToSend: string, assetId:any = "0x29b86f9443ad907a") => {
  const ownOutputNotes = new OutputNotesArray();
  const senderAccount =  _getAccountId(sender);
  await webClient.fetch_and_cache_account_auth_by_pub_key(senderAccount) // Need to understand more what this does.
  const faucetAccount = _getAccountId(assetId);
  const recipientAccount = _getAccountId(receiver);
  console.log(senderAccount, recipientAccount);


      const noteMetadata = new NoteMetadata(
        senderAccount,
        NoteType.private(),
        NoteTag.from_account_id(senderAccount, NoteExecutionMode.new_local()),
        NoteExecutionHint.none()
      );


      // Create assets and recipient for the note
      const noteAssets = new NoteAssets([
        new FungibleAsset(faucetAccount, BigInt(amountToSend.toString())),
      ]);
      const minimalScript =`
      begin
          push.0 # Start of the note script
          end
    `;
    const noteScript = await webClient.compile_note_script(minimalScript);
    await sleep(100);
    const noteInputs = new NoteInputs(new FeltArray([recipientAccount.to_felt()]));
    const noteRecipient = new NoteRecipient(noteScript, noteInputs);


      // Create a note and append it to the OutputNotesArray
      const note = new Note(noteAssets, noteMetadata, noteRecipient);
      ownOutputNotes.append(OutputNote.full(note));
      console.log(ownOutputNotes);


    await sleep(200);
    await syncClient();
    const transactionRequest = new TransactionRequest().with_own_output_notes(ownOutputNotes);
    const txResult = await webClient.new_transaction(senderAccount, transactionRequest);  
    const result = await webClient.submit_transaction(txResult);
    await sleep(2000);
    await syncClient();

}

/**
 * accountId: "0x9e3ef32141aa2f15",
 * faucetId: "0xa260982899cd63da"
 * 
 */
export const setupFaucet = async () => {
      const faucetAccount = await webClient.new_faucet(
        AccountStorageMode.private(),
        false,
        "DAG",
        8,
        BigInt(10000000)
      );

      console.log("Creating new faucet account", faucetAccount);
      await webClient.sync_state();

      return {
        faucetId: faucetAccount.id().to_string(),
      };
};

export const exportNote = async (noteId: any) => {
  try {
    let result = await webClient.export_note(noteId, "Partial");
    let byteArray = new Uint8Array(result);
    console.log(byteArray);
    return byteArray;
  } catch (error) {
    console.error("Failed to call export input note:", error);
  }
}

export const getConsumableNotesForUser = async (targetAccount: any) => {
  let accountId2 = _getAccountId(targetAccount);
  console.log(accountId2);
  
  return "";
}

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
