import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./ComponentsChart.css";
import { COLORS, formatInteger, formatOneDecimal } from "./chartConstants";

const METRICS = [
    { key: "le", title: "Life Expectancy at Birth (years)" },
    { key: "eys", title: "Expected Years of Schooling" },
    { key: "mys", title: "Mean Years of Schooling" },
    { key: "gnipc", title: "GNI per Capita (2017 PPP$)" },
];

function ComponentTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const { dataKey, value } = payload[0];
    const formattedValue = dataKey === "gnipc" ? formatInteger(value) : formatOneDecimal(value);

    return (
        <div className="components-chart-tooltip">
            <strong>{label}</strong>
            <span>{formattedValue}</span>
        </div>
    );
}

function ComponentsChart({ components }) {
    const formatComponentValue = (value, name) => (
        name === "gnipc" ? formatInteger(value) : formatOneDecimal(value)
    );

    return (
        <div className="components-chart-grid">
            {METRICS.map(({ key, title }) => (
                <article className="components-chart-panel" key={key}>
                    <h3>{title}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={components} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="iso3" />
                            <YAxis domain={[0, "auto"]} />
                            <Tooltip content={<ComponentTooltip />} formatter={formatComponentValue} />
                            <Bar dataKey={key}>
                                {components.map(({ iso3 }) => (
                                    <Cell key={iso3} fill={COLORS[iso3]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </article>
            ))}
        </div>
    );
}

export default ComponentsChart;