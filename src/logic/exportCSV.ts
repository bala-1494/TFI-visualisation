import type { ProcessedAlumni, SubgroupName } from "../types/Alumni";

const EXPORT_COLUMNS = [
  "Full Name", "Cohort", "Placement City", "Current City",
  "State", "Country", "Alumni Professional Status",
  "Current Company", "Designation", "Level",
  "Current Sector", "Puzzle Piece", "Gender", "Age",
  "Social Media: LinkedIn",
];

export function exportToCSV(data: ProcessedAlumni[]) {
  const headers = [
    ...EXPORT_COLUMNS,
    "socialTier", "changeMakerTier", "subgroups", "changeMakerScore"
  ];

  const rows = data.map(a => [
    ...EXPORT_COLUMNS.map(col => {
      const val = (a[col] as string | undefined) ?? "";
      return `"${val.replace(/"/g, '""')}"`;
    }),
    `"${a.socialTier}"`,
    `"${a.changeMakerTier}"`,
    `"${(a.subgroups as SubgroupName[]).join(" | ")}"`,
    a.changeMakerScore === 99
      ? '"Auto (Entrepreneur)"'
      : a.changeMakerScore,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tfi-alumni-export-${new Date().toISOString().split("T")[0]}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
