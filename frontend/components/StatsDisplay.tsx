'use client';
import { motion } from 'framer-motion';
import { Character } from '@/types/character';

interface StatsDisplayProps {
  character: Character | null;
}

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: string;
  delay: number;
}

function StatBar({ label, value, maxValue, color, icon, delay }: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-slate-800 rounded-lg p-4 border border-slate-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-white font-medium">{label}</span>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.5, color: color }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold text-white"
        >
          {value}
        </motion.span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className={`h-full ${color} relative`}
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function StatsDisplay({ character }: StatsDisplayProps) {
  if (!character) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 opacity-50">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalStats = character.vitality + character.strength + character.dexterity + character.intelligence;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h3 className="text-xl font-bold text-white mb-2">Character Stats</h3>
        <p className="text-gray-400">Total: {totalStats}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBar
          label="Vitality"
          value={character.vitality}
          maxValue={50}
          color="bg-red-500"
          icon="❤️"
          delay={0}
        />
        <StatBar
          label="Strength"
          value={character.strength}
          maxValue={50}
          color="bg-orange-500"
          icon="💪"
          delay={0.1}
        />
        <StatBar
          label="Dexterity"
          value={character.dexterity}
          maxValue={50}
          color="bg-green-500"
          icon="🏹"
          delay={0.2}
        />
        <StatBar
          label="Intelligence"
          value={character.intelligence}
          maxValue={50}
          color="bg-blue-500"
          icon="🧠"
          delay={0.3}
        />
      </div>
    </div>
  );
}