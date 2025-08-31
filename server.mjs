import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Allow JSON parsing
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// List all CSA site status files in data/
app.get("/api/sites", (req, res) => {
  try {
    const dataDir = path.join(__dirname, "data");
    let sites = [];

    if (fs.existsSync(dataDir)) {
      const deviceDirs = fs.readdirSync(dataDir);
      deviceDirs.forEach(device => {
        const statusFile = path.join(dataDir, device, "status.json");
        if (fs.existsSync(statusFile)) {
          const status = JSON.parse(fs.readFileSync(statusFile, "utf-8"));
          sites.push({ id: device, ...status });
        }
      });
    }

    res.json({ sites });
  } catch (err) {
    console.error("Error reading sites:", err);
    res.status(500).json({ error: "Failed to load sites" });
  }
});

// Root route (so “/” doesn’t 404)
app.get("/", (req, res) => {
  res.send("✅ USPS Dashboard backend is running. Use /api/health or /api/sites.");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
