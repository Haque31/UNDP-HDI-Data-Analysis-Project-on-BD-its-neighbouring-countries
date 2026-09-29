# Developer guide: understanding and maintaining the project

This guide explains the current implementation and its tradeoffs. Design justifications below describe why the approach fits this project; they should not be read as a record of the original author's private intentions. Read [README.md](README.md) first for installation and dashboard usage.

## 1. What the analysis can answer

The project compares development outcomes in Bangladesh, India, Pakistan and China. Bangladesh is the focal country; India and Pakistan provide regional and historical comparisons, and China provides another development trajectory. This is a selected comparison, not a representative sample of countries or a causal study.

HDI summarizes health, education and income. The component charts help inspect those dimensions separately. IHDI adjusts human development for inequality; the loss percentage expresses the reduction relative to HDI. GII is a separate measure of gender inequality and should not be treated as the gender component of HDI.

The source contains outcomes, not a controlled measure of policy, conflict or governance. Historical markers are manually authored context. In particular, observations beginning in 1990 cannot establish when divergence began around events in 1971 or 1978. Annual discontinuities also require investigation of underlying series before attributing them to real-world events.

## 2. Architecture and data flow

```text
UNDP CSV + metadata workbook
          |
          | Python/pandas, run explicitly by the maintainer
          v
data/clean/hdi_4country.json
          |
          | Express loads once at startup
          v
GET /api/... -> client/src/api.js -> App state
                                      |
                                      v
                       chartData.js pivots time series
                                      |
                                      v
                    Recharts + shared tooltip/formatters
```

These are separate stages. Running the dashboard does not execute Python, and building the client does not regenerate data. This makes startup simple and keeps every viewer on the same committed snapshot. The cost is that updates require an explicit regeneration, review and deployment.

The metadata XLSX is supporting evidence, not a runtime dependency. Keep it: it documents units and definitions that cannot safely be inferred from column names. For example, it identifies GNI as **2021 PPP$**, which corrected the old 2017 chart label.

## 3. File-by-file reading order

| File | Responsibility and things to notice |
| --- | --- |
| `scripts/clean_data.py` | Country/year scope, validation, wide-to-long reshape, missing values, output contract. |
| `data/clean/hdi_4country.json` | Inspect a few records to understand what the API serves. Generated, not manually maintained. |
| `server/index.js` | Read JSON once, register five GET routes, export Express, listen only when executed directly. |
| `api/index.js`, `api/[...path].js` | Small deployment adapters exporting the same app. The latter handles nested API paths. |
| `client/index.html` | HTML shell, page title and description, module entry. |
| `client/src/main.jsx` | Mount React at `#root`, enable development StrictMode. |
| `client/src/App.jsx` | Start requests, hold independent data/loading/error states and switch Full/Compact views. |
| `client/src/components/CompactView.jsx` | Two selectors, metric-specific axes/captions through reused charts, and matching briefs. |
| `client/src/components/InsightPanel.jsx` | Static trend narratives and component comparisons derived from loaded data. |
| `client/src/components/componentMetrics.js` | Shared component names, units and captions for charts/selectors. |
| `client/public/favicon.svg` | Original decorative chart icon using the country palette. |
| `tests/dashboard.test.mjs` | Node tests for data coverage, gaps, calculations, tooltip behavior and local HTTP routes. |
| `client/src/api.js` | Shared fetch/status/JSON handling and four named request functions. |
| `client/src/components/chartData.js` | Convert long records to one row per year. |
| `client/src/components/chartConstants.js` | Country order, colors, tooltip ordering and number formatting. |
| `client/src/components/TrendTooltip.jsx` | Shared time-series tooltip; accepts a formatter for metric-specific units. |
| `client/src/components/*Chart.jsx` | Metric-specific chart axes, geometry, labels and explanatory notes. |
| `client/src/index.css` | Global layout, light/dark variables, responsive sizing and shared tooltip styles. |
| `client/src/components/ComponentsChart.css` | Two-column component panels, stacked on narrow screens. |
| `client/vite.config.js` | React plugin and development `/api` proxy. |
| `client/.oxlintrc.json` | Linter configuration including React hook rules. |
| `package.json`, `client/package.json` | Root orchestration/backend dependencies versus frontend dependencies. |
| `vercel.json` | Install both projects, run the build, publish client output. |

