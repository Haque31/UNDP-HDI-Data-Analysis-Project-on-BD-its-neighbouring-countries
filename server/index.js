const cors = require("cors");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
const dataPath = path.resolve(__dirname, "..", "data", "clean", "hdi_4country.json");

let dashboardData;

try {
    // Load static dashboard data once so requests only read from memory.
    dashboardData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
} catch (error) {
    console.error(`Failed to load dashboard data from ${dataPath}:`, error.message);
    process.exit(1);
}

app.use(cors());

function getCountries(_request, response) {
    response.json([
        { iso3: "BGD", name: "Bangladesh" },
        { iso3: "IND", name: "India" },
        { iso3: "PAK", name: "Pakistan" },
        { iso3: "CHN", name: "China" },
    ]);
}

function getHdiTrend(_request, response) {
    response.json({
        hdi_trend: dashboardData.hdi_trend,
        historical_markers: dashboardData.historical_markers,
    });
}

function getComponents(_request, response) {
    response.json(dashboardData.components_2023);
}

function getInequalityGap(_request, response) {
    response.json(dashboardData.inequality_gap);
}

function getGiiTrend(_request, response) {
    response.json(dashboardData.gii_trend);
}

app.get("/api/countries", getCountries);
app.get("/api/hdi-trend", getHdiTrend);
app.get("/api/components", getComponents);
app.get("/api/inequality-gap", getInequalityGap);
app.get("/api/gii-trend", getGiiTrend);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Dashboard API listening on port ${port}`);
    });
}

module.exports = app;