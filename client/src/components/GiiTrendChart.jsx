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
import { COLORS, COUNTRIES, formatThreeDecimals } from "./chartConstants";

function GiiTrendChart({ giiTrend, showAxisLabel = false }) {
    const chartData = pivotByYear(giiTrend, "gii");

    return (
        <>
            <p>Gender Inequality Index (lower = more gender equality)</p>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 12, right: 20, bottom: 12, left: 64 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" type="number" domain={[1990, 2023]} />
                    <YAxis domain={[0, "auto"]}>
                        {showAxisLabel && <Label value="GII (index)" angle={-90} position="insideLeft" />}
                    </YAxis>
                    <Tooltip content={<TrendTooltip format={formatThreeDecimals} />} filterNull={false} />
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
            <p>China: GII not published before 1998 (shown as a gap, not interpolated). Lower values indicate greater gender equality.</p>
            <p>Bangladesh's sharp jumps around 2001–2004 and 2008, and Pakistan's around 2003, are likely data/survey artifacts, coinciding with implausible swings in inputs such as women's secondary education attainment. They should not be read as real one-year changes.</p>
        </>
    );
}

export default GiiTrendChart;
