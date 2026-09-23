import { PublicKey, SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY } from '@solana/web3.js';

/** Base-layer VRF oracle queue on devnet (see MagicBlock vrf::consts::DEFAULT_QUEUE). */
export const VRF_BASE_QUEUE = new PublicKey(
  'Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh',
);

export const VRF_PROGRAM_ID = new PublicKey(
  'Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz',
);

export const MAGICBLOCK_DEVNET_RPC = 'https://rpc.magicblock.app/devnet';

/** PDA used when signing scoped VRF requests (`#[vrf]` macro). */
export function vrfProgramIdentity(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('identity')], programId)[0];
}

export function vrfRequestAccounts(
  programId: PublicKey,
  payer: PublicKey,
  player: PublicKey,
) {
  return {
    payer,
    player,
    oracleQueue: VRF_BASE_QUEUE,
    programIdentity: vrfProgramIdentity(programId),
    vrfProgram: VRF_PROGRAM_ID,
    slotHashes: SYSVAR_SLOT_HASHES_PUBKEY,
    systemProgram: SystemProgram.programId,
  };
}
