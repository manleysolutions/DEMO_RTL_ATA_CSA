import express from "express";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Hardcoded fallback login (admin/admin123)
const USER = process.env.DASHBOARD_USER || "admin";
const PASS = process.env.DASHBOARD_PASS || "admin123";

// Debug log at startup
console.log("[AUTH CONFIG] USER:", USER, "PASS:", PASS);

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("[LOGIN ATTEMPT]", username, password);
  
  if (username === USER && password === PASS) {
    req.session.authenticated = true;
    res.json({ ok: true, message: "Login successful" });
  } else {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
});

// Protect routes
function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.status(401).send("Unauthorized");
}

// Example protected route
app.get("/secure", requireAuth, (req, res) => {
  res.send("You are logged in.");
});

// Serve static files
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
