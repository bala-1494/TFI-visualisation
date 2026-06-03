export type SocialTier =
  | "Social"
  | "Partial Social"
  | "Non-Social"
  | "Unknown";

export type ChangeMakerTier =
  | "Change Maker"
  | "Emerging Contributor"
  | "Not Yet";

export type SubgroupName =
  | "Education Leader"
  | "International Alumni"
  | "Founder / Entrepreneur"
  | "Policy & Governance"
  | "Corporate Professional"
  | "Student / Early Career"
  | "Inactive / On Break";

// All possible value types across both Raw and Processed alumni
type AlumniValue =
  | string
  | SocialTier
  | ChangeMakerTier
  | SubgroupName[]
  | number
  | boolean
  | undefined;

export interface RawAlumni {
  "Full Name": string;
  "Most Active Email": string;
  "Cohort": string;
  "Placement City": string;
  "Current City": string;
  "State": string;
  "Country": string;
  "Alumni Professional Status": string;
  "Current Company": string;
  "Puzzle Piece": string;
  "Designation": string;
  "Level": string;
  "Current Sector": string;
  "Social Media: LinkedIn": string;
  "Gender": string;
  "Age": string;
  [key: string]: AlumniValue;
}

export interface ProcessedAlumni extends RawAlumni {
  socialTier: SocialTier;
  changeMakerTier: ChangeMakerTier;
  subgroups: SubgroupName[];
  changeMakerScore: number;
  hasLinkedIn: boolean;
}

export interface QualityReport {
  total: number;
  missingCriticalFields: number;
  qualityWarning: boolean;
  qualityPercent: number;
}
