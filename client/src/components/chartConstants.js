export const COUNTRIES = ["BGD", "IND", "PAK", "CHN"];

export const COLORS = {
    BGD: "#2563eb",
    IND: "#dc2626",
    PAK: "#16a34a",
    CHN: "#d97706",
};

export function sortTooltipPayload(payload) {
    const valuesByCountry = new Map(payload.map(({ dataKey, value }) => [dataKey, value]));
    const countryOrder = new Map(COUNTRIES.map((country, index) => [country, index]));

    return COUNTRIES.map((dataKey) => ({ dataKey, value: valuesByCountry.get(dataKey) })).sort((first, second) => {
        const firstValue = typeof first.value === "number" ? first.value : null;
        const secondValue = typeof second.value === "number" ? second.value : null;

        if (firstValue === null && secondValue === null) {
            return countryOrder.get(first.dataKey) - countryOrder.get(second.dataKey);
        }
        if (firstValue === null) return 1;
        if (secondValue === null) return -1;
        return secondValue - firstValue || countryOrder.get(first.dataKey) - countryOrder.get(second.dataKey);
    });
}

const numberFormatters = {
    decimals3: new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    decimals1: new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    integer: new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
};

export function formatValue(value, formatter, suffix = "") {
    if (value == null || typeof value !== "number") return "no data";
    return `${formatter.format(value)}${suffix}`;
}

export function formatThreeDecimals(value) {
    return formatValue(value, numberFormatters.decimals3);
}

export function formatOneDecimal(value) {
    return formatValue(value, numberFormatters.decimals1);
}

export function formatInteger(value) {
    return formatValue(value, numberFormatters.integer);
}

export function formatLossPercentage(value) {
    return formatValue(value, numberFormatters.decimals1, "%");
}
