import "./index.css";

let allSites = [];

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
  await loadSites();
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

// --- Expand/Collapse Lines ---
function renderFXSLines(lines) {
  return `
    <div class="ml-6 mt-2 p-2 bg-gray-50 rounded border">
      <h4 class="font-semibold mb-2">FXS Lines</h4>
      <ul class="grid grid-cols-6 gap-2 text-sm">
        ${lines.map((line) => `<li class="px-2 py-1 bg-white shadow rounded">Line ${line}</li>`).join("")}
      </ul>
    </div>
  `;
}

// --- Render table with summary ---
function renderSites(filteredSites) {
  const table = document.getElementById("sitesTable");
  table.innerHTML = "";

  // Summary counts
  const total = filteredSites.length;
  const online = filteredSites.filter((s) => s.status === "online").length;
  const offline = filteredSites.filter((s) => s.status === "offline").length;
  const pending = filteredSites.filter((s) => s.status === "pending").length;

  document.getElementById("totalSites").textContent = total;
  document.getElementById("onlineSites").textContent = online;
  document.getElementById("offlineSites").textContent = offline;
  document.getElementById("pendingSites").textContent = pending;

  filteredSites.forEach((site) => {
    const row = document.createElement("tr");
    row.className = "border-b cursor-pointer hover:bg-gray-50";

    const statusClasses =
      site.status === "online"
        ? "text-green-600 font-semibold"
        : site.status === "offline"
        ? "text-red-600 font-semibold"
        : "text-yellow-600 font-semibold";

    const formattedDate = site.lastSync
      ? new Date(site.lastSync).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "—";

    row.innerHTML = `
      <td class="px-4 py-2">${site.id}</td>
      <td class="px-4 py-2">${site.location}</td>
      <td class="px-4 py-2 ${statusClasses}">${site.status}</td>
      <td class="px-4 py-2">${site.device || "—"}</td>
      <td class="px-4 py-2">${site.fxsLines?.length || 0}</td>
      <td class="px-4 py-2">${formattedDate}</td>
      <td class="px-4 py-2 space-x-2">
        <button onclick="pingSite(${site.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ping</button>
        <button onclick="rebootSite(${site.id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Reboot</button>
        <button onclick="fetchLogs(${site.id})" class="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">Logs</button>
      </td>
    `;

    table.appendChild(row);

    // Expand lines row
    if (site.fxsLines && site.fxsLines.length > 0) {
      const lineRow = document.createElement("tr");
      const colSpan = 7;
      lineRow.innerHTML = `<td colspan="${colSpan}">${renderFXSLines(site.fxsLines)}</td>`;
      lineRow.className = "hidden site-lines-" + site.id;
      row.addEventListener("click", () => {
        lineRow.classList.toggle("hidden");
      });
      table.appendChild(lineRow);
    }
  });

  document.getElementById("lastUpdated").textContent =
    "Updated: " + new Date().toLocaleString();
}

// --- Load data ---
async function loadSites() {
  const res = await fetch("/api/sites");
  allSites = await res.json();
  applyFilters();
}

// --- Apply filters ---
function applyFilters() {
  const statusFilter = document.getElementById("statusFilter").value;
  const deviceFilter = document.getElementById("deviceFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase();

  let filtered = [...allSites];

  if (statusFilter) {
    filtered = filtered.filter((s) => s.status === statusFilter);
  }
  if (deviceFilter) {
    filtered = filtered.filter((s) => s.device === deviceFilter);
  }
  if (search) {
    filtered = filtered.filter((s) =>
      s.location.toLowerCase().includes(search)
    );
  }

  renderSites(filtered);
}

// --- Hook summary cards for quick filters ---
document.getElementById("filter-total").addEventListener("click", () => {
  document.getElementById("statusFilter").value = "";
  applyFilters();
});
document.getElementById("filter-online").addEventListener("click", () => {
  document.getElementById("statusFilter").value = "online";
  applyFilters();
});
document.getElementById("filter-offline").addEventListener("click", () => {
  document.getElementById("statusFilter").value = "offline";
  applyFilters();
});
document.getElementById("filter-pending").addEventListener("click", () => {
  document.getElementById("statusFilter").value = "pending";
  applyFilters();
});

// Filters & live updates
document.getElementById("statusFilter").addEventListener("change", applyFilters);
document.getElementById("deviceFilter").addEventListener("change", applyFilters);
document.getElementById("searchInput").addEventListener("input", applyFilters);

loadSites();
setInterval(loadSites, 10000);
