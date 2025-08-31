import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- API ROUTES ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/sites", (req, res) => {
  res.json([
    { id: "CSA09", location: "Jacksonville, FL", status: "online" },
    { id: "CSA10", location: "Orlando, FL", status: "offline" },
    { id: "HQ", location: "Ponte Vedra Beach, FL", status: "no CSA (monitor-only)" }
  ]);
});

// --- FRONTEND ---
app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 USPS Dashboard running on port ${PORT}`);
});
