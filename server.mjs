// server.mjs
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Session (optional)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rtl-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// ---------- HEALTH CHECK ----------
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Red Tag Lines backend",
    ts: new Date().toISOString(),
  });
});

// ---------- SAVINGS DEMO ----------
const savings = {
  monthly: (incumbent = 130, rtl = 40) => incumbent - rtl,
  annual: (incumbent = 130, rtl = 40) => (incumbent - rtl) * 12,
};

app.get("/api/savings/:lines", (req, res) => {
  const lines = parseInt(req.params.lines) || 0;
  res.json({
    lines,
    perLineMonthly: savings.monthly(),
    perLineAnnual: savings.annual(),
    totalAnnualSavings: lines * savings.annual(),
  });
});

// ---------- CONTACT ID ALARMS DEMO ----------
const CONTACT_ID_MAP = {
  "110": "Fire Alarm",
  "111": "Smoke",
  "113": "Pull Station",
  "114": "Duct Detector",
  "117": "AC Loss",
  "301": "System Reset",
  "401": "Burglar Alarm",
};

function parseContactId(payload = "") {
  const code = (payload.match(/\b(\d{3})\b/) || [])[1];
  return {
    code,
    description: CONTACT_ID_MAP[code] || "Unknown event",
    raw: payload,
  };
}

app.get("/api/alarms/demo", (req, res) => {
  const demo = [
    "18Q110 001 001", // Fire
    "18Q117 001 001", // AC Loss
    "18Q401 001 001", // Burglar
  ].map(parseContactId);
  res.json(demo);
});

// ---------- STATIC FRONTEND ----------
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---------- STARTUP ----------
console.log("[INIT] Starting Red Tag Lines backend...");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[READY] Red Tag Lines backend running at http://0.0.0.0:${PORT}`);
});

// ---------- ERROR HANDLER ----------
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
});
