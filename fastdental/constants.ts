
import { Patient, Finding } from './types';

export const SEED_PATIENT: Patient = {
  id: "P001",
  firstName: "Michael",
  lastName: "Chen",
  dob: "1985-07-14",
  visitDate: "2026-02-15"
};

export const INTAKE_CO = "Sensitivity to cold in upper right quadrant for 3 days.";
export const INTAKE_HPC = "Patient reports sharp pain when drinking ice water. Pain lasts 5-10 seconds. No spontaneous pain or lingering throbbing noted.";

export const INITIAL_AI_FINDINGS: Finding[] = [
  {
    id: "F001",
    toothNumber: 14,
    surface: "MO",
    findingType: "Dental Caries",
    description: "Radiolucency on mesio-occlusal surface",
    severity: "Moderate",
    source: "AI",
    status: "Pending",
    confidence: 0.87,
    suggestedCDT: "D2392",
    treatmentPlan: "Resin-based composite - two surfaces, posterior",
    treatmentCDT: "D2392",
    category: 'investigation'
  },
  {
    id: "F002",
    toothNumber: 30,
    surface: "DO",
    findingType: "Dental Caries",
    description: "Deep radiolucency approaching pulp",
    severity: "Severe",
    source: "AI",
    status: "Pending",
    confidence: 0.91,
    suggestedCDT: "D2393",
    treatmentPlan: "Resin-based composite - three surfaces, posterior",
    treatmentCDT: "D2393",
    category: 'investigation'
  }
];

export const CDT_CODES = [
  { code: 'D2391', label: '1 Surface Posterior Composite' },
  { code: 'D2392', label: '2 Surface Posterior Composite' },
  { code: 'D2393', label: '3 Surface Posterior Composite' },
  { code: 'D2394', label: '4+ Surface Posterior Composite' },
  { code: 'D6010', label: 'Surgical Implant' },
  { code: 'D7140', label: 'Extraction, Erupted Tooth' },
  { code: 'D0120', label: 'Periodic Oral Evaluation' },
  { code: 'D0210', label: 'Intraoral - Complete Series' },
  { code: 'D1110', label: 'Prophylaxis - Adult' },
];

export const AUTO_CDT_MAP: Record<number, string> = {
  1: 'D2391',
  2: 'D2392',
  3: 'D2393',
  4: 'D2394'
};

export const FINDING_TYPES = [
  "Dental Caries",
  "Fracture",
  "Periodontal Bone Loss",
  "Periapical Radiolucency",
  "Calculus",
  "Missing Tooth",
  "Existing Restoration",
  "Impacted Tooth"
];

export const TREATMENT_DEFAULTS: Record<string, string> = {
  "Dental Caries": "Resin-based composite restoration",
  "Fracture": "Full coverage crown recommendation",
  "Periodontal Bone Loss": "Scaling and root planing",
  "Periapical Radiolucency": "Endodontic therapy evaluation",
  "Missing Tooth": "Implant or bridge consultation",
  "Calculus": "Dental prophylaxis",
};
