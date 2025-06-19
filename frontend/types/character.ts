export interface Character {
  characterClass: number;
  vitality: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  rarity: number;
  timestamp?: number;
}

export interface CharacterClass {
  id: number;
  name: string;
  sprite: string;
  description: string;
}

export interface Rarity {
  id: number;
  name: string;
  color: string;
  glowColor: string;
  percentage: string;
}

export const CHARACTER_CLASSES: CharacterClass[] = [
  { id: 0, name: 'Knight', sprite: '/knight.jpg', description: 'A noble warrior with high vitality and strength' },
  { id: 1, name: 'Sorcerer', sprite: '/sorcerer.jpg', description: 'A master of magic with high intelligence' },
  { id: 2, name: 'Pyromancer', sprite: '/pyromancer.jpg', description: 'A balanced fighter wielding fire magic' },
  { id: 3, name: 'Thief', sprite: '/thief.jpg', description: 'A nimble rogue with high dexterity' },
];

export const RARITIES: Rarity[] = [
  { id: 0, name: 'Common', color: 'text-gray-400', glowColor: 'shadow-gray-400/50', percentage: 'Top 70%' },
  { id: 1, name: 'Rare', color: 'text-blue-400', glowColor: 'shadow-blue-400/50', percentage: 'Top 30%' },
  { id: 2, name: 'Epic', color: 'text-purple-400', glowColor: 'shadow-purple-400/50', percentage: 'Top 10%' },
  { id: 3, name: 'Legendary', color: 'text-yellow-400', glowColor: 'shadow-yellow-400/50', percentage: 'Top 1%' },
];