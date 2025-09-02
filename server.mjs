import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Auth vars
const USER = process.env.DASHBOARD_USER || "admin";
const PASS = process.env.DASHBOARD_PASS || "admin123";

// JSON body parser
app.use(express.json());

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

// Middleware to require auth
function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.status(401).send("Unauthorized");
}

// Protect all API routes under /api
app.use("/api", requireAuth, (req, res) => {
  res.json({ status: "ok", message: "You are authenticated" });
});

// Serve frontend (after build)
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
