import "./index.css";

async function loadSites() {
  const res = await fetch("/api/sites");
  const sites = await res.json();

  const tableBody = document.getElementById("sites-table-body");
  tableBody.innerHTML = "";

  sites.forEach(site => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 py-2">${site.id}</td>
      <td class="px-4 py-2">${site.location}</td>
      <td class="px-4 py-2 font-bold ${site.status === "online" ? "text-green-600" : site.status === "offline" ? "text-red-600" : "text-yellow-600"}">${site.status}</td>
      <td class="px-4 py-2">${site.device}</td>
      <td class="px-4 py-2">${site.lastSync}</td>
      <td class="px-4 py-2 flex gap-2">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded" onclick="pingSite(${site.id})">Ping</button>
        <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded" onclick="rebootSite(${site.id})">Reboot</button>
        <button class="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded" onclick="fetchLogs(${site.id})">Logs</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- API Actions ---
window.pingSite = async (id) => {
  const res = await fetch(`/api/ping/${id}`, { method: "POST" });
  const data = await res.json();
  alert(data.msg);
  loadSites();
};

window.rebootSite = async (id) => {
  const res = await fetch(`/api/reboot/${id}`, { method: "POST" });
  const data = await res.json();
  alert(data.msg);
};

window.fetchLogs = async (id) => {
  const res = await fetch(`/api/logs/${id}`);
  const data = await res.json();
  alert(`Logs for site ${id}:\n\n` + data.logs.join("\n"));
};

// --- Init ---
loadSites();
