// Recharts expects one row per year with a separate value for each country.
export function pivotByYear(records, metric) {
    const rowsByYear = new Map();
    records.forEach((record) => {
        if (!rowsByYear.has(record.year)) rowsByYear.set(record.year, { year: record.year });
        rowsByYear.get(record.year)[record.iso3] = record[metric];
    });
    return [...rowsByYear.values()].sort((first, second) => first.year - second.year);
}
