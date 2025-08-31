import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ CSA USPS Dashboard API is online");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CSA USPS Dashboard", timestamp: new Date() });
});

// Sites endpoint (reads from ./data folder)
app.get("/api/sites", (req, res) => {
  try {
    const dataDir = path.join(__dirname, "data");
    let sites = [];

    if (fs.existsSync(dataDir)) {
      const siteDirs = fs.readdirSync(dataDir);
      siteDirs.forEach((site) => {
        const statusFile = path.join(dataDir, site, "status.json");
        if (fs.existsSync(statusFile)) {
          const status = JSON.parse(fs.readFileSync(statusFile, "utf8"));
          sites.push({ id: site, ...status });
        }
      });
    }

    res.json({ sites });
  } catch (err) {
    console.error("Error loading sites:", err);
    res.status(500).json({ error: "Failed to load sites" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`CSA USPS Dashboard API listening on port ${PORT}`);
});
