const monthLookup: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

export function toNeo4jDate(
  dateText: string
): string {

  const match =
    dateText.match(/^([A-Za-z]{3})\s+(\d{4})$/);

  if (!match) {
    throw new Error(
      `Invalid date: ${dateText}`
    );
  }

  const month =
    monthLookup[
      match[1]!.toLowerCase()
    ];

  return `${match[2]}-${String(month).padStart(
    2,
    "0"
  )}-01`;
}