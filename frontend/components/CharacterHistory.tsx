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
      className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-xl font-bold text-white mb-4">Character History</h3>
      
      {history.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📜</div>
          <p className="text-gray-400">No characters generated yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {history.map((char, index) => {
              const characterClass = CHARACTER_CLASSES[char.characterClass];
              const rarity = RARITIES[char.rarity];
              const totalStats = char.vitality + char.strength + char.dexterity + char.intelligence;
              
              return (
                <motion.div
                  key={char.timestamp || index}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-500">
                        <Image
                          src={characterClass.sprite}
                          alt={characterClass.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-white">{characterClass.name}</div>
                        <div className={`text-xs ${rarity.color}`}>{rarity.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{totalStats}</div>
                      <div className="text-xs text-gray-400">Total Stats</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="text-center">
                      <div className="text-red-400">❤️ {char.vitality}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-400">💪 {char.strength}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400">🏹 {char.dexterity}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400">🧠 {char.intelligence}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      {/* Rarity Distribution */}
      <div className="mt-6 pt-4 border-t border-slate-600">
        <h4 className="text-sm font-medium text-white mb-3">Character Rarity</h4>
        <div className="space-y-2">
          {RARITIES.map((rarity) => (
            <div key={rarity.id} className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${rarity.color}`}>
                <div className={`w-3 h-3 rounded-full bg-current`}></div>
                <span className="text-sm">{rarity.name}</span>
              </div>
              <span className="text-xs text-gray-400">{rarity.percentage}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Class Distribution */}
      <div className="mt-4 pt-4 border-t border-slate-600">
        <h4 className="text-sm font-medium text-white mb-3">Character Classes</h4>
        <div className="grid grid-cols-2 gap-2">
          {CHARACTER_CLASSES.map((charClass) => (
            <div key={charClass.id} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-500">
                <Image
                  src={charClass.sprite}
                  alt={charClass.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm text-white">{charClass.name}</div>
                <div className="text-xs text-gray-400">25%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}