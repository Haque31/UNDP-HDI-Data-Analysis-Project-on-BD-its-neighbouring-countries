import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Label,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./ComponentsChart.css";
import { COLORS, COUNTRIES, formatInteger, formatOneDecimal } from "./chartConstants";
import { COMPONENT_METRICS } from "./componentMetrics";

function ComponentTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const { dataKey, value } = payload[0];
    const formattedValue = dataKey === "gnipc" ? formatInteger(value) : formatOneDecimal(value);

    return (
        <div className="chart-tooltip">
            <strong>{label}</strong>
            <span>{formattedValue}</span>
        </div>
    );
}

function ComponentsChart({ components, selectedMetric }) {
    const metrics = selectedMetric
        ? COMPONENT_METRICS.filter(({ key }) => key === selectedMetric)
        : COMPONENT_METRICS;
    const orderedComponents = COUNTRIES.flatMap((country) => components.filter(({ iso3 }) => iso3 === country));
    return (
        <div className={selectedMetric ? "component-chart-single" : "components-chart-grid"}>
            {metrics.map(({ key, title, unit, caption }) => (
                <article className="components-chart-panel" key={key}>
                    <h3>{title}</h3>
                    <ResponsiveContainer width="100%" height={selectedMetric ? 350 : 250}>
                        <BarChart data={orderedComponents} margin={{ top: 8, right: 12, left: selectedMetric ? 32 : 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="iso3" />
                            <YAxis domain={[0, "auto"]}>
                                {selectedMetric && <Label value={unit} angle={-90} position="insideLeft" />}
                            </YAxis>
                            <Tooltip content={<ComponentTooltip />} />
                            <Bar dataKey={key} isAnimationActive={false}>
                                {orderedComponents.map(({ iso3 }) => (
                                    <Cell key={iso3} fill={COLORS[iso3]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    {selectedMetric && <p>{caption} The scale starts at zero and adjusts to this indicator.</p>}
                </article>
            ))}
        </div>
    );
}

export default ComponentsChart;
