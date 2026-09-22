'use client';

import React from 'react';
import { Volume2, VolumeX, RotateCcw, Undo2, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface HeaderProps {
  totalSpins: number;
  accuracyRate: number;
  onReset: () => void;
  onUndo: () => void;
  onAddRandomDemo: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function Header({
  totalSpins,
  accuracyRate,
  onReset,
  onUndo,
  onAddRandomDemo,
  isMuted,
  onToggleMute
}: HeaderProps) {
  return (
    <header className="border-b border-emerald-900/60 bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 px-4 py-3 sticky top-0 z-30 shadow-lg shadow-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md shadow-amber-500/20 border border-amber-300/40 text-black font-extrabold text-xl">
            <span className="tracking-tighter">RF</span>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a2318] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Roulette Française <span className="text-amber-400 font-extrabold text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">PRO PREDICTOR</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300/80">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-emerald-400 font-medium">Flux bet261 synchronisé</span>
              </span>
              <span>•</span>
              <span>Session active ({totalSpins} {totalSpins > 1 ? 'tours' : 'tour'})</span>
            </div>
          </div>
        </div>

        {/* Accuracy badge if spins exist */}
        {totalSpins > 0 && (
          <div className="hidden md:flex items-center gap-3 bg-emerald-900/40 border border-emerald-700/50 rounded-lg px-3 py-1.5 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-emerald-400 font-semibold">Taux de validation : </span>
              <span className="font-bold text-amber-300">{accuracyRate}%</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Demo simulation button */}
          <button
            onClick={() => {
              soundFx.playChipClick();
              onAddRandomDemo();
            }}
            title="Simuler un tirage aléatoire réaliste"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/70 border border-emerald-600/40 text-emerald-200 hover:text-white transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Tirage Démo</span>
          </button>

          {/* Undo button */}
          <button
            onClick={() => {
              soundFx.playChipClick();
              onUndo();
            }}
            disabled={totalSpins === 0}
            title="Annuler le dernier coup"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/40 text-emerald-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium flex items-center gap-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Annuler</span>
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser tous les résultats de la session ?')) {
                soundFx.playChipClick();
                onReset();
              }
            }}
            disabled={totalSpins === 0}
            title="Nouvelle session"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/30 text-red-300 hover:text-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-1.5 sm:p-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-700/40 text-emerald-300 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
