import React, { useEffect, useState } from "react";
import {
  getOffers,
  getMyRequests,
  createPracticeRequest,
  createApplication,
} from "./api";

export default function StudentHome({ name, onLogout, token }) {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [practiceForm, setPracticeForm] = useState({
    company: "",
    tutorName: "",
    tutorEmail: "",
    startDate: "",
    endDate: "",
    details: "",
  });
  const [savingPractice, setSavingPractice] = useState(false);

  // Cargar ofertas + mis solicitudes (internas y externas)
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      const [offersData, myRequests] = await Promise.all([
        getOffers(token),
        getMyRequests(token),
      ]);

      setOffers(offersData || []);
      setApplications(myRequests?.applications || []);
      setPractices(myRequests?.practices || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "No se pudo cargar la información del estudiante."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Ofertas disponibles = todas menos las que ya tienen postulación
  const appliedOfferIds = new Set(applications.map((a) => a.offerId));
  const availableOffers = offers.filter((o) => !appliedOfferIds.has(o.id));

  const mapStatus = (status) => {
    switch (status) {
      case "PEND_EVAL":
        return "Pendiente de evaluación";
      case "APPROVED":
        return "Aprobada";
      case "REJECTED":
        return "Rechazada";
      default:
        return status;
    }
  };

  // Manejo form práctica externa
  const handlePracticeChange = (e) => {
    const { name, value } = e.target;
    setPracticeForm((f) => ({ ...f, [name]: value }));
  };

  const handlePracticeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    const { company, tutorName, tutorEmail, startDate, endDate } =
      practiceForm;

    if (!company || !tutorName || !tutorEmail || !startDate || !endDate) {
      setError("Todos los campos de la práctica externa son obligatorios.");
      return;
    }

    try {
      setSavingPractice(true);
      await createPracticeRequest(token, {
        company: practiceForm.company,
        tutorName: practiceForm.tutorName,
        tutorEmail: practiceForm.tutorEmail,
        startDate: practiceForm.startDate,
        endDate: practiceForm.endDate,
        details: practiceForm.details,
      });

      setMsg("Práctica externa enviada para evaluación.");
      setPracticeForm({
        company: "",
        tutorName: "",
        tutorEmail: "",
        startDate: "",
        endDate: "",
        details: "",
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo registrar la práctica externa.");
    } finally {
      setSavingPractice(false);
    }
  };

  const handleApply = async (offerId) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres postular a esta oferta de práctica?"
    );
    if (!confirmar) return;

    try {
      setError("");
      setMsg("");
      await createApplication(token, offerId);
      setMsg("Postulación enviada correctamente.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo enviar la postulación.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-10 py-6 flex justify-between items-center bg-white shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">
            Portal de prácticas — Estudiante
          </h1>
          <p className="text-slate-500 text-sm">
            Conectado como {name || "Alumno Prueba"}
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

        {/* Ofertas disponibles */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-sm mb-4">
            Postular a oferta disponible
          </h2>

          {availableOffers.length === 0 ? (
            <p className="text-slate-500 text-xs">
              No hay ofertas disponibles para postular (ya postulaste a todas
              las activas).
            </p>
          ) : (
            <div className="space-y-3">
              {availableOffers.map((o) => (
                <div
                  key={o.id}
                  className="border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center"
                >
                  <div className="text-xs">
                    <p className="font-medium">{o.title}</p>
                    <p className="text-slate-500">
                      {o.company} — {o.location}
                    </p>
                    {o.details && (
                      <p className="text-slate-500 text-[11px] mt-1">
                        {o.details}
                      </p>
                    )}
                    {o.deadline && (
                      <p className="text-slate-400 text-[11px] mt-1">
                        Postula hasta: {o.deadline.slice(0, 10)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleApply(o.id)}
                    className="px-4 py-1 rounded-lg bg-slate-900 text-white text-xs hover:bg-slate-800"
                  >
                    Postular
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Registrar práctica externa */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-sm">Registrar práctica externa</h2>

          <form
            onSubmit={handlePracticeSubmit}
            className="grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-1">
              <input
                name="company"
                value={practiceForm.company}
                onChange={handlePracticeChange}
                placeholder="Empresa"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <input
                name="tutorName"
                value={practiceForm.tutorName}
                onChange={handlePracticeChange}
                placeholder="Nombre Supervisor"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <input
                name="tutorEmail"
                value={practiceForm.tutorEmail}
                onChange={handlePracticeChange}
                placeholder="Correo Supervisor"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-1 flex gap-2">
              <input
                type="date"
                name="startDate"
                value={practiceForm.startDate}
                onChange={handlePracticeChange}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <input
                type="date"
                name="endDate"
                value={practiceForm.endDate}
                onChange={handlePracticeChange}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <textarea
                name="details"
                value={practiceForm.details}
                onChange={handlePracticeChange}
                placeholder="Objetivos de la práctica"
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPractice}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {savingPractice ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        </section>

        {/* Listados inferiores */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Postulaciones internas */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-sm mb-4">
              Postulaciones a ofertas
            </h2>
            {applications.length === 0 ? (
              <p className="text-slate-500 text-xs">
                No has postulado a ninguna oferta interna.
              </p>
            ) : (
              <div className="space-y-2">
                {applications.map((a) => (
                  <div
                    key={a.id}
                    className="border border-slate-100 rounded-xl px-4 py-3 text-xs"
                  >
                    <p className="font-medium">
                      {a.Offer?.title} — {a.Offer?.company}
                    </p>
                    <p className="text-slate-500">
                      Estado:{" "}
                      <span className="font-semibold">
                        {mapStatus(a.status)}
                      </span>
                    </p>
                    <p className="text-slate-400">
                      Creada: {a.createdAt?.slice(0, 10)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prácticas externas */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-sm mb-4">Prácticas externas</h2>
            {practices.length === 0 ? (
              <p className="text-slate-500 text-xs">Sin registros.</p>
            ) : (
              <div className="space-y-2">
                {practices.map((p) => (
                  <div
                    key={p.id}
                    className="border border-slate-100 rounded-xl px-4 py-3 text-xs"
                  >
                    <p className="font-medium">{p.company}</p>
                    <p className="text-slate-500">
                      Tutor: {p.tutorName} ({p.tutorEmail})
                    </p>
                    <p className="text-slate-500">
                      Desde {p.startDate?.slice(0, 10)} hasta{" "}
                      {p.endDate?.slice(0, 10)}
                    </p>
                    <p className="text-slate-500">
                      Estado:{" "}
                      <span className="font-semibold">
                        {mapStatus(p.status)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
