use anchor_lang::prelude::*;
// Borsh traits are no longer needed directly in this context
use std::io::{Error as IoError, Write};

declare_id!("BBwnqf3jRbgPHFBuLWZzQe1UMWfG9BQSmL2TaDkwPgmv");

#[program]
pub mod multisig_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, threshold: u8) -> Result<()> {
        let multisig_account = &mut ctx.accounts.multisig_account;
        multisig_account.threshold = threshold;
        multisig_account.signers = vec![];
        multisig_account.transactions = vec![];
        Ok(())
    }

    pub fn add_transaction(ctx: Context<AddTransaction>, data: Vec<u8>) -> Result<()> {
        let multisig_account = &mut ctx.accounts.multisig_account;
        let transaction = Transaction {
            data,
            signers_approved: vec![false; multisig_account.signers.len()],
            executed: false,
        };
        multisig_account.transactions.push(transaction);
        Ok(())
    }

    // Additional instruction handling functions would be defined here...
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8000)] // Adjust space as necessary
    pub multisig_account: Account<'info, MultisigAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddTransaction<'info> {
    #[account(mut)]
    pub multisig_account: Account<'info, MultisigAccount>,
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct SerializablePubkey(Pubkey);

impl From<Pubkey> for SerializablePubkey {
    fn from(pubkey: Pubkey) -> Self {
        SerializablePubkey(pubkey)
    }
}

impl From<SerializablePubkey> for Pubkey {
    fn from(ser_pubkey: SerializablePubkey) -> Self {
        ser_pubkey.0
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Transaction {
    pub data: Vec<u8>,
    pub signers_approved: Vec<bool>,
    pub executed: bool,
}

#[account]
pub struct MultisigAccount {
    pub signers: Vec<SerializablePubkey>,
    pub threshold: u8,
    pub transactions: Vec<Transaction>,
}


// TODO: create functions to sign transactions and check thresholds etc

