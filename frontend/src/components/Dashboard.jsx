import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(90);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      console.log("Fetched sites:", data); // DEBUG
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

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-blue-800">
        USPS True911+ Deployment Dashboard
      </h1>
      <p className="text-sm text-gray-600">
        Updated: {lastUpdated.toLocaleTimeString()} | Refresh in:{" "}
        <span className={countdown <= 10 ? "text-red-600 animate-pulse" : ""}>
          {countdown}s
        </span>
      </p>
      <p className="text-sm text-gray-500 mb-4">Loaded {sites.length} site(s)</p>

      <div className="grid gap-4">
        {sites.map((site) => (
          <div key={site.id} className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold">{site.e911Location}</h2>
            <p>Status: <span className="font-mono">{site.status}</span></p>
            <p>Device: {site.device}</p>
            <p>Last Sync: {site.lastSync || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
