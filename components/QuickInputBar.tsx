'use client';

import React, { useState } from 'react';
import { ROULETTE_NUMBERS, RED_NUMBERS } from '@/lib/roulette-data';
import { PlusCircle, Hash, Check, CornerDownLeft, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface QuickInputBarProps {
  onAddNumber: (num: number) => void;
  lastEnteredSpin?: number;
}

export function QuickInputBar({ onAddNumber, lastEnteredSpin }: QuickInputBarProps) {
  const [typedValue, setTypedValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(typedValue.trim(), 10);
    if (isNaN(val) || val < 0 || val > 36) {
      setErrorMsg('Veuillez entrer un numéro valide entre 0 et 36');
      return;
    }
    setErrorMsg('');
    soundFx.playChipClick();
    onAddNumber(val);
    setTypedValue('');
  };

  const handleChipClick = (n: number) => {
    soundFx.playChipClick();
    onAddNumber(n);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#072418] via-[#093322] to-[#072418] border border-amber-500/30 p-3 sm:p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Input title & fast form */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <span>Saisie du Résultat Réel</span>
              <span className="text-[10px] font-normal text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                bet261
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              Entrez le numéro sorti pour actualiser les prédictions
            </p>
          </div>
        </div>

        {/* Middle/Right: Numeric input + Quick Keypad toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-32">
              <input
                type="number"
                min="0"
                max="36"
                placeholder="N° (0-36)"
                value={typedValue}
                onChange={(e) => {
                  setTypedValue(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full bg-black/60 border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 py-2 text-white placeholder-emerald-400/50 text-sm font-bold text-center outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1 shrink-0"
            >
              <span>Valider</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle Full Grid button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 text-emerald-200 hover:text-white transition shrink-0"
          >
            {isExpanded ? 'Masquer Clavier' : 'Clavier Rapide'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-2 text-xs text-rose-400 font-medium text-center">
          {errorMsg}
        </div>
      )}

      {/* Quick Numbers Keypad (Collapsible or visible) */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-emerald-800/50">
          <div className="text-[11px] font-bold text-emerald-300 uppercase mb-2 flex items-center justify-between">
            <span>Sélection directe en un clic :</span>
            <span className="text-[10px] text-amber-300/80 italic">Cliquez sur un numéro</span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5">
            {/* Zero */}
            <button
              type="button"
              onClick={() => handleChipClick(0)}
              className="h-9 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm border border-emerald-400/50 transition active:scale-95 flex items-center justify-center shadow"
            >
              0
            </button>

            {/* 1 to 36 */}
            {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => {
              const isRed = RED_NUMBERS.has(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleChipClick(n)}
                  className={`h-9 rounded-lg text-white font-black text-sm border transition active:scale-95 flex items-center justify-center shadow ${
                    isRed
                      ? 'bg-rose-700 hover:bg-rose-600 border-rose-500/40'
                      : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700/60'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
