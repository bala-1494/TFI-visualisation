import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ProcessedAlumni } from "../types/Alumni";
import { SUBGROUP_META } from "../constants/subgroups";
import type { SubgroupName } from "../types/Alumni";

interface Props {
  alumni: ProcessedAlumni[];
}

const SOCIAL_COLORS: Record<string, string> = {
  Social: "#16a34a",
  "Partial Social": "#d97706",
  "Non-Social": "#dc2626",
  Unknown: "#9ca3af",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function OverviewPage({ alumni }: Props) {
  const total = alumni.length;

  // Cohort breakdown
  const cohortData = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of alumni) {
      const c = (a["Cohort"] as string)?.trim() || "Unknown";
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([cohort, count]) => ({ cohort, count }))
      .sort((a, b) => a.cohort.localeCompare(b.cohort));
  }, [alumni]);

  // City breakdown (top 15)
  const cityData = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of alumni) {
      const c = (a["Current City"] as string)?.trim() || "Unknown";
      if (c.toLowerCase() === "na" || c === "") continue;
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [alumni]);

  // Social tier breakdown
  const socialBreakdown = useMemo(() => {
    const map: Record<string, number> = { Social: 0, "Partial Social": 0, "Non-Social": 0, Unknown: 0 };
    for (const a of alumni) map[a.socialTier] = (map[a.socialTier] ?? 0) + 1;
    return Object.entries(map).map(([tier, count]) => ({ tier, count }));
  }, [alumni]);

  // Subgroup counts
  const subgroupCounts = useMemo(() => {
    const subgroups = Object.keys(SUBGROUP_META) as SubgroupName[];
    return subgroups.map((key) => {
      const count = alumni.filter((a) => (a.subgroups as SubgroupName[]).includes(key)).length;
      return { key, count, meta: SUBGROUP_META[key] };
    });
  }, [alumni]);

  // Quick stats
  const internationalCount = alumni.filter((a) => (a["Country"] as string)?.trim().toLowerCase() !== "india").length;
  const linkedInCount = alumni.filter((a) => a.hasLinkedIn).length;
  const changeMakerCount = alumni.filter((a) => a.changeMakerTier === "Change Maker").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Alumni" value={total.toLocaleString()} />
        <StatCard label="Change Makers" value={changeMakerCount} sub={`${((changeMakerCount / total) * 100).toFixed(1)}% of total`} />
        <StatCard label="International" value={internationalCount} sub="Based outside India" />
        <StatCard label="LinkedIn Connected" value={linkedInCount} sub={`${((linkedInCount / total) * 100).toFixed(1)}% of total`} />
      </div>

      {/* Social tier bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Social Impact Breakdown</p>
        <div className="w-full h-3 rounded-full overflow-hidden flex mb-3">
          {socialBreakdown.map(({ tier, count }) => (
            <div
              key={tier}
              style={{ width: `${(count / total) * 100}%`, backgroundColor: SOCIAL_COLORS[tier] }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {socialBreakdown.map(({ tier, count }) => (
            <span key={tier} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: SOCIAL_COLORS[tier] }} />
              <span className="text-gray-600">{tier}:</span>
              <span className="font-semibold text-gray-900">{count}</span>
              <span className="text-gray-400">({((count / total) * 100).toFixed(1)}%)</span>
            </span>
          ))}
        </div>
      </div>

      {/* Subgroup counts */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Alumni Sub-Groups</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {subgroupCounts.map(({ key, count, meta }) => (
            <div key={key} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-2xl mb-1">{meta.emoji}</span>
              <span className="text-2xl font-bold text-gray-900">{count}</span>
              <span className="text-xs text-gray-500 mt-0.5 leading-tight">{key}</span>
              <span className="text-xs text-gray-400 mt-0.5">{((count / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort & City charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Alumni by Cohort</p>
          {cohortData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cohortData} margin={{ top: 0, right: 8, left: -20, bottom: 40 }}>
                <XAxis
                  dataKey="cohort"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [v, "Alumni"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No cohort data</p>
          )}
        </div>

        {/* City chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Top Cities</p>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cityData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={60} />
                <Tooltip
                  formatter={(v) => [v, "Alumni"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {cityData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#6366f1" : i === 1 ? "#818cf8" : "#a5b4fc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No city data</p>
          )}
        </div>
      </div>
    </div>
  );
}
