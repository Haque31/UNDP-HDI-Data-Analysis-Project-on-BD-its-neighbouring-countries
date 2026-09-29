import json
from pathlib import Path

import pandas as pd


COUNTRIES = ["BGD", "IND", "PAK", "CHN"]
CORE_YEARS = range(1990, 2024)
INEQUALITY_YEARS = range(2010, 2024)


def indicator_trend(data, indicator):
    columns = [f"{indicator}_{year}" for year in CORE_YEARS]
    long_data = data.melt(
        id_vars="iso3",
        value_vars=columns,
        var_name="indicator_year",
        value_name=indicator,
    )
    long_data["year"] = long_data["indicator_year"].str.rsplit(
        "_", n=1).str[1].astype(int)
    return json_records(long_data[["iso3", "year", indicator]])


def components_2023(data):
    columns = ["iso3", "le_2023", "eys_2023", "mys_2023", "gnipc_2023"]
    result = data[columns].rename(
        columns={
            "le_2023": "le",
            "eys_2023": "eys",
            "mys_2023": "mys",
            "gnipc_2023": "gnipc",
        }
    )
    return json_records(result)


def inequality_gap(data):
    records = []
    for _, row in data.iterrows():
        for year in INEQUALITY_YEARS:
            records.append(
                {
                    "iso3": row["iso3"],
                    "year": year,
                    "hdi": float(row[f"hdi_{year}"]),
                    "ihdi": row[f"ihdi_{year}"],
                    "loss_pct": row[f"loss_{year}"],
                }
            )
    return json_records(pd.DataFrame(records))


def json_records(data):
    records = data.to_dict("records")
    return [
        {
            key: None if pd.isna(value) else value
            for key, value in record.items()
        }
        for record in records
    ]


def main():
    project_root = Path(__file__).resolve().parent.parent
    input_path = project_root / "data" / "raw" / \
        "HDR25_Composite_indices_complete_time_series.csv"
    output_path = project_root / "data" / "clean" / "hdi_4country.json"

    data = pd.read_csv(input_path, encoding="latin1")
    data = data[data["iso3"].isin(COUNTRIES)].copy()
    if set(data["iso3"]) != set(COUNTRIES) or data["iso3"].duplicated().any():
        raise ValueError("Expected exactly one source row for each selected country")

    required_columns = {"iso3", "country"}
    required_columns.update(f"hdi_{year}" for year in CORE_YEARS)
    required_columns.update(f"gii_{year}" for year in CORE_YEARS)
    required_columns.update(
        f"{prefix}_{year}"
        for prefix in ("ihdi", "loss")
        for year in INEQUALITY_YEARS
    )
    required_columns.update(
        f"{prefix}_2023" for prefix in ("le", "eys", "mys", "gnipc"))
    missing_columns = sorted(required_columns - set(data.columns))
    if missing_columns:
        raise ValueError(f"Missing expected columns: {missing_columns}")

    check = data.melt(
        id_vars="iso3",
        value_vars=[f"{prefix}_{year}" for prefix in (
            "hdi", "ihdi", "loss") for year in INEQUALITY_YEARS],
        var_name="indicator_year",
        value_name="value",
    )
    check[["indicator", "year"]] = check["indicator_year"].str.rsplit(
        "_", n=1, expand=True)
    check = check.pivot(index=["iso3", "year"],
                        columns="indicator", values="value").reset_index()
    check["recomputed_loss"] = (
        check["hdi"] - check["ihdi"]) / check["hdi"] * 100
    max_difference = (check["recomputed_loss"] - check["loss"]).abs().max()
    print(f"Max absolute loss difference: {max_difference}")

    result = {
        "hdi_trend": indicator_trend(data, "hdi"),
        "components_2023": components_2023(data),
        "inequality_gap": inequality_gap(data),
        "gii_trend": indicator_trend(data, "gii"),
        "historical_markers": [
            {"year": 1971, "label": "Bangladesh independence"},
            {"year": 1978, "label": "China economic reforms begin"},
            {"year": 1991, "label": "India economic liberalization"},
        ],
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2, allow_nan=False), encoding="utf-8")


if __name__ == "__main__":
    main()
