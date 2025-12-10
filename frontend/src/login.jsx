import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const resp = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        const msg = await resp.json().catch(() => ({}));
        throw new Error(msg.message || "Error en la solicitud");
      }

      const data = await resp.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white shadow-lg rounded-2xl px-8 py-10 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Sistema de Prácticas
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Inicia sesión con tu correo institucional.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              //placeholder="admin@uni.cl o alumno@uni.cl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              //placeholder="Admin123 o 123456"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 transition"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          para probar: alumno@uni.cl / 123456 o admin@uni.cl / Admin123
        </p>
      </div>
    </div>
  );
}
