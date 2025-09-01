import React, { useEffect, useState } from "react";

function Dashboard() {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(90);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data);
      setLastUpdated(new Date().toLocaleString());
      setCountdown(90); // reset timer every refresh
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  // Auto refresh every 90s
  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 90000);
    return () => clearInterval(interval);
  }, []);

  // Countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          USPS True911+ Deployment Dashboard
        </h1>
        <div className="text-sm text-gray-600">
          Updated: {lastUpdated || "—"} <br />
          <span className="text-blue-600 font-semibold">
            Refresh in {countdown}s
          </span>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="text-gray-500">Total Sites</div>
          <div className="text-2xl font-bold">{sites.length}</div>
        </div>
        <div className="bg-green-100 shadow rounded p-4 text-center">
          <div className="text-gray-500">Online</div>
          <div className="text-2xl font-bold text-green-700">
            {sites.filter((s) => s.status === "online").length}
          </div>
        </div>
        <div className="bg-red-100 shadow rounded p-4 text-center">
          <div className="text-gray-500">Offline</div>
          <div className="text-2xl font-bold text-red-700">
            {sites.filter((s) => s.status === "offline").length}
          </div>
        </div>
        <div className="bg-yellow-100 shadow rounded p-4 text-center">
          <div className="text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">
            {sites.filter((s) => s.status === "pending").length}
          </div>
        </div>
      </div>

      {/* Sites table */}
      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">E911 Location</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Device</th>
            <th className="px-4 py-2 text-left">FXS Lines</th>
            <th className="px-4 py-2 text-left">Last Sync</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id} className="border-t">
              <td className="px-4 py-2">{site.id}</td>
              <td className="px-4 py-2">{site.e911Location}</td>
              <td
                className={`px-4 py-2 font-semibold ${
                  site.status === "online"
                    ? "text-green-600"
                    : site.status === "offline"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {site.status}
              </td>
              <td className="px-4 py-2">{site.device}</td>
              <td className="px-4 py-2">{site.fxsLines?.length || 0}</td>
              <td className="px-4 py-2">
                {site.lastSync
                  ? new Date(site.lastSync).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-2 space-x-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded">
                  Ping
                </button>
                <button className="px-2 py-1 bg-yellow-500 text-white rounded">
                  Reboot
                </button>
                <button className="px-2 py-1 bg-gray-700 text-white rounded">
                  Logs
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
