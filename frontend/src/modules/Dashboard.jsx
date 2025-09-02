import React, { useEffect, useMemo, useState } from "react";
import MapView from "./MapView.jsx";

const TENANT = "USPS"; // multi-tenant hook

export default function Dashboard({ me }) {
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
        (s.facilityName || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        (s.pocName || "").toLowerCase().includes(q)
    );
  }, [query, sites]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">
        Red Tag Lines Deployment Dashboard
      </h1>
      <div className="flex items-center gap-4 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            tab === "sites" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("sites")}
        >
          Sites
        </button>
        <button
          className={`px-3 py-1 rounded ${
            tab === "carrier" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("carrier")}
        >
          Carrier Data
        </button>
        <button
          className="ml-auto px-3 py-1 border rounded"
          onClick={toggleTheme}
        >
          {theme === "Light" ? "Dark Mode" : "Light Mode"}
        </button>
        <span className="ml-2 text-sm text-gray-500">
          Refresh in {t}s
        </span>
      </div>

      {tab === "sites" && (
        <div>
          <input
            placeholder="Search by location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          {view === "list" ? (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Facility</th>
                  <th className="p-2">E911</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">RTL Service</th>
                  <th className="p-2">Last Sync</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{s.facilityName}</td>
                    <td className="p-2">{s.address}</td>
                    <td className="p-2">{s.status}</td>
                    <td className="p-2">{s.rtl || "-"}</td>
                    <td className="p-2">{s.lastSync}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <MapView sites={mapSites} />
          )}
        </div>
      )}

      {tab === "carrier" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Numbers</h2>
          <pre className="bg-gray-100 p-2 text-sm">
            {JSON.stringify(numbers, null, 2)}
          </pre>

          <h2 className="text-lg font-semibold">Recent Calls</h2>
          <pre className="bg-gray-100 p-2 text-sm">
            {JSON.stringify(calls, null, 2)}
          </pre>

          <h2 className="text-lg font-semibold">Recent Messages</h2>
          <pre className="bg-gray-100 p-2 text-sm">
            {JSON.stringify(messages, null, 2)}
          </pre>

          <h2 className="text-lg font-semibold">Estimated Savings</h2>
          <pre className="bg-gray-100 p-2 text-sm">
            {JSON.stringify(savings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
