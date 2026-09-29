import { pivotByYear } from "./chartData";
import TrendTooltip from "./TrendTooltip";
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
import { COLORS, COUNTRIES, formatLossPercentage } from "./chartConstants";

function InequalityGapChart({ inequalityGap }) {
    const chartData = pivotByYear(inequalityGap, "loss_pct");

    return (
        <>
            <div className="trend-chart">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 12, left: 64 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" type="number" domain={[2010, 2023]} />
                        <YAxis>
                            <Label value="% of HDI lost to inequality" angle={-90} position="insideLeft" />
                        </YAxis>
                        <Tooltip content={<TrendTooltip format={formatLossPercentage} />} filterNull={false} />
                        <Legend itemSorter={null} />
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
            </div>
            <p>China: inequality-adjusted HDI not published for 2010-2012 (shown as a gap, not interpolated).</p>
        </>
    );
}

export default InequalityGapChart;
