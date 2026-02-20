import { Finding, Patient, AppState } from "../types";

// Mock clinical note generator — no API key required
export const generateClinicalNote = async (
  patient: Patient,
  findings: Finding[],
  complainsOf: string,
  hpc: string,
  medHistory: AppState['medicalHistory'],
  socHistory: AppState['socialHistory'],
  tissue: AppState['tissueExam'],
  hardTissue: AppState['hardTissueExam'],
  cancer: AppState['cancerScreening']
): Promise<string> => {
  await new Promise(res => setTimeout(res, 800));

  const confirmedFindings = findings.filter(f => f.status === 'Confirmed');
  const manualFindings = confirmedFindings.filter(f => f.category === 'charting' || (!f.category && f.source === 'Manual'));
  const investigationFindings = confirmedFindings.filter(f => f.category === 'investigation' || (!f.category && f.source === 'AI'));
  const treatmentPlans = confirmedFindings
    .filter(f => f.isTreatmentConfirmed)
    .map(f => `Tooth #${f.toothNumber}: ${f.treatmentPlan} (CDT: ${f.treatmentCDT})`);

  let investigationsText = 'No radiographic or clinical findings recorded.';
  if (investigationFindings.length > 0) {
    const radioFindings = investigationFindings.filter(f => f.source === 'AI');
    const clinicalFindings = investigationFindings.filter(f => f.source === 'Manual');
    const parts: string[] = [];
    if (radioFindings.length > 0) {
      const desc = radioFindings.map(f => `${f.findingType} on Tooth #${f.toothNumber} (${f.surface}) — ${f.description}`).join('; ');
      parts.push(`Radiographic examination reveals: ${desc}.`);
    }
    if (clinicalFindings.length > 0) {
      const desc = clinicalFindings.map(f => `${f.findingType} on Tooth #${f.toothNumber} (${f.surface}) — ${f.description}`).join('; ');
      parts.push(`Clinical observation reveals: ${desc}.`);
    }
    investigationsText = parts.join(' ');
  }

  const hardTissueText = hardTissue.status === 'normal'
    ? 'Nothing abnormal detected.'
    : manualFindings.length > 0
      ? manualFindings.map(f => `Tooth #${f.toothNumber} ${f.findingType} on ${f.surface}.`).join(' ')
      : hardTissue.notes || 'WNL.';

  const note = [
    `C/O: ${complainsOf || 'No specific complaints reported.'}`,
    `HPC: ${hpc || 'No history of present complaint.'}`,
    `MH: ${medHistory.status === 'unchanged' ? 'Reviewed, no changes.' : medHistory.notes || 'Reviewed.'}`,
    `SH: ${socHistory.status === 'unchanged' ? 'Reviewed, no changes.' : socHistory.notes || 'Reviewed.'}`,
    `DH: Regular attender, last checkup ${patient.visitDate}.`,
    `Soft Tissue Exam: ${tissue.status === 'normal' ? 'Nothing abnormal detected.' : tissue.notes || 'Reviewed.'}`,
    `Cancer Screening: ${cancer.status === 'wnl' ? 'Nothing abnormal detected.' : cancer.notes || 'Reviewed.'}`,
    `Hard Tissue Exam: ${hardTissueText}`,
    `Investigations & Findings: ${investigationsText}`,
    `Treatment Plan: ${treatmentPlans.length > 0 ? treatmentPlans.join('; ') : 'No treatment required at this time.'}`,
  ].join('\n\n');

  return note;
};
