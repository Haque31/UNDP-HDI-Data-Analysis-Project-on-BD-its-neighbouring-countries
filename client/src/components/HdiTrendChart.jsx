import {
    CartesianGrid,
    Label,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { COLORS, COUNTRIES, formatThreeDecimals, sortTooltipPayload } from "./chartConstants";

function pivotHdiTrend(hdiTrend) {
    // Group long-format records by year, then add each country as a column.
    const rowsByYear = new Map();
    hdiTrend.forEach(({ iso3, year, hdi }) => {
        if (!rowsByYear.has(year)) rowsByYear.set(year, { year });
        rowsByYear.get(year)[iso3] = hdi;
    });
    return [...rowsByYear.values()].sort((first, second) => first.year - second.year);
}

function HdiTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const sortedPayload = sortTooltipPayload(payload);

    return (
        <div style={{ background: "#fff", border: "1px solid #d1d5db", padding: "8px 10px" }}>
            <p>{label}</p>
            {sortedPayload.map(({ dataKey, value }) => (
                <p key={dataKey} style={{ color: COLORS[dataKey] }}>
                    {dataKey}: {formatThreeDecimals(value)}
                </p>
            ))}
        </div>
    );
}

function HistoricalMarkerLabel({ viewBox, value }) {
    const anchorX = viewBox.x + 14;
    const anchorY = viewBox.y;

    return (
        <text
            x={anchorX}
            y={anchorY}
            transform={`rotate(-90 ${anchorX} ${anchorY})`}
            textAnchor="end"
            fill="#e5e7eb"
            fontSize={12}
        >
            {value}
        </text>
    );
}

function HdiTrendChart({ hdiTrend, historicalMarkers }) {
    const chartData = pivotHdiTrend(hdiTrend);

    return (
        <>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 12, left: 48 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    <XAxis dataKey="year" type="number" domain={[1970, 2023]} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip content={<HdiTooltip />} formatter={formatThreeDecimals} filterNull={false} />
                    <Legend itemSorter={null} />
                    {historicalMarkers.map((marker) => (
                        <ReferenceLine
                            key={`${marker.year}-${marker.label}`}
                            x={marker.year}
                            stroke="#e5e7eb"
                            strokeWidth={1.5}
                            strokeDasharray="6 4"
                        >
                            <Label
                                value={marker.label}
                                content={<HistoricalMarkerLabel />}
                            />
                        </ReferenceLine>
                    ))}
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
            <p>HDI data begins in 1990; earlier reference lines show historical context only.</p>
        </>
    );
}

export default HdiTrendChart;