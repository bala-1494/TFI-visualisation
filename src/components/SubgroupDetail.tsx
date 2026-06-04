import { useEffect } from "react";
import { ExternalLink, X, Info, GitBranch } from "lucide-react";
import type { ProcessedAlumni, SubgroupName } from "../types/Alumni";
import { SUBGROUP_META } from "../constants/subgroups";
import { TIER_COLORS } from "../constants/colors";

interface Props {
  subgroup: SubgroupName | null;
  members: ProcessedAlumni[];
  onClose: () => void;
}

export function SubgroupDetail({ subgroup, members, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const open = subgroup !== null;
  if (!open) return null;

  const meta = SUBGROUP_META[subgroup];

  const cmCount = members.filter((a) => a.changeMakerTier === "Change Maker").length;
  const ecCount = members.filter((a) => a.changeMakerTier === "Emerging Contributor").length;
  const nyCount = members.filter((a) => a.changeMakerTier === "Not Yet").length;
  const total = members.length || 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-8 lg:inset-12 bg-white z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{subgroup}</h2>
              <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full mt-0.5">
                {members.length} alumni
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mt-0.5"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* About section */}
          <div className="px-6 py-5 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Description */}
            <div className="bg-indigo-50 rounded-xl p-4 flex gap-3">
              <Info size={18} className="text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">About this group</p>
                <p className="text-sm text-gray-700 leading-relaxed">{meta.description}</p>
              </div>
            </div>

            {/* Classification logic */}
            <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
              <GitBranch size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">How members are identified</p>
                <p className="text-sm text-gray-700 font-mono leading-relaxed">{meta.logic}</p>
              </div>
            </div>
          </div>

          {/* Change Maker breakdown bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Change Maker breakdown</p>
            <div className="w-full h-2.5 rounded-full overflow-hidden flex mb-2">
              <div style={{ width: `${(cmCount / total) * 100}%`, backgroundColor: TIER_COLORS["Change Maker"] }} />
              <div style={{ width: `${(ecCount / total) * 100}%`, backgroundColor: TIER_COLORS["Emerging Contributor"] }} />
              <div style={{ width: `${(nyCount / total) * 100}%`, backgroundColor: TIER_COLORS["Not Yet"] }} />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: TIER_COLORS["Change Maker"] }} />
                Change Makers: <strong className="text-gray-800 ml-0.5">{cmCount}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: TIER_COLORS["Emerging Contributor"] }} />
                Emerging: <strong className="text-gray-800 ml-0.5">{ecCount}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: TIER_COLORS["Not Yet"] }} />
                Not Yet: <strong className="text-gray-800 ml-0.5">{nyCount}</strong>
              </span>
            </div>
          </div>

          {/* Members table */}
          <div>
            <div className="px-6 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">All Members</p>
            </div>
            {members.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No alumni in this subgroup.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#", "Name", "Cohort", "City", "Company", "Designation", "Social Tier", "Change Maker"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((a, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* Row number */}
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>

                      {/* Name */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {(a.hasLinkedIn as boolean) ? (
                          <a
                            href={a["Social Media: LinkedIn"] as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            {a["Full Name"] as string}
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-gray-800">{a["Full Name"] as string}</span>
                        )}
                      </td>

                      {/* Cohort */}
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                        {(a["Cohort"] as string) || "—"}
                      </td>

                      {/* City */}
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                        {(a["Current City"] as string) || "—"}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-2.5 text-gray-600 max-w-[160px] truncate">
                        {(a["Current Company"] as string) || "—"}
                      </td>

                      {/* Designation */}
                      <td className="px-4 py-2.5 text-gray-600 max-w-[160px] truncate">
                        {(a["Designation"] as string) || "—"}
                      </td>

                      {/* Social Tier */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                          style={{ backgroundColor: TIER_COLORS[a.socialTier] }}
                        >
                          {a.socialTier}
                        </span>
                      </td>

                      {/* Change Maker */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                          style={{ backgroundColor: TIER_COLORS[a.changeMakerTier] }}
                        >
                          {a.changeMakerTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
