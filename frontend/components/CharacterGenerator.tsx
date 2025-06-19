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
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const connection = program?.provider.connection;
      if (connection) {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1000000000); // Convert lamports to SOL
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchCharacter = async () => {
    if (!program || !getPlayerPDA) return;
    
    try {
      const playerAccount = await (program.account as any).player.fetch(getPlayerPDA);
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
        await (program.account as any).player.fetch(getPlayerPDA);
        playerExists = true;
      } catch (e) {
        // Player doesn't exist
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
          await fetchBalance();
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

      console.log('Character generation transaction sent');
      
      // Update balance after character generation transaction
      await fetchBalance();

      // Poll for result
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkResult = async () => {
        if (attempts >= maxAttempts) {
          setIsLoading(false);
          return;
        }
        
        try {
          const playerAccount = await (program.account as any).player.fetch(getPlayerPDA);
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
            
            // Final balance update after character is fully generated
            await fetchBalance();
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
      
      // Update balance even if there's an error (transaction might have been processed)
      await fetchBalance();
    }
  };

  useEffect(() => {
    if (connected && isClient) {
      fetchCharacter();
      fetchBalance();
    }
  }, [connected, program, getPlayerPDA, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading the Abyss...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-amber-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Top HUD Bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between items-center p-4">
              {/* Title */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-black">DS</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-400 tracking-wider">DARK SOULS</h1>
                  <p className="text-amber-300/70 text-sm">VRF Character Genesis</p>
                </div>
              </div>

              {/* Wallet & Balance */}
              <div className="flex items-center space-x-6">
                {/* SOL Balance Display */}
                {connected && (
                  <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/30 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">◎</span>
                      </div>
                      <div>
                        <p className="text-xs text-amber-300/70">Balance</p>
                        <p className="text-amber-400 font-bold">{balance.toFixed(4)} SOL</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Wallet Button */}
                <div className="wallet-button-container">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {!connected ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20"
            >
              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-12 backdrop-blur-sm">
                <div className="text-6xl mb-6">⚔️</div>
                <h2 className="text-3xl text-amber-400 mb-4 font-bold">Enter the Abyss</h2>
                <p className="text-amber-300/70 text-lg mb-8">Connect thy wallet to forge a character from the depths</p>
                <div className="text-amber-500/50 text-sm">
                  "In the Age of Ancients, the world was unformed..."
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Character Area - Takes 3 columns */}
              <div className="xl:col-span-3 space-y-6">
                {/* Character Display */}
                <CharacterCard character={character} isLoading={isLoading} />
                
                {/* Generate Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <button
                    onClick={generateCharacter}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-6 px-8 rounded-lg text-xl transition-all duration-300 shadow-lg disabled:shadow-none border-2 border-amber-400/50 disabled:border-gray-500/50"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6"
                          >
                            🔥
                          </motion.div>
                          <span>Forging Character...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>SUMMON CHARACTER</span>
                          <span>⚡</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  {/* Button glow effect */}
                  {!isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg blur-xl opacity-30 -z-10"></div>
                  )}
                </motion.div>

                {/* Stats Display */}
                <StatsDisplay character={character} />
              </div>

              {/* Sidebar - Takes 1 column */}
              <div className="xl:col-span-1">
                <CharacterHistory history={history} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}