'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Character, CHARACTER_CLASSES, RARITIES } from '@/types/character';

interface CharacterHistoryProps {
  history: Character[];
}

export default function CharacterHistory({ history }: CharacterHistoryProps) {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-2 border-amber-500/50 rounded-2xl p-6 relative"
    >
      {/* Header with Medieval Styling */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-6 h-6 bg-amber-400 rounded-full"></div>
          <h3 className="text-xl font-bold text-amber-400 tracking-wider">HALL OF SOULS</h3>
          <div className="w-6 h-6 bg-amber-400 rounded-full"></div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ⚱️
          </motion.div>
          <h4 className="text-amber-400 font-bold mb-2">Empty Chronicle</h4>
          <p className="text-amber-300/70 text-sm">No souls have been forged yet...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30">
          <AnimatePresence>
            {history.map((char, index) => {
              const characterClass = CHARACTER_CLASSES[char.characterClass];
              const rarity = RARITIES[char.rarity];
              const totalStats = char.vitality + char.strength + char.dexterity + char.intelligence;
              
              return (
                <motion.div
                  key={char.timestamp || index}
                  initial={{ x: 100, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -100, opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Rarity Glow */}
                  <div className={`absolute inset-0 ${rarity.glowColor} opacity-10 rounded-lg`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/70 bg-gradient-to-br from-amber-900 to-orange-900">
                            <Image
                              src={characterClass.sprite}
                              alt={characterClass.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${rarity.color.replace('text-', 'bg-')} border border-black`}></div>
                        </div>
                        <div>
                          <div className="font-bold text-amber-400 text-sm tracking-wide">{characterClass.name.toUpperCase()}</div>
                          <div className={`text-xs ${rarity.color} font-medium`}>⚡ {rarity.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-400">{totalStats}</div>
                        <div className="text-xs text-amber-300/70">Power</div>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center bg-red-900/30 rounded border border-red-500/30 py-1">
                        <div className="text-red-400 font-bold">❤️</div>
                        <div className="text-red-300 text-xs">{char.vitality}</div>
                      </div>
                      <div className="text-center bg-orange-900/30 rounded border border-orange-500/30 py-1">
                        <div className="text-orange-400 font-bold">💪</div>
                        <div className="text-orange-300 text-xs">{char.strength}</div>
                      </div>
                      <div className="text-center bg-green-900/30 rounded border border-green-500/30 py-1">
                        <div className="text-green-400 font-bold">🏹</div>
                        <div className="text-green-300 text-xs">{char.dexterity}</div>
                      </div>
                      <div className="text-center bg-blue-900/30 rounded border border-blue-500/30 py-1">
                        <div className="text-blue-400 font-bold">🧠</div>
                        <div className="text-blue-300 text-xs">{char.intelligence}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      {/* Rarity Codex */}
      <div className="mt-6 pt-4 border-t border-amber-500/30">
        <h4 className="text-sm font-bold text-amber-400 mb-3 tracking-wide">⚡ SOUL RARITY CODEX</h4>
        <div className="space-y-2">
          {RARITIES.map((rarity) => (
            <div key={rarity.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-amber-900/10 to-orange-900/10 rounded border border-amber-500/20">
              <div className={`flex items-center gap-2 ${rarity.color}`}>
                <div className={`w-3 h-3 rounded-full bg-current shadow-lg`}></div>
                <span className="text-sm font-medium">{rarity.name}</span>
              </div>
              <span className="text-xs text-amber-300/70 font-mono">{rarity.percentage}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Class Grimoire */}
      <div className="mt-4 pt-4 border-t border-amber-500/30">
        <h4 className="text-sm font-bold text-amber-400 mb-3 tracking-wide">⚔️ CLASS GRIMOIRE</h4>
        <div className="grid grid-cols-1 gap-2">
          {CHARACTER_CLASSES.map((charClass) => (
            <div key={charClass.id} className="flex items-center gap-3 p-2 bg-gradient-to-r from-amber-900/10 to-orange-900/10 rounded border border-amber-500/20">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400/50">
                <Image
                  src={charClass.sprite}
                  alt={charClass.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-amber-400">{charClass.name}</div>
                <div className="text-xs text-amber-300/70">25% spawn rate</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}