async function getJson(endpoint, signal) {
    const response = await fetch(`/api/${endpoint}`, { signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export const getHdiTrend = (signal) => getJson("hdi-trend", signal);
export const getComponents = (signal) => getJson("components", signal);
export const getInequalityGap = (signal) => getJson("inequality-gap", signal);
export const getGiiTrend = (signal) => getJson("gii-trend", signal);
