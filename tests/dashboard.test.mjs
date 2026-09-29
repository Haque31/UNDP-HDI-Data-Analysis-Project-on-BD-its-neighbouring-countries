import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { once } from "node:events";
import test from "node:test";
import { pivotByYear } from "../client/src/components/chartData.js";
import { COUNTRIES, formatThreeDecimals, formatLossPercentage, sortTooltipPayload } from "../client/src/components/chartConstants.js";

const require = createRequire(import.meta.url);
const data = JSON.parse(await readFile(new URL("../data/clean/hdi_4country.json", import.meta.url), "utf8"));

test("HDR25 snapshot has complete, unique country/year slots", () => {
    for (const [key, start, metric] of [["hdi_trend", 1990, "hdi"], ["gii_trend", 1990, "gii"], ["inequality_gap", 2010, "loss_pct"]]) {
        const rows = data[key];
        assert.equal(rows.length, COUNTRIES.length * (2024 - start));
        const slots = new Set(rows.map(({ iso3, year }) => `${iso3}:${year}`));
        assert.equal(slots.size, rows.length, `${key}: duplicate country/year`);
        for (const country of COUNTRIES) {
            for (let year = start; year <= 2023; year++) assert.ok(slots.has(`${country}:${year}`));
        }
        assert.ok(rows.every((row) => row[metric] === null || Number.isFinite(row[metric])));
    }
    assert.deepEqual(data.components_2023.map(({ iso3 }) => iso3).sort(), [...COUNTRIES].sort());
});

test("China's missing observations survive the chart pivot as nulls", () => {
    for (const [key, metric, first, lastMissing] of [["gii_trend", "gii", 1990, 1997], ["inequality_gap", "loss_pct", 2010, 2012], ["inequality_gap", "ihdi", 2010, 2012]]) {
        const source = data[key];
        const rows = pivotByYear([...source].reverse(), metric);
        assert.deepEqual(rows.filter(({ CHN }) => CHN === null).map(({ year }) => year),
            Array.from({ length: lastMissing - first + 1 }, (_, index) => first + index));
        assert.equal(typeof rows.find(({ year }) => year === lastMissing + 1).CHN, "number");
        for (const row of rows) {
            for (const country of COUNTRIES) {
                assert.equal(row[country], source.find((record) => record.iso3 === country && record.year === row.year)[metric]);
            }
        }
    }
});

test("published inequality loss agrees with HDI/IHDI within rounding tolerance", () => {
    for (const { iso3, year, hdi, ihdi, loss_pct } of data.inequality_gap) {
        if (ihdi === null) {
            assert.equal(loss_pct, null);
        } else {
            assert.ok(Math.abs((hdi - ihdi) / hdi * 100 - loss_pct) < 1e-6, `${iso3} ${year}`);
        }
    }
});

test("tooltips distinguish zero from missing data and sort ties consistently", () => {
    assert.equal(formatThreeDecimals(null), "no data");
    assert.equal(formatThreeDecimals(0), "0.000");
    assert.equal(formatLossPercentage(0), "0.0%");
    const result = sortTooltipPayload([{ dataKey: "IND", value: 0.685 }, { dataKey: "BGD", value: 0.685 }, { dataKey: "PAK", value: 0 }]);
    assert.deepEqual(result.map(({ dataKey }) => dataKey), ["BGD", "IND", "PAK", "CHN"]);
    assert.equal(result.at(-1).value, undefined);
});

test("all public API routes return the snapshot and unknown routes return 404", async (t) => {
    const app = require("../server");
    const server = app.listen(0, "127.0.0.1");
    t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const expected = {
        "hdi-trend": { hdi_trend: data.hdi_trend, historical_markers: data.historical_markers },
        components: data.components_2023,
        "inequality-gap": data.inequality_gap,
        "gii-trend": data.gii_trend,
    };
    for (const [route, value] of Object.entries(expected)) {
        const response = await fetch(`${base}/${route}`);
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type"), /application\/json/);
        assert.deepEqual(await response.json(), value);
    }
    const response = await fetch(`${base}/countries`);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).map(({ iso3 }) => iso3), COUNTRIES);
    assert.equal((await fetch(`${base}/not-a-route`)).status, 404);
    assert.equal(require("../api/index"), app);
    assert.equal(require("../api/[...path]"), app);
});
