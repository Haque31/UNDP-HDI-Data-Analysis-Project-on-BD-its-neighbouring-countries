import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const COUNTRIES = ["BGD", "IND", "PAK", "CHN"];
const COLORS = {
    BGD: "#2563eb",
    IND: "#dc2626",
    PAK: "#16a34a",
    CHN: "#d97706",
};

function pivotHdiTrend(hdiTrend) {
    // Group long-format records by year, then add each country as a column.
    const rowsByYear = new Map();
    hdiTrend.forEach(({ iso3, year, hdi }) => {
        if (!rowsByYear.has(year)) rowsByYear.set(year, { year });
        rowsByYear.get(year)[iso3] = hdi;
    });
    return [...rowsByYear.values()].sort((first, second) => first.year - second.year);
}

function HdiTrendChart({ hdiTrend, historicalMarkers }) {
    const chartData = pivotHdiTrend(hdiTrend);

    return (
        <>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" type="number" domain={[1970, 2023]} />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                {historicalMarkers.map((marker) => (
                    <ReferenceLine
                        key={`${marker.year}-${marker.label}`}
                        x={marker.year}
                        stroke="#6b7280"
                        strokeDasharray="4 4"
                        label={{ value: marker.label, position: "top", fill: "#6b7280" }}
                    />
                ))}
                {COUNTRIES.map((country) => (
                    <Line
                        key={country}
                        type="monotone"
                        dataKey={country}
                        stroke={COLORS[country]}
                        dot={false}
                        connectNulls
                    />
                ))}
                </LineChart>
            </ResponsiveContainer>
            <p>HDI data begins in 1990; earlier reference lines show historical context only.</p>
        </>
    );
}

export default HdiTrendChart;