import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;

// ---------- Savings Calculation ----------
function calcSavings(lines = []) {
  const monthlyIncumbent = 130;
  const rtlLifeSafety = 40;
  const rtlNonLife = 30;

  let totalIncumbent = 0;
  let totalRTL = 0;

  lines.forEach(l => {
    totalIncumbent += monthlyIncumbent;
    if (l.type === "life") totalRTL += rtlLifeSafety;
    else totalRTL += rtlNonLife;
  });

  return {
    lines: lines.length,
    incumbentMonthly: totalIncumbent,
    rtlMonthly: totalRTL,
    savings: totalIncumbent - totalRTL,
    annualSavings: (totalIncumbent - totalRTL) * 12
  };
}

// ---------- API: savings ----------
app.get("/api/savings/demo", (req, res) => {
  const demoLines = [
    { number: "202-555-1001", type: "life" }, // Elevator
    { number: "202-555-1002", type: "life" }, // Fire Alarm
    { number: "202-555-1003", type: "nonlife" }, // Fax
  ];
  res.json(calcSavings(demoLines));
});

// ---------- API: alarms (Contact ID decode demo) ----------
const CONTACT_ID_MAP = {
  "110": "Fire Alarm",
  "111": "Smoke",
  "112": "Combustion",
  "113": "Pull Station",
  "114": "Duct Detector",
  "130": "Low Battery",
  "305": "AC Loss",
  "351": "System Reset",
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

app.get("/api/alarms/:lineId/events", async (req, res) => {
  const demo = [
    "18Q110 001 001", // Fire Alarm
    "18Q305 001 001", // AC Loss
  ].map(parseContactId);
  res.json(demo);
});

// ---------- Telnyx integration ----------
async function telnyxFetch(endpoint) {
  if (!TELNYX_API_KEY) throw new Error("No TELNYX_API_KEY set");
  const res = await fetch(`https://api.telnyx.com/v2/${endpoint}`, {
    headers: { Authorization: `Bearer ${TELNYX_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Telnyx API error: ${res.status}`);
  return res.json();
}

app.get("/api/telnyx/numbers", async (req, res) => {
  try {
    const data = await telnyxFetch("phone_numbers");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/telnyx/calls", async (req, res) => {
  try {
    const data = await telnyxFetch("calls");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/telnyx/messages", async (req, res) => {
  try {
    const data = await telnyxFetch("messages");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Static frontend ----------
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---------- Start ----------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Red Tag Lines backend running on http://0.0.0.0:${PORT}`);
});
