# Human Development: Bangladesh and Regional Comparisons

An interactive dashboard comparing Bangladesh, India, Pakistan and China using the **UNDP Human Development Report 2025 composite indices time series**. It explores development outcomes through 2023, including health, education, income and inequality.

This is an independent analytical project using UNDP data, not an official UNDP application. Comparisons are descriptive: historical reference lines provide context and do not demonstrate what caused a change.

## Explore the dashboard

**Full view** opens by default and keeps all four chart groups visible. **Compact view** has two panels: one selector for HDI, GII or inequality loss, and one for the four 2023 components. Compact selectors initially show HDI and life expectancy; returning to Compact view resets those selections.

Both views include "What this means for Bangladesh" briefs. In Compact view, the brief changes with the indicator. Briefs sit beside the charts on desktop and below them on smaller screens. They describe comparisons, not causes.

| View | Coverage | How to read it |
| --- | --- | --- |
| Human Development Index (HDI) | 1990–2023 | Higher values indicate higher human development. Hover to compare countries. |
| Health, education and income | 2023 | Separate bar charts show life expectancy, expected and mean years of schooling, and GNI per capita in **2021 PPP dollars**. Their units and scales differ. |
| Share of HDI lost to inequality | 2010–2023 | Lower percentages indicate a smaller loss relative to HDI. |
| Gender Inequality Index (GII) | 1990–2023 | Lower values indicate less gender inequality. |

Country codes are BGD (Bangladesh), IND (India), PAK (Pakistan) and CHN (China). Colors remain consistent across charts. Tooltips sort values from highest to lowest; that order is not always a ranking from best to worst.

China has no GII values for 1990–1997 and no IHDI/loss values for 2010–2012 in this extract. Those values remain missing rather than being replaced with zero or estimated. HDI observations start in 1990 even though its axis extends to 1970 to accommodate historical markers.

## Run locally

Prerequisites: Node.js and npm. Node **24.11.1** was used for verification. Python is only needed to regenerate the already included cleaned data.

From the repository root:

```sh
npm ci
npm ci --prefix client
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The API runs on port 5000, and Vite forwards `/api` requests to it. Keep the terminal running; Ctrl+C stops development.

```sh
npm test
npm run lint
npm run build
```

The build produces `client/dist`. `npm --prefix client run preview` previews those static files but does **not** supply the API proxy. Use `npm run dev` for a complete local dashboard, or serve the build with `/api` routed to Express.

## Data and reproducibility

The original CSV and metadata workbook are preserved in `data/raw/`. The dashboard reads the committed `data/clean/hdi_4country.json`; it does not fetch live data from UNDP.

To regenerate it with Python 3.11 (verified with 3.11.9):

```sh
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python scripts/clean_data.py
# macOS/Linux: use .venv/bin/python for the two commands above.
```

The script filters four countries, reshapes selected columns, retains missing values as JSON `null`, and reports a check of published inequality losses. Restart the API after regenerating data.

Source: UNDP (United Nations Development Programme), *Human Development Report 2025: A matter of choice: People and possibilities in the age of AI*, New York. The bundled metadata workbook supplies indicator definitions and units. Retain source attribution when reusing the data.

## Project layout

```text
client/                 React dashboard, Recharts visualizations, Vite configuration
server/index.js         Shared Express API; also starts the local server
api/                    Vercel entry points that export the shared API
scripts/clean_data.py   Reproducible CSV-to-JSON transformation
data/raw/               Original UNDP CSV and indicator metadata
data/clean/             Generated dashboard dataset
requirements.txt        Python dependency for data preparation
vercel.json             Installation, build and output configuration
DEVELOPER_GUIDE.md      Code walkthrough, design reasoning and maintenance guide
```

The `tests/` directory contains repeatable data, missing-value, tooltip and API checks, run with `npm test`. The favicon is a small SVG chart using the four country colors; its bars are decorative, not another data visualization.

Two npm manifests and lockfiles are intentional: the root owns the API/development runner, while `client/` owns the browser application.

## Deployment

Import the repository into Vercel with the repository root as the project root. `vercel.json` installs both npm projects, builds the client, and identifies `client/dist` as the output. Files under `api/` export Express for API requests. No application secrets or database configuration are required. Check both the page and `/api/hdi-trend` after deployment; a successful static build alone does not verify serverless routing.

For implementation details, API response shapes, troubleshooting and the reasons behind the design, read [the developer guide](DEVELOPER_GUIDE.md).

## Milestone checkpoint: September 2026

This checkpoint includes Full/Compact views, indicator-specific briefs, preserved source gaps, an original chart favicon and repeatable regression checks. Run `npm test`, `npm run lint` and `npm run build` before recording a release or milestone commit.

Before sharing the deployed milestone, confirm the deployed page and all five API routes work, then check both view selectors on a phone. Add the verified live URL here once available. The local build cannot verify Vercel routing.

Remaining improvements are a smaller JavaScript bundle, a committed browser-test setup, a downloadable accessible data table, and repository license text (the package metadata currently declares ISC, but no LICENSE file is included). These are recorded follow-ups rather than claims that the current dashboard already provides them.
