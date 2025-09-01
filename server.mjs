import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Serve frontend from Vite build ---
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// --- API routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/sites", (req, res) => {
  res.json([
    {
      id: 1,
      e911Location: "Headquarters",
      status: "online",
      device: "CSA v1.0",
      fxsActive: 11,
      fxsTotal: 16,
      lastSync: "2025-08-31T23:04:57.016Z",
      lines: Array.from({ length: 16 }, (_, i) => ({
        port: i + 1,
        did: `202-555-10${String(i + 1).padStart(2, "0")}`,
        status: i % 4 === 0 ? "online" : i % 3 === 0 ? "pending" : "offline",
      })),
    },
    {
      id: 2,
      e911Location: "Sorting Center",
      status: "offline",
      device: "ATA191",
      fxsActive: 1,
      fxsTotal: 8,
      lastSync: "2025-08-31T23:04:42.535Z",
      lines: Array.from({ length: 8 }, (_, i) => ({
        port: i + 1,
        did: `202-555-20${String(i + 1).padStart(2, "0")}`,
        status: i % 2 === 0 ? "offline" : "pending",
      })),
    },
    {
      id: 3,
      e911Location: "Branch Office",
      status: "pending",
      device: "MS130",
      fxsActive: 2,
      fxsTotal: 4,
      lastSync: null,
      lines: Array.from({ length: 4 }, (_, i) => ({
        port: i + 1,
        did: `202-555-30${String(i + 1).padStart(2, "0")}`,
        status: i % 2 === 0 ? "online" : "offline",
      })),
    },
    {
      id: 4,
      e911Location: "Regional Hub",
      status: "online",
      device: "SLETE",
      fxsActive: 6,
      fxsTotal: 24,
      lastSync: "2025-08-31T23:04:42.535Z",
      lines: Array.from({ length: 24 }, (_, i) => ({
        port: i + 1,
        did: `202-555-40${String(i + 1).padStart(2, "0")}`,
        status: i % 5 === 0 ? "pending" : "online",
      })),
    },
  ]);
});

// --- Fallback: let frontend handle routes ---
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
1~import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Serve frontend from Vite build ---
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// --- API routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/sites", (req, res) => {
  res.json([
    {
      id: 1,
      e911Location: "Headquarters",
      status: "online",
      device: "CSA v1.0",
      fxsActive: 11,
      fxsTotal: 16,
      lastSync: "2025-08-31T23:04:57.016Z",
      lines: Array.from({ length: 16 }, (_, i) => ({
        port: i + 1,
        did: `202-555-10${String(i + 1).padStart(2, "0")}`,
        status: i % 4 === 0 ? "online" : i % 3 === 0 ? "pending" : "offline",
      })),
    },
    {
      id: 2,
      e911Location: "Sorting Center",
      status: "offline",
      device: "ATA191",
      fxsActive: 1,
      fxsTotal: 8,
      lastSync: "2025-08-31T23:04:42.535Z",
      lines: Array.from({ length: 8 }, (_, i) => ({
        port: i + 1,
        did: `202-555-20${String(i + 1).padStart(2, "0")}`,
        status: i % 2 === 0 ? "offline" : "pending",
      })),
    },
    {
      id: 3,
      e911Location: "Branch Office",
      status: "pending",
      device: "MS130",
      fxsActive: 2,
      fxsTotal: 4,
      lastSync: null,
      lines: Array.from({ length: 4 }, (_, i) => ({
        port: i + 1,
        did: `202-555-30${String(i + 1).padStart(2, "0")}`,
        status: i % 2 === 0 ? "online" : "offline",
      })),
    },
    {
      id: 4,
      e911Location: "Regional Hub",
      status: "online",
      device: "SLETE",
      fxsActive: 6,
      fxsTotal: 24,
      lastSync: "2025-08-31T23:04:42.535Z",
      lines: Array.from({ length: 24 }, (_, i) => ({
        port: i + 1,
        did: `202-555-40${String(i + 1).padStart(2, "0")}`,
        status: i % 5 === 0 ? "pending" : "online",
      })),
    },
  ]);
});

// --- Fallback: let frontend handle routes ---
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
