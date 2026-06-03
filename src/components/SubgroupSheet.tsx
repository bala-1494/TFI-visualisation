import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import type { ProcessedAlumni, SubgroupName } from "../types/Alumni";
import { SUBGROUP_META } from "../constants/subgroups";
import { TIER_COLORS } from "../constants/colors";

interface Props {
  subgroup: SubgroupName | null;
  members: ProcessedAlumni[];
  onClose: () => void;
}

export function SubgroupSheet({ subgroup, members, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const open = subgroup !== null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">{subgroup ? SUBGROUP_META[subgroup].emoji : ""}</span>
            <h2 className="font-semibold text-gray-900">{subgroup}</h2>
            <span
              className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              {members.length} alumni
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Table */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "City", "Company", "Designation", "Social Tier", "Change Maker"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((a, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
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
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="flex items-center gap-1">
                        {a["Full Name"] as string}
                        <span className="inline-block border border-gray-200 text-gray-400 text-xs px-1.5 py-0.5 rounded">
                          No LinkedIn
                        </span>
                      </span>
                    )}
                  </td>

                  {/* City */}
                  <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                    {(a["Current City"] as string) || "—"}
                  </td>

                  {/* Company */}
                  <td className="px-4 py-2.5 text-gray-600 max-w-[150px] truncate">
                    {(a["Current Company"] as string) || "—"}
                  </td>

                  {/* Designation */}
                  <td className="px-4 py-2.5 text-gray-600 max-w-[150px] truncate">
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

          {members.length === 0 && (
            <p className="text-center text-gray-400 py-12">No alumni in this subgroup.</p>
          )}
        </div>
      </div>
    </>
  );
}
