import { useState, useMemo } from "react";
import { Users } from "lucide-react";
import { FileUpload } from "./components/FileUpload";
import { QualityBanner } from "./components/QualityBanner";
import { MapView } from "./components/MapView";
import { OverviewPage } from "./components/OverviewPage";
import { SubgroupGrid } from "./components/SubgroupGrid";
import { SubgroupDetail } from "./components/SubgroupDetail";
import { FilterBar, DEFAULT_FILTERS } from "./components/FilterBar";
import { AlumniTable } from "./components/AlumniTable";
import type { FilterState } from "./components/FilterBar";
import type { ProcessedAlumni, QualityReport, SubgroupName } from "./types/Alumni";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Map" },
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
  const [selectedSubgroup, setSelectedSubgroup] = useState<SubgroupName | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  function handleComplete(data: ProcessedAlumni[], quality: QualityReport) {
    setAlumni(data);
    setQualityReport(quality);
    setProcessedAt(new Date());
  }

  const filteredAlumni = useMemo(() => {
    return alumni.filter(a => {
      if (filters.socialTier !== "All" && a.socialTier !== filters.socialTier) return false;
      if (filters.changeMakerTier !== "All" && a.changeMakerTier !== filters.changeMakerTier) return false;
      if (filters.subgroup !== "All" &&
          !(a.subgroups as SubgroupName[]).includes(filters.subgroup as SubgroupName)) return false;
      if (filters.country !== "All" && (a["Country"] as string)?.trim() !== filters.country) return false;
      if (filters.city !== "All" && (a["Current City"] as string)?.trim() !== filters.city) return false;
      if (filters.cohortYears.length > 0 &&
          !filters.cohortYears.includes((a["Cohort"] as string)?.trim())) return false;
      return true;
    });
  }, [alumni, filters]);

  const subgroupMembers = useMemo(
    () =>
      selectedSubgroup
        ? alumni.filter((a) => (a.subgroups as SubgroupName[]).includes(selectedSubgroup))
        : [],
    [alumni, selectedSubgroup]
  );

  const hasData = alumni.length > 0;

  function renderTabContent() {
    switch (activeTab) {
      case "overview":
        return <OverviewPage alumni={alumni} />;

      case "map":
        return <MapView alumni={alumni} />;

      case "subgroups":
        return (
          <SubgroupGrid
            alumni={alumni}
            onSubgroupSelect={setSelectedSubgroup}
          />
        );

      case "directory":
        return (
          <div>
            <FilterBar alumni={alumni} filters={filters} onChange={setFilters} />
            <AlumniTable alumni={filteredAlumni} totalCount={alumni.length} />
          </div>
        );
    }
  }

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

        {/* Tab bar */}
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
            {renderTabContent()}
          </div>
        )}
      </main>

      {/* Subgroup detail modal */}
      <SubgroupDetail
        subgroup={selectedSubgroup}
        members={subgroupMembers}
        onClose={() => setSelectedSubgroup(null)}
      />
    </div>
  );
}
