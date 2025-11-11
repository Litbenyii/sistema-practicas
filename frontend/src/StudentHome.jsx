import { useEffect, useState } from 'react';
import {
  getOffers,
  applyToOffer,
  createPracticeRequest,
  getMyApplications,
  getMyPracticeRequests,
} from './api';

export default function StudentHome({ session }) {
  const { token, user } = session;
  const [offers, setOffers] = useState([]);
  const [apps, setApps] = useState([]);
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState({
    company: '',
    tutorName: '',
    tutorEmail: '',
    startDate: '',
    endDate: '',
    details: '',
  });

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setErr('');
    try {
      const [o, a, r] = await Promise.all([
        getOffers(token),
        getMyApplications(token),
        getMyPracticeRequests(token),
      ]);
      setOffers(o || []);
      setApps(a || []);
      setRequests(r || []);
    } catch (e) {
      setErr('No se pudieron cargar los datos. Revisa el backend.');
    }
  };

  const handleApply = async (offerId) => {
    setMsg('');
    setErr('');
    try {
      await applyToOffer(token, offerId);
      setMsg('Postulación enviada.');
      await loadData();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    try {
      await createPracticeRequest(token, form);
      setMsg('Solicitud de práctica externa enviada.');
      setForm({
        company: '',
        tutorName: '',
        tutorEmail: '',
        startDate: '',
        endDate: '',
        details: '',
      });
      await loadData();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="space-y-8">
      {/* Mensajes */}
      {msg && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded">
          {msg}
        </div>
      )}
      {err && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
          {err}
        </div>
      )}

      {/* Ofertas disponibles */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Postular a oferta disponible
          </h2>
          <span className="text-[10px] text-slate-400">
            CU-01 Registrar solicitud de práctica (oferta interna)
          </span>
        </div>

        {offers.length === 0 && (
          <p className="text-xs text-slate-500">
            No hay ofertas publicadas por coordinación.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border border-slate-100 rounded-xl p-4 flex flex-col gap-1"
            >
              <h3 className="font-semibold text-sm text-slate-900">
                {offer.title}
              </h3>
              <p className="text-xs text-slate-600">
                {offer.company} — {offer.location}
              </p>
              <p className="text-[10px] text-slate-500">
                {offer.details}
              </p>
              <button
                onClick={() => handleApply(offer.id)}
                className="mt-2 self-start text-[11px] px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-800"
              >
                Postular
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Solicitud de práctica externa */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Registrar práctica externa
          </h2>
          <span className="text-[10px] text-slate-400">
            CU-01 Variante: práctica gestionada por el estudiante
          </span>
        </div>

        <form
          onSubmit={handleSubmitRequest}
          className="grid gap-3 text-xs"
        >
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-700">
                Empresa
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={form.company}
                onChange={onFormChange('company')}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-700">
                Nombre tutor
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={form.tutorName}
                onChange={onFormChange('tutorName')}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-700">
                Correo tutor
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={form.tutorEmail}
                onChange={onFormChange('tutorEmail')}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-slate-700">
                  Inicio
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  value={form.startDate}
                  onChange={onFormChange('startDate')}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-700">
                  Término
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  value={form.endDate}
                  onChange={onFormChange('endDate')}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-slate-700">
              Detalles / objetivos
            </label>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 min-h-[70px]"
              value={form.details}
              onChange={onFormChange('details')}
              placeholder="Descripción breve de las tareas, área, tecnologías, etc."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full md:w-auto bg-slate-900 text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-slate-800"
            >
              Enviar solicitud
            </button>
          </div>
        </form>
      </section>

      {/* Listados */}
      <section className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">
            Mis postulaciones a ofertas
          </h3>
          {apps.length === 0 && (
            <p className="text-slate-500 text-[11px]">
              Sin registros.
            </p>
          )}
          <ul className="space-y-1">
            {apps.map((a) => (
              <li
                key={a.id}
                className="border border-slate-100 rounded-lg px-3 py-2 flex justify-between"
              >
                <span>{a.offer?.title || 'Oferta'}</span>
                <span className="text-[10px] uppercase text-slate-500">
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-2">
            Mis prácticas externas registradas
          </h3>
          {requests.length === 0 && (
            <p className="text-slate-500 text-[11px]">
              Sin registros.
            </p>
          )}
          <ul className="space-y-1">
            {requests.map((r) => (
              <li
                key={r.id}
                className="border border-slate-100 rounded-lg px-3 py-2 flex justify-between"
              >
                <span>{r.company}</span>
                <span className="text-[10px] uppercase text-slate-500">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
