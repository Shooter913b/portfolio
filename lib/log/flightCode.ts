/** Compact log identifier from slug + ISO date (e.g. CSX-061826). */
export function flightCode(slug: string, date: string): string {
  const [year, month, day] = date.split("-");
  const prefix = slug
    .split(/[-_]/)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");
  const yy = year?.slice(2) ?? "00";
  return `${prefix}-${month ?? "01"}${day ?? "01"}${yy}`;
}
