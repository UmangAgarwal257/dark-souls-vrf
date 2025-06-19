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
  bgColor: string;
  icon: string;
  delay: number;
}

function StatBar({ label, value, maxValue, color, bgColor, icon, delay }: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center border border-current/50`}>
            <span className="text-sm">{icon}</span>
          </div>
          <span className="text-amber-400 font-bold tracking-wide">{label.toUpperCase()}</span>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.5, color: color }}
          animate={{ scale: 1, color: '#fbbf24' }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold text-amber-400"
        >
          {value}
        </motion.span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-amber-500/30"> {/* Reduced from h-4 to h-2 */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            className={`h-full ${color} relative`}
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </motion.div>
        </div>
        <div className="absolute right-2 top-0 h-full flex items-center">
          <span className="text-xs text-amber-300/70 font-mono">{percentage.toFixed(0)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsDisplay({ character }: StatsDisplayProps) {
  if (!character) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-r from-amber-900/10 to-orange-900/10 border border-amber-500/20 rounded-lg p-4 backdrop-blur-sm"
          >
            <div className="animate-pulse">
              <div className="h-6 bg-amber-700/20 rounded mb-3"></div>
              <div className="h-4 bg-amber-700/20 rounded"></div>
            </div>
          </motion.div>
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
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-amber-400 mb-2 tracking-wider">⚔️ SOUL ATTRIBUTES ⚔️</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-300/70">Total Power:</span>
            <motion.span 
              key={totalStats}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-amber-400"
            >
              {totalStats}
            </motion.span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBar
          label="Vitality"
          value={character.vitality}
          maxValue={50}
          color="bg-gradient-to-r from-red-500 to-red-600"
          bgColor="bg-red-900/50"
          icon="❤️"
          delay={0}
        />
        <StatBar
          label="Strength"
          value={character.strength}
          maxValue={50}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          bgColor="bg-orange-900/50"
          icon="💪"
          delay={0.1}
        />
        <StatBar
          label="Dexterity"
          value={character.dexterity}
          maxValue={50}
          color="bg-gradient-to-r from-green-500 to-green-600"
          bgColor="bg-green-900/50"
          icon="🏹"
          delay={0.2}
        />
        <StatBar
          label="Intelligence"
          value={character.intelligence}
          maxValue={50}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          bgColor="bg-blue-900/50"
          icon="🧠"
          delay={0.3}
        />
      </div>
    </div>
  );
}