#!/usr/bin/env python3
import os, time, socket, requests, json, subprocess
from dotenv import load_dotenv

load_dotenv()

# ===== ENV VARS =====
DEVICE_ID = os.getenv("DEVICE_ID", "CSA-USPS-DEMO-1")
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "https://your-backend.example.com/api/heartbeat")

ATA_IP = os.getenv("ATA_IP", "192.168.2.50")
TELNYX_API_KEY = os.getenv("TELNYX_API_KEY", "")
TELNYX_NUMBERS = [
    os.getenv("TELNYX_PHONE_NUMBER1", "+12059641709"),
    os.getenv("TELNYX_PHONE_NUMBER2", "+12058809388"),
]

# ===== HELPERS =====
def get_ip():
    """Return outbound IPv4 of CSA (via eth0 if available)."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "unknown"

def ping_host(host):
    """Return True if host responds to 1 ping."""
    try:
        subprocess.check_output(["ping", "-c", "1", "-W", "1", host], stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        return False

def check_telnyx_numbers():
    """Check numbers via Telnyx API if key present."""
    results = []
    if not TELNYX_API_KEY:
        return [{"number": n, "status": "unknown (no API key)"} for n in TELNYX_NUMBERS]

    try:
        r = requests.get("https://api.telnyx.com/v2/phone_numbers", headers={
            "Authorization": f"Bearer {TELNYX_API_KEY}"
        }, timeout=10)
        data = r.json().get("data", [])
        for num in TELNYX_NUMBERS:
            found = next((d for d in data if d.get("phone_number") == num), None)
            results.append({
                "number": num,
                "status": "active" if found else "not_found"
            })
    except Exception as e:
        results = [{"number": n, "status": f"error: {e}"} for n in TELNYX_NUMBERS]
    return results

def send_heartbeat():
    payload = {
        "device_id": DEVICE_ID,
        "ip": get_ip(),
        "ata_reachable": ping_host(ATA_IP),
        "telnyx_lines": check_telnyx_numbers(),
        "status": "online"
    }
    try:
        r = requests.post(DASHBOARD_URL, json=payload, timeout=8)
        print(f"✅ Heartbeat sent ({r.status_code}):", json.dumps(payload))
    except Exception as e:
        print(f"❌ Failed to send heartbeat: {e}")

# ===== LOOP =====
if __name__ == "__main__":
    while True:
        send_heartbeat()
        time.sleep(60)
