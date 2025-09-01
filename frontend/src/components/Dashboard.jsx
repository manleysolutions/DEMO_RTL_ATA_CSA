import React, { useEffect, useMemo, useState } from "react";

/* -------- small helpers -------- */
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};
const relTime = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
};
const statusBadge = (s) =>
  s === "online"
    ? "text-green-700 bg-green-100"
    : s === "offline"
    ? "text-red-700 bg-red-100"
    : "text-yellow-700 bg-yellow-100";

/* devices shown in filter */
const DEVICE_OPTIONS = ["All Devices", "MS130", "SLELTE", "ATA", "CSA", "CSA v1.1", "ATA191"];

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(90);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters (persisted)
  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("flt:status") || "All Status"
  );
  const [deviceFilter, setDeviceFilter] = useState(
    localStorage.getItem("flt:device") || "All Devices"
  );
  const [q, setQ] = useState(localStorage.getItem("flt:q") || "");

  // sorting
  const [sortKey, setSortKey] = useState("id"); // id | status | lastSync
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // mobile action bar
  const [activeSiteId, setActiveSiteId] = useState(null);

  const fetchSites = async () => {
    try {
      setErr("");
      const res = await fetch("/api/sites", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSites(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setLoading(false);
      console.log("Dashboard reloaded", data);
    } catch (e) {
      console.error("Fetch error:", e);
      setErr("Failed to load sites. Check network, then Retry.");
      setLoading(false);
    }
  };

  // initial + auto-refresh
  useEffect(() => {
    fetchSites();
    const iv = setInterval(fetchSites, 90 * 1000);
    return () => clearInterval(iv);
  }, []);

  // countdown
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 90));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // persist filters
  useEffect(() => localStorage.setItem("flt:status", statusFilter), [statusFilter]);
  useEffect(() => localStorage.setItem("flt:device", deviceFilter), [deviceFilter]);
  useEffect(() => localStorage.setItem("flt:q", q), [q]);

  // counters
  const total = sites.length;
  const online = sites.filter((s) => s.status === "online").length;
  const offline = sites.filter((s) => s.status === "offline").length;
  const pending = sites.filter((s) => s.status === "pending").length;

  // filtering
  const filtered = useMemo(() => {
    return sites
      .filter((s) => {
        if (statusFilter !== "All Status" && s.status !== statusFilter.toLowerCase()) return false;
        if (deviceFilter !== "All Devices") {
          // device can be 'CSA', 'CSA v1.1', 'ATA', 'MS130', 'SLELTE', etc.
          if ((s.device || "").toLowerCase() !== deviceFilter.toLowerCase()) return false;
        }
        if (q.trim()) {
          const hay = `${s.e911Location || ""} ${s.device || ""} ${s.status || ""}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "status") {
          return a.status.localeCompare(b.status) * dir;
        }
        if (sortKey === "lastSync") {
          const ta = a.lastSync ? new Date(a.lastSync).getTime() : 0;
          const tb = b.lastSync ? new Date(b.lastSync).getTime() : 0;
          return (ta - tb) * dir;
        }
        // default id
        return (a.id - b.id) * dir;
      });
  }, [sites, statusFilter, deviceFilter, q, sortKey, sortDir]);

  // actions (stubbed)
  const ping = (site) => {
    console.log("Ping", site);
    alert(`Pinging ${site.e911Location}…`);
  };
  const reboot = (site) => {
    console.log("Reboot", site);
    alert(`Rebooting device at ${site.e911Location}…`);
  };
  const logs = (site) => {
    console.log("Logs", site);
    alert(`Fetching logs for ${site.e911Location}…`);
  };

  // export CSV
  const exportCSV = () => {
    const header = ["ID", "E911 Location", "Status", "Device", "FXS Count", "Last Sync"];
    const rows = sites.map((s) => [
      s.id,
      (s.e911Location || "").replaceAll(",", " "),
      s.status,
      (s.device || "").replaceAll(",", " "),
      s.fxsLines ? s.fxsLines.length : 0,
      fmtDate(s.lastSync),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `usps_sites_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const headerCell = (label, key) => (
    <th
      className="p-2 text-left select-none cursor-pointer"
      onClick={() => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else {
          setSortKey(key);
          setSortDir("asc");
        }
      }}
      title="Click to sort"
    >
      {label}
      {sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );

  const activeSite = sites.find((s) => s.id === activeSiteId) || null;

  return (
    <div className="p-4 md:p-6">
      {/* Header & controls */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h1 className="text-xl md:text-2xl font-bold text-blue-800">
          USPS True911+ Deployment Dashboard
        </h1>
        <div className="text-xs md:text-sm text-gray-600">
          Updated: {lastUpdated.toLocaleTimeString()} • Refresh in{" "}
          <span className={countdown <= 10 ? "text-red-600 animate-pulse font-semibold" : ""}>
            {countdown}s
          </span>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded shadow text-center">
          <div className="text-lg font-semibold">{total}</div>
          <div className="text-gray-500 text-sm">Total Sites</div>
        </div>
        <div className="bg-green-50 p-3 rounded shadow text-center">
          <div className="text-lg font-semibold text-green-700">{online}</div>
          <div className="text-gray-600 text-sm">Online</div>
        </div>
        <div className="bg-red-50 p-3 rounded shadow text-center">
          <div className="text-lg font-semibold text-red-700">{offline}</div>
          <div className="text-gray-600 text-sm">Offline</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded shadow text-center">
          <div className="text-lg font-semibold text-yellow-700">{pending}</div>
          <div className="text-gray-600 text-sm">Pending</div>
        </div>
      </div>

      {/* Error banner */}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3 flex items-center justify-between">
          <span>{err}</span>
          <button
            onClick={fetchSites}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters + actions */}
      <div className="flex flex-col md:flex-row gap-2 mb-3">
        <select
          className="bg-white p-2 rounded border shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["All Status", "online", "offline", "pending"].map((s) => (
            <option key={s} value={s}>
              {s === "All Status" ? s : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="bg-white p-2 rounded border shadow-sm"
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
        >
          {DEVICE_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          className="bg-white p-2 rounded border shadow-sm flex-1"
          placeholder="Search by location/device/status…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setCountdown(0)} // forces next tick to reload soon
            className="bg-blue-600 text-white px-3 py-2 rounded shadow hover:bg-blue-700"
            title="Refresh now"
          >
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="bg-gray-800 text-white px-3 py-2 rounded shadow hover:bg-black"
            title="Export CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden table-wrap">
        <table className="w-full text-sm">
          <thead className="text-gray-700">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">E911 Location</th>
              {headerCell("Status", "status")}
              <th className="p-2 text-left">Device</th>
              <th className="p-2 text-left">FXS Lines</th>
              {headerCell("Last Sync", "lastSync")}
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y fade-in">
            {loading && (
              <tr>
                <td className="p-3 text-gray-400" colSpan="7">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-3 text-gray-400" colSpan="7">
                  No sites match your filters.
                </td>
              </tr>
            )}

            {filtered.map((s) => (
              <React.Fragment key={s.id}>
                <tr className="hover:bg-gray-50">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2 font-medium">{s.e911Location || "—"}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${statusBadge(s.status)}`}
                    >
                      {s.status || "—"}
                    </span>
                  </td>
                  <td className="p-2">{s.device || "—"}</td>
                  <td className="p-2">{s.fxsLines ? s.fxsLines.length : 0}</td>
                  <td className="p-2">
                    <div>{fmtDate(s.lastSync)}</div>
                    <div className="text-gray-500 text-xs">{relTime(s.lastSync)}</div>
                  </td>

                  {/* Desktop actions */}
                  <td className="p-2">
                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={() => ping(s)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Ping
                      </button>
                      <button
                        onClick={() => reboot(s)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Reboot
                      </button>
                      <button
                        onClick={() => logs(s)}
                        className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
                      >
                        Logs
                      </button>
                    </div>

                    {/* Mobile trigger */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setActiveSiteId(s.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Actions
                      </button>
                    </div>
                  </td>
                </tr>

                {/* FXS collapsible */}
                {Array.isArray(s.fxsLines) && s.fxsLines.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan="7" className="p-2">
                      <details>
                        <summary className="cursor-pointer select-none">
                          View FXS Lines ({s.fxsLines.length})
                        </summary>
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {s.fxsLines.map((line, i) => (
                            <li key={i} className="p-2 border rounded bg-white">
                              <div className="font-mono">{line.number}</div>
                              <div
                                className={`text-xs mt-1 ${statusBadge(
                                  line.status || "pending"
                                )} inline-block px-2 py-0.5 rounded`}
                              >
                                {line.status || "pending"}
                              </div>
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

      {/* Mobile sticky action bar */}
      {activeSite && (
        <div className="fixed md:hidden left-3 right-3 bottom-3 bg-white border rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">{activeSite.e911Location}</div>
            <button
              onClick={() => setActiveSiteId(null)}
              className="text-gray-500 hover:text-black"
              aria-label="Close actions"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => ping(activeSite)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
            >
              Ping
            </button>
            <button
              onClick={() => reboot(activeSite)}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
            >
              Reboot
            </button>
            <button
              onClick={() => logs(activeSite)}
              className="flex-1 bg-gray-800 text-white py-2 rounded-lg"
            >
              Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