## 4. Understanding the cleaning code

### Scope and source loading

`COUNTRIES` selects ISO3 identifiers rather than display names, avoiding spelling differences. `CORE_YEARS` covers 1990 through 2023; Python's `range(1990, 2024)` excludes its upper bound. `INEQUALITY_YEARS` starts at 2010. These are fixed analytical windows, not automatic detection of the newest year.

Paths are resolved relative to `__file__`, so Python can find the data even when invoked from another working directory. `pd.read_csv(..., encoding="latin1")` matches the existing source-loading setup. Encoding should be reviewed when replacing the source file; Latin-1's ability to decode bytes is not proof that every future file uses it.

Filtering uses `.isin(COUNTRIES)`, then `.copy()` creates an independent frame. The script requires exactly one row per selected country and checks the indicator columns before transforming them. This protects against silently missing countries or changed column names. It does not perform comprehensive validation of every input type or plausible indicator range.

### `indicator_trend(data, indicator)`

The source is wide: columns such as `hdi_1990`, `hdi_1991`, and so on. `melt` turns these into rows while retaining `iso3`. Splitting the column name at its final underscore yields the year; `.astype(int)` makes it numeric. A shared function handles both `hdi` and `gii` because their transformation is identical.

```text
Input:  { iso3: BGD, hdi_1990: 0.397, hdi_1991: ... }
Output: { iso3: BGD, year: 1990, hdi: 0.397 }, ...
```

Long format gives a consistent API contract and is convenient for filtering and independent reuse. Recharts later needs wide rows again; that small display-specific pivot belongs in the frontend instead of making the storage format dependent on one chart library.

### `components_2023(data)`

Selects the four 2023 component columns and renames them to `le`, `eys`, `mys`, and `gnipc`. Their meanings are life expectancy at birth, expected years of schooling, mean years of schooling, and gross national income per capita. The first three are years; the last is 2021 PPP dollars.

This function exports published component values. It does not normalize them or recompute HDI. A future snapshot-year change must update this function, the output key, API access and frontend labels together.

### `inequality_gap(data)`

Iterates over four countries and fourteen years, producing 56 records containing HDI, IHDI and published percentage loss. An explicit loop is easy to read at this scale. A more elaborate vectorized transformation would matter for millions of records, not 56.

The script independently checks:

```text
loss percentage = ((HDI - IHDI) / HDI) × 100
```

It melts and pivots the relevant columns to align each country/year before comparing recomputed and published losses. The maximum absolute difference is printed; the published `loss` remains the output. This is a diagnostic, not an enforced tolerance test. Pandas skips missing pairs when taking the maximum, so the result does not establish completeness. Small discrepancies may arise from rounding.

### `json_records(data)` and serialization

Pandas represents missing numeric observations as NaN. The helper maps missing cells to Python `None`, which JSON encodes as `null`. `allow_nan=False` additionally prevents nonstandard NaN/Infinity output from slipping into the file. Values retain source precision; rounding happens only in tooltips.

The script does not interpolate, fill missing values with zero, remove unusual observations or estimate unavailable years. Those operations would change the evidence. China's missing GII and inequality observations therefore remain explicit gaps.

The fifth output array, `historical_markers`, is hand-authored and separate from the UNDP measurements. It contains 1971, 1978 and 1991 markers.

## 5. API contract and server behavior

All routes are read-only JSON GET endpoints. There is no database, authentication, pagination, country filter or write API.

| Endpoint | Shape | Expected size |
| --- | --- | --- |
| `/api/countries` | `[{iso3, name}]` | 4 countries |
| `/api/hdi-trend` | `{hdi_trend: [{iso3, year, hdi}], historical_markers: [{year, label}]}` | 136 observations + 3 markers |
| `/api/components` | `[{iso3, le, eys, mys, gnipc}]` | 4 observations |
| `/api/inequality-gap` | `[{iso3, year, hdi, ihdi, loss_pct}]` | 56 observations |
| `/api/gii-trend` | `[{iso3, year, gii}]` | 136 observations |

Example actual HDI record: `{"iso3":"BGD","year":1990,"hdi":0.397}`. Missing numeric fields use `null`, not a string. The `/countries` route remains available for external consumers, although the current UI uses fixed constants and does not request it.

