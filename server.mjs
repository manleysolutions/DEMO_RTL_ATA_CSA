// server.mjs
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static frontend (from public/)
app.use(express.static(path.join(__dirname, "public")));

// Example API route (healthcheck)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "usps_dashboard" });
});

// Example API route for sites
app.get("/api/sites", (req, res) => {
  res.json([
    { id: 1, name: "CSA09", status: "online" },
    { id: 2, name: "CSA08", status: "offline" },
    { id: 3, name: "Non-CSA Location", status: "no_csa" }
  ]);
});

// Fallback: send index.html for React router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
