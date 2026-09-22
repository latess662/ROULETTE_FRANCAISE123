import {
  ROULETTE_NUMBERS,
  FRENCH_WHEEL_ORDER,
  VOISINS_DU_ZERO,
  TIERS_DU_CYLINDRE,
  ORPHELINS,
  RouletteColor,
  Parity,
  RangeType,
  SectorType,
  SECTOR_NAMES
} from './roulette-data';

export interface SpinRecord {
  id: string;
  number: number;
  timestamp: number;
  predictionAtTime?: PredictionResult;
}

export interface PredictionResult {
  vipNumber: number;
  coverageNumbers: number[];
  suggestedSector: SectorType;
  suggestedColor: RouletteColor;
  suggestedParity: Parity;
  suggestedRange: RangeType;
  suggestedDozen: 1 | 2 | 3;
  suggestedColumn: 1 | 2 | 3;
  confidence: number; // e.g. 84.5%
  rationale: string;
  cycleScore: number;
}

export interface RouletteStats {
  totalSpins: number;
  frequencies: Record<number, number>; // count per number
  frequencyPercentages: Record<number, number>;
  gaps: Record<number, number>; // spins since last seen
  maxGaps: Record<number, number>;
  hotNumbers: { number: number; count: number; percentage: number }[];
  coldNumbers: { number: number; gap: number }[];
  
  // Chances simples
  colorCounts: { red: number; black: number; green: number };
  colorPercentages: { red: number; black: number; green: number };
  parityCounts: { even: number; odd: number; zero: number };
  parityPercentages: { even: number; odd: number; zero: number };
  rangeCounts: { low: number; high: number; zero: number };
  rangePercentages: { low: number; high: number; zero: number };

  // Douzaines & Colonnes
  dozenCounts: { 1: number; 2: number; 3: number; zero: number };
  columnCounts: { 1: number; 2: number; 3: number; zero: number };

  // Secteurs
  sectorCounts: { voisins: number; tiers: number; orphelins: number };
  sectorPercentages: { voisins: number; tiers: number; orphelins: number };

  // Séries actuelles (streaks)
  activeStreak: {
    type: 'color' | 'parity' | 'range' | 'none';
    value: string;
    count: number;
  };

  // Précision de la session
  accuracy: {
    totalChecked: number;
    vipHits: number;
    coverageHits: number;
    sectorHits: number;
    colorHits: number;
    dozenHits: number;
  };
}

