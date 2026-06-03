import { useState } from "react";
import { Users } from "lucide-react";
import { FileUpload } from "./components/FileUpload";
import { QualityBanner } from "./components/QualityBanner";
import type { ProcessedAlumni, QualityReport } from "./types/Alumni";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Geographic Map" },
  { id: "subgroups", label: "Subgroups" },
  { id: "directory", label: "Directory" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [alumni, setAlumni] = useState<ProcessedAlumni[]>([]);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [processedAt, setProcessedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  function handleComplete(data: ProcessedAlumni[], quality: QualityReport) {
    setAlumni(data);
    setQualityReport(quality);
    setProcessedAt(new Date());
  }

  const hasData = alumni.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white rounded-lg p-2">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                TFI Alumni Intelligence Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Teach For India · Alumni Engagement
              </p>
            </div>
          </div>

          {hasData && processedAt && (
            <div className="text-right text-sm">
              <p className="font-semibold text-gray-800">
                {alumni.length.toLocaleString()} alumni loaded
              </p>
              <p className="text-xs text-gray-400">
                Processed {formatDate(processedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Tab bar — only shown after data is loaded */}
        {hasData && (
          <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {!hasData ? (
          /* Upload screen */
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Upload Alumni Data
              </h2>
              <p className="text-gray-500 mt-2 max-w-md">
                Upload a CSV export from your alumni database to generate
                classifications, insights, and visualisations.
              </p>
            </div>
            <FileUpload onComplete={handleComplete} />
          </div>
        ) : (
          /* Post-upload shell */
          <div className="flex flex-col gap-6">
            {qualityReport && <QualityBanner report={qualityReport} />}

            <div className="bg-white border border-gray-200 rounded-xl p-12 flex items-center justify-center text-gray-400 min-h-[400px]">
              <div className="text-center">
                <p className="text-4xl mb-3">🚧</p>
                <p className="font-semibold text-gray-600 text-lg capitalize">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </p>
                <p className="text-sm mt-1">Coming in the next increment</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
