// app.js – USPS Dashboard

const tbody = document.querySelector("#sites-table tbody");
const statusCounts = {
  online: document.getElementById("count-online"),
  offline: document.getElementById("count-offline"),
  pending: document.getElementById("count-pending"),
  total: document.getElementById("count-total"),
};
const updatedEl = document.getElementById("last-updated");

function fmtDateMMDDYYYY(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "Invalid Date";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function dot(status) {
  const color =
    status === "online"
      ? "green"
      : status === "offline"
      ? "red"
      : status === "pending"
      ? "orange"
      : "gray";
  return `<span class="dot ${color}"></span>`;
}

function statusBadge(status) {
  if (status === "online") return `<span class="badge online">online</span>`;
  if (status === "offline") return `<span class="badge offline">offline</span>`;
  if (status === "pending") return `<span class="badge pending">pending</span>`;
  return `<span class="badge">${status}</span>`;
}

// === Render Table with Collapsible Lines ===
function renderTable(sites) {
  tbody.innerHTML = "";
  sites.forEach((site) => {
    const expandoId = `exp-${site.id}`;

    // Main site row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${site.id}</td>
      <td>${site.e911Location}</td>
      <td>${statusBadge(site.status)}</td>
      <td>${site.device || "—"}</td>
      <td>
        <button class="lines-pill" data-id="${site.id}">
          <span class="chev">▶</span>
          ${site.fxsActive}/${site.fxsTotal} active
        </button>
      </td>
      <td>${fmtDateMMDDYYYY(site.lastSync)}</td>
      <td class="center">
        <button class="btn small ping" data-id="${site.id}">Ping</button>
        <button class="btn small warn reboot" data-id="${site.id}">Reboot</button>
        <button class="btn small dark logs" data-id="${site.id}" data-name="${site.e911Location}">Logs</button>
      </td>
    `;
    tbody.appendChild(tr);

    // Expando hidden row
    const trExp = document.createElement("tr");
    trExp.id = expandoId;
    trExp.className = "expando hidden";
    const grid = site.lines
      .map(
        (ln) => `
        <div class="line-card">
          <div class="line-head">
            <strong>Port ${ln.port}</strong>
            ${dot(ln.status)}
          </div>
          <div class="muted">${ln.did || ""}</div>
        </div>`
      )
      .join("");
    trExp.innerHTML = `<td colspan="7"><div class="lines-grid">${grid}</div></td>`;
    tbody.appendChild(trExp);
  });

  // Toggle expand/collapse
  document.querySelectorAll(".lines-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const exp = document.getElementById(`exp-${id}`);
      btn.classList.toggle("lines-open");
      exp.classList.toggle("hidden");
    });
  });

  // Button actions
  document.querySelectorAll(".ping").forEach((b) =>
    b.addEventListener("click", onPing)
  );
  document.querySelectorAll(".reboot").forEach((b) =>
    b.addEventListener("click", onReboot)
  );
  document.querySelectorAll(".logs").forEach((b) =>
    b.addEventListener("click", onLogs)
  );
}

// === Actions ===
function onPing(e) {
  alert("Ping sent to site " + e.target.dataset.id);
}
function onReboot(e) {
  alert("Reboot triggered for site " + e.target.dataset.id);
}
function onLogs(e) {
  alert("Viewing logs for " + e.target.dataset.name);
}

// === Load Demo Data ===
async function loadSites() {
  const res = await fetch("/api/sites");
  const data = await res.json();

  // Update counts
  const total = data.length;
  const online = data.filter((s) => s.status === "online").length;
  const offline = data.filter((s) => s.status === "offline").length;
  const pending = data.filter((s) => s.status === "pending").length;

  statusCounts.total.textContent = total;
  statusCounts.online.textContent = online;
  statusCounts.offline.textContent = offline;
  statusCounts.pending.textContent = pending;
  updatedEl.textContent = new Date().toLocaleString();

  renderTable(data);
}

loadSites();
