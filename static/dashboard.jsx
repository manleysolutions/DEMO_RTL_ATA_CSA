const { useState, useEffect } = React;

function Stat({ title, value, className="" }) {
  return (
    <div className={`bg-white shadow rounded p-4 text-center ${className}`}>
      <div className="text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Actions({ site }) {
  const ping = async () => {
    await fetch(`/api/ping/${site.id}`, { method: "POST" });
    alert(`Ping sent to ${site.id}`);
  };
  const reboot = async () => {
    await fetch(`/api/reboot/${site.id}`, { method: "POST" });
    alert(`Reboot queued for ${site.id}`);
  };
  const report = () => {
    window.location = `/api/report/${site.id}`;
  };

  return (
    <div className="flex gap-2">
      <button onClick={ping} className="px-2 py-1 bg-blue-600 text-white rounded">Ping</button>
      <button onClick={reboot} className="px-2 py-1 bg-yellow-500 text-white rounded">Reboot</button>
      <button onClick={report} className="px-2 py-1 bg-slate-700 text-white rounded">Report</button>
    </div>
  );
}

function Dashboard() {
  const [me, setMe] = useState(null);
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(90);
  const [query, setQuery] = useState("");

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      setMe(data);
    } catch(e) {}
  };

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data);
      setLastUpdated(new Date().toLocaleString());
      setCountdown(90);
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchSites();
    const interval = setInterval(fetchSites, 90000); // 90s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCountdown(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = sites.filter(s => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (s.id || "").toLowerCase().includes(q) ||
           (s.name || "").toLowerCase().includes(q) ||
           (s.e911Location || "").toLowerCase().includes(q) ||
           (s.device || "").toLowerCase().includes(q);
  });

  const total = filtered.length;
  const online = filtered.filter(s => s.status === "online").length;
  const offline = filtered.filter(s => s.status === "offline").length;
  const pending = filtered.filter(s => s.status === "pending").length;
  const savingsMonthly = filtered.reduce((a, s) => a + (s.savingsMonthly || 0), 0);
  const savingsAnnual = filtered.reduce((a, s) => a + (s.savingsAnnual || 0), 0);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">USPS True911+ Deployment Dashboard</h1>
          <p className="text-sm text-gray-600">
            Updated: {lastUpdated || "—"}
          </p>
          <div className="mt-1 w-48 h-3 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-3 bg-blue-600 transition-all duration-1000"
              style={{ width: `${(countdown / 90) * 100}%` }}
            ></div>
          </div>
          <span className="text-blue-600 text-sm font-semibold">Refresh in {countdown}s</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search sites…"
            className="border rounded px-3 py-2 w-64"
          />
          <a
            href="/api/export/sites"
            className="px-3 py-2 bg-slate-800 text-white rounded"
          >
            Export CSV
          </a>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Stat title="Total Sites" value={total} />
        <Stat title="Online" value={online} className="bg-green-50" />
        <Stat title="Offline" value={offline} className="bg-red-50" />
        <Stat title="Pending" value={pending} className="bg-yellow-50" />
        <Stat title="Monthly Savings" value={`$${savingsMonthly.toLocaleString()}`} />
        <Stat title="Annual Savings" value={`$${savingsAnnual.toLocaleString()}`} />
      </section>

      <section className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">E911 Location</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Device</th>
              <th className="px-4 py-2 text-left">FXS Lines</th>
              <th className="px-4 py-2 text-left">Last Sync</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(site => (
              <tr key={site.id} className="border-t">
                <td className="px-4 py-2">{site.id}</td>
                <td className="px-4 py-2">{site.name || "—"}</td>
                <td className="px-4 py-2">{site.e911Location || "—"}</td>
                <td className={`px-4 py-2 font-semibold ${
                  site.status === "online" ? "text-green-600"
                  : site.status === "offline" ? "text-red-600"
                  : "text-yellow-600"
                }`}>{site.status}</td>
                <td className="px-4 py-2">{site.device || "—"}</td>
                <td className="px-4 py-2">{(site.fxsLines || []).length}</td>
                <td className="px-4 py-2">
                  {site.lastSync ? new Date(site.lastSync).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <Actions site={site} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">No sites match your search.</div>
        )}
      </section>

      {me && me.authenticated && (
        <p className="text-xs text-gray-500">
          Logged in as <b>{me.user}</b> • Tenant: <b>{me.tenant}</b>
        </p>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Dashboard />);
