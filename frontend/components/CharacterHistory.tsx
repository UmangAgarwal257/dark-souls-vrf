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
      className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-4 relative"
    >
      {/* Compact Header */}
      <div className="relative mb-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
          <h3 className="text-lg font-bold text-amber-400 tracking-wider">HALL OF SOULS</h3>
          <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-4xl mb-3"
          >
            ⚱️
          </motion.div>
          <h4 className="text-amber-400 font-bold mb-2 text-sm">Empty Chronicle</h4>
          <p className="text-amber-300/70 text-xs">No souls have been forged yet...</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30">
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
                  whileHover={{ scale: 1.01, x: 3 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg p-3 hover:border-amber-400/60 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Rarity Glow */}
                  <div className={`absolute inset-0 ${rarity.glowColor} opacity-10 rounded-lg`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/70 bg-gradient-to-br from-amber-900 to-orange-900">
                            <Image
                              src={characterClass.sprite}
                              alt={characterClass.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${rarity.color.replace('text-', 'bg-')} border border-black`}></div>
                        </div>
                        <div>
                          <div className="font-bold text-amber-400 text-xs tracking-wide">{characterClass.name.toUpperCase()}</div>
                          <div className={`text-xs ${rarity.color} font-medium`}>⚡ {rarity.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-amber-400">{totalStats}</div>
                        <div className="text-xs text-amber-300/70">Power</div>
                      </div>
                    </div>
                    
                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div className="text-center bg-red-900/30 rounded border border-red-500/30 py-0.5">
                        <div className="text-red-400 font-bold text-xs">❤️</div>
                        <div className="text-red-300 text-xs">{char.vitality}</div>
                      </div>
                      <div className="text-center bg-orange-900/30 rounded border border-orange-500/30 py-0.5">
                        <div className="text-orange-400 font-bold text-xs">💪</div>
                        <div className="text-orange-300 text-xs">{char.strength}</div>
                      </div>
                      <div className="text-center bg-green-900/30 rounded border border-green-500/30 py-0.5">
                        <div className="text-green-400 font-bold text-xs">🏹</div>
                        <div className="text-green-300 text-xs">{char.dexterity}</div>
                      </div>
                      <div className="text-center bg-blue-900/30 rounded border border-blue-500/30 py-0.5">
                        <div className="text-blue-400 font-bold text-xs">🧠</div>
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
      
      {/* Compact Rarity Codex */}
      <div className="mt-4 pt-3 border-t border-amber-500/30">
        <h4 className="text-xs font-bold text-amber-400 mb-2 tracking-wide">⚡ SOUL RARITY CODEX</h4>
        <div className="space-y-1">
          {RARITIES.map((rarity) => (
            <div key={rarity.id} className="flex items-center justify-between p-1.5 bg-gradient-to-r from-amber-900/10 to-orange-900/10 rounded border border-amber-500/20">
              <div className={`flex items-center gap-1.5 ${rarity.color}`}>
                <div className={`w-2 h-2 rounded-full bg-current shadow-lg`}></div>
                <span className="text-xs font-medium">{rarity.name}</span>
              </div>
              <span className="text-xs text-amber-300/70 font-mono">{rarity.percentage}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Compact Class Grimoire */}
      <div className="mt-3 pt-3 border-t border-amber-500/30">
        <h4 className="text-xs font-bold text-amber-400 mb-2 tracking-wide">⚔️ CLASS GRIMOIRE</h4>
        <div className="grid grid-cols-1 gap-1">
          {CHARACTER_CLASSES.map((charClass) => (
            <div key={charClass.id} className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-amber-900/10 to-orange-900/10 rounded border border-amber-500/20">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400/50">
                <Image
                  src={charClass.sprite}
                  alt={charClass.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-amber-400">{charClass.name}</div>
                <div className="text-xs text-amber-300/70">25% spawn rate</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}