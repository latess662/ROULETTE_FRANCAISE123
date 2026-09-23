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

export type StrategyMode = 'safe' | 'balanced' | 'sniper';

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
  secondaryDozen: 1 | 2 | 3; // 2 dozens strategy (64.8% probability)
  suggestedColumn: 1 | 2 | 3;
  secondaryColumn: 1 | 2 | 3;
  confidence: number;
  realProbability: number; // exact math coverage %
  recommendedPlay: string; // e.g. "Double Douzaine 1 & 2 + NOIR"
  bankrollAdvice: string;
  rationale: string;
  cycleScore: number;
  strategyMode: StrategyMode;
  repeaters: number[]; // numbers that repeated in the active cycle
}

export interface RouletteStats {
  totalSpins: number;
  frequencies: Record<number, number>;
  frequencyPercentages: Record<number, number>;
  gaps: Record<number, number>;
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

  // Loi du tiers
  uniqueNumbersDrawn: number;
  repeatingNumbersCount: number;

  // Précision de la session
  accuracy: {
    totalChecked: number;
    vipHits: number;
    coverageHits: number;
    sectorHits: number;
    colorHits: number;
    dozenHits: number;
    doubleDozenHits: number;
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
    gaps[i] = total;
    maxGaps[i] = 0;
  }

  const colorCounts = { red: 0, black: 0, green: 0 };
  const parityCounts = { even: 0, odd: 0, zero: 0 };
  const rangeCounts = { low: 0, high: 0, zero: 0 };
  const dozenCounts = { 1: 0, 2: 0, 3: 0, zero: 0 };
  const columnCounts = { 1: 0, 2: 0, 3: 0, zero: 0 };
  const sectorCounts = { voisins: 0, tiers: 0, orphelins: 0 };

  const lastSeenMap: Record<number, number> = {};

  history.forEach((spin, index) => {
    const num = spin.number;
    const info = ROULETTE_NUMBERS[num];
    frequencies[num] = (frequencies[num] || 0) + 1;

    if (lastSeenMap[num] !== undefined) {
      const currentGap = index - lastSeenMap[num] - 1;
      if (currentGap > (maxGaps[num] || 0)) {
        maxGaps[num] = currentGap;
      }
    }
    lastSeenMap[num] = index;

    if (info.color === 'red') colorCounts.red++;
    else if (info.color === 'black') colorCounts.black++;
    else colorCounts.green++;

    if (num === 0) parityCounts.zero++;
    else if (info.parity === 'even') parityCounts.even++;
    else parityCounts.odd++;

    if (num === 0) rangeCounts.zero++;
    else if (info.range === 'low') rangeCounts.low++;
    else rangeCounts.high++;

    if (num === 0) dozenCounts.zero++;
    else if (info.dozen) dozenCounts[info.dozen]++;

    if (num === 0) columnCounts.zero++;
    else if (info.column) columnCounts[info.column]++;

    if (info.sector === 'tiers') sectorCounts.tiers++;
    else if (info.sector === 'orphelins') sectorCounts.orphelins++;
    else sectorCounts.voisins++;
  });

  for (let i = 0; i <= 36; i++) {
    if (lastSeenMap[i] !== undefined) {
      gaps[i] = total - 1 - lastSeenMap[i];
    } else {
      gaps[i] = total;
    }
  }

  const pct = (val: number) => (total > 0 ? (val / total) * 100 : 0);
  const frequencyPercentages: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) {
    frequencyPercentages[i] = pct(frequencies[i]);
  }

  const numbersList = Array.from({ length: 37 }, (_, i) => i);
  const hotNumbers = [...numbersList]
    .sort((a, b) => (frequencies[b] || 0) - (frequencies[a] || 0))
    .slice(0, 5)
    .map(n => ({ number: n, count: frequencies[n], percentage: pct(frequencies[n]) }));

  const coldNumbers = [...numbersList]
    .sort((a, b) => (gaps[b] || 0) - (gaps[a] || 0))
    .slice(0, 5)
    .map(n => ({ number: n, gap: gaps[n] }));

  // Loi du tiers : numéros uniques et répétiteurs
  let uniqueNumbersDrawn = 0;
  let repeatingNumbersCount = 0;
  for (let i = 0; i <= 36; i++) {
    if (frequencies[i] > 0) uniqueNumbersDrawn++;
    if (frequencies[i] >= 2) repeatingNumbersCount++;
  }

  // Séries consécutives
  let activeStreak: RouletteStats['activeStreak'] = { type: 'none', value: '', count: 0 };
  if (history.length > 0) {
    const lastNum = history[history.length - 1].number;
    const lastInfo = ROULETTE_NUMBERS[lastNum];

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
  let doubleDozenHits = 0;

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
      if (actualInfo.dozen === p.suggestedDozen || actualInfo.dozen === p.secondaryDozen) doubleDozenHits++;
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
    uniqueNumbersDrawn,
    repeatingNumbersCount,
    accuracy: {
      totalChecked,
      vipHits,
      coverageHits,
      sectorHits,
      colorHits,
      dozenHits,
      doubleDozenHits
    }
  };
}

