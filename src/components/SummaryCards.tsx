import { Users, Heart, Zap, Globe } from "lucide-react";
import type { ProcessedAlumni } from "../types/Alumni";

interface Props {
  alumni: ProcessedAlumni[];
}

function pct(count: number, total: number): string {
  if (total === 0) return "0.0%";
  return ((count / total) * 100).toFixed(1) + "%";
}

export function SummaryCards({ alumni }: Props) {
  const total = alumni.length;

  const socialCount = alumni.filter((a) => a.socialTier === "Social").length;
  const partialCount = alumni.filter((a) => a.socialTier === "Partial Social").length;
  const socialOrPartial = socialCount + partialCount;

  const changeMakerCount = alumni.filter(
    (a) => a.changeMakerTier === "Change Maker"
  ).length;

  const internationalCount = alumni.filter((a) => {
    const country = (a["Country"] as string | undefined)?.trim().toLowerCase();
    return country && country !== "india" && country !== "" && country !== "na";
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1 — Total Alumni */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-indigo-100 text-indigo-600 rounded-lg p-2">
            <Users size={18} />
          </div>
          <span className="text-sm font-medium text-gray-500">Total Alumni</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {total.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">Fellows tracked</p>
      </div>

      {/* Card 2 — In Social Sector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-green-100 text-green-600 rounded-lg p-2">
            <Heart size={18} />
          </div>
          <span className="text-sm font-medium text-gray-500">In Social Sector</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {pct(socialOrPartial, total)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Social or Partial Social</p>
        <div className="flex gap-3 mt-2">
          <span className="text-xs font-medium text-green-600">
            🟢 Social: {socialCount}
          </span>
          <span className="text-xs font-medium text-amber-600">
            🟡 Partial: {partialCount}
          </span>
        </div>
      </div>

      {/* Card 3 — Change Makers */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-violet-100 text-violet-600 rounded-lg p-2">
            <Zap size={18} />
          </div>
          <span className="text-sm font-medium text-gray-500">Change Makers</span>
        </div>
        <p className="text-3xl font-bold text-violet-700">
          {pct(changeMakerCount, total)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Leadership + P1 / Entrepreneurs</p>
      </div>

      {/* Card 4 — International Alumni */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
            <Globe size={18} />
          </div>
          <span className="text-sm font-medium text-gray-500">International</span>
        </div>
        <p className="text-3xl font-bold text-blue-700">
          {pct(internationalCount, total)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Based outside India</p>
      </div>
    </div>
  );
}
