'use client';

import React from 'react';
import { SpinRecord } from '@/lib/roulette-analyzer';
import { ROULETTE_NUMBERS } from '@/lib/roulette-data';
import { History, Award, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface HistoryStripProps {
  history: SpinRecord[];
  onSelectSpin?: (spin: SpinRecord) => void;
}

export function HistoryStrip({ history }: HistoryStripProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl bg-black/30 border border-emerald-900/60 p-3 text-center text-xs text-emerald-300/60">
        Aucun tirage saisi pour le moment. Entrez le premier résultat réel du jeu pour démarrer les prédictions automatisées.
      </div>
    );
  }

  // Inverse pour afficher les plus récents en premier (de gauche à droite)
  const recentSpins = [...history].reverse();

  return (
    <div className="rounded-2xl bg-[#061e14] border border-amber-500/25 p-3 shadow-lg">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/60 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider text-[11px]">
          <History className="w-3.5 h-3.5" />
          <span>Derniers Tirages ({history.length})</span>
        </div>
        <div className="text-[10px] text-emerald-300/70">
          Plus récent ➔
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {recentSpins.map((spin, idx) => {
          const info = ROULETTE_NUMBERS[spin.number];
          const isLatest = idx === 0;

          // Check if prediction hit
          let hitBadge: string | null = null;
          let hitColor = '';
          if (spin.predictionAtTime) {
            if (spin.number === spin.predictionAtTime.vipNumber) {
              hitBadge = '🎯 VIP';
              hitColor = 'bg-amber-400 text-black font-extrabold';
            } else if (spin.predictionAtTime.coverageNumbers.includes(spin.number)) {
              hitBadge = '★ Top5';
              hitColor = 'bg-emerald-400 text-black font-bold';
            } else if (info.color === spin.predictionAtTime.suggestedColor) {
              hitBadge = '✓ Coul';
              hitColor = 'bg-emerald-900 text-emerald-200 border border-emerald-600';
            }
          }

          return (
            <div
              key={spin.id}
              className={`shrink-0 flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${
                isLatest
                  ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/20'
                  : 'opacity-90'
              } ${
                info.color === 'red'
                  ? 'bg-rose-950/80 border-rose-700/60 text-white'
                  : info.color === 'black'
                  ? 'bg-neutral-900/90 border-neutral-700/70 text-white'
                  : 'bg-emerald-900/90 border-emerald-600 text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1 mb-0.5">
                <span className="text-[9px] text-emerald-300/80 font-mono">
                  #{history.length - idx}
                </span>
                {hitBadge && (
                  <span className={`text-[8px] px-1 py-0.2 rounded-full leading-none ${hitColor}`}>
                    {hitBadge}
                  </span>
                )}
              </div>

              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-inner">
                {spin.number}
              </div>

              <div className="text-[9px] uppercase font-bold text-center mt-0.5 opacity-90">
                {info.color === 'red' ? 'Rouge' : info.color === 'black' ? 'Noir' : 'Vert'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
