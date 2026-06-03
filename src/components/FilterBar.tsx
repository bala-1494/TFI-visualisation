import { useMemo, useState } from "react";
import { ChevronDown, RotateCcw, X } from "lucide-react";
import type { ProcessedAlumni, SubgroupName, SocialTier, ChangeMakerTier } from "../types/Alumni";
import { SUBGROUP_META } from "../constants/subgroups";

export interface FilterState {
  socialTier: SocialTier | "All";
  changeMakerTier: ChangeMakerTier | "All";
  subgroup: SubgroupName | "All";
  country: string;
  city: string;
  cohortYears: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  socialTier: "All",
  changeMakerTier: "All",
  subgroup: "All",
  country: "All",
  city: "All",
  cohortYears: [],
};

interface Props {
  alumni: ProcessedAlumni[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const SOCIAL_TIERS: (SocialTier | "All")[] = ["All", "Social", "Partial Social", "Non-Social", "Unknown"];
const CM_TIERS: (ChangeMakerTier | "All")[] = ["All", "Change Maker", "Emerging Contributor", "Not Yet"];
const SUBGROUP_NAMES = Object.keys(SUBGROUP_META) as SubgroupName[];
const COHORT_OPTIONS = ["2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020"];

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-gray-300"}`}
    >
      <option value="All">{placeholder}: All</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function FilterBar({ alumni, filters, onChange }: Props) {
  const [cohortOpen, setCohortOpen] = useState(false);

  const countries = useMemo(() =>
    [...new Set(alumni
      .map(a => (a["Country"] as string | undefined)?.trim())
      .filter((c): c is string => !!c && c.toLowerCase() !== "na")
    )].sort()
  , [alumni]);

  const cities = useMemo(() =>
    [...new Set(alumni
      .filter(a =>
        filters.country === "All" ||
        (a["Country"] as string)?.trim() === filters.country
      )
      .map(a => (a["Current City"] as string | undefined)?.trim())
      .filter((c): c is string => !!c && c.toLowerCase() !== "na")
    )].sort()
  , [alumni, filters.country]);

  const isActive =
    filters.socialTier !== "All" ||
    filters.changeMakerTier !== "All" ||
    filters.subgroup !== "All" ||
    filters.country !== "All" ||
    filters.city !== "All" ||
    filters.cohortYears.length > 0;

  const activeFilterCount = [
    filters.socialTier !== "All",
    filters.changeMakerTier !== "All",
    filters.subgroup !== "All",
    filters.country !== "All",
    filters.city !== "All",
    filters.cohortYears.length > 0,
  ].filter(Boolean).length;

  const cohortLabel =
    filters.cohortYears.length === 0 ? "All Years" :
    filters.cohortYears.length === 1 ? filters.cohortYears[0] :
    `${filters.cohortYears.length} years selected`;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-3 items-start">
        {/* Social Tier */}
        <Select
          placeholder="Social Tier"
          value={filters.socialTier}
          onChange={v => onChange({ ...filters, socialTier: v as FilterState["socialTier"] })}
          options={SOCIAL_TIERS.slice(1).map(t => ({ label: t, value: t }))}
        />

        {/* Change Maker */}
        <Select
          placeholder="Change Maker"
          value={filters.changeMakerTier}
          onChange={v => onChange({ ...filters, changeMakerTier: v as FilterState["changeMakerTier"] })}
          options={CM_TIERS.slice(1).map(t => ({ label: t, value: t }))}
        />

        {/* Subgroup */}
        <Select
          placeholder="Subgroup"
          value={filters.subgroup}
          onChange={v => onChange({ ...filters, subgroup: v as FilterState["subgroup"] })}
          options={SUBGROUP_NAMES.map(s => ({
            label: `${SUBGROUP_META[s].emoji} ${s}`,
            value: s,
          }))}
        />

        {/* Country */}
        <Select
          placeholder="Country"
          value={filters.country}
          onChange={v => onChange({ ...filters, country: v, city: "All" })}
          options={countries.map(c => ({ label: c, value: c }))}
        />

        {/* City */}
        <Select
          placeholder="City"
          value={filters.city}
          onChange={v => onChange({ ...filters, city: v })}
          options={cities.map(c => ({ label: c, value: c }))}
          disabled={filters.country === "All" && cities.length > 50}
        />

        {/* Cohort multi-select popover */}
        <div className="relative">
          <button
            onClick={() => setCohortOpen(o => !o)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <span>Cohort: {cohortLabel}</span>
            <ChevronDown size={14} />
          </button>

          {cohortOpen && (
            <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <div className="flex gap-2 px-2 py-1 border-b border-gray-100">
                <button
                  className="text-xs text-indigo-600 hover:underline"
                  onClick={() => onChange({ ...filters, cohortYears: [...COHORT_OPTIONS] })}
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  className="text-xs text-gray-500 hover:underline"
                  onClick={() => onChange({ ...filters, cohortYears: [] })}
                >
                  Clear All
                </button>
              </div>
              {COHORT_OPTIONS.map(year => (
                <div
                  key={year}
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const next = filters.cohortYears.includes(year)
                      ? filters.cohortYears.filter(y => y !== year)
                      : [...filters.cohortYears, year];
                    onChange({ ...filters, cohortYears: next });
                  }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                    ${filters.cohortYears.includes(year)
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300"}`}
                  >
                    {filters.cohortYears.includes(year) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{year}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset button */}
        {isActive && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 ml-auto"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full px-1.5 py-0.5">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      {/* Cohort chips */}
      {filters.cohortYears.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.cohortYears.map(year => (
            <span
              key={year}
              className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2 py-1"
            >
              {year}
              <X
                size={12}
                className="cursor-pointer hover:text-indigo-900"
                onClick={() => onChange({
                  ...filters,
                  cohortYears: filters.cohortYears.filter(y => y !== year),
                })}
              />
            </span>
          ))}
        </div>
      )}

      {/* Click outside to close cohort popover */}
      {cohortOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setCohortOpen(false)}
        />
      )}
    </div>
  );
}
