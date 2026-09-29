import {
    CartesianGrid,
    Label,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./InequalityGapChart.css";
import { COLORS, COUNTRIES, formatLossPercentage, sortTooltipPayload } from "./chartConstants";

function pivotInequalityGap(inequalityGap) {
    const rowsByYear = new Map();
    inequalityGap.forEach(({ iso3, year, loss_pct }) => {
        if (!rowsByYear.has(year)) rowsByYear.set(year, { year });
        rowsByYear.get(year)[iso3] = loss_pct;
    });
    return [...rowsByYear.values()].sort((first, second) => first.year - second.year);
}

function InequalityGapTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const sortedPayload = sortTooltipPayload(payload);

    return (
        <div className="inequality-gap-tooltip">
            <strong>{label}</strong>
            {sortedPayload.map(({ dataKey, value }) => {
                return (
                    <span key={dataKey} style={{ color: COLORS[dataKey] }}>
                        {dataKey}: {formatLossPercentage(value)}
                    </span>
                );
            })}
        </div>
    );
}

function InequalityGapChart({ inequalityGap }) {
    const chartData = pivotInequalityGap(inequalityGap);

    return (
        <>
            <div className="inequality-gap-chart">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 12, left: 64 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" type="number" domain={[2010, 2023]} />
                        <YAxis>
                            <Label value="% of HDI lost to inequality" angle={-90} position="insideLeft" />
                        </YAxis>
                        <Tooltip content={<InequalityGapTooltip />} formatter={formatLossPercentage} filterNull={false} />
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
            </div>
            <p>China: inequality-adjusted HDI not published for 2010-2012 (shown as a gap, not interpolated).</p>
        </>
    );
}

export default InequalityGapChart;