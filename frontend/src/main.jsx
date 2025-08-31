import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function StatusBadge({ status }) {
  let color;
  if (status === "online") color = "bg-green-100 text-green-800";
  else if (status === "offline") color = "bg-red-100 text-red-800";
  else color = "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 py-1 text-sm font-semibold rounded ${color}`}
      style={{ textTransform: "capitalize" }}
    >
      {status}
    </span>
  );
}

function Dashboard() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => setSites(data))
      .catch((err) => console.error("Error fetching sites:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="border-b-2 border-blue-900 mb-6 pb-2 flex items-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/4e/USPS_logo.svg"
          alt="USPS Logo"
          className="h-10 mr-3"
        />
        <h1 className="text-3xl font-bold text-blue-900">
          USPS True911+ Dashboard
        </h1>
      </header>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sites</h2>

      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, idx) => (
              <tr
                key={site.id}
                className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="p-3">{site.id}</td>
                <td className="p-3">{site.location}</td>
                <td className="p-3">
                  <StatusBadge status={site.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);
