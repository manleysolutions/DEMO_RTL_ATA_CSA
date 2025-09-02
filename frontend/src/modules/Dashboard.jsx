import React, { useEffect, useMemo, useState } from "react";
import MapView from "./MapView.jsx";

const TENANT = "USPS"; // multi-tenant hook

export default function Dashboard({ me }) {
  // --- state ---
  const [sites, setSites] = useState([]);
  const [mapSites, setMapSites] = useState([]);
  const [view, setView] = useState("list"); // list | map
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "Light"
  );
  const [tab, setTab] = useState("sites"); // NEW: sites | carrier

  // Carrier data
  const [numbers, setNumbers] = useState([]);
  const [calls, setCalls] = useState([]);
  const [messages, setMessages] = useState([]);
  const [savings, setSavings] = useState(null);

  // refresh timer
  const REFRESH_SECS = 90;
  const [t, setT] = useState(REFRESH_SECS);

  // --- load data ---
  async function load() {
    // sites + map
    const [s, m] = await Promise.all([
      fetch(`/api/sites?tenant=${TENANT}`).then((r) => r.json()),
      fetch(`/api/map/sites?tenant=${TENANT}`).then((r) => r.json()),
    ]);
    setSites(s);
    setMapSites(m);

    // carrier data
    const [n, c, msg, sav] = await Promise.all([
      fetch(`/api/carrier/numbers`).then((r) => r.json()),
      fetch(`/api/carrier/calls`).then((r) => r.json()),
      fetch(`/api/carrier/messages`).then((r) => r.json()),
      fetch(`/api/savings/demo`).then((r) => r.json()),
    ]);
    setNumbers(n);
    setCalls(c);
    setMessages(msg);
    setSavings(sav);

    console.log("Dashboard reloaded");
  }

  // auto refresh
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const id = setInterval(() => setT((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (t === 0) {
      setT(REFRESH_SECS);
      load();
    }
  }, [t]);

  // --- theme toggle ---
  function toggleTheme() {
    const next = theme === "Light" ? "dark" : "Light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  // --- logout ---
  async function logout() {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // --- filtering ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        (s.facilityName || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        (s.pocName || "").toLowerCase().includes(q)
    );
  }, [sites, query]);

  // --- render ---
  return (
    <div className="p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Red Tag Lines Deployment Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            {theme === "Light" ? "Dark Mode" : "Light Mode"}
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 rounded bg-red-500 text-white"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("sites")}
          className={`px-3 py-1 rounded ${
            tab === "sites" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Sites
        </button>
        <button
          onClick={() => setTab("carrier")}
          className={`px-3 py-1 rounded ${
            tab === "carrier" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Carrier Data
        </button>
      </div>

      {/* Content */}
      {tab === "sites" && (
        <div>
          {/* Search */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sites..."
            className="border p-2 rounded w-full mb-4"
          />

          {/* Site list */}
          <ul className="space-y-2">
            {filtered.map((s, i) => (
              <li key={i} className="p-2 border rounded">
                <strong>{s.facilityName}</strong> – {s.address} – POC:{" "}
                {s.pocName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "carrier" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Carrier Data</h2>
          <p>Numbers: {numbers.length}</p>
          <p>Calls: {calls.length}</p>
          <p>Messages: {messages.length}</p>
          <p>
            Savings: $
            {savings && savings.annual ? savings.annual.toLocaleString() : 0}/yr
          </p>
        </div>
      )}
    </div>
  );
}
