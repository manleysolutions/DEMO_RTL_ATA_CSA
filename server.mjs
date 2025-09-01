import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Serve frontend (from /public folder after build) ---
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

// --- Simple API healthcheck ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- Example API sites data ---
app.get("/api/sites", (req, res) => {
  res.json([
    {
      id: 1,
      e911Location: "Headquarters",
      status: "online",
      device: "CSA v1.1",
      fxsLines: [
        { port: 1, number: "202-555-1001", status: "online" },
        { port: 2, number: "202-555-1002", status: "offline" },
        { port: 3, number: "202-555-1003", status: "pending" }
      ],
      lastSync: "2025-08-31T23:04:57.016Z"
    },
    {
      id: 2,
      e911Location: "Sorting Center",
      status: "offline",
      device: "ATA191",
      fxsLines: [
        { port: 1, number: "202-555-2001", status: "offline" },
        { port: 2, number: "202-555-2002", status: "offline" }
      ],
      lastSync: "2025-08-31T23:04:42.535Z"
    },
    {
      id: 3,
      e911Location: "Branch Office",
      status: "pending",
      device: "MS130",
      fxsLines: [
        { port: 1, number: "202-555-3001", status: "online" },
        { port: 2, number: "202-555-3002", status: "offline" }
      ],
      lastSync: null
    },
    {
      id: 4,
      e911Location: "Regional Hub",
      status: "online",
      device: "SLETE",
      fxsLines: [
        { port: 1, number: "202-555-4001", status: "online" },
        { port: 2, number: "202-555-4002", status: "online" }
      ],
      lastSync: "2025-08-31T23:04:42.535Z"
    }
  ]);
});

// --- Fallback to frontend index.html ---
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
