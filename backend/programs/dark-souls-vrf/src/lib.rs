#![allow(unexpected_cfgs)]
#![allow(deprecated)]
use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

declare_id!("3ZT3N16QPy6MbUh3FphTeGtPKKSwRRLr7FDQU9wXzZUF");

pub const CHARACTER_GENERATOR: &[u8] = b"char_gen";

#[program]
pub mod dark_souls_vrf {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let character_generator = &mut ctx.accounts.character_generator;
        character_generator.authority = ctx.accounts.payer.key();
        character_generator.total_generated = 0;
        msg!("Initialized Dark Souls character generator");
        Ok(())
    }

    pub fn request_character_generation(
        ctx: Context<RequestCharacterCtx>,
        client_seed: u8,
        _character_index: u32,
    ) -> Result<()> {
        msg!("Requesting randomness for Dark Souls character generation...");

        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.payer.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: ID,
            callback_discriminator: instruction::CallbackGenerateCharacter::DISCRIMINATOR.to_vec(),
            caller_seed: [client_seed; 32],
            accounts_metas: Some(vec![
                SerializableAccountMeta {
                    pubkey: ctx.accounts.character_generator.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: ctx.accounts.payer.key(),
                    is_signer: true,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: anchor_lang::solana_program::system_program::ID,
                    is_signer: false,
                    is_writable: false,
                },
            ]),
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
        let character_generator = &mut ctx.accounts.character_generator;
        let character = &mut ctx.accounts.character;

        // Generate Dark Souls character using VRF randomness
        let (class, stats, rarity) = generate_dark_souls_character(&randomness);

        character.owner = ctx.accounts.user.key();
        character.class = class;
        character.vitality = stats.0;
        character.strength = stats.1;
        character.dexterity = stats.2;
        character.intelligence = stats.3;
        character.rarity = rarity;
        character.created_slot = Clock::get()?.slot;

        character_generator.total_generated += 1;

        emit!(CharacterGenerated {
            user: character.owner,
            class: class as u8,
            vitality: character.vitality,
            strength: character.strength,
            dexterity: character.dexterity,
            intelligence: character.intelligence,
            rarity: rarity as u8,
        });

        msg!(
            "Generated Dark Souls character - Class: {:?}, VIT:{} STR:{} DEX:{} INT:{}, Rarity: {:?}",
            class, stats.0, stats.1, stats.2, stats.3, rarity
        );

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
        space = 8 + CharacterGenerator::INIT_SPACE,
        seeds = [CHARACTER_GENERATOR],
        bump
    )]
    pub character_generator: Account<'info, CharacterGenerator>,
    pub system_program: Program<'info, System>,
}

#[vrf]
#[derive(Accounts)]
pub struct RequestCharacterCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [CHARACTER_GENERATOR], bump)]
    pub character_generator: Account<'info, CharacterGenerator>,
    /// CHECK: The oracle queue
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CallbackGenerateCharacterCtx<'info> {
    /// This ensures the VRF program is calling this callback
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,
    #[account(mut)]
    pub character_generator: Account<'info, CharacterGenerator>,
    #[account(
        init,
        payer = user,
        space = 8 + Character::INIT_SPACE,
        seeds = [b"character", user.key().as_ref(), &character_generator.total_generated.to_le_bytes()],
        bump
    )]
    pub character: Account<'info, Character>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct CharacterGenerator {
    pub authority: Pubkey,
    pub total_generated: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Character {
    pub owner: Pubkey,
    pub class: CharacterClass,
    pub vitality: u8,
    pub strength: u8,
    pub dexterity: u8,
    pub intelligence: u8,
    pub rarity: CharacterRarity,
    pub created_slot: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, InitSpace)]
pub enum CharacterClass {
    Knight,
    Sorcerer,
    Pyromancer,
    Thief,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, InitSpace)]
pub enum CharacterRarity {
    Common,
    Rare,
    Epic,
    Legendary,
}

#[event]
pub struct CharacterGenerated {
    pub user: Pubkey,
    pub class: u8,
    pub vitality: u8,
    pub strength: u8,
    pub dexterity: u8,
    pub intelligence: u8,
    pub rarity: u8,
}

fn generate_dark_souls_character(
    randomness: &[u8; 32],
) -> (CharacterClass, (u8, u8, u8, u8), CharacterRarity) {
    // Use VRF SDK's random functions
    let class_roll = ephemeral_vrf_sdk::rnd::random_u8_with_range(randomness, 1, 100);

    let class = match class_roll {
        1..=30 => CharacterClass::Knight,      // 30%
        31..=55 => CharacterClass::Sorcerer,   // 25%
        56..=80 => CharacterClass::Pyromancer, // 25%
        _ => CharacterClass::Thief,            // 20%
    };

    // Dark Souls starting stats
    let base_stats = match class {
        CharacterClass::Knight => (27, 16, 11, 9),
        CharacterClass::Sorcerer => (8, 9, 11, 27),
        CharacterClass::Pyromancer => (12, 14, 14, 14),
        CharacterClass::Thief => (10, 9, 25, 12),
    };

    // Generate variance for each stat using different parts of randomness
    let vit_variance = ephemeral_vrf_sdk::rnd::random_u8_with_range(randomness, 0, 6) as i8 - 3; // -3 to +3
    let str_variance = (randomness[4] % 7) as i8 - 3;
    let dex_variance = (randomness[8] % 7) as i8 - 3;
    let int_variance = (randomness[12] % 7) as i8 - 3;

    let vitality = ((base_stats.0 as i8 + vit_variance).max(1).min(99)) as u8;
    let strength = ((base_stats.1 as i8 + str_variance).max(1).min(99)) as u8;
    let dexterity = ((base_stats.2 as i8 + dex_variance).max(1).min(99)) as u8;
    let intelligence = ((base_stats.3 as i8 + int_variance).max(1).min(99)) as u8;

    let total_stats = vitality as u16 + strength as u16 + dexterity as u16 + intelligence as u16;

    // Determine rarity based on total stats
    let rarity = if total_stats >= 85 {
        CharacterRarity::Legendary // Top 1%
    } else if total_stats >= 75 {
        CharacterRarity::Epic // Top 10%
    } else if total_stats >= 65 {
        CharacterRarity::Rare // Top 30%
    } else {
        CharacterRarity::Common
    };

    (class, (vitality, strength, dexterity, intelligence), rarity)
}
