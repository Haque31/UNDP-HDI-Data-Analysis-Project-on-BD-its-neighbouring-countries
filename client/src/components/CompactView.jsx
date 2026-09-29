import { useState } from "react";
import ComponentsChart from "./ComponentsChart";
import GiiTrendChart from "./GiiTrendChart";
import HdiTrendChart from "./HdiTrendChart";
import InequalityGapChart from "./InequalityGapChart";
import InsightPanel from "./InsightPanel";
import { COMPONENT_METRICS } from "./componentMetrics";

const TRENDS = [
    { key: "hdiTrend", title: "HDI trend", heading: "HDI trend, 1990–2023" },
    { key: "giiTrend", title: "GII trend", heading: "Gender Inequality Index, 1990–2023" },
    { key: "inequalityGap", title: "Inequality loss % trend", heading: "Share of HDI lost to inequality, 2010–2023" },
];

export default function CompactView({ hdiTrend, giiTrend, inequalityGap, components, renderSection }) {
    const [trend, setTrend] = useState("hdiTrend");
    const [metric, setMetric] = useState("le");
    const selectedTrend = TRENDS.find(({ key }) => key === trend);
    const insightIndicator = { hdiTrend: "hdi", giiTrend: "gii", inequalityGap: "inequality" }[trend];

    return (
        <div className="compact-view">
            <section aria-labelledby="compact-trend-heading">
                <label className="indicator-selector" htmlFor="trend-indicator">
                    Trend indicator
                    <select id="trend-indicator" value={trend} onChange={(event) => setTrend(event.target.value)}>
                        {TRENDS.map(({ key, title }) => <option key={key} value={key}>{title}</option>)}
                    </select>
                </label>
                <h2 id="compact-trend-heading">{selectedTrend.heading}</h2>
                {renderSection(trend, <div key={trend} className="chart-with-insight">
                  <div className="chart-content">
                    {trend === "hdiTrend" && hdiTrend && <HdiTrendChart hdiTrend={hdiTrend.hdi_trend} historicalMarkers={hdiTrend.historical_markers} showAxisLabel />}
                    {trend === "giiTrend" && giiTrend && <GiiTrendChart giiTrend={giiTrend} showAxisLabel />}
                    {trend === "inequalityGap" && inequalityGap && <InequalityGapChart inequalityGap={inequalityGap} />}
                  </div>
                  <InsightPanel indicator={insightIndicator} />
                </div>)}
            </section>
            <section aria-labelledby="compact-component-heading">
                <label className="indicator-selector" htmlFor="component-indicator">
                    Component indicator
                    <select id="component-indicator" value={metric} onChange={(event) => setMetric(event.target.value)}>
                        {COMPONENT_METRICS.map(({ key, title }) => <option key={key} value={key}>{title}</option>)}
                    </select>
                </label>
                <h2 id="compact-component-heading">Health, education and income, 2023</h2>
                {renderSection("components", components && <div className="chart-with-insight">
                    <div className="chart-content">
                        <ComponentsChart key={metric} components={components} selectedMetric={metric} />
                    </div>
                    <InsightPanel indicator="components" components={components} metric={metric} />
                </div>)}
            </section>
        </div>
    );
}
