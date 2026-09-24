import { useEffect, useState } from "react";
import {
  getComponents,
  getCountries,
  getGiiTrend,
  getHdiTrend,
  getInequalityGap,
} from "./api";
import HdiTrendChart from "./components/HdiTrendChart";

function App() {
  const [countries, setCountries] = useState(null);
  const [hdiTrend, setHdiTrend] = useState(null);
  const [components, setComponents] = useState(null);
  const [inequalityGap, setInequalityGap] = useState(null);
  const [giiTrend, setGiiTrend] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setErrors((current) => ({ ...current, countries: "failed to load countries" })));
    getHdiTrend()
      .then(setHdiTrend)
      .catch(() => setErrors((current) => ({ ...current, hdiTrend: "failed to load hdi trend" })));
    getComponents()
      .then(setComponents)
      .catch(() => setErrors((current) => ({ ...current, components: "failed to load components" })));
    getInequalityGap()
      .then(setInequalityGap)
      .catch(() => setErrors((current) => ({ ...current, inequalityGap: "failed to load inequality gap" })));
    getGiiTrend()
      .then(setGiiTrend)
      .catch(() => setErrors((current) => ({ ...current, giiTrend: "failed to load gii trend" })));
  }, []);

  const renderData = (data, error) => (
    <pre>{error || (data === null ? "loading..." : JSON.stringify(data, null, 2))}</pre>
  );

  return (
    <main>
      <h1>HDI dashboard data</h1>
      <section>
        <h2>Countries</h2>
        {renderData(countries, errors.countries)}
      </section>
      <section>
        <h2>HDI trend</h2>
        {errors.hdiTrend
          ? renderData(null, errors.hdiTrend)
          : hdiTrend === null
            ? renderData(null)
            : <HdiTrendChart
              hdiTrend={hdiTrend.hdi_trend}
              historicalMarkers={hdiTrend.historical_markers}
            />}
      </section>
      <section>
        <h2>Components</h2>
        {renderData(components, errors.components)}
      </section>
      <section>
        <h2>Inequality gap</h2>
        {renderData(inequalityGap, errors.inequalityGap)}
      </section>
      <section>
        <h2>GII trend</h2>
        {renderData(giiTrend, errors.giiTrend)}
      </section>
    </main>
  );
}

export default App;
