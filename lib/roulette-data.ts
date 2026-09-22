// Roulette Française - Définitions officielles, agencement du cylindre et du tapis

export type RouletteColor = 'red' | 'black' | 'green';
export type Parity = 'even' | 'odd' | null;
export type RangeType = 'low' | 'high' | null; // low: 1-18 (Manque), high: 19-36 (Passe)
export type SectorType = 'voisins' | 'tiers' | 'orphelins' | 'zero_spiel';

export interface RouletteNumberInfo {
  value: number;
  color: RouletteColor;
  parity: Parity;
  range: RangeType;
  dozen: 1 | 2 | 3 | null;
  column: 1 | 2 | 3 | null;
  sector: SectorType;
  wheelIndex: number;
}

// Ordre des numéros sur le cylindre de la Roulette Française (37 cases, sens horaire depuis 0)
export const FRENCH_WHEEL_ORDER: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Numéros Rouges officiels
export const RED_NUMBERS = new Set<number>([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

// Secteurs officiels
export const VOISINS_DU_ZERO = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25];
export const TIERS_DU_CYLINDRE = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33];
export const ORPHELINS = [1, 20, 14, 31, 9, 17, 34, 6];
export const JEU_ZERO = [12, 35, 3, 26, 0, 32, 15];

const voisinsSet = new Set(VOISINS_DU_ZERO);
const tiersSet = new Set(TIERS_DU_CYLINDRE);
const orphelinsSet = new Set(ORPHELINS);

// Création du dictionnaire complet de 0 à 36
export const ROULETTE_NUMBERS: Record<number, RouletteNumberInfo> = {};

for (let i = 0; i <= 36; i++) {
  const wheelIndex = FRENCH_WHEEL_ORDER.indexOf(i);
  let color: RouletteColor = 'green';
  let parity: Parity = null;
  let range: RangeType = null;
  let dozen: 1 | 2 | 3 | null = null;
  let column: 1 | 2 | 3 | null = null;
  let sector: SectorType = 'voisins';

  if (i === 0) {
    color = 'green';
    sector = 'zero_spiel';
  } else {
    color = RED_NUMBERS.has(i) ? 'red' : 'black';
    parity = i % 2 === 0 ? 'even' : 'odd';
    range = i <= 18 ? 'low' : 'high';
    dozen = i <= 12 ? 1 : i <= 24 ? 2 : 3;
    column = ((i - 1) % 3 + 1) as 1 | 2 | 3;

    if (tiersSet.has(i)) {
      sector = 'tiers';
    } else if (orphelinsSet.has(i)) {
      sector = 'orphelins';
    } else {
      sector = 'voisins';
    }
  }

  ROULETTE_NUMBERS[i] = {
    value: i,
    color,
    parity,
    range,
    dozen,
    column,
    sector,
    wheelIndex
  };
}

export const SECTOR_NAMES: Record<SectorType, string> = {
  voisins: 'Voisins du Zéro',
  tiers: 'Tiers du Cylindre',
  orphelins: 'Orphelins',
  zero_spiel: 'Jeu Zéro'
};
