import React, { useState, useEffect, useCallback } from 'react';
import { ImagingPanel } from './components/ImagingPanel';
import { OdontogramPanel } from './components/OdontogramPanel';
import { DocumentationPanel } from './components/DocumentationPanel';
import { ExportView } from './components/ExportView';
import { AppState, Finding, Severity, FindingCategory } from './types';
import { SEED_PATIENT, INITIAL_AI_FINDINGS, AUTO_CDT_MAP, INTAKE_CO, INTAKE_HPC } from './constants';
import { generateClinicalNote } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    patient: SEED_PATIENT,
    findings: INITIAL_AI_FINDINGS,
    selectedTooth: null,
    showAIOverlay: true,
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    status: 'loading',
    complainsOf: INTAKE_CO,
    isComplainsOfVerified: false,
    hpc: INTAKE_HPC,
    isHpcVerified: false,
    medicalHistory: { status: 'pending', notes: '' },
    socialHistory: { status: 'pending', notes: '' },
    tissueExam: { status: 'pending', notes: '' },
    hardTissueExam: { status: 'pending', notes: '' },
    cancerScreening: { status: 'pending', notes: '' },
    finalNote: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setState(prev => ({ ...prev, status: 'drafting' })), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  const handleUpdateFinding = useCallback((id: string, updates: Partial<Finding>) => {
    setState(prev => ({
      ...prev,
      findings: prev.findings.map(f => {
        if (f.id !== id) return f;
        const newFinding = { ...f, ...updates };
        if (updates.surface && !newFinding.isOverride) {
          const surfacesCount = newFinding.surface.length;
          newFinding.suggestedCDT = AUTO_CDT_MAP[surfacesCount] || 'D2394';
        }
        return newFinding;
      })
    }));
  }, []);

  const handleDeleteFinding = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      findings: prev.findings.map(f => f.id === id ? { ...f, status: 'Deleted' } : f)
    }));
  }, []);

  const handleAddManualFinding = useCallback((partial: Partial<Finding>, category: FindingCategory = 'charting') => {
    const newFinding: Finding = {
      id: `M${Date.now()}`,
      toothNumber: partial.toothNumber || 'General',
      surface: partial.surface || 'O',
      findingType: partial.findingType || 'Observation',
      description: partial.description || '',
      severity: partial.severity || 'Incipient',
      source: 'Manual',
      status: 'Confirmed',
      confidence: 1.0,
      suggestedCDT: partial.suggestedCDT || 'D0120',
      treatmentPlan: partial.treatmentPlan || 'Monitoring',
      treatmentCDT: partial.treatmentCDT || 'D0120',
      isTreatmentConfirmed: false,
      category: category
    };
    setState(prev => ({ ...prev, findings: [...prev.findings, newFinding] }));
  }, []);

  const handleGenerateNote = async () => {
    setState(prev => ({ ...prev, status: 'loading' }));
    const note = await generateClinicalNote(
      state.patient,
      state.findings,
      state.complainsOf,
      state.hpc,
      state.medicalHistory,
      state.socialHistory,
      state.tissueExam,
      state.hardTissueExam,
      state.cancerScreening
    );
    setState(prev => ({ ...prev, finalNote: note, status: 'finalized' }));
  };

  const toggleDarkMode = () => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));

  if (state.status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-8">
            <div className="absolute inset-0 border-2 border-slate-200 dark:border-slate-800 rounded-2xl" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-2xl animate-spin" style={{ animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary font-bold text-xl italic tracking-tight">F</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Initializing FastDental</p>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">Loading patient · Michael Chen</p>
        </div>
      </div>
    );
  }

  const pendingCount = state.findings.filter(f => f.status === 'Pending').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-5 flex items-center justify-between z-20 shrink-0" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm italic" style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}>
            F
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] tracking-tight">FastDental</span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:block">v4.2.1</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">{pendingCount} pending</span>
            </div>
          )}
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {state.isDarkMode ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden gap-px bg-slate-200 dark:bg-slate-800">
        <aside className="w-[33%] h-full shrink-0 bg-white dark:bg-slate-900">
          <ImagingPanel
            showAI={state.showAIOverlay}
            setShowAI={(val) => setState(prev => ({ ...prev, showAIOverlay: val }))}
            findings={state.findings}
          />
        </aside>

        <section className="w-[30%] h-full shrink-0 bg-white dark:bg-slate-900">
          <OdontogramPanel
            findings={state.findings}
            selectedTooth={state.selectedTooth}
            onSelectTooth={(num) => setState(prev => ({ ...prev, selectedTooth: num === 0 ? null : num }))}
          />
        </section>

        <aside className="flex-1 h-full shrink-0 bg-white dark:bg-slate-900">
          <DocumentationPanel
            patient={state.patient}
            findings={state.findings}
            selectedTooth={state.selectedTooth}
            complainsOf={state.complainsOf}
            setComplainsOf={(val) => setState(prev => ({ ...prev, complainsOf: val, isComplainsOfVerified: true }))}
            isComplainsOfVerified={state.isComplainsOfVerified}
            setComplainsOfVerified={(val) => setState(prev => ({ ...prev, isComplainsOfVerified: val }))}
            hpc={state.hpc}
            setHpc={(val) => setState(prev => ({ ...prev, hpc: val, isHpcVerified: true }))}
            isHpcVerified={state.isHpcVerified}
            setHpcVerified={(val) => setState(prev => ({ ...prev, isHpcVerified: val }))}
            medicalHistory={state.medicalHistory}
            setMedicalHistory={(val) => setState(prev => ({ ...prev, medicalHistory: val }))}
            socialHistory={state.socialHistory}
            setSocialHistory={(val) => setState(prev => ({ ...prev, socialHistory: val }))}
            cancerScreening={state.cancerScreening}
            setCancerScreening={(val) => setState(prev => ({ ...prev, cancerScreening: val }))}
            onUpdateFinding={handleUpdateFinding}
            onAddManualFinding={handleAddManualFinding}
            onDeleteFinding={handleDeleteFinding}
            onGenerateNote={handleGenerateNote}
            tissueExam={state.tissueExam}
            setTissueExam={(val) => setState(prev => ({ ...prev, tissueExam: val }))}
            hardTissueExam={state.hardTissueExam}
            setHardTissueExam={(val) => setState(prev => ({ ...prev, hardTissueExam: val }))}
            isGenerating={state.status === 'loading'}
          />
        </aside>
      </main>

      {(state.status === 'finalized' || state.status === 'exported') && (
        <ExportView
          patient={state.patient}
          findings={state.findings.filter(f => f.status === 'Confirmed')}
          note={state.finalNote}
          setNote={(val) => setState(prev => ({ ...prev, finalNote: val }))}
          status={state.status as 'finalized' | 'exported'}
          onBack={() => setState(prev => ({ ...prev, status: 'drafting' }))}
          onExport={() => setState(prev => ({ ...prev, status: 'exported' }))}
        />
      )}
    </div>
  );
};

export default App;
