import { pivotByYear } from "./chartData";
import TrendTooltip from "./TrendTooltip";
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
import { COLORS, COUNTRIES, formatThreeDecimals } from "./chartConstants";

function HistoricalMarkerLabel({ viewBox, value }) {
    const anchorX = viewBox.x + 14;
    const anchorY = viewBox.y;

    return (
        <text
            x={anchorX}
            y={anchorY}
            transform={`rotate(-90 ${anchorX} ${anchorY})`}
            textAnchor="end"
            fill="var(--text)"
            fontSize={12}
        >
            {value}
        </text>
    );
}

function HdiTrendChart({ hdiTrend, historicalMarkers, showAxisLabel = false }) {
    const chartData = pivotByYear(hdiTrend, "hdi");

    return (
        <>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 12, left: 48 }}>
                    <CartesianGrid stroke="var(--border)" strokeWidth={1} />
                    <XAxis dataKey="year" type="number" domain={[1970, 2023]} />
                    <YAxis domain={["auto", "auto"]}>
                        {showAxisLabel && <Label value="HDI (index)" angle={-90} position="insideLeft" />}
                    </YAxis>
                    <Tooltip content={<TrendTooltip format={formatThreeDecimals} />} filterNull={false} />
                    <Legend itemSorter={null} />
                    {historicalMarkers.map((marker) => (
                        <ReferenceLine
                            key={`${marker.year}-${marker.label}`}
                            x={marker.year}
                            stroke="var(--text)"
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
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            <p>HDI data begins in 1990; earlier reference lines show historical context only.</p>
        </>
    );
}

export default HdiTrendChart;
