# Data Cleaning — Reasoning & Approach

## What this project is (and isn't)

This is a personal project built because the dataset itself raised an
interesting question, not a deliverable built to spec for anyone. It's
being shown as part of an internship application because it happens to be
relevant — UNDP publishes this data — not because it was built to satisfy
a brief. That distinction matters for how the analysis is framed below:
the dashboard shows what the data shows; it does not claim to prove why.

## The question

Bangladesh, India and Pakistan shared a common starting point before 1971.
China took a completely separate path. Looking at their Human Development
Index trajectories side by side raises an obvious question: what happened
to each of them, and does the data reflect known historical turning points?

**Important scope boundary:** the HDI/IHDI/GII dataset contains development
outcomes (life expectancy, education, income, inequality) — it contains no
data on governance, conflict, trade policy, or foreign aid. So this project
does not attempt to prove causation from the numbers alone. Instead, known
historical events (independence, policy shifts) are plotted as reference
markers alongside the trend line — juxtaposition, not inference. The
markers come from general historical knowledge, not from this dataset, and
are labeled as such in the dashboard itself.

Historical markers used:
- **1971** — Bangladesh's independence from Pakistan (also the point where
  BD and Pakistan's development paths, nearly identical in 1990, begin to
  diverge sharply)
- **1978** — China's economic reforms begin (Deng Xiaoping's "Reform and
  Opening-up")
- **1991** — India's economic liberalization (optional second marker for
  India specifically)

## Data source

- File: `HDR25_Composite_indices_complete_time_series.csv` +
  `HDR25_Composite_indices_metadata.xlsx`, from UNDP's Human Development
  Reports Data Center (hdr.undp.org → Data Center → Documentation and
  downloads).
- Citation (from the metadata file): *"Source: UNDP (United Nations
  Development Programme). 2025. Human Development Report 2025 - A matter
  of choice: People and possibilities in the age of AI. New York."*
- Encoding is **latin1**, not utf-8 (confirmed by trial — utf-8 throws a
  `UnicodeDecodeError` partway through the file).

## Countries and why

`BGD`, `IND`, `PAK`, `CHN` — chosen specifically because three of them
share a common origin point (undivided India pre-1947, then Bangladesh's
1971 split from Pakistan) and the fourth (China) is a deliberate outside
comparator with a completely different post-1990 trajectory. This isn't a
"pick some neighbors" comparison — the four were chosen because their
shared and divergent histories make the HDI trend chart mean something.

Data completeness was checked for all four before committing to them:

| Country | `hdi` | `ihdi` / `loss` | `gii` | `le`/`eys`/`mys`/`gnipc` |
|---|---|---|---|---|
| BGD | complete (1990-2023) | complete (2010-2023) | complete (1990-2023) | complete |
| IND | complete | complete | complete | complete |
| PAK | complete | complete | complete | complete |
| CHN | complete | missing 2010-2012 | missing 1990-1997 | complete |

China's gaps are real and are rendered as actual gaps in the relevant
charts (a break in the line, not an interpolated value). This is stated
here rather than discovered by a reviewer poking at the chart.

## Why the `loss` column is used as-is, but checked

UNDP already publishes `loss_<year>` = `(hdi - ihdi) / hdi * 100`. The
cleaning script pulls this column directly but also recomputes it
independently and diffs the two, for every country-year where both `hdi`
and `ihdi` exist. A near-zero diff confirms the reshape logic is correct —
a computed-vs-published crosscheck, not blind trust in either source.

## Why long-format JSON, split into purpose-built arrays

The API and frontend need different slices of the same data (a full time
series for the trend chart, a single year for the bar chart, a restricted
range for the inequality chart). `clean_data.py` produces four arrays —
`hdi_trend`, `components_2023`, `inequality_gap`, `gii_trend` — so each
API endpoint and chart component consumes its array directly, with no
extra client-side filtering logic.

Historical markers are a fifth, separate, hand-authored array
(`historical_markers`) — not derived from the CSV at all, kept explicitly
apart from the UNDP-sourced data so it's never mistaken for something the
dataset itself asserts.

## Known limitations (stated, not hidden)

- China's `ihdi`/`loss` (2010-2012) and `gii` (1990-1997) have real gaps in
  the source data. Charts show the gap; nothing is interpolated across it.
- Historical markers are hand-picked and reflect general historical
  knowledge, not data in this file. They're visual context, not evidence.
- No causal claims are made anywhere in this project — divergence in the
  charts is described, not explained. Any "why" discussion (e.g. what
  specifically drove the Bangladesh/Pakistan divergence, or the
  Bangladesh/India GII gap) is left as an open question for the writeup
  or an interview conversation, not asserted by the dashboard itself.
