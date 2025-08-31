import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function Dashboard() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => setSites(data))
      .catch((err) => console.error("Error fetching sites:", err));
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <header style={{ borderBottom: "2px solid #003366", marginBottom: "20px" }}>
        <h1 style={{ color: "#003366" }}>📡 USPS True911+ Dashboard</h1>
      </header>

      <h2>Sites</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "60%" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>ID</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id}>
              <td>{site.id}</td>
              <td>{site.location}</td>
              <td style={{ color: site.status === "online" ? "green" : site.status === "offline" ? "red" : "gray" }}>
                {site.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);
