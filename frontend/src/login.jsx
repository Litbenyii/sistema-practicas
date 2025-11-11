import { useState } from 'react';
import { login } from './api';

export default function Login({ onLogged }) {
  const [email, setEmail] = useState('alumno@uni.cl');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      onLogged(data);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">
        Sistema de Prácticas
      </h1>
      <p className="text-xs text-slate-500 mb-6">
        Inicia sesión con tu correo institucional.
      </p>

      {error && (
        <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Correo
          </label>
          <input
            type="email"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alumno@uni.cl"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-4 text-[10px] text-slate-400">
        Para demo: alumno@uni.cl / 123456 o admin@uni.cl / Admin123
      </p>
    </div>
  );
}
