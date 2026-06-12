const API = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function hasToken() {
  return Boolean(getToken());
}

export async function login(username, password) {
  return request(`${API}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username, password) {
  return request(`${API}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchMe() {
  return request(`${API}/auth/me`);
}

export async function fetchAccounts() {
  return request(`${API}/accounts`);
}

export async function fetchAccount(accountId) {
  return request(`${API}/accounts/${accountId}`);
}

export async function fetchDashboard({ accountId, year, month, months = 6 } = {}) {
  const params = new URLSearchParams();
  if (accountId) params.set('accountId', accountId);
  if (year) params.set('year', year);
  if (month) params.set('month', month);
  if (months) params.set('months', months);
  return request(`${API}/dashboard?${params}`);
}

export async function fetchTransactions(accountId) {
  return request(`${API}/accounts/${accountId}/transactions`);
}

export async function fetchAccountActivity(accountId) {
  return request(`${API}/accounts/${accountId}/activity`);
}

export async function createTransfer(data) {
  return request(`${API}/transfers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteTransfer(id) {
  return request(`${API}/transfers/${id}`, { method: 'DELETE' });
}

export async function fetchBudgets({ accountId, year, month }) {
  const params = new URLSearchParams({ accountId });
  if (year) params.set('year', year);
  if (month) params.set('month', month);
  return request(`${API}/budgets?${params}`);
}

export async function createBudget(data) {
  return request(`${API}/budgets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBudget(id, data) {
  return request(`${API}/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBudget(id) {
  return request(`${API}/budgets/${id}`, { method: 'DELETE' });
}

export async function addTransaction(accountId, data) {
  return request(`${API}/accounts/${accountId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(id, data) {
  return request(`${API}/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id) {
  return request(`${API}/transactions/${id}`, { method: 'DELETE' });
}
