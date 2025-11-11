import { useState } from 'react';
import Login from './login.jsx';
import StudentHome from './StudentHome.jsx';

function App() {
  const [session, setSession] = useState(null); // { token, user }

  const handleLogged = (data) => {
    // data: { token, user: { name, role, email, ... } }
    setSession(data);
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Login onLogged={handleLogged} />
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-xl font-semibold">Sistema de Prácticas</h1>
          <p className="text-xs text-slate-300">
            Conectado como {user.name} — {user.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Contenido por rol */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {user.role === 'STUDENT' && (
          <StudentHome session={session} />
        )}

        {user.role === 'COORDINATION' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-2">
              Módulo Coordinación (en construcción)
            </h2>
            <p className="text-sm text-slate-500">
              Aquí el equipo integrará la gestión de estudiantes, ofertas y asignaciones.
            </p>
          </div>
        )}

        {user.role !== 'STUDENT' && user.role !== 'COORDINATION' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-2">
              Vista para rol {user.role}
            </h2>
            <p className="text-sm text-slate-500">
              Este espacio queda listo para que el resto del equipo agregue las funcionalidades de su caso de uso.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