`fs.readFileSync` loads the small JSON once before serving requests. That blocks startup briefly but avoids repeated disk reads. Each process or serverless instance has its own snapshot. Restart/redeploy after a data change. If loading fails, the process logs the error and exits rather than serving an incomplete dashboard.

`require.main === module` distinguishes `node server/index.js` from an import. The local command opens a listener on `PORT` or 5000. Deployment adapters import the app without opening their own port. The two short API files represent different route entry points; removing one merely because its contents match risks deployment behavior.

`cors()` allows cross-origin reads. The local UI actually uses Vite's same-origin proxy, but CORS also supports separate API consumers. Unknown paths use Express's default 404 behavior. There is no dedicated health route or structured error middleware.

## 6. React request lifecycle

`App` starts with four `null` datasets and four loading flags. Its effect defines a table of state keys, request functions and setters, then starts each request independently. Shared iteration replaces four copies of the same promise chain without forcing all charts to wait for the slowest request.

The fetch helper checks `response.ok`: fetch itself does not reject simply because the server returned an HTTP error. Successful responses are parsed as JSON. Each section can then succeed or fail independently. A rejected request produces a refresh-to-retry message; there is no automatic retry or cache.

An `AbortController` is created per effect. Cleanup aborts outstanding requests, and each callback checks the signal before updating state. This also accommodates StrictMode's extra development setup/cleanup cycle. A cancelled request should not appear as a user-visible error.

Functional updates such as `setLoading(current => ({ ...current, [key]: false }))` merge a single section's result into the latest state. Reading an old state object from a closure could overwrite another request's update. The render helper gives errors priority, then loading, then the chart.

Keeping ordinary React state fits four fixed sections. A global store or server-state library would add dependencies and concepts without much current benefit. Reconsider a query library if filters, caching, pagination or repeated views appear.

### Full and Compact views

`App` keeps the fetched data while changing views, so toggling does not refetch it. Full view retains the header and four chart sections. `CompactView` has exactly two sections and local state for the trend and component selectors. It starts at HDI/life expectancy; unmounting it by returning to Full view resets those choices on the next visit.

Compact view reuses the existing chart components. This preserves independent x-axis domains (HDI 1970?2023, GII 1990?2023, loss 2010?2023), null values, and HDI-only markers. HDI and GII accept `showAxisLabel`; the inequality chart already labels its percentage axis. `ComponentsChart` accepts an optional `selectedMetric`: absent means all four panels, present means one zero-based chart with its units and caption.

`InsightPanel` receives an indicator and optionally the component dataset and selected metric. Trend text is authored from the verified facts supplied for this project; component numbers use the loaded snapshot and shared formatters. There is no AI request. When updating the source release, review the authored text as well as the numerical values: a dynamically formatted number does not automatically update a written comparison such as "below India".

The shared `.chart-with-insight` grid puts the brief beside the chart above 1000px and below it at smaller widths. Loading/error handling wraps chart and brief together, avoiding an apparently successful brief beside a failed request.

## 7. How the charts work

`pivotByYear(records, metric)` uses a `Map` keyed by year. A row such as `{year: 2023, BGD: 0.685, IND: 0.685, ...}` lets each Recharts `Line` read its country's field. Sorting numerically prevents source order from affecting the timeline. Nulls survive the pivot. Duplicate country/year input would overwrite an earlier value; the generated contract assumes uniqueness.

`COUNTRIES` controls line and legend order. `COLORS` makes a country recognizable across panels. `sortTooltipPayload` sorts numeric values descending, puts missing values last and uses the fixed country order for ties. It includes all four countries even when one has no value. That is numerical ordering, not a favorable-outcome ranking: lower GII and inequality loss are preferable.

The shared tooltip accepts a formatting function. HDI/GII use three decimals, percentages use one decimal plus `%`, schooling/life expectancy use one decimal, and income uses grouped whole numbers. Zero is formatted as a valid number; `null`/nonnumeric values display `no data`. Shared CSS follows the page theme.

`ResponsiveContainer` measures the available width; explicit heights reserve space. Component panels use a CSS grid, changing from two columns to one below 700px. The individual chart files remain separate because their units, annotations and domains differ.

