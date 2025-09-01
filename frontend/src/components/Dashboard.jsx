import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [sites, setSites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(90);

  // Fetch site data from API
  const fetchSites = async () => {
    try {
      const response = await fetch("/api/sites");
      const data = await response.json();
      setSites(data);
      setLastUpdated(new Date());
      console.log("Dashboard reloaded"); // ✅ Debug log
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    }
  };

  // Auto refresh logic
  useEffect(() => {
    fetchSites();

    const interval = setInterval(() => {
      fetchSites();
      setCountdown(90);
    }, 90000); // every 90s

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 90));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-800">
        USPS True911+ Deployment Dashboard
      </h1>
      <p className="text-gray-500 text-sm">
        Updated: {lastUpdated.toLocaleTimeString()} | Refresh in:{" "}
        <span className={countdown <= 10 ? "text-red-600 animate-pulse" : ""}>
          {countdown}s
        </span>
      </p>

      {/* Debug: Show site count */}
      <p className="mt-2 text-sm text-gray-600">
        Loaded {sites.length} site(s)
      </p>
    </div>
  );
};

export default Dashboard;
