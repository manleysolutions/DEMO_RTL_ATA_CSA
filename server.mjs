// server.mjs
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

// Resolve __dirname since we are in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for JSON
app.use(express.json());

// --- API ROUTES ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/sites", (req, res) => {
  res.json([
    { id: "CSA09", status: "online", ip: "162.190.64.11" },
    { id: "USPS-NO-CSA", status: "no CSA installed" },
  ]);
});

// --- FRONTEND ROUTES ---
// Serve static frontend (Vite build)
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all: return index.html for React/Vite router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
