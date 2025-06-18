#![allow(unexpected_cfgs)]
#![allow(deprecated)]
use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

declare_id!("3yFrLcHmwCpNjeSR4sFNVd1K3BTzwVc3Nz13ToeHnRfs");

pub const PLAYER: &[u8] = b"player";

#[program]
pub mod dark_souls_vrf {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!(
            "Initializing player account: {:?}",
            ctx.accounts.player.key()
        );
        Ok(())
    }

    pub fn generate_character(ctx: Context<GenerateCharacterCtx>, client_seed: u8) -> Result<()> {
        msg!("Requesting randomness for character generation...");
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.payer.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: ID,
            callback_discriminator: instruction::CallbackGenerateCharacter::DISCRIMINATOR.to_vec(),
            caller_seed: [client_seed; 32],
            accounts_metas: Some(vec![SerializableAccountMeta {
                pubkey: ctx.accounts.player.key(),
                is_signer: false,
                is_writable: true,
            }]),
            ..Default::default()
        });
        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.payer.to_account_info(), &ix)?;
        Ok(())
    }

    pub fn callback_generate_character(
        ctx: Context<CallbackGenerateCharacterCtx>,
        randomness: [u8; 32],
    ) -> Result<()> {
        // Generate class roll (1-100)
        let class_roll = ephemeral_vrf_sdk::rnd::random_u8_with_range(&randomness, 1, 101);
        
        // Determine character class
        let (class, class_name) = if class_roll <= 30 {
            (0, "Knight")
        } else if class_roll <= 55 {
            (1, "Sorcerer")
        } else if class_roll <= 80 {
            (2, "Pyromancer")
        } else {
            (3, "Thief")
        };

        // Generate stats using different parts of randomness
        let stats_roll = ephemeral_vrf_sdk::rnd::random_u32(&randomness);
        
        // Base stats for each class
        let base_stats = match class {
            0 => (27, 16, 11, 9),   // Knight
            1 => (8, 9, 11, 27),    // Sorcerer
            2 => (12, 14, 14, 14),  // Pyromancer
            _ => (10, 9, 25, 12),   // Thief
        };

        // Add variance to base stats
        let vitality = base_stats.0 + ((stats_roll & 0xFF) % 7) as u8;
        let strength = base_stats.1 + (((stats_roll >> 8) & 0xFF) % 7) as u8;
        let dexterity = base_stats.2 + (((stats_roll >> 16) & 0xFF) % 7) as u8;
        let intelligence = base_stats.3 + (((stats_roll >> 24) & 0xFF) % 7) as u8;

        // Calculate rarity based on total stats
        let total_stats = vitality as u16 + strength as u16 + dexterity as u16 + intelligence as u16;
        let rarity = if total_stats >= 85 {
            3 // Legendary
        } else if total_stats >= 75 {
            2 // Epic
        } else if total_stats >= 65 {
            1 // Rare
        } else {
            0 // Common
        };

        msg!(
            "Generated {} - VIT:{} STR:{} DEX:{} INT:{} Rarity:{}",
            class_name, vitality, strength, dexterity, intelligence, rarity
        );

        let player = &mut ctx.accounts.player;
        player.character_class = class;
        player.vitality = vitality;
        player.strength = strength;
        player.dexterity = dexterity;
        player.intelligence = intelligence;
        player.rarity = rarity;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed, 
        payer = payer, 
        space = 8 + 6, 
        seeds = [PLAYER, payer.key().to_bytes().as_slice()], 
        bump
    )]
    pub player: Account<'info, Player>,
    pub system_program: Program<'info, System>,
}

#[vrf]
#[derive(Accounts)]
pub struct GenerateCharacterCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(seeds = [PLAYER, payer.key().to_bytes().as_slice()], bump)]
    pub player: Account<'info, Player>,
    /// CHECK: The oracle queue
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CallbackGenerateCharacterCtx<'info> {
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,
    #[account(mut)]
    pub player: Account<'info, Player>,
}

#[account]
pub struct Player {
    pub character_class: u8,
    pub vitality: u8,
    pub strength: u8,
    pub dexterity: u8,
    pub intelligence: u8,
    pub rarity: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Character already exists")]
    CharacterAlreadyExists,
}
