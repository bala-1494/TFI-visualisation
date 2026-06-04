export const SUBGROUP_META = {
  "Education Leader": {
    emoji: "🏫",
    description: "Alumni in the education sector at a leadership level, driving systemic change through their institutions.",
    logic: "Current Sector = 'Education'  AND  Level = 'Leadership'",
  },
  "International Alumni": {
    emoji: "🌍",
    description: "Alumni currently based outside India, representing TFI's global footprint.",
    logic: "Country ≠ 'India'  (and not blank / NA)",
  },
  "Founder / Entrepreneur": {
    emoji: "🚀",
    description: "Alumni who have started or are running their own venture, including self-employed professionals.",
    logic: "Alumni Professional Status contains 'entrepreneur' or 'self-employed'  AND  Current Company is not empty",
  },
  "Policy & Governance": {
    emoji: "🏛️",
    description: "Alumni working in policy, governance, or civic institutions shaping public systems.",
    logic: "Puzzle Piece field contains 'Policy and Governance'",
  },
  "Corporate Professional": {
    emoji: "💼",
    description: "P3 alumni in full-time corporate roles — building financial sustainability while retaining network ties.",
    logic: "Puzzle Piece starts with 'P3'  AND  Alumni Professional Status contains 'employed full-time'",
  },
  "Student / Early Career": {
    emoji: "🎓",
    description: "Alumni currently pursuing higher education or in the first rung of their professional journey.",
    logic: "Alumni Professional Status contains 'student'  OR  Level = 'Entry Level'",
  },
  "Inactive / On Break": {
    emoji: "⏸️",
    description: "Alumni on a career break, between jobs, or not currently active in the workforce.",
    logic: "Alumni Professional Status contains 'in-between', 'on a break', 'career break', 'looking for job', 'homemaker', or 'break'",
  },
} as const;
