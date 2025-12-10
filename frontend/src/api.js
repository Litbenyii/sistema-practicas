const API_URL = "http://localhost:4000";

async function request(path, options = {}) {
  const { headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  if (!res.ok) {
    let msg = "Error en la solicitud";
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch (e) {
      
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getOffers(token) {
  return request("/api/student/offers", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyRequests(token) {
  return request("/api/student/my/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPracticeRequest(token, payload) {
  return request("/api/student/practice-requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function createApplication(token, offerId) {
  return request(`/api/student/applications/${offerId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCoordinatorPracticeRequests(token) {
  return request("/api/coord/external-requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approvePracticeRequest(token, id) {
  return request(`/api/coord/external-requests/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createOffer(token, payload) {
  return request("/api/coord/offers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
