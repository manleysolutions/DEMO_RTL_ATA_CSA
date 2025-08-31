import { useEffect, useState } from "react";

export default function App() {
  const [sites, setSites] = useState([]);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data.sites || []);
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    }
  };

  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, 15000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status) => {
    if (status === "online") return "bg-green-100 text-green-700";
    if (status === "offline") return "bg-red-100 text-red-700";
    if (status === "no_csa") return "bg-gray-100 text-gray-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      <header className="flex items-center space-x-3 mb-6">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2e/USPS_logo.svg"
          alt="USPS Logo"
          className="h-12"
        />
        <h1 className="text-2xl font-bold text-blue-800">
          USPS True911+ Dashboard
        </h1>
      </header>

      <section className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Sites</h2>
        <table className="min-w-full mt-2 border border-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                Location
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2 border">{s.id}</td>
                <td className="px-4 py-2 border">{s.location}</td>
                <td className={`px-4 py-2 border font-semibold ${statusColor(s.status)}`}>
                  {s.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
