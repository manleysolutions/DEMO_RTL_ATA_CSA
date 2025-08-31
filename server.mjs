import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

// __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/sites", (req, res) => {
  res.json([
    { id: 1, name: "USPS Location 1", status: "Connected" },
    { id: 2, name: "USPS Location 2", status: "Not Connected" }
  ]);
});

// Serve frontend build
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// Fallback to index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
