import { useEffect, useState } from "react";
import "./index.css";
import {
  getComponents,
  getGiiTrend,
  getHdiTrend,
  getInequalityGap,
} from "./api";
import ComponentsChart from "./components/ComponentsChart";
import GiiTrendChart from "./components/GiiTrendChart";
import HdiTrendChart from "./components/HdiTrendChart";
import InequalityGapChart from "./components/InequalityGapChart";
import InsightPanel from "./components/InsightPanel";
import CompactView from "./components/CompactView";

function App() {
  const [view, setView] = useState("full");
  const [hdiTrend, setHdiTrend] = useState(null);
  const [components, setComponents] = useState(null);
  const [inequalityGap, setInequalityGap] = useState(null);
  const [giiTrend, setGiiTrend] = useState(null);
  const [loading, setLoading] = useState({
    hdiTrend: true,
    components: true,
    inequalityGap: true,
    giiTrend: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    const requests = [
      ["hdiTrend", getHdiTrend, setHdiTrend],
      ["components", getComponents, setComponents],
      ["inequalityGap", getInequalityGap, setInequalityGap],
      ["giiTrend", getGiiTrend, setGiiTrend],
    ];
    requests.forEach(([key, request, setData]) => {
      request(controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) setData(data);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setErrors((current) => ({ ...current, [key]: "Unable to load this chart. Please refresh to retry." }));
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading((current) => ({ ...current, [key]: false }));
          }
        });
    });
    return () => controller.abort();
  }, []);

  const renderSection = (key, content) => (
    errors[key] ? <p className="section-message">{errors[key]}</p> : loading[key] ? <p className="section-message">Loading...</p> : content
  );

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Human Development in Bangladesh, India, Pakistan and China, 1990-2023</h1>
        <p>Data: UNDP Human Development Report 2025, composite indices time series.</p>
      </header>
      <div className="view-toggle" role="group" aria-label="Dashboard view">
        <button type="button" aria-pressed={view === "full"} onClick={() => setView("full")}>Full view</button>
        <button type="button" aria-pressed={view === "compact"} onClick={() => setView("compact")}>Compact view</button>
      </div>
      {view === "compact" ? <CompactView
        hdiTrend={hdiTrend}
        giiTrend={giiTrend}
        inequalityGap={inequalityGap}
        components={components}
        renderSection={renderSection}
      /> : <div className="full-view">
      <section>
        <h2>HDI trend, 1990-2023</h2>
        {renderSection("hdiTrend", hdiTrend && <div className="chart-with-insight">
          <div className="chart-content"><HdiTrendChart
          hdiTrend={hdiTrend.hdi_trend}
          historicalMarkers={hdiTrend.historical_markers}
          /></div>
          <InsightPanel indicator="hdi" />
        </div>)}
      </section>
      <section>
        <h2>Health, education and income, 2023</h2>
        {renderSection("components", components && <div className="chart-with-insight">
          <div className="chart-content"><ComponentsChart components={components} /></div>
          <InsightPanel indicator="components" components={components} />
        </div>)}
      </section>
      <section>
        <h2>Share of HDI lost to inequality, 2010-2023</h2>
        {renderSection("inequalityGap", inequalityGap && <div className="chart-with-insight">
          <div className="chart-content"><InequalityGapChart inequalityGap={inequalityGap} /></div>
          <InsightPanel indicator="inequality" />
        </div>)}
      </section>
      <section>
        <h2>Gender Inequality Index, 1990-2023</h2>
        {renderSection("giiTrend", giiTrend && <div className="chart-with-insight">
          <div className="chart-content"><GiiTrendChart giiTrend={giiTrend} /></div>
          <InsightPanel indicator="gii" />
        </div>)}
      </section>
      </div>}
    </main>
  );
}

export default App;
