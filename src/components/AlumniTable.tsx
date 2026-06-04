import { useState, useMemo, useEffect } from "react";
import { ExternalLink, Download } from "lucide-react";
import type { ProcessedAlumni, SubgroupName } from "../types/Alumni";
import { TIER_COLORS } from "../constants/colors";
import { SUBGROUP_META } from "../constants/subgroups";
import { exportToCSV } from "../logic/exportCSV";

interface Props {
  alumni: ProcessedAlumni[];
  totalCount: number;
}

const PAGE_SIZE = 25;

const COLUMNS: { label: string; key: string; sortable: boolean }[] = [
  { label: "Name", key: "Full Name", sortable: true },
  { label: "Cohort", key: "Cohort", sortable: true },
  { label: "City", key: "Current City", sortable: true },
  { label: "Country", key: "Country", sortable: true },
  { label: "Company", key: "Current Company", sortable: true },
  { label: "Designation", key: "Designation", sortable: true },
  { label: "Social Tier", key: "socialTier", sortable: true },
  { label: "Change Maker", key: "changeMakerTier", sortable: true },
  { label: "Subgroups", key: "subgroups", sortable: false },
];

function Tooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute z-50 bottom-full left-0 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap max-w-xs">
          {tip}
        </span>
      )}
    </span>
  );
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function AlumniTable({ alumni, totalCount }: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("Full Name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => setPage(1), [alumni]);

  const sorted = useMemo(() => {
    return [...alumni].sort((a, b) => {
      const aVal = String(a[sortKey] ?? "").toLowerCase();
      const bVal = String(b[sortKey] ?? "").toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [alumni, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, sorted.length);

  function sortIcon(key: string) {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-indigo-600 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      {/* Header row: count + export */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          Showing {start}–{end} of {alumni.length} alumni
          {alumni.length < totalCount && (
            <span className="text-gray-400"> (filtered from {totalCount} total)</span>
          )}
        </p>
        <button
          onClick={() => exportToCSV(alumni)}
          className="flex items-center gap-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap
                    ${col.sortable ? "cursor-pointer hover:bg-gray-100 select-none" : ""}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-gray-400">
                  No alumni match the current filters.
                </td>
              </tr>
            )}
            {pageData.map((row, i) => {
              const name = row["Full Name"] as string;
              const linkedin = row["Social Media: LinkedIn"] as string;
              const cohort = row["Cohort"] as string;
              const city = row["Current City"] as string;
              const country = row["Country"] as string;
              const company = row["Current Company"] as string;
              const designation = row["Designation"] as string;
              const subs = row.subgroups as SubgroupName[];

              return (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.hasLinkedIn ? (
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {name} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="flex items-center gap-1">
                        {name}
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1">
                          No LinkedIn
                        </span>
                      </span>
                    )}
                  </td>

                  {/* Cohort */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{cohort}</td>

                  {/* City */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{city}</td>

                  {/* Country */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{country}</td>

                  {/* Company */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {company.length > 25 ? (
                      <Tooltip tip={company}>
                        <span>{truncate(company, 25)}</span>
                      </Tooltip>
                    ) : (
                      <span>{company}</span>
                    )}
                  </td>

                  {/* Designation */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {designation.length > 25 ? (
                      <Tooltip tip={designation}>
                        <span>{truncate(designation, 25)}</span>
                      </Tooltip>
                    ) : (
                      <span>{designation}</span>
                    )}
                  </td>

                  {/* Social Tier */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: TIER_COLORS[row.socialTier] }}
                    >
                      {row.socialTier}
                    </span>
                  </td>

                  {/* Change Maker */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: TIER_COLORS[row.changeMakerTier] }}
                    >
                      {row.changeMakerTier}
                    </span>
                  </td>

                  {/* Subgroups */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {subs.slice(0, 2).map(s => (
                        <span
                          key={s}
                          className="text-xs border border-gray-200 rounded-full px-2 py-0.5 text-gray-600"
                        >
                          {SUBGROUP_META[s].emoji} {s}
                        </span>
                      ))}
                      {subs.length > 2 && (
                        <Tooltip tip={subs.slice(2).map(s => `${SUBGROUP_META[s].emoji} ${s}`).join(", ")}>
                          <span className="text-xs border border-gray-200 rounded-full px-2 py-0.5 text-gray-500 cursor-default">
                            +{subs.length - 2} more
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
