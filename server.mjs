import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const USER = process.env.DASHBOARD_USER || "admin";
const PASS = process.env.DASHBOARD_PASS || "admin123";

// --- Auth routes ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER && password === PASS) {
    req.session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
});

app.get("/me", (req, res) => {
  if (req.session.authenticated) {
    res.json({ ok: true, user: USER });
  } else {
    res.status(401).json({ ok: false });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// --- Protect API routes ---
function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.status(401).send("Unauthorized");
}

// Example protected API
app.get("/api/sites", requireAuth, (req, res) => {
  res.json([
    {
      facilityName: "USPS Facility A",
      address: "123 Main St, City, ST",
      pocName: "Jane Doe",
    },
    {
      facilityName: "USPS Facility B",
      address: "456 Center Rd, City, ST",
      pocName: "John Smith",
    },
  ]);
});

// Example carrier APIs
app.get("/api/carrier/numbers", requireAuth, (req, res) => {
  res.json([{ number: "+19045551234" }]);
});

app.get("/api/carrier/calls", requireAuth, (req, res) => {
  res.json([{ callId: "abc123", status: "completed" }]);
});

app.get("/api/carrier/messages", requireAuth, (req, res) => {
  res.json([{ msgId: "msg1", text: "Test message" }]);
});

app.get("/api/savings/demo", requireAuth, (req, res) => {
  res.json({ annual: 1200 });
});

// --- Serve frontend ---
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (req, res) =>
  res.sendFile(path.join(publicDir, "index.html"))
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Red Tag Lines backend running on http://0.0.0.0:${PORT}`);
});
