'use client';

import React from 'react';
import { PredictionResult, RouletteStats, StrategyMode } from '@/lib/roulette-analyzer';
import { ROULETTE_NUMBERS, SECTOR_NAMES } from '@/lib/roulette-data';
import {
  Sparkles,
  Target,
  Zap,
  Activity,
  CheckCircle2,
  ChevronRight,
  Layers,
  Compass,
  Shield,
  Percent,
  Coins,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PredictionHeroProps {
  prediction: PredictionResult;
  stats: RouletteStats;
  onOpenQuickInput: () => void;
  lastEnteredSpin?: number;
  strategyMode: StrategyMode;
  onChangeStrategyMode: (mode: StrategyMode) => void;
}

export function PredictionHero({
  prediction,
  stats,
  onOpenQuickInput,
  lastEnteredSpin,
  strategyMode,
  onChangeStrategyMode
}: PredictionHeroProps) {
  const vip = prediction.vipNumber;
  const vipInfo = ROULETTE_NUMBERS[vip];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#092e1e] via-[#062015] to-[#04160e] border border-amber-500/30 p-4 sm:p-6 shadow-2xl shadow-emerald-950/80">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Title + Strategy Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-emerald-800/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>PRÉDICTION ALGORITHMIQUE DU PROCHAIN TOUR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-emerald-300/70">
              Loi du tiers, dispersion angulaire & gestion des écarts
            </p>
          </div>
        </div>

        {/* Strategy Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-emerald-800/60 text-xs">
          <button
            onClick={() => onChangeStrategyMode('safe')}
            className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
              strategyMode === 'safe'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Haute Réussite (64.8%)</span>
          </button>

          <button
            onClick={() => onChangeStrategyMode('balanced')}
            className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
              strategyMode === 'balanced'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Secteur Cylindre</span>
          </button>

          <button
            onClick={() => onChangeStrategyMode('sniper')}
            className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
              strategyMode === 'sniper'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Sniper Plein (35:1)</span>
          </button>
        </div>
      </div>

      {/* Main Recommended Play Announcement Banner */}
      <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-[#0a2f1e] to-emerald-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-black font-black flex items-center justify-center text-xs shrink-0 shadow">
            PARI
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Coup Optimal Recommandé ({prediction.strategyMode.toUpperCase()})
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              {prediction.recommendedPlay}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-emerald-300 uppercase font-semibold">Couverture Réelle</div>
            <div className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1">
              <Percent className="w-3.5 h-3.5" />
              {prediction.realProbability.toFixed(1)}%
            </div>
          </div>

          <div className="text-right pl-3 border-l border-emerald-800">
            <div className="text-[10px] text-amber-300 uppercase font-semibold">Indice Modèle</div>
            <div className="text-sm font-black text-amber-300">
              {prediction.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Core Grid: Highlighted Number & Main Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: VIP Featured Number with golden radar styling */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-black/40 border border-amber-500/20 relative">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Numéro Plein Ciblé (VIP)
          </div>

          <div className="relative my-2 flex items-center justify-center">
            {/* Animated pulsating radar rings */}
            <div className="absolute inset-0 -m-3 rounded-full border border-amber-400/20 animate-ping opacity-40 pointer-events-none" />
            <div className="absolute inset-0 -m-1.5 rounded-full border border-amber-400/40 pointer-events-none" />

            {/* Big Main Ball */}
            <AnimatePresence mode="wait">
              <motion.div
                key={vip}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl border-4 ${
                  vipInfo.color === 'red'
                    ? 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 border-amber-400 text-white shadow-rose-900/50'
                    : vipInfo.color === 'black'
                    ? 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-amber-400 text-white shadow-black/80'
                    : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 border-amber-300 text-white shadow-emerald-900/60'
                }`}
              >
                <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                  {vip}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 mt-0.5">
                  {vipInfo.color === 'red' ? 'Rouge' : vipInfo.color === 'black' ? 'Noir' : 'Vert (0)'}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Quick detail badges under VIP */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {SECTOR_NAMES[vipInfo.sector]}
            </span>
            {vipInfo.parity && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-200 border border-emerald-700/50">
                {vipInfo.parity === 'even' ? 'Pair' : 'Impair'}
              </span>
            )}
            {vipInfo.range && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-200 border border-emerald-700/50">
                {vipInfo.range === 'low' ? 'Manque (1-18)' : 'Passe (19-36)'}
              </span>
            )}
          </div>
        </div>

        {/* Middle: Secondary coverage numbers + Secteurs & Chances Simples */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Secondary Cover Numbers (Top 6) */}
          <div>
            <div className="text-xs font-bold text-emerald-200 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Numéros de Couverture Clés (Top 6)
              </span>
              <span className="text-[11px] text-amber-400/80 font-normal">Sécurisation du coup</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {prediction.coverageNumbers.map((num) => {
                const info = ROULETTE_NUMBERS[num];
                return (
                  <div
                    key={num}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${
                      info.color === 'red'
                        ? 'bg-rose-950/60 border-rose-700/50 text-rose-200 hover:border-rose-400'
                        : info.color === 'black'
                        ? 'bg-neutral-900/80 border-neutral-700/60 text-neutral-200 hover:border-neutral-500'
                        : 'bg-emerald-950/80 border-emerald-600/50 text-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    <span className="text-lg font-black">{num}</span>
                    <span className="text-[9px] font-medium opacity-80 uppercase">
                      {info.color === 'red' ? 'R' : info.color === 'black' ? 'N' : 'V'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chances Simples & Sector Recommendations */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-0.5">Secteur Cible</span>
              <span className="font-bold text-amber-300 flex items-center gap-1 truncate">
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {SECTOR_NAMES[prediction.suggestedSector]}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-0.5">Couleur Recommandée</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${prediction.suggestedColor === 'red' ? 'bg-rose-600' : 'bg-neutral-900 border border-neutral-600'}`} />
                {prediction.suggestedColor === 'red' ? 'ROUGE' : 'NOIR'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-0.5">Parité</span>
              <span className="font-bold text-amber-200">
                {prediction.suggestedParity === 'even' ? 'PAIR' : 'IMPAIR'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-0.5">Manque / Passe</span>
              <span className="font-bold text-white">
                {prediction.suggestedRange === 'low' ? 'MANQUE (1-18)' : 'PASSE (19-36)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-0.5">Douzaines Clés</span>
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                {prediction.suggestedDozen}e & {prediction.secondaryDozen}e (65%)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-0.5">Colonnes</span>
              <span className="font-bold text-emerald-200">
                Col {prediction.suggestedColumn} & Col {prediction.secondaryColumn}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Rationale + Bankroll Advice + Action Button */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-3 h-full">
          {/* Statistical justification text */}
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-xs text-emerald-200 leading-relaxed">
            <div className="flex items-center gap-1 font-bold text-amber-400 text-[11px] mb-1">
              <Activity className="w-3 h-3" /> Analyse de Convergence :
            </div>
            <p className="text-emerald-100/90 text-[11px]">
              {prediction.rationale}
            </p>
          </div>

          {/* Bankroll / Bet sizing advice */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-tight flex items-start gap-2">
            <Coins className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Gestion de Mise : </span>
              {prediction.bankrollAdvice}
            </div>
          </div>

          {/* User's primary action: Saisir le résultat suivant */}
          <button
            onClick={onOpenQuickInput}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 border border-amber-300/60 flex items-center justify-center gap-2 transition transform active:scale-95 group"
          >
            <span>Ajouter le résultat suivant</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Discreet label required by the user */}
          <div className="text-center text-[10px] text-emerald-300/60 italic">
            « Analyse basée sur les résultats saisis • Jouez de manière responsable »
          </div>
        </div>
      </div>
    </div>
  );
}
