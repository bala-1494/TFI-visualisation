import { useState } from "react";
import { Users } from "lucide-react";
import { FileUpload } from "./components/FileUpload";
import { QualityBanner } from "./components/QualityBanner";
import { SummaryCards } from "./components/SummaryCards";
import { WorldMap } from "./components/WorldMap";
import type { ProcessedAlumni, QualityReport } from "./types/Alumni";

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
  const [activeTab, setActiveTab] = useState("world");

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
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {!hasData ? (
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
          <div className="flex flex-col gap-6">
            {qualityReport && <QualityBanner report={qualityReport} />}

            {/* Tab bar */}
            <div className="flex gap-1 border-b border-gray-200">
              {[
                { id: "world", label: "🌍 World Map" },
                { id: "india", label: "🇮🇳 India Map" },
                { id: "subgroups", label: "👥 Subgroups" },
                { id: "table", label: "📋 Alumni Table" },
              ].map((tab) => (
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

            {/* Tab content */}
            {activeTab === "world" && (
              <div className="flex flex-col gap-4">
                <SummaryCards alumni={alumni} />
                <WorldMap
                  alumni={alumni}
                  onIndiaClick={() => setActiveTab("india")}
                />
              </div>
            )}
            {activeTab === "india" && (
              <p className="text-gray-400 p-8">
                India Map — coming in Increment 3
              </p>
            )}
            {activeTab === "subgroups" && (
              <p className="text-gray-400 p-8">
                Subgroups — coming in Increment 3
              </p>
            )}
            {activeTab === "table" && (
              <p className="text-gray-400 p-8">
                Alumni Table — coming in Increment 4
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
