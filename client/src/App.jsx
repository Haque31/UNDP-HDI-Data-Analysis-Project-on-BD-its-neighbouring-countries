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

function App() {
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
    getHdiTrend()
      .then(setHdiTrend)
      .catch(() => setErrors((current) => ({ ...current, hdiTrend: "failed to load hdi trend" })))
      .finally(() => setLoading((current) => ({ ...current, hdiTrend: false })));
    getComponents()
      .then(setComponents)
      .catch(() => setErrors((current) => ({ ...current, components: "failed to load components" })))
      .finally(() => setLoading((current) => ({ ...current, components: false })));
    getInequalityGap()
      .then(setInequalityGap)
      .catch(() => setErrors((current) => ({ ...current, inequalityGap: "failed to load inequality gap" })))
      .finally(() => setLoading((current) => ({ ...current, inequalityGap: false })));
    getGiiTrend()
      .then(setGiiTrend)
      .catch(() => setErrors((current) => ({ ...current, giiTrend: "failed to load gii trend" })))
      .finally(() => setLoading((current) => ({ ...current, giiTrend: false })));
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
      <section>
        <h2>HDI trend, 1990-2023</h2>
        {renderSection("hdiTrend", hdiTrend && <HdiTrendChart
          hdiTrend={hdiTrend.hdi_trend}
          historicalMarkers={hdiTrend.historical_markers}
        />)}
      </section>
      <section>
        <h2>Health, education and income, 2023</h2>
        {renderSection("components", components && <ComponentsChart components={components} />)}
      </section>
      <section>
        <h2>Share of HDI lost to inequality, 2010-2023</h2>
        {renderSection("inequalityGap", inequalityGap && <InequalityGapChart inequalityGap={inequalityGap} />)}
      </section>
      <section>
        <h2>Gender Inequality Index, 1990-2023</h2>
        {renderSection("giiTrend", giiTrend && <GiiTrendChart giiTrend={giiTrend} />)}
      </section>
    </main>
  );
}

export default App;
