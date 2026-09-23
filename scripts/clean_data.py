import json
from pathlib import Path

import pandas as pd


COUNTRIES = ["BGD", "IND"]
CORE_YEARS = range(1990, 2024)
INEQUALITY_YEARS = range(2010, 2024)


def hdi_trend(data):
    columns = [f"hdi_{year}" for year in CORE_YEARS]
    long_data = data.melt(
        id_vars="iso3",
        value_vars=columns,
        var_name="indicator_year",
        value_name="hdi",
    )
    long_data["year"] = long_data["indicator_year"].str.rsplit(
        "_", n=1).str[1].astype(int)
    return long_data[["iso3", "year", "hdi"]].astype({"hdi": float}).to_dict("records")


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
    return result.astype({"le": float, "eys": float, "mys": float, "gnipc": float}).to_dict("records")


def inequality_gap(data):
    records = []
    for _, row in data.iterrows():
        for year in INEQUALITY_YEARS:
            records.append(
                {
                    "iso3": row["iso3"],
                    "year": year,
                    "hdi": float(row[f"hdi_{year}"]),
                    "ihdi": float(row[f"ihdi_{year}"]),
                    "loss_pct": float(row[f"loss_{year}"]),
                }
            )
    return records


def gii_trend(data):
    columns = [f"gii_{year}" for year in CORE_YEARS]
    long_data = data.melt(
        id_vars="iso3",
        value_vars=columns,
        var_name="indicator_year",
        value_name="gii",
    )
    long_data["year"] = long_data["indicator_year"].str.rsplit(
        "_", n=1).str[1].astype(int)
    return long_data[["iso3", "year", "gii"]].astype({"gii": float}).to_dict("records")


def main():
    project_root = Path(__file__).resolve().parent.parent
    input_path = project_root / "data" / "raw" / \
        "HDR25_Composite_indices_complete_time_series.csv"
    output_path = project_root / "data" / "clean" / "hdi_bgd_ind.json"

    data = pd.read_csv(input_path, encoding="latin1")
    data = data[data["iso3"].isin(COUNTRIES)].copy()

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
        "hdi_trend": hdi_trend(data),
        "components_2023": components_2023(data),
        "inequality_gap": inequality_gap(data),
        "gii_trend": gii_trend(data),
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
