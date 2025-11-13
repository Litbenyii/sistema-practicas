import React, { useEffect, useState } from "react";
import {
  getCoordinatorPracticeRequests,
  approvePracticeRequest,
  createOffer,
} from "./api";

export default function CoordinationHome({ name, onLogout, token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // formulario crear oferta
  const [offerForm, setOfferForm] = useState({
    title: "",
    company: "",
    location: "",
    hours: 320,
    modality: "",
    details: "",
  });
  const [savingOffer, setSavingOffer] = useState(false);

  // crear solicitudes practica externa
  const loadRequests = async () => {
    try {
      setError("");
      setMsg("");
      setLoading(true);
      const data = await getCoordinatorPracticeRequests(token);
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [token]);

  // cambios de form
  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferForm((f) => ({ ...f, [name]: value }));
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!offerForm.title || !offerForm.company || !offerForm.location) {
      setError("Título, empresa y ubicación son obligatorios para la oferta.");
      return;
    }

    try {
      setSavingOffer(true);
      await createOffer(token, {
        title: offerForm.title,
        company: offerForm.company,
        location: offerForm.location,
        hours: Number(offerForm.hours) || 320,
        modality: offerForm.modality,
        details: offerForm.details,
      });

      setMsg("Oferta creada correctamente.");
      setOfferForm({
        title: "",
        company: "",
        location: "",
        hours: 320,
        modality: "",
        details: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo crear la oferta.");
    } finally {
      setSavingOffer(false);
    }
  };

  const handleApprove = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres aprobar esta práctica externa?"
    );
    if (!confirmar) return;

    try {
      setError("");
      setMsg("");
      await approvePracticeRequest(token, id);
      setMsg("Práctica externa aprobada correctamente.");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo aprobar la práctica externa.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-10 py-6 flex justify-between items-center bg-white shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">
            Portal de prácticas — Coordinación
          </h1>
          <p className="text-slate-500 text-sm">
            Conectado como {name || "Coordinador Prácticas"}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="p-10 space-y-8">
        {loading && (
          <p className="text-slate-500 text-sm">Cargando información...</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        )}

        {msg && (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm">
            {msg}
          </div>
        )}

        {/* Crear oferta */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-sm">Crear nueva oferta de práctica</h2>

          <form
            onSubmit={handleOfferSubmit}
            className="grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-1">
              <input
                name="title"
                value={offerForm.title}
                onChange={handleOfferChange}
                placeholder="Título de la práctica (ej: Practica Desarrollador Web)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <input
                name="company"
                value={offerForm.company}
                onChange={handleOfferChange}
                placeholder="Empresa"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <input
                name="location"
                value={offerForm.location}
                onChange={handleOfferChange}
                placeholder="Ubicación (ej: Concepción)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-1 flex gap-2">
              <input
                name="hours"
                type="number"
                value={offerForm.hours}
                onChange={handleOfferChange}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="Horas (ej: 320)"
              />
              <input
                name="modality"
                value={offerForm.modality}
                onChange={handleOfferChange}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="Modalidad (ej: híbrida, presencial)"
              />
            </div>

            <div className="md:col-span-2">
              <textarea
                name="details"
                value={offerForm.details}
                onChange={handleOfferChange}
                placeholder="Detalles / stack tecnológico / requisitos"
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingOffer}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {savingOffer ? "Guardando..." : "Crear oferta"}
              </button>
            </div>
          </form>
        </section>

        {/* Solicitudes de practicas externas */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-sm mb-4">
            Solicitudes de prácticas externas
          </h2>

          {requests.length === 0 ? (
            <p className="text-slate-500 text-xs">No hay solicitudes registradas.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center"
                >
                  <div className="text-xs">
                    <p className="font-medium">
                      {r.company} — {r.student?.name || "Estudiante"}
                    </p>
                    <p className="text-slate-500">
                      Tutor: {r.tutorName} ({r.tutorEmail})
                    </p>
                    <p className="text-slate-500">
                      Desde {r.startDate?.slice(0, 10)} hasta{" "}
                      {r.endDate?.slice(0, 10)}
                    </p>
                    <p className="text-slate-500">
                      Estado: <span className="font-semibold">{r.status}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {r.status === "PEND_EVAL" && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-500"
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
