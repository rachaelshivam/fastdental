import React, { useState, useEffect, useRef } from 'react';
import { Finding, Patient, Severity, FindingStatus, AppState, FindingCategory } from '../types';
import { CDT_CODES, FINDING_TYPES, AUTO_CDT_MAP, TREATMENT_DEFAULTS } from '../constants';

interface DocumentationPanelProps {
  patient: Patient;
  findings: Finding[];
  selectedTooth: number | null;
  complainsOf: string;
  setComplainsOf: (val: string) => void;
  isComplainsOfVerified: boolean;
  setComplainsOfVerified: (val: boolean) => void;
  hpc: string;
  setHpc: (val: string) => void;
  isHpcVerified: boolean;
  setHpcVerified: (val: boolean) => void;
  medicalHistory: AppState['medicalHistory'];
  setMedicalHistory: (val: AppState['medicalHistory']) => void;
  socialHistory: AppState['socialHistory'];
  setSocialHistory: (val: AppState['socialHistory']) => void;
  cancerScreening: AppState['cancerScreening'];
  setCancerScreening: (val: AppState['cancerScreening']) => void;
  onUpdateFinding: (id: string, updates: Partial<Finding>) => void;
  onAddManualFinding: (finding: Partial<Finding>, category?: FindingCategory) => void;
  onDeleteFinding: (id: string) => void;
  onGenerateNote: () => void;
  tissueExam: AppState['tissueExam'];
  setTissueExam: (val: AppState['tissueExam']) => void;
  hardTissueExam: AppState['hardTissueExam'];
  setHardTissueExam: (val: AppState['hardTissueExam']) => void;
  isGenerating: boolean;
}

