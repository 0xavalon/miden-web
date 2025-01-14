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
import { any } from "zod";

const webClient = new WebClient();

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
  await webClient.create_client();
};

export const getAccountsFromDb = async () => {
  const _accounts = await webClient.get_accounts();
  return _accounts;
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
      });
    }
  });
  return historyList;
};

export const syncClient = async () => {
  try {
    console.log("Attempting to sync the client ...", new Date());
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
        console.log("transaction result", transaction);
        // FIXME: get_note(0)
        // const noteId = transaction.created_notes().get_note().id().to_string();
        const noteId = transaction.created_notes().get_note(0).id().to_string();

        // const noteId = '0x09c36336269b16052448cda51a3d133829a07bbd99e0573ed546bfd6eb277296';
        await sleep(20000);
        await syncClient();
        const noteDetails = await webClient.get_output_note(noteId);
        console.log("noteId", noteDetails);
        // console.log('note details', );
        let result = await webClient.export_note(noteId, "Full");
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
    await webClient.fetch_and_cache_account_auth_by_pub_key(
      AccountId.from_hex(sender)
    );

    let standard_p2id_script = `
    use.miden::account
    use.miden::note
    use.miden::contracts::wallets::basic->wallet

    # ERRORS
    # =================================================================================================

    # P2ID script expects exactly 1 note input
    const.ERR_P2ID_WRONG_NUMBER_OF_INPUTS=0x00020050

    # P2ID's target account address and transaction address do not match
    const.ERR_P2ID_TARGET_ACCT_MISMATCH=0x00020051

    #! Helper procedure to add all assets of a note to an account.
    #!
    #! Inputs: []
    #! Outputs: []
    #!
    proc.add_note_assets_to_account
        push.0 exec.note::get_assets
        # => [num_of_assets, 0 = ptr, ...]

        # compute the pointer at which we should stop iterating
        dup.1 add
        # => [end_ptr, ptr, ...]

        # pad the stack and move the pointer to the top
        padw movup.5
        # => [ptr, 0, 0, 0, 0, end_ptr, ...]

        # compute the loop latch
        dup dup.6 neq
        # => [latch, ptr, 0, 0, 0, 0, end_ptr, ...]

        while.true
            # => [ptr, 0, 0, 0, 0, end_ptr, ...]

            # save the pointer so that we can use it later
            dup movdn.5
            # => [ptr, 0, 0, 0, 0, ptr, end_ptr, ...]

            # load the asset and add it to the account
            mem_loadw call.wallet::receive_asset
            # => [ASSET, ptr, end_ptr, ...]

            # increment the pointer and compare it to the end_ptr
            movup.4 add.1 dup dup.6 neq
            # => [latch, ptr+1, ASSET, end_ptr, ...]
        end

        # clear the stack
        drop dropw drop
    end

    # Pay-to-ID script: adds all assets from the note to the account, assuming ID of the account
    # matches target account ID specified by the note inputs.
    #
    # Requires that the account exposes: miden::contracts::wallets::basic::receive_asset procedure.
    #
    # Inputs: [SCRIPT_ROOT]
    # Outputs: []
    #
    # Note inputs are assumed to be as follows:
    # - target_account_id is the ID of the account for which the note is intended.
    #
    # FAILS if:
    # - Account does not expose miden::contracts::wallets::basic::receive_asset procedure.
    # - Account ID of executing account is not equal to the Account ID specified via note inputs.
    # - The same non-fungible asset already exists in the account.
    # - Adding a fungible asset would result in amount overflow, i.e., the total amount would be
    #   greater than 2^63.
    begin
        # drop the note script root
        dropw
        # => []

        # store the note inputs to memory starting at address 0
        push.0 exec.note::get_inputs
        # => [num_inputs, inputs_ptr]

        # make sure the number of inputs is 1
        eq.1 assert.err=ERR_P2ID_WRONG_NUMBER_OF_INPUTS
        # => [inputs_ptr]

        # read the target account id from the note inputs
        mem_load
        # => [target_account_id]

        exec.account::get_id
        # => [account_id, target_account_id, ...]

        # ensure account_id = target_account_id, fails otherwise
        assert_eq.err=ERR_P2ID_TARGET_ACCT_MISMATCH
        # => [...]

        exec.add_note_assets_to_account
        # => [...]
    end
  `;

    const noteScript = await webClient.compile_note_script(standard_p2id_script);
    for (const { username: receiver, amount } of recipients) {
      const recipientAccount = AccountId.from_hex(receiver);
      
      const noteAssets = new NoteAssets([
        new FungibleAsset(
          AccountId.from_hex(assetId),
          BigInt(amount.toString())
        ),
      ]);

      const noteMetadata = new NoteMetadata(
        AccountId.from_hex(sender),
        NoteType.private(),
        NoteTag.from_account_id(
          AccountId.from_hex(receiver),
          NoteExecutionMode.new_local()
        ),
        NoteExecutionHint.none()
      );

      const noteInputs = new NoteInputs(
        new FeltArray([recipientAccount.to_felt()])
      );
      const noteRecipient = new NoteRecipient(noteScript, noteInputs);

      console.log('noteRecipient',noteRecipient.digest().to_hex());
      const note = new Note(noteAssets, noteMetadata, noteRecipient);
      ownOutputNotes.append(OutputNote.full(note));

      console.log(
        `Created note for recipient: ${receiver} with amount: ${amount}`
      );
      await sleep(100); // Add delay for stability
    }

    await syncClient();

    const transactionRequest = new TransactionRequest().with_own_output_notes(
      ownOutputNotes
    );
    const txResult = await webClient.new_transaction(
      AccountId.from_hex(sender),
      transactionRequest
    );
    console.log("Transaction Result:", txResult);

    try {
      const result = await webClient.submit_transaction(txResult);
      await sleep(2000);
      await syncClient();

      const noteId = txResult.created_notes().notes()[0].id().to_string();
      const note = await webClient.export_note(noteId, "Full");
      console.log(note, noteId);
      const byteArray = new Uint8Array(note);
      exportNote(byteArray, 'a1.mno');
      console.log("Final Submission Result:", result);
    } catch (error) {
      console.log("Error getting submitted result", error);
    }

    return txResult;
  } catch (error) {
    console.error("Error creating multiple notes:", error);
    throw error;
  }
};

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
        console.log(byteArray);

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
