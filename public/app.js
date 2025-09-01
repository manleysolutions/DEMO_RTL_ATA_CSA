const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const tbody = $("#tbody");
const updatedAt = $("#updatedAt");
const statusFilter = $("#statusFilter");
const deviceFilter = $("#deviceFilter");
const searchInput = $("#searchInput");
const refreshBtn = $("#refreshBtn");

const toast = $("#toast");
const logsModal = $("#logsModal");
const logsTitle = $("#logsTitle");
const logsBody = $("#logsBody");
const closeLogs = $("#closeLogs");

let ALL_SITES = [];

function fmtDateMMDDYYYY(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "Invalid Date";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function statusBadge(s) {
  if (s === "online") return `<span class="badge success">online</span>`;
  if (s === "offline") return `<span class="badge danger">offline</span>`;
  return `<span class="badge warning">pending</span>`;
}

function linesPill(fxsActive, fxsTotal, rowId) {
  return `
    <button class="lines-pill" data-row="${rowId}">
      <span class="chev">▶</span>
      ${fxsActive}/${fxsTotal} active
    </button>`;
}

function dot(status) {
  return `<span class="dot ${status}" title="${status}"></span>`;
}

function renderKPIs(sites) {
  $("#kpiTotal").textContent = sites.length;
  $("#kpiOnline").textContent = sites.filter(s => s.status === "online").length;
  $("#kpiOffline").textContent = sites.filter(s => s.status === "offline").length;
  $("#kpiPending").textContent = sites.filter(s => s.status === "pending").length;
}

function applyFilters() {
  const sVal = statusFilter.value;
  const dVal = deviceFilter.value;
  const q = searchInput.value.trim().toLowerCase();

  return ALL_SITES.filter(site => {
    const okStatus = sVal === "all" || site.status === sVal;
    const okDevice = dVal === "all" || site.device === dVal;
    const okSearch = !q || site.e911Location.toLowerCase().includes(q);
    return okStatus && okDevice && okSearch;
  });
}

function renderTable(sites) {
  tbody.innerHTML = "";
  sites.forEach((site) => {
    const rowId = `site-${site.id}`;
    const expandoId = `exp-${site.id}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${site.id}</td>
      <td>${site.e911Location}</td>
      <td>${statusBadge(site.status)}</td>
      <td>${site.device}</td>
      <td>${linesPill(site.fxsActive, site.fxsTotal, rowId)}</td>
      <td>${fmtDateMMDDYYYY(site.lastSync)}</td>
      <td class="center">
        <button class="btn small ping" data-id="${site.id}">Ping</button>
        <button class="btn small warn reboot" data-id="${site.id}">Reboot</button>
        <button class="btn small dark logs" data-id="${site.id}" data-name="${site.e911Location}">Logs</button>
      </td>
    `;
    tbody.appendChild(tr);

    // Expando row for FXS details
    const trExp = document.createElement("tr");
    trExp.id = expandoId;
    trExp.className = "expando hidden";
    const grid = site.lines.map(
      (ln) => `
      <div class="line-card">
        <div class="line-head">
          <strong>Port ${ln.port}</strong>
          ${dot(ln.status)}
        </div>
        <div class="muted">${ln.did}</div>
      </div>`
    ).join("");
    trExp.innerHTML = `<td colspan="7"><div class="lines-grid">${grid}</div></td>`;
    tbody.appendChild(trExp);
  });

  // Wire up expanders
  $$(".lines-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-row").replace("site-", "");
      const exp = document.getElementById(`exp-${id}`);
      btn.classList.toggle("lines-open");
      exp.classList.toggle("hidden");
    });
  });

  // Wire actions
  $$(".ping").forEach(b => b.addEventListener("click", onPing));
  $$(".reboot").forEach(b => b.addEventListener("click", onReboot));
  $$(".logs").forEach(b => b.addEventListener("click", onLogs));
}

function showToast(msg, ms = 2400) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), ms);
}

async function onPing(e) {
  const id = e.currentTarget.dataset.id;
  e.currentTarget.disabled = true;
  try {
    const r = await fetch(`/api/sites/${id}/ping`, { method: "POST" }).then(r=>r.json());
    showToast(r.ok ? `Ping: ${r.rttMs} ms` : "Ping failed");
    await loadSites(false);
  } catch {
    showToast("Ping failed");
  } finally {
    e.currentTarget.disabled = false;
  }
}

async function onReboot(e) {
  const id = e.currentTarget.dataset.id;
  e.currentTarget.disabled = true;
  try {
    const r = await fetch(`/api/sites/${id}/reboot`, { method: "POST" }).then(r=>r.json());
    showToast(r.ok ? "Reboot requested" : "Reboot failed");
    setTimeout(() => loadSites(false), 1700);
  } catch {
    showToast("Reboot failed");
  } finally {
    e.currentTarget.disabled = false;
  }
}

async function onLogs(e) {
  const id = e.currentTarget.dataset.id;
  const name = e.currentTarget.dataset.name;
  logsTitle.textContent = `Logs • ${name}`;
  logsBody.innerHTML = `<div class="muted">Loading…</div>`;
  logsModal.classList.remove("hidden");

  try {
    const logs = await fetch(`/api/sites/${id}/logs`).then(r=>r.json());
    logsBody.innerHTML = logs.length
      ? logs.map(l => `<div class="entry">${l}</div>`).join("")
      : `<div class="muted">No logs available.</div>`;
  } catch {
    logsBody.innerHTML = `<div class="muted">Failed to load logs.</div>`;
  }
}

closeLogs.addEventListener("click", () => logsModal.classList.add("hidden"));
logsModal.addEventListener("click", (e) => {
  if (e.target === logsModal) logsModal.classList.add("hidden");
});

async function loadSites(updateTime = true) {
  const data = await fetch("/api/sites").then(r => r.json());
  ALL_SITES = data;
  renderKPIs(ALL_SITES);
  renderTable(applyFilters());
  if (updateTime) {
    updatedAt.textContent = `Updated: ${new Date().toLocaleString()}`;
  }
}

statusFilter.addEventListener("change", () => renderTable(applyFilters()));
deviceFilter.addEventListener("change", () => renderTable(applyFilters()));
searchInput.addEventListener("input", () => renderTable(applyFilters()));
refreshBtn.addEventListener("click", () => loadSites(true));

// Auto-refresh every 45s
setInterval(() => loadSites(true), 45000);

// Kick off
loadSites(true);
