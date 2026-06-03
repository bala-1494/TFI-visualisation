import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { ProcessedAlumni } from "../types/Alumni";
import type { SocialTier, SubgroupName } from "../types/Alumni";
import { CITY_COORDINATES } from "../constants/cities";
import { TIER_COLORS } from "../constants/colors";
import { SUBGROUP_META } from "../constants/subgroups";

interface Props {
  alumni: ProcessedAlumni[];
}

interface CityData {
  key: string;
  displayName: string;
  count: number;
  dominantTier: SocialTier;
  breakdown: Record<SocialTier, number>;
  topSubgroups: SubgroupName[];
  members: ProcessedAlumni[];
}

interface TooltipData {
  city: string;
  count: number;
  breakdown: Record<SocialTier, number>;
  topSubgroups: SubgroupName[];
  x: number;
  y: number;
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function computeCityData(members: ProcessedAlumni[], key: string): Omit<CityData, "key" | "members"> {
  const count = members.length;
  const displayName = toTitleCase(key);

  const tierCounts: Record<SocialTier, number> = {
    Social: 0,
    "Partial Social": 0,
    "Non-Social": 0,
    Unknown: 0,
  };
  for (const a of members) {
    tierCounts[a.socialTier as SocialTier]++;
  }

  let dominantTier: SocialTier = "Unknown";
  let max = 0;
  for (const [tier, n] of Object.entries(tierCounts) as [SocialTier, number][]) {
    if (n > max) { max = n; dominantTier = tier; }
  }

  const subgroupFreq = new Map<SubgroupName, number>();
  for (const a of members) {
    for (const sg of (a.subgroups as SubgroupName[])) {
      subgroupFreq.set(sg, (subgroupFreq.get(sg) ?? 0) + 1);
    }
  }
  const topSubgroups = [...subgroupFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([sg]) => sg);

  return { displayName, count, dominantTier, breakdown: tierCounts, topSubgroups };
}

export function IndiaMap({ alumni }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const indiaAlumni = alumni.filter(
    (a) => (a["Country"] as string | undefined)?.trim().toLowerCase() === "india"
  );

  const cityMap = new Map<string, ProcessedAlumni[]>();
  indiaAlumni.forEach((a) => {
    const city = (a["Current City"] as string | undefined)?.trim().toLowerCase() ?? "";
    if (!city || city === "na") return;
    cityMap.set(city, [...(cityMap.get(city) ?? []), a]);
  });

  const mappedCities: CityData[] = [];
  const unmappedCities: CityData[] = [];

  cityMap.forEach((members, key) => {
    const data: CityData = { key, members, ...computeCityData(members, key) };
    if (CITY_COORDINATES[key]) {
      mappedCities.push(data);
    } else {
      unmappedCities.push(data);
    }
  });

  unmappedCities.sort((a, b) => b.count - a.count);

  const tierLabels: [SocialTier, string][] = [
    ["Social", "🟢"],
    ["Partial Social", "🟡"],
    ["Non-Social", "🔴"],
    ["Unknown", "⚪"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82, 22], scale: 1000 }}
          width={800}
          height={600}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }) =>
              geographies
                .filter((d) => d.properties.name === "India")
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                  />
                ))
            }
          </Geographies>

          {mappedCities.map((city) => {
            const [lat, lng] = CITY_COORDINATES[city.key];
            const r = Math.min(Math.max(Math.sqrt(city.count) * 5, 6), 50);
            return (
              <Marker key={city.key} coordinates={[lng, lat]}>
                <circle
                  r={r}
                  fill={TIER_COLORS[city.dominantTier]}
                  fillOpacity={0.75}
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    setTooltip({
                      city: city.key,
                      count: city.count,
                      breakdown: city.breakdown,
                      topSubgroups: city.topSubgroups,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
                <text
                  textAnchor="middle"
                  y={-r - 4}
                  fontSize={10}
                  fill="#374151"
                  style={{ pointerEvents: "none" }}
                >
                  {city.displayName} ({city.count})
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {tierLabels.map(([tier, emoji]) => (
          <span key={tier} className="flex items-center gap-1">
            {emoji} {tier}
          </span>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          Bubble size reflects alumni count · Only Indian alumni shown
        </span>
      </div>

      {/* Unmapped cities */}
      {unmappedCities.length > 0 && (
        <details className="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 select-none">
            Other cities not plotted ({unmappedCities.length})
          </summary>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">City</th>
                <th className="pb-2 font-medium">Count</th>
                <th className="pb-2 font-medium">Dominant Tier</th>
              </tr>
            </thead>
            <tbody>
              {unmappedCities.map((city) => (
                <tr key={city.key} className="border-b border-gray-50">
                  <td className="py-1.5">{city.displayName}</td>
                  <td className="py-1.5">{city.count}</td>
                  <td className="py-1.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: TIER_COLORS[city.dominantTier] }}
                    >
                      {city.dominantTier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm pointer-events-none"
          style={{ top: tooltip.y + 12, left: tooltip.x + 12, minWidth: 220 }}
        >
          <p className="font-semibold text-gray-800 mb-1">{toTitleCase(tooltip.city)}</p>
          <p className="text-gray-500 mb-2">Total: {tooltip.count} alumni</p>
          <div className="space-y-0.5 mb-2">
            <p>🟢 Social: {tooltip.breakdown.Social}</p>
            <p>🟡 Partial: {tooltip.breakdown["Partial Social"]}</p>
            <p>🔴 Non-Social: {tooltip.breakdown["Non-Social"]}</p>
          </div>
          {tooltip.topSubgroups.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Top groups:</p>
              {tooltip.topSubgroups.map((sg) => (
                <p key={sg} className="text-xs">
                  {SUBGROUP_META[sg].emoji} {sg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
