'use client';

import React, { useState } from 'react';
import { RouletteStats } from '@/lib/roulette-analyzer';
import { ROULETTE_NUMBERS, RED_NUMBERS, SECTOR_NAMES } from '@/lib/roulette-data';
import { Flame, Snowflake, BarChart3, PieChart, ShieldCheck, TrendingUp, Layers, Compass } from 'lucide-react';

interface StatsPanelProps {
  stats: RouletteStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const [activeTab, setActiveTab] = useState<'ecarts' | 'chances' | 'secteurs' | 'precision'>('ecarts');

  const { totalSpins } = stats;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#08291a] via-[#051c12] to-[#04140d] border border-amber-500/30 p-4 sm:p-5 shadow-2xl text-white">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-emerald-800/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
            Analyses & Statistiques Avancées
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-emerald-800/40 text-xs">
          <button
            onClick={() => setActiveTab('ecarts')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === 'ecarts'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Écarts & Fréquences</span>
          </button>

          <button
            onClick={() => setActiveTab('chances')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === 'chances'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Chances Simples & Séries</span>
          </button>

          <button
            onClick={() => setActiveTab('secteurs')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === 'secteurs'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-300" />
            <span>Secteurs Cylindre</span>
          </button>

          <button
            onClick={() => setActiveTab('precision')}
            className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
              activeTab === 'precision'
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Précision Session</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Écarts & Fréquences */}
      {activeTab === 'ecarts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hot Numbers (Numéros Chauds) */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-rose-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Top 5 Numéros Chauds (Fréquences)
                </span>
                <span className="text-[10px] text-rose-300/80">Sorties récentes</span>
              </div>

              <div className="space-y-2">
                {stats.hotNumbers.map((item) => {
                  const info = ROULETTE_NUMBERS[item.number];
                  return (
                    <div key={item.number} className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs border ${
                          info.color === 'red'
                            ? 'bg-rose-700 border-rose-500 text-white'
                            : info.color === 'black'
                            ? 'bg-neutral-900 border-neutral-700 text-white'
                            : 'bg-emerald-700 border-emerald-500 text-white'
                        }`}
                      >
                        {item.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-semibold text-emerald-200">
                            {info.color === 'red' ? 'Rouge' : info.color === 'black' ? 'Noir' : 'Vert'} • {SECTOR_NAMES[info.sector]}
                          </span>
                          <span className="font-bold text-amber-300">
                            {item.count} fois ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                            style={{ width: `${Math.min(100, (item.percentage / 15) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cold Numbers (Numéros Froids / En retard) */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                  <Snowflake className="w-4 h-4 text-cyan-400" />
                  Top 5 Numéros en Retard (Écarts)
                </span>
                <span className="text-[10px] text-cyan-300/80">Tours sans sortie</span>
              </div>

              <div className="space-y-2">
                {stats.coldNumbers.map((item) => {
                  const info = ROULETTE_NUMBERS[item.number];
                  return (
                    <div key={item.number} className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs border ${
                          info.color === 'red'
                            ? 'bg-rose-700 border-rose-500 text-white'
                            : info.color === 'black'
                            ? 'bg-neutral-900 border-neutral-700 text-white'
                            : 'bg-emerald-700 border-emerald-500 text-white'
                        }`}
                      >
                        {item.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-semibold text-emerald-200">
                            {info.color === 'red' ? 'Rouge' : info.color === 'black' ? 'Noir' : 'Vert'} • {SECTOR_NAMES[info.sector]}
                          </span>
                          <span className="font-bold text-cyan-300">
                            Écart: {item.gap} tours
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                            style={{ width: `${Math.min(100, (item.gap / 37) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chances Simples & Séries */}
      {activeTab === 'chances' && (
        <div className="space-y-4">
          {/* Active streak banner */}
          {stats.activeStreak.count >= 2 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold text-amber-300">Série active détectée :</span>
                <span className="text-white font-extrabold uppercase">
                  {stats.activeStreak.count} {stats.activeStreak.value} consécutifs
                </span>
              </div>
              <span className="text-emerald-300 text-[11px]">
                Probabilité de rupture statistique imminente
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-black/20 border border-emerald-900/40 text-xs text-emerald-300/70 text-center">
              Aucune anomalie de série majeure active (alternance régulière des tirages).
            </div>
          )}

          {/* Grid of Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Rouge vs Noir */}
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40">
              <div className="text-[11px] font-bold text-emerald-300 uppercase mb-2">
                Rouge vs Noir
              </div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-rose-400 font-bold">
                  Rouge: {stats.colorPercentages.red.toFixed(1)}% ({stats.colorCounts.red})
                </span>
                <span className="text-neutral-300 font-bold">
                  Noir: {stats.colorPercentages.black.toFixed(1)}% ({stats.colorCounts.black})
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full flex overflow-hidden border border-emerald-900">
                <div
                  className="bg-rose-600 h-full transition-all"
                  style={{ width: `${stats.colorPercentages.red}%` }}
                />
                <div
                  className="bg-neutral-800 h-full transition-all"
                  style={{ width: `${stats.colorPercentages.black}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1.5 text-center">
                Zéro vert : {stats.colorCounts.green} fois ({stats.colorPercentages.green.toFixed(1)}%)
              </div>
            </div>

            {/* Pair vs Impair */}
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40">
              <div className="text-[11px] font-bold text-emerald-300 uppercase mb-2">
                Pair vs Impair
              </div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-amber-300 font-bold">
                  Pair: {stats.parityPercentages.even.toFixed(1)}% ({stats.parityCounts.even})
                </span>
                <span className="text-emerald-300 font-bold">
                  Impair: {stats.parityPercentages.odd.toFixed(1)}% ({stats.parityCounts.odd})
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full flex overflow-hidden border border-emerald-900">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${stats.parityPercentages.even}%` }}
                />
                <div
                  className="bg-emerald-600 h-full transition-all"
                  style={{ width: `${stats.parityPercentages.odd}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1.5 text-center">
                Équilibre théorique : 48.65% chacun
              </div>
            </div>

            {/* Manque (1-18) vs Passe (19-36) */}
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40">
              <div className="text-[11px] font-bold text-emerald-300 uppercase mb-2">
                Manque (1-18) vs Passe (19-36)
              </div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-cyan-300 font-bold">
                  Manque: {stats.rangePercentages.low.toFixed(1)}% ({stats.rangeCounts.low})
                </span>
                <span className="text-amber-200 font-bold">
                  Passe: {stats.rangePercentages.high.toFixed(1)}% ({stats.rangeCounts.high})
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full flex overflow-hidden border border-emerald-900">
                <div
                  className="bg-cyan-600 h-full transition-all"
                  style={{ width: `${stats.rangePercentages.low}%` }}
                />
                <div
                  className="bg-amber-600 h-full transition-all"
                  style={{ width: `${stats.rangePercentages.high}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1.5 text-center">
                Moyenne attendue : 48.65%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Secteurs Cylindre */}
      {activeTab === 'secteurs' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Voisins du Zéro */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-800/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 uppercase">Voisins du Zéro</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                17 numéros
              </span>
            </div>
            <div className="text-2xl font-black text-white my-1">
              {stats.sectorPercentages.voisins.toFixed(1)}%
            </div>
            <div className="text-[11px] text-emerald-300/80 mb-2">
              {stats.sectorCounts.voisins} sorties • Théorique : 45.9%
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${stats.sectorPercentages.voisins}%` }}
              />
            </div>
          </div>

          {/* Tiers du Cylindre */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-800/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-cyan-300 uppercase">Tiers du Cylindre</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                12 numéros
              </span>
            </div>
            <div className="text-2xl font-black text-white my-1">
              {stats.sectorPercentages.tiers.toFixed(1)}%
            </div>
            <div className="text-[11px] text-emerald-300/80 mb-2">
              {stats.sectorCounts.tiers} sorties • Théorique : 32.4%
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${stats.sectorPercentages.tiers}%` }}
              />
            </div>
          </div>

          {/* Orphelins */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-800/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-rose-300 uppercase">Orphelins</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                8 numéros
              </span>
            </div>
            <div className="text-2xl font-black text-white my-1">
              {stats.sectorPercentages.orphelins.toFixed(1)}%
            </div>
            <div className="text-[11px] text-emerald-300/80 mb-2">
              {stats.sectorCounts.orphelins} sorties • Théorique : 21.6%
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400"
                style={{ width: `${stats.sectorPercentages.orphelins}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Précision de la Session */}
      {activeTab === 'precision' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">Tours Analysés</div>
              <div className="text-2xl font-black text-white my-1">{stats.accuracy.totalChecked}</div>
              <div className="text-[10px] text-emerald-300/60">Avec prédiction active</div>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 text-center">
              <div className="text-[10px] text-amber-400 uppercase font-semibold">Touché VIP Plein</div>
              <div className="text-2xl font-black text-amber-300 my-1">{stats.accuracy.vipHits}</div>
              <div className="text-[10px] text-amber-400/80">Rapport 35:1</div>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">Top 5 Couverture</div>
              <div className="text-2xl font-black text-emerald-300 my-1">
                {stats.accuracy.coverageHits}
                <span className="text-xs text-emerald-400 font-normal">
                  {' '}({stats.accuracy.totalChecked > 0 ? ((stats.accuracy.coverageHits / stats.accuracy.totalChecked) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="text-[10px] text-emerald-300/60">5 numéros clés</div>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">Secteur Validé</div>
              <div className="text-2xl font-black text-cyan-300 my-1">
                {stats.accuracy.sectorHits}
                <span className="text-xs text-cyan-400 font-normal">
                  {' '}({stats.accuracy.totalChecked > 0 ? ((stats.accuracy.sectorHits / stats.accuracy.totalChecked) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="text-[10px] text-emerald-300/60">Voisins / Tiers / Orphelins</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-xs text-emerald-200">
            <span className="font-bold text-amber-300">Mécanisme de validation : </span>
            Chaque nouveau tour entré par l&apos;utilisateur est instantanément comparé aux recommandations générées lors du tour précédent.
          </div>
        </div>
      )}
    </div>
  );
}
