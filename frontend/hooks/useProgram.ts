'use client';
import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { DarkSoulsVrf } from '@/types/dark_souls_vrf';
import idl from '@/types/dark_souls_vrf.json';

const PROGRAM_ID = new PublicKey('7ZUUFi38cG3QT3n58THDDNwPVT7AoQmX79o3cGT9GQgr');

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null;

    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction!,
      signAllTransactions: wallet.signAllTransactions!,
    };

    const provider = new AnchorProvider(connection, anchorWallet, {
      commitment: 'confirmed',
    });

    return new Program(idl as Idl, provider) as Program<DarkSoulsVrf>;
  }, [connection, wallet.connected, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const getPlayerPDA = useMemo(() => {
    if (!wallet.publicKey) return null;
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('player'), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    return pda;
  }, [wallet.publicKey]);

  return { program, getPlayerPDA, publicKey: wallet.publicKey, programId: PROGRAM_ID };
}