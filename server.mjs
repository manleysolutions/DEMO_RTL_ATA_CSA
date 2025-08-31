// server.mjs
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware for JSON API
app.use(express.json());

// Example API endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/sites", (req, res) => {
  // Demo USPS sites
  res.json([
    { id: 1, name: "USPS HQ", status: "online", csa: true },
    { id: 2, name: "USPS Miami", status: "offline", csa: false },
    { id: 3, name: "USPS Jacksonville", status: "online", csa: true },
    { id: 4, name: "USPS Dallas", status: "unknown", csa: false },
    { id: 5, name: "USPS Denver", status: "online", csa: true },
  ]);
});

// Serve static Vite build files
app.use(express.static(path.join(__dirname, "dist")));

// Fallback: serve index.html for React/Vite routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
