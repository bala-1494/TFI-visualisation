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

/** Raw row as parsed from CSV — all values are strings. */
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
  // allow arbitrary extra columns from the CSV
  [key: string]: string | SocialTier | ChangeMakerTier | SubgroupName[] | number | boolean;
}

/** Derived computed fields added after classification. */
export interface AlumniComputed {
  socialTier: SocialTier;
  changeMakerTier: ChangeMakerTier;
  subgroups: SubgroupName[];
  changeMakerScore: number;
  hasLinkedIn: boolean;
}

/**
 * ProcessedAlumni intersects RawAlumni (which has the string index sig)
 * with AlumniComputed (typed fields), keeping the index signature in a
 * separate interface so TypeScript doesn't complain about incompatible types.
 */
export interface ProcessedAlumni extends RawAlumni, AlumniComputed {}

export interface QualityReport {
  total: number;
  missingCriticalFields: number;
  qualityWarning: boolean;
  qualityPercent: number;
}