| Chart | Design choice | Consequence |
| --- | --- | --- |
| HDI | Time-series lines; x-axis 1970–2023; automatic y-domain | Fits historical context, but leaves pre-1990 empty space and can visually magnify differences. |
| Components | Four separate zero-based bar charts | Avoids mixing income and years on a single axis; bar heights across different panels are not directly comparable. |
| Inequality loss | Percentage trend; source `loss_pct` | Shows relative loss rather than the absolute HDI–IHDI difference. |
| GII | Lines with y-axis starting at zero | Lower values are better; missing early China observations stay missing. |

Lines use `type="monotone"` for smooth visual paths. This is a rendering choice between observed points, not a model that estimates missing observations. Recharts does not connect null gaps by default. Dots are hidden to reduce clutter, while hover exposes recorded values. Chart animations are disabled so selector changes immediately show the recorded values rather than intermediate animated shapes.

The GII note and brief explicitly identify Bangladesh's jumps around 2001?2004 and 2008, and Pakistan's around 2003, as likely data/survey artifacts, following the input-series review supplied by the project owner. The cleaning script does not reproduce that input-series audit. Do not present those jumps as real one-year events or infer causal effects from the historical markers.

## 8. Why this stack, and when alternatives would help

| Current approach | Why it fits | Alternative and when to reconsider |
| --- | --- | --- |
| pandas preprocessing | Clear selection, melt/pivot, missing-value handling | Standard-library CSV avoids a dependency but requires more manual reshape code; SQL suits larger joined datasets. |
| Committed JSON | Small, auditable, reproducible snapshot; no runtime Python | A database helps with frequent updates, writes or large queryable collections. |
| Express API | Small explicit API, shared local/deployment implementation | Serving JSON statically is a valid simpler option for this fixed dashboard; Express is useful if API behavior will grow. |
| React | Components match independent charts and loading states | Plain JavaScript could serve this small app but makes state/render coordination more manual. |
| Recharts | Declarative React chart primitives and hover/resizing support | D3 offers finer control at the cost of more custom drawing and interaction code. |
| Vite | Development server, React integration, static client build | A server-rendering framework becomes useful if routing, content indexing or server-rendered pages become requirements. |
| JavaScript | Low setup overhead for the existing small app | TypeScript can catch data-shape mistakes as contracts and contributors grow; current code has no runtime schema validator. |
| Separate npm projects | Keeps browser and server dependencies distinct | npm workspaces could centralize installation/locking as additional packages appear. |
| Shared small helpers | Removes repeated behavior without hiding chart-specific choices | A single configurable chart engine becomes worthwhile only when many more charts share the same structure. |

The CSV, metadata and cleaned JSON are different artifacts with different purposes, not redundant copies. Likewise, both npm lockfiles are needed for their respective `npm ci` commands.

## 9. Commands and configuration

| Root command | Purpose |
| --- | --- |
| `npm run dev` | Run Express and Vite together using concurrently. |
| `npm run server` | Start only the local API. |
| `npm run lint` | Run the client's configured Oxlint checks. |
| `npm test` | Run Node regression tests without adding a test-framework dependency. |
| `npm run build` | Build the already installed client dependencies. |
| `npm run clean:data` | Regenerate JSON using `python` on PATH; install requirements in that interpreter first. |

Installation is separate from building: run `npm ci` and `npm ci --prefix client` first. Vercel's install command performs both. This avoids a build unexpectedly installing dependencies or updating resolution.

The backend respects `PORT`; Vite's proxy currently targets port 5000 explicitly. If you change the backend port, update the proxy too. The frontend uses relative `/api` URLs, so ordinary deployments need the UI and API under the same origin. There are no frontend environment variables to configure today.

`vite preview` serves the static build without the development proxy. For production outside Vercel, serve `client/dist` and route `/api/*` to Express with a reverse proxy, or explicitly add static-file serving to the server. The current Express app only serves JSON.

## 10. Maintaining and extending the project

### Update the data release

1. Preserve the new original CSV and metadata, including the release citation.
2. Review column names, encoding, units and comparability with the previous release.
3. Update the script's filename, year windows and component snapshot selection.
4. Update `components_2023` references in the script/server and year labels/domains in the UI.
5. Regenerate JSON, inspect counts/missing values, and review the inequality diagnostic.
6. Review source-specific explanatory notes, update both guides, lint/build, and restart/redeploy.

