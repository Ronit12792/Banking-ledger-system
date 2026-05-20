const BASE = '/api'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const authAPI = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  logout: (token) => request('POST', '/auth/logout', null, token),
}

export const accountAPI = {
  create: (token) => request('POST', '/accounts', null, token),
  getAll: (token) => request('GET', '/accounts', null, token),
  getBalance: (accountId, token) => request('GET', `/accounts/balance/${accountId}`, null, token),
}

export const transactionAPI = {
  create: (body, token) => request('POST', '/transactions', body, token),
  initialFunds: (body, token) => request('POST', '/transactions/system/initial-funds', body, token),
}
