import React from 'react';
import { Finding, Patient } from '../types';

interface ExportViewProps {
  patient: Patient;
  findings: Finding[];
  note: string;
  setNote: (val: string) => void;
  onBack: () => void;
  status: 'finalized' | 'exported';
  onExport: () => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ patient, findings, note, setNote, onBack, status, onExport }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)', animation: 'fadeSlideIn 0.2s ease both' }}
      >
        {status === 'exported' ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Export Complete</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Clinical documentation and CDT codes for <strong className="text-slate-600 dark:text-slate-300">{patient.firstName} {patient.lastName}</strong> have been synced to the Practice Management System.
            </p>
            <button
              onClick={onBack}
              className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Back to Workspace
            </button>
          </div>
        ) : (
          <div className="flex flex-col" style={{ maxHeight: '82vh' }}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Review & Export</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{patient.firstName} {patient.lastName} · {patient.visitDate}</p>
              </div>
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ minHeight: 0 }}>
              {/* Clinical Narrative */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Clinical Narrative</label>
                  <span className="text-[10px] text-slate-400 font-mono">{note.length} chars</span>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none font-sans"
                  style={{ minHeight: '240px' }}
                  placeholder="Generated clinical note will appear here..."
                />
              </div>

              {/* CDT Codes */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Billable CDT Codes ({findings.length})</p>
                <div className="space-y-1.5">
                  {findings.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg">
                      <span className="text-[11px] font-bold text-primary font-mono shrink-0">{f.suggestedCDT}</span>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 flex-1 truncate">{f.findingType}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">T#{f.toothNumber}</span>
                    </div>
                  ))}
                  {findings.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-2">No billable findings recorded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(note);
                  alert('Copied to clipboard!');
                }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Note
              </button>
              <button
                onClick={onExport}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Export to PMS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
