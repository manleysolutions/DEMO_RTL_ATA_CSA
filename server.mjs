import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- middleware ----------
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8h
  })
);

// ---------- simple auth ----------
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ error: "unauthorized" });
}

app.post("/api/login", async (req, res) => {
  const { user, pass } = req.body || {};
  const AU = process.env.ADMIN_USER || "admin";
  const AP = process.env.ADMIN_PASS || "admin123";
  if (user === AU && pass === AP) {
    req.session.user = { user, tenant: process.env.TENANT_NAME || "USPS" };
    return res.json({ ok: true, user: req.session.user });
  }
  return res.status(401).json({ ok: false, error: "bad_credentials" });
});

app.get("/api/me", (req, res) => {
  if (!req.session?.user) return res.json(null);
  res.json(req.session.user);
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// ---------- data helpers ----------
const dataDir = path.join(__dirname, "data");

async function readJson(relPath, fallback = null) {
  try {
    const full = path.join(dataDir, relPath);
    const buf = await fs.readFile(full, "utf-8");
    return JSON.parse(buf);
  } catch {
    return fallback;
  }
}

function computeSavings(lines = []) {
  // Old $130 per line, new: $40 (life safety), $30 (non-life safety)
  let ls = 0;
  let nls = 0;
  lines.forEach((l) => {
    if (l.lifeSafety) ls += 1;
    else nls += 1;
  });
  const old = (ls + nls) * 130;
  const neu = ls * 40 + nls * 30;
  const monthly = old - neu;
  const annual = monthly * 12;
  return {
    monthlySavings: monthly,
    annualSavings: annual,
    breakdown: { lifeSafety: ls, nonLifeSafety: nls, old, new: neu },
  };
}

// ---------- Telnyx / Inseego placeholders ----------
async function fetchTelnyxLineStatus(did) {
  // TODO: real API; for demo return random-ish
  return {
    did,
    registered: Math.random() > 0.15,
    recordingEnabled: /elevator|emergency/i.test(did || "") ? true : false,
  };
}

async function fetchInseegoStatus(kitId) {
  // TODO: real API call; for demo show healthy
  return { kitId, cell: "T-Mobile", signalRssi: -67, online: true, wanIp: "162.190.64.11" };
}

// ---------- API: sites and lines ----------
app.get("/api/sites", requireAuth, async (req, res) => {
  const tenant = (req.query.tenant || process.env.TENANT_NAME || "USPS").toUpperCase();
  const sites = (await readJson("sites.json", [])).filter((s) => s.tenant === tenant);

  // enrich with savings
  const enriched = [];
  for (const s of sites) {
    const lines = await readJson(`lines/${s.id}.json`, []);
    const savings = computeSavings(lines);
    enriched.push({ ...s, savings });
  }
  res.json(enriched);
});

app.get("/api/site/:id", requireAuth, async (req, res) => {
  const site = (await readJson("sites.json", [])).find((s) => s.id === req.params.id);
  if (!site) return res.status(404).json({ error: "not_found" });

  const lines = await readJson(`lines/${site.id}.json`, []);
  const savings = computeSavings(lines);

  // device “kit” health
  const kit = await fetchInseegoStatus(site.kitId);

  res.json({ ...site, lines, savings, kit });
});

app.get("/api/lines/:siteId", requireAuth, async (req, res) => {
  const lines = await readJson(`lines/${req.params.siteId}.json`, []);
  // pretend to hydrate status/recording from Telnyx
  const hydrated = await Promise.all(
    lines.map(async (l) => {
      const tel = await fetchTelnyxLineStatus(l.did || l.msisdn || "");
      return { ...l, registered: tel.registered, recordingEnabled: tel.recordingEnabled };
    })
  );
  res.json(hydrated);
});

// ---------- API: map mini feed ----------
app.get("/api/map/sites", requireAuth, async (req, res) => {
  const tenant = (req.query.tenant || process.env.TENANT_NAME || "USPS").toUpperCase();
  const sites = (await readJson("sites.json", [])).filter((s) => s.tenant === tenant);
  res.json(
    sites.map((s) => ({
      id: s.id,
      name: s.facilityName,
      lat: s.lat,
      lng: s.lng,
      status: s.status, // online/offline/pending
    }))
  );
});

// ---------- API: logs (24h) & reports (30d) ----------
app.get("/api/logs/:siteId", requireAuth, async (req, res) => {
  // stub: last 24h simple entries
  const now = Date.now();
  const logs = Array.from({ length: 12 }).map((_, i) => ({
    ts: new Date(now - i * 2 * 60 * 60 * 1000).toISOString(),
    level: i % 3 === 0 ? "warn" : "info",
    msg: i % 3 === 0 ? "SIP registration flap recovered" : "Heartbeat OK",
  }));
  res.json(logs);
});

app.get("/api/report/:siteId", requireAuth, async (req, res) => {
  // stub: 30-day summary
  const siteId = req.params.siteId;
  const lines = await readJson(`lines/${siteId}.json`, []);
  const savings = computeSavings(lines);
  res.json({
    siteId,
    windowDays: 30,
    availabilityPct: 99.2,
    incidents: 1,
    monthlySavings: savings.monthlySavings,
    annualSavings: savings.annualSavings,
  });
});

// ---------- API: alarms (Contact ID decode demo) ----------
const CONTACT_ID_MAP = {
  "110": "Fire Alarm",
  "111": "Smoke",
  "112": "Combustion",
  "113": "Pull Station",
  "114": "Duct Detector",
  "301": "Low Battery",
  "302": "AC Loss",
  "305": "System Reset",
  "401": "Burglar Alarm",
};

function parseContactId(payload = "") {
  // very simplified: CID usually like "18Q110 001 001"
  const code = (payload.match(/\b(\d{3})\b/) || [])[1];
  return {
    code,
    description: (code && CONTACT_ID_MAP[code]) || "Unknown event",
    raw: payload,
  };
}

app.get("/api/alarms/:lineId/events", requireAuth, async (req, res) => {
  // demo set
  const demo = [
    "18Q110 001 001", // Fire Alarm
    "18Q302 001 001", // AC Loss
    "18Q305 001 001", // Reset
  ].map(parseContactId);
  res.json(demo);
});

// ---------- static frontend ----------
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (req, res) => res.sendFile(path.join(publicDir, "index.html")));

// ---------- start ----------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Red Tag Lines backend on http://0.0.0.0:${PORT}`);
});
