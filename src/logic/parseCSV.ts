import Papa from "papaparse";
import type { RawAlumni, ProcessedAlumni, QualityReport } from "../types/Alumni";
import { classifySocialTier } from "./classifySocialTier";
import { computeChangeMakerScore } from "./computeChangeMakerScore";
import { classifySubgroups } from "./classifySubgroups";

const REQUIRED_COLUMNS = [
  "Full Name",
  "Cohort",
  "Country",
  "Alumni Professional Status",
  "Puzzle Piece",
  "Level",
  "Current Sector",
];

export function parseAndProcessCSV(
  file: File,
  onComplete: (data: ProcessedAlumni[], quality: QualityReport) => void,
  onError: (error: string) => void
) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    complete: (results) => {
      const headers = Object.keys(results.data[0] || {});
      const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));

      if (missing.length > 0) {
        onError(`Missing required columns: ${missing.join(", ")}`);
        return;
      }

      const raw = results.data as RawAlumni[];
      let missingCriticalCount = 0;

      const processed: ProcessedAlumni[] = raw.map((row) => {
        row["Cohort"] = String(row["Cohort"] || "").trim();
        row["Current City"] = String(row["Current City"] || "").trim();

        const hasMissing =
          !row["Puzzle Piece"] ||
          !row["Level"] ||
          !row["Alumni Professional Status"];
        if (hasMissing) missingCriticalCount++;

        const socialTier = classifySocialTier(row);
        const { score, tier: changeMakerTier } = computeChangeMakerScore(row);
        const subgroups = classifySubgroups(row);

        const linkedInRaw = row["Social Media: LinkedIn"]?.trim() ?? "";
        const hasLinkedIn =
          linkedInRaw !== "" && linkedInRaw.toLowerCase() !== "na";

        let linkedInUrl = linkedInRaw;
        if (hasLinkedIn && !linkedInUrl.startsWith("http")) {
          linkedInUrl = "https://" + linkedInUrl;
        }
        row["Social Media: LinkedIn"] = linkedInUrl;

        return {
          ...row,
          socialTier,
          changeMakerTier,
          subgroups,
          changeMakerScore: score,
          hasLinkedIn,
        };
      });

      const qualityPercent = Math.round(
        (missingCriticalCount / raw.length) * 100
      );

      onComplete(processed, {
        total: raw.length,
        missingCriticalFields: missingCriticalCount,
        qualityWarning: qualityPercent > 20,
        qualityPercent,
      });
    },
    error: (err) => onError(err.message),
  });
}
