import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// serve built React frontend
app.use(express.static(path.join(__dirname, "frontend/dist")));

// API: return site statuses
app.get("/api/sites", (req, res) => {
  const dataDir = path.join(__dirname, "data");
  const sites = [];

  if (fs.existsSync(dataDir)) {
    fs.readdirSync(dataDir).forEach((siteDir, idx) => {
      const statusFile = path.join(dataDir, siteDir, "status.json");
      let status = "no_csa";

      if (fs.existsSync(statusFile)) {
        try {
          const json = JSON.parse(fs.readFileSync(statusFile, "utf8"));
          status = json.status || "unknown";
        } catch (err) {
          status = "error";
        }
      }

      sites.push({
        id: idx + 1,
        location: siteDir,
        status,
      });
    });
  }

  res.json({ sites });
});

// fallback to React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 USPS Dashboard running on port ${PORT}`);
});
