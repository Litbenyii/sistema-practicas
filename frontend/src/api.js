const API_URL = 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : null,
  });

  if (!res.ok) {
    let msg = 'Error en la solicitud';
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch (e) {
      // ignore parse error
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ==== Auth ====

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

// ==== Ofertas y postulaciones ====

export async function getOffers(token) {
  return request('/offers', { token });
}

export async function applyToOffer(token, offerId) {
  return request('/applications', {
    method: 'POST',
    token,
    body: { offerId },
  });
}

export async function getMyApplications(token) {
  return request('/applications/me', { token });
}

// ==== Solicitud de práctica externa ====

export async function createPracticeRequest(token, payload) {
  return request('/practice-requests', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getMyPracticeRequests(token) {
  return request('/practice-requests/me', { token });
}
