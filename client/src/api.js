const API_BASE_URL = "http://localhost:5000";

export async function getCountries() {
    const response = await fetch(`${API_BASE_URL}/api/countries`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getHdiTrend() {
    const response = await fetch(`${API_BASE_URL}/api/hdi-trend`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getComponents() {
    const response = await fetch(`${API_BASE_URL}/api/components`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getInequalityGap() {
    const response = await fetch(`${API_BASE_URL}/api/inequality-gap`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getGiiTrend() {
    const response = await fetch(`${API_BASE_URL}/api/gii-trend`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}