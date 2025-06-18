'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useProgram } from '@/hooks/useProgram';
import { Character, CHARACTER_CLASSES, RARITIES } from '@/types/character';
import CharacterCard from './CharacterCard';
import StatsDisplay from './StatsDisplay';
import CharacterHistory from './CharacterHistory';

export default function CharacterGenerator() {
  const { connected } = useWallet();
  const { program, getPlayerPDA, publicKey } = useProgram();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Character[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCharacter = async () => {
    if (!program || !getPlayerPDA) return;
    
    try {
      const playerAccount = await program.account.player.fetch(getPlayerPDA);
      const totalStats = playerAccount.vitality + playerAccount.strength + 
                        playerAccount.dexterity + playerAccount.intelligence;
      
      if (totalStats > 0) {
        const char: Character = {
          characterClass: playerAccount.characterClass,
          vitality: playerAccount.vitality,
          strength: playerAccount.strength,
          dexterity: playerAccount.dexterity,
          intelligence: playerAccount.intelligence,
          rarity: playerAccount.rarity,
        };
        setCharacter(char);
      } else {
        setCharacter(null);
      }
    } catch (error) {
      console.log('No player account found');
      setCharacter(null);
    }
  };

  const generateCharacter = async () => {
    if (!program || !getPlayerPDA || !publicKey || !isClient) return;
    
    setIsLoading(true);
    try {
      let playerExists = false;
      try {
        await program.account.player.fetch(getPlayerPDA);
        playerExists = true;
      } catch (e) {
      }

      if (!playerExists) {
        try {
          await program.methods
            .initialize()
            .accountsPartial({
              payer: publicKey,
              player: getPlayerPDA,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
          console.log('Player account initialized');
        } catch (e) {
          console.error('Failed to initialize player:', e);
          setIsLoading(false);
          return;
        }
      }

      const clientSeed = Math.floor(Math.random() * 256);
      
      await program.methods
        .generateCharacter(clientSeed)
        .accounts({
          payer: publicKey,
          player: getPlayerPDA,
          oracleQueue: new PublicKey('Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh'),
          programIdentity: new PublicKey('6tAHXcHybiBxf8xeXMrw6Z5VfATFLtxA54Ug6ATnnxPc'),
          vrfProgram: new PublicKey('Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz'),
          slotHashes: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Poll for result
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkResult = async () => {
        if (attempts >= maxAttempts) {
          setIsLoading(false);
          return;
        }
        
        try {
          const playerAccount = await program.account.player.fetch(getPlayerPDA);
          const totalStats = playerAccount.vitality + playerAccount.strength + 
                           playerAccount.dexterity + playerAccount.intelligence;
          
          if (totalStats > 0) {
            const newChar: Character = {
              characterClass: playerAccount.characterClass,
              vitality: playerAccount.vitality,
              strength: playerAccount.strength,
              dexterity: playerAccount.dexterity,
              intelligence: playerAccount.intelligence,
              rarity: playerAccount.rarity,
              timestamp: Date.now(),
            };
            setCharacter(newChar);
            setHistory(prev => [newChar, ...prev.slice(0, 9)]);
            setIsLoading(false);
          } else {
            attempts++;
            setTimeout(checkResult, 1000);
          }
        } catch (error) {
          attempts++;
          setTimeout(checkResult, 1000);
        }
      };
      
      setTimeout(checkResult, 2000);
    } catch (error) {
      console.error('Error generating character:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected && isClient) {
      fetchCharacter();
    }
  }, [connected, program, getPlayerPDA, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Dark Souls VRF</h1>
            <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="text-center py-20">
            <div className="h-6 bg-slate-700 rounded w-64 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white">Dark Souls VRF</h1>
          <WalletMultiButton />
        </motion.div>

        {!connected ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl text-gray-300 mb-4">Connect your wallet to generate characters</h2>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Character Area */}
            <div className="lg:col-span-2 space-y-6">
              <CharacterCard character={character} isLoading={isLoading} />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateCharacter}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
              >
                {isLoading ? 'Generating Character...' : 'Generate Character'}
              </motion.button>

              <StatsDisplay character={character} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CharacterHistory history={history} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}