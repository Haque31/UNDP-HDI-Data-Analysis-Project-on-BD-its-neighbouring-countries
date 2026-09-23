# Data Cleaning — Reasoning & Approach

## What this step does and why

The raw UNDP file is one row per country with ~1,100 columns, most of them
`<indicator>_<year>`. That layout is fine for a statistics office but useless
for charting: Recharts (and any API serving it) wants **one record per
country-year-value**, not one giant row. So the entire job of `clean_data.py`
is a reshape — wide to long — plus narrowing 206 countries down to the 2 this
project actually covers, and 1,100 columns down to the ~5 indicators the
dashboard uses.

## Data source

- File: `HDR25_Composite_indices_complete_time_series.csv` +
  `HDR25_Composite_indices_metadata.xlsx`, downloaded from UNDP's Human
  Development Reports Data Center (hdr.undp.org → Data Center →
  Documentation and downloads).
- Citation (from the metadata file): *"Source: UNDP (United Nations
  Development Programme). 2025. Human Development Report 2025 - A matter of
  choice: People and possibilities in the age of AI. New York."*
- Encoding is **latin1**, not utf-8 — confirmed by trial (utf-8 throws a
  `UnicodeDecodeError` partway through the file). Worth stating explicitly
  since it's the kind of thing that silently breaks a script on a different
  machine.

## Why Bangladesh vs. India, and why this scope

Two considerations decided the comparison, not just "pick a neighbor":

1. **Data completeness.** Checked both countries for null values across
   `hdi`, `ihdi`, `gii`, `le`, `eys`, `mys`, `gnipc` before committing —
   zero missing values in any series for either country. A comparison
   built on a country with data gaps would mean either awkward chart gaps
   or quietly-interpolated numbers, neither of which is honest.
2. **The data itself turned out to have a real story.** Bangladesh and
   India converge to the *same* HDI value in 2023 (0.685, tied rank 130)
   despite Bangladesh starting well behind in 1990. That's a legitimate
   trend to show, not a story picked first and then forced onto the data.

The code is structured so a third or fourth country is a one-line change to
the `iso3` filter list, not a rewrite — the reshape logic doesn't care how
many countries are selected.

## Why the different indicator blocks get different treatment

The raw file isn't internally consistent in its year coverage, and the
cleaning script has to respect that rather than paper over it:

| Indicator | Years available | Why |
|---|---|---|
| `hdi`, `gii`, `le`, `eys`, `mys`, `gnipc` | 1990–2023 | Core HDI has been computed since 1990 |
| `ihdi`, `loss` | 2010–2023 only | UNDP didn't start publishing inequality-adjusted HDI until 2010 |

Practical effect: the HDI trend chart can span 34 years, but the
inequality-gap chart can only span 14. This is called out here and in the
dashboard's own README rather than silently truncating the trend chart to
match, or silently extending the inequality chart with data that doesn't
exist. Same principle as flagging the homology-split limitation in the AMP
project — a missing decade of data is a limitation to state, not a gap to
hide.

## Why the `loss` column is used as-is, but checked

UNDP already publishes `loss_<year>` = the % of HDI "lost" to internal
inequality, which is algebraically `(hdi - ihdi) / hdi * 100`. Two options:
recompute it, or trust theirs. The script does **both** — pulls their
column directly (it's the authoritative number, and matches what UNDP
itself would show), but also recomputes it independently and diffs the two.
If the diff is near-zero, that's a confirmation the reshape logic is
correct — a computed-vs-published crosscheck rather than a blind trust in
either source.

## Why the output is long-format JSON, split into four arrays

The API and the frontend charts need different slices of the same data
(a full time series for the trend chart, a single year for the bar chart,
a restricted time range for the inequality chart). Rather than one giant
array the frontend has to filter client-side, `clean_data.py` produces four
purpose-built arrays (`hdi_trend`, `components_2023`, `inequality_gap`,
`gii_trend`) so each API endpoint and each chart component can consume its
array directly with no extra transformation logic downstream. This also
keeps the reshape logic — the part actually worth testing — contained to
one script, rather than spread across the API layer too.

## Known limitations (stated, not hidden)

- Only two countries. Regional averages or a broader South Asia comparison
  would need re-running the reshape over more `iso3` values — deliberately
  out of scope for the time available, not an oversight.
- `gii_trend` is treated as a stretch feature for the dashboard, even
  though the underlying data for it is as complete as `hdi`. The
  limitation is on build time, not data availability.
- No causal claims are made from the Bangladesh/India GII gap (0.487 vs.
  0.403 in 2023) without looking at the sub-components (maternal
  mortality, parliamentary seats, labor force participation) that drive
  it. The dashboard shows the gap; it doesn't explain it unless that
  follow-up analysis actually gets done.
