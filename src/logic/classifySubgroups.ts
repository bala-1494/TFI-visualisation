import type { RawAlumni, SubgroupName } from "../types/Alumni";

export function classifySubgroups(alumni: RawAlumni): SubgroupName[] {
  const subgroups: SubgroupName[] = [];
  const sector = alumni["Current Sector"]?.trim().toLowerCase();
  const level = alumni["Level"]?.trim().toLowerCase();
  const country = alumni["Country"]?.trim();
  const status = alumni["Alumni Professional Status"]?.trim().toLowerCase();
  const puzzle = alumni["Puzzle Piece"]?.trim();
  const company = alumni["Current Company"]?.trim();

  if (sector === "education" && level === "leadership")
    subgroups.push("Education Leader");

  if (
    country &&
    country.toLowerCase() !== "india" &&
    country !== "" &&
    country.toLowerCase() !== "na"
  )
    subgroups.push("International Alumni");

  if (
    (status?.includes("entrepreneur") ||
      status?.includes("self-employed") ||
      status?.includes("self employed")) &&
    company &&
    company !== "" &&
    company.toLowerCase() !== "na"
  )
    subgroups.push("Founder / Entrepreneur");

  if (puzzle?.toLowerCase().includes("policy and governance"))
    subgroups.push("Policy & Governance");

  if (puzzle?.startsWith("P3") && status?.includes("employed full-time"))
    subgroups.push("Corporate Professional");

  if (status?.includes("student") || level === "entry level")
    subgroups.push("Student / Early Career");

  if (
    status?.includes("in-between") ||
    status?.includes("on a break") ||
    status?.includes("career break") ||
    status?.includes("looking for job") ||
    status?.includes("homemaker") ||
    status?.includes("break")
  )
    subgroups.push("Inactive / On Break");

  return subgroups;
}
