import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Dashboard from "./modules/Dashboard.jsx";
import Login from "./modules/Login.jsx";

function App() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const r = await fetch("/api/me");
      const j = await r.json();
      setMe(j);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchMe(); }, []);

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (!me) return <Login onLogin={fetchMe} />;

  return <Dashboard me={me} />;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
