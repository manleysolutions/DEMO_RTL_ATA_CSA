import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// API route (demo)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/sites", (req, res) => {
  res.json([
    { id: 1, location: "HQ", status: "online" },
    { id: 2, location: "Warehouse", status: "offline" },
    { id: 3, location: "Branch", status: "no_csa" }
  ]);
});

// Serve frontend from /dist
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// Catch-all → send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
