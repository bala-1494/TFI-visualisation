import type { RawAlumni, ChangeMakerTier } from "../types/Alumni";

export function computeChangeMakerScore(alumni: RawAlumni): {
  score: number;
  tier: ChangeMakerTier;
} {
  const status = alumni["Alumni Professional Status"]?.trim().toLowerCase();
  const level = alumni["Level"]?.trim().toLowerCase();
  const puzzle = alumni["Puzzle Piece"]?.trim();

  const isEntrepreneur =
    status?.includes("entrepreneur") ||
    status?.includes("self-employed") ||
    status?.includes("self employed");

  if (isEntrepreneur) return { score: 99, tier: "Change Maker" };

  let levelScore = 0;
  if (level === "leadership") levelScore = 3;
  else if (level === "middle management") levelScore = 2;
  else if (level === "consultant") levelScore = 1;
  else if (level === "entry level") levelScore = 1;

  let statusScore = 0;
  if (status?.includes("freelance") || status?.includes("freelancer")) {
    statusScore = 1;
  }

  let puzzleScore = 0;
  if (puzzle?.startsWith("P1")) puzzleScore = 2;
  else if (puzzle?.startsWith("P2")) puzzleScore = 1;

  const total = levelScore + statusScore + puzzleScore;
  let tier: ChangeMakerTier;
  if (total >= 5) tier = "Change Maker";
  else if (total >= 2) tier = "Emerging Contributor";
  else tier = "Not Yet";

  return { score: total, tier };
}
