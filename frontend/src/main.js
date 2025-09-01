import './index.css';

// Fetch sites dynamically (works locally + Render)
async function fetchSites() {
  try {
    const response = await fetch("/api/sites");
    const sites = await response.json();
    renderSites(sites);
  } catch (err) {
    console.error("Error fetching sites:", err);
    document.getElementById("sitesTableBody").innerHTML =
      `<tr><td colspan="7" class="text-center text-red-500">Error loading sites</td></tr>`;
  }
}

// Render table rows
function renderSites(sites) {
  const tbody = document.getElementById("sitesTableBody");
  tbody.innerHTML = "";

  sites.forEach(site => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="px-4 py-2">${site.id}</td>
      <td class="px-4 py-2">${site.e911Location}</td>
      <td class="px-4 py-2">${site.status}</td>
      <td class="px-4 py-2">${site.device}</td>
      <td class="px-4 py-2">${site.fxsLines?.length || 0}</td>
      <td class="px-4 py-2">${formatDate(site.lastSync)}</td>
      <td class="px-4 py-2 flex gap-2">
        <button class="px-3 py-1 bg-blue-500 text-white rounded">Ping</button>
        <button class="px-3 py-1 bg-yellow-500 text-white rounded">Reboot</button>
        <button class="px-3 py-1 bg-gray-600 text-white rounded">Logs</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// Format dates into MM/DD/YYYY
function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d)) return "Invalid Date";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

// Run fetch on load
fetchSites();
