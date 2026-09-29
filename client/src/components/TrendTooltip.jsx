import { COLORS, sortTooltipPayload } from "./chartConstants";

export default function TrendTooltip({ active, payload, label, format }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <strong>{label}</strong>
            {sortTooltipPayload(payload).map(({ dataKey, value }) => (
                <span key={dataKey} style={{ color: COLORS[dataKey] }}>
                    {dataKey}: {format(value)}
                </span>
            ))}
        </div>
    );
}
