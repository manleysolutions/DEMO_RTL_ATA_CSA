import React, { useState, useEffect } from "react";
import Login from "./modules/Login.jsx";
import Dashboard from "./modules/Dashboard.jsx";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // check if session is still alive
  useEffect(() => {
    fetch("/me")
      .then((res) => (res.ok ? setAuthenticated(true) : setAuthenticated(false)))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setAuthenticated(false)} />;
}
