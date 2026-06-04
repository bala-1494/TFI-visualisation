import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { ProcessedAlumni } from "../types/Alumni";
import type { SocialTier, SubgroupName } from "../types/Alumni";
import { CITY_COORDINATES } from "../constants/cities";
import { TIER_COLORS } from "../constants/colors";
import { SUBGROUP_META } from "../constants/subgroups";

const WORLD_TOPO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
  alumni: ProcessedAlumni[];
}

interface TooltipData {
  label: string;
  count: number;
  breakdown: Record<SocialTier, number>;
  topSubgroups: SubgroupName[];
  x: number;
  y: number;
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function emptyBreakdown(): Record<SocialTier, number> {
  return { Social: 0, "Partial Social": 0, "Non-Social": 0, Unknown: 0 };
}

function computeBreakdown(members: ProcessedAlumni[]) {
  const bd = emptyBreakdown();
  for (const a of members) bd[a.socialTier as SocialTier]++;
  return bd;
}

function dominantTier(bd: Record<SocialTier, number>): SocialTier {
  let max = 0;
  let tier: SocialTier = "Unknown";
  for (const [t, n] of Object.entries(bd) as [SocialTier, number][]) {
    if (n > max) { max = n; tier = t; }
  }
  return tier;
}

function topSubgroups(members: ProcessedAlumni[]): SubgroupName[] {
  const freq = new Map<SubgroupName, number>();
  for (const a of members) {
    for (const sg of (a.subgroups as SubgroupName[])) {
      freq.set(sg, (freq.get(sg) ?? 0) + 1);
    }
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([sg]) => sg);
}

const TIER_LABELS: [SocialTier, string][] = [
  ["Social", "🟢"],
  ["Partial Social", "🟡"],
  ["Non-Social", "🔴"],
  ["Unknown", "⚪"],
];

/* ── India map ── */
function IndiaView({ alumni }: { alumni: ProcessedAlumni[] }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const indiaAlumni = alumni.filter(
    (a) => (a["Country"] as string | undefined)?.trim().toLowerCase() === "india"
  );

  const cityMap = new Map<string, ProcessedAlumni[]>();
  for (const a of indiaAlumni) {
    const city = (a["Current City"] as string | undefined)?.trim().toLowerCase() ?? "";
    if (!city || city === "na") continue;
    cityMap.set(city, [...(cityMap.get(city) ?? []), a]);
  }

  const mappedCities: { key: string; members: ProcessedAlumni[] }[] = [];
  const unmappedCities: { key: string; members: ProcessedAlumni[] }[] = [];

  cityMap.forEach((members, key) => {
    if (CITY_COORDINATES[key]) mappedCities.push({ key, members });
    else unmappedCities.push({ key, members });
  });
  unmappedCities.sort((a, b) => b.members.length - a.members.length);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82, 22], scale: 1000 }}
          width={800}
          height={600}
        >
          <Geographies geography={WORLD_TOPO}>
            {({ geographies }) =>
              geographies
                .filter((d) => d.properties.name === "India")
                .map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} fill="#f3f4f6" stroke="#d1d5db" strokeWidth={0.5} />
                ))
            }
          </Geographies>

          {mappedCities.map(({ key, members }) => {
            const [lat, lng] = CITY_COORDINATES[key];
            const r = Math.min(Math.max(Math.sqrt(members.length) * 5, 6), 50);
            const bd = computeBreakdown(members);
            const dt = dominantTier(bd);
            return (
              <Marker key={key} coordinates={[lng, lat]}>
                <circle
                  r={r}
                  fill={TIER_COLORS[dt]}
                  fillOpacity={0.75}
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    setTooltip({ label: key, count: members.length, breakdown: bd, topSubgroups: topSubgroups(members), x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
                <text textAnchor="middle" y={-r - 4} fontSize={10} fill="#374151" style={{ pointerEvents: "none" }}>
                  {toTitleCase(key)} ({members.length})
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {TIER_LABELS.map(([tier, emoji]) => (
          <span key={tier} className="flex items-center gap-1">{emoji} {tier}</span>
        ))}
        <span className="ml-auto text-xs text-gray-400">Bubble size reflects alumni count · India alumni only</span>
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
              {unmappedCities.map(({ key, members }) => {
                const bd = computeBreakdown(members);
                const dt = dominantTier(bd);
                return (
                  <tr key={key} className="border-b border-gray-50">
                    <td className="py-1.5">{toTitleCase(key)}</td>
                    <td className="py-1.5">{members.length}</td>
                    <td className="py-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: TIER_COLORS[dt] }}>
                        {dt}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
          <p className="font-semibold text-gray-800 mb-1">{toTitleCase(tooltip.label)}</p>
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
                <p key={sg} className="text-xs">{SUBGROUP_META[sg].emoji} {sg}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── World map (drill-down to India) ── */
function WorldView({ alumni, onDrillIndia }: { alumni: ProcessedAlumni[]; onDrillIndia: () => void }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Build country-level aggregation
  const countryMap = new Map<string, ProcessedAlumni[]>();
  for (const a of alumni) {
    const country = (a["Country"] as string | undefined)?.trim() || "Unknown";
    if (!country || country.toLowerCase() === "na") continue;
    countryMap.set(country, [...(countryMap.get(country) ?? []), a]);
  }

  // Country centroids for major countries (rough lat/lng)
  const COUNTRY_COORDS: Record<string, [number, number]> = {
    India: [20.5937, 78.9629],
    USA: [37.0902, -95.7129],
    "United States": [37.0902, -95.7129],
    "United States of America": [37.0902, -95.7129],
    UK: [55.3781, -3.4360],
    "United Kingdom": [55.3781, -3.4360],
    Germany: [51.1657, 10.4515],
    Singapore: [1.3521, 103.8198],
    Australia: [-25.2744, 133.7751],
    Canada: [56.1304, -106.3468],
    France: [46.2276, 2.2137],
    Netherlands: [52.1326, 5.2913],
    UAE: [23.4241, 53.8478],
    "United Arab Emirates": [23.4241, 53.8478],
    Japan: [36.2048, 138.2529],
    "New Zealand": [-40.9006, 174.886],
    Kenya: [-1.2921, 36.8219],
    "South Africa": [-30.5595, 22.9375],
    Nepal: [28.3949, 84.124],
    Bangladesh: [23.685, 90.3563],
    Switzerland: [46.8182, 8.2275],
    Sweden: [60.1282, 18.6435],
    Denmark: [56.2639, 9.5018],
    Norway: [60.472, 8.4689],
    Austria: [47.5162, 14.5501],
    Belgium: [50.5039, 4.4699],
    Spain: [40.4637, -3.7492],
    Italy: [41.8719, 12.5674],
    Portugal: [39.3999, -8.2245],
    Poland: [51.9194, 19.1451],
    Finland: [61.9241, 25.7482],
    "Czech Republic": [49.8175, 15.473],
    Ireland: [53.1424, -7.6921],
    Israel: [31.0461, 34.8516],
    China: [35.8617, 104.1954],
    "South Korea": [35.9078, 127.7669],
    Thailand: [15.87, 100.9925],
    Malaysia: [4.2105, 101.9758],
    Indonesia: [-0.7893, 113.9213],
    Philippines: [12.8797, 121.774],
    "Sri Lanka": [7.8731, 80.7718],
    Pakistan: [30.3753, 69.3451],
    Ghana: [7.9465, -1.0232],
    Nigeria: [9.082, 8.6753],
    Ethiopia: [9.145, 40.4897],
    Tanzania: [-6.369, 34.8888],
    Rwanda: [-1.9403, 29.8739],
    Uganda: [1.3733, 32.2903],
    Zambia: [-13.1339, 27.8493],
    Zimbabwe: [-19.0154, 29.1549],
  };

  const entries = [...countryMap.entries()].map(([country, members]) => ({
    country,
    members,
    coords: COUNTRY_COORDS[country] ?? null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [0, 20] }}
          width={900}
          height={500}
        >
          <Geographies geography={WORLD_TOPO}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name as string;
                const isIndia = name === "India";
                const hasAlumni = countryMap.has(name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isIndia && hasAlumni ? "#c7d2fe" : hasAlumni ? "#e0e7ff" : "#f3f4f6"}
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isIndia ? "#818cf8" : "#a5b4fc", cursor: isIndia ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onClick={isIndia ? onDrillIndia : undefined}
                  />
                );
              })
            }
          </Geographies>

          {entries
            .filter((e) => e.coords !== null)
            .map(({ country, members, coords }) => {
              const [lat, lng] = coords!;
              const r = Math.min(Math.max(Math.sqrt(members.length) * 4, 5), 40);
              const bd = computeBreakdown(members);
              const dt = dominantTier(bd);
              return (
                <Marker key={country} coordinates={[lng, lat]}>
                  <circle
                    r={r}
                    fill={TIER_COLORS[dt]}
                    fillOpacity={0.7}
                    stroke="white"
                    strokeWidth={1}
                    style={{ cursor: country === "India" ? "pointer" : "default" }}
                    onMouseEnter={(e) =>
                      setTooltip({ label: country, count: members.length, breakdown: bd, topSubgroups: topSubgroups(members), x: e.clientX, y: e.clientY })
                    }
                    onMouseLeave={() => setTooltip(null)}
                    onClick={country === "India" ? onDrillIndia : undefined}
                  />
                </Marker>
              );
            })}
        </ComposableMap>

        {/* Drill-down hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 border border-indigo-200 text-indigo-700 text-xs rounded-full px-3 py-1 shadow-sm pointer-events-none">
          Click on India to see city-level detail
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {TIER_LABELS.map(([tier, emoji]) => (
          <span key={tier} className="flex items-center gap-1">{emoji} {tier}</span>
        ))}
        <span className="ml-auto text-xs text-gray-400">Bubble = dominant social tier · Click India to drill down</span>
      </div>

      {/* Country table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Alumni by Country</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {[...countryMap.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([country, members]) => (
              <div
                key={country}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
              >
                <span className="text-gray-700 truncate">{country}</span>
                <span className="font-semibold text-gray-900 ml-2 shrink-0">{members.length}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm pointer-events-none"
          style={{ top: tooltip.y + 12, left: tooltip.x + 12, minWidth: 200 }}
        >
          <p className="font-semibold text-gray-800 mb-1">{tooltip.label}</p>
          <p className="text-gray-500 mb-2">Total: {tooltip.count} alumni</p>
          <div className="space-y-0.5">
            <p>🟢 Social: {tooltip.breakdown.Social}</p>
            <p>🟡 Partial: {tooltip.breakdown["Partial Social"]}</p>
            <p>🔴 Non-Social: {tooltip.breakdown["Non-Social"]}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main MapView ── */
export function MapView({ alumni }: Props) {
  const hasInternational = alumni.some(
    (a) => (a["Country"] as string | undefined)?.trim().toLowerCase() !== "india"
  );

  const [view, setView] = useState<"world" | "india">(hasInternational ? "world" : "india");

  return (
    <div className="flex flex-col gap-4">
      {/* View toggle */}
      {hasInternational && (
        <div className="flex gap-2">
          <button
            onClick={() => setView("world")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${view === "world" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            🌍 World View
          </button>
          <button
            onClick={() => setView("india")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${view === "india" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            🇮🇳 India Detail
          </button>
        </div>
      )}

      {view === "world" ? (
        <WorldView alumni={alumni} onDrillIndia={() => setView("india")} />
      ) : (
        <div className="flex flex-col gap-2">
          {hasInternational && (
            <button
              onClick={() => setView("world")}
              className="self-start text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              ← Back to World View
            </button>
          )}
          <IndiaView alumni={alumni} />
        </div>
      )}
    </div>
  );
}
