import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 4000;

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// --- API ROUTES --- //
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/sites", (req, res) => {
  const dataPath = path.join(__dirname, "data", "sites.json");
  if (fs.existsSync(dataPath)) {
    const sites = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    res.json(sites);
  } else {
    res.json({ sites: [] });
  }
});

// --- SERVE FRONTEND BUILD --- //
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// Fallback: always serve index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
