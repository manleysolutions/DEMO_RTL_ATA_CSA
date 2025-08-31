import "./index.css";

// --- Toast Helper ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `
    px-4 py-2 rounded shadow text-white animate-fadeIn
    ${type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"}
  `;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "transition-opacity", "duration-500");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// --- API actions ---
window.pingSite = async (id) => {
  const res = await fetch(`/api/ping/${id}`, { method: "POST" });
  const data = await res.json();
  showToast(data.msg, data.ok ? "success" : "error");
  loadSites();
};

window.rebootSite = async (id) => {
  const res = await fetch(`/api/reboot/${id}`, { method: "POST" });
  const data = await res.json();
  showToast(data.msg, data.ok ? "success" : "error");
};

window.fetchLogs = async (id) => {
  const res = await fetch(`/api/logs/${id}`);
  const data = await res.json();
  showToast(`Logs for site ${id} loaded.`, "info");
  console.log("Logs:", data.logs);
};

// --- Load table ---
async function loadSites() {
  const res = await fetch("/api/sites");
  const sites = await res.json();

  const table = document.getElementById("sitesTable");
  table.innerHTML = "";

  sites.forEach((site) => {
    const row = document.createElement("tr");
    row.className = "border-b";

    row.innerHTML = `
      <td class="px-4 py-2">${site.id}</td>
      <td class="px-4 py-2">${site.location}</td>
      <td class="px-4 py-2 font-semibold ${
        site.status === "online"
          ? "text-green-600"
          : site.status === "offline"
          ? "text-red-600"
          : "text-yellow-600"
      }">${site.status}</td>
      <td class="px-4 py-2">${site.device || "—"}</td>
      <td class="px-4 py-2">${site.lastSync || "—"}</td>
      <td class="px-4 py-2 space-x-2">
        <button onclick="pingSite(${site.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ping</button>
        <button onclick="rebootSite(${site.id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Reboot</button>
        <button onclick="fetchLogs(${site.id})" class="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">Logs</button>
      </td>
    `;

    table.appendChild(row);
  });

  document.getElementById("lastUpdated").textContent =
    "Updated: " + new Date().toLocaleString();
}

loadSites();
setInterval(loadSites, 10000);
