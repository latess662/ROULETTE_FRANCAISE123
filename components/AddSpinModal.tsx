'use client';

import React, { useState } from 'react';
import { ROULETTE_NUMBERS, RED_NUMBERS } from '@/lib/roulette-data';
import { X, CornerDownLeft, Sparkles, PlusCircle } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface AddSpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNumber: (num: number) => void;
  currentSpinIndex: number;
}

export function AddSpinModal({
  isOpen,
  onClose,
  onAddNumber,
  currentSpinIndex
}: AddSpinModalProps) {
  const [typedValue, setTypedValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(typedValue.trim(), 10);
    if (isNaN(val) || val < 0 || val > 36) {
      setErrorMsg('Veuillez entrer un numéro valide entre 0 et 36');
      return;
    }
    soundFx.playChipClick();
    onAddNumber(val);
    setTypedValue('');
    setErrorMsg('');
    onClose();
  };

  const handleSelectNumber = (n: number) => {
    soundFx.playChipClick();
    onAddNumber(n);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#092e1e] via-[#062015] to-[#04160e] border-2 border-amber-500/50 p-5 shadow-2xl text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase text-amber-300 tracking-wide">
              Saisir le Résultat du Tour #{currentSpinIndex + 1}
            </h3>
            <p className="text-xs text-emerald-300/80">
              Cliquez directement sur le numéro sorti sur bet261
            </p>
          </div>
        </div>

        {/* Direct number input field */}
        <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
          <input
            type="number"
            autoFocus
            min="0"
            max="36"
            placeholder="Numéro (0-36)"
            value={typedValue}
            onChange={(e) => {
              setTypedValue(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="flex-1 bg-black/60 border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-2.5 text-white placeholder-emerald-400/50 text-base font-bold text-center outline-none"
          />
          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Confirmer</span>
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>

        {errorMsg && (
          <div className="mb-3 text-xs text-rose-400 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* 0 to 36 Grid */}
        <div className="pt-2 border-t border-emerald-800/50">
          <div className="text-[11px] font-bold text-emerald-300 uppercase mb-2">
            Ou cliquez sur le numéro :
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {/* 0 */}
            <button
              onClick={() => handleSelectNumber(0)}
              className="h-10 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-black text-base border border-emerald-400/50 shadow flex items-center justify-center transition active:scale-95"
            >
              0
            </button>

            {/* 1-36 */}
            {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => {
              const isRed = RED_NUMBERS.has(n);
              return (
                <button
                  key={n}
                  onClick={() => handleSelectNumber(n)}
                  className={`h-10 rounded-lg text-white font-black text-base border shadow flex items-center justify-center transition active:scale-95 ${
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

        <div className="mt-4 pt-3 border-t border-emerald-900/60 text-center text-[10px] text-emerald-300/60 italic">
          « Analyse basée sur les résultats saisis »
        </div>
      </div>
    </div>
  );
}
