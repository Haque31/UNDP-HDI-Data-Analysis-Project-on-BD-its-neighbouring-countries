const API_BASE_URL = "/api";

export async function getCountries() {
    const response = await fetch(`${API_BASE_URL}/countries`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getHdiTrend() {
    const response = await fetch(`${API_BASE_URL}/hdi-trend`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getComponents() {
    const response = await fetch(`${API_BASE_URL}/components`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getInequalityGap() {
    const response = await fetch(`${API_BASE_URL}/inequality-gap`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

export async function getGiiTrend() {
    const response = await fetch(`${API_BASE_URL}/gii-trend`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}