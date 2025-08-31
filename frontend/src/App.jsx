import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => {
        setSites(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API fetch failed:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <header style={{ marginBottom: "20px" }}>
        <img
          src="/vite.svg"
          alt="USPS Logo"
          style={{ height: "40px", verticalAlign: "middle" }}
        />
        <h1 style={{ display: "inline", marginLeft: "10px", color: "#004B87" }}>
          USPS True911+ Dashboard
        </h1>
      </header>

      <h2 style={{ color: "#004B87" }}>Sites</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ background: "#004B87", color: "white" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Location
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {site.id}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {site.location}
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    color:
                      site.status === "online"
                        ? "green"
                        : site.status === "offline"
                        ? "red"
                        : "gray",
                    fontWeight: "bold",
                  }}
                >
                  {site.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
