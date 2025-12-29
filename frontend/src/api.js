const API_URL = "http://localhost:4000";

/* =====================================================
   HELPER CENTRAL
===================================================== */

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
    let data = null;

    try {
      data = await res.json();
      msg = data.message || data.error || msg;
    } catch (e) {
      // ignoramos parse error
    }

    // Sesión expirada
    if (res.status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (_) {}

      if (!data?.message && !data?.error) {
        msg = "Tu sesión ha expirado. Vuelve a iniciar sesión.";
      }

      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

/* =====================================================
   AUTH
===================================================== */

export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* =====================================================
   ESTUDIANTE
===================================================== */

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

/* =====================================================
   COORDINACIÓN – SOLICITUDES EXTERNAS
===================================================== */

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

export async function rejectPracticeRequest(token, id) {
  return request(`/api/coord/external-requests/${id}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* =====================================================
   COORDINACIÓN – OFERTAS
===================================================== */

export async function createOffer(token, payload) {
  return request("/api/coord/offers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: payload.title,
      company: payload.company,
      location: payload.location,
      hours: payload.hours,
      modality: payload.modality,
      details: payload.details,
      deadline: payload.deadline || null,
      startDate: payload.startDate || null,
    }),
  });
}

export async function getCoordOffers(token) {
  return request("/api/coord/offers", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deactivateOffer(token, id) {
  return request(`/api/coord/offers/${id}/deactivate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* =====================================================
   COORDINACIÓN – POSTULACIONES
===================================================== */

export async function getCoordinatorApplications(token) {
  return request("/api/coord/applications", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approveApplication(token, id) {
  return request(`/api/coord/applications/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rejectApplication(token, id) {
  return request(`/api/coord/applications/${id}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* =====================================================
   COORDINACIÓN – ESTUDIANTES
===================================================== */

export async function createStudent(token, payload) {
  return request("/api/coord/students", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

/* =====================================================
   COORDINACIÓN – PRÁCTICAS Y EVALUADORES
===================================================== */

export async function getEvaluators(token) {
  return request("/api/coord/evaluators", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOpenPractices(token) {
  return request("/api/coord/practices/open", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function assignEvaluatorToPractice(token, practiceId, evaluatorId) {
  return request(`/api/coord/practices/${practiceId}/assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ evaluatorId }),
  });
}

export async function finalizePractice(token, practiceId) {
  return request(`/api/coord/practices/${practiceId}/close`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
