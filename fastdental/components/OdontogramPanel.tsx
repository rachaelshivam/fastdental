import React from 'react';
import { Finding } from '../types';

interface OdontogramPanelProps {
  findings: Finding[];
  selectedTooth: number | null;
  onSelectTooth: (num: number) => void;
}

export const OdontogramPanel: React.FC<OdontogramPanelProps> = ({ findings, selectedTooth, onSelectTooth }) => {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  const Tooth = ({ num }: { num: number }) => {
    const toothFindings = findings.filter(f => f.toothNumber === num && f.status !== 'Deleted');
    const hasPending = toothFindings.some(f => f.status === 'Pending');
    const hasConfirmed = toothFindings.some(f => f.status === 'Confirmed');
    const isSelected = selectedTooth === num;

    return (
      <button
        onClick={() => onSelectTooth(num)}
        className={`
          relative w-full aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
          ${isSelected
            ? 'bg-primary/10 dark:bg-primary/15 ring-1.5 ring-primary scale-105 z-10'
            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
          }
        `}
        style={isSelected ? { boxShadow: '0 0 0 2px #2563EB, 0 4px 12px rgba(37,99,235,0.15)' } : {}}
        title={`Tooth #${num}${toothFindings.length > 0 ? ` · ${toothFindings.length} finding(s)` : ''}`}
      >
        <span className={`text-[9px] font-semibold leading-none mb-1 font-mono ${isSelected ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
          {num}
        </span>
        {/* Tooth shape */}
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <path
            d="M2 4C2 2 3.5 1 7 1C10.5 1 12 2 12 4C12 7 13 10 13 13C13 15.5 11 17 9 17C8 17 7.5 16 7 16C6.5 16 6 17 5 17C3 17 1 15.5 1 13C1 10 2 7 2 4Z"
            fill={isSelected ? '#2563EB' : (hasPending ? '#FEE2E2' : hasConfirmed ? '#EFF6FF' : 'currentColor')}
            className={!isSelected && !hasPending && !hasConfirmed ? 'text-slate-200 dark:text-slate-700' : ''}
            stroke={isSelected ? '#1D4ED8' : (hasPending ? '#EF4444' : hasConfirmed ? '#3B82F6' : '#CBD5E1')}
            strokeWidth="0.75"
          />
        </svg>

        {/* Status dots */}
        <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5">
          {hasPending && <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm" style={{ boxShadow: '0 0 0 1.5px white' }} />}
          {hasConfirmed && !hasPending && <div className="w-2 h-2 bg-primary rounded-full shadow-sm" style={{ boxShadow: '0 0 0 1.5px white' }} />}
        </div>
      </button>
    );
  };

  const confirmedCount = findings.filter(f => f.status === 'Confirmed').length;
  const pendingCount = findings.filter(f => f.status === 'Pending').length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Odontogram</span>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="text-[10px] font-semibold text-red-500 font-mono">{pendingCount}</span>
            </div>
          )}
          {confirmedCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-[10px] font-semibold text-primary font-mono">{confirmedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Odontogram */}
      <div className="flex-1 overflow-y-auto px-4 py-5" style={{ minHeight: 0 }}>
        <div className="flex flex-col gap-8 max-w-sm mx-auto">
          {/* Upper Arch */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-center mb-3">Maxillary · Upper</p>
            <div className="grid grid-cols-8 gap-1.5">
              {upperTeeth.map(n => <Tooth key={n} num={n} />)}
            </div>
          </div>

          {/* Midline divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Midline</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Lower Arch */}
          <div>
            <div className="grid grid-cols-8 gap-1.5">
              {lowerTeeth.map(n => <Tooth key={n} num={n} />)}
            </div>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-center mt-3">Mandibular · Lower</p>
          </div>
        </div>
      </div>

      {/* Selected tooth info */}
      {selectedTooth && (
        <div className="px-4 py-3 bg-primary/5 dark:bg-primary/10 border-t border-primary/10 dark:border-primary/20 shrink-0 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">Selected</p>
              <p className="text-sm font-bold text-primary font-mono">Tooth #{selectedTooth}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Findings</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                {findings.filter(f => f.toothNumber === selectedTooth && f.status !== 'Deleted').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex justify-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AI Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Confirmed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