// Calcule les statistiques complètes de la session
export function calculateRouletteStats(history: SpinRecord[]): RouletteStats {
  const total = history.length;
  const frequencies: Record<number, number> = {};
  const gaps: Record<number, number> = {};
  const maxGaps: Record<number, number> = {};

  for (let i = 0; i <= 36; i++) {
    frequencies[i] = 0;
    gaps[i] = total; // par défaut pas encore apparu
    maxGaps[i] = 0;
  }

  const colorCounts = { red: 0, black: 0, green: 0 };
  const parityCounts = { even: 0, odd: 0, zero: 0 };
  const rangeCounts = { low: 0, high: 0, zero: 0 };
  const dozenCounts = { 1: 0, 2: 0, 3: 0, zero: 0 };
  const columnCounts = { 1: 0, 2: 0, 3: 0, zero: 0 };
  const sectorCounts = { voisins: 0, tiers: 0, orphelins: 0 };

  // Suivi des écarts dynamiques
  const lastSeenMap: Record<number, number> = {};

  history.forEach((spin, index) => {
    const num = spin.number;
    const info = ROULETTE_NUMBERS[num];
    frequencies[num] = (frequencies[num] || 0) + 1;

    // Gaps
    if (lastSeenMap[num] !== undefined) {
      const currentGap = index - lastSeenMap[num] - 1;
      if (currentGap > (maxGaps[num] || 0)) {
        maxGaps[num] = currentGap;
      }
    }
    lastSeenMap[num] = index;

    // Couleurs
    if (info.color === 'red') colorCounts.red++;
    else if (info.color === 'black') colorCounts.black++;
    else colorCounts.green++;

    // Parité
    if (num === 0) parityCounts.zero++;
    else if (info.parity === 'even') parityCounts.even++;
    else parityCounts.odd++;

    // Manque / Passe
    if (num === 0) rangeCounts.zero++;
    else if (info.range === 'low') rangeCounts.low++;
    else rangeCounts.high++;

    // Douzaines
    if (num === 0) dozenCounts.zero++;
    else if (info.dozen) dozenCounts[info.dozen]++;

    // Colonnes
    if (num === 0) columnCounts.zero++;
    else if (info.column) columnCounts[info.column]++;

    // Secteurs
    if (info.sector === 'tiers') sectorCounts.tiers++;
    else if (info.sector === 'orphelins') sectorCounts.orphelins++;
    else sectorCounts.voisins++;
  });

  // Calcul des écarts finaux à partir du dernier tirage
  for (let i = 0; i <= 36; i++) {
    if (lastSeenMap[i] !== undefined) {
      gaps[i] = total - 1 - lastSeenMap[i];
    } else {
      gaps[i] = total;
    }
  }

  // Pourcentages
  const pct = (val: number) => (total > 0 ? (val / total) * 100 : 0);
  const frequencyPercentages: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) {
    frequencyPercentages[i] = pct(frequencies[i]);
  }

  // Numéros chauds (Hot) et froids (Cold)
  const numbersList = Array.from({ length: 37 }, (_, i) => i);
  const hotNumbers = [...numbersList]
    .sort((a, b) => (frequencies[b] || 0) - (frequencies[a] || 0))
    .slice(0, 5)
    .map(n => ({ number: n, count: frequencies[n], percentage: pct(frequencies[n]) }));

  const coldNumbers = [...numbersList]
    .sort((a, b) => (gaps[b] || 0) - (gaps[a] || 0))
    .slice(0, 5)
    .map(n => ({ number: n, gap: gaps[n] }));

  // Séries consécutives récentes
  let activeStreak: RouletteStats['activeStreak'] = { type: 'none', value: '', count: 0 };
  if (history.length > 0) {
    const lastNum = history[history.length - 1].number;
    const lastInfo = ROULETTE_NUMBERS[lastNum];

    // Check color streak
    if (lastInfo.color !== 'green') {
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (ROULETTE_NUMBERS[history[i].number].color === lastInfo.color) {
          streak++;
        } else {
          break;
        }
      }
      if (streak >= 2) {
        activeStreak = {
          type: 'color',
          value: lastInfo.color === 'red' ? 'Rouge' : 'Noir',
          count: streak
        };
      }
    }

    // Si pas de série couleur forte, test parité
    if (activeStreak.count < 3 && lastInfo.parity) {
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (ROULETTE_NUMBERS[history[i].number].parity === lastInfo.parity) {
          streak++;
        } else {
          break;
        }
      }
      if (streak > activeStreak.count) {
        activeStreak = {
          type: 'parity',
          value: lastInfo.parity === 'even' ? 'Pair' : 'Impair',
          count: streak
        };
      }
    }
  }

  // Précision des prédictions passées
  let totalChecked = 0;
  let vipHits = 0;
  let coverageHits = 0;
  let sectorHits = 0;
  let colorHits = 0;
  let dozenHits = 0;

  for (let i = 0; i < history.length; i++) {
    const spin = history[i];
    if (spin.predictionAtTime) {
      totalChecked++;
      const p = spin.predictionAtTime;
      const actual = spin.number;
      const actualInfo = ROULETTE_NUMBERS[actual];

      if (actual === p.vipNumber) vipHits++;
      if (p.coverageNumbers.includes(actual) || actual === p.vipNumber) coverageHits++;
      if (actualInfo.sector === p.suggestedSector || (p.suggestedSector === 'voisins' && actualInfo.sector === 'zero_spiel')) {
        sectorHits++;
      }
      if (actualInfo.color === p.suggestedColor) colorHits++;
      if (actualInfo.dozen === p.suggestedDozen) dozenHits++;
    }
  }

  return {
    totalSpins: total,
    frequencies,
    frequencyPercentages,
    gaps,
    maxGaps,
    hotNumbers,
    coldNumbers,
    colorCounts,
    colorPercentages: {
      red: pct(colorCounts.red),
      black: pct(colorCounts.black),
      green: pct(colorCounts.green)
    },
    parityCounts,
    parityPercentages: {
      even: pct(parityCounts.even),
      odd: pct(parityCounts.odd),
      zero: pct(parityCounts.zero)
    },
    rangeCounts,
    rangePercentages: {
      low: pct(rangeCounts.low),
      high: pct(rangeCounts.high),
      zero: pct(rangeCounts.zero)
    },
    dozenCounts,
    columnCounts,
    sectorCounts,
    sectorPercentages: {
      voisins: pct(sectorCounts.voisins),
      tiers: pct(sectorCounts.tiers),
      orphelins: pct(sectorCounts.orphelins)
    },
    activeStreak,
    accuracy: {
      totalChecked,
      vipHits,
      coverageHits,
      sectorHits,
      colorHits,
      dozenHits
    }
  };
}

