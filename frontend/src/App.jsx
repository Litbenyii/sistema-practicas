import React, { useState, useEffect } from "react";
import Login from "./login";
import StudentHome from "./StudentHome";
import CoordinationHome from "./CoordinationHome";
function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    const n = localStorage.getItem("name");

    if (t && r) {
      setToken(t);
      setRole(r);
      setName(n);
    }
  }, []);

  const handleLoginSuccess = (token, role, name) => {
    setToken(token);
    setRole(role);
    setName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setToken(null);
    setRole(null);
    setName(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (role === "STUDENT") {
    return <StudentHome token={token} name={name} onLogout={handleLogout} />;
  }

  if (role === "COORDINATION") {
    return (
      <CoordinationHome token={token} name={name} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-sm text-slate-700">
          Rol <span className="font-mono">{role}</span> no soportado en este prototipo.
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default App;
