import { useState } from "react";
import Login from "./login";
import StudentHome from "./StudentHome";
import CoordinationHome from "./CoordinationHome";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  console.log("Usuario cargado en App:", user);

  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === "STUDENT") {
    return (
      <StudentHome
        token={token}
        name={user.name}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "COORDINATION") {
    return (
      <CoordinationHome
        token={token}
        name={user.name}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white shadow rounded-xl px-8 py-6 text-center">
        <p className="mb-4 text-slate-700">
          Rol no soportado en este prototipo.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default App;