export const DocumentationPanel: React.FC<DocumentationPanelProps> = ({
  patient,
  findings,
  selectedTooth,
  complainsOf,
  setComplainsOf,
  isComplainsOfVerified,
  setComplainsOfVerified,
  hpc,
  setHpc,
  isHpcVerified,
  setHpcVerified,
  medicalHistory,
  setMedicalHistory,
  socialHistory,
  setSocialHistory,
  cancerScreening,
  setCancerScreening,
  onUpdateFinding,
  onAddManualFinding,
  onDeleteFinding,
  onGenerateNote,
  tissueExam,
  setTissueExam,
  hardTissueExam,
  setHardTissueExam,
  isGenerating
}) => {
  const [activeAddForm, setActiveAddForm] = useState<FindingCategory | null>(null);
  const [newFinding, setNewFinding] = useState({
    findingType: FINDING_TYPES[0],
    description: '',
    severity: 'Incipient' as Severity,
    surface: 'O'
  });

  const [medHistoryOpen, setMedHistoryOpen] = useState(true);
  const [socHistoryOpen, setSocHistoryOpen] = useState(true);
  const [tissueExamOpen, setTissueExamOpen] = useState(true);
  const [hardTissueOpen, setHardTissueOpen] = useState(true);
  const [cancerScreeningOpen, setCancerScreeningOpen] = useState(true);
  const [treatmentSummaryExpanded, setTreatmentSummaryExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (medicalHistory.status !== 'pending') setMedHistoryOpen(false); }, [medicalHistory.status]);
  useEffect(() => { if (socialHistory.status !== 'pending') setSocHistoryOpen(false); }, [socialHistory.status]);
  useEffect(() => { if (tissueExam.status !== 'pending') setTissueExamOpen(false); }, [tissueExam.status]);
  useEffect(() => { if (cancerScreening.status !== 'pending') setCancerScreeningOpen(false); }, [cancerScreening.status]);
  useEffect(() => { if (hardTissueExam.status !== 'pending') setHardTissueOpen(false); }, [hardTissueExam.status]);

  useEffect(() => {
    if (selectedTooth) {
      const element = document.getElementById(`finding-${selectedTooth}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedTooth]);

  const pendingFindings = findings.filter(f => f.status === 'Pending');
  const confirmedFindings = findings.filter(f => f.status === 'Confirmed');
  const manualFindings = confirmedFindings.filter(f => f.category === 'charting' || (!f.category && f.source === 'Manual'));
  const investigationFindings = confirmedFindings.filter(f => f.category === 'investigation' || (!f.category && f.source === 'AI'));

  const allReviewed = pendingFindings.length === 0 && isComplainsOfVerified && isHpcVerified;
  const tissueExamComplete = tissueExam.status !== 'pending';
  const hardTissueExamComplete = hardTissueExam.status !== 'pending';
  const cancerScreeningComplete = cancerScreening.status !== 'pending';
  const medHistoryComplete = medicalHistory.status !== 'pending';
  const socHistoryComplete = socialHistory.status !== 'pending';
  const treatmentsAddressed = confirmedFindings.every(f => f.isTreatmentConfirmed);

  const canGenerate = allReviewed && tissueExamComplete && hardTissueExamComplete && cancerScreeningComplete && medHistoryComplete && socHistoryComplete && treatmentsAddressed && !isGenerating;

  const handleAddSubmit = (category: FindingCategory) => {
    onAddManualFinding({
      ...newFinding,
      toothNumber: selectedTooth || 'General',
      source: 'Manual',
      status: 'Confirmed',
      suggestedCDT: 'D0120',
      treatmentPlan: TREATMENT_DEFAULTS[newFinding.findingType] || 'Clinical monitoring',
      treatmentCDT: 'D0120',
      isTreatmentConfirmed: false
    }, category);
    setNewFinding({ findingType: FINDING_TYPES[0], description: '', severity: 'Incipient' as Severity, surface: 'O' });
    setActiveAddForm(null);
  };

  // Reusable sub-components
  const VerificationButton = ({ isVerified, onVerify }: { isVerified: boolean; onVerify: () => void }) => (
    isVerified ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-semibold border border-emerald-200 dark:border-emerald-900">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Verified
      </span>
    ) : (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">Needs review</span>
        <button onClick={onVerify} className="px-3 py-1 bg-primary text-white text-[10px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          Confirm
        </button>
      </div>
    )
  );

  const inputBase = "w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[12px] text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-slate-400";
  const inputPending = "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900 ring-2 ring-amber-500/10";

  const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );

  const CollapsibleHeader = ({ title, status, isOpen, onToggle }: { title: string; status: string; isOpen: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors group">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{title}</span>
        {status === 'pending' && (
          <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900 uppercase tracking-wide">Action</span>
        )}
      </div>
      <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const toggleBtnBase = "flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold border transition-all duration-150";
  const toggleInactive = "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300";
  const toggleActiveGreen = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
  const toggleActiveBlue = "bg-primary text-white border-blue-600 shadow-sm";

  const ManualAddForm = ({ category }: { category: FindingCategory }) => (
    <div className="mx-4 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Manual Entry</span>
        {category === 'investigation' && (
          <button onClick={() => setActiveAddForm(null)} className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold">Cancel</button>
        )}
      </div>
      <select value={newFinding.findingType} onChange={(e) => setNewFinding({ ...newFinding, findingType: e.target.value })} className={inputBase}>
        {FINDING_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <textarea
        value={newFinding.description}
        onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
        placeholder="Description of finding..."
        className={`${inputBase} h-16 resize-none`}
      />
      <div className="grid grid-cols-2 gap-2">
        <select value={newFinding.severity} onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value as Severity })} className={inputBase}>
          <option>Incipient</option><option>Moderate</option><option>Severe</option>
        </select>
        <input type="text" value={newFinding.surface} onChange={(e) => setNewFinding({ ...newFinding, surface: e.target.value.toUpperCase() })} placeholder="Surface (e.g. MO)" className={inputBase} />
      </div>
      <button
        onClick={() => handleAddSubmit(category)}
        disabled={!newFinding.description}
        className="w-full py-2 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Chart on Tooth {selectedTooth || 'General'}
      </button>
    </div>
  );

  const FindingTreatmentCard = ({ f, isSelected }: { f: Finding; isSelected: boolean }) => (
    <div
      id={`finding-${f.toothNumber}`}
      className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-4 transition-all duration-200 ${isSelected ? 'border-primary shadow-md' : 'border-slate-100 dark:border-slate-800'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono text-white ${f.source === 'AI' ? 'bg-primary' : 'bg-slate-500'}`}>
            {f.toothNumber}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{f.findingType}</p>
            <p className="text-[10px] text-slate-400 font-mono">{f.surface}</p>
          </div>
        </div>
        <button onClick={() => onDeleteFinding(f.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2.5 border border-slate-100 dark:border-slate-800">
        <textarea
          value={f.treatmentPlan}
          onChange={(e) => onUpdateFinding(f.id, { treatmentPlan: e.target.value, isTreatmentConfirmed: false })}
          className={`${inputBase} resize-none`}
          rows={2}
        />
        <div className="flex gap-2">
          <select
            value={f.treatmentCDT}
            onChange={(e) => onUpdateFinding(f.id, { treatmentCDT: e.target.value, isTreatmentConfirmed: false })}
            className={`${inputBase} flex-1`}
          >
            {CDT_CODES.map(c => <option key={c.code} value={c.code}>{c.code} – {c.label}</option>)}
          </select>
          <button
            onClick={() => onUpdateFinding(f.id, { isTreatmentConfirmed: true })}
            className={`px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${f.isTreatmentConfirmed ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-blue-700'}`}
          >
            {f.isTreatmentConfirmed ? '✓ Done' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Patient Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold text-primary uppercase tracking-widest mb-0.5">Active Patient</p>
            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">{patient.firstName} {patient.lastName}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{patient.visitDate}</p>
            <p className="text-[10px] text-slate-400 font-mono">{patient.id}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth" ref={containerRef} style={{ minHeight: 0 }}>

        {/* C/O + HPC */}
        <section className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Chief Complaint (C/O)</label>
              <VerificationButton isVerified={isComplainsOfVerified} onVerify={() => setComplainsOfVerified(true)} />
            </div>
            <input
              type="text"
              value={complainsOf}
              onChange={(e) => setComplainsOf(e.target.value)}
              className={`${inputBase} ${!isComplainsOfVerified ? inputPending : ''}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">History of Complaint (HPC)</label>
              <VerificationButton isVerified={isHpcVerified} onVerify={() => setHpcVerified(true)} />
            </div>
            <textarea
              value={hpc}
              onChange={(e) => setHpc(e.target.value)}
              rows={3}
              className={`${inputBase} resize-none ${!isHpcVerified ? inputPending : ''}`}
            />
          </div>
        </section>

        {/* Medical History */}
        <SectionCard>
          <CollapsibleHeader title="Medical History" status={medicalHistory.status} isOpen={medHistoryOpen} onToggle={() => setMedHistoryOpen(!medHistoryOpen)} />
          {medHistoryOpen && (
            <div className="px-4 pb-4 space-y-2.5 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
              <div className="flex gap-2">
                <button onClick={() => setMedicalHistory({ status: 'unchanged', notes: 'Medical history reviewed and patient reports no changes.' })} className={`${toggleBtnBase} ${medicalHistory.status === 'unchanged' ? toggleActiveGreen : toggleInactive}`}>No Change</button>
                <button onClick={() => setMedicalHistory({ ...medicalHistory, status: 'edited' })} className={`${toggleBtnBase} ${medicalHistory.status === 'edited' ? toggleActiveBlue : toggleInactive}`}>Edit Notes</button>
              </div>
              {medicalHistory.status === 'edited' && (
                <textarea value={medicalHistory.notes} onChange={(e) => setMedicalHistory({ ...medicalHistory, notes: e.target.value })} className={`${inputBase} h-16 resize-none`} />
              )}
            </div>
          )}
        </SectionCard>

        {/* Social History */}
        <SectionCard>
          <CollapsibleHeader title="Social History" status={socialHistory.status} isOpen={socHistoryOpen} onToggle={() => setSocHistoryOpen(!socHistoryOpen)} />
          {socHistoryOpen && (
            <div className="px-4 pb-4 space-y-2.5 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
              <div className="flex gap-2">
                <button onClick={() => setSocialHistory({ status: 'unchanged', notes: 'Social history reviewed and patient reports no changes.' })} className={`${toggleBtnBase} ${socialHistory.status === 'unchanged' ? toggleActiveGreen : toggleInactive}`}>No Change</button>
                <button onClick={() => setSocialHistory({ ...socialHistory, status: 'edited' })} className={`${toggleBtnBase} ${socialHistory.status === 'edited' ? toggleActiveBlue : toggleInactive}`}>Edit Notes</button>
              </div>
              {socialHistory.status === 'edited' && (
                <textarea value={socialHistory.notes} onChange={(e) => setSocialHistory({ ...socialHistory, notes: e.target.value })} className={`${inputBase} h-16 resize-none`} />
              )}
            </div>
          )}
        </SectionCard>

        {/* Cancer Screening */}
        <SectionCard>
          <CollapsibleHeader title="Oral Cancer Screening" status={cancerScreening.status} isOpen={cancerScreeningOpen} onToggle={() => setCancerScreeningOpen(!cancerScreeningOpen)} />
          {cancerScreeningOpen && (
            <div className="px-4 pb-4 space-y-2.5 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
              <div className="flex gap-2">
                <button onClick={() => setCancerScreening({ status: 'wnl', notes: 'Oral cancer screening performed; findings within normal limits.' })} className={`${toggleBtnBase} ${cancerScreening.status === 'wnl' ? toggleActiveGreen : toggleInactive}`}>WNL</button>
                <button onClick={() => setCancerScreening({ ...cancerScreening, status: 'abnormal' })} className={`${toggleBtnBase} ${cancerScreening.status === 'abnormal' ? 'bg-red-500 text-white border-red-600 shadow-sm' : toggleInactive}`}>Abnormal</button>
              </div>
              {cancerScreening.status === 'abnormal' && (
                <textarea value={cancerScreening.notes} onChange={(e) => setCancerScreening({ ...cancerScreening, notes: e.target.value })} className={`${inputBase} h-16 resize-none`} />
              )}
            </div>
          )}
        </SectionCard>

        {/* Soft Tissue Exam */}
        <SectionCard>
          <CollapsibleHeader title="Soft Tissue Exam" status={tissueExam.status} isOpen={tissueExamOpen} onToggle={() => setTissueExamOpen(!tissueExamOpen)} />
          {tissueExamOpen && (
            <div className="px-4 pb-4 space-y-2.5 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
              <div className="flex gap-2">
                <button onClick={() => setTissueExam({ status: 'normal', notes: 'Within normal limits (WNL). No abnormalities detected.' })} className={`${toggleBtnBase} ${tissueExam.status === 'normal' ? toggleActiveGreen : toggleInactive}`}>WNL</button>
                <button onClick={() => setTissueExam({ ...tissueExam, status: 'abnormal' })} className={`${toggleBtnBase} ${tissueExam.status === 'abnormal' ? 'bg-red-500 text-white border-red-600 shadow-sm' : toggleInactive}`}>Abnormal</button>
              </div>
              {tissueExam.status === 'abnormal' && (
                <textarea value={tissueExam.notes} onChange={(e) => setTissueExam({ ...tissueExam, notes: e.target.value })} className={`${inputBase} h-16 resize-none`} />
              )}
            </div>
          )}
        </SectionCard>

        {/* Hard Tissue Exam */}
        <SectionCard>
          <CollapsibleHeader title="Hard Tissue Exam" status={hardTissueExam.status} isOpen={hardTissueOpen} onToggle={() => setHardTissueOpen(!hardTissueOpen)} />
          {hardTissueOpen && (
            <div className="animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
              <div className="px-4 pb-3 flex gap-2">
                <button onClick={() => setHardTissueExam({ status: 'normal', notes: 'Nothing abnormal detected.' })} className={`${toggleBtnBase} ${hardTissueExam.status === 'normal' ? toggleActiveGreen : toggleInactive}`}>WNL</button>
                <button onClick={() => setHardTissueExam({ ...hardTissueExam, status: 'abnormal' })} className={`${toggleBtnBase} ${hardTissueExam.status === 'abnormal' ? 'bg-red-500 text-white border-red-600 shadow-sm' : toggleInactive}`}>Abnormal</button>
              </div>

              {hardTissueExam.status === 'abnormal' && (
                <div className="border-t border-slate-100 dark:border-slate-800">
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Charted Findings ({manualFindings.length})</p>
                  </div>
                  <div className="px-4 pb-3 space-y-3">
                    {manualFindings.map(f => (
                      <FindingTreatmentCard key={f.id} f={f} isSelected={selectedTooth === f.toothNumber} />
                    ))}
                  </div>
                  <ManualAddForm category="charting" />
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Investigations & Findings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Investigations & Findings ({investigationFindings.length})</p>
          </div>
          <div className="space-y-3">
            {investigationFindings.map(f => (
              <FindingTreatmentCard key={f.id} f={f} isSelected={selectedTooth === f.toothNumber} />
            ))}
          </div>
        </section>

        {/* Pending AI Review */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Pending AI Review ({pendingFindings.length})</p>
          </div>
          <div className="space-y-3">
            {pendingFindings.map(f => (
              <div
                key={f.id}
                id={`finding-${f.toothNumber}`}
                className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-4 transition-all duration-200 ${selectedTooth === f.toothNumber ? 'border-primary shadow-md scale-[1.01]' : 'border-red-100 dark:border-red-950/50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center font-bold text-[11px] font-mono shadow-sm">
                      {f.toothNumber}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{f.findingType}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{f.surface} · {Math.round(f.confidence * 100)}% confidence</p>
                    </div>
                  </div>
                  <button onClick={() => onDeleteFinding(f.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 italic mb-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">{f.description}</p>
                <button
                  onClick={() => onUpdateFinding(f.id, { status: 'Confirmed', category: 'investigation' })}
                  className="w-full py-2 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Accept & Chart Finding
                </button>
              </div>
            ))}
            {pendingFindings.length === 0 && (
              <div className="py-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <svg className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-[11px] text-slate-400 font-medium">All AI findings reviewed</p>
              </div>
            )}
          </div>
        </section>

        {/* Add Manual Investigation */}
        <section>
          {activeAddForm === 'investigation' ? (
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <ManualAddForm category="investigation" />
            </div>
          ) : (
            <button
              onClick={() => setActiveAddForm('investigation')}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-400 hover:border-primary hover:text-primary transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5" strokeLinecap="round" /></svg>
              Add Manual Investigation
            </button>
          )}
        </section>

        {/* Treatment Plan Summary */}
        <section className="bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-xl overflow-hidden">
          <button
            onClick={() => setTreatmentSummaryExpanded(!treatmentSummaryExpanded)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Treatment Plan Summary</span>
            <svg className={`w-3.5 h-3.5 text-primary transition-transform duration-200 ${treatmentSummaryExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {treatmentSummaryExpanded && (
            <div className="px-4 pb-4 space-y-2 animate-in" style={{ animation: 'fadeSlideIn 0.15s ease both' }}>
              {confirmedFindings.filter(f => f.isTreatmentConfirmed).map(f => (
                <div key={f.id} className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-primary/10 shadow-sm">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded font-bold text-[10px] font-mono flex items-center justify-center shrink-0">{f.toothNumber}</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex-1">{f.treatmentPlan}</span>
                  <span className="text-[9px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded shrink-0">{f.treatmentCDT}</span>
                </div>
              ))}
              {confirmedFindings.filter(f => f.isTreatmentConfirmed).length === 0 && (
                <p className="text-[11px] text-slate-400 italic">No confirmed treatments yet</p>
              )}
            </div>
          )}
        </section>

      </div>

      {/* Generate Note CTA */}
      <div className="px-4 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        {!canGenerate && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {!isComplainsOfVerified && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">C/O unverified</span>}
            {!isHpcVerified && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">HPC unverified</span>}
            {pendingFindings.length > 0 && <span className="text-[9px] font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-full">{pendingFindings.length} pending findings</span>}
            {!medHistoryComplete && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">Med history pending</span>}
            {!socHistoryComplete && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">Social history pending</span>}
            {!tissueExamComplete && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">Tissue exam pending</span>}
            {!hardTissueExamComplete && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">Hard tissue pending</span>}
            {!cancerScreeningComplete && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">Cancer screening pending</span>}
            {!treatmentsAddressed && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">Treatments unaccepted</span>}
          </div>
        )}
        <button
          onClick={onGenerateNote}
          disabled={!canGenerate}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
            canGenerate
              ? 'bg-primary text-white hover:bg-blue-700 shadow-md shadow-primary/20 active:scale-[0.99]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Generating Clinical Note...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Generate Final Clinical Note
            </>
          )}
        </button>
      </div>
    </div>
  );
};
