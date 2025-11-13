const API_URL = "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let msg = "Error en la solicitud";
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// auth
export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// estudiante
export async function getOffers(token) {
  return request("/api/offers", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyRequests(token) {
  return request("/api/student/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPracticeRequest(token, payload) {
  return request("/api/practice-requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function createApplication(token, offerId) {
  return request("/api/applications", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ offerId }),
  });
}

// admin
// lista de practicas externa
export async function getCoordinatorPracticeRequests(token) {
  return request("/api/gestion/practice-requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// aprobar una solicitud
export async function approvePracticeRequest(token, id) {
  return request(`/api/gestion/practice-requests/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// crear nueva oferta
export async function createOffer(token, payload) {
  return request("/api/offers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
