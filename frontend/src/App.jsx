import React, { useState } from "react";
import Login from "./login.jsx";
import StudentHome from "./StudentHome.jsx";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setRole(data.role);
    setName(data.name);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setName(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (role === "STUDENT") {
    return (
      <StudentHome
        token={token}
        name={name}
        onLogout={handleLogout}
      />
    );
  }
}

export default App;
