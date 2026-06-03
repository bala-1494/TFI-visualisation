import { AlertTriangle } from "lucide-react";
import type { QualityReport } from "../types/Alumni";

interface Props {
  report: QualityReport;
}

export function QualityBanner({ report }: Props) {
  if (!report.qualityWarning) return null;

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-amber-800 text-sm">
      <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
      <p>
        <span className="font-semibold">⚠️ {report.qualityPercent}% of records</span>
        {" "}have missing critical fields (Puzzle Piece, Level, or Status).
        Classifications for these alumni default to{" "}
        <span className="font-medium">Partial Social / Not Yet</span>.
      </p>
    </div>
  );
}