### Add a country

Update Python `COUNTRIES`, frontend `COUNTRIES`/`COLORS`, and the server's `/countries` response. Review titles and explanatory notes, regenerate data and inspect all charts. These country definitions remain duplicated across the Python, server and browser boundaries; a shared configuration could be introduced if the selection becomes dynamic. Do not assume source row order matches legend order.

### Add an indicator

Inspect the metadata first. Add a validated extraction and output key, then an API route and client request. Add independent loading/error state in `App`, then a chart with explicit units and a meaningful domain. Reuse `pivotByYear` only for country/year/metric records; a component snapshot has a different shape.

### Troubleshoot

| Symptom | Check |
| --- | --- |
| All charts fail | Confirm Express is running, then open `http://localhost:5000/api/hdi-trend`. Check port conflicts and the Vite proxy. |
| API exits at startup | Confirm the cleaned JSON exists and is valid; regenerate if appropriate. |
| Python cannot import pandas | Install `requirements.txt` with the same interpreter used to run the script. |
| Missing-column or country validation error | Compare the new CSV schema and country rows with the script's fixed expectations. |
| Build works but preview charts fail | Preview does not configure the API proxy; use development mode or a server with `/api` routing. |
| A chart contains gaps | Check `null` values before treating the gap as a rendering bug. |
| Deployment page loads but API returns 404 | Verify deployment root, API entry points and platform routing separately from the client build. |
| Changed data does not appear | Restart the server or redeploy to replace the in-memory snapshot. |

## 11. Cleanup decisions and verification limits

The cleanup removes unused starter assets, the unimported `App.css`, starter-only global selectors, an unused client country-fetch helper and duplicate tooltip/pivot/fetch logic. The old client template README, API response document, cleaning-methodology document and one-line source note are consolidated into the two root guides. The metadata workbook remains the authoritative local reference for indicator units.

Both deployment entry points, raw inputs, generated JSON, lockfiles and linter configuration are intentionally retained. Installed dependencies, local Vercel linkage and generated build output are working artifacts and are not deleted as part of source cleanup.

Lint and build checks do not prove analytical correctness or browser accessibility. Data regeneration should preserve the committed JSON for the same input, and API smoke checks should verify all five endpoints against that JSON. The committed Node regression suite verifies snapshot coverage and uniqueness, preserves the real China gaps through the frontend pivot, crosschecks inequality loss, checks zero/missing tooltip behavior, and exercises all five API endpoints. It does not automate browser interactions or establish statistical validity. Production routing still needs a deployed smoke check, and visual changes should be inspected in a browser at desktop/mobile sizes and in both color themes.

### Checks completed during this review

- At the September 2026 checkpoint, all five `npm test` cases, client lint and production build passed. Vite reported a JavaScript chunk above its 500 kB warning threshold (about 629 kB minified / 185 kB gzip); this is a performance consideration, not a build failure.
- Regeneration produced byte-identical JSON. Counts, country/year coverage and country/year uniqueness passed.
- Missing values matched the documented China gaps. The maximum absolute inequality-loss difference was approximately `4.99e-9` percentage points.
- All five API endpoints passed local HTTP smoke checks; the four data responses matched the cleaned JSON. An unknown route returned 404, and both deployment adapters exported the shared app.
- Desktop/mobile browser smoke checks covered both views, all seven selector briefs, historical markers, axis domains, responsive placement and dark theme using the production build with the real local API. The built favicon returned HTTP 200 with SVG content and was visually checked at 16, 32, 64 and 112 pixels. Earlier view checks also covered gaps and independent request errors. A comprehensive accessibility audit and a live Vercel check remain outstanding.

### Milestone follow-ups

The viewer README records the September 2026 checkpoint and remaining work. The JavaScript bundle still exceeds Vite's 500 kB warning threshold. No code splitting is claimed here. A future browser-test setup should exercise all seven selector options, brief changes, axis labels/domains, missing intervals and desktop/mobile positioning. An accessible data-table/download view would also make exact values available without relying on chart hover.

The favicon is repo-native SVG, so it needs no image-generation service or build dependency. Vite copies it from `client/public` to the build root; `client/index.html` references `/favicon.svg`. Its bar heights are decorative and do not encode country statistics.
