export type Severity = 'Incipient' | 'Moderate' | 'Severe';
export type FindingStatus = 'Pending' | 'Confirmed' | 'Deleted';
export type FindingSource = 'AI' | 'Manual';
export type FindingCategory = 'charting' | 'investigation';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  visitDate: string;
}

export interface Finding {
  id: string;
  toothNumber: number | 'General';
  surface: string;
  findingType: string;
  description: string;
  severity: Severity;
  source: FindingSource;
  status: FindingStatus;
  confidence: number;
  suggestedCDT: string;
  isOverride?: boolean;
  treatmentPlan?: string;
  treatmentCDT?: string;
  isTreatmentConfirmed?: boolean;
  category?: FindingCategory;
}

export type AppStatus = 'loading' | 'drafting' | 'finalized' | 'exported' | 'error';

export interface AppState {
  patient: Patient;
  findings: Finding[];
  selectedTooth: number | null;
  showAIOverlay: boolean;
  isDarkMode: boolean;
  status: AppStatus;
  complainsOf: string;
  isComplainsOfVerified: boolean;
  hpc: string;
  isHpcVerified: boolean;
  medicalHistory: {
    status: 'pending' | 'unchanged' | 'edited';
    notes: string;
  };
  socialHistory: {
    status: 'pending' | 'unchanged' | 'edited';
    notes: string;
  };
  tissueExam: {
    status: 'pending' | 'normal' | 'abnormal';
    notes: string;
  };
  hardTissueExam: {
    status: 'pending' | 'normal' | 'abnormal';
    notes: string;
  };
  cancerScreening: {
    status: 'pending' | 'wnl' | 'abnormal';
    notes: string;
  };
  finalNote: string;
}