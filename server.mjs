import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// -------------------- MOCK DATA (swap to real later) --------------------
/** Helper to generate N FXS lines with light variety */
function genLines(n, didPrefix = "202-555-01") {
  const statuses = ["active", "idle", "alarm", "pending"];
  const lines = [];
  for (let i = 1; i <= n; i++) {
    const s = statuses[Math.floor(Math.random() * statuses.length)];
    lines.push({
      port: i,
      did: `${didPrefix}${String(i).padStart(2, "0")}`,
      status: s, // active | idle | alarm | pending
    });
  }
  return lines;
}

/** Sites — shape matches what we’ll return to the UI */
const SITES = [
  {
    id: 1,
    e911Location: "Headquarters",
    status: "online", // online | offline | pending
    device: "CSA", // MS130 | SLELTE | ATA | CSA
    lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lines: genLines(16, "202-555-10"),
    logs: [
      "08/31 14:20 - Reboot issued by admin",
      "08/31 14:23 - Device back online",
      "08/31 15:45 - Sync OK",
    ],
  },
  {
    id: 2,
    e911Location: "Sorting Center",
    status: "offline",
    device: "ATA",
    lastSync: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lines: genLines(8, "202-555-20"),
    logs: [
      "08/31 12:10 - WAN down detected",
      "08/31 12:20 - Ping failed",
      "08/31 12:25 - Auto-retry scheduled",
    ],
  },
  {
    id: 3,
    e911Location: "Branch Office",
    status: "pending",
    device: "MS130",
    lastSync: null, // not yet synced
    lines: genLines(4, "202-555-30"),
    logs: ["08/31 09:10 - Device staged", "08/31 09:40 - Awaiting activation"],
  },
  {
    id: 4,
    e911Location: "Regional Hub",
    status: "online",
    device: "SLELTE",
    lastSync: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lines: genLines(24, "202-555-40"),
    logs: ["08/31 13:30 - LTE signal excellent", "08/31 14:00 - Sync OK"],
  },
];

/** Shape summaries the UI expects */
function toSummary(site) {
  const fxsTotal = site.lines.length;
  const fxsActive = site.lines.filter((l) => l.status === "active").length;
  return {
    id: site.id,
    e911Location: site.e911Location,
    status: site.status,
    device: site.device,
    lastSync: site.lastSync, // ISO
    fxsTotal,
    fxsActive,
    lines: site.lines, // included so the UI can expand without another call
  };
}

// -------------------- API --------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/sites", (req, res) => {
  res.json(SITES.map(toSummary));
});

app.get("/api/sites/:id/logs", (req, res) => {
  const site = SITES.find((s) => s.id === Number(req.params.id));
  if (!site) return res.status(404).json({ error: "Not found" });
  res.json(site.logs ?? []);
});

app.post("/api/sites/:id/ping", (req, res) => {
  const site = SITES.find((s) => s.id === Number(req.params.id));
  if (!site) return res.status(404).json({ error: "Not found" });

  const rttMs = Math.floor(20 + Math.random() * 80);
  site.logs.unshift(
    `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - Ping ${rttMs}ms`
  );
  res.json({ ok: true, rttMs });
});

app.post("/api/sites/:id/reboot", async (req, res) => {
  const site = SITES.find((s) => s.id === Number(req.params.id));
  if (!site) return res.status(404).json({ error: "Not found" });

  site.logs.unshift(
    `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - Reboot command sent`
  );
  // Simulate a brief reboot + new lastSync
  setTimeout(() => {
    site.status = "online";
    site.lastSync = new Date().toISOString();
    site.logs.unshift(
      `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - Device back online`
    );
  }, 1500);

  res.json({ ok: true, message: "Reboot requested" });
});

// -------------------- STATIC UI --------------------
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
