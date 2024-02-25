use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;

declare_id!("69VADpHZeFAXTtaoEka57BAWRfQPZqZECb7eqk4NnM6t");

#[program]
pub mod solsticio_space {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_claims = 0;
        Ok(())
    }

    pub fn request_claim(ctx: Context<RequestClaim>, uri: String, coords: [u8; 2]) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        let random_number = get_random_number();

        if random_number % 2 == 0 {
            base_account.claims.push(Claim { uri, coords, result: true });
            msg!("Claim successful.");
        } else {
            msg!("Claim failed.");
        }

        base_account.total_claims += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestClaim<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub total_claims: u32,
    pub claims: Vec<Claim>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Claim {
    pub uri: String,
    pub coords: [u8; 2],
    pub result: bool,
}

fn get_random_number() -> u64 {
    let clock = sysvar::clock::Clock::get().unwrap();
    clock.unix_timestamp as u64
}
