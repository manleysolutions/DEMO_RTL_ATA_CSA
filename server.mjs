import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Render provides PORT; locally fallback to 4000
const PORT = process.env.PORT || 4000;

// ====== ENV VARS ======
const TELNYX_API_KEY = process.env.TELNYX_API_KEY || "";
const INSEEGO_HOST   = process.env.INSEEGO_HOST   || "http://192.168.1.1";
const INSEEGO_USER   = process.env.INSEEGO_USER   || "admin";
const INSEEGO_PASS   = process.env.INSEEGO_PASS   || "";

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== ROOT HEALTH ======
app.get("/", (_req, res) => {
  res.status(200).send("✅ USPS Dashboard backend is running. Try /api/modem or /api/calls");
});

// ====== TELNYX CALLS ======
app.get("/api/calls", async (_req, res) => {
  if (!TELNYX_API_KEY) {
    return res.json({ data: [], warning: "TELNYX_API_KEY missing" });
  }
  try {
    const r = await fetch("https://api.telnyx.com/v2/calls", {
      headers: { Authorization: `Bearer ${TELNYX_API_KEY}` }
    });
    const json = await r.json();
    const rows = (json.data || []).map(c => ({
      id: c.id || "",
      from: c.from || c.from_number || c?.to?.phone_number || "unknown",
      to: c.to || c.to_number || c?.from?.phone_number || "unknown",
      status: c.status || c.state || "unknown",
      duration_seconds: c.duration_seconds ?? c.duration ?? null,
      direction: c.direction || "unknown",
      started_at: c.start_time || c.started_at || null
    }));
    res.json({ data: rows });
  } catch (e) {
    console.error("[/api/calls] error:", e);
    res.json({
      data: [
        { id: "demo1", from: "+19045551234", to: "+19047770000", status: "completed", duration_seconds: 42, direction: "outbound", started_at: new Date().toISOString() }
      ],
      warning: "Telnyx fetch failed; serving demo data"
    });
  }
});

// ====== INSEEGO MODEM ======
const MODEM_PATHS = [
  "/api/monitoring/status",
  "/api/device/status",
  "/api/network/status",
  "/api/wwan/status",
];

async function tryFetchModemJSON(url, basicAuthHeader) {
  const r = await fetch(url, {
    headers: {
      "Authorization": basicAuthHeader,
      "Accept": "application/json"
    }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}

function normalizeModem(json) {
  const first = (k) => json?.[k] ?? json?.status?.[k] ?? json?.wwan?.[k] ?? null;
  return {
    carrier:      first("carrier")      || first("networkProvider") || "unknown",
    ipAddress:    first("ipAddress")    || first("wanIp")           || null,
    signalDbm:    first("signalStrength") ?? first("rssi") ?? null,
    rsrp:         first("rsrp") ?? null,
    sinr:         first("sinr") ?? null,
    imei:         first("imei") ?? null,
    iccid:        first("iccid") ?? null,
    uptime:       first("uptime") ?? first("connectionUptime") ?? null
  };
}

app.get("/api/modem", async (_req, res) => {
  try {
    const basic = "Basic " + Buffer.from(`${INSEEGO_USER}:${INSEEGO_PASS}`).toString("base64");
    let json = null;
    for (const path of MODEM_PATHS) {
      try {
        json = await tryFetchModemJSON(`${INSEEGO_HOST}${path}`, basic);
        break;
      } catch { /* try next */ }
    }
    if (!json) throw new Error("No modem endpoint responded with JSON");
    return res.json({ ok: true, data: normalizeModem(json) });
  } catch (e) {
    console.error("[/api/modem] error:", e.message);
    return res.json({
      ok: false,
      data: {
        carrier: "T-Mobile",
        ipAddress: "162.190.64.73",
        signalDbm: -65,
        rsrp: -92,
        sinr: 20,
        imei: "990018030038545",
        iccid: "8901240xxxxxxxxxxx",
        uptime: "3h22m"
      },
      warning: "Modem fetch failed; serving demo data"
    });
  }
});

// ====== START ======
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
