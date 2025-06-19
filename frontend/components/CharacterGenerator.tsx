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
      {/* Reduced Background Elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => ( // Reduced from 50 to 15
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) 
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

      {/* Compact Top HUD Bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 p-2" // Reduced from p-4 to p-2
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-lg">
            <div className="flex justify-between items-center p-3"> {/* Reduced from p-4 to p-3 */}
              {/* Compact Title */}
              <div className="flex items-center space-x-3"> {/* Reduced from space-x-4 to space-x-3 */}
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center"> {/* Reduced from w-12 h-12 to w-10 h-10 */}
                  <span className="text-xl font-bold text-black">DS</span> {/* Reduced from text-2xl to text-xl */}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-amber-400 tracking-wider">DARK SOULS</h1> {/* Reduced from text-2xl to text-xl */}
                  <p className="text-amber-300/70 text-xs">VRF Character Genesis</p> {/* Reduced from text-sm to text-xs */}
                </div>
              </div>

              {/* Compact Wallet & Balance */}
              <div className="flex items-center space-x-4 relative"> {/* Reduced from space-x-6 to space-x-4 */}
                {/* Compact SOL Balance Display */}
                {connected && (
                  <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/30 rounded-lg px-3 py-1.5"> {/* Reduced padding */}
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"> {/* Reduced from w-6 h-6 to w-5 h-5 */}
                        <span className="text-xs font-bold text-black">◎</span>
                      </div>
                      <div>
                        <p className="text-xs text-amber-300/70">Balance</p>
                        <p className="text-amber-400 font-bold text-sm">{balance.toFixed(4)} SOL</p> {/* Added text-sm */}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Network Dropdown */}
                <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/30 rounded-lg px-3 py-1.5">
                Devnet
                </div>
                
                {/* Wallet Button */}
                <div>
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact Main Content */}
      <div className="relative z-10 p-1"> {/* Reduced from p-2 to p-1 */}
        <div className="max-w-7xl mx-auto">
          {!connected ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6" // Reduced from py-12 to py-6
            >
              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-4"> {/* Reduced from p-8 to p-4 */}
                <div className="text-2xl mb-2">⚔️</div> {/* Reduced from text-4xl mb-4 to text-2xl mb-2 */}
                <h2 className="text-xl text-amber-400 mb-2 font-bold">Enter the Abyss</h2> {/* Reduced from text-2xl mb-3 to text-xl mb-2 */}
                <p className="text-amber-300/70 text-sm mb-4">Connect thy wallet to forge a character from the depths</p> {/* Reduced from text-base mb-6 to text-sm mb-4 */}
                <div className="text-amber-500/50 text-xs">
                  "In the Age of Ancients, the world was unformed..."
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-2"> {/* Changed from xl:grid-cols-4 to xl:grid-cols-5 */}
              {/* Main Character Area - Takes 4 columns */}
              <div className="xl:col-span-4 space-y-2"> {/* Changed from xl:col-span-3 to xl:col-span-4 */}
                {/* Character Display */}
                <CharacterCard character={character} isLoading={isLoading} />
                
                {/* Compact Generate Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative"
                >
                  <button
                    onClick={generateCharacter}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-2 px-4 rounded-lg text-base transition-all duration-300 shadow-lg disabled:shadow-none border-2 border-amber-400/50 disabled:border-gray-500/50"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4"
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

              {/* Sidebar - Character History */}
              <div className="xl:col-span-1">
                <div className="sticky top-1"> {/* Reduced from top-2 to top-1 */}
                  <CharacterHistory history={history} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}