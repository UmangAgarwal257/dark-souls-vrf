'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Character, CHARACTER_CLASSES, RARITIES } from '@/types/character';

interface CharacterCardProps {
  character: Character | null;
  isLoading: boolean;
}

export default function CharacterCard({ character, isLoading }: CharacterCardProps) {
  const characterClass = character ? CHARACTER_CLASSES[character.characterClass] : null;
  const rarity = character ? RARITIES[character.rarity] : null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative"
    >
      {/* Hexagonal Container */}
      <div className="relative bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-2 border-amber-500/50 rounded-3xl p-8 overflow-hidden">
        
        {/* Rarity Glow Effect */}
        {character && rarity && (
          <div className={`absolute inset-0 ${rarity.glowColor} shadow-2xl opacity-30 rounded-3xl`} />
        )}
        
        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-400/50"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-400/50"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-400/50"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-400/50"></div>
        
        <div className="relative z-10">
          <div className="text-center">
            {isLoading ? (
              <div className="space-y-6">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="w-40 h-40 mx-auto relative"
                >
                  <div className="w-full h-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-amber-400/50">
                    <div className="text-6xl">🔥</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-xl opacity-50"></div>
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-amber-400">Communing with the Abyss...</h2>
                  <p className="text-amber-300/70">The flames stir, shaping thy destiny</p>
                </div>
              </div>
            ) : character && characterClass ? (
              <div className="space-y-6">
                {/* Character Portrait */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="relative w-40 h-40 mx-auto"
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-amber-400/70 bg-gradient-to-br from-amber-900 to-orange-900 shadow-2xl">
                    <Image
                      src={characterClass.sprite}
                      alt={characterClass.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  {/* Portrait Glow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-xl"></div>
                </motion.div>

                {/* Character Info */}
                <div className="space-y-4">
                  <motion.h2
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-amber-400 tracking-wider"
                  >
                    {characterClass.name.toUpperCase()}
                  </motion.h2>

                  {/* Rarity Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className={`inline-block px-6 py-2 rounded-full ${rarity?.color} border-2 border-current bg-black/40 font-bold tracking-wide`}
                  >
                    ✦ {rarity?.name.toUpperCase()} ✦
                  </motion.div>

                  {/* Character Description */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-4"
                  >
                    <p className="text-amber-300/80 italic text-lg">
                      "{characterClass.description}"
                    </p>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-12">
                <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-600 flex items-center justify-center">
                  <div className="text-6xl text-gray-500">👤</div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-400 mb-2">Awaiting Summoning</h2>
                  <p className="text-gray-500">The void calls for a soul to be born...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}