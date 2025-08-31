import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => setHealth(data));

    fetch("/api/sites")
      .then(res => res.json())
      .then(data => setSites(data));
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>📡 USPS Dashboard</h1>
      {health ? (
        <p>Status: ✅ {health.status} @ {health.time}</p>
      ) : (
        <p>Loading health...</p>
      )}

      <h2>Sites</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sites.map(site => (
            <tr key={site.id}>
              <td>{site.id}</td>
              <td>{site.location}</td>
              <td>{site.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);
