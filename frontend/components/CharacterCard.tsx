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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700"
    >
      {/* Rarity Glow Effect */}
      {character && rarity && (
        <div className={`absolute inset-0 rounded-2xl ${rarity.glowColor} shadow-2xl opacity-20`} />
      )}
      
      <div className="relative z-10">
        {/* Character Display */}
        <div className="text-center mb-6">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              <div className="text-4xl">🌀</div>
            </motion.div>
          ) : character && characterClass ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-600 bg-slate-800"
            >
              <Image
                src={characterClass.sprite}
                alt={characterClass.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                priority
              />
            </motion.div>
          ) : (
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border-4 border-slate-600">
              <div className="text-4xl text-slate-500">?</div>
            </div>
          )}

          {/* Character Name */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-white mb-2"
          >
            {isLoading ? 'Generating...' : characterClass?.name || 'No Character'}
          </motion.h2>

          {/* Rarity Badge */}
          {character && rarity && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-block px-4 py-2 rounded-full ${rarity.color} border border-current bg-black/20`}
            >
              {rarity.name}
            </motion.div>
          )}
        </div>

        {/* Character Description */}
        {characterClass && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-center text-sm"
          >
            {characterClass.description}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}