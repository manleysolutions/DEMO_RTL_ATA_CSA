import React, { useEffect, useState } from "https://cdn.skypack.dev/react";
import { createRoot } from "https://cdn.skypack.dev/react-dom/client";

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
      setCountdown(90);
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 90000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="text-sm text-gray-600 text-right">
          Updated: {lastUpdated || "—"}
          <div className="mt-1 w-40 h-3 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-3 bg-blue-600 transition-all duration-1000"
              style={{ width: `${(countdown / 90) * 100}%` }}
            ></div>
          </div>
          <span className="text-blue-600 font-semibold">
            Refresh in {countdown}s
          </span>
        </div>
      </header>

      {/* Stats */}
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