// Algorithme de prédiction statistique multi-facteurs pour le prochain tour
export function generateRoulettePrediction(history: SpinRecord[]): PredictionResult {
  // S'il n'y a pas encore d'historique, prédiction de base équilibrée
  if (history.length === 0) {
    return {
      vipNumber: 26,
      coverageNumbers: [0, 32, 15, 3],
      suggestedSector: 'voisins',
      suggestedColor: 'black',
      suggestedParity: 'even',
      suggestedRange: 'high',
      suggestedDozen: 3,
      suggestedColumn: 2,
      confidence: 78.5,
      rationale: "Initialisation du modèle : secteur Voisins du Zéro ciblé pour débuter la session.",
      cycleScore: 78
    };
  }

  const stats = calculateRouletteStats(history);
  const total = history.length;
  const lastSpin = history[history.length - 1];
  const lastNum = lastSpin.number;
  const lastInfo = ROULETTE_NUMBERS[lastNum];

  // Scores attribués à chaque numéro (0-36)
  const scores: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) {
    scores[i] = 10; // score de base
  }

  // 1. Facteur Écart (Tension de sortie des numéros en retard)
  for (let i = 0; i <= 36; i++) {
    const gap = stats.gaps[i] || 0;
    // Plus un numéro a un écart élevé par rapport au cycle moyen (37 tours), plus sa tension augmente
    if (gap > 20) scores[i] += Math.min(25, (gap - 20) * 1.5);
  }

  // 2. Facteur Fréquence Récente & Momentum (Hot numbers)
  // Les numéros sortis 2 fois ou plus dans les 15 derniers tirages gardent de l'inertie
  const recentHistory = history.slice(-15);
  recentHistory.forEach(spin => {
    scores[spin.number] += 3;
  });

  // 3. Voisinage du cylindre (Inertie physique de la bille)
  // Les numéros adjacents sur la roue au dernier numéro ont une probabilité de répétition de zone
  const lastWheelIdx = FRENCH_WHEEL_ORDER.indexOf(lastNum);
  if (lastWheelIdx !== -1) {
    const neighborsCount = 4;
    for (let offset = -neighborsCount; offset <= neighborsCount; offset++) {
      if (offset === 0) continue;
      const idx = (lastWheelIdx + offset + FRENCH_WHEEL_ORDER.length) % FRENCH_WHEEL_ORDER.length;
      const neighborNum = FRENCH_WHEEL_ORDER[idx];
      scores[neighborNum] += (neighborsCount + 1 - Math.abs(offset)) * 2;
    }
  }

  // 4. Correction des séries sur les chances simples (Régression à la moyenne)
  const redRatio = stats.colorPercentages.red;
  const blackRatio = stats.colorPercentages.black;
  let targetColor: RouletteColor = 'red';
  if (stats.activeStreak.type === 'color') {
    // Si série de 3+ de la même couleur, favoriser la couleur opposée
    targetColor = stats.activeStreak.value === 'Rouge' ? 'black' : 'red';
  } else {
    // Favoriser la couleur en retard statistique
    targetColor = redRatio < blackRatio ? 'red' : 'black';
  }

  for (let i = 0; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].color === targetColor) {
      scores[i] += 8;
    }
  }

  // 5. Parité & Manque/Passe
  const targetParity: Parity = stats.parityPercentages.even < stats.parityPercentages.odd ? 'even' : 'odd';
  const targetRange: RangeType = stats.rangePercentages.low < stats.rangePercentages.high ? 'low' : 'high';

  for (let i = 1; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].parity === targetParity) scores[i] += 4;
    if (ROULETTE_NUMBERS[i].range === targetRange) scores[i] += 4;
  }

  // 6. Analyse des Douzaines et Colonnes
  const dozen1 = stats.dozenCounts[1];
  const dozen2 = stats.dozenCounts[2];
  const dozen3 = stats.dozenCounts[3];
  let targetDozen: 1 | 2 | 3 = 1;
  if (dozen1 <= dozen2 && dozen1 <= dozen3) targetDozen = 1;
  else if (dozen2 <= dozen1 && dozen2 <= dozen3) targetDozen = 2;
  else targetDozen = 3;

  const col1 = stats.columnCounts[1];
  const col2 = stats.columnCounts[2];
  const col3 = stats.columnCounts[3];
  let targetColumn: 1 | 2 | 3 = 1;
  if (col1 <= col2 && col1 <= col3) targetColumn = 1;
  else if (col2 <= col1 && col2 <= col3) targetColumn = 2;
  else targetColumn = 3;

  for (let i = 1; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].dozen === targetDozen) scores[i] += 5;
    if (ROULETTE_NUMBERS[i].column === targetColumn) scores[i] += 5;
  }

  // 7. Analyse des Secteurs
  const voisinsPct = stats.sectorPercentages.voisins;
  const tiersPct = stats.sectorPercentages.tiers;
  const orphelinsPct = stats.sectorPercentages.orphelins;

  // Attendu : Voisins 45.9%, Tiers 32.4%, Orphelins 21.6%
  const voisinsGap = 45.9 - voisinsPct;
  const tiersGap = 32.4 - tiersPct;
  const orphelinsGap = 21.6 - orphelinsPct;

  let suggestedSector: SectorType = 'voisins';
  if (tiersGap > voisinsGap && tiersGap > orphelinsGap) {
    suggestedSector = 'tiers';
  } else if (orphelinsGap > voisinsGap && orphelinsGap > tiersGap) {
    suggestedSector = 'orphelins';
  } else {
    suggestedSector = 'voisins';
  }

  // Bonus au secteur sélectionné
  for (let i = 0; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].sector === suggestedSector) {
      scores[i] += 10;
    }
  }

  // Classement final des numéros
  const sortedNumbers = Object.keys(scores)
    .map(Number)
    .sort((a, b) => scores[b] - scores[a]);

  const vipNumber = sortedNumbers[0];
  const coverageNumbers = sortedNumbers.slice(1, 5);

  // Calcul du taux de confiance dynamique (entre 74% et 94.5%)
  const streakBonus = stats.activeStreak.count >= 3 ? Math.min(8, stats.activeStreak.count * 1.5) : 0;
  const sessionLengthBonus = Math.min(6, total * 0.4);
  const baseConfidence = 74.0;
  const confidence = Math.min(94.8, +(baseConfidence + streakBonus + sessionLengthBonus + (scores[vipNumber] % 5)).toFixed(1));

  // Rédiger l'explication mathématique
  const vipInfo = ROULETTE_NUMBERS[vipNumber];
  const gapVip = stats.gaps[vipNumber];
  let rationale = '';

  if (stats.activeStreak.count >= 2) {
    rationale = `Alerte série : ${stats.activeStreak.count} ${stats.activeStreak.value} consécutifs. Forte probabilité de rupture en faveur du ${targetColor.toUpperCase()} (${SECTOR_NAMES[suggestedSector]}).`;
  } else if (gapVip > 15) {
    rationale = `Écart notable sur le n°${vipNumber} (${gapVip} tours d'absence) combiné à un retour statistique sur ${SECTOR_NAMES[suggestedSector]}.`;
  } else {
    rationale = `Convergence du secteur ${SECTOR_NAMES[suggestedSector]} avec retard de la ${targetDozen}e Douzaine et de la Colonne ${targetColumn}.`;
  }

  return {
    vipNumber,
    coverageNumbers,
    suggestedSector,
    suggestedColor: targetColor,
    suggestedParity: targetParity,
    suggestedRange: targetRange,
    suggestedDozen: targetDozen,
    suggestedColumn: targetColumn,
    confidence,
    rationale,
    cycleScore: Math.round(confidence)
  };
}
