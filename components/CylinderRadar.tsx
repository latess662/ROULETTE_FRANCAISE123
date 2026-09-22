'use client';

import React, { useMemo } from 'react';
import {
  FRENCH_WHEEL_ORDER,
  ROULETTE_NUMBERS,
  VOISINS_DU_ZERO,
  TIERS_DU_CYLINDRE,
  ORPHELINS,
  SECTOR_NAMES,
  SectorType
} from '@/lib/roulette-data';
import { PredictionResult } from '@/lib/roulette-analyzer';
import { Compass, Target, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface CylinderRadarProps {
  lastSpunNumber?: number;
  prediction?: PredictionResult;
  onSelectNumber: (num: number) => void;
}

export function CylinderRadar({
  lastSpunNumber,
  prediction,
  onSelectNumber
}: CylinderRadarProps) {
  const totalPockets = FRENCH_WHEEL_ORDER.length; // 37
  const angleStep = (2 * Math.PI) / totalPockets;

  // Wheel pockets calculation
  const pockets = useMemo(() => {
    return FRENCH_WHEEL_ORDER.map((num, idx) => {
      // Rotate so 0 is at the top (-PI/2)
      const angle = idx * angleStep - Math.PI / 2;
      const info = ROULETTE_NUMBERS[num];

      return {
        number: num,
        angle,
        color: info.color,
        sector: info.sector,
        isLast: lastSpunNumber === num,
        isVip: prediction?.vipNumber === num,
        isCover: prediction?.coverageNumbers.includes(num)
      };
    });
  }, [angleStep, lastSpunNumber, prediction]);

  const centerX = 200;
  const centerY = 200;
  const outerRadius = 185;
  const innerRadius = 125;
  const hubRadius = 65;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#08291a] via-[#051c12] to-[#03110b] border border-amber-500/30 p-4 sm:p-5 shadow-2xl flex flex-col items-center">
      {/* Title */}
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-emerald-800/40">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
            Radar du Cylindre Français
          </h3>
        </div>
        <div className="text-[11px] text-emerald-300/80 font-medium">
          37 cases (0-36)
        </div>
      </div>

      {/* SVG French Roulette Wheel */}
      <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-square flex items-center justify-center my-2">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full select-none drop-shadow-xl"
        >
          {/* Wheel outer rim metallic gradient */}
          <defs>
            <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#b4882b" />
              <stop offset="92%" stopColor="#f3d178" />
              <stop offset="100%" stopColor="#7a5511" />
            </radialGradient>
            <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2c5e43" />
              <stop offset="70%" stopColor="#0b281a" />
              <stop offset="100%" stopColor="#04120b" />
            </radialGradient>
          </defs>

          {/* Outer Ring */}
          <circle cx={centerX} cy={centerY} r={outerRadius + 8} fill="url(#rimGrad)" />
          <circle cx={centerX} cy={centerY} r={outerRadius + 2} fill="#051c12" />

          {/* Sectors arcs indicators behind pockets */}
          {/* Draw all 37 pockets */}
          {pockets.map((p) => {
            const startAngle = p.angle - angleStep / 2;
            const endAngle = p.angle + angleStep / 2;

            const x1 = (centerX + outerRadius * Math.cos(startAngle)).toFixed(2);
            const y1 = (centerY + outerRadius * Math.sin(startAngle)).toFixed(2);
            const x2 = (centerX + outerRadius * Math.cos(endAngle)).toFixed(2);
            const y2 = (centerY + outerRadius * Math.sin(endAngle)).toFixed(2);

            const x3 = (centerX + innerRadius * Math.cos(endAngle)).toFixed(2);
            const y3 = (centerY + innerRadius * Math.sin(endAngle)).toFixed(2);
            const x4 = (centerX + innerRadius * Math.cos(startAngle)).toFixed(2);
            const y4 = (centerY + innerRadius * Math.sin(startAngle)).toFixed(2);

            // Pocket path with rounded coordinates
            const pathData = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;

            // Pocket text position
            const textRadius = (outerRadius + innerRadius) / 2;
            const tx = (centerX + textRadius * Math.cos(p.angle)).toFixed(2);
            const ty = (centerY + textRadius * Math.sin(p.angle)).toFixed(2);
            const textRotation = ((p.angle * 180) / Math.PI + 90).toFixed(2);

            // Fill color
            let fill = p.color === 'red' ? '#be123c' : p.color === 'black' ? '#18181b' : '#059669';
            if (p.isVip) fill = '#d97706'; // highlight VIP in gold

            return (
              <g
                key={p.number}
                className="cursor-pointer transition-transform hover:opacity-80"
                onClick={() => {
                  soundFx.playChipClick();
                  onSelectNumber(p.number);
                }}
              >
                <path
                  d={pathData}
                  fill={fill}
                  stroke="#d4af37"
                  strokeWidth={p.isVip ? "2.5" : "0.75"}
                  className="transition-colors duration-150"
                />

                {/* Number text on the wheel */}
                <text
                  x={tx}
                  y={ty}
                  fill={p.isVip ? '#000' : '#ffffff'}
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                >
                  {p.number}
                </text>

                {/* Marker if last spun number */}
                {p.isLast && (
                  <circle
                    cx={Number((centerX + (outerRadius - 6) * Math.cos(p.angle)).toFixed(2))}
                    cy={Number((centerY + (outerRadius - 6) * Math.sin(p.angle)).toFixed(2))}
                    r="4.5"
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {/* Marker if VIP predicted number */}
                {p.isVip && (
                  <circle
                    cx={Number((centerX + (innerRadius + 6) * Math.cos(p.angle)).toFixed(2))}
                    cy={Number((centerY + (innerRadius + 6) * Math.sin(p.angle)).toFixed(2))}
                    r="5"
                    fill="#f59e0b"
                    stroke="#000"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Inner Wheel Hub */}
          <circle cx={centerX} cy={centerY} r={innerRadius - 1} fill="#09281a" stroke="#d4af37" strokeWidth="2" />
          <circle cx={centerX} cy={centerY} r={hubRadius} fill="url(#hubGrad)" stroke="#f3d178" strokeWidth="1.5" />

          {/* Center Info Hub text */}
          <text
            x={centerX}
            y={centerY - 16}
            fill="#d4af37"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="1"
          >
            {prediction ? 'CIBLE STAT.' : 'ROULETTE'}
          </text>

          <text
            x={centerX}
            y={centerY + 6}
            fill="#ffffff"
            fontSize="22"
            fontWeight="900"
            textAnchor="middle"
          >
            {prediction ? prediction.vipNumber : (lastSpunNumber ?? 'RF')}
          </text>

          <text
            x={centerX}
            y={centerY + 22}
            fill="#34d399"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
          >
            {prediction ? `${prediction.confidence}%` : 'FRANÇAISE'}
          </text>
        </svg>
      </div>

      {/* Sector breakdown pills */}
      <div className="w-full grid grid-cols-3 gap-1.5 mt-2 text-xs">
        <div
          className={`p-2 rounded-xl text-center border transition ${
            prediction?.suggestedSector === 'voisins'
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
              : 'bg-black/30 border-emerald-800/40 text-emerald-200'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-emerald-400">Voisins (17)</div>
          <div className="text-xs font-black truncate">Voisins du 0</div>
        </div>

        <div
          className={`p-2 rounded-xl text-center border transition ${
            prediction?.suggestedSector === 'tiers'
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
              : 'bg-black/30 border-emerald-800/40 text-emerald-200'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-emerald-400">Tiers (12)</div>
          <div className="text-xs font-black truncate">Tiers Cylindre</div>
        </div>

        <div
          className={`p-2 rounded-xl text-center border transition ${
            prediction?.suggestedSector === 'orphelins'
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
              : 'bg-black/30 border-emerald-800/40 text-emerald-200'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-emerald-400">Orphelins (8)</div>
          <div className="text-xs font-black truncate">Orphelins</div>
        </div>
      </div>
    </div>
  );
}
