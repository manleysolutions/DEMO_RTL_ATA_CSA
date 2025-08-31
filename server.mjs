import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "USPS Dashboard API" });
});

// Sites endpoint — reads local status JSONs
app.get("/api/sites", (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), "data");
    let sites = [];

    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      files.forEach((f) => {
        if (f.endsWith(".json")) {
          const content = fs.readFileSync(path.join(dataDir, f), "utf8");
          sites.push(JSON.parse(content));
        }
      });
    }

    res.json({ sites });
  } catch (err) {
    console.error("Error reading site data:", err);
    res.status(500).json({ error: "Failed to load site data" });
  }
});

// Default homepage
app.get("/", (req, res) => {
  res.send("✅ USPS Dashboard is running. Check /api/health or /api/sites");
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard API running on port ${PORT}`);
});
