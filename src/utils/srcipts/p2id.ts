export const standard_p2id_scripts = `
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
`