import React, { useEffect, useState } from "react";
import {
  getCoordinatorPracticeRequests,
  approvePracticeRequest,
  createOffer,
  getCoordinatorApplications,
  approveApplication,
  rejectApplication,
  rejectPracticeRequest,
  deactivateOffer,
  getCoordOffers,
  // --- Nuevas funciones para la evaluación ---
  getCoordOpenPractices,
  getEvaluators,
  assignEvaluatorToPractice,
  finalizePractice,
} from "./api";

export default function CoordinationHome({ name, onLogout, token }) {
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  
  // --- Nuevos estados para la gestión de cierre ---
  const [openPractices, setOpenPractices] = useState([]);
  const [evaluators, setEvaluators] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [externalFilter, setExternalFilter] = useState("PEND_EVAL");

  // formulario crear oferta
  const [offerForm, setOfferForm] = useState({
    title: "",
    company: "",
    location: "",
    hours: 320,
    modality: "",
    details: "",
    deadline: "",
    startDate: "",
  });
  const [savingOffer, setSavingOffer] = useState(false);

  // (más adelante usaremos esto para registrar alumnos nuevos)
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    rut: "",
    career: "",
    password: "",
  });
  const [creatingStudent, setCreatingStudent] = useState(false);

  // --- Lógica de validación de requisitos para el cierre ---
  const checkRequirements = (practice) => {
    const docs = practice.Documents || [];
    const evals = practice.Evaluations || [];
    
    return {
      informe: docs.some(d => d.type === "INFORME"),
      bitacora: docs.some(d => d.type === "BITACORA"),
      evalSupervisor: evals.some(e => e.role === "SUPERVISOR"),
      evalEvaluador: evals.some(e => e.role === "EVALUATOR"),
      hasEvaluator: practice.evaluatorId !== null
    };
  };

  // Cargar ofertas internas + solicitudes externas + postulaciones internas + gestión de cierre
  const loadData = async () => {
    try {
      setError("");
      setMsg("");
      setLoading(true);
      setLoadingOffers(true);

      const [offersData, reqs, apps, openPracs, evalsList] = await Promise.all([
        getCoordOffers(token),
        getCoordinatorPracticeRequests(token),
        getCoordinatorApplications(token),
        getCoordOpenPractices(token), // Nueva: trae prácticas abiertas
        getEvaluators(token),        // Nueva: trae directorio de profesores
      ]);

      setOffers(offersData || []);
      setRequests(reqs || []);
      setApplications(apps || []);
      setOpenPractices(openPracs || []);
      setEvaluators(evalsList || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "No se pudieron cargar los datos de coordinación."
      );
    } finally {
      setLoading(false);
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

const handleCloseOffer = async (offerId) => {
  const confirmar = window.confirm(
    "¿Seguro que quieres cerrar esta oferta? Los estudiantes ya no podrán postular."
  );
  if (!confirmar) return;

  try {
    setError("");
    setMsg("");
    await deactivateOffer(token, offerId);
    setMsg("Oferta cerrada correctamente.");

    const offersData = await getCoordOffers(token);
    setOffers(offersData || []);
  } catch (err) {
    console.error(err);
    setError(err.message || "No se pudo cerrar la oferta.");
  }
};

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
        deadline: offerForm.deadline || null,
        startDate: offerForm.startDate || null,
      });

      setMsg("Oferta creada correctamente.");
      setOfferForm({
        title: "",
        company: "",
        location: "",
        hours: 320,
        modality: "",
        details: "",
        deadline: "",
        startDate: "",
      });

      // recargamos para que aparezca la nueva oferta en la lista
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo crear la oferta.");
    } finally {
      setSavingOffer(false);
    }
  };

  const handleApproveExternal = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres aprobar esta práctica externa?"
    );
    if (!confirmar) return;

    try {
      setError("");
      setMsg("");
      await approvePracticeRequest(token, id);
      setMsg("Práctica externa aprobada correctamente.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo aprobar la práctica externa.");
    }
  };

  const handleRejectExternal = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres rechazar esta práctica externa?"
    );
    if (!confirmar) return;

    try {
      setError("");
      setMsg("");
      await rejectPracticeRequest(token, id);
      setMsg("Práctica externa rechazada correctamente.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo rechazar la práctica externa.");
    }
  };

  const handleApproveApplication = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres aprobar esta postulación a oferta interna?"
    );
    if (!confirmar) return;

    try {
      setError("");
      setMsg("");
      await approveApplication(token, id);
      setMsg("Postulación aprobada correctamente.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo aprobar la postulación.");
    }
  };

  const handleRejectApplication = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres rechazar esta postulación a oferta interna?"
    );
    if (!confirmar) return;

    try {
      setError("");
      setMsg("");
      await rejectApplication(token, id);
      setMsg("Postulación rechazada correctamente.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo rechazar la postulación.");
    }
  };

  // --- Nuevos manejadores para la gestión de evaluación ---
  const handleAssign = async (practiceId, evaluatorId) => {
    try {
      if (!evaluatorId) return;
      await assignEvaluatorToPractice(token, practiceId, evaluatorId);
      setMsg("Evaluador académico asignado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message || "Error al asignar evaluador.");
    }
  };

  const handleFinalize = async (practiceId) => {
    const confirmar = window.confirm(
      "¿Desea cerrar oficialmente la práctica? Se validarán los documentos y se calculará la nota definitiva."
    );
    if (!confirmar) return;

    try {
      await finalizePractice(token, practiceId);
      setMsg("La práctica ha sido cerrada y calificada oficialmente.");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo realizar el cierre.");
    }
  };

  const mapStatus = (status) => {
    switch (status) {
      case "PEND_EVAL":
        return "Pendiente de revisión";
      case "APPROVED":
        return "Aprobada";
      case "REJECTED":
        return "Rechazada";
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (externalFilter === "ALL") return true;
    return r.status === externalFilter;
  });

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

            {/* Fecha Inicio de practica*/}
            <div className="md:col-span-1">
              <input
                type="date"
                name="startDate"
                value={offerForm.startDate}
                onChange={handleOfferChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="Fecha de inicio de la práctica"
              />
            </div>

            {/* Fecha limite de postulacion */}
            <div className="md:col-span-1">
              <input
                type="date"
                name="deadline"
                value={offerForm.deadline}
                onChange={handleOfferChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                placeholder="Fecha límite de postulación"
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

        {/* Directorio de Gestión de Evaluación y Cierre */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-sm text-indigo-600">Cierre de Prácticas Profesionales (Gestión de Evaluación)</h2>
          <div className="space-y-4">
            {openPractices.length === 0 ? (
              <p className="text-slate-500 text-xs">No hay prácticas abiertas para gestionar.</p>
            ) : (
              openPractices.map((p) => {
                const status = checkRequirements(p);
                const isReady = status.informe && status.bitacora && status.evalSupervisor && status.evalEvaluador;

                return (
                  <div key={p.id} className="border border-slate-100 p-4 rounded-xl flex justify-between items-center bg-slate-50/50">
                    <div>
                      <p className="font-bold text-sm">{p.Student?.User?.name || "Estudiante"}</p>
                      <div className="flex gap-4 mt-2 text-[10px]">
                        <span className={status.informe ? "text-emerald-600" : "text-slate-400 font-medium"}>
                          {status.informe ? "✓ Informe Final" : "✗ Informe Final"}
                        </span>
                        <span className={status.bitacora ? "text-emerald-600" : "text-slate-400 font-medium"}>
                          {status.bitacora ? "✓ Bitácora" : "✗ Bitácora"}
                        </span>
                        <span className={status.evalSupervisor ? "text-emerald-600" : "text-slate-400 font-medium"}>
                          {status.evalSupervisor ? "✓ Eval. Empresa" : "✗ Eval. Empresa"}
                        </span>
                        <span className={status.evalEvaluador ? "text-emerald-600" : "text-slate-400 font-medium"}>
                          {status.evalEvaluador ? "✓ Eval. Académica" : "✗ Eval. Académica"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        className="text-[11px] border border-slate-200 rounded p-1 bg-white"
                        value={p.evaluatorId || ""}
                        onChange={(e) => handleAssign(p.id, e.target.value)}
                      >
                        <option value="">Asignar Evaluador...</option>
                        {evaluators.map((ev) => (
                          <option key={ev.id} value={ev.id}>{ev.name}</option>
                        ))}
                      </select>

                      <button
                        disabled={!isReady}
                        onClick={() => handleFinalize(p.id)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:bg-indigo-700 transition-colors"
                      >
                        Cerrar Práctica
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Ofertas internas publicadas */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4 mt-4">
          <h2 className="font-semibold text-sm">Ofertas internas publicadas</h2>

          {loadingOffers ? (
            <p className="text-slate-500 text-xs">Cargando ofertas...</p>
          ) : offers.length === 0 ? (
            <p className="text-slate-500 text-xs">No hay ofertas activas.</p>
          ) : (
            <div className="space-y-2">
              {offers.map((o) => (
                <div
                  key={o.id}
                  className="border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center"
                >
                <div className="text-xs">
                  <p className="font-medium">
                    {o.title} — {o.company}
                  </p>
                  <p className="text-slate-500">{o.location}</p>

                  {o.startDate && (
                    <p className="text-slate-400 text-[11px]">
                      Inicio estimado práctica: {o.startDate.slice(0, 10)}
                    </p>
                  )}

                  {o.deadline && (
                    <p className="text-slate-400 text-[11px] mt-1">
                      Postulación hasta: {o.deadline.slice(0, 10)}
                    </p>
                  )}
                </div>

                  <button
                    onClick={() => handleCloseOffer(o.id)}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-500"
                  >
                    Cerrar oferta
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Postulaciones a ofertas internas */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-sm mb-4">
            Postulaciones a ofertas internas
          </h2>

          {applications.length === 0 ? (
            <p className="text-slate-500 text-xs">
              No hay postulaciones registradas.
            </p>
          ) : (
            <div className="space-y-2">
              {applications.map((a) => (
                <div
                  key={a.id}
                  className="border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center"
                >
                  <div className="text-xs">
                    <p className="font-medium">
                      {a.Offer?.title} — {a.Offer?.company}
                    </p>
                    <p className="text-slate-500">Alumno ID: {a.studentId}</p>
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

                  <div className="flex gap-2">
                    {a.status === "PEND_EVAL" && (
                      <>
                        <button
                          onClick={() => handleApproveApplication(a.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-500"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectApplication(a.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-500"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Filtro + listado de prácticas externas */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-sm">
            Solicitudes de prácticas externas
          </h2>
          <select
            value={externalFilter}
            onChange={(e) => setExternalFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1"
          >
            <option value="PEND_EVAL">Pendientes</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="REJECTED">Rechazadas</option>
            <option value="ALL">Todas</option>
          </select>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-sm mb-4">
            Solicitudes de prácticas externas
          </h2>

          {requests.length === 0 ? (
            <p className="text-slate-500 text-xs">
              No hay solicitudes registradas.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((r) => (
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
                      Estado:{" "}
                        <span className="font-semibold">
                          {mapStatus(r.status)}
                        </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {r.status === "PEND_EVAL" && (
                      <>
                        <button
                          onClick={() => handleApproveExternal(r.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-500"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectExternal(r.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-500"
                        >
                          Rechazar
                        </button>
                      </>
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