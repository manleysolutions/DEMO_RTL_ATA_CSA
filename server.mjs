import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// --- session config ---
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// --- auth ---
const USER = process.env.DASHBOARD_USER || "admin";
const PASS = process.env.DASHBOARD_PASS || "admin123";

app.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;
  if (username === USER && password === PASS) {
    req.session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
});

function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.status(401).send("Unauthorized");
}

// --- API placeholder (replace later with real carrier/inseego/telnyx data) ---
app.get("/api/sites", requireAuth, (req, res) => {
  res.json([{ id: 1, facility: "HQ", address: "123 Main St", poc: "John Doe" }]);
});

app.get("/api/carrier/numbers", requireAuth, (req, res) => {
  res.json([{ number: "+19045551234", status: "active" }]);
});

app.get("/api/carrier/calls", requireAuth, (req, res) => {
  res.json([{ id: "c1", from: "+19045551234", to: "+19045556789", status: "completed" }]);
});

app.get("/api/carrier/messages", requireAuth, (req, res) => {
  res.json([{ id: "m1", from: "+19045551234", body: "Test SMS", status: "delivered" }]);
});

app.get("/api/savings/demo", requireAuth, (req, res) => {
  res.json({ monthly: 500, annual: 6000 });
});

// --- serve frontend ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// --- start ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Red Tag Lines backend running on http://0.0.0.0:${PORT}`);
});
