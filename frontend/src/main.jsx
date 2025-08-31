import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function StatusBadge({ status }) {
  let color;
  if (status === "online") color = "bg-green-100 text-green-800";
  else if (status === "offline") color = "bg-red-100 text-red-800";
  else color = "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 py-1 text-sm font-semibold rounded ${color}`}
      style={{ textTransform: "capitalize" }}
    >
      {status}
    </span>
  );
}

function Dashboard() {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchSites = () => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => {
        setSites(data);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((err) => console.error("Error fetching sites:", err));
  };

  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // summary counts
  const onlineCount = sites.filter((s) => s.status === "online").length;
  const offlineCount = sites.filter((s) => s.status === "offline").length;
  const pendingCount = sites.filter((s) => s.status !== "online" && s.status !== "offline").length;

  // filters
  const filteredSites = sites.filter((site) => {
    if (filter !== "all" && site.status !== filter) return false;
    if (search && !site.location.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <header className="border-b-2 border-blue-900 mb-6 pb-2 flex items-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/4e/USPS_logo.svg"
          alt="USPS Logo"
          className="h-10 mr-3"
        />
        <h1 className="text-3xl font-bold text-blue-900">
          USPS True911+ Deployment Dashboard
        </h1>
      </header>

      {/* Summary */}
      <div className="flex space-x-6 mb-4">
        <div className="bg-green-100 px-4 py-2 rounded">
          🟢 Online: {onlineCount}
        </div>
        <div className="bg-red-100 px-4 py-2 rounded">
          🔴 Offline: {offlineCount}
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded">
          ⚪ Pending: {pendingCount}
        </div>
        <div className="text-gray-600 text-sm ml-auto">
          {lastUpdated ? `Last Updated: ${lastUpdated}` : "Loading..."}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="no_csa">Pending</option>
        </select>
        <input
          type="text"
          placeholder="Search location..."
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700">
          📄 Generate Report
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Device Type</th>
              <th className="p-3 text-left">Last Sync</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.map((site, idx) => (
              <tr
                key={site.id}
                className={`hover:bg-blue-50 transition ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-3">{site.id}</td>
                <td className="p-3">{site.location}</td>
                <td className="p-3">
                  <StatusBadge status={site.status} />
                </td>
                <td className="p-3">{site.deviceType || "CSA"}</td>
                <td className="p-3">{site.lastSync || "—"}</td>
                <td className="p-3 space-x-2">
                  <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                    🔄 Ping
                  </button>
                  <button className="px-2 py-1 bg-red-200 rounded hover:bg-red-300">
                    🔁 Reboot
                  </button>
                  <button className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300">
                    📄 Logs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);
