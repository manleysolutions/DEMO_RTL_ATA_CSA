import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => setSites(data));
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      online: "bg-green-100 text-green-700 border-green-400",
      offline: "bg-red-100 text-red-700 border-red-400",
      no_csa: "bg-gray-100 text-gray-600 border-gray-400",
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full border ${colors[status] || "bg-gray-100 text-gray-600 border-gray-400"
          }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            USPS <span className="text-blue-300">True911+</span> Dashboard
          </h1>
          <img src="/usps_logo.png" alt="USPS Logo" className="h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Active Sites</h2>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Device Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Last Sync</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{site.id}</td>
                  <td className="px-4 py-3">{site.location}</td>
                  <td className="px-4 py-3">{site.deviceType || "—"}</td>
                  <td className="px-4 py-3">{site.lastSync || "—"}</td>
                  <td className="px-4 py-3">{getStatusBadge(site.status)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="px-3 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
                      Ping
                    </button>
                    <button className="px-3 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                      Reboot
                    </button>
                    <button className="px-3 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
