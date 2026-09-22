'use client';

import React, { useState } from 'react';
import { ROULETTE_NUMBERS, RED_NUMBERS, RouletteColor } from '@/lib/roulette-data';
import { RouletteStats, PredictionResult } from '@/lib/roulette-analyzer';
import { Flame, Clock, Eye, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface FrenchRouletteTableProps {
  onSelectNumber: (num: number) => void;
  lastSpunNumber?: number;
  stats: RouletteStats;
  prediction?: PredictionResult;
}

export function FrenchRouletteTable({
  onSelectNumber,
  lastSpunNumber,
  stats,
  prediction
}: FrenchRouletteTableProps) {
  // Mode d'affichage sur les cases : 'standard' | 'frequency' | 'gap'
  const [overlayMode, setOverlayMode] = useState<'standard' | 'frequency' | 'gap'>('standard');

  // Rows of French roulette grid:
  // Row 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
  // Row 2: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
  // Row 1: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
  const row3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const row1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

  const handleNumberClick = (n: number) => {
    soundFx.playChipClick();
    onSelectNumber(n);
  };

  const renderCellContent = (num: number) => {
    if (overlayMode === 'frequency') {
      const count = stats.frequencies[num] || 0;
      return (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-sm font-bold">{num}</span>
          <span className="text-[10px] text-amber-300 font-extrabold">{count}×</span>
        </div>
      );
    }
    if (overlayMode === 'gap') {
      const gap = stats.gaps[num] !== undefined ? stats.gaps[num] : stats.totalSpins;
      return (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-sm font-bold">{num}</span>
          <span className={`text-[10px] font-extrabold ${gap > 15 ? 'text-amber-400' : 'text-emerald-200'}`}>
            É:{gap}
          </span>
        </div>
      );
    }
    return <span className="text-base sm:text-lg font-black tracking-tight">{num}</span>;
  };

  const getCellClasses = (num: number) => {
    const isRed = RED_NUMBERS.has(num);
    const isLast = lastSpunNumber === num;
    const isVip = prediction?.vipNumber === num;
    const isCover = prediction?.coverageNumbers.includes(num);

    let bgClass = isRed
      ? 'bg-rose-700 hover:bg-rose-600 text-white'
      : 'bg-neutral-900 hover:bg-neutral-800 text-white';

    let borderClass = 'border border-amber-300/30';
    let ringClass = '';

    if (isLast) {
      ringClass = 'ring-4 ring-amber-400 ring-offset-2 ring-offset-emerald-950 z-20 shadow-lg';
    } else if (isVip) {
      ringClass = 'ring-2 ring-amber-400 shadow-md shadow-amber-400/30 z-10';
    } else if (isCover) {
      ringClass = 'ring-1 ring-emerald-300 z-10';
    }

    return `${bgClass} ${borderClass} ${ringClass} relative transition-all duration-150 transform active:scale-90 flex items-center justify-center font-sans font-bold cursor-pointer select-none rounded-sm min-h-[44px] sm:min-h-[48px]`;
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b3824] via-[#092e1e] to-[#072418] border-2 border-amber-500/40 p-3 sm:p-5 shadow-2xl text-white">
      {/* Table Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-800/60">
        <div>
          <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-amber-300 flex items-center gap-2">
            <span>Tapis de Roulette Française</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
              Cliquez pour saisir le résultat
            </span>
          </h2>
          <p className="text-xs text-emerald-200/70">
            Disposition officielle avec colonnes, douzaines et chances simples
          </p>
        </div>

        {/* Overlay mode toggle */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-emerald-800/50 text-xs">
          <button
            onClick={() => setOverlayMode('standard')}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              overlayMode === 'standard'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" /> Numéros
          </button>
          <button
            onClick={() => setOverlayMode('frequency')}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              overlayMode === 'frequency'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" /> Fréquences
          </button>
          <button
            onClick={() => setOverlayMode('gap')}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              overlayMode === 'gap'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3 text-cyan-300" /> Écarts
          </button>
        </div>
      </div>

      {/* Main Table Grid Layout (Scrollable on small screens) */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[640px] max-w-[960px] mx-auto bg-[#072417] p-2.5 rounded-xl border border-amber-500/20 shadow-inner">
          <div className="grid grid-cols-14 gap-1">
            {/* Zero (Zéro Vert) on the left, spanning 3 rows */}
            <div
              onClick={() => handleNumberClick(0)}
              className={`col-span-1 row-span-3 bg-emerald-700 hover:bg-emerald-600 border border-amber-300/40 rounded-sm flex flex-col items-center justify-center cursor-pointer transition active:scale-95 select-none relative ${
                lastSpunNumber === 0 ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-emerald-950 z-20' : ''
              } ${prediction?.vipNumber === 0 ? 'ring-2 ring-amber-400 z-10' : ''}`}
            >
              <div className="rotate-0 flex flex-col items-center">
                <span className="text-2xl font-black text-white">0</span>
                <span className="text-[10px] uppercase font-bold text-amber-200">Zéro</span>
              </div>
              {prediction?.vipNumber === 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>

            {/* Row 3 (Col 3 numbers): 3, 6, 9... 36 */}
            <div className="col-span-12 grid grid-cols-12 gap-1">
              {row3.map((num) => (
                <div key={num} onClick={() => handleNumberClick(num)} className={getCellClasses(num)}>
                  {renderCellContent(num)}
                  {prediction?.vipNumber === num && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Col 3 Label (2:1) */}
            <div className="col-span-1 flex items-center justify-center bg-emerald-950/80 border border-amber-400/30 text-amber-300 font-bold text-xs rounded-sm">
              2:1
            </div>

            {/* Row 2 (Col 2 numbers): 2, 5, 8... 35 */}
            <div className="col-span-12 grid grid-cols-12 gap-1">
              {row2.map((num) => (
                <div key={num} onClick={() => handleNumberClick(num)} className={getCellClasses(num)}>
                  {renderCellContent(num)}
                  {prediction?.vipNumber === num && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Col 2 Label (2:1) */}
            <div className="col-span-1 flex items-center justify-center bg-emerald-950/80 border border-amber-400/30 text-amber-300 font-bold text-xs rounded-sm">
              2:1
            </div>

            {/* Row 1 (Col 1 numbers): 1, 4, 7... 34 */}
            <div className="col-span-12 grid grid-cols-12 gap-1">
              {row1.map((num) => (
                <div key={num} onClick={() => handleNumberClick(num)} className={getCellClasses(num)}>
                  {renderCellContent(num)}
                  {prediction?.vipNumber === num && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Col 1 Label (2:1) */}
            <div className="col-span-1 flex items-center justify-center bg-emerald-950/80 border border-amber-400/30 text-amber-300 font-bold text-xs rounded-sm">
              2:1
            </div>

            {/* Douzaines (12P / 12M / 12D) */}
            <div className="col-span-1"></div>
            <div className="col-span-12 grid grid-cols-3 gap-1 my-1">
              <div
                className={`py-2 text-center text-xs font-black uppercase tracking-wider rounded-sm border transition select-none ${
                  prediction?.suggestedDozen === 1
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-900/60 border-amber-400/30 text-amber-300'
                }`}
              >
                12 P (1ère Douzaine 1-12)
                {prediction?.suggestedDozen === 1 && (
                  <span className="text-[10px] block text-amber-400 font-bold">★ Cible prédiction</span>
                )}
              </div>
              <div
                className={`py-2 text-center text-xs font-black uppercase tracking-wider rounded-sm border transition select-none ${
                  prediction?.suggestedDozen === 2
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-900/60 border-amber-400/30 text-amber-300'
                }`}
              >
                12 M (2ème Douzaine 13-24)
                {prediction?.suggestedDozen === 2 && (
                  <span className="text-[10px] block text-amber-400 font-bold">★ Cible prédiction</span>
                )}
              </div>
              <div
                className={`py-2 text-center text-xs font-black uppercase tracking-wider rounded-sm border transition select-none ${
                  prediction?.suggestedDozen === 3
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-900/60 border-amber-400/30 text-amber-300'
                }`}
              >
                12 D (3ème Douzaine 25-36)
                {prediction?.suggestedDozen === 3 && (
                  <span className="text-[10px] block text-amber-400 font-bold">★ Cible prédiction</span>
                )}
              </div>
            </div>
            <div className="col-span-1"></div>

            {/* Chances Simples (Manque, Pair, Rouge, Noir, Impair, Passe) */}
            <div className="col-span-1"></div>
            <div className="col-span-12 grid grid-cols-6 gap-1">
              {/* Manque */}
              <div
                className={`py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-sm border select-none ${
                  prediction?.suggestedRange === 'low'
                    ? 'bg-emerald-700/60 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-950/70 border-emerald-700/40 text-emerald-200'
                }`}
              >
                MANQUE (1-18)
              </div>

              {/* Pair */}
              <div
                className={`py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-sm border select-none ${
                  prediction?.suggestedParity === 'even'
                    ? 'bg-emerald-700/60 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-950/70 border-emerald-700/40 text-emerald-200'
                }`}
              >
                PAIR
              </div>

              {/* Rouge */}
              <div
                className={`py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-sm border select-none flex items-center justify-center gap-1.5 ${
                  prediction?.suggestedColor === 'red'
                    ? 'bg-rose-700 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-rose-900/70 border-rose-700/50 text-rose-200'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow" />
                ROUGE
              </div>

              {/* Noir */}
              <div
                className={`py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-sm border select-none flex items-center justify-center gap-1.5 ${
                  prediction?.suggestedColor === 'black'
                    ? 'bg-neutral-900 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-neutral-950/90 border-neutral-700/50 text-neutral-300'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-neutral-800 border border-neutral-600 inline-block shadow" />
                NOIR
              </div>

              {/* Impair */}
              <div
                className={`py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-sm border select-none ${
                  prediction?.suggestedParity === 'odd'
                    ? 'bg-emerald-700/60 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-950/70 border-emerald-700/40 text-emerald-200'
                }`}
              >
                IMPAIR
              </div>

              {/* Passe */}
              <div
                className={`py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-sm border select-none ${
                  prediction?.suggestedRange === 'high'
                    ? 'bg-emerald-700/60 border-amber-400 text-amber-200 shadow'
                    : 'bg-emerald-950/70 border-emerald-700/40 text-emerald-200'
                }`}
              >
                PASSE (19-36)
              </div>
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>
      </div>

      {/* Legend under the table */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-emerald-300/80 gap-2 pt-2 border-t border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm border-2 border-amber-400 bg-amber-400/20" />
            <span>Dernier tirage entré</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm ring-2 ring-amber-400 bg-black" />
            <span>Numéro VIP Prédit</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm ring-1 ring-emerald-300 bg-black" />
            <span>Couverture</span>
          </div>
        </div>
        <div className="italic text-amber-300/80">
          Chaque numéro cliqué est instantanément comptabilisé
        </div>
      </div>
    </div>
  );
}
