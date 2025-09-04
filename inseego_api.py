#!/usr/bin/env python3
"""
Inseego Connect API client (device list)
- Works with /inseego-connect-api/v1/devicelist
- Supports subscription-Key, x-application-name, x-tenant-name, and optional Authorization
- Supports GET (query params) or POST (search body) via env flags
"""

import os
import json
import sys
import requests

# ====== Config via ENV (fill from Herb's email) ======
BASE_URL = os.getenv("INSEEGO_BASE_URL", "https://device.pegasus.inseego.com/inseego-connect-api/v1/devicelist")

SUBSCRIPTION_KEY = os.getenv("INSEEGO_SUBSCRIPTION_KEY", "")     # REQUIRED
TENANT_NAME      = os.getenv("INSEEGO_TENANT", "")               # REQUIRED
APP_NAME         = os.getenv("INSEEGO_APP_NAME", "Inseego Connect")

# Optional: if Herb said you also need a bearer token
AUTH_TOKEN       = os.getenv("INSEEGO_AUTH_TOKEN", "")           # Optional

# Call shape
HTTP_METHOD      = os.getenv("INSEEGO_METHOD", "GET").upper()    # "GET" or "POST"
PAGE_NO          = os.getenv("INSEEGO_PAGE_NO", "1")
PAGE_SIZE        = os.getenv("INSEEGO_PAGE_SIZE", "25")

# Optional POST body (JSON string) if using POST search/sort
SEARCH_BODY_JSON = os.getenv("INSEEGO_SEARCH_BODY", "")          # JSON string per docs; leave empty for none

TIMEOUT_SECS     = int(os.getenv("INSEEGO_TIMEOUT", "15"))
VERIFY_TLS       = os.getenv("INSEEGO_VERIFY_TLS", "1") == "1"

def build_headers():
    headers = {
        "subscription-Key": SUBSCRIPTION_KEY,
        "x-application-name": APP_NAME,
        "x-tenant-name": TENANT_NAME,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if AUTH_TOKEN.strip():
        headers["Authorization"] = f"Bearer {AUTH_TOKEN.strip()}"
    return headers

def call_devicelist():
    headers = build_headers()

    # Build request based on method
    if HTTP_METHOD == "GET":
        params = {"pageNo": PAGE_NO, "pageSize": PAGE_SIZE}
        resp = requests.get(BASE_URL, headers=headers, params=params, timeout=TIMEOUT_SECS, verify=VERIFY_TLS)
    elif HTTP_METHOD == "POST":
        # POST body per docs: { "search": [...], "sort": [...] }
        if SEARCH_BODY_JSON.strip():
            try:
                body = json.loads(SEARCH_BODY_JSON)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in INSEEGO_SEARCH_BODY: {e}")
                sys.exit(2)
        else:
            body = {"search": [], "sort": []}

        params = {"pageNo": PAGE_NO, "pageSize": PAGE_SIZE}
        resp = requests.post(BASE_URL, headers=headers, params=params, json=body, timeout=TIMEOUT_SECS, verify=VERIFY_TLS)
    else:
        print(f"❌ Unsupported INSEEGO_METHOD: {HTTP_METHOD} (use GET or POST)")
        sys.exit(2)

    # Print detailed results for debugging
    print(f"➡️  {HTTP_METHOD} {resp.url}")
    print(f"🧾 Status: {resp.status_code}")
    # Show minimal headers (avoid dumping secrets)
    print("↩️  Response headers:", {k: v for k, v in resp.headers.items() if k.lower() in ("content-type","date","server")})

    try:
        data = resp.json()
        print("📦 JSON:")
        print(json.dumps(data, indent=2))
    except Exception:
        print("📦 Text:")
        print(resp.text)

    # Quick hinting
    if resp.status_code == 200:
        total = None
        try:
            total = data.get("data", {}).get("total")
        except Exception:
            pass
        print(f"✅ OK — total devices: {total if total is not None else 'unknown'}")
        return 0

    if resp.status_code in (401, 403):
        print("❌ Auth issue. Check subscription-Key validity and Authorization token (if required).")
    elif resp.status_code == 404:
        print("❌ 404 Not Found. Common causes:")
        print("   • Wrong BASE_URL path or region")
        print("   • Incorrect x-tenant-name (ask Herb for exact tenant ID)")
        print("   • Method mismatch vs. API spec")
    else:
        print("⚠️ Unexpected status. Re-check headers and endpoint with Herb.")

    return 1

def validate_env():
    missing = []
    if not SUBSCRIPTION_KEY:
        missing.append("INSEEGO_SUBSCRIPTION_KEY")
    if not TENANT_NAME:
        missing.append("INSEEGO_TENANT")

    if missing:
        print("❌ Missing required environment variables:", ", ".join(missing))
        print("   Set them via `export VAR=value` and re-run.")
        sys.exit(2)

if __name__ == "__main__":
    validate_env()
    sys.exit(call_devicelist())
