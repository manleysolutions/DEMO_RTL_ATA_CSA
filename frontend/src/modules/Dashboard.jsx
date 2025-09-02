import React, { useEffect, useMemo, useState } from "react";
import MapView from "./MapView.jsx";

const TENANT = "USPS"; // multi-tenant hook

export default function Dashboard({ onLogout }) {
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

  async function load() {
    const [s, m] = await Promise.all([
      fetch(`/api/sites?tenant=${TENANT}`).then((r) => r.json()),
      fetch(`/api/map/sites?tenant=${TENANT}`).then((r) => r.json()),
    ]);
    setSites(s);
    setMapSites(m);

    // Carrier data
    const [n, c, msg, sav] = await Promise.all([
      fetch("/api/carrier/numbers").then((r) => r.json()),
      fetch("/api/carrier/calls").then((r) => r.json()),
      fetch("/api/carrier/messages").then((r) => r.json()),
      fetch("/api/savings/demo").then((r) => r.json()),
    ]);
    setNumbers(n);
    setCalls(c);
    setMessages(msg);
    setSavings(sav);

    console.log("Dashboard reloaded");
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setT((x) => (x > 0 ? x - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (t === 0) {
      setT(REFRESH_SECS);
      load();
    }
  }, [t]);

  function toggleTheme() {
    const next = theme === "Light" ? "dark" : "Light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  // filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.facilityName?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.pocName?.toLowerCase().includes(q)
    );
  }, [sites, query]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Red Tag Lines Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg"
          >
            {theme === "Light" ? "Dark" : "Light"} Mode
          </button>
          <button
            onClick={async () => {
              await fetch("/logout", { method: "POST" });
              if (typeof onLogout === "function") onLogout();
            }}
            className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <button
          onClick={() => setTab("sites")}
          className={`mr-2 px-3 py-1 rounded ${
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

      {/* Search */}
      {tab === "sites" && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search sites..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      )}

      {/* Content */}
      {tab === "sites" && (
        <>
          {view === "list" ? (
            <ul>
              {filtered.map((s, i) => (
                <li key={i} className="border-b py-2">
                  <div className="font-semibold">{s.facilityName}</div>
                  <div className="text-sm text-gray-600">{s.address}</div>
                  <div className="text-sm">POC: {s.pocName}</div>
                </li>
              ))}
            </ul>
          ) : (
            <MapView sites={mapSites} />
          )}
        </>
      )}

      {tab === "carrier" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Carrier Data</h2>
          <div className="mb-2">Numbers: {numbers.length}</div>
          <div className="mb-2">Calls: {calls.length}</div>
          <div className="mb-2">Messages: {messages.length}</div>
          <div className="mb-2">Savings: {savings?.annual || 0}</div>
        </div>
      )}
    </div>
  );
}
