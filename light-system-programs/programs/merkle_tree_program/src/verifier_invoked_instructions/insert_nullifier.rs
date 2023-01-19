use crate::utils::{constants::NULLIFIER_SEED, create_pda::create_and_check_pda};
use crate::RegisteredVerifier;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{pubkey::Pubkey, sysvar};

#[derive(Accounts)]
pub struct InitializeNullifiers<'info> {
    /// CHECK:` Signer is owned by registered verifier program.
    #[account(mut, seeds=[program_id.to_bytes().as_ref()], bump,seeds::program=registered_verifier_pda.pubkey)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(seeds=[&registered_verifier_pda.pubkey.to_bytes()],  bump )]
    pub registered_verifier_pda: Account<'info, RegisteredVerifier>, // nullifiers are sent in remaining accounts. @ErrorCode::InvalidVerifier
}

/// Inserts nullifiers, written in plain rust for memory optimization.
pub fn process_insert_nullifiers<'info>(
    ctx: Context<'_, '_, '_, 'info, InitializeNullifiers<'info>>,
    nullifiers: Vec<Vec<u8>>,
) -> Result<()> {
    let rent = <Rent as sysvar::Sysvar>::get()?;

    for (nullifier_pda, nullifier) in ctx.remaining_accounts.iter().zip(nullifiers) {
        create_and_check_pda(
            ctx.program_id,
            &ctx.accounts.authority.to_account_info(),
            &nullifier_pda.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            &rent,
            &nullifier,
            NULLIFIER_SEED,
            1,    //bytes
            0,    //lamports
            true, //rent_exempt
        )
        .unwrap();
        nullifier_pda.to_account_info().data.borrow_mut()[0] = 1u8;
    }
    Ok(())
}

// pub fn create_and_check_pda<'a, 'b>(
//     program_id: &Pubkey,
//     signer_account: &'a AccountInfo<'b>,
//     passed_in_pda: &'a AccountInfo<'b>,
//     system_program: &'a AccountInfo<'b>,
//     rent: &Rent,
//     _instruction_data: &[u8],
//     domain_separation_seed: &[u8],
//     number_storage_bytes: u64,
//     lamports: u64,
//     rent_exempt: bool,
// ) -> Result<()> {
//
//     let derived_pubkey =
//         Pubkey::find_program_address(&[_instruction_data, domain_separation_seed], program_id);
//
//     if derived_pubkey.0 != *passed_in_pda.key {
//         msg!("Passed-in pda pubkey != on-chain derived pda pubkey.");
//         msg!("On-chain derived pda pubkey {:?}", derived_pubkey);
//         msg!("Passed-in pda pubkey {:?}", *passed_in_pda.key);
//         msg!("Instruction data seed  {:?}", _instruction_data);
//         return err!(ErrorCode::AccountDidNotDeserialize);
//     }
//
//     let mut account_lamports = lamports;
//     if rent_exempt {
//         account_lamports += rent.minimum_balance(number_storage_bytes.try_into().unwrap());
//     }
//
//
//     invoke_signed(
//         &system_instruction::create_account(
//             signer_account.key,   // from_pubkey
//             passed_in_pda.key,    // to_pubkey
//             account_lamports,     // lamports
//             number_storage_bytes, // space
//             program_id,           // owner
//         ),
//         &[
//             signer_account.clone(),
//             passed_in_pda.clone(),
//             system_program.clone(),
//         ],
//         &[&[
//             _instruction_data,
//             domain_separation_seed,
//             &[derived_pubkey.1],
//         ]],
//     )?;
//
//     // Check for rent exemption
//     if rent_exempt
//         && !rent.is_exempt(
//             **passed_in_pda.lamports.borrow(),
//             number_storage_bytes.try_into().unwrap(),
//         )
//     {
//         msg!("Account is not rent exempt.");
//         return err!(ErrorCode::ConstraintRentExempt);
//     }
//     Ok(())
// }