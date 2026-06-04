import { useState } from "react";
import type { ProcessedAlumni, SubgroupName } from "../types/Alumni";
import { SUBGROUP_META } from "../constants/subgroups";
import { TIER_COLORS } from "../constants/colors";

interface Props {
  alumni: ProcessedAlumni[];
  onSubgroupSelect: (sg: SubgroupName) => void;
}

export function SubgroupGrid({ alumni, onSubgroupSelect }: Props) {
  const [hovered, setHovered] = useState<SubgroupName | null>(null);

  const subgroups = Object.keys(SUBGROUP_META) as SubgroupName[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {subgroups.map((key) => {
        const meta = SUBGROUP_META[key];
        const members = alumni.filter((a) =>
          (a.subgroups as SubgroupName[]).includes(key)
        );
        const count = members.length;
        const percent = alumni.length > 0
          ? ((count / alumni.length) * 100).toFixed(1)
          : "0.0";

        // Top 3 orgs
        const orgFreq = new Map<string, number>();
        for (const a of members) {
          const org = (a["Current Company"] as string | undefined)?.trim() ?? "";
          if (!org || org === "NA" || org === "na" || org === "N/A" || org === "") continue;
          orgFreq.set(org, (orgFreq.get(org) ?? 0) + 1);
        }
        const top3Orgs = [...orgFreq.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([org]) => org);

        // Change maker breakdown
        const cmCount = members.filter((a) => a.changeMakerTier === "Change Maker").length;
        const ecCount = members.filter((a) => a.changeMakerTier === "Emerging Contributor").length;
        const nyCount = members.filter((a) => a.changeMakerTier === "Not Yet").length;
        const total = cmCount + ecCount + nyCount || 1;
        const cmPct = (cmCount / total) * 100;
        const ecPct = (ecCount / total) * 100;
        const nyPct = (nyCount / total) * 100;

        const isHovered = hovered === key;

        return (
          <div
            key={key}
            onClick={() => onSubgroupSelect(key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className={`bg-white border rounded-xl p-5 cursor-pointer transition-all select-none
              ${isHovered
                ? "border-indigo-300 shadow-md"
                : "border-gray-200 shadow-sm"
              }`}
          >
            {/* Header */}
            <div className="flex items-start gap-2 mb-3">
              <span className="text-2xl">{meta.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{key}</p>
                <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
              </div>
            </div>

            {/* Count */}
            <div className="mb-3">
              <span className="text-3xl font-bold text-gray-900">{count}</span>
              <span className="text-sm text-gray-400 ml-2">{percent}% of total</span>
            </div>

            {/* Top orgs */}
            {top3Orgs.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {top3Orgs.map((org) => (
                  <span
                    key={org}
                    className="inline-block bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5 truncate max-w-[140px]"
                    title={org}
                  >
                    {org.length > 20 ? org.slice(0, 20) + "…" : org}
                  </span>
                ))}
              </div>
            )}

            {/* Stacked bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-1">
              <div style={{ width: `${cmPct}%`, backgroundColor: TIER_COLORS["Change Maker"] }} />
              <div style={{ width: `${ecPct}%`, backgroundColor: TIER_COLORS["Emerging Contributor"] }} />
              <div style={{ width: `${nyPct}%`, backgroundColor: TIER_COLORS["Not Yet"] }} />
            </div>
            <p className="text-xs text-gray-400">
              {cmCount} Change Makers · {ecCount} Emerging · {nyCount} Not Yet
            </p>
          </div>
        );
      })}
    </div>
  );
}
