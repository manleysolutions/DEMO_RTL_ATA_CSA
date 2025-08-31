import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Serve frontend build ---
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// --- API routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Demo site data with extra fields
app.get("/api/sites", (req, res) => {
  res.json([
    {
      id: 1,
      location: "Headquarters",
      status: "online",
      deviceType: "CSA v1.1",
      lastSync: "2025-08-31 15:45 ET"
    },
    {
      id: 2,
      location: "Sorting Center",
      status: "offline",
      deviceType: "ATA191",
      lastSync: "2025-08-31 12:20 ET"
    },
    {
      id: 3,
      location: "Branch Office",
      status: "no_csa",
      deviceType: "—",
      lastSync: "—"
    },
    {
      id: 4,
      location: "Regional Hub",
      status: "online",
      deviceType: "CSA v1.1",
      lastSync: "2025-08-31 16:05 ET"
    }
  ]);
});

// --- Fallback to frontend ---
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
