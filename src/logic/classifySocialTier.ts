import type { RawAlumni, SocialTier } from "../types/Alumni";

export function classifySocialTier(alumni: RawAlumni): SocialTier {
  const sector = alumni["Current Sector"]?.trim().toLowerCase();
  const puzzle = alumni["Puzzle Piece"]?.trim();

  const sectorSignal: "Social" | "Ambiguous" =
    sector === "education" || sector === "social/development (non-ed)"
      ? "Social"
      : "Ambiguous";

  let puzzleSignal: "Social" | "Partial" | "Non-Social" | "Unknown";
  if (!puzzle || puzzle.toLowerCase() === "not applicable" || puzzle === "") {
    puzzleSignal = "Unknown";
  } else if (puzzle.startsWith("P1")) {
    puzzleSignal = "Social";
  } else if (puzzle.startsWith("P2")) {
    puzzleSignal = "Partial";
  } else if (puzzle.startsWith("P3")) {
    puzzleSignal = "Non-Social";
  } else {
    puzzleSignal = "Unknown";
  }

  if (puzzleSignal === "Non-Social") return "Non-Social";
  if (sectorSignal === "Social" && puzzleSignal === "Social") return "Social";
  if (puzzleSignal === "Partial") return "Partial Social";
  if (puzzleSignal === "Unknown" && sectorSignal === "Ambiguous")
    return "Unknown";
  return "Partial Social";
}