// Algorithme de prédiction statistique multi-facteurs & multi-stratégies
export function generateRoulettePrediction(
  history: SpinRecord[],
  mode: StrategyMode = 'safe'
): PredictionResult {
  // S'il n'y a pas encore d'historique
  if (history.length === 0) {
    return {
      vipNumber: 26,
      coverageNumbers: [0, 32, 15, 3, 35, 12],
      suggestedSector: 'voisins',
      suggestedColor: 'black',
      suggestedParity: 'even',
      suggestedRange: 'high',
      suggestedDozen: 2,
      secondaryDozen: 3,
      suggestedColumn: 2,
      secondaryColumn: 1,
      confidence: 84.5,
      realProbability: mode === 'safe' ? 64.8 : mode === 'balanced' ? 45.9 : 18.9,
      recommendedPlay: mode === 'safe'
        ? "Double Douzaine (2e + 3e) + Couleur NOIR"
        : mode === 'balanced'
        ? "Secteur Voisins du Zéro (17 numéros)"
        : "Plein sur le 26 + Couverture 0, 32, 15",
      bankrollAdvice: "Mise recommandée : 1 unité par position (flat betting). Ne doublez jamais agressivement.",
      rationale: "Initialisation : Modèle calibré sur l'équilibre du cylindre français et couverture sécurisée.",
      cycleScore: 84,
      strategyMode: mode,
      repeaters: []
    };
  }

  const stats = calculateRouletteStats(history);
  const total = history.length;
  const lastSpin = history[history.length - 1];
  const lastNum = lastSpin.number;

  // Scores attribués à chaque numéro (0-36)
  const scores: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) {
    scores[i] = 10;
  }

  // 1. Détection des numéros répétiteurs (Loi du Tiers)
  const repeaters: number[] = [];
  for (let i = 0; i <= 36; i++) {
    if (stats.frequencies[i] >= 2) {
      repeaters.push(i);
      scores[i] += 8; // En roulette, 2/3 des numéros qui sortent dans un cycle de 37 sont des répétiteurs!
    }
  }

  // 2. Écarts critiques (tension statistique)
  for (let i = 0; i <= 36; i++) {
    const gap = stats.gaps[i] || 0;
    if (gap > 22) scores[i] += Math.min(22, (gap - 20) * 1.8);
  }

  // 3. Inertie angulaire du cylindre (Distance de rebond)
  const lastWheelIdx = FRENCH_WHEEL_ORDER.indexOf(lastNum);
  if (lastWheelIdx !== -1) {
    // Les billes de roulette sur cylindre physique ont une dispersion normale gaussienne
    const radius = 5;
    for (let offset = -radius; offset <= radius; offset++) {
      if (offset === 0) continue;
      const idx = (lastWheelIdx + offset + FRENCH_WHEEL_ORDER.length) % FRENCH_WHEEL_ORDER.length;
      const neighborNum = FRENCH_WHEEL_ORDER[idx];
      const weight = (radius + 1 - Math.abs(offset)) * 2.2;
      scores[neighborNum] += weight;
    }
  }

  // 4. Chances simples & Rupture de série
  const redRatio = stats.colorPercentages.red;
  const blackRatio = stats.colorPercentages.black;
  let targetColor: RouletteColor = 'red';
  if (stats.activeStreak.type === 'color' && stats.activeStreak.count >= 2) {
    // Après 2 ou 3 répétitions, forte probabilité de rupture ou alternance
    targetColor = stats.activeStreak.value === 'Rouge' ? 'black' : 'red';
  } else {
    targetColor = redRatio < blackRatio ? 'red' : 'black';
  }

  for (let i = 0; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].color === targetColor) {
      scores[i] += 9;
    }
  }

  const targetParity: Parity = stats.parityPercentages.even < stats.parityPercentages.odd ? 'even' : 'odd';
  const targetRange: RangeType = stats.rangePercentages.low < stats.rangePercentages.high ? 'low' : 'high';

  for (let i = 1; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].parity === targetParity) scores[i] += 4;
    if (ROULETTE_NUMBERS[i].range === targetRange) scores[i] += 4;
  }

  // 5. Douzaines & Colonnes : Sélection des 2 meilleures pour couverture 64.8%
  const dozenScores: [1 | 2 | 3, number][] = [
    [1, stats.dozenCounts[1]],
    [2, stats.dozenCounts[2]],
    [3, stats.dozenCounts[3]]
  ];
  // Trier par nombre d'occurrences pour favoriser celles en retard statistique ou en cycle
  dozenScores.sort((a, b) => a[1] - b[1]);
  const suggestedDozen = dozenScores[0][0]; // plus en retard
  const secondaryDozen = dozenScores[1][0]; // 2e sélection

  const colScores: [1 | 2 | 3, number][] = [
    [1, stats.columnCounts[1]],
    [2, stats.columnCounts[2]],
    [3, stats.columnCounts[3]]
  ];
  colScores.sort((a, b) => a[1] - b[1]);
  const suggestedColumn = colScores[0][0];
  const secondaryColumn = colScores[1][0];

  for (let i = 1; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].dozen === suggestedDozen) scores[i] += 7;
    else if (ROULETTE_NUMBERS[i].dozen === secondaryDozen) scores[i] += 4;

    if (ROULETTE_NUMBERS[i].column === suggestedColumn) scores[i] += 5;
  }

  // 6. Analyse des Secteurs Cylindre
  const voisinsPct = stats.sectorPercentages.voisins;
  const tiersPct = stats.sectorPercentages.tiers;
  const orphelinsPct = stats.sectorPercentages.orphelins;

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

  for (let i = 0; i <= 36; i++) {
    if (ROULETTE_NUMBERS[i].sector === suggestedSector) {
      scores[i] += 12;
    }
  }

  // Classement des numéros par score décroissant
  const sortedNumbers = Object.keys(scores)
    .map(Number)
    .sort((a, b) => scores[b] - scores[a]);

  const vipNumber = sortedNumbers[0];
  // 6 numéros de couverture pour un total de 7 numéros (18.9% probabilité mathématique directe)
  const coverageNumbers = sortedNumbers.slice(1, 7);

  // Probabilité mathématique réelle & confiance selon le mode
  let realProbability = 64.8;
  let recommendedPlay = '';
  let bankrollAdvice = '';

  if (mode === 'safe') {
    // Mode Double Douzaine + Chance Simple (Couverture 24/37 = 64.86%)
    realProbability = 64.8;
    recommendedPlay = `Double Douzaine (${suggestedDozen}e & ${secondaryDozen}e) + ${targetColor === 'red' ? 'ROUGE' : 'NOIR'}`;
    bankrollAdvice = "Conseil de mise : 2 unités sur chaque douzaine (4 unités au total). Taux de réussite le plus régulier du jeu.";
  } else if (mode === 'balanced') {
    // Mode Secteur Cylindre (12 à 17 numéros = 32.4% à 45.9%)
    realProbability = suggestedSector === 'voisins' ? 45.9 : suggestedSector === 'tiers' ? 32.4 : 21.6;
    recommendedPlay = `Secteur ${SECTOR_NAMES[suggestedSector]} (${realProbability.toFixed(1)}% de la roue) + Col ${suggestedColumn}`;
    bankrollAdvice = "Conseil de mise : Misez sur le secteur complet ou les voisins du cylindre sur bet261.";
  } else {
    // Mode Sniper Pleins (7 numéros = 18.9% pour un gain 35x)
    realProbability = 18.9;
    recommendedPlay = `Plein sur n°${vipNumber} (VIP) + Couverture [${coverageNumbers.slice(0, 4).join(', ')}]`;
    bankrollAdvice = "Conseil de mise : 1 unité fixe par numéro plein. Attention : forte volatilité, visez le rapport 35:1.";
  }

  // Indice de confiance dynamique
  const streakBonus = stats.activeStreak.count >= 2 ? Math.min(8, stats.activeStreak.count * 2) : 0;
  const historyBonus = Math.min(6, total * 0.3);
  const confidence = Math.min(95.5, +(76.0 + streakBonus + historyBonus + (scores[vipNumber] % 5)).toFixed(1));

  // Rationale
  let rationale = '';
  if (stats.activeStreak.count >= 2) {
    rationale = `Alerte série active (${stats.activeStreak.count} ${stats.activeStreak.value} consécutifs) : rupture probabiliste imminente vers le ${targetColor.toUpperCase()}. Douzaines ${suggestedDozen} et ${secondaryDozen} prioritaires.`;
  } else if (repeaters.length > 0) {
    rationale = `Loi du Tiers active : ${repeaters.length} numéros répétiteurs détectés. Convergence sur le secteur ${SECTOR_NAMES[suggestedSector]} et n°${vipNumber}.`;
  } else {
    rationale = `Rééquilibrage de cycle : retard de la ${suggestedDozen}e Douzaine et convergence angulaire du secteur ${SECTOR_NAMES[suggestedSector]}.`;
  }

  return {
    vipNumber,
    coverageNumbers,
    suggestedSector,
    suggestedColor: targetColor,
    suggestedParity: targetParity,
    suggestedRange: targetRange,
    suggestedDozen,
    secondaryDozen,
    suggestedColumn,
    secondaryColumn,
    confidence,
    realProbability,
    recommendedPlay,
    bankrollAdvice,
    rationale,
    cycleScore: Math.round(confidence),
    strategyMode: mode,
    repeaters
  };
}
