import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Serve frontend from Vite build ---
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// --- API routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/sites", (req, res) => {
  res.json([
    { id: 1, location: "Headquarters", status: "online" },
    { id: 2, location: "Sorting Center", status: "offline" },
    { id: 3, location: "Branch Office", status: "no_csa" }
  ]);
});

// --- Fallback: let frontend handle routes ---
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start server (only once) ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
