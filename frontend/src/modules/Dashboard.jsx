import React, { useEffect, useMemo, useState } from "react";
import MapView from "./MapView.jsx";

const TENANT = "USPS"; // multi-tenant hook

export default function Dashboard({ me }) {
  const [sites, setSites] = useState([]);
  const [mapSites, setMapSites] = useState([]);
  const [view, setView] = useState("list"); // list | map
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");

  // refresh timer
  const REFRESH_SECS = 90;
  const [t, setT] = useState(REFRESH_SECS);

  async function load() {
    const [s, m] = await Promise.all([
      fetch(`/api/sites?tenant=${TENANT}`).then(r=>r.json()),
      fetch(`/api/map/sites?tenant=${TENANT}`).then(r=>r.json()),
    ]);
    setSites(s);
    setMapSites(m);
    console.log("Dashboard reloaded");
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const id = setInterval(() => setT((x)=> x>0 ? x-1 : 0), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (t===0){ setT(REFRESH_SECS); load(); } }, [t]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  // filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(s =>
      (s.facilityName||"").toLowerCase().includes(q) ||
      (s.address||"").toLowerCase().includes(q) ||
      (s.pocName||"").toLowerCase().includes(q) ||
      (s.deviceType||"").toLowerCase().includes(q)
    );
  }, [sites, query]);

  // summary KPIs
  const kpi = useMemo(() => {
    const total = sites.length;
    const online = sites.filter(s=>s.status==="online").length;
    const pending = sites.filter(s=>s.status==="pending").length;
    const offline = total - online - pending;
    const monthly = sites.reduce((a,s)=> a + (s.savings?.monthlySavings||0), 0);
    const annual = sites.reduce((a,s)=> a + (s.savings?.annualSavings||0), 0);
    return { total, online, pending, offline, monthly, annual };
  }, [sites]);

  function badge(status) {
    if (status==="online") return <span className="badge ok">ONLINE</span>;
    if (status==="pending") return <span className="badge warn">PENDING</span>;
    return <span className="badge bad">OFFLINE</span>;
  }

  function exportCSV() {
    const headers = [
      "Facility","E911 Address","POC Name","POC Email","POC Phone",
      "Device","Connection","Install Date","Status","Last Check-In",
      "Monthly Savings","Annual Savings"
    ];
    const rows = sites.map(s => [
      s.facilityName, s.address, s.pocName, s.pocEmail, s.pocPhone,
      s.deviceType, s.connection, s.installDate, s.status, s.lastSeen,
      (s.savings?.monthlySavings||0), (s.savings?.annualSavings||0)
    ]);
    const all = [headers, ...rows].map(r => r.map(x => `"${(x??"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([all], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rtl_sites.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="header">
        <div className="header-row">
          <div className="brand">
            <div className="logo">RT</div>
            <h1>Red Tag Lines Deployment Dashboard</h1>
          </div>
          <div className="controls">
            <input className="field" placeholder="Search facilities, POC, address…" value={query} onChange={e=>setQuery(e.target.value)} />
            <button className="btn" onClick={()=> setView(view==="list"?"map":"list")}>
              {view==="list" ? "Map View" : "List View"}
            </button>
            <button className="btn" onClick={exportCSV}>Export CSV</button>
            <button className="btn" onClick={()=> setT(1)}>Refresh Now</button>
            <button className="btn" onClick={toggleTheme}>{theme==="light"?"Dark":"Light"} Mode</button>
            <div className={`counter ${t<=10?"flash":""}`}>Refresh in: {String(t).padStart(2,"0")}s</div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Summary */}
        <div className="grid">
          <div className="card">
            <div className="section-title">SUMMARY</div>
            <div className="summary">
              <div className="kpi"><div className="label">Total Sites</div><div className="value">{kpi.total}</div></div>
              <div className="kpi"><div className="label">Online</div><div className="value" style={{color:"var(--ok)"}}>{kpi.online}</div></div>
              <div className="kpi"><div className="label">Pending</div><div className="value" style={{color:"var(--warn)"}}>{kpi.pending}</div></div>
              <div className="kpi"><div className="label">Offline</div><div className="value" style={{color:"var(--bad)"}}>{kpi.offline}</div></div>
              <div className="kpi"><div className="label">Monthly Savings</div><div className="value">${kpi.monthly.toLocaleString()}</div></div>
              <div className="kpi"><div className="label">Annual Savings</div><div className="value">${kpi.annual.toLocaleString()}</div></div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">MAP</div>
            <MapView sites={mapSites}/>
          </div>
        </div>

        {/* SITE LIST */}
        <div className="card" style={{marginTop:12}}>
          <div className="section-title">SITES</div>
          <div className="site">
            {view==="map" && <div className="meta">Showing {mapSites.length} pins on the map above.</div>}
            {view==="list" && filtered.map((s) => (
              <SiteRow key={s.id} site={s} />
            ))}
          </div>
        </div>

        <div className="footer">
          Logged in as <b>{me?.user}</b> • Tenant: <b>{me?.tenant}</b>
        </div>
      </div>
    </>
  );
}

function SiteRow({ site }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState(null);

  async function ensureLines() {
    if (lines || loading) return;
    setLoading(true);
    const [l, r, g] = await Promise.all([
      fetch(`/api/lines/${site.id}`).then(r=>r.json()),
      fetch(`/api/report/${site.id}`).then(r=>r.json()),
      fetch(`/api/logs/${site.id}`).then(r=>r.json())
    ]);
    setLines(l); setReport(r); setLogs(g); setLoading(false);
  }

  useEffect(() => { if (open) ensureLines(); }, [open]);

  return (
    <div className="card">
      <div className="site-head">
        <div>
          <div className="site-title">{site.facilityName} {badge(site.status)}</div>
          <div className="meta">
            <b>E911:</b> {site.address} &nbsp;•&nbsp; <b>POC:</b> {site.pocName} ({site.pocEmail}, {site.pocPhone})
          </div>
          <div className="meta">
            <b>Device:</b> {site.deviceType} &nbsp;•&nbsp; <b>Connection:</b> {site.connection} &nbsp;•&nbsp; <b>MSISDN:</b> {site.msisdn}
          </div>
          <div className="meta">
            <b>Installed:</b> {site.installDate} &nbsp;•&nbsp; <b>Last check-in:</b> {fmtDate(site.lastSeen)}
          </div>
        </div>
        <div className="row">
          <div className="badge ok">Monthly: ${site.savings?.monthlySavings?.toLocaleString?.()||0}</div>
          <div className="badge ok">Annual: ${site.savings?.annualSavings?.toLocaleString?.()||0}</div>
          <button className="btn" onClick={()=> setOpen(o=>!o)}>{open?"Hide":"Open"}</button>
        </div>
      </div>

      {open && (
        <div className="cols" style={{marginTop:10}}>
          <div>
            <div className="section-title">RTL SERVICE (Lines)</div>
            {!lines && <div className="meta">{loading ? "Loading lines…" : "—"}</div>}
            {lines && (
              <div className="lines">
                <div className="line head">
                  <div>Label</div><div>Type</div><div>DID</div><div>Life Safety</div><div>Status</div>
                </div>
                {lines.map(l=> (
                  <div key={l.lineId} className="line">
                    <div>{l.label}</div>
                    <div>{l.type}</div>
                    <div>{l.did || l.msisdn || "—"}</div>
                    <div>{l.lifeSafety ? "Yes" : "No"}</div>
                    <div>{l.registered ? "Registered" : "Unreg"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="section-title">KPI / Logs</div>
            {!report && <div className="meta">Loading KPI…</div>}
            {report && (
              <div className="site" style={{marginBottom:10}}>
                <div className="field">Availability (30d): <b>{report.availabilityPct}%</b></div>
                <div className="field">Incidents (30d): <b>{report.incidents}</b></div>
              </div>
            )}
            <div className="section-title">Last 24h Logs</div>
            {!logs && <div className="meta">Loading logs…</div>}
            {logs && (
              <div className="site" style={{maxHeight: 180, overflow: "auto"}}>
                {logs.map((g,i)=>(
                  <div key={i} className="meta">[{g.level.toUpperCase()}] {fmtDate(g.ts)} — {g.msg}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function badge(status) {
  if (status==="online") return <span className="badge ok">ONLINE</span>;
  if (status==="pending") return <span className="badge warn">PENDING</span>;
  return <span className="badge bad">OFFLINE</span>;
}

function fmtDate(s) {
  try {
    const d = new Date(s);
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch { return s; }
}

