import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { COLORS, COUNTRIES, formatThreeDecimals, sortTooltipPayload } from "./chartConstants";

function pivotGiiTrend(giiTrend) {
    const rowsByYear = new Map();
    giiTrend.forEach(({ iso3, year, gii }) => {
        if (!rowsByYear.has(year)) rowsByYear.set(year, { year });
        rowsByYear.get(year)[iso3] = gii;
    });
    return [...rowsByYear.values()].sort((first, second) => first.year - second.year);
}

function GiiTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const sortedPayload = sortTooltipPayload(payload);

    return (
        <div style={{ background: "#fff", border: "1px solid #d1d5db", padding: "8px 10px" }}>
            <strong>{label}</strong>
            {sortedPayload.map(({ dataKey, value }) => {
                return (
                    <p key={dataKey} style={{ color: COLORS[dataKey] }}>
                        {dataKey}: {formatThreeDecimals(value)}
                    </p>
                );
            })}
        </div>
    );
}

function GiiTrendChart({ giiTrend }) {
    const chartData = pivotGiiTrend(giiTrend);

    return (
        <>
            <p>Gender Inequality Index (lower = more gender equality)</p>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 12, left: 64 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" type="number" domain={[1990, 2023]} />
                    <YAxis domain={[0, "auto"]} />
                    <Tooltip content={<GiiTooltip />} formatter={formatThreeDecimals} filterNull={false} />
                    <Legend itemSorter={null} />
                    {COUNTRIES.map((country) => (
                        <Line
                            key={country}
                            type="monotone"
                            dataKey={country}
                            stroke={COLORS[country]}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            <p>China: GII not published before 1998 (shown as a gap, not interpolated). Lower values indicate greater gender equality.</p>
            <p>Some sharp single-year moves (Bangladesh 2001-2004 and 2008, Pakistan 2003) coincide with abrupt changes in the index's input series, such as women's secondary education attainment. The long-run direction and the 2023 comparison are more reliable than individual years.</p>
        </>
    );
}

export default GiiTrendChart;