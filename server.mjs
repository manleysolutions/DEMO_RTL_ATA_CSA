import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Credentials from environment (fallback to defaults)
const USER = process.env.DASHBOARD_USER || "admin";
const PASS = process.env.DASHBOARD_PASS || "admin123";

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER && password === PASS) {
    req.session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ ok: false, error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true, message: "Logged out successfully" });
  });
});

// Middleware to enforce authentication
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

// Example API (protected)
app.get("/api/data", requireAuth, (req, res) => {
  res.json({ message: "Secure data from CSA Dashboard backend" });
});

// Serve frontend only if authenticated
app.use(requireAuth, express.static(path.join(__dirname, "public")));

// Catch-all → index.html for SPA routing
app.get("*", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CSA Dashboard server running at http://0.0.0.0:${PORT}`);
});
