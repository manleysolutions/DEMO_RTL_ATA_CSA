import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Serve frontend ---
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// --- Mock site data ---
let sites = [
  { id: 1, location: "Headquarters", status: "online", device: "CSA v1.1", lastSync: new Date().toISOString() },
  { id: 2, location: "Sorting Center", status: "offline", device: "ATA191", lastSync: new Date().toISOString() },
  { id: 3, location: "Branch Office", status: "no_csa", device: "—", lastSync: "—" },
  { id: 4, location: "Regional Hub", status: "online", device: "CSA v1.1", lastSync: new Date().toISOString() }
];

// --- API health ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- API: list sites ---
app.get("/api/sites", (req, res) => {
  res.json(sites);
});

// --- API: ping site ---
app.post("/api/ping/:id", (req, res) => {
  const site = sites.find(s => s.id === parseInt(req.params.id));
  if (!site) return res.status(404).json({ ok: false, msg: "Site not found" });

  // simulate ping
  site.lastSync = new Date().toISOString();
  res.json({ ok: true, msg: `Ping to ${site.location} successful`, site });
});

// --- API: reboot site ---
app.post("/api/reboot/:id", (req, res) => {
  const site = sites.find(s => s.id === parseInt(req.params.id));
  if (!site) return res.status(404).json({ ok: false, msg: "Site not found" });

  res.json({ ok: true, msg: `Reboot triggered for ${site.location}` });
});

// --- API: fetch logs ---
app.get("/api/logs/:id", (req, res) => {
  const site = sites.find(s => s.id === parseInt(req.params.id));
  if (!site) return res.status(404).json({ ok: false, msg: "Site not found" });

  res.json({
    ok: true,
    logs: [
      `[${new Date().toISOString()}] Device checked in`,
      `[${new Date().toISOString()}] Status: ${site.status}`,
      `[${new Date().toISOString()}] Action log complete`
    ]
  });
});

// --- Fallback: frontend handles routing ---
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
