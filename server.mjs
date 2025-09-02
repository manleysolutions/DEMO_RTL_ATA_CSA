// server.mjs
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// ====== setup ======
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ====== middleware ======
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: true,
  })
);

// ====== static frontend ======
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// ====== sample API routes ======

// Health check (for Render logs)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Red Tag Lines backend", ts: new Date() });
});

// Contact ID decode demo
const CONTACT_ID_MAP = {
  "110": "Fire Alarm",
  "111": "Smoke",
  "112": "Combustion",
  "113": "Pull Station",
  "114": "Duct Detector",
  "115": "Low Battery",
  "116": "AC Loss",
  "305": "System Reset",
  "401": "Burglar Alarm",
};

function parseContactId(payload = "") {
  const code = (payload.match(/\b(\d{3})\b/) || [])[1];
  return {
    code,
    description: (code && CONTACT_ID_MAP[code]) || "Unknown event",
    raw: payload,
  };
}

app.get("/api/alarms/:lineId/events", (req, res) => {
  const demo = ["18Q110 001 001", "18Q305 001 001", "18Q401 001 001"].map(
    parseContactId
  );
  res.json(demo);
});

// ====== catch-all for SPA ======
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ====== start ======
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Red Tag Lines backend running at http://0.0.0.0:${PORT}`);
});
