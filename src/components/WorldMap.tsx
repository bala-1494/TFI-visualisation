import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { ProcessedAlumni, SocialTier } from "../types/Alumni";
import { TIER_COLORS } from "../constants/colors";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  India: [78.96, 20.59],
  USA: [-95.71, 37.09],
  "United States": [-95.71, 37.09],
  UK: [-3.43, 55.37],
  "United Kingdom": [-3.43, 55.37],
  Germany: [10.45, 51.16],
  Canada: [-96.8, 56.13],
  Australia: [133.77, -25.27],
  Netherlands: [5.29, 52.13],
  France: [2.21, 46.23],
  Switzerland: [8.23, 46.82],
  Singapore: [103.82, 1.35],
  UAE: [53.85, 23.42],
  "United Arab Emirates": [53.85, 23.42],
  Ireland: [-8.24, 53.41],
  Belgium: [4.47, 50.5],
  "New Zealand": [174.89, -40.9],
  Spain: [-3.75, 40.46],
  Indonesia: [113.92, -0.79],
  "Saudi Arabia": [45.08, 23.89],
  Sweden: [18.64, 60.13],
  Norway: [8.47, 60.47],
  Denmark: [9.5, 56.26],
  Japan: [138.25, 36.2],
  "South Korea": [127.77, 35.91],
  Brazil: [-51.93, -14.24],
  "South Africa": [22.94, -30.56],
  Nepal: [84.12, 28.39],
  Bhutan: [90.43, 27.51],
  Malaysia: [109.7, 2.11],
};

interface CountryData {
  country: string;
  count: number;
  dominantTier: SocialTier;
  breakdown: Record<SocialTier, number>;
}

interface TooltipState {
  country: string;
  count: number;
  breakdown: Record<SocialTier, number>;
  x: number;
  y: number;
}

interface Props {
  alumni: ProcessedAlumni[];
  onIndiaClick: () => void;
}

const TIERS: SocialTier[] = ["Social", "Partial Social", "Non-Social", "Unknown"];

function buildCountryData(alumni: ProcessedAlumni[]): CountryData[] {
  const map = new Map<string, { tiers: Record<SocialTier, number> }>();

  for (const a of alumni) {
    const country = (a["Country"] as string | undefined)?.trim();
    if (!country) continue;
    if (!map.has(country)) {
      map.set(country, { tiers: { Social: 0, "Partial Social": 0, "Non-Social": 0, Unknown: 0 } });
    }
    map.get(country)!.tiers[a.socialTier]++;
  }

  return Array.from(map.entries()).map(([country, { tiers }]) => {
    const dominantTier = TIERS.reduce((best, t) =>
      tiers[t] > tiers[best] ? t : best
    );
    return {
      country,
      count: Object.values(tiers).reduce((s, n) => s + n, 0),
      dominantTier,
      breakdown: tiers,
    };
  });
}

export function WorldMap({ alumni, onIndiaClick }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const countriesWithAlumni = buildCountryData(alumni);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
      <h2 className="text-base font-semibold text-gray-700 mb-2">
        Alumni by Country
      </h2>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [20, 20] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e5e7eb"
                stroke="#ffffff"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {countriesWithAlumni.map(({ country, count, dominantTier, breakdown }) => {
          const coords = COUNTRY_COORDINATES[country];
          if (!coords) return null;
          const r = Math.min(Math.max(Math.sqrt(count) * 4, 5), 40);
          const isIndia = country === "India";
          return (
            <Marker key={country} coordinates={coords}>
              <circle
                r={r}
                fill={TIER_COLORS[dominantTier]}
                fillOpacity={0.75}
                stroke="white"
                strokeWidth={1}
                style={{ cursor: isIndia ? "pointer" : "default" }}
                onClick={() => isIndia && onIndiaClick()}
                onMouseEnter={(e) =>
                  setTooltip({ country, count, breakdown, x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: TIER_COLORS["Social"] }} />
          Social
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: TIER_COLORS["Partial Social"] }} />
          Partial Social
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: TIER_COLORS["Non-Social"] }} />
          Non-Social
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: TIER_COLORS["Unknown"] }} />
          Unknown
        </span>
        <span className="text-gray-400 ml-auto">
          Bubble size reflects alumni count · Click India to explore cities
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold mb-1">{tooltip.country}</p>
          <p>Total: {tooltip.count} alumni</p>
          <p>🟢 Social: {tooltip.breakdown["Social"]}</p>
          <p>🟡 Partial: {tooltip.breakdown["Partial Social"]}</p>
          <p>🔴 Non-Social: {tooltip.breakdown["Non-Social"]}</p>
          <p>⚪ Unknown: {tooltip.breakdown["Unknown"]}</p>
        </div>
      )}
    </div>
  );
}
