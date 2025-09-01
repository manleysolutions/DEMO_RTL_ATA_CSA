import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(90);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      console.log("Dashboard reloaded, sites:", data); // DEBUG
      setSites(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  // auto-refresh every 90s
  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 90000);
    return () => clearInterval(interval);
  }, []);

  // countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 90));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // counters
  const total = sites.length;
  const online = sites.filter((s) => s.status === "online").length;
  const offline = sites.filter((s) => s.status === "offline").length;
  const pending = sites.filter((s) => s.status === "pending").length;

  // button handlers (stubbed)
  const handlePing = (site) => {
    console.log("Ping clicked:", site.e911Location);
    alert(`Pinging ${site.e911Location}...`);
  };

  const handleReboot = (site) => {
    console.log("Reboot clicked:", site.e911Location);
    alert(`Rebooting device at ${site.e911Location}...`);
  };

  const handleLogs = (site) => {
    console.log("Logs clicked:", site.e911Location);
    alert(`Fetching logs for ${site.e911Location}...`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-2">
        USPS True911+ Deployment Dashboard
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Updated: {lastUpdated.toLocaleTimeString()} | Refresh in:{" "}
        <span className={countdown <= 10 ? "text-red-600 animate-pulse" : ""}>
          {countdown}s
        </span>
      </p>

      {/* Summary counters */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded text-center shadow">
          <p className="text-lg font-semibold">{total}</p>
          <p className="text-sm text-gray-600">Total Sites</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center shadow">
          <p className="text-lg font-semibold text-green-700">{online}</p>
          <p className="text-sm text-gray-600">Online</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center shadow">
          <p className="text-lg font-semibold text-red-700">{offline}</p>
          <p className="text-sm text-gray-600">Offline</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center shadow">
          <p className="text-lg font-semibold text-yellow-700">{pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
      </div>

      {/* Sites table */}
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-200 text-gray-700 text-sm">
          <tr>
            <th className="p-2 text-left">E911 Location</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Device</th>
            <th className="p-2 text-left">FXS Lines</th>
            <th className="p-2 text-left">Last Sync</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <React.Fragment key={site.id}>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-2 font-semibold">{site.e911Location}</td>
                <td className="p-2 capitalize">
                  <span
                    className={
                      site.status === "online"
                        ? "text-green-600"
                        : site.status === "offline"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  >
                    {site.status}
                  </span>
                </td>
                <td className="p-2">{site.device || "—"}</td>
                <td className="p-2">
                  {site.fxsLines ? site.fxsLines.length : 0}
                </td>
                <td className="p-2">
                  {site.lastSync
                    ? new Date(site.lastSync).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handlePing(site)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Ping
                  </button>
                  <button
                    onClick={() => handleReboot(site)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Reboot
                  </button>
                  <button
                    onClick={() => handleLogs(site)}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                  >
                    Logs
                  </button>
                </td>
              </tr>

              {/* collapsible FXS lines */}
              {site.fxsLines && site.fxsLines.length > 0 && (
                <tr>
                  <td colSpan="6" className="p-2 bg-gray-50 text-sm">
                    <details>
                      <summary className="cursor-pointer">
                        View FXS Lines ({site.fxsLines.length})
                      </summary>
                      <ul className="grid grid-cols-2 gap-2 mt-2">
                        {site.fxsLines.map((line, idx) => (
                          <li
                            key={idx}
                            className="p-2 border rounded bg-white shadow-sm"
                          >
                            <p className="font-mono text-sm">{line.number}</p>
                            <p
                              className={
                                line.status === "online"
                                  ? "text-green-600"
                                  : line.status === "offline"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }
                            >
                              {line.status}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
