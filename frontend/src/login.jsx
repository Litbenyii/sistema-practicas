import React, { useState } from "react";
import { login } from "./api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("alumno@uni.cl");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          Sistema de Prácticas
        </h1>
        <p className="text-slate-500">
          Inicia sesión con tu correo institucional.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo
            </label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-2xl font-medium hover:bg-slate-800 transition"
          >
            Ingresar
          </button>
        </form>

        <p className="text-xs text-slate-400">
          Para demo: alumno@uni.cl / 123456 o admin@uni.cl / Admin123
        </p>
      </div>
    </div>
  );
}
