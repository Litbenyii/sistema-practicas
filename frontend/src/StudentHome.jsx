import React, { useEffect, useState } from "react";
import {
  getOffers,
  getMyRequests,
  createPracticeRequest,
} from "./api";

export default function StudentHome({ token, name, onLogout }) {
  const [offers, setOffers] = useState([]);

  const [applications, setApplications] = useState([]);
  const [practiceRequests, setPracticeRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Formulario para inscribir practica
  const [form, setForm] = useState({
    company: "",
    tutorName: "",
    tutorEmail: "",
    startDate: "",
    endDate: "",
    details: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setMsg("");

        const [offersData, myReq] = await Promise.all([
          getOffers(token),
          getMyRequests(token),
        ]);

        setOffers(offersData || []);
        setApplications(myReq?.applications || []);
        setPracticeRequests(myReq?.practices || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePracticeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (
      !form.company ||
      !form.tutorName ||
      !form.tutorEmail ||
      !form.startDate ||
      !form.endDate
    ) {
      setError("Completa todos los campos obligatorios de la practica externa.");
      return;
    }

    try {
      setSending(true);

      await createPracticeRequest(token, {
        company: form.company,
        tutorName: form.tutorName,
        tutorEmail: form.tutorEmail,
        startDate: form.startDate,
        endDate: form.endDate,
        details: form.details,
      });

      setMsg("Practica externa enviada para evaluacion.");

      setForm({
        company: "",
        tutorName: "",
        tutorEmail: "",
        startDate: "",
        endDate: "",
        details: "",
      });

      // refrescar las solicitudes
      const myReq = await getMyRequests(token);
      setApplications(myReq?.applications || []);
      setPracticeRequests(myReq?.practices || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo registrar la practica externa.");
    } finally {
      setSending(false);
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
        {loading && <p className="text-slate-500 text-sm">Cargando datos...</p>}

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

        {/* Postular a practica */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Postular a oferta disponible</h2>
          {offers.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No hay ofertas activas por ahora.
            </p>
          ) : (
            offers.map((o) => (
              <div
                key={o.id}
                className="border border-slate-100 rounded-xl p-4 mb-3 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{o.title}</h3>
                  <p className="text-xs text-slate-500">
                    {o.company} — {o.location}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {o.details}
                  </p>
                </div>
                <button
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800"
                  onClick={() => {
                    alert(
                      "Aquí puedes conectar la postulación a la oferta usando el endpoint /api/applications."
                    );
                  }}
                >
                  Postular
                </button>
              </div>
            ))
          )}
        </section>

        {/* Regitrar las practocas */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold">Registrar práctica externa</h2>
          <form onSubmit={handlePracticeSubmit} className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-1">
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Empresa"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <input
                name="tutorName"
                value={form.tutorName}
                onChange={handleChange}
                placeholder="Nombre tutor"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <input
                name="tutorEmail"
                type="email"
                value={form.tutorEmail}
                onChange={handleChange}
                placeholder="Correo tutor"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-1 flex gap-2">
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                placeholder="Detalles / objetivos de la práctica"
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {sending ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        </section>

        {/* las solicitudes */}
        <section className="bg-white rounded-2xl shadow-sm p-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2 text-sm">
              Postulaciones a ofertas
            </h3>
            {applications.length === 0 ? (
              <p className="text-slate-500 text-xs">Sin registros.</p>
            ) : (
              applications.map((a) => (
                <div
                  key={a.id}
                  className="border border-slate-100 rounded-xl px-3 py-2 mb-2"
                >
                  <p className="text-xs font-medium">
                    {a.Offer?.title || "Oferta"} — {a.Offer?.company}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Estado: {a.status}
                  </p>
                </div>
              ))
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">
              Prácticas externas
            </h3>
            {practiceRequests.length === 0 ? (
              <p className="text-slate-500 text-xs">Sin registros.</p>
            ) : (
              practiceRequests.map((p) => (
                <div
                  key={p.id}
                  className="border border-slate-100 rounded-xl px-3 py-2 mb-2"
                >
                  <p className="text-xs font-medium">{p.company}</p>
                  <p className="text-[10px] text-slate-500">
                    Tutor: {p.tutorName} ({p.tutorEmail})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Desde {p.startDate?.slice(0, 10)} hasta{" "}
                    {p.endDate?.slice(0, 10)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Estado: {p.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
