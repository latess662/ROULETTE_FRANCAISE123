'use client';

import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

export function ResponsibleNotice() {
  return (
    <footer className="mt-8 pt-4 pb-8 border-t border-emerald-900/60 text-center text-xs text-emerald-300/60 space-y-2">
      <div className="flex items-center justify-center gap-1.5 text-emerald-400/90 font-medium">
        <Shield className="w-3.5 h-3.5 text-amber-400" />
        <span>Indication : Analyse statistique et probabiliste basée sur les résultats saisis.</span>
      </div>
      <p className="max-w-2xl mx-auto text-[11px] text-emerald-300/50 leading-relaxed">
        À la Roulette Française, chaque tirage de bille est un événement aléatoire indépendant. Cet outil fournit une analyse avancée des fréquences, des séries et des écarts théoriques à titre informatif et d&apos;aide à la décision. Jouez avec modération.
      </p>
      <div className="text-[10px] text-emerald-400/40">
        Compatible Roulette Française bet261 • 37 numéros (0-36)
      </div>
    </footer>
  );
}
