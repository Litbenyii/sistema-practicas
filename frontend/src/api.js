// src/api.js
const API_URL = "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : null,
  });

  if (!res.ok) {
    let msg = "Error en la solicitud";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
      if (data?.message) msg = data.message;
    } catch (_) {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// login
export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// ofertas de practica
export function getOffers(token) {
  return request("/offers", { token });
}

// agregar practoca externa
export function createPracticeRequest(token, payload) {
  return request("/practices", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function createApplication(token, offerId) {
  return request("/applications", {
    method: "POST",
    body: { offerId },
    token,
  });
}

// ver las solicitudes/postulaciones inscritas
export function getMyRequests(token) {
  return request("/my/requests", { token });
}
