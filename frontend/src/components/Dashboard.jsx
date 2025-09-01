import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  useEffect(() => {
    fetchSites(); // initial load

    // auto-refresh every 90 seconds
    const interval = setInterval(() => {
      fetchSites();
    }, 90 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-900">
          USPS True911+ Deployment Dashboard
        </h1>
        <button
          onClick={fetchSites}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Updated: {lastUpdated || "Loading..."}
      </p>

      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">E911 Location</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Device</th>
            <th className="px-4 py-2">FXS Lines</th>
            <th className="px-4 py-2">Last Sync</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">{s.id}</td>
              <td className="px-4 py-2">{s.e911Location}</td>
              <td
                className={`px-4 py-2 font-semibold ${
                  s.status === "online"
                    ? "text-green-600"
                    : s.status === "offline"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {s.status}
              </td>
              <td className="px-4 py-2">{s.device}</td>
              <td className="px-4 py-2">{s.fxsLines?.length || 0}</td>
              <td className="px-4 py-2">
                {s.lastSync
                  ? new Date(s.lastSync).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
