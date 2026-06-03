// Placeholder for the visualisation panel.
// Charts will be wired in once the data format is finalised.
import { BarChart2 } from "lucide-react";

export function ChartPlaceholder() {
  return (
    <div className="chart-placeholder">
      <BarChart2 size={64} strokeWidth={1} />
      <p>Visualisation will appear here once the data format is defined.</p>
    </div>
  );
}
